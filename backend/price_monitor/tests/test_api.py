from decimal import Decimal
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from price_monitor.models import Product, PriceHistory, AlertHistory


class ProductAPITestCase(APITestCase):
    def setUp(self):
        self.product = Product.objects.create(
            name="MacBook Air M5 API Test",
            url="https://www.apple.com/in/shop/buy-mac/macbook-air/test-product",
            store="Apple",
            current_price=Decimal("99900.00"),
            previous_price=Decimal("104900.00"),
            lowest_price=Decimal("94900.00"),
            highest_price=Decimal("104900.00"),
            threshold_price=Decimal("95000.00"),
            active=True
        )
        PriceHistory.objects.create(product=self.product, price=Decimal("104900.00"))
        PriceHistory.objects.create(product=self.product, price=Decimal("99900.00"))

    def test_list_products(self):
        """Test GET /api/products/"""
        url = reverse('product-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], "MacBook Air M5 API Test")
        self.assertEqual(response.data[0]['priceChange'], -5000.0)

    def test_create_product(self):
        """Test POST /api/products/"""
        url = reverse('product-list')
        data = {
            "url": "https://www.apple.com/in/shop/buy-mac/macbook-air/new-added-m5",
            "name": "Custom MacBook Air",
            "targetPrice": "92000.00"
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Product.objects.count(), 2)
        new_prod = Product.objects.get(url="https://www.apple.com/in/shop/buy-mac/macbook-air/new-added-m5")
        self.assertEqual(new_prod.threshold_price, Decimal("92000.00"))

    def test_update_threshold_endpoint(self):
        """Test PUT /api/products/{id}/threshold/"""
        url = reverse('product-update-threshold', kwargs={'pk': self.product.id})
        response = self.client.put(url, {"thresholdPrice": "89000.00"}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.product.refresh_from_db()
        self.assertEqual(self.product.threshold_price, Decimal("89000.00"))

    def test_product_history_endpoint(self):
        """Test GET /api/products/{id}/history/"""
        url = reverse('product-history', kwargs={'pk': self.product.id})
        response = self.client.get(url, {'range': '24h'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("history", response.data)
        self.assertIn("stats", response.data)
        self.assertEqual(len(response.data['history']), 2)

    def test_dashboard_summary_endpoint(self):
        """Test GET /api/dashboard/summary/"""
        url = reverse('dashboard-summary')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['trackedProducts'], 1)
        self.assertEqual(response.data['priceDrops'], 1)

    def test_monitoring_status_and_run_now(self):
        """Test GET /api/monitoring/status/ and POST /api/monitoring/run-now/"""
        status_url = reverse('monitoring-status')
        res_status = self.client.get(status_url)
        self.assertEqual(res_status.status_code, status.HTTP_200_OK)
        self.assertEqual(res_status.data['status'], "online")

        run_url = reverse('monitoring-run-now')
        res_run = self.client.post(run_url)
        self.assertEqual(res_run.status_code, status.HTTP_200_OK)
        self.assertTrue(res_run.data['success'])
