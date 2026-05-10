<?php

namespace App\Console\Commands;

use App\Services\InetisService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class FetchTaxNumbersCommand extends Command
{
    protected $signature = 'taxes:fetch-tax-numbers
                            {--limit=0        : Max entries to process, 0 = all}
                            {--sleep=350      : Milliseconds between INETIS requests}
                            {--min-score=82   : Minimum name similarity score (0-100) to accept a match}
                            {--dry-run        : Look up without writing to database}';

    protected $description = 'Fetch missing tax numbers from INETIS for AJPES entries';

    public function handle(InetisService $inetis): int
    {
        $limit    = (int) $this->option('limit');
        $sleep    = (int) $this->option('sleep');
        $minScore = (int) $this->option('min-score');
        $dryRun   = $this->option('dry-run');

        $total = DB::table('tax_entries')->whereNull('tax_number')->count();
        $this->info(sprintf('Entries without tax number: %s', number_format($total)));

        if ($limit > 0) {
            $this->info(sprintf('Processing up to %s entries.', number_format($limit)));
        }

        $query = DB::table('tax_entries')
            ->whereNull('tax_number')
            ->orderBy('id')
            ->select('id', 'name', 'registration_number');

        if ($limit > 0) {
            $query->limit($limit);
        }

        $bar = $this->output->createProgressBar($limit > 0 ? $limit : $total);
        $bar->setFormat(' %current%/%max% [%bar%] %percent:3s%% %elapsed:6s% | found: %message%');
        $bar->setMessage('0');
        $bar->start();

        $found   = 0;
        $skipped = 0;
        $errors  = 0;

        $query->each(function ($entry) use ($inetis, $sleep, $minScore, $dryRun, $bar, &$found, &$skipped, &$errors) {
            $results = $inetis->search($entry->name);

            $matched = $this->findBestMatch($entry->name, $results, $minScore);

            if ($matched) {
                if (!$dryRun) {
                    DB::table('tax_entries')
                        ->where('id', $entry->id)
                        ->update([
                            'tax_number'  => $matched['tax_number'],
                            'updated_at'  => now(),
                        ]);
                }
                $found++;
            } else {
                $skipped++;
            }

            $bar->setMessage((string) $found);
            $bar->advance();

            if ($sleep > 0) {
                usleep($sleep * 1000);
            }
        });

        $bar->finish();
        $this->newLine();

        $this->info(sprintf(
            'Done. Found: %s, No match: %s, Dry-run: %s',
            number_format($found),
            number_format($skipped),
            $dryRun ? 'yes' : 'no'
        ));

        return self::SUCCESS;
    }

    /**
     * Find the best INETIS result for the given name.
     * Returns the result array if similarity >= $minScore, null otherwise.
     */
    private function findBestMatch(string $name, array $results, int $minScore): ?array
    {
        if (empty($results)) {
            return null;
        }

        $normName = $this->normalizeName($name);
        $best     = null;
        $bestScore = 0;

        foreach ($results as $r) {
            if (empty($r['tax_number'])) {
                continue;
            }

            $normResult = $this->normalizeName($r['name'] ?? '');
            similar_text($normName, $normResult, $pct);

            if ($pct > $bestScore) {
                $bestScore = $pct;
                $best      = $r;
            }
        }

        return ($bestScore >= $minScore) ? $best : null;
    }

    private function normalizeName(string $name): string
    {
        $name = mb_strtolower($name);
        // Remove legal form suffixes common in Slovenian company names
        $name = preg_replace('/\b(d\.o\.o\.|s\.p\.|d\.d\.|z\.o\.o\.|k\.d\.|d\.n\.o\.)\b/u', '', $name);
        // Remove punctuation except spaces
        $name = preg_replace('/[^\p{L}\p{N}\s]/u', ' ', $name);
        // Collapse whitespace
        return trim(preg_replace('/\s+/', ' ', $name));
    }
}
