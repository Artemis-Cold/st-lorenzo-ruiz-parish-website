<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'parishioner_id' => fake()->unique()->numerify('PAR-########'),
            'username' => fake()->unique()->userName(),
            'password' => static::$password ??= Hash::make('password'),
            'first_name' => fake()->firstName(),
            'middle_initial' => null,
            'last_name' => fake()->lastName(),
            'suffix' => null,
            'birth_date' => fake()->date(),
            'gender' => fake()->randomElement(['Male', 'Female']),
            'phone' => fake()->unique()->numerify('09#########'),
            'house_no' => fake()->buildingNumber(),
            'street' => fake()->streetName(),
            'barangay' => fake()->citySuffix(),
            'municipality' => fake()->city(),
            'province' => fake()->state(),
            'zip_code' => fake()->postcode(),
            'role' => 'parishioner',
            'is_active' => true,
            'phone_verified_at' => now(),
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'phone_verified_at' => null,
        ]);
    }
}
