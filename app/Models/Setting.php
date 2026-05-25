<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $primaryKey = 'key';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = ['key', 'type', 'value', 'group'];

    private static array $cache = [];

    public static function get(string $key, mixed $default = null): mixed
    {
        if (!array_key_exists($key, static::$cache)) {
            $setting = static::find($key);
            static::$cache[$key] = $setting ? $setting->value : $default;
        }

        return static::$cache[$key];
    }

    public static function getBool(string $key, bool $default = false): bool
    {
        $value = static::get($key, $default ? '1' : '0');
        return filter_var($value, FILTER_VALIDATE_BOOLEAN);
    }

    public static function set(string $key, mixed $value): void
    {
        static::where('key', $key)->update(['value' => (string) $value, 'updated_at' => now()]);
        unset(static::$cache[$key]);
    }
}
