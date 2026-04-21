<?php

namespace App\Services;

class InvoiceGeneratorService
{
    public static function buildInvoiceData(array $order): array
    {
        return [
            'invoice_number' => 'INV-' . strtoupper(substr(md5($order['id'] ?? uniqid()), 0, 8)),
            'order_date' => now()->format('d M, Y'),
            'customer_name' => $order['customer_name'] ?? 'Plant Parent',
            'total' => $order['total_amount'] ?? 0.0,
            'payment_status' => 'Paid via SSLCommerz',
        ];
    }
}
