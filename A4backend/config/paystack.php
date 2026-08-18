<?php

return [
    'publicKey'  => env('PAYSTACK_PUBLIC_KEY'),
    'secretKey'  => env('PAYSTACK_SECRET_KEY'),
    'paymentUrl' => env('PAYSTACK_PAYMENT_URL', 'https://api.paystack.co'),
    'enabled'    => (bool) env('PAYSTACK_ENABLED', false),
];
