<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // One row per user per dashboard section — records when that user
        // last acknowledged that section, so NotificationController::summary()
        // can compare against a timestamp that actually advances instead of
        // the user's last_login_at (which never changes mid-session and so
        // re-lit every notification dot on the next 30s poll).
        Schema::create('notification_reads', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('section_key');
            $table->timestamp('last_seen_at');
            $table->unique(['user_id', 'section_key']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notification_reads');
    }
};
