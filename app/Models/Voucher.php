<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Voucher extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;
    protected $fillable = ['code', 'plan_id', 'status', 'created_by', 'used_at', 'expires_at', 'activated_by_mac', 'activated_ip'];

    protected static function booted()
    {
        static::creating(function ($model) {
            $model->id = Str::uuid();
        });
    }

    public function plan()
    {
        return $this->belongsTo(Plan::class);
    }

    public function sessions()
    {
        return $this->hasMany(Session::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
