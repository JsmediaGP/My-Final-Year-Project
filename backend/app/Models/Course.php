<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    protected $fillable = ['course_title', 'course_code', 'unit', 'lecturer_id'];

    // Relationships
    public function lecturer()
    {
        return $this->belongsTo(User::class, 'lecturer_id');
    }

    public function classSchedules()
    {
        return $this->hasMany(ClassSchedule::class);
    }

    public function students()
    {
        return $this->belongsToMany(User::class, 'course_registrations', 'course_id', 'student_id');
    }

 

    public function attendances()
    {
        return $this->hasManyThrough(Attendance::class, ClassSchedule::class);
    }
}
