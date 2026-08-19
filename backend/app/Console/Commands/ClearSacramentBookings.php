<?php

namespace App\Console\Commands;

use App\Models\Booking;
use App\Models\Service;
use Illuminate\Console\Command;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ClearSacramentBookings extends Command
{
    private const SERVICE_CODES = ['baptism', 'wedding', 'funeral'];

    protected $signature = 'bookings:clear-sacraments
        {--execute : Permanently delete the matching database records}
        {--delete-files : Also delete associated uploads from the public disk}
        {--force : Skip confirmation and authorize execution in production}';

    protected $description = 'Safely clear Baptism, Wedding, and Funeral bookings without affecting other booking types';

    public function handle(): int
    {
        $services = Service::query()
            ->whereIn('code', self::SERVICE_CODES)
            ->get(['id', 'code', 'name'])
            ->keyBy('code');

        $bookingQuery = Booking::query()->whereIn('service_id', $services->pluck('id'));
        $bookingIds = (clone $bookingQuery)->pluck('id');
        $files = $this->associatedFiles($bookingIds);

        $this->newLine();
        $this->components->info('Sacrament booking cleanup preview');
        $this->table(['Service', 'Bookings'], collect(self::SERVICE_CODES)->map(fn (string $code) => [
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
            $this->components->info('There are no Baptism, Wedding, or Funeral bookings to clear.');

            return self::SUCCESS;
        }

        if (app()->environment('production') && ! $this->option('force')) {
            $this->components->error('Production cleanup requires both --execute and --force.');

            return self::FAILURE;
        }

        if (! $this->option('force') && ! $this->confirm(
            "Permanently delete {$bookingIds->count()} sacrament bookings from the database?",
            false,
        )) {
            $this->components->warn('Cleanup cancelled. Nothing was deleted.');

            return self::SUCCESS;
        }

        $deleted = DB::transaction(fn () => $bookingQuery->delete());
        $deletedFiles = 0;

        if ($this->option('delete-files') && $files->isNotEmpty()) {
            foreach ($files as $path) {
                if (Storage::disk('public')->delete($path)) {
                    $deletedFiles++;
                }
            }
        }

        $this->newLine();
        $this->components->info("Deleted {$deleted} Baptism, Wedding, and Funeral bookings.");

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

        $godparentDocuments = DB::table('god_parent_pairs')
            ->join('baptizands', 'baptizands.id', '=', 'god_parent_pairs.baptizand_id')
            ->whereIn('baptizands.booking_id', $bookingIds)
            ->get(['god_parent_pairs.marriage_contract', 'god_parent_pairs.confirmation_certificate'])
            ->flatMap(fn ($pair) => [$pair->marriage_contract, $pair->confirmation_certificate]);

        return $bookingDocuments
            ->merge($godparentDocuments)
            ->filter(fn ($path) => is_string($path) && $path !== '')
            ->unique()
            ->values();
    }
}
