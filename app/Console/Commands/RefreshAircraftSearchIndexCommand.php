<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use App\Models\Aircraft;
use App\Models\AircraftSearchIndex;

#[Signature('app:refresh-aircraft-search-index')]
#[Description('Refresh the aircraft_search_indices table for fast unified search/listing')]
class RefreshAircraftSearchIndexCommand extends Command
{
    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Refreshing Aircraft Search Index...');

        $aircrafts = Aircraft::with(['aircraftOwners' => function($query) {
            // We want mostly active, but for broader search maybe all.
            // Let's take all to allow historical search, or just active ones for now.
            // Since a search index typically searches current active ones, let's include all 
            // but structure the json to indicate active ones. We'll just include all for maximum searchability.
            $query->with('owner');
        }])->get();

        $bar = $this->output->createProgressBar(count($aircrafts));
        $bar->start();

        AircraftSearchIndex::truncate();

        foreach ($aircrafts as $aircraft) {
            $ownersJson = [];
            $searchTextParts = [
                $aircraft->registration_mark,
                $aircraft->manufacturer,
                $aircraft->type,
                $aircraft->serial_number,
                $aircraft->status,
            ];

            foreach ($aircraft->aircraftOwners as $rel) {
                if ($rel->owner) {
                    $ownerName = $rel->owner->type === 'Organisation' 
                        ? $rel->owner->org_name_slovenian 
                        : trim("{$rel->owner->person_title} {$rel->owner->person_name} {$rel->owner->person_surname}");
                    
                    $ownersJson[] = [
                        'role' => $rel->role,
                        'is_closed' => $rel->is_closed,
                        'name' => $ownerName,
                        'type' => $rel->owner->type,
                    ];

                    $searchTextParts[] = $ownerName;
                    $searchTextParts[] = $rel->role;
                }
            }

            $uniqueSearchText = implode(' ', array_filter(array_unique($searchTextParts)));

            AircraftSearchIndex::create([
                'empic_id' => $aircraft->empic_id,
                'registration_mark' => $aircraft->registration_mark,
                'manufacturer' => $aircraft->manufacturer,
                'type' => $aircraft->type,
                'serial_number' => $aircraft->serial_number,
                'status' => $aircraft->status,
                'current_owners' => $ownersJson,
                'search_text' => mb_strtolower($uniqueSearchText),
            ]);

            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info('Aircraft search index refreshed successfully!');
    }
}
