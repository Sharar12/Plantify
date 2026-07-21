<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PlantController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\UploadController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/users', [\App\Http\Controllers\UserController::class, 'index']);
Route::post('/users', [\App\Http\Controllers\UserController::class, 'store']);
Route::put('/users/{id}', [\App\Http\Controllers\UserController::class, 'update']);
Route::delete('/users/{id}', [\App\Http\Controllers\UserController::class, 'destroy']);

Route::get('/categories', [CategoryController::class, 'index']);
Route::post('/categories', [CategoryController::class, 'store']);
Route::put('/categories/{id}', [CategoryController::class, 'update']);
Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);

Route::post('/upload', [UploadController::class, 'store']);

Route::get('/plants', function () {
    return response()->json(\App\Models\Plant::all());
});

Route::get('/plants/{id}', function ($id) {
    $plant = \App\Models\Plant::findOrFail((int) $id);
    return response()->json($plant);
});

Route::post('/plants', [PlantController::class, 'store']);
Route::put('/plants/{id}', [PlantController::class, 'update']);
Route::delete('/plants/{id}', [PlantController::class, 'destroy']);

Route::get('/plants/{id}/reviews', [App\Http\Controllers\ReviewController::class, 'index']);
Route::post('/plants/{id}/reviews', [App\Http\Controllers\ReviewController::class, 'store']);

Route::get('/questions', [App\Http\Controllers\QuestionController::class, 'all']);
Route::get('/plants/{id}/questions', [App\Http\Controllers\QuestionController::class, 'index']);
Route::post('/plants/{id}/questions', [App\Http\Controllers\QuestionController::class, 'store']);
Route::post('/questions/{id}/answer', function (Request $request) {
    $id = (int) $request->route('id');
    return app(\App\Http\Controllers\QuestionController::class)->answer($request, $id);
});

Route::post('/orders', [\App\Http\Controllers\OrderController::class, 'store']);
Route::get('/orders', [\App\Http\Controllers\OrderController::class, 'index']);
Route::put('/orders/{id}/status', [\App\Http\Controllers\OrderController::class, 'updateStatus']);
Route::post('/orders/{id}/cancel', [\App\Http\Controllers\OrderController::class, 'cancel']);

Route::get('/messages', [\App\Http\Controllers\InboxController::class, 'index']);
Route::put('/messages/{id}/read', [\App\Http\Controllers\InboxController::class, 'markAsRead']);
Route::delete('/messages/{id}', [\App\Http\Controllers\InboxController::class, 'destroy']);

Route::get('/wishlists', [\App\Http\Controllers\WishlistController::class, 'index']);
Route::post('/wishlists', [\App\Http\Controllers\WishlistController::class, 'store']);
Route::delete('/wishlists/{plantId}', [\App\Http\Controllers\WishlistController::class, 'destroy']);
Route::get('/wishlists/check/{plantId}', [\App\Http\Controllers\WishlistController::class, 'check']);

Route::post('/payment/init', [\App\Http\Controllers\PaymentController::class, 'init']);
Route::post('/payment/success', [\App\Http\Controllers\PaymentController::class, 'success']);
Route::post('/payment/ipn', [\App\Http\Controllers\PaymentController::class, 'ipn']);
Route::post('/payment/cancel', [\App\Http\Controllers\PaymentController::class, 'cancel']);