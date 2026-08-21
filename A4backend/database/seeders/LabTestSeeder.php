<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class LabTestSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();

        $tests = [
            // ── HAEMATOLOGY ──────────────────────────────────────────────
            ['name' => 'Full Blood Count (FBC)', 'category' => 'Haematology', 'price' => 3500.00],
            ['name' => 'Erythrocyte Sedimentation Rate (ESR)', 'category' => 'Haematology', 'price' => 1500.00],
            ['name' => 'Genotype', 'category' => 'Haematology', 'price' => 2000.00],
            ['name' => 'Blood Group & Rhesus', 'category' => 'Haematology', 'price' => 1500.00],
            ['name' => 'Packed Cell Volume (PCV)', 'category' => 'Haematology', 'price' => 1000.00],

            // ── MICROBIOLOGY / PARASITOLOGY ─────────────────────────────
            ['name' => 'Malaria Parasite (MP)', 'category' => 'Parasitology', 'price' => 1500.00],
            ['name' => 'Widal Test', 'category' => 'Microbiology', 'price' => 2000.00],
            ['name' => 'Stool Microscopy', 'category' => 'Parasitology', 'price' => 1500.00],
            ['name' => 'Urine Microscopy, Culture & Sensitivity', 'category' => 'Microbiology', 'price' => 4000.00],
            ['name' => 'HVS Microscopy, Culture & Sensitivity', 'category' => 'Microbiology', 'price' => 4500.00],

            // ── CLINICAL CHEMISTRY ───────────────────────────────────────
            ['name' => 'Fasting Blood Sugar (FBS)', 'category' => 'Chemistry', 'price' => 1200.00],
            ['name' => 'Random Blood Sugar (RBS)', 'category' => 'Chemistry', 'price' => 1000.00],
            ['name' => 'Liver Function Test (LFT)', 'category' => 'Chemistry', 'price' => 6000.00],
            ['name' => 'Kidney/Renal Function Test (RFT)', 'category' => 'Chemistry', 'price' => 6000.00],
            ['name' => 'Lipid Profile', 'category' => 'Chemistry', 'price' => 6500.00],
            ['name' => 'Electrolytes, Urea & Creatinine (E/U/Cr)', 'category' => 'Chemistry', 'price' => 5500.00],
            ['name' => 'HbA1c (Glycated Haemoglobin)', 'category' => 'Chemistry', 'price' => 5000.00],

            // ── SEROLOGY / VIROLOGY ──────────────────────────────────────
            ['name' => 'HIV Screening', 'category' => 'Serology', 'price' => 2000.00],
            ['name' => 'Hepatitis B Surface Antigen (HBsAg)', 'category' => 'Serology', 'price' => 2500.00],
            ['name' => 'Hepatitis C Antibody (Anti-HCV)', 'category' => 'Serology', 'price' => 2500.00],
            ['name' => 'Pregnancy Test (Beta hCG)', 'category' => 'Serology', 'price' => 1500.00],
            ['name' => 'VDRL (Syphilis Screening)', 'category' => 'Serology', 'price' => 1500.00],

            // ── URINALYSIS ────────────────────────────────────────────────
            ['name' => 'Urinalysis', 'category' => 'Urinalysis', 'price' => 1000.00],

            // ── IMAGING (in-house referral tests) ───────────────────────
            ['name' => 'Abdominal Ultrasound Scan', 'category' => 'Imaging', 'price' => 8000.00],
            ['name' => 'Pelvic Ultrasound Scan', 'category' => 'Imaging', 'price' => 8000.00],
            ['name' => 'Chest X-Ray', 'category' => 'Imaging', 'price' => 6000.00],
        ];

        $tests = array_map(function ($test) use ($now) {
            return array_merge([
                'created_at' => $now,
                'updated_at' => $now,
            ], $test);
        }, $tests);

        foreach ($tests as $test) {
            DB::table('lab_tests')->updateOrInsert(
                ['name' => $test['name']],
                $test
            );
        }

        $this->command->info('✅ ' . count($tests) . ' lab tests seeded successfully.');
    }
}
