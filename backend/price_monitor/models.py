from decimal import Decimal
from django.db import models


class Product(models.Model):
    name = models.CharField(max_length=255)
    url = models.URLField(unique=True, max_length=1000)
    store = models.CharField(max_length=100, default="Apple")
    description = models.TextField(blank=True)
    
    current_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True
    )
    
    previous_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True
    )
    
    lowest_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True
    )
    
    highest_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True
    )
    
    currency = models.CharField(max_length=10, default="INR")
    
    threshold_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True
    )
    
    image_url = models.URLField(
        max_length=1000,
        blank=True,
        null=True
    )
    
    active = models.BooleanField(default=True)
    threshold_triggered = models.BooleanField(default=False)
    
    last_checked_at = models.DateTimeField(
        null=True,
        blank=True
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Monitored Product'
        verbose_name_plural = 'Monitored Products'

    def __str__(self):
        return f"{self.name} ({self.store})"

    @property
    def price_difference(self) -> Decimal | None:
        """Calculate absolute difference between current and previous price."""
        if self.current_price is not None and self.previous_price is not None:
            return self.current_price - self.previous_price
        return Decimal('0.00') if self.current_price is not None else None

    @property
    def price_change_percent(self) -> float | None:
        """Calculate percentage difference between current and previous price."""
        if (
            self.current_price is not None
            and self.previous_price is not None
            and self.previous_price > 0
        ):
            diff = self.current_price - self.previous_price
            return round(float((diff / self.previous_price) * 100), 2)
        return 0.0 if self.current_price is not None else None

    @property
    def threshold_reached(self) -> bool:
        """Return True if current price is at or below configured threshold."""
        if self.current_price is not None and self.threshold_price is not None:
            return self.current_price <= self.threshold_price
        return False


class PriceHistory(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="price_history"
    )
    
    price = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )
    
    recorded_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        ordering = ['-recorded_at']
        verbose_name = 'Price History Point'
        verbose_name_plural = 'Price History Points'

    def __str__(self):
        return f"{self.product.name}: {self.price} at {self.recorded_at.strftime('%Y-%m-%d %H:%M')}"


class AlertHistory(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="alerts"
    )
    
    price = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )
    
    threshold_price = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )
    
    alert_type = models.CharField(
        max_length=50,
        default="THRESHOLD"
    )
    
    sent_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        ordering = ['-sent_at']
        verbose_name = 'Alert History'
        verbose_name_plural = 'Alert Histories'

    def __str__(self):
        return f"Alert for {self.product.name} at {self.price} (Target: {self.threshold_price})"
