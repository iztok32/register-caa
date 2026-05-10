<?php

namespace App\Services;

use App\Models\TaxEntry;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class InetisService
{
    private const URL = 'https://ddv.inetis.com/iskalnik2.aspx';

    /**
     * Search by name or tax number.
     * Returns array of normalised results (max 20).
     * Caches any single-match results into tax_entries for future searches.
     */
    public function search(string $query): array
    {
        try {
            $response = Http::timeout(8)->get(self::URL, ['isci' => $query]);

            if (!$response->successful()) {
                return [];
            }

            $items = $response->json();
            if (!is_array($items) || empty($items)) {
                return [];
            }

            $results = array_map([$this, 'normalise'], array_slice($items, 0, 20));

            // Cache a single exact result back into tax_entries
            if (count($results) === 1) {
                $this->cache($results[0]);
            }

            return $results;
        } catch (\Throwable $e) {
            Log::warning('InetisService::search failed', ['query' => $query, 'error' => $e->getMessage()]);
            return [];
        }
    }

    /**
     * Look up a single tax number and cache it.
     */
    public function findByTaxNumber(string $taxNumber): ?array
    {
        // Strip SI prefix if present
        $clean = preg_replace('/^SI/i', '', trim($taxNumber));

        $results = $this->search($clean);
        foreach ($results as $r) {
            if ($r['tax_number'] === $clean || $r['tax_number'] === $taxNumber) {
                $this->cache($r);
                return $r;
            }
        }
        return null;
    }

    private function normalise(array $item): array
    {
        $tax = trim($item['DavcnaStevilka'] ?? '');
        $name = trim($item['Naziv'] ?? $item['NazivKratek'] ?? '');
        $rawAddress = trim($item['Naslov'] ?? '');

        [$street, $zip, $city] = $this->parseAddress($rawAddress);

        return [
            'tax_number'  => $tax,
            'name'        => $name,
            'name_short'  => trim($item['NazivKratek'] ?? ''),
            'street'      => $street,
            'zip_code'    => $zip,
            'city'        => $city,
            'source'      => 'inetis',
        ];
    }

    /**
     * Parse "Ulica 1, 1000 Ljubljana" → [street, zip, city]
     */
    private function parseAddress(string $address): array
    {
        if (empty($address)) {
            return ['', '', ''];
        }

        // Format: "Street name 12a, 1000 City Name"
        if (preg_match('/^(.*),\s*(\d{4})\s+(.+)$/', $address, $m)) {
            return [trim($m[1]), trim($m[2]), trim($m[3])];
        }

        // Fallback: everything in street
        return [trim($address), '', ''];
    }

    private function cache(array $data): void
    {
        if (empty($data['tax_number'])) {
            return;
        }
        try {
            TaxEntry::updateOrCreate(
                ['tax_number' => $data['tax_number']],
                [
                    'name'        => $data['name'],
                    'name_short'  => $data['name_short'] ?: null,
                    'street'      => $data['street'] ?: null,
                    'zip_code'    => $data['zip_code'] ?: null,
                    'city'        => $data['city'] ?: null,
                    'source'      => 'inetis',
                    'imported_at' => now(),
                ]
            );
        } catch (\Throwable) {
            // Non-critical, don't surface caching errors
        }
    }
}
