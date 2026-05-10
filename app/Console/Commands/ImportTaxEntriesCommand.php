<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ImportTaxEntriesCommand extends Command
{
    protected $signature = 'taxes:import
                            {--source=ajpes : Data source (ajpes)}
                            {--file= : Path to local CSV file (skips download)}
                            {--limit=0 : Limit rows imported, 0 = all (for testing)}
                            {--dry-run : Parse without writing to database}';

    protected $description = 'Import tax entries from AJPES Poslovni register (podatki.gov.si)';

    // CKAN package ID on podatki.gov.si
    private const CKAN_API = 'https://podatki.gov.si/api/3/action/package_show?id=poslovni-register-slovenije';

    // Fallback direct URL (discovered from CKAN)
    private const FALLBACK_CSV_URL = 'https://podatki.gov.si/dataset/9ee1a9aa-c224-4995-b2ad-3760d7af0748/resource/beb70929-3d0d-41c6-9af2-25d525d906d3/download/opsiprs.csv';

    // CSV column names (case-insensitive match)
    private const COL_MAP = [
        'tax'         => ['davčna številka', 'davcna stevilka', 'st_davcna', 'davcna_stevilka'],
        'reg'         => ['matična številka', 'maticna stevilka'],
        'name'        => ['popolno ime', 'popolno_ime', 'naziv', 'dolgi_naziv', 'dolgi naziv'],
        'name_short'  => ['kratko ime', 'kratko_ime', 'kratki_naziv', 'kratki naziv'],
        'street'      => ['ulica'],
        'house_no'    => ['hišna št', 'hišna št.', 'hisna_stevilka', 'hisna stevilka'],
        'zip'         => ['poštna št', 'poštna št.', 'postna_stevilka', 'postna stevilka'],
        'city'        => ['pošta', 'postni_kraj', 'postni kraj'],
    ];

    private const BATCH_SIZE = 2000;

    public function handle(): int
    {
        $this->info('AJPES tax entries import started.');

        $localFile = $this->option('file');
        $dryRun    = $this->option('dry-run');
        $limit     = (int) $this->option('limit');

        if ($localFile) {
            if (!file_exists($localFile)) {
                $this->error("File not found: {$localFile}");
                return self::FAILURE;
            }
            $this->info("Using local file: {$localFile}");
            return $this->importFromFile($localFile, $dryRun, $limit);
        }

        // Discover download URL via CKAN API
        $csvUrl = $this->discoverCsvUrl();
        if (!$csvUrl) {
            $this->warn('CKAN API discovery failed, using fallback URL.');
            $csvUrl = self::FALLBACK_CSV_URL;
        }

        $this->info("Downloading: {$csvUrl}");

        // Download to temp file (streaming to handle 126 MB)
        $tmpPath = sys_get_temp_dir() . '/ajpes_prs_' . date('Ymd') . '.csv';

        if (!$this->downloadFile($csvUrl, $tmpPath)) {
            return self::FAILURE;
        }

        $result = $this->importFromFile($tmpPath, $dryRun, $limit);

        @unlink($tmpPath);

        return $result;
    }

    private function discoverCsvUrl(): ?string
    {
        try {
            $response = Http::timeout(15)->get(self::CKAN_API);
            if (!$response->successful()) {
                return null;
            }

            $resources = $response->json('result.resources', []);
            foreach ($resources as $resource) {
                $format = strtoupper($resource['format'] ?? '');
                $name   = strtolower($resource['name'] ?? '');
                if ($format === 'CSV' && str_contains($name, 'poslovni')) {
                    return $resource['url'];
                }
            }

            // Any CSV resource
            foreach ($resources as $resource) {
                if (strtoupper($resource['format'] ?? '') === 'CSV') {
                    return $resource['url'];
                }
            }
        } catch (\Throwable $e) {
            Log::warning('ImportTaxEntries: CKAN discovery failed', ['error' => $e->getMessage()]);
        }

        return null;
    }

    private function downloadFile(string $url, string $dest): bool
    {
        $client = new \GuzzleHttp\Client([
            'timeout'         => 0,       // no overall timeout for large files
            'connect_timeout' => 30,
            'allow_redirects' => true,
            'curl'            => [
                CURLOPT_IGNORE_CONTENT_LENGTH => true,  // ignore mismatch on compressed transfers
                CURLOPT_FOLLOWLOCATION        => true,
                CURLOPT_MAXREDIRS             => 5,
            ],
        ]);

        try {
            // Stream response to avoid loading 126 MB into memory
            $response = $client->request('GET', $url, [
                'stream'         => true,
                'decode_content' => true,
            ]);

            if ($response->getStatusCode() !== 200) {
                $this->error('Download failed: HTTP ' . $response->getStatusCode());
                return false;
            }

            $fp   = fopen($dest, 'wb');
            $body = $response->getBody();
            $read = 0;

            while (!$body->eof()) {
                $chunk = $body->read(65536); // 64 KB chunks
                if ($chunk === '') break;
                fwrite($fp, $chunk);
                $read += \strlen($chunk);
            }

            fclose($fp);
            $body->close();

        } catch (\Throwable $e) {
            @unlink($dest);
            $this->error('Download error: ' . $e->getMessage());
            return false;
        }

        if (!file_exists($dest) || filesize($dest) < 1024) {
            $this->error('Downloaded file is empty or too small.');
            return false;
        }

        $this->info(\sprintf('Downloaded: %.1f MB', filesize($dest) / 1024 / 1024));
        return true;
    }

    /**
     * Convert a UTF-16 LE file (with or without BOM) to a UTF-8 temp file.
     * Reads in 128 KB chunks (always even byte count to avoid splitting surrogate pairs).
     * Returns the path to the UTF-8 temp file; caller must unlink it.
     */
    private function convertUtf16LeToUtf8(string $srcPath): string
    {
        $src  = fopen($srcPath, 'rb');
        $dest = sys_get_temp_dir() . '/ajpes_utf8_' . date('Ymd_His') . '.csv';
        $fp   = fopen($dest, 'wb');

        // Skip the 2-byte BOM if present
        $bom = fread($src, 2);
        if ($bom !== "\xFF\xFE") {
            rewind($src);
        }

        while (!feof($src)) {
            $chunk = fread($src, 131072); // 128 KB — always even
            if ($chunk === '' || $chunk === false) break;
            // Ensure even byte count so mb_convert_encoding doesn't drop a half-char
            if (\strlen($chunk) % 2 !== 0) {
                $extra = fread($src, 1);
                $chunk .= ($extra !== false ? $extra : "\x00");
            }
            fwrite($fp, mb_convert_encoding($chunk, 'UTF-8', 'UTF-16LE'));
        }

        fclose($src);
        fclose($fp);

        return $dest;
    }

    private function importFromFile(string $path, bool $dryRun, int $limit): int
    {
        // Detect encoding by reading the first 3 bytes
        $probe = file_get_contents($path, false, null, 0, 3);
        $utf8Tmp = null;

        if ($probe !== false && substr($probe, 0, 2) === "\xFF\xFE") {
            $this->info('Detected UTF-16 LE encoding — converting to UTF-8…');
            $utf8Tmp = $this->convertUtf16LeToUtf8($path);
            $this->info(sprintf('Converted: %.1f MB → %.1f MB', filesize($path) / 1024 / 1024, filesize($utf8Tmp) / 1024 / 1024));
            $parsePath = $utf8Tmp;
        } else {
            $parsePath = $path;
        }

        $fp = fopen($parsePath, 'r');
        if (!$fp) {
            $this->error("Cannot open file: {$parsePath}");
            if ($utf8Tmp) @unlink($utf8Tmp);
            return self::FAILURE;
        }

        // Strip UTF-8 BOM if present (converted file may have one)
        $bom = fread($fp, 3);
        if ($bom !== "\xEF\xBB\xBF") {
            rewind($fp);
        }

        // Detect delimiter from the header line
        $firstLine = fgets($fp);
        rewind($fp);
        if ($bom === "\xEF\xBB\xBF") {
            fseek($fp, 3);
        }
        $delimiter = (substr_count($firstLine, ';') >= substr_count($firstLine, ',')) ? ';' : ',';
        $this->info("Detected delimiter: '{$delimiter}'");

        // Read header row
        $rawHeader = fgetcsv($fp, 0, $delimiter);
        if (!$rawHeader) {
            $this->error('Could not read CSV header row.');
            fclose($fp);
            if ($utf8Tmp) @unlink($utf8Tmp);
            return self::FAILURE;
        }

        $header = array_map(fn($h) => mb_strtolower(trim($h)), $rawHeader);
        $this->info('Header columns (' . count($header) . '): ' . implode(', ', $header));

        // Map column names to indexes
        $idx = $this->resolveColumnIndexes($header);

        if ($idx['name'] === null) {
            $this->error('Required column (name) not found in CSV header.');
            fclose($fp);
            if ($utf8Tmp) @unlink($utf8Tmp);
            return self::FAILURE;
        }

        $this->info(sprintf(
            'Column mapping — name: %d, tax: %s, reg: %s, street: %s, zip: %s, city: %s',
            $idx['name'],
            $idx['tax'] ?? '—', $idx['reg'] ?? '—',
            $idx['street'] ?? '—', $idx['zip'] ?? '—', $idx['city'] ?? '—'
        ));

        // Upsert strategy: conflict on registration_number, update address/name fields,
        // but never overwrite tax_number (once populated via INETIS it stays).

        $batch   = [];
        $total   = 0;
        $skipped = 0;
        $now     = now()->toDateTimeString();

        $bar = $this->output->createProgressBar();
        $bar->setFormat(' %current% rows [%bar%] %elapsed:6s% %memory:6s%');
        $bar->start();

        while (($row = fgetcsv($fp, 0, $delimiter)) !== false) {
            $name = trim($row[$idx['name']] ?? '');

            if ($name === '') {
                $skipped++;
                continue;
            }

            $tax = $this->col($row, $idx, 'tax');
            if ($tax !== '') {
                $tax = preg_replace('/^SI/i', '', $tax);
                $tax = preg_replace('/\s+/', '', $tax);
            }

            $reg = $this->col($row, $idx, 'reg');
            if ($reg !== '') {
                $reg = preg_replace('/\s+/', '', $reg);
            }

            $street  = $this->col($row, $idx, 'street');
            $houseNo = $this->col($row, $idx, 'house_no');
            $fullStreet = trim($street . ($houseNo ? ' ' . $houseNo : ''));

            $batch[] = [
                'tax_number'          => $tax ?: null,
                'registration_number' => mb_substr($reg, 0, 20) ?: null,
                'name'                => mb_substr($name, 0, 500),
                'name_short'          => mb_substr($this->col($row, $idx, 'name_short'), 0, 255) ?: null,
                'street'              => mb_substr($fullStreet, 0, 255) ?: null,
                'zip_code'            => mb_substr($this->col($row, $idx, 'zip'), 0, 10) ?: null,
                'city'                => mb_substr($this->col($row, $idx, 'city'), 0, 100) ?: null,
                'source'              => 'ajpes',
                'imported_at'         => $now,
                'created_at'          => $now,
                'updated_at'          => $now,
            ];

            $total++;
            $bar->advance();

            if (count($batch) >= self::BATCH_SIZE) {
                if (!$dryRun) {
                    $this->upsertBatch($batch);
                }
                $batch = [];
            }

            if ($limit > 0 && $total >= $limit) {
                break;
            }
        }

        if (!empty($batch) && !$dryRun) {
            $this->upsertBatch($batch);
        }

        $bar->finish();
        fclose($fp);
        if ($utf8Tmp) @unlink($utf8Tmp);

        $this->newLine();
        $this->info(sprintf(
            'Done. Imported: %s rows, Skipped: %s, Dry-run: %s',
            number_format($total),
            number_format($skipped),
            $dryRun ? 'yes' : 'no'
        ));

        return self::SUCCESS;
    }

    private function upsertBatch(array $batch): void
    {
        // Rows with a registration_number: upsert — update address/name, preserve tax_number.
        // Rows without: plain insert (shouldn't happen with AJPES data, but handled safely).
        $withReg    = array_filter($batch, fn($r) => $r['registration_number'] !== null);
        $withoutReg = array_filter($batch, fn($r) => $r['registration_number'] === null);

        if ($withReg) {
            DB::table('tax_entries')->upsert(
                array_values($withReg),
                ['registration_number'],
                ['name', 'name_short', 'street', 'zip_code', 'city', 'source', 'imported_at', 'updated_at']
            );
        }

        if ($withoutReg) {
            DB::table('tax_entries')->insertOrIgnore(array_values($withoutReg));
        }
    }

    private function resolveColumnIndexes(array $header): array
    {
        $idx = ['tax' => null, 'reg' => null, 'name' => null, 'name_short' => null, 'street' => null, 'house_no' => null, 'zip' => null, 'city' => null];

        foreach ($idx as $key => $_) {
            $candidates = self::COL_MAP[$key] ?? [];
            foreach ($candidates as $candidate) {
                $pos = array_search($candidate, $header, true);
                if ($pos !== false) {
                    $idx[$key] = $pos;
                    break;
                }
            }
        }

        return $idx;
    }

    private function col(array $row, array $idx, string $key): string
    {
        $i = $idx[$key] ?? null;
        return $i !== null ? trim($row[$i] ?? '') : '';
    }
}
