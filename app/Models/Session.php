<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Session extends Model
{
    protected $table = 'wifi_sessions';
    protected $keyType = 'string';
    public $incrementing = false;
    protected $fillable = ['voucher_id', 'customer_id', 'username', 'ip_address', 'mac_address', 'started_at', 'ended_at', 'data_used_mb', 'status'];

    protected static function booted()
    {
        static::creating(function ($model) {
            $model->id = Str::uuid();
        });
    }

    public function voucher()
    {
        return $this->belongsTo(Voucher::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
}
