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
    public function handle()
    {
        $this->info('Refreshing Aircraft Search Index...');

        $aircrafts = Aircraft::with(['aircraftOwners.owner'])->get();

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
                if (!$rel->owner) {
                    continue;
                }

                $owner = $rel->owner;

                $name = $owner->organisation_name
                    ? ($owner->organisation_name2
                        ? "{$owner->organisation_name} / {$owner->organisation_name2}"
                        : $owner->organisation_name)
                    : trim("{$owner->person_last_name} {$owner->person_first_name}");

                $ownerType = $owner->organisation_name ? 'organisation' : 'person';

                $role = strtolower($rel->role ?? '');
                $effectiveStart = str_contains($role, 'operator')
                    ? ($rel->operator_since ?? $rel->start_date)
                    : ($rel->owner_since ?? $rel->start_date);

                $ownersJson[] = [
                    'role'                 => $rel->role,
                    'is_closed'            => $rel->is_closed,
                    'name'                 => $name,
                    'type'                 => $ownerType,
                    'effective_start'      => $effectiveStart?->format('Y-m-d'),
                    'end_date'             => $rel->end_date?->format('Y-m-d'),
                    'ownership_percentage' => $rel->ownership_percentage,
                    'owner_empic_id'       => $owner->empic_id,
                ];

                $searchTextParts[] = $name;
                $searchTextParts[] = $rel->role;
            }

            AircraftSearchIndex::create([
                'empic_id'          => $aircraft->empic_id,
                'registration_mark' => $aircraft->registration_mark,
                'manufacturer'      => $aircraft->manufacturer,
                'type'              => $aircraft->type,
                'serial_number'     => $aircraft->serial_number,
                'status'            => $aircraft->status,
                'current_owners'    => $ownersJson,
                'search_text'       => mb_strtolower(implode(' ', array_filter(array_unique($searchTextParts)))),
            ]);

            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info('Done.');
    }
}
