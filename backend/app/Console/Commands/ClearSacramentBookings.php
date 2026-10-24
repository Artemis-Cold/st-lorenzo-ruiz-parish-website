<?php

namespace App\Console\Commands;

use App\Models\Booking;
use App\Models\Service;
use Illuminate\Console\Command;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

class ClearSacramentBookings extends Command
{
    private const SERVICE_CODES = [
        'baptism', 'wedding', 'funeral', 'confirmation', 'first-communion',
    ];

    protected $signature = 'bookings:clear-sacraments
        {--all-bookings : Include document requests, Mass intentions, and every other booking type}
        {--execute : Permanently delete the matching database records}
        {--delete-files : Also delete associated uploads from the public disk}
        {--force : Skip confirmation and authorize execution in production}';

    protected $description = 'Preview or clear sacrament bookings; optionally include all booking types and their uploads';

    public function handle(): int
    {
        $all = (bool) $this->option('all-bookings');
        $services = Service::query()
            ->when(! $all, fn ($query) => $query->whereIn('code', self::SERVICE_CODES))
            ->get(['id', 'code', 'name'])
            ->keyBy('code');

        $bookingQuery = Booking::query()->when(! $all, fn ($query) => $query->whereIn('service_id', $services->pluck('id')));
        $bookingIds = (clone $bookingQuery)->pluck('id');
        $files = $this->associatedFiles($bookingIds);

        $this->newLine();
        $this->components->info($all ? 'ALL booking types cleanup preview' : 'Sacrament booking cleanup preview');
        $this->line('Environment: '.app()->environment().' | Database: '.DB::connection()->getDatabaseName());
        $this->table(['Service', 'Bookings'], ($all ? $services->keys() : collect(self::SERVICE_CODES))->map(fn (string $code) => [
            $services->get($code)?->name ?? ucfirst($code),
            $services->has($code)
                ? Booking::query()->where('service_id', $services[$code]->id)->count()
                : 0,
        ])->all());
        $this->line("Total database bookings: <fg=yellow>{$bookingIds->count()}</>");
        $this->line("Associated stored files: <fg=yellow>{$files->count()}</>");

        if (! $this->option('execute')) {
            $this->newLine();
            $this->comment('Dry run only. Nothing was deleted. Add --execute when the preview is correct.');

            return self::SUCCESS;
        }

        if ($bookingIds->isEmpty()) {
            $this->components->info('There are no matching bookings to clear.');

            return self::SUCCESS;
        }

        if (app()->environment('production') && ! $this->option('force')) {
            $this->components->error('Production cleanup requires both --execute and --force.');

            return self::FAILURE;
        }

        if (! $this->option('force') && ! $this->confirm(
            "Permanently delete {$bookingIds->count()} selected bookings and their linked records from the database?",
            false,
        )) {
            $this->components->warn('Cleanup cancelled. Nothing was deleted.');

            return self::SUCCESS;
        }

        $deleted = DB::transaction(function () use ($bookingIds) {
            // Linked wedding preparation bookings restrict deletion of their parent.
            // Unlink only relationships wholly inside this cleanup's previewed set.
            if (Schema::hasColumn('bookings', 'wedding_booking_id')) {
                Booking::whereIn('id', $bookingIds)
                    ->whereIn('wedding_booking_id', $bookingIds)
                    ->update(['wedding_booking_id' => null]);
            }

            return Booking::whereIn('id', $bookingIds)->delete();
        });
        $deletedFiles = 0;

        if ($this->option('delete-files') && $files->isNotEmpty()) {
            foreach ($files as $path) {
                if (Storage::disk('public')->delete($path)) {
                    $deletedFiles++;
                }
            }
        }

        $this->newLine();
        $this->components->info("Deleted {$deleted} selected bookings and their linked records.");

        if ($this->option('delete-files')) {
            $this->line("Deleted stored files: <fg=green>{$deletedFiles}</>");
        } elseif ($files->isNotEmpty()) {
            $this->comment('Stored uploads were preserved. Use --delete-files during cleanup if they should also be removed.');
        }

        return self::SUCCESS;
    }

    /** @param Collection<int, int> $bookingIds */
    private function associatedFiles(Collection $bookingIds): Collection
    {
        if ($bookingIds->isEmpty()) {
            return collect();
        }

        $bookingDocuments = DB::table('booking_documents')
            ->whereIn('booking_id', $bookingIds)
            ->pluck('file_path');

        $godparentDocuments = Schema::hasColumn('god_parents', 'requirement_file_path')
            ? DB::table('god_parents')
                ->join('baptizands', 'baptizands.id', '=', 'god_parents.baptizand_id')
                ->whereIn('baptizands.booking_id', $bookingIds)
                ->pluck('god_parents.requirement_file_path')
            : collect();

        $weddingSponsorDocuments = Schema::hasTable('wedding_sponsors')
            && Schema::hasColumn('wedding_sponsors', 'requirement_file_path')
            ? DB::table('wedding_sponsors')
                ->whereIn('booking_id', $bookingIds)
                ->pluck('wedding_sponsors.requirement_file_path')
            : collect();

        return $bookingDocuments
            ->merge($godparentDocuments)
            ->merge($weddingSponsorDocuments)
            ->filter(fn ($path) => is_string($path) && $path !== '')
            ->unique()
            ->values();
    }
}
