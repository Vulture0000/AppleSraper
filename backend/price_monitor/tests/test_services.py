from decimal import Decimal
from unittest.mock import patch
from django.test import TestCase
from price_monitor.models import Product, PriceHistory, AlertHistory
from price_monitor.services.price_service import parse_price, update_product_price
from price_monitor.services.alert_service import check_and_process_threshold


class PriceParsingTestCase(TestCase):
    def test_parse_price_formats(self):
        """Test varied currency formats convert to exact Decimals."""
        self.assertEqual(parse_price("₹99,900"), Decimal("99900.00"))
        self.assertEqual(parse_price("₹99,900.00"), Decimal("99900.00"))
        self.assertEqual(parse_price("99900"), Decimal("99900.00"))
        self.assertEqual(parse_price("99,900"), Decimal("99900.00"))
        self.assertEqual(parse_price("INR 99,900"), Decimal("99900.00"))
        self.assertEqual(parse_price("₹ 1,04,900"), Decimal("104900.00"))
        self.assertEqual(parse_price(Decimal("99900.00")), Decimal("99900.00"))
        self.assertEqual(parse_price(119900), Decimal("119900.00"))

    def test_parse_price_invalid_raises_error(self):
        """Test invalid prices raise ValueError gracefully."""
        with self.assertRaises(ValueError):
            parse_price("")
        with self.assertRaises(ValueError):
            parse_price(None)
        with self.assertRaises(ValueError):
            parse_price("Out of Stock")


class PriceServiceUpdateTestCase(TestCase):
    def setUp(self):
        self.product = Product.objects.create(
            name="MacBook Air M5",
            url="https://www.apple.com/in/shop/buy-mac/macbook-air/sample-m5",
            store="Apple",
            current_price=Decimal("100000.00"),
            lowest_price=Decimal("100000.00"),
            highest_price=Decimal("100000.00"),
            threshold_price=Decimal("95000.00"),
            active=True
        )

    def test_update_product_price_and_history(self):
        """Every successful price update creates a new PriceHistory record."""
        initial_history_count = PriceHistory.objects.filter(product=self.product).count()
        
        # First update: Price drops to 98000
        updated_prod, history = update_product_price(self.product, "₹98,000")
        
        self.assertEqual(updated_prod.current_price, Decimal("98000.00"))
        self.assertEqual(updated_prod.previous_price, Decimal("100000.00"))
        self.assertEqual(updated_prod.lowest_price, Decimal("98000.00"))
        self.assertEqual(updated_prod.highest_price, Decimal("100000.00"))
        self.assertIsNotNone(history)
        self.assertEqual(PriceHistory.objects.filter(product=self.product).count(), initial_history_count + 1)

        # Second update: Price rises to 105000
        updated_prod2, history2 = update_product_price(self.product, "105000")
        self.assertEqual(updated_prod2.current_price, Decimal("105000.00"))
        self.assertEqual(updated_prod2.previous_price, Decimal("98000.00"))
        self.assertEqual(updated_prod2.lowest_price, Decimal("98000.00"))
        self.assertEqual(updated_prod2.highest_price, Decimal("105000.00"))
        self.assertEqual(PriceHistory.objects.filter(product=self.product).count(), initial_history_count + 2)


class ThresholdAlertEngineTestCase(TestCase):
    def setUp(self):
        self.product = Product.objects.create(
            name="MacBook Air M5 Target Test",
            url="https://www.apple.com/in/shop/buy-mac/macbook-air/test-alert",
            store="Apple",
            current_price=Decimal("100000.00"),
            threshold_price=Decimal("95000.00"),
            threshold_triggered=False,
            active=True
        )

    @patch("price_monitor.services.email_service.EmailService.send_threshold_alert")
    def test_threshold_trigger_and_anti_duplicate_prevention(self, mock_email):
        mock_email.return_value = True

        # 1. Price is above threshold -> No alert
        check_and_process_threshold(self.product)
        self.assertFalse(self.product.threshold_triggered)
        self.assertEqual(AlertHistory.objects.count(), 0)
        mock_email.assert_not_called()

        # 2. Price drops to threshold (95000 <= 95000) -> Alert triggered
        self.product.current_price = Decimal("95000.00")
        self.product.save()
        triggered = check_and_process_threshold(self.product)
        
        self.assertTrue(triggered)
        self.product.refresh_from_db()
        self.assertTrue(self.product.threshold_triggered)
        self.assertEqual(AlertHistory.objects.count(), 1)
        mock_email.assert_called_once()

        # 3. Next hour: Price remains 95000 (below threshold) -> NO duplicate alert
        mock_email.reset_mock()
        triggered_again = check_and_process_threshold(self.product)
        self.assertFalse(triggered_again)
        self.assertEqual(AlertHistory.objects.count(), 1)
        mock_email.assert_not_called()

        # 4. Price rises back above threshold to 99000 -> Trigger flag resets
        self.product.current_price = Decimal("99000.00")
        self.product.save()
        check_and_process_threshold(self.product)
        self.product.refresh_from_db()
        self.assertFalse(self.product.threshold_triggered)

        # 5. Price drops again to 94000 -> New Alert triggers
        mock_email.reset_mock()
        self.product.current_price = Decimal("94000.00")
        self.product.save()
        triggered_second = check_and_process_threshold(self.product)
        
        self.assertTrue(triggered_second)
        self.product.refresh_from_db()
        self.assertTrue(self.product.threshold_triggered)
        self.assertEqual(AlertHistory.objects.count(), 2)
        mock_email.assert_called_once()
