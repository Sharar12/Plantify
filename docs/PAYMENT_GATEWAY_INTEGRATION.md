# SSLCommerz Payment Gateway Integration (Plantify)

Plantify utilizes SSLCommerz for local currency (BDT) checkouts across cards, mobile wallets (bKash, Nagad, Rocket), and internet banking.

## 🔄 Transaction Lifecycle
1. **Initiation**: Customer submits order payload to `POST /api/orders/checkout`.
2. **Session Creation**: Backend invokes SSLCommerz Session API (`/gwprocess/v4/api.php`) with:
   - `total_amount`, `currency=BDT`, `tran_id`
   - `success_url`, `fail_url`, `cancel_url`, `ipn_url`
3. **Redirection**: Client redirects to returned `GatewayPageURL`.
4. **Instant Payment Notification (IPN)**:
   - SSLCommerz dispatches background HTTP POST to IPN endpoint.
   - Backend validates `val_id` with SSLCommerz Order Validation API.
   - Marks order `payment_status = 'paid'`, triggers invoice generation.
