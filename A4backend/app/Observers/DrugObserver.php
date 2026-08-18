<?php

namespace App\Observers;

use App\Models\Drug;
use App\Models\SystemLog;

class DrugObserver
{
    public function created(Drug $drug): void
    {
        SystemLog::log(
            'inventory.drug_added',
            auth('api')->user()?->name . ' added ' . $drug->name . ' to inventory (Stock: ' . $drug->stock_quantity . ', Price: ₦' . $drug->unit_price . ')',
            $drug
        );
    }

    public function updated(Drug $drug): void
    {
        // Distinguish between a restock and a general edit
        if ($drug->wasChanged('stock_quantity')) {
            $old = $drug->getOriginal('stock_quantity');
            $new = $drug->stock_quantity;
            $diff = $new - $old;
            $action = $diff > 0 ? 'inventory.restocked' : 'inventory.stock_reduced';
            SystemLog::log(
                $action,
                auth('api')->user()?->name . ' changed stock for ' . $drug->name . ' from ' . $old . ' to ' . $new . ' (' . ($diff > 0 ? '+' : '') . $diff . ' units)',
                $drug
            );
        } else {
            SystemLog::log(
                'inventory.drug_updated',
                auth('api')->user()?->name . ' updated details for ' . $drug->name,
                $drug
            );
        }
    }

    public function deleted(Drug $drug): void
    {
        SystemLog::log(
            'inventory.drug_removed',
            auth('api')->user()?->name . ' removed ' . $drug->name . ' from inventory',
            $drug
        );
    }
}
