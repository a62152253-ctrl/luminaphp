<?php
/**
 * WordBase50k — Polish Word Frequency Database
 * Manages the 50k most common Polish words from the NKJP corpus
 * Provides fast lookup and prefix search capabilities
 */

declare(strict_types=1);

class WordBase50k
{
    private string $dataPath;
    private array $words = [];
    private bool $loaded = false;

    public function __construct(?string $dataPath = null)
    {
        $this->dataPath = $dataPath ?? __DIR__ . '/../data/pl_50k.txt';
    }

    /**
     * Load word frequency data from file
     */
    public function load(): bool
    {
        if ($this->loaded) {
            return true;
        }

        if (!file_exists($this->dataPath)) {
            return false;
        }

        $lines = file($this->dataPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        
        foreach ($lines as $line) {
            $parts = preg_split('/\s+/', trim($line));
            if (count($parts) >= 2 && preg_match('/^\p{L}+$/u', $parts[0])) {
                $word = mb_strtolower($parts[0]);
                $freq = (int)$parts[1];
                $this->words[$word] = $freq;
            }
        }

        // Sort by frequency (descending) for prefix search
        arsort($this->words);
        $this->loaded = true;
        
        return true;
    }

    /**
     * Get frequency of a specific word
     */
    public function getFrequency(string $word): int
    {
        if (!$this->loaded) {
            $this->load();
        }
        
        $normalized = mb_strtolower(trim($word));
        return $this->words[$normalized] ?? 0;
    }

    /**
     * Check if a word exists in the database
     */
    public function exists(string $word): bool
    {
        return $this->getFrequency($word) > 0;
    }

    /**
     * Search for words by prefix, ordered by frequency
     */
    public function searchByPrefix(string $prefix, int $limit = 20): array
    {
        if (!$this->loaded) {
            $this->load();
        }

        $prefix = mb_strtolower(trim($prefix));
        if ($prefix === '') {
            return [];
        }

        $results = [];
        $count = 0;

        foreach ($this->words as $word => $freq) {
            if (str_starts_with($word, $prefix)) {
                $results[] = ['word' => $word, 'freq' => $freq];
                $count++;
                if ($count >= $limit) {
                    break;
                }
            }
        }

        return $results;
    }

    /**
     * Get total number of words in database
     */
    public function count(): int
    {
        if (!$this->loaded) {
            $this->load();
        }
        
        return count($this->words);
    }

    /**
     * Get all words (use with caution - large array)
     */
    public function getAll(): array
    {
        if (!$this->loaded) {
            $this->load();
        }
        
        return $this->words;
    }

    /**
     * Check if database is loaded
     */
    public function isLoaded(): bool
    {
        return $this->loaded;
    }

    /**
     * Get data file path
     */
    public function getDataPath(): string
    {
        return $this->dataPath;
    }

    /**
     * Words at or above a corpus frequency (for dynamic stop-word filtering).
     *
     * @return list<string>
     */
    public function getWordsAboveFrequency(int $minFreq): array
    {
        if (!$this->loaded) {
            $this->load();
        }

        $stop = [];
        foreach ($this->words as $word => $freq) {
            if ($freq >= $minFreq) {
                $stop[] = $word;
            }
        }

        return $stop;
    }

    /**
     * Suggest closest corpus word (typo correction via prefix + Levenshtein).
     */
    public function suggestCorrection(string $word, int $maxDist = 2): ?string
    {
        if (!$this->loaded) {
            $this->load();
        }

        $word = mb_strtolower(trim($word));
        if ($word === '' || mb_strlen($word) < 3) {
            return null;
        }
        if ($this->exists($word)) {
            return $word;
        }

        $prefixLen = min(3, mb_strlen($word));
        $prefix    = mb_substr($word, 0, $prefixLen);
        $candidates = $this->searchByPrefix($prefix, 50);

        $best     = null;
        $bestDist = $maxDist + 1;

        foreach ($candidates as $c) {
            $candidate = $c['word'];
            $dist      = levenshtein($word, $candidate);
            if ($dist < $bestDist) {
                $bestDist = $dist;
                $best     = $candidate;
            }
        }

        return ($best !== null && $bestDist <= $maxDist) ? $best : null;
    }

    /**
     * Correct all tokens in a phrase; returns fixed text + change map.
     *
     * @return array{text: string, fixes: array<string, string>}
     */
    public function correctText(string $text, int $maxDist = 2): array
    {
        $tokens = preg_split('/\s+/u', mb_strtolower(trim($text)), -1, PREG_SPLIT_NO_EMPTY);
        $fixes  = [];
        $out    = [];

        foreach ($tokens as $token) {
            if (!preg_match('/^\p{L}{2,}$/u', $token)) {
                $out[] = $token;
                continue;
            }
            $fixed = $this->suggestCorrection($token, $maxDist);
            if ($fixed !== null && $fixed !== $token) {
                $fixes[$token] = $fixed;
                $out[] = $fixed;
            } else {
                $out[] = $token;
            }
        }

        return ['text' => implode(' ', $out), 'fixes' => $fixes];
    }
}
