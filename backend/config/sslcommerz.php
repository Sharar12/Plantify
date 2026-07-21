<?php

return [
    'store_id' => env('SSLCOMMERZ_STORE_ID', 'testbox'),
    'store_password' => env('SSLCOMMERZ_STORE_PASSWORD', 'qwerty'),
    'mode' => env('SSLCOMMERZ_MODE', 'sandbox'),
    'success_url' => env('SSLCOMMERZ_SUCCESS_URL', 'http://localhost:3000/payment/success'),
    'fail_url' => env('SSLCOMMERZ_FAIL_URL', 'http://localhost:3000/payment/fail'),
    'cancel_url' => env('SSLCOMMERZ_CANCEL_URL', 'http://localhost:3000/payment/cancel'),
    'webhook_url' => env('SSLCOMMERZ_WEBHOOK_URL', 'http://localhost:8000/api/payment/ipn'),
    'gateway_url' => env('SSLCOMMERZ_MODE') === 'live'
        ? 'https://securepay.sslcommerz.com/gwprocess/v4/api.php'
        : 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php',
    'validation_url' => env('SSLCOMMERZ_MODE') === 'live'
        ? 'https://securepay.sslcommerz.com/validator/api/validationserverAPI.php'
        : 'https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php',
];
