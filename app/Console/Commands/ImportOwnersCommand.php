<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use App\Models\Owner;

#[Signature('app:import-owners')]
#[Description('Import owners from EMPIC XML file')]
class ImportOwnersCommand extends Command
{
    /**
     * Execute the console command.
     */
    public function handle()
    {
        $filename = 'tip_3.txt';
        $path = storage_path('app/public/' . $filename);

        if (!file_exists($path)) {
            $this->error("File not found at: {$path}");
            return;
        }

        $xmlString = file_get_contents($path);
        
        // Remove typical namespace prefixes to make standard simplexml parsing easier
        $xmlString = str_replace(['soap:', 'xmlns="http://www.empic.aero/ns/empic-eap/2014-03-24/v2/qs"'], '', $xmlString);
        $xml = simplexml_load_string($xmlString);

        if (!$xml) {
            $this->error("Failed to parse XML file.");
            return;
        }

        $rows = $xml->Body->result->row;
        
        if (!$rows) {
            $this->error("No rows found in the body->result->row path after removing namespaces.");
            return;
        }

        $count = 0;
        foreach ($rows as $row) {
            $data = [];
            foreach ($row->column as $col) {
                $idx = (string)$col['col-idx'];
                $val = trim((string)$col);
                
                // If it is empty, set to null
                $val = $val === '' ? null : $val;

                $data[$idx] = $val;
            }
            
            foreach ($row->{'column-catalog'} as $col) {
                $idx = (string)$col['col-idx'];
                
                // Get the sl language or fallback to en
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

            Owner::updateOrCreate(
                ['empic_id' => $data[1] ?? null],
                [
                    'person_last_name' => $data[2] ?? null,
                    'person_first_name' => $data[3] ?? null,
                    'person_trade_register_no' => $data[4] ?? null,
                    'person_street' => $data[5] ?? null,
                    'person_street_no' => $data[6] ?? null,
                    'person_city' => $data[7] ?? null,
                    'person_zip_code' => $data[8] ?? null,
                    'person_country' => $data[9] ?? null,
                    'person_address' => $data[10] ?? null,
                    
                    'organisation_name' => $data[11] ?? null,
                    'organisation_name2' => $data[12] ?? null,
                    'organisation_trade_register_no' => $data[13] ?? null,
                    'organisation_eu_vatin' => $data[14] ?? null,
                    'organisation_street' => $data[15] ?? null,
                    'organisation_street_no' => $data[16] ?? null,
                    'organisation_city' => $data[17] ?? null,
                    'organisation_zip_code' => $data[18] ?? null,
                    'organisation_country' => $data[19] ?? null,
                    'organisation_address' => $data[20] ?? null,
                    
                    'vatin' => $data[21] ?? null,
                ]
            );
            $count++;
        }

        $this->info("Imported/Updated {$count} owners successfully.");
    }
}
