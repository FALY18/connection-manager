<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Customer extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;
    protected $fillable = ['username', 'mac_address', 'last_ip'];

    protected static function booted()
    {
        static::creating(function ($model) {
            $model->id = Str::uuid();
        });
    }

    public function sessions()
    {
        return $this->hasMany(Session::class);
    }
}
