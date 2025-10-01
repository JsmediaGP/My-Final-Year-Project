<!DOCTYPE html>
<html>
<head>
    <title>Attendance Report</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #000; padding: 6px; text-align: left; }
        th { background: #eee; }
    </style>
</head>
<body>
    <h3>Attendance Report</h3>
    <table>
        <thead>
            <tr>
                <th>Matric No</th>
                <th>Name</th>
                <th>Course</th>
                <th>Day</th>
                <th>Date</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
        @foreach ($attendance as $record)
            <tr>
                <td>{{ $record->student->matric_number }}</td>
                <td>{{ $record->student->name }}</td>
                <td>{{ $record->schedule->course->course_code }} - {{ $record->schedule->course->course_title }}</td>
                <td>{{ $record->schedule->day }}</td>
                <td>{{ $record->date }}</td>
                <td>{{ $record->status }}</td>
            </tr>
        @endforeach
        </tbody>
    </table>
</body>
</html>
