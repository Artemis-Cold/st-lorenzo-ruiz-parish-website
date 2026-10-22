<?php

namespace App\Support;

class StaffPermissions
{
    public const LABELS = [
        'dashboard.view' => 'View dashboard (all-module summaries)',
        'announcements.manage' => 'View and manage announcements',
        'events.manage' => 'View and manage events and Mass schedules',
        'availability.manage' => 'View and manage booking availability',
        'bookings.manage' => 'View and manage service bookings and requirements',
        'mass_intentions.view' => 'View Mass intention listings',
        'requests.manage' => 'View and manage document requests',
        'transactions.view' => 'View transactions',
        'transactions.confirm' => 'Confirm or reject payments',
        'pricing.manage' => 'View and manage service prices and packages',
        'markers.view' => 'View and print navigation markers',
    ];

    public static function normalize(array $permissions): array
    {
        if (in_array('transactions.confirm', $permissions, true)) {
            $permissions[] = 'transactions.view';
        }

        return array_values(array_unique($permissions));
    }
}
