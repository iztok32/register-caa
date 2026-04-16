<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use App\Models\Aircraft;
use Carbon\Carbon;

#[Signature('app:import-aircraft')]
#[Description('Import aircraft register from EMPIC XML file (tip_1.txt)')]
class ImportAircraftCommand extends Command
{
    /**
     * Execute the console command.
     */
    public function handle()
    {
        $filename = 'tip_1.txt';
        $path = storage_path('app/public/' . $filename);

        if (!file_exists($path)) {
            $this->error("File not found at: {$path}");
            return;
        }

        $xmlString = file_get_contents($path);
        $xmlString = str_replace(['soap:', 'xmlns="http://www.empic.aero/ns/empic-eap/2014-03-24/v2/qs"'], '', $xmlString);
        $xml = simplexml_load_string($xmlString);

        if (!$xml) {
            $this->error("Failed to parse XML file.");
            return;
        }

        $rows = $xml->Body->result->row;
        
        if (!$rows) {
            $this->error("No rows found.");
            return;
        }

        $count = 0;
        foreach ($rows as $row) {
            $data = [];
            foreach ($row->column as $col) {
                $idx = (string)$col['col-idx'];
                $val = trim((string)$col);
                $data[$idx] = $val === '' ? null : $val;
            }
            
            foreach ($row->{'column-catalog'} as $col) {
                $idx = (string)$col['col-idx'];
                $val = null;
                // fallback to English for status if SL is not found
                foreach ($col->{'lang-value'} as $langVal) {
                    if ((string)$langVal['lang'] === 'en') {
                        $val = (string)$langVal;
                    }
                }
                if (!$val && isset($col->{'lang-value'}[0])) {
                    $val = (string)$col->{'lang-value'}[0];
                }
                $data[$idx] = $val;
            }

            // Columns matching:
            // 1: ID
            // 2: Registration Mark
            // 3: Status
            // 4: Registered on
            // 5: Deregistered on
            // 6: Manufacturer
            // 7: Type
            // 8: Serial No.
            // 9: Construction Year
            // 10: COUNT OF Number of Active Mortgages

            $parseDate = function ($dateStr) {
                return $dateStr ? Carbon::parse($dateStr)->format('Y-m-d H:i:s') : null;
            };

            Aircraft::updateOrCreate(
                ['empic_id' => $data[1]],
                [
                    'registration_mark' => $data[2] ?? null,
                    'status' => $data[3] ?? null,
                    'registered_on' => $parseDate($data[4] ?? null),
                    'deregistered_on' => $parseDate($data[5] ?? null),
                    'manufacturer' => $data[6] ?? null,
                    'type' => $data[7] ?? null,
                    'serial_number' => $data[8] ?? null,
                    'construction_year' => isset($data[9]) ? (int)$data[9] : null,
                    'active_mortgages' => isset($data[10]) ? (int)$data[10] : 0,
                ]
            );
            $count++;
        }

        $this->info("Imported {$count} aircraft successfully.");
    }
}
