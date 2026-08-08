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
        Schema::create('users', function (Blueprint $table) {
            $table->id();

            /*
            |--------------------------------------------------------------------------
            | Authentication
            |--------------------------------------------------------------------------
            */

            $table->string('parishioner_id')->unique();
            $table->string('username')->unique();
            $table->string('password');

            /*
            |--------------------------------------------------------------------------
            | Personal Information
            |--------------------------------------------------------------------------
            */

            $table->string('first_name');
            $table->string('middle_initial')->nullable();
            $table->string('last_name');
            $table->string('suffix')->nullable();

            $table->date('birth_date')->nullable();

            $table->enum('gender', [
                'Male',
                'Female',
            ])->nullable();

            /*
            |--------------------------------------------------------------------------
            | Contact Information
            |--------------------------------------------------------------------------
            */

            $table->string('phone', 20)->unique();

            $table->string('house_no')->nullable();
            $table->string('street')->nullable();
            $table->string('barangay');
            $table->string('municipality');
            $table->string('province');
            $table->string('zip_code')->nullable();

            /*
            |--------------------------------------------------------------------------
            | Profile
            |--------------------------------------------------------------------------
            */

            $table->string('profile_photo')->nullable();

            /*
            |--------------------------------------------------------------------------
            | System
            |--------------------------------------------------------------------------
            */

            $table->enum('role', [
                'admin',
                'staff',
                'parishioner',
            ])->default('parishioner');

            $table->boolean('is_active')->default(true);

            $table->timestamp('phone_verified_at')->nullable();

            $table->rememberToken();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
