<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class ChangePasswordRulesTest extends TestCase
{
    use RefreshDatabase;

    public static function passwords(): array
    {
        $cases = [];
        foreach (['parishioner', 'staff'] as $role) {
            foreach (['Abc1234', 'abcdefgh1', 'ABCDEFGH1', 'Abcdefgh'] as $password) {
                $cases[] = [$role, $password, $password, false];
            }
            $cases[] = [$role, 'Abcdefg1', 'Abcdefg2', false];
            $cases[] = [$role, 'Abcdefg1', 'Abcdefg1', true];
        }
        return $cases;
    }

    #[DataProvider('passwords')]
    public function test_new_password_rules(string $role, string $password, string $confirmation, bool $valid): void
    {
        $user = User::factory()->create(['role' => $role, 'password' => 'old-password']);
        Sanctum::actingAs($user, $role === 'staff' ? ['staff'] : ['*']);
        $endpoint = $role === 'staff' ? '/api/staff/settings/password' : '/api/profile/password';
        $response = $this->patchJson($endpoint, [
            'current_password' => 'old-password',
            'password' => $password,
            'password_confirmation' => $confirmation,
        ]);
        if ($valid) {
            $response->assertOk();
            $this->assertTrue(Hash::check($password, $user->fresh()->password));
        } else {
            $response->assertUnprocessable()->assertJsonValidationErrors('password');
            $this->assertTrue(Hash::check('old-password', $user->fresh()->password));
        }
    }
}
