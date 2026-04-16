<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use App\Models\AircraftOwner;
use Carbon\Carbon;

#[Signature('app:import-aircraft-owners')]
#[Description('Import aircraft owners relationships from EMPIC XML file (tip_2.txt)')]
class ImportAircraftOwnersCommand extends Command
{
    /**
     * Execute the console command.
     */
    public function handle()
    {
        $filename = 'tip_2.txt';
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
                foreach ($col->{'lang-value'} as $langVal) {
                    if ((string)$langVal['lang'] === 'sl') {
                        $val = (string)$langVal;
                    }
                }
                if (!$val && isset($col->{'lang-value'}[0])) {
                    $val = (string)$col->{'lang-value'}[0];
                }
                $data[$idx] = $val;
            }

            // Columns matching:
            // 1: Registration ID
            // 2: Owner/Operator Type
            // 3: Closed (true/false)
            // 4: Start Date
            // 5: End Date
            // 6: Operator since
            // 7: Owner since
            // 8: Value [%]
            // 9: Person ID

            $parseDate = function ($dateStr) {
                return $dateStr ? Carbon::parse($dateStr)->format('Y-m-d H:i:s') : null;
            };

            AircraftOwner::create([
                'aircraft_registration_id' => $data[1] ?? null,
                'role' => $data[2] ?? null,
                'is_closed' => ($data[3] ?? 'false') === 'true',
                'start_date' => $parseDate($data[4] ?? null),
                'end_date' => $parseDate($data[5] ?? null),
                'operator_since' => $parseDate($data[6] ?? null),
                'owner_since' => $parseDate($data[7] ?? null),
                'ownership_percentage' => isset($data[8]) ? (float)$data[8] : null,
                'owner_empic_id' => $data[9] ?? null,
            ]);
            $count++;
        }

        $this->info("Imported {$count} aircraft owners relationships successfully.");
    }
}
