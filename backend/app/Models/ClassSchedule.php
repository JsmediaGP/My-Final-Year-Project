<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ClassSchedule extends Model
{
    protected $fillable = ['hall_id', 'course_id', 'start_time', 'end_time', 'day', 'status'];

    // Relationships
    public function hall()
    {
        return $this->belongsTo(Hall::class);
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }
}
