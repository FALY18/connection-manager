<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Plan extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;
    protected $fillable = ['name', 'duration_minutes', 'data_limit_gb', 'max_devices', 'price', 'is_active'];

    protected static function booted()
    {
        static::creating(function ($model) {
            $model->id = Str::uuid();
        });
    }

    public function vouchers()
    {
        return $this->hasMany(Voucher::class);
    }
}
