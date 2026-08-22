from django.contrib import admin
from .models import Product, PriceHistory, AlertHistory


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        'name',
        'store',
        'current_price',
        'previous_price',
        'threshold_price',
        'lowest_price',
        'highest_price',
        'threshold_triggered',
        'active',
        'last_checked_at',
    )
    list_filter = ('active', 'store', 'threshold_triggered', 'currency')
    search_fields = ('name', 'url', 'description')
    readonly_fields = ('created_at', 'updated_at', 'last_checked_at')
    ordering = ('-created_at',)


@admin.register(PriceHistory)
class PriceHistoryAdmin(admin.ModelAdmin):
    list_display = ('product', 'price', 'recorded_at')
    list_filter = ('product', 'recorded_at')
    search_fields = ('product__name', 'product__url')
    readonly_fields = ('recorded_at',)
    ordering = ('-recorded_at',)


@admin.register(AlertHistory)
class AlertHistoryAdmin(admin.ModelAdmin):
    list_display = ('product', 'price', 'threshold_price', 'alert_type', 'sent_at')
    list_filter = ('alert_type', 'sent_at')
    search_fields = ('product__name',)
    readonly_fields = ('sent_at',)
    ordering = ('-sent_at',)
