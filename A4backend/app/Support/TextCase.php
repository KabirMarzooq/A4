<?php

namespace App\Support;

// Shared by the Eloquent mutators on PatientFolder/PatientFile/VisitRecord —
// staff enter records in whatever case they're typing in (often ALL CAPS or
// all lowercase from muscle memory), and this normalizes it at write time so
// every entry point (form, API client, tinker) ends up consistent regardless
// of what typed it. Frontend forms additionally normalize on blur so staff
// see the corrected casing immediately rather than waiting on a round trip.
class TextCase
{
    /**
     * Title Case for proper nouns — names, places, family/folder names.
     * Whitespace is collapsed first so stray double-spaces don't survive.
     */
    public static function title(?string $value): ?string
    {
        if ($value === null || trim($value) === '') {
            return $value;
        }

        return mb_convert_case(
            trim(preg_replace('/\s+/', ' ', $value)),
            MB_CASE_TITLE,
            'UTF-8'
        );
    }

    /**
     * Sentence case for free-text clinical narrative (complaints, notes,
     * diagnoses). Deliberately only touches the first letter of the string
     * and the first letter after '. '/'! '/'? ' — never lowercases the rest,
     * so medical abbreviations (BP, HIV, IV) survive untouched.
     */
    public static function sentence(?string $value): ?string
    {
        if ($value === null || trim($value) === '') {
            return $value;
        }

        $value = trim(preg_replace('/\s+/', ' ', $value));

        return preg_replace_callback(
            '/(^|[.!?]\s+)([a-z])/u',
            fn($m) => $m[1] . mb_strtoupper($m[2], 'UTF-8'),
            $value
        );
    }
}
