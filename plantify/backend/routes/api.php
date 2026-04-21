<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PlantController;
use App\Http\Controllers\Api\WishlistController;
use App\Http\Controllers\Api\NotificationController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes (Guest access)
Route::prefix('v1')->group(function () {
    // Plant browsing
    Route::get('/plants', [PlantController::class, 'index']);
    Route::get('/plants/{id}', [PlantController::class, 'show']);
    Route::get('/categories', [PlantController::class, 'categories']);
    Route::get('/stats', [PlantController::class, 'stats']);
});

// Authentication routes
Route::prefix('v1/auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    
    // Protected auth routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
        Route::put('/profile', [AuthController::class, 'updateProfile']);
    });
});

// Protected routes (require authentication)
Route::prefix('v1')->middleware('auth:sanctum')->group(function () {
    
    // Wishlist
    Route::apiResource('wishlist', WishlistController::class)
        ->only(['index', 'store', 'destroy']);
    
    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    
    // Admin routes
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        // User management
        Route::apiResource('users', \App\Http\Controllers\Api\Admin\UserManagementController::class);
        
        // Plant approval
        Route::get('/plants/pending', [\App\Http\Controllers\Api\Admin\PlantApprovalController::class, 'pending']);
        Route::post('/plants/{id}/approve', [\App\Http\Controllers\Api\Admin\PlantApprovalController::class, 'approve']);
        Route::post('/plants/{id}/reject', [\App\Http\Controllers\Api\Admin\PlantApprovalController::class, 'reject']);
        
        // Analytics
        Route::get('/analytics', [\App\Http\Controllers\Api\Admin\AnalyticsController::class, 'index']);
        
        // Activity logs
        Route::get('/activity-logs', [\App\Http\Controllers\Api\Admin\ActivityLogController::class, 'index']);
    });
    
    // Plant Specialist routes
    Route::middleware('role:plant_specialist')->prefix('specialist')->group(function () {
        // My plants
        Route::get('/my-plants', [\App\Http\Controllers\Api\Specialist\PlantManagementController::class, 'index']);
        Route::post('/plants', [\App\Http\Controllers\Api\Specialist\PlantManagementController::class, 'store']);
        Route::put('/plants/{id}', [\App\Http\Controllers\Api\Specialist\PlantManagementController::class, 'update']);
        Route::delete('/plants/{id}', [\App\Http\Controllers\Api\Specialist\PlantManagementController::class, 'destroy']);
        
        // Return requests review
        Route::get('/return-requests', [\App\Http\Controllers\Api\Specialist\ReturnRequestController::class, 'index']);
        Route::post('/return-requests/{id}/approve', [\App\Http\Controllers\Api\Specialist\ReturnRequestController::class, 'approve']);
        Route::post('/return-requests/{id}/reject', [\App\Http\Controllers\Api\Specialist\ReturnRequestController::class, 'reject']);
        
        // Q&A responses
        Route::post('/questions/{id}/answer', [\App\Http\Controllers\Api\Specialist\QuestionController::class, 'answer']);
        
        // Analytics
        Route::get('/analytics', [\App\Http\Controllers\Api\Specialist\AnalyticsController::class, 'index']);
    });
    
    // Customer routes
    Route::middleware('role:customer')->prefix('customer')->group(function () {
        // Reviews
        Route::post('/reviews', [\App\Http\Controllers\Api\Customer\ReviewController::class, 'store']);
        
        // Questions
        Route::post('/questions', [\App\Http\Controllers\Api\Customer\QuestionController::class, 'store']);
        
        // Comments
        Route::post('/comments', [\App\Http\Controllers\Api\Customer\CommentController::class, 'store']);
        
        // Orders (placeholder for Phase 3)
        Route::apiResource('orders', \App\Http\Controllers\Api\Customer\OrderController::class);
    });
    
    // Delivery Partner routes
    Route::middleware('role:delivery_partner')->prefix('delivery')->group(function () {
        // Available orders
        Route::get('/available-orders', [\App\Http\Controllers\Api\Delivery\OrderController::class, 'available']);
        
        // Accept/Reject order
        Route::post('/orders/{id}/accept', [\App\Http\Controllers\Api\Delivery\OrderController::class, 'accept']);
        Route::post('/orders/{id}/reject', [\App\Http\Controllers\Api\Delivery\OrderController::class, 'reject']);
        
        // Update order status
        Route::post('/orders/{id}/status', [\App\Http\Controllers\Api\Delivery\OrderController::class, 'updateStatus']);
        
        // Earnings
        Route::get('/earnings', [\App\Http\Controllers\Api\Delivery\EarningController::class, 'index']);
        
        // Analytics
        Route::get('/analytics', [\App\Http\Controllers\Api\Delivery\AnalyticsController::class, 'index']);
    });
});
