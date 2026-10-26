<?php

namespace App\Support;

class ParishCatalog
{
    public const DOCUMENTS = [
        'first_communion_certificate' => ['First Communion Certificate', 100],
        'death_permit' => ['Death Permit', 0],
        'baptism_permission' => ['Baptism Permit', 100],
        'confirmation_permission' => ['Confirmation Permit', 100],
    ];

    public const PERMITS = ['Death Permit', 'Baptism Permit', 'Confirmation Permit'];

    public const RETIRED_DOCUMENT_CODES = ['request_of_permission', 'permission_of_marriage_banns', 'publication_of_marriage_banns'];

    public const BAPTISM_INCLUSIONS = ['Baptism Bib', 'Candle for 1 pair sponsor', 'Rite of Baptism (Ritu ng Binyag)', 'White Towel'];
}
