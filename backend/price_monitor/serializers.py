from rest_framework import serializers
from .models import Product, PriceHistory, AlertHistory


class PriceHistorySerializer(serializers.ModelSerializer):
    recordedAt = serializers.DateTimeField(source='recorded_at', read_only=True)
    price = serializers.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        model = PriceHistory
        fields = ['id', 'price', 'recordedAt']


class AlertHistorySerializer(serializers.ModelSerializer):
    productName = serializers.CharField(source='product.name', read_only=True)
    productId = serializers.IntegerField(source='product.id', read_only=True)
    sentAt = serializers.DateTimeField(source='sent_at', read_only=True)
    price = serializers.DecimalField(max_digits=12, decimal_places=2)
    thresholdPrice = serializers.DecimalField(source='threshold_price', max_digits=12, decimal_places=2)
    alertType = serializers.CharField(source='alert_type', read_only=True)

    class Meta:
        model = AlertHistory
        fields = ['id', 'productId', 'productName', 'price', 'thresholdPrice', 'alertType', 'sentAt']


class ProductSerializer(serializers.ModelSerializer):
    currentPrice = serializers.DecimalField(source='current_price', max_digits=12, decimal_places=2, allow_null=True)
    previousPrice = serializers.DecimalField(source='previous_price', max_digits=12, decimal_places=2, allow_null=True)
    lowestPrice = serializers.DecimalField(source='lowest_price', max_digits=12, decimal_places=2, allow_null=True)
    highestPrice = serializers.DecimalField(source='highest_price', max_digits=12, decimal_places=2, allow_null=True)
    thresholdPrice = serializers.DecimalField(source='threshold_price', max_digits=12, decimal_places=2, allow_null=True, required=False)
    imageUrl = serializers.URLField(source='image_url', allow_null=True, required=False)
    lastCheckedAt = serializers.DateTimeField(source='last_checked_at', allow_null=True, read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)

    # Computed Properties
    priceChange = serializers.SerializerMethodField()
    priceChangePercent = serializers.SerializerMethodField()
    thresholdReached = serializers.BooleanField(source='threshold_reached', read_only=True)
    sparkline = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'url',
            'store',
            'description',
            'currentPrice',
            'previousPrice',
            'lowestPrice',
            'highestPrice',
            'thresholdPrice',
            'currency',
            'priceChange',
            'priceChangePercent',
            'thresholdReached',
            'threshold_triggered',
            'imageUrl',
            'active',
            'lastCheckedAt',
            'createdAt',
            'updatedAt',
            'sparkline',
        ]
        read_only_fields = ['id', 'createdAt', 'updatedAt', 'lastCheckedAt', 'threshold_triggered']

    def get_priceChange(self, obj) -> float | None:
        diff = obj.price_difference
        return float(diff) if diff is not None else None

    def get_priceChangePercent(self, obj) -> float | None:
        return obj.price_change_percent

    def get_sparkline(self, obj) -> list[dict]:
        # Return recent price points for sparkline preview
        recent_history = obj.price_history.order_by('recorded_at')[:15]
        return [
            {
                "time": h.recorded_at.isoformat(),
                "price": float(h.price)
            }
            for h in recent_history
        ]


class ProductCreateSerializer(serializers.ModelSerializer):
    targetPrice = serializers.DecimalField(
        source='threshold_price',
        max_digits=12,
        decimal_places=2,
        required=False,
        allow_null=True
    )

    class Meta:
        model = Product
        fields = ['url', 'name', 'targetPrice']
        extra_kwargs = {
            'name': {'required': False, 'allow_blank': True},
            'url': {'required': True}
        }


class ThresholdUpdateSerializer(serializers.Serializer):
    thresholdPrice = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        required=True,
        allow_null=True
    )
