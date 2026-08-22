import logging
from datetime import timedelta
from decimal import Decimal
from django.utils import timezone
from django.db.models import Min, Max, Avg, Q
from django.conf import settings
from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Product, PriceHistory, AlertHistory
from .serializers import (
    ProductSerializer,
    ProductCreateSerializer,
    PriceHistorySerializer,
    AlertHistorySerializer,
    ThresholdUpdateSerializer,
)
from .services import (
    BrightDataService,
    update_product_price,
    check_and_process_threshold,
)

logger = logging.getLogger(__name__)


class ProductViewSet(viewsets.ModelViewSet):
    """
    CRUD ViewSet for Apple Products and sub-actions for history & thresholds.
    """
    queryset = Product.objects.all().order_by('-created_at')
    serializer_class = ProductSerializer

    def create(self, request, *args, **kwargs):
        """
        Create a new tracked product by URL.
        Performs an initial scrape via Bright Data service immediately.
        """
        create_serializer = ProductCreateSerializer(data=request.data)
        create_serializer.is_valid(raise_exception=True)

        url = create_serializer.validated_data['url'].strip()
        custom_name = create_serializer.validated_data.get('name', '').strip()
        threshold_price = create_serializer.validated_data.get('threshold_price')

        # Prevent duplicate URLs
        existing = Product.objects.filter(url=url).first()
        if existing:
            return Response(
                {
                    "error": "Product with this URL is already monitored.",
                    "product": ProductSerializer(existing).data
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        store = "Apple (Edu)" if "in-edu" in url or "edu" in url else "Apple"
        default_name = custom_name or ("Apple MacBook Air M5" if "m5" in url.lower() else "Apple MacBook Air")

        product = Product.objects.create(
            url=url,
            name=default_name,
            store=store,
            threshold_price=threshold_price,
            active=True
        )

        # Trigger immediate initial scrape
        bright_data = BrightDataService()
        scraped_items = bright_data.scrape_urls([url])

        if scraped_items and scraped_items[0].get('success'):
            item = scraped_items[0]
            if item.get('price'):
                update_product_price(
                    product=product,
                    new_price_input=item['price'],
                    title=custom_name or item.get('title'),
                    description=item.get('description'),
                    image_url=item.get('image_url')
                )
        else:
            logger.warning("Initial scrape for new product %s returned no instant price.", url)

        product.refresh_from_db()
        return Response(
            ProductSerializer(product).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['get'], url_path='history')
    def history(self, request, pk=None):
        """
        Retrieve price history for a specific product filtered by range:
        ?range=24h | 7d | 30d | all
        """
        product = self.get_object()
        range_param = request.query_params.get('range', 'all').lower()

        history_qs = product.price_history.all().order_by('recorded_at')

        now = timezone.now()
        if range_param == '24h':
            cutoff = now - timedelta(hours=24)
            history_qs = history_qs.filter(recorded_at__gte=cutoff)
        elif range_param == '7d':
            cutoff = now - timedelta(days=7)
            history_qs = history_qs.filter(recorded_at__gte=cutoff)
        elif range_param == '30d':
            cutoff = now - timedelta(days=30)
            history_qs = history_qs.filter(recorded_at__gte=cutoff)

        data = [
            {
                "id": h.id,
                "price": float(h.price),
                "recordedAt": h.recorded_at.isoformat(),
                "formattedPrice": f"₹{h.price:,.2f}"
            }
            for h in history_qs
        ]

        # Product summary stats
        avg_price = history_qs.aggregate(avg=Avg('price'))['avg']
        stats = {
            "currentPrice": float(product.current_price) if product.current_price else None,
            "lowestPrice": float(product.lowest_price) if product.lowest_price else None,
            "highestPrice": float(product.highest_price) if product.highest_price else None,
            "averagePrice": round(float(avg_price), 2) if avg_price else None,
            "totalPoints": history_qs.count(),
        }

        return Response({
            "product": ProductSerializer(product).data,
            "stats": stats,
            "history": data,
        })

    @action(detail=True, methods=['put', 'patch'], url_path='threshold')
    def update_threshold(self, request, pk=None):
        """
        Update the target threshold price for a product.
        """
        product = self.get_object()
        serializer = ThresholdUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        new_threshold = serializer.validated_data['thresholdPrice']
        product.threshold_price = new_threshold
        # If threshold changed, re-evaluate trigger status
        product.threshold_triggered = False
        product.save()

        # Check immediately if current price meets new threshold
        check_and_process_threshold(product)
        product.refresh_from_db()

        return Response(ProductSerializer(product).data)


class DashboardSummaryView(APIView):
    """
    Returns aggregated metrics for the top dashboard statistics cards.
    """
    def get(self, request):
        products = Product.objects.filter(active=True)
        total_tracked = products.count()

        # Price drops: current_price < previous_price
        price_drops = [p for p in products if p.current_price is not None and p.previous_price is not None and p.current_price < p.previous_price]
        price_drops_count = len(price_drops)

        # Below target: current_price <= threshold_price
        below_target = [p for p in products if p.threshold_reached]
        below_target_count = len(below_target)

        # Lowest price product
        lowest_product = products.exclude(current_price__isnull=True).order_by('current_price').first()
        lowest_price = float(lowest_product.current_price) if lowest_product and lowest_product.current_price else None

        # Highest price product
        highest_product = products.exclude(current_price__isnull=True).order_by('-current_price').first()

        # Last checked timestamp
        latest_checked = products.exclude(last_checked_at__isnull=True).order_by('-last_checked_at').first()
        last_sync = latest_checked.last_checked_at.isoformat() if latest_checked and latest_checked.last_checked_at else None

        # Recent alerts count in the last 24 hours
        recent_alerts_count = AlertHistory.objects.filter(
            sent_at__gte=timezone.now() - timedelta(hours=24)
        ).count()

        return Response({
            "trackedProducts": total_tracked,
            "priceDrops": price_drops_count,
            "belowTarget": below_target_count,
            "lowestPrice": lowest_price,
            "lowestProduct": ProductSerializer(lowest_product).data if lowest_product else None,
            "highestProduct": ProductSerializer(highest_product).data if highest_product else None,
            "recentAlertsCount": recent_alerts_count,
            "lastSync": last_sync,
            "brightDataConfigured": BrightDataService().is_configured(),
            "smtpConfigured": bool(getattr(settings, "EMAIL_HOST_USER", "")),
        })


class MonitoringStatusView(APIView):
    """
    Returns system status, active scraping schedule status, and API health.
    """
    def get(self, request):
        active_count = Product.objects.filter(active=True).count()
        total_count = Product.objects.count()
        latest_history = PriceHistory.objects.order_by('-recorded_at').first()
        latest_scrape = latest_history.recorded_at.isoformat() if latest_history else None

        bright_data_configured = BrightDataService().is_configured()
        smtp_configured = bool(getattr(settings, "EMAIL_HOST_USER", ""))

        return Response({
            "status": "online",
            "activeMonitors": active_count,
            "totalProducts": total_count,
            "lastScrapeAt": latest_scrape,
            "brightData": {
                "configured": bright_data_configured,
                "datasetId": getattr(settings, "BRIGHT_DATA_DATASET_ID", "gd_ml87ng90wjb9sc1bi")
            },
            "emailAlerts": {
                "configured": smtp_configured,
                "alertEmail": getattr(settings, "ALERT_EMAIL", "")
            }
        })


class MonitoringRunNowView(APIView):
    """
    Trigger an on-demand batch scrape for all active products.
    Returns:
    {
      "success": true,
      "updated": 6,
      "failed": 0,
      "message": "Prices updated successfully"
    }
    """
    def post(self, request):
        active_products = list(Product.objects.filter(active=True))
        if not active_products:
            return Response({
                "success": True,
                "updated": 0,
                "failed": 0,
                "message": "No active products to scrape"
            })

        urls = [p.url for p in active_products]
        url_to_product = {p.url: p for p in active_products}

        bright_data = BrightDataService()
        scraped_results = bright_data.scrape_urls(urls)

        updated_count = 0
        failed_count = 0

        for result in scraped_results:
            target_url = result.get('url')
            product = url_to_product.get(target_url)
            if not product:
                continue

            raw_price = result.get('price')
            if raw_price:
                try:
                    update_product_price(
                        product=product,
                        new_price_input=raw_price,
                        title=result.get('title'),
                        description=result.get('description'),
                        image_url=result.get('image_url')
                    )
                    updated_count += 1
                except Exception as err:
                    logger.error("Error updating price for %s: %s", product.name, err)
                    failed_count += 1
            else:
                failed_count += 1

        return Response({
            "success": True,
            "updated": updated_count,
            "failed": failed_count,
            "message": f"Scrape complete: {updated_count} updated, {failed_count} failed"
        })


class AlertListView(APIView):
    """
    List chronological alert history items.
    """
    def get(self, request):
        alerts = AlertHistory.objects.select_related('product').order_by('-sent_at')[:50]
        return Response(AlertHistorySerializer(alerts, many=True).data)
