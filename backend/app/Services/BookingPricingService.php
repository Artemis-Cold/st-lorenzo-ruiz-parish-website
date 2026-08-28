<?php

namespace App\Services;

use App\Models\ServiceFee;
use App\Models\ServicePackage;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;

class BookingPricingService
{
    /**
     * @param  Collection<int, mixed>  $addons
     * @param  array<int, array{fee: ServiceFee, quantity: int}>  $fees
     * @return array{total: float, snapshot: array<string, mixed>}
     */
    public function calculate(ServicePackage $package, Collection $addons, array $fees = []): array
    {
        $package->loadMissing(['service', 'inclusions']);
        $basePrice = $package->service?->code === 'wedding'
            ? 0.0
            : (float) $package->base_price;

        $feeItems = collect($fees)->map(function (array $item) {
            $quantity = max(0, $item['quantity']);
            $amount = (float) $item['fee']->amount;

            return [
                'id' => $item['fee']->id,
                'code' => $item['fee']->code,
                'name' => $item['fee']->name,
                'price' => $amount,
                'quantity' => $quantity,
                'subtotal' => $amount * $quantity,
            ];
        })->values();

        $total = $basePrice
            + $package->inclusions->sum(fn ($item) => (float) $item->price)
            + $addons->sum(fn ($item) => (float) $item->price)
            + $feeItems->sum('subtotal');

        return [
            'total' => $total,
            'snapshot' => [
                'package' => [
                    'id' => $package->id,
                    'name' => $package->name,
                    'basePrice' => $basePrice,
                ],
                'inclusions' => $package->inclusions->map(fn ($item) => [
                    'id' => $item->id,
                    'name' => $item->name,
                    'price' => (float) $item->price,
                ])->values()->all(),
                'addons' => $addons->map(fn ($item) => [
                    'id' => $item->id,
                    'name' => $item->name,
                    'price' => (float) $item->price,
                ])->values()->all(),
                'fees' => $feeItems->all(),
            ],
        ];
    }

    public function fee(string $serviceCode, string $feeCode): ServiceFee
    {
        $fee = ServiceFee::query()
            ->where('code', $feeCode)
            ->where('is_active', true)
            ->whereHas('service', fn ($query) => $query
                ->where('code', $serviceCode)
                ->where('is_active', true))
            ->first();

        if (! $fee) {
            throw ValidationException::withMessages([
                'pricing' => 'The current service pricing is unavailable. Please contact the parish office.',
            ]);
        }

        return $fee;
    }
}
