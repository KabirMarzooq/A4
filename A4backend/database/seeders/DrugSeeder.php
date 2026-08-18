<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DrugSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();

        $drugs = [
            // ── ANTIBIOTICS ───────────────────────────────────────────────
            ['name' => 'Amoxicillin 500mg', 'category' => 'Antibiotic', 'unit_type' => 'Capsules', 'unit_price' => 250.00, 'stock_quantity' => 500, 'low_stock_threshold' => 50],
            ['name' => 'Amoxicillin + Clavulanate 625mg', 'category' => 'Antibiotic', 'unit_type' => 'Tablets', 'unit_price' => 450.00, 'stock_quantity' => 300, 'low_stock_threshold' => 30],
            ['name' => 'Azithromycin 500mg', 'category' => 'Antibiotic', 'unit_type' => 'Tablets', 'unit_price' => 600.00, 'stock_quantity' => 200, 'low_stock_threshold' => 25],
            ['name' => 'Ciprofloxacin 500mg', 'category' => 'Antibiotic', 'unit_type' => 'Tablets', 'unit_price' => 300.00, 'stock_quantity' => 400, 'low_stock_threshold' => 40],
            ['name' => 'Metronidazole 400mg', 'category' => 'Antibiotic', 'unit_type' => 'Tablets', 'unit_price' => 150.00, 'stock_quantity' => 600, 'low_stock_threshold' => 60],
            ['name' => 'Doxycycline 100mg', 'category' => 'Antibiotic', 'unit_type' => 'Capsules', 'unit_price' => 200.00, 'stock_quantity' => 350, 'low_stock_threshold' => 35],
            ['name' => 'Erythromycin 500mg', 'category' => 'Antibiotic', 'unit_type' => 'Tablets', 'unit_price' => 280.00, 'stock_quantity' => 250, 'low_stock_threshold' => 25],
            ['name' => 'Cotrimoxazole 480mg', 'category' => 'Antibiotic', 'unit_type' => 'Tablets', 'unit_price' => 100.00, 'stock_quantity' => 8, 'low_stock_threshold' => 50, 'description' => 'Septrin — commonly used for UTIs and respiratory infections'],

            // ── PAINKILLERS ───────────────────────────────────────────────
            ['name' => 'Paracetamol 500mg', 'category' => 'Painkiller', 'unit_type' => 'Tablets', 'unit_price' => 50.00, 'stock_quantity' => 1000, 'low_stock_threshold' => 100],
            ['name' => 'Ibuprofen 400mg', 'category' => 'Painkiller', 'unit_type' => 'Tablets', 'unit_price' => 120.00, 'stock_quantity' => 700, 'low_stock_threshold' => 70],
            ['name' => 'Diclofenac 50mg', 'category' => 'Painkiller', 'unit_type' => 'Tablets', 'unit_price' => 180.00, 'stock_quantity' => 400, 'low_stock_threshold' => 40],
            ['name' => 'Tramadol 50mg', 'category' => 'Painkiller', 'unit_type' => 'Capsules', 'unit_price' => 350.00, 'stock_quantity' => 200, 'low_stock_threshold' => 20],
            ['name' => 'Codeine Phosphate 30mg', 'category' => 'Painkiller', 'unit_type' => 'Tablets', 'unit_price' => 400.00, 'stock_quantity' => 0, 'low_stock_threshold' => 20, 'description' => 'Controlled substance — requires prescription'],
            ['name' => 'Aspirin 300mg', 'category' => 'Painkiller', 'unit_type' => 'Tablets', 'unit_price' => 60.00, 'stock_quantity' => 500, 'low_stock_threshold' => 50],

            // ── ANTIHYPERTENSIVES ─────────────────────────────────────────
            ['name' => 'Amlodipine 5mg', 'category' => 'Antihypertensive', 'unit_type' => 'Tablets', 'unit_price' => 220.00, 'stock_quantity' => 300, 'low_stock_threshold' => 30],
            ['name' => 'Lisinopril 10mg', 'category' => 'Antihypertensive', 'unit_type' => 'Tablets', 'unit_price' => 250.00, 'stock_quantity' => 250, 'low_stock_threshold' => 25],
            ['name' => 'Losartan 50mg', 'category' => 'Antihypertensive', 'unit_type' => 'Tablets', 'unit_price' => 300.00, 'stock_quantity' => 200, 'low_stock_threshold' => 20],
            ['name' => 'Hydrochlorothiazide 25mg', 'category' => 'Antihypertensive', 'unit_type' => 'Tablets', 'unit_price' => 150.00, 'stock_quantity' => 350, 'low_stock_threshold' => 35],
            ['name' => 'Atenolol 50mg', 'category' => 'Antihypertensive', 'unit_type' => 'Tablets', 'unit_price' => 180.00, 'stock_quantity' => 7, 'low_stock_threshold' => 25],
            ['name' => 'Nifedipine 20mg', 'category' => 'Antihypertensive', 'unit_type' => 'Tablets', 'unit_price' => 200.00, 'stock_quantity' => 280, 'low_stock_threshold' => 30],

            // ── ANTIDIABETICS ─────────────────────────────────────────────
            ['name' => 'Metformin 500mg', 'category' => 'Antidiabetic', 'unit_type' => 'Tablets', 'unit_price' => 200.00, 'stock_quantity' => 400, 'low_stock_threshold' => 40],
            ['name' => 'Glibenclamide 5mg', 'category' => 'Antidiabetic', 'unit_type' => 'Tablets', 'unit_price' => 150.00, 'stock_quantity' => 300, 'low_stock_threshold' => 30],
            ['name' => 'Insulin Glargine 100IU/mL', 'category' => 'Antidiabetic', 'unit_type' => 'Injection', 'unit_price' => 8500.00, 'stock_quantity' => 50, 'low_stock_threshold' => 10, 'description' => 'Long-acting insulin — refrigerate'],
            ['name' => 'Insulin Regular 100IU/mL', 'category' => 'Antidiabetic', 'unit_type' => 'Injection', 'unit_price' => 6500.00, 'stock_quantity' => 60, 'low_stock_threshold' => 10, 'description' => 'Short-acting insulin — refrigerate'],

            // ── ANTIMALARIALS ─────────────────────────────────────────────
            ['name' => 'Artemether + Lumefantrine 20/120mg', 'category' => 'Antiparasitic', 'unit_type' => 'Tablets', 'unit_price' => 1200.00, 'stock_quantity' => 150, 'low_stock_threshold' => 20, 'description' => 'Coartem — first-line malaria treatment'],
            ['name' => 'Artesunate 200mg', 'category' => 'Antiparasitic', 'unit_type' => 'Tablets', 'unit_price' => 800.00, 'stock_quantity' => 200, 'low_stock_threshold' => 25],
            ['name' => 'Chloroquine 250mg', 'category' => 'Antiparasitic', 'unit_type' => 'Tablets', 'unit_price' => 120.00, 'stock_quantity' => 300, 'low_stock_threshold' => 30],

            // ── ANTIFUNGALS ───────────────────────────────────────────────
            ['name' => 'Fluconazole 150mg', 'category' => 'Antifungal', 'unit_type' => 'Capsules', 'unit_price' => 500.00, 'stock_quantity' => 200, 'low_stock_threshold' => 20],
            ['name' => 'Ketoconazole 200mg', 'category' => 'Antifungal', 'unit_type' => 'Tablets', 'unit_price' => 350.00, 'stock_quantity' => 150, 'low_stock_threshold' => 15],
            ['name' => 'Clotrimazole Cream 1%', 'category' => 'Antifungal', 'unit_type' => 'Cream', 'unit_price' => 800.00, 'stock_quantity' => 100, 'low_stock_threshold' => 10],

            // ── ANTIHISTAMINES ────────────────────────────────────────────
            ['name' => 'Chlorpheniramine 4mg', 'category' => 'Antihistamine', 'unit_type' => 'Tablets', 'unit_price' => 80.00, 'stock_quantity' => 500, 'low_stock_threshold' => 50],
            ['name' => 'Cetirizine 10mg', 'category' => 'Antihistamine', 'unit_type' => 'Tablets', 'unit_price' => 200.00, 'stock_quantity' => 350, 'low_stock_threshold' => 35],
            ['name' => 'Loratadine 10mg', 'category' => 'Antihistamine', 'unit_type' => 'Tablets', 'unit_price' => 180.00, 'stock_quantity' => 300, 'low_stock_threshold' => 30],

            // ── ANTACIDS / GASTROINTESTINAL ───────────────────────────────
            ['name' => 'Omeprazole 20mg', 'category' => 'Gastrointestinal', 'unit_type' => 'Capsules', 'unit_price' => 250.00, 'stock_quantity' => 400, 'low_stock_threshold' => 40],
            ['name' => 'Pantoprazole 40mg', 'category' => 'Gastrointestinal', 'unit_type' => 'Tablets', 'unit_price' => 300.00, 'stock_quantity' => 300, 'low_stock_threshold' => 30],
            ['name' => 'Aluminum Hydroxide + Magnesium 400mg', 'category' => 'Antacid', 'unit_type' => 'Tablets', 'unit_price' => 100.00, 'stock_quantity' => 600, 'low_stock_threshold' => 60, 'description' => 'Gelusil — for heartburn and indigestion'],
            ['name' => 'Loperamide 2mg', 'category' => 'Gastrointestinal', 'unit_type' => 'Capsules', 'unit_price' => 150.00, 'stock_quantity' => 250, 'low_stock_threshold' => 25, 'description' => 'For acute diarrhea'],
            ['name' => 'Oral Rehydration Salts', 'category' => 'Gastrointestinal', 'unit_type' => 'Powder', 'unit_price' => 200.00, 'stock_quantity' => 300, 'low_stock_threshold' => 50],

            // ── VITAMINS & SUPPLEMENTS ────────────────────────────────────
            ['name' => 'Vitamin C 500mg', 'category' => 'Vitamin & Supplement', 'unit_type' => 'Tablets', 'unit_price' => 120.00, 'stock_quantity' => 500, 'low_stock_threshold' => 50],
            ['name' => 'Folic Acid 5mg', 'category' => 'Vitamin & Supplement', 'unit_type' => 'Tablets', 'unit_price' => 80.00, 'stock_quantity' => 400, 'low_stock_threshold' => 40],
            ['name' => 'Ferrous Sulphate 200mg', 'category' => 'Vitamin & Supplement', 'unit_type' => 'Tablets', 'unit_price' => 100.00, 'stock_quantity' => 500, 'low_stock_threshold' => 50, 'description' => 'Iron supplement for anaemia'],
            ['name' => 'Vitamin B Complex', 'category' => 'Vitamin & Supplement', 'unit_type' => 'Tablets', 'unit_price' => 150.00, 'stock_quantity' => 400, 'low_stock_threshold' => 40],
            ['name' => 'Calcium + Vitamin D3', 'category' => 'Vitamin & Supplement', 'unit_type' => 'Tablets', 'unit_price' => 300.00, 'stock_quantity' => 250, 'low_stock_threshold' => 25],
            ['name' => 'Zinc Sulphate 20mg', 'category' => 'Vitamin & Supplement', 'unit_type' => 'Tablets', 'unit_price' => 100.00, 'stock_quantity' => 350, 'low_stock_threshold' => 35],

            // ── CARDIOVASCULAR ────────────────────────────────────────────
            ['name' => 'Atorvastatin 20mg', 'category' => 'Cardiovascular', 'unit_type' => 'Tablets', 'unit_price' => 400.00, 'stock_quantity' => 200, 'low_stock_threshold' => 20],
            ['name' => 'Digoxin 0.25mg', 'category' => 'Cardiovascular', 'unit_type' => 'Tablets', 'unit_price' => 250.00, 'stock_quantity' => 150, 'low_stock_threshold' => 15],
            ['name' => 'Clopidogrel 75mg', 'category' => 'Cardiovascular', 'unit_type' => 'Tablets', 'unit_price' => 500.00, 'stock_quantity' => 5, 'low_stock_threshold' => 20],

            // ── RESPIRATORY ───────────────────────────────────────────────
            ['name' => 'Salbutamol Inhaler 100mcg', 'category' => 'Respiratory', 'unit_type' => 'Inhaler', 'unit_price' => 2500.00, 'stock_quantity' => 80, 'low_stock_threshold' => 10, 'description' => 'Reliever inhaler for asthma/COPD'],
            ['name' => 'Prednisolone 5mg', 'category' => 'Respiratory', 'unit_type' => 'Tablets', 'unit_price' => 150.00, 'stock_quantity' => 300, 'low_stock_threshold' => 30],
            ['name' => 'Aminophylline 100mg', 'category' => 'Respiratory', 'unit_type' => 'Tablets', 'unit_price' => 180.00, 'stock_quantity' => 200, 'low_stock_threshold' => 20],

            // ── NEUROLOGICAL ──────────────────────────────────────────────
            ['name' => 'Diazepam 5mg', 'category' => 'Neurological', 'unit_type' => 'Tablets', 'unit_price' => 200.00, 'stock_quantity' => 150, 'low_stock_threshold' => 15, 'description' => 'Controlled substance'],
            ['name' => 'Phenytoin 100mg', 'category' => 'Neurological', 'unit_type' => 'Capsules', 'unit_price' => 220.00, 'stock_quantity' => 180, 'low_stock_threshold' => 20, 'description' => 'Anticonvulsant'],
            ['name' => 'Amitriptyline 25mg', 'category' => 'Neurological', 'unit_type' => 'Tablets', 'unit_price' => 180.00, 'stock_quantity' => 200, 'low_stock_threshold' => 20],
        ];

        // Add timestamps and description default
        $drugs = array_map(function ($drug) use ($now) {
            return array_merge([
                'description'  => null,
                'created_at'   => $now,
                'updated_at'   => $now,
            ], $drug);
        }, $drugs);

        // Insert all at once
        DB::table('drugs')->insert($drugs);

        $this->command->info('✅ ' . count($drugs) . ' drugs seeded successfully.');
    }
}
