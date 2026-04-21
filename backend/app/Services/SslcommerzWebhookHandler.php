<?php

namespace App\Services;

class SslcommerzWebhookHandler
{
    public static function verifyPayload(array $payload, string $storePass): bool
    {
        if (empty($payload['val_id']) || empty($payload['tran_id'])) {
            return false;
        }

        $status = strtoupper($payload['status'] ?? '');
        return in_array($status, ['VALID', 'VALIDATED']);
    }
}
