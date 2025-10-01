<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Hall extends Model
{
    protected $fillable = ['hall_name', 'capacity'];

    // Relationships
    public function classSchedules()
    {
        return $this->hasMany(ClassSchedule::class);
    }
}
