<?php

return [
    'services' => ['baptism', 'wedding', 'funeral'],

    'start_times' => [
        'monday_to_saturday' => [
            '08:00',
            '09:00',
            '10:00',
            '11:00',
            '13:00',
            '14:00',
            '15:00',
        ],
        'sunday' => [
            '11:00',
            '13:00',
            '14:00',
            '15:00',
        ],
    ],

    'duration_minutes' => 60,
    'released_statuses' => ['cancelled', 'rejected'],
];
