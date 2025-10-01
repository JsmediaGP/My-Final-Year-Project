<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Attendance Report</title>
    <style>
        body { font-family: Arial, sans-serif; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        table, th, td { border: 1px solid black; }
        th, td { padding: 8px; text-align: left; }
        th { background: #f0f0f0; }
    </style>
</head>
<body>
    <h2>Attendance Report</h2>
    <table>
        <thead>
            <tr>
                <th>Matric Number</th>
                <th>Student Name</th>
                <th>Course Title</th>
                <th>Day</th>
                <th>Date</th>
            </tr>
        </thead>
        <tbody>
            @foreach($records as $record)
                <tr>
                    <td>{{ $record->student->matric_number }}</td>
                    <td>{{ $record->student->name }}</td>
                    <td>{{ $record->schedule->course->course_title }}</td>
                    <td>{{ $record->schedule->day }}</td>
                    <td>{{ $record->date }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
