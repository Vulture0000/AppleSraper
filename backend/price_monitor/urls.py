from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    ProductViewSet,
    DashboardSummaryView,
    MonitoringStatusView,
    MonitoringRunNowView,
    AlertListView,
)

router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')

urlpatterns = [
    # Dashboard summary
    path('dashboard/summary/', DashboardSummaryView.as_view(), name='dashboard-summary'),
    
    # Monitoring endpoints
    path('monitoring/status/', MonitoringStatusView.as_view(), name='monitoring-status'),
    path('monitoring/run-now/', MonitoringRunNowView.as_view(), name='monitoring-run-now'),
    
    # Alerts
    path('alerts/', AlertListView.as_view(), name='alerts-list'),
    
    # Product CRUD and nested actions (history, threshold)
    path('', include(router.urls)),
]
