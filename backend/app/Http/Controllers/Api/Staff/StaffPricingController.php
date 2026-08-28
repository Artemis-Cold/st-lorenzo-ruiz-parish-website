<?php

namespace App\Http\Controllers\Api\Staff;

use App\Http\Controllers\Controller;
use App\Http\Requests\Staff\UpdatePricingRequest;
use App\Models\PackageAddon;
use App\Models\PackageInclusion;
use App\Models\PricingChangeLog;
use App\Models\ServiceFee;
use App\Models\ServicePackage;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class StaffPricingController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(['data' => $this->pricingData()]);
    }

    public function update(UpdatePricingRequest $request): JsonResponse
    {
        $data = $request->validated();

        DB::transaction(function () use ($data, $request) {
            foreach ($data['packages'] as $item) {
                $package = ServicePackage::query()
                    ->with('service:id,code')
                    ->findOrFail($item['id']);

                // Wedding pricing is the sum of its required inclusions and
                // optional add-ons; it intentionally has no separate base fee.
                if ($package->service?->code === 'wedding') {
                    continue;
                }

                $this->updateAmount(
                    $package,
                    'base_price',
                    $item['basePrice'],
                    'package',
                    $request->user()->id,
                );
            }

            foreach ($data['inclusions'] as $item) {
                $this->updateAmount(
                    PackageInclusion::findOrFail($item['id']),
                    'price',
                    $item['price'],
                    'inclusion',
                    $request->user()->id,
                );
            }

            foreach ($data['addons'] as $item) {
                $this->updateAmount(
                    PackageAddon::findOrFail($item['id']),
                    'price',
                    $item['price'],
                    'addon',
                    $request->user()->id,
                );
            }

            foreach ($data['fees'] as $item) {
                $this->updateAmount(
                    ServiceFee::findOrFail($item['id']),
                    'amount',
                    $item['amount'],
                    'fee',
                    $request->user()->id,
                );
            }
        });

        return response()->json([
            'message' => 'Service prices updated successfully.',
            'data' => $this->pricingData(),
        ]);
    }

    private function updateAmount(
        Model $model,
        string $field,
        float|int|string $newAmount,
        string $type,
        int $staffId,
    ): void {
        $oldAmount = (float) $model->getAttribute($field);
        $newAmount = (float) $newAmount;

        if (round($oldAmount, 2) === round($newAmount, 2)) {
            return;
        }

        $model->update([$field => $newAmount]);

        PricingChangeLog::create([
            'changed_by' => $staffId,
            'price_type' => $type,
            'priceable_id' => $model->getKey(),
            'name' => (string) $model->getAttribute('name'),
            'old_amount' => $oldAmount,
            'new_amount' => $newAmount,
        ]);
    }

    private function pricingData(): array
    {
        $packages = ServicePackage::query()
            ->whereHas('service', fn ($query) => $query->whereIn('code', [
                'baptism',
                'wedding',
                'funeral',
            ]))
            ->with(['service:id,code,name', 'inclusions', 'addons'])
            ->orderBy('service_id')
            ->orderBy('name')
            ->get()
            ->map(fn (ServicePackage $package) => [
                'id' => $package->id,
                'serviceCode' => $package->service->code,
                'serviceName' => $package->service->name,
                'name' => $package->name,
                'basePrice' => (float) $package->base_price,
                'basePriceEditable' => $package->service->code !== 'wedding',
                'inclusions' => $package->inclusions->map(fn ($item) => [
                    'id' => $item->id,
                    'name' => $item->name,
                    'price' => (float) $item->price,
                ])->values(),
                'addons' => $package->addons->map(fn ($item) => [
                    'id' => $item->id,
                    'name' => $item->name,
                    'price' => (float) $item->price,
                ])->values(),
            ])
            ->values();

        $fees = ServiceFee::query()
            ->with('service:id,code,name')
            ->orderBy('service_id')
            ->orderBy('sort_order')
            ->get()
            ->map(fn (ServiceFee $fee) => [
                'id' => $fee->id,
                'serviceCode' => $fee->service->code,
                'serviceName' => $fee->service->name,
                'code' => $fee->code,
                'name' => $fee->name,
                'amount' => (float) $fee->amount,
            ])
            ->values();

        return compact('packages', 'fees');
    }
}
