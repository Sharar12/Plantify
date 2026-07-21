<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Plant;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'user_id' => 'required|exists:users,id',
                'items' => 'required|array',
                'items.*.plant_id' => 'required|exists:plants,id',
                'items.*.quantity' => 'required|integer|min:1',
                'items.*.price' => 'required|numeric|min:0',
                'total_price' => 'required|numeric|min:0',
                'payment_method' => 'required|in:card,paypal,bank,bkash',
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

            $order = Order::create([
                'user_id' => $validated['user_id'],
                'total_price' => $validated['total_price'],
                'plant_ids' => collect($validated['items'])->pluck('plant_id')->toJson(),
                'status' => 'pending',
                'payment_method' => $validated['payment_method'],
                'billing_address' => json_encode($validated['billing_address']),
            ]);

            foreach ($validated['items'] as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'plant_id' => $item['plant_id'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                ]);
            }

            return response()->json([
                'message' => 'Order placed successfully',
                'id' => $order->id,
                'order' => $order->load('items'),
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to place order: ' . $e->getMessage()
            ], 400);
        }
    }

    public function index()
    {
        return response()->json(
            Order::with(['user', 'items.plant'])->orderBy('created_at', 'desc')->get()
        );
    }

     public function updateStatus(Request $request, $id)
     {
         $validated = $request->validate([
             'status' => 'required|in:pending,processing,shipped,delivered,cancelled',
         ]);

         $order = Order::findOrFail($id);
         
         // Prevent status change if order is already delivered or cancelled
         if (in_array($order->status, ['delivered', 'cancelled'])) {
             return response()->json([
                 'message' => 'Cannot update order status after ' . $order->status
             ], 400);
         }
         
         $order->status = $validated['status'];
         $order->save();

          return response()->json([
              'message' => 'Order status updated successfully',
              'order' => $order->load(['user', 'items.plant']),
          ]);
      }

      public function cancel(Request $request, $id)
      {
          $order = Order::with('items')->findOrFail($id);

          if ($order->status !== 'pending') {
              return response()->json([
                  'message' => 'Only pending orders can be cancelled'
              ], 400);
          }

          // Restore stock and sold count
          foreach ($order->items as $item) {
              $plant = Plant::find($item->plant_id);
              if ($plant) {
                  $plant->stock = ($plant->stock ?? 0) + $item->quantity;
                  $plant->sold = max(0, ($plant->sold ?? 0) - $item->quantity);
                  $plant->save();
              }
          }

          $order->status = 'cancelled';
          $order->save();

          // Generate random refund code
          $refundCode = 'REF-' . strtoupper(bin2hex(random_bytes(4)));

          // Create inbox message
           \App\Models\InboxMessage::create([
               'user_id' => $order->user_id,
               'order_id' => $order->id,
               'title' => "Order #{$order->id} Cancelled & Refunded",
               'message' => "Your order #{$order->id} has been cancelled successfully. A refund has been initiated to your original payment method ({$order->payment_method}). Use the refund code below for any queries or to check status with support.",
               'refund_amount' => $order->total_price,
               'refund_code' => $refundCode,
               'is_read' => false,
           ]);

          return response()->json([
              'message' => 'Order cancelled and refund initiated successfully',
              'order' => $order->load(['user', 'items.plant']),
          ]);
      }
}

