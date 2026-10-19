<?php

namespace App\Support;

class ParishCatalog
{
    public const DOCUMENTS = [
        'first_communion_certificate' => ['First Communion Certificate', 100],
        'permission_of_marriage_banns' => ['Permission of Marriage Banns', 100],
        'publication_of_marriage_banns' => ['Publication of Marriage Banns', 500],
        'death_permit' => ['Death Permit', 0],
        'baptism_permission' => ['Baptism Permission', 100],
        'confirmation_permission' => ['Confirmation Permission', 100],
    ];

    public const PERMITS = ['Permission of Marriage Banns', 'Publication of Marriage Banns', 'Death Permit', 'Baptism Permission', 'Confirmation Permission'];

    public const BAPTISM_INCLUSIONS = ['Baptism Bib', 'Candle for 1 pair sponsor', 'Ritu', 'White Towel'];
}
