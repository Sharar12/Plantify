<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Plant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    public function init(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'items' => 'required|array',
            'items.*.plant_id' => 'required|exists:plants,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
            'total_price' => 'required|numeric|min:0',
            'billing_address' => 'required|array',
            'billing_address.name' => 'required|string',
            'billing_address.email' => 'required|email',
            'billing_address.phone' => 'required|string',
            'billing_address.address' => 'required|string',
            'billing_address.city' => 'required|string',
            'billing_address.zip' => 'required|string',
        ]);

        foreach ($validated['items'] as $item) {
            $plant = Plant::find($item['plant_id']);
            if ($plant) {
                $currentStock = $plant->stock ?? 0;
                if ($currentStock < $item['quantity']) {
                    return response()->json([
                        'message' => 'Insufficient stock for plant: ' . $plant->name . '. Available: ' . $currentStock
                    ], 400);
                }
                $plant->stock = $currentStock - $item['quantity'];
                $plant->sold = ($plant->sold ?? 0) + $item['quantity'];
                $plant->save();
            }
        }

        $tranId = 'PLANTIFY_' . uniqid() . '_' . time();

        $order = Order::create([
            'user_id' => $validated['user_id'],
            'total_price' => $validated['total_price'],
            'plant_ids' => collect($validated['items'])->pluck('plant_id')->toJson(),
            'status' => 'pending',
            'payment_method' => 'sslcommerz',
            'billing_address' => json_encode($validated['billing_address']),
            'transaction_id' => $tranId,
        ]);

        foreach ($validated['items'] as $item) {
            OrderItem::create([
                'order_id' => $order->id,
                'plant_id' => $item['plant_id'],
                'quantity' => $item['quantity'],
                'price' => $item['price'],
            ]);
        }

        $postBody = [
            'store_id' => config('sslcommerz.store_id'),
            'store_passwd' => config('sslcommerz.store_password'),
            'total_amount' => $validated['total_price'],
            'currency' => 'BDT',
            'tran_id' => $tranId,
            'success_url' => config('sslcommerz.success_url') . '?order_id=' . $order->id . '&tran_id=' . $tranId,
            'fail_url' => config('sslcommerz.fail_url') . '?order_id=' . $order->id . '&tran_id=' . $tranId,
            'cancel_url' => config('sslcommerz.cancel_url') . '?order_id=' . $order->id . '&tran_id=' . $tranId,
            'ipn_url' => config('sslcommerz.webhook_url'),
            'cus_name' => $validated['billing_address']['name'],
            'cus_email' => $validated['billing_address']['email'],
            'cus_add1' => $validated['billing_address']['address'],
            'cus_city' => $validated['billing_address']['city'],
            'cus_country' => 'Bangladesh',
            'cus_phone' => $validated['billing_address']['phone'],
            'shipping_method' => 'NO',
            'product_name' => 'Plant Purchase',
            'product_category' => 'E-commerce',
            'product_profile' => 'general',
        ];

        try {
            $response = Http::asForm()->post(config('sslcommerz.gateway_url'), $postBody);
            $result = $response->json();

            if (isset($result['status']) && $result['status'] === 'SUCCESS') {
                return response()->json([
                    'message' => 'Payment initiated',
                    'order_id' => $order->id,
                    'gateway_url' => $result['GatewayPageURL'],
                ]);
            }

            return response()->json([
                'message' => 'Payment initiation failed',
                'error' => $result['failedreason'] ?? 'Unknown error'
            ], 400);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Payment service error: ' . $e->getMessage()
            ], 500);
        }
    }

    public function success(Request $request)
    {
        \Log::info('Payment success callback received', [
            'query' => $request->query(),
            'body' => $request->all(),
        ]);

        $orderId = $request->input('order_id') ?? $request->query('order_id');
        $tranId = $request->input('tran_id') ?? $request->query('tran_id');
        $valId = $request->input('val_id') ?? $request->query('val_id');
        $status = $request->input('status') ?? $request->query('status');

        if (!$orderId || !$tranId) {
            return response()->json(['message' => 'Invalid payment response', 'debug' => $request->all()], 400);
        }

        $order = Order::find($orderId);
        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        if (config('sslcommerz.mode') === 'sandbox') {
            if ($status === 'VALID' || $status === 'VALIDATED' || $status === 'SUCCESS') {
                $this->updateOrderAfterPayment($order);
                return response()->json([
                    'message' => 'Payment successful',
                    'order_id' => $order->id,
                    'status' => 'paid',
                ]);
            }

            if ($valId) {
                $postBody = [
                    'val_id' => $valId,
                    'store_id' => config('sslcommerz.store_id'),
                    'store_passwd' => config('sslcommerz.store_password'),
                ];

                try {
                    $response = Http::asForm()->timeout(10)->post(config('sslcommerz.validation_url'), $postBody);
                    $result = $response->json();

                    \Log::info('SSLCommerz validation response', ['result' => $result]);

                    if (isset($result['status']) && in_array(strtoupper($result['status']), ['VALID', 'VALIDATED', 'SUCCESS'])) {
                        $this->updateOrderAfterPayment($order);
                        return response()->json([
                            'message' => 'Payment successful',
                            'order_id' => $order->id,
                            'status' => 'paid',
                        ]);
                    }
                } catch (\Exception $e) {
                    \Log::error('SSLCommerz validation error', ['error' => $e->getMessage()]);
                }
            }

            if ($order->status === 'pending') {
                $this->updateOrderAfterPayment($order);
                return response()->json([
                    'message' => 'Payment successful (sandbox auto-verify)',
                    'order_id' => $order->id,
                    'status' => 'paid',
                ]);
            }

            return response()->json([
                'message' => 'Payment validation failed',
                'order_id' => $order->id,
                'debug' => compact('status', 'valId'),
            ], 400);
        }

        if (!$valId) {
            return response()->json(['message' => 'Missing val_id for validation'], 400);
        }

        $postBody = [
            'val_id' => $valId,
            'store_id' => config('sslcommerz.store_id'),
            'store_passwd' => config('sslcommerz.store_password'),
        ];

        try {
            $response = Http::asForm()->timeout(10)->post(config('sslcommerz.validation_url'), $postBody);
            $result = $response->json();

            if (isset($result['status']) && in_array(strtoupper($result['status']), ['VALID', 'VALIDATED', 'SUCCESS']) && $result['tran_id'] === $tranId) {
                $this->updateOrderAfterPayment($order);
                return response()->json([
                    'message' => 'Payment successful',
                    'order_id' => $order->id,
                    'status' => 'paid',
                ]);
            }

            $order->status = 'payment_failed';
            $order->save();

            return response()->json([
                'message' => 'Payment validation failed',
                'order_id' => $order->id,
            ], 400);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Payment verification error: ' . $e->getMessage()
            ], 500);
        }
    }

    public function ipn(Request $request)
    {
        $tranId = $request->input('tran_id');
        $valId = $request->input('val_id');
        $status = $request->input('status');

        $order = Order::where('transaction_id', $tranId)->first();
        if (!$order) {
            return response('Invalid', 400);
        }

        if ($status === 'VALID' || $status === 'VALIDATED') {
            $this->updateOrderAfterPayment($order);
            return response('Success', 200);
        }

        if ($status === 'CANCELLED') {
            $order->status = 'cancelled';
            $order->save();
            $this->restoreStock($order);
            return response('Cancelled', 200);
        }

        return response('Unknown', 200);
    }

    public function cancel(Request $request)
    {
        $orderId = $request->input('order_id');
        if (!$orderId) {
            return response()->json(['message' => 'Missing order_id'], 400);
        }

        $order = Order::find($orderId);
        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        if ($order->status === 'pending' && $order->payment_status !== 'paid') {
            $order->status = 'cancelled';
            $order->save();
            $this->restoreStock($order);
        }

        return response()->json(['message' => 'Order cancelled']);
    }

    private function updateOrderAfterPayment(Order $order)
    {
        $order->payment_status = 'paid';
        $order->save();
    }

    private function restoreStock(Order $order)
    {
        foreach ($order->items as $item) {
            $plant = Plant::find($item->plant_id);
            if ($plant) {
                $plant->stock = ($plant->stock ?? 0) + $item->quantity;
                $plant->sold = max(0, ($plant->sold ?? 0) - $item->quantity);
                $plant->save();
            }
        }
    }
}
