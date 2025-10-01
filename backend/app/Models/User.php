<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Facades\Storage;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
   protected $fillable = [
        'first_name', 'last_name', 'matric_number', 'rfid_uid', 'email', 'password', 'role', 'picture',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // Relationships
    public function courses()
    {
        return $this->hasMany(Course::class, 'lecturer_id');
    }

    public function registeredCourses()
    {
        return $this->belongsToMany(Course::class, 'course_registrations', 'student_id', 'course_id');
    }

    public function attendances()
    {
        return $this->hasMany(Attendance::class, 'student_id');
    }

    protected $appends = ['picture_url'];

    public function getPictureUrlAttribute()
    {
         if ($this->picture) {
            return Storage::url($this->picture);
        }

        return null;
    }       
    // return $this->picture ? Storage::url($this->picture) : null;

}
