<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('wedding_sponsors', function (Blueprint $table) {
            $table->foreignId('booking_id')
                ->nullable()
                ->after('id')
                ->constrained()
                ->cascadeOnDelete();
            $table->unsignedSmallInteger('sort_order')->default(0)->after('booking_id');
        });

        $weddingOrder = [];
        DB::table('wedding_sponsors')
            ->join(
                'wedding_sponsor_pairs',
                'wedding_sponsor_pairs.id',
                '=',
                'wedding_sponsors.wedding_sponsor_pair_id'
            )
            ->orderBy('wedding_sponsors.id')
            ->get(['wedding_sponsors.id', 'wedding_sponsor_pairs.booking_id'])
            ->each(function ($sponsor) use (&$weddingOrder) {
                $order = ($weddingOrder[$sponsor->booking_id] ?? 0) + 1;
                $weddingOrder[$sponsor->booking_id] = $order;

                DB::table('wedding_sponsors')->where('id', $sponsor->id)->update([
                    'booking_id' => $sponsor->booking_id,
                    'sort_order' => $order,
                ]);
            });

        $godParentOrder = [];
        Schema::table('god_parents', function (Blueprint $table) {
            $table->unsignedSmallInteger('sort_order')->default(0)->after('baptizand_id');
        });
        DB::table('god_parents')
            ->orderBy('baptizand_id')
            ->orderBy('id')
            ->get(['id', 'baptizand_id'])
            ->each(function ($godParent) use (&$godParentOrder) {
                $order = ($godParentOrder[$godParent->baptizand_id] ?? 0) + 1;
                $godParentOrder[$godParent->baptizand_id] = $order;

                DB::table('god_parents')->where('id', $godParent->id)->update([
                    'sort_order' => $order,
                ]);
            });

        Schema::table('wedding_sponsors', function (Blueprint $table) {
            $table->dropForeign(['wedding_sponsor_pair_id']);
            $table->dropColumn('wedding_sponsor_pair_id');
        });
        Schema::table('god_parents', function (Blueprint $table) {
            $table->dropForeign(['god_parent_pair_id']);
            $table->dropColumn('god_parent_pair_id');
        });

        Schema::dropIfExists('wedding_sponsor_pairs');
        Schema::dropIfExists('god_parent_pairs');
    }

    public function down(): void
    {
        Schema::create('wedding_sponsor_pairs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained()->cascadeOnDelete();
            $table->string('marriage_contract')->nullable();
            $table->string('confirmation_certificate')->nullable();
            $table->timestamps();
        });
        Schema::create('god_parent_pairs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('baptizand_id')->constrained()->cascadeOnDelete();
            $table->string('marriage_contract')->nullable();
            $table->string('confirmation_certificate')->nullable();
            $table->timestamps();
        });

        Schema::table('wedding_sponsors', function (Blueprint $table) {
            $table->foreignId('wedding_sponsor_pair_id')
                ->nullable()
                ->after('booking_id')
                ->constrained()
                ->cascadeOnDelete();
        });
        Schema::table('god_parents', function (Blueprint $table) {
            $table->foreignId('god_parent_pair_id')
                ->nullable()
                ->after('baptizand_id')
                ->constrained()
                ->cascadeOnDelete();
        });

        DB::table('wedding_sponsors')
            ->orderBy('booking_id')
            ->orderBy('sort_order')
            ->get()
            ->groupBy('booking_id')
            ->each(function ($sponsors, $bookingId) {
                $sponsors->chunk(2)->each(function ($chunk) use ($bookingId) {
                    $pairId = DB::table('wedding_sponsor_pairs')->insertGetId([
                        'booking_id' => $bookingId,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                    DB::table('wedding_sponsors')
                        ->whereIn('id', $chunk->pluck('id'))
                        ->update(['wedding_sponsor_pair_id' => $pairId]);
                });
            });

        DB::table('god_parents')
            ->orderBy('baptizand_id')
            ->orderBy('sort_order')
            ->get()
            ->groupBy('baptizand_id')
            ->each(function ($godParents, $baptizandId) {
                $godParents->chunk(2)->each(function ($chunk) use ($baptizandId) {
                    $pairId = DB::table('god_parent_pairs')->insertGetId([
                        'baptizand_id' => $baptizandId,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                    DB::table('god_parents')
                        ->whereIn('id', $chunk->pluck('id'))
                        ->update(['god_parent_pair_id' => $pairId]);
                });
            });

        Schema::table('wedding_sponsors', function (Blueprint $table) {
            $table->dropForeign(['booking_id']);
            $table->dropColumn(['booking_id', 'sort_order']);
        });
        Schema::table('god_parents', function (Blueprint $table) {
            $table->dropColumn('sort_order');
        });
    }
};
