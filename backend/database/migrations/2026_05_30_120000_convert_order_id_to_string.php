<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Drop foreign keys if they still exist
        foreach (['order_items_order_id_foreign', 'inbox_messages_order_id_foreign'] as $fk) {
            try {
                $table = str_starts_with($fk, 'order_items') ? 'order_items' : 'inbox_messages';
                Schema::table($table, function (Blueprint $t) use ($fk) {
                    $t->dropForeign($fk);
                });
            } catch (\Exception $e) {
                // Already dropped
            }
        }

        // 2. Modify orders.id to varchar(5) if not already done
        $idType = DB::select("SELECT DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS 
                              WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'id'");
        $isVarchar = isset($idType[0]) && $idType[0]->DATA_TYPE === 'varchar';
        $hasPk = !empty(DB::select("SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
                                    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orders' AND CONSTRAINT_TYPE = 'PRIMARY KEY'"));

        if (!$isVarchar) {
            DB::statement('ALTER TABLE orders MODIFY id BIGINT UNSIGNED NOT NULL');
            if ($hasPk) {
                DB::statement('ALTER TABLE orders DROP PRIMARY KEY');
            }
            DB::statement('ALTER TABLE orders MODIFY id VARCHAR(5) NOT NULL');
        } elseif (!$hasPk) {
            DB::statement('ALTER TABLE orders MODIFY id VARCHAR(5) NOT NULL');
        }

        // 3. Generate new IDs for orders that still have numeric IDs
        $orders = DB::table('orders')->get();
        $needsMigration = false;
        foreach ($orders as $order) {
            if (ctype_digit($order->id)) {
                $needsMigration = true;
                break;
            }
        }

        if ($needsMigration) {
            // Orders still have integer IDs - clean migrate
            foreach ($orders as $order) {
                do {
                    $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
                    $newId = '';
                    for ($i = 0; $i < 5; $i++) {
                        $newId .= $chars[random_int(0, 35)];
                    }
                } while (DB::table('orders')->where('id', $newId)->exists());

                DB::table('order_items')->where('order_id', (string) $order->id)->update(['order_id' => $newId]);
                DB::table('inbox_messages')->where('order_id', (string) $order->id)->update(['order_id' => $newId]);
                DB::table('orders')->where('id', (string) $order->id)->update(['id' => $newId]);
            }
        } else {
            // Orders already have string IDs from partial migration.
            // Orphaned data in order_items/inbox_messages can't be reliably remapped.
            // Delete orphaned records to allow clean FK re-add.
            $stringIds = DB::table('orders')->pluck('id')->toArray();
            
            DB::table('order_items')
                ->whereNotIn('order_id', $stringIds)
                ->delete();
            DB::table('inbox_messages')
                ->whereNotIn('order_id', $stringIds)
                ->delete();
        }

        // 4. Modify referencing columns
        $oiType = DB::select("SELECT DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS 
                              WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'order_items' AND COLUMN_NAME = 'order_id'");
        if (isset($oiType[0]) && $oiType[0]->DATA_TYPE !== 'varchar') {
            DB::statement('ALTER TABLE order_items MODIFY order_id VARCHAR(5) NOT NULL');
        }

        $imType = DB::select("SELECT DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS 
                              WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'inbox_messages' AND COLUMN_NAME = 'order_id'");
        if (isset($imType[0]) && $imType[0]->DATA_TYPE !== 'varchar') {
            DB::statement('ALTER TABLE inbox_messages MODIFY order_id VARCHAR(5) NULL');
        }

        // 5. Add primary key if missing
        $pkExists = !empty(DB::select("SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
                                       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orders' AND CONSTRAINT_TYPE = 'PRIMARY KEY'"));
        if (!$pkExists) {
            DB::statement('ALTER TABLE orders ADD PRIMARY KEY (id)');
        }

        // 6. Re-add foreign keys
        $fkOi = DB::select("SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
                            WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'order_items' AND CONSTRAINT_NAME = 'order_items_order_id_foreign'");
        if (empty($fkOi)) {
            Schema::table('order_items', function (Blueprint $table) {
                $table->foreign('order_id')->references('id')->on('orders')->onDelete('cascade');
            });
        }

        $fkIm = DB::select("SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
                            WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'inbox_messages' AND CONSTRAINT_NAME = 'inbox_messages_order_id_foreign'");
        if (empty($fkIm)) {
            Schema::table('inbox_messages', function (Blueprint $table) {
                $table->foreign('order_id')->references('id')->on('orders')->onDelete('set null');
            });
        }
    }

    public function down(): void
    {
        throw new \RuntimeException('This migration cannot be reversed.');
    }
};
