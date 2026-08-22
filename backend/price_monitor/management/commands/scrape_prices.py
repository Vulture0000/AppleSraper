import logging
from django.core.management.base import BaseCommand
from price_monitor.models import Product
from price_monitor.services import BrightDataService, update_product_price

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Hourly scheduled price scraper: pulls latest prices from Bright Data, records history, and triggers threshold alerts."

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Starting hourly MacBook Air price scrape..."))

        active_products = list(Product.objects.filter(active=True))
        if not active_products:
            self.stdout.write(self.style.WARNING("No active monitored products found."))
            return

        self.stdout.write(f"Tracking {len(active_products)} active products...")

        urls = [p.url for p in active_products]
        url_to_product = {p.url: p for p in active_products}

        bright_data = BrightDataService()
        scraped_results = bright_data.scrape_urls(urls)

        updated_count = 0
        error_count = 0

        for result in scraped_results:
            target_url = result.get('url')
            product = url_to_product.get(target_url)

            if not product:
                continue

            raw_price = result.get('price')
            if raw_price:
                try:
                    product, history = update_product_price(
                        product=product,
                        new_price_input=raw_price,
                        title=result.get('title'),
                        description=result.get('description'),
                        image_url=result.get('image_url')
                    )
                    if history:
                        updated_count += 1
                        self.stdout.write(
                            self.style.SUCCESS(
                                f" [OK] [{product.store}] {product.name[:45]}... -> INR {product.current_price:,.2f}"
                            )
                        )
                except Exception as err:
                    error_count += 1
                    self.stdout.write(
                        self.style.ERROR(
                            f" [FAIL] Failed to update {product.name}: {err}"
                        )
                    )
            else:
                error_count += 1
                self.stdout.write(
                    self.style.WARNING(
                        f" [WARN] No valid price returned for {product.name} ({target_url})"
                    )
                )

        self.stdout.write(
            self.style.SUCCESS(
                f"\nPrice monitoring scrape completed: {updated_count} updated, {error_count} failed."
            )
        )
