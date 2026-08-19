<?php

use Carbon\CarbonImmutable;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if ($legacyIndex = $this->indexFor(['booking_date', 'start_time'], true)) {
            Schema::table('booking_slots', function (Blueprint $table) use ($legacyIndex) {
                $table->dropUnique($legacyIndex['name']);
            });
        }

        Schema::table('booking_slots', function (Blueprint $table) {
            $table->unsignedTinyInteger('capacity')->nullable()->default(null)->change();
        });

        if (! $this->indexFor(['service_id', 'booking_date', 'start_time'], true)) {
            Schema::table('booking_slots', function (Blueprint $table) {
                $table->unique(
                    ['service_id', 'booking_date', 'start_time'],
                    'booking_slots_service_date_start_unique',
                );
            });
        }

        if (! $this->indexFor(['booking_date', 'start_time'])) {
            Schema::table('booking_slots', function (Blueprint $table) {
                $table->index(
                    ['booking_date', 'start_time'],
                    'booking_slots_date_start_index',
                );
            });
        }

        $baptismServiceId = DB::table('services')->where('code', 'baptism')->value('id');

        if ($baptismServiceId) {
            DB::table('booking_slots')
                ->where('service_id', $baptismServiceId)
                ->update(['capacity' => null]);
        }

        DB::table('booking_slots')
            ->when($baptismServiceId, fn ($query) => $query->where('service_id', '!=', $baptismServiceId))
            ->update(['capacity' => 1]);

        DB::table('booking_slots')
            ->select(['id', 'booking_date', 'start_time'])
            ->orderBy('id')
            ->chunkById(500, function ($slots) {
                foreach ($slots as $slot) {
                    $scheduleKey = CarbonImmutable::parse($slot->booking_date)->isSunday()
                        ? 'booking-slots.start_times.sunday'
                        : 'booking-slots.start_times.monday_to_saturday';

                    if (! in_array(substr($slot->start_time, 0, 5), config($scheduleKey, []), true)) {
                        DB::table('booking_slots')
                            ->where('id', $slot->id)
                            ->update(['is_active' => false]);
                    }
                }
            });
    }

    public function down(): void
    {
        DB::table('booking_slots')->whereNull('capacity')->update(['capacity' => 1]);

        if ($serviceIndex = $this->indexFor(['service_id', 'booking_date', 'start_time'], true)) {
            Schema::table('booking_slots', function (Blueprint $table) use ($serviceIndex) {
                $table->dropUnique($serviceIndex['name']);
            });
        }

        if ($dateIndex = $this->indexFor(['booking_date', 'start_time'], false)) {
            Schema::table('booking_slots', function (Blueprint $table) use ($dateIndex) {
                $table->dropIndex($dateIndex['name']);
            });
        }

        Schema::table('booking_slots', function (Blueprint $table) {
            $table->unsignedTinyInteger('capacity')->nullable(false)->default(1)->change();
        });

        if (! $this->indexFor(['booking_date', 'start_time'], true)) {
            Schema::table('booking_slots', function (Blueprint $table) {
                $table->unique(
                    ['booking_date', 'start_time'],
                    'booking_slots_booking_date_start_time_unique',
                );
            });
        }
    }

    /** @return array{name: string, columns: array<int, string>, unique: bool}|null */
    private function indexFor(array $columns, ?bool $unique = null): ?array
    {
        foreach (Schema::getIndexes('booking_slots') as $index) {
            if (array_map('strtolower', $index['columns']) !== $columns) {
                continue;
            }

            if ($unique !== null && (bool) $index['unique'] !== $unique) {
                continue;
            }

            return $index;
        }

        return null;
    }
};
