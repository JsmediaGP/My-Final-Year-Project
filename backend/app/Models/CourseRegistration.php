<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CourseRegistration extends Model
{
    protected $fillable = ['student_id', 'course_id'];

    // Relationships
    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }
}
