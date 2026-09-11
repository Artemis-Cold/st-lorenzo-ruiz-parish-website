<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\PackageAddon;
use App\Models\PackageInclusion;
use App\Models\ServiceFee;
use App\Models\ServicePackage;
use App\Models\User;
use App\Services\BookingPricingService;
use Database\Seeders\ProductionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class StaffPricingTest extends TestCase
{
    use RefreshDatabase;

    public function test_staff_can_update_pricing_without_changing_an_existing_booking_snapshot(): void
    {
        $this->seed(ProductionSeeder::class);
        $staff = User::where('role', 'staff')->firstOrFail();
        $parishioner = User::factory()->create();
        Sanctum::actingAs($staff);

        $package = ServicePackage::query()->with(['inclusions', 'addons'])->where('name', 'Standard Wedding Package')->firstOrFail();
        $addon = $package->addons->firstOrFail();
        $original = app(BookingPricingService::class)->calculate($package, collect([$addon]));
        $booking = Booking::create([
            'booking_reference' => 'WED-PRICE-SNAPSHOT',
            'user_id' => $parishioner->id,
            'service_id' => $package->service_id,
            'service_package_id' => $package->id,
            'booking_slot_id' => null,
            'total_amount' => $original['total'],
            'pricing_snapshot' => $original['snapshot'],
            'status' => 'pending',
        ]);
        $booking->selectedAddons()->sync([$addon->id]);

        $payload = $this->payload();
        $payload['packages'][0]['basePrice'] += 100;
        $payload['inclusions'][0]['price'] += 10;
        $payload['addons'][0]['price'] += 20;
        $payload['fees'][0]['amount'] += 5;

        $this->putJson('/api/staff/settings/pricing', $payload)
            ->assertOk()
            ->assertJsonPath('message', 'Service prices updated successfully.');

        $this->assertDatabaseCount('pricing_change_logs', 4);
        $this->assertSame(number_format($original['total'], 2, '.', ''), $booking->fresh()->total_amount);
        $this->assertEquals($original['snapshot'], $booking->fresh()->pricing_snapshot);
    }

    public function test_pricing_endpoints_return_current_values_and_reject_invalid_updates(): void
    {
        $this->seed(ProductionSeeder::class);
        Sanctum::actingAs(User::where('role', 'staff')->firstOrFail());

        $this->getJson('/api/staff/settings/pricing')
            ->assertOk()
            ->assertJsonCount(5, 'data.packages')
            ->assertJsonCount(7, 'data.fees');

        $this->getJson('/api/services/document-request/fees')
            ->assertOk()
            ->assertJsonCount(5, 'data');

        $payload = $this->payload();
        $payload['packages'][0]['basePrice'] = -1;

        $this->putJson('/api/staff/settings/pricing', $payload)
            ->assertUnprocessable()
            ->assertJsonValidationErrors('packages.0.basePrice');
    }

    public function test_wedding_has_no_separate_editable_base_price(): void
    {
        $this->seed(ProductionSeeder::class);
        Sanctum::actingAs(User::where('role', 'staff')->firstOrFail());

        $wedding = ServicePackage::query()
            ->whereHas('service', fn ($query) => $query->where('code', 'wedding'))
            ->firstOrFail();

        $this->getJson('/api/staff/settings/pricing')
            ->assertOk()
            ->assertJsonFragment([
                'id' => $wedding->id,
                'basePrice' => '0.00',
                'basePriceEditable' => false,
            ]);

        $payload = $this->payload();
        $index = collect($payload['packages'])->search(
            fn (array $package) => $package['id'] === $wedding->id
        );
        $payload['packages'][$index]['basePrice'] = 5000;

        $this->putJson('/api/staff/settings/pricing', $payload)->assertOk();

        $this->assertSame(0.0, (float) $wedding->fresh()->base_price);
    }

    public function test_parishioners_cannot_manage_pricing(): void
    {
        $this->seed(ProductionSeeder::class);
        Sanctum::actingAs(User::factory()->create());

        $this->getJson('/api/staff/settings/pricing')->assertForbidden();
        $this->putJson('/api/staff/settings/pricing', $this->payload())->assertForbidden();
    }

    private function payload(): array
    {
        return [
            'packages' => ServicePackage::query()->orderBy('id')->get()->map(fn ($item) => [
                'id' => $item->id,
                'basePrice' => (float) $item->base_price,
            ])->all(),
            'inclusions' => PackageInclusion::query()->orderBy('id')->get()->map(fn ($item) => [
                'id' => $item->id,
                'price' => (float) $item->price,
            ])->all(),
            'addons' => PackageAddon::query()->orderBy('id')->get()->map(fn ($item) => [
                'id' => $item->id,
                'price' => (float) $item->price,
            ])->all(),
            'fees' => ServiceFee::query()->orderBy('id')->get()->map(fn ($item) => [
                'id' => $item->id,
                'amount' => (float) $item->amount,
            ])->all(),
        ];
    }
}
