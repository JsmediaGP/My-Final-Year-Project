document.addEventListener('DOMContentLoaded', function () {
    // Sidebar toggle for mobile
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function () {
            document.querySelector('.sidebar').classList.toggle('active');
        });
    }

    // Logout button
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            window.location.href = '../../index.html';
        });
    }
  
    
    const studentName = localStorage.getItem('student_name') || 'N/A';
    const matricNumber = localStorage.getItem('matric_number') || 'N/A';


    // Check for student role
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (!token || role.toLowerCase() !== 'student') {
        alert('Unauthorized access. Please log in as a student.');
        window.location.href = '../../index.html';
        return;
    }

    // Get table element
    const attendanceTable = document.querySelector('#attendance-table');

    // Debug: Log elements and token
    console.log('Attendance table element:', attendanceTable);
    console.log('Token:', token);
    console.log('API_BASE_URL:', API_BASE_URL || 'Not defined! Check config.js');

    // Show loading state
    if (attendanceTable) {
        attendanceTable.innerHTML = '<tr><td colspan="5" class="text-center">Loading...</td></tr>';
    } else {
        console.error('Attendance table not found in DOM');
    }

    // Fetch student's attendance
    function fetchAttendance(selectedCourse = null) {
        let url = `${API_BASE_URL}/student/attendance`;
       // Use dropdown selection first, fallback to query string
        if (selectedCourse) {
            url += `?course_code=${encodeURIComponent(selectedCourse)}`;
        } else {
            const params = new URLSearchParams(window.location.search);
            const courseCode = params.get('course_code');
            if (courseCode) {
                url += `?course_code=${encodeURIComponent(courseCode)}`;
            }
        }
        console.log('Fetching attendance from:', url);
        fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            signal: AbortSignal.timeout(5000)
        })
        .then(response => {
            console.log('Attendance response status:', response.status, 'Content-Type:', response.headers.get('content-type'));
            if (!response.ok) {
                return response.text().then(text => {
                    console.error('Attendance response text:', text.slice(0, 200));
                    throw new Error(HTTP `${response.status}: ${text.slice(0, 200)}`);
                });
            }
            if (!response.headers.get('content-type')?.includes('application/json')) {
                return response.text().then(text => {
                    console.error('Attendance non-JSON response:', text.slice(0, 200));
                    throw new Error('Received non-JSON response from /api/student/attendance');
                });
            }
            return response.json();
        })
        .then(data => {
            console.log('Attendance API Response:', data);
            if (data.message === 'Attendance fetched' && data.data && attendanceTable) {
                const attendance = data.data;
                if (attendance.length > 0) {
                    attendanceTable.innerHTML = attendance.map(record => `
                        <tr>
                            <td>${record.id || 'N/A'}</td>
                            <td>${record.class_schedule?.course?.course_title  || 'N/A'}</td>
                            <td>${record.class_schedule?.course?.course_code || 'N/A'}</td>
                            <td>${record.class_schedule?.hall?.hall_name || record.class_schedule?.hall_id || 'N/A'}</td>
                            <td>${record.date || 'N/A'}</td>
                            
                        </tr>
                    `).join('');
                } else {
                    attendanceTable.innerHTML = '<tr><td colspan="5" class="text-center">No attendance records found</td></tr>';
                }
            } else {
                console.error('Unexpected attendance response format:', data);
                if (attendanceTable) attendanceTable.innerHTML = '<tr><td colspan="5" class="text-center">Failed to load</td></tr>';
            }
        })
        .catch(error => {
            console.error('Attendance fetch error:', error.message);
            if (attendanceTable) attendanceTable.innerHTML = '<tr><td colspan="5" class="text-center">Failed to load: ' + error.message + '</td></tr>';
        });
    }

    // Fetch student's courses for filter dropdown
    function fetchCoursesForFilter() {
        const url = `${API_BASE_URL}/student/courses`;
        console.log('Fetching courses from:', url);

        fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            signal: AbortSignal.timeout(5000)
        })
        .then(response => {
            console.log('Courses response status:', response.status, 'Content-Type:', response.headers.get('content-type'));
            if (!response.ok) {
                return response.text().then(text => {
                    console.error('Courses response text:', text.slice(0, 200));
                    throw new Error(`${response.status}: ${text.slice(0, 200)}`);
                });
            }
            if (!response.headers.get('content-type')?.includes('application/json')) {
                return response.text().then(text => {
                    console.error('Courses non-JSON response:', text.slice(0, 200));
                    throw new Error('Received non-JSON response from /api/student/courses');
                });
            }
            return response.json();
        })
        .then(data => {
            console.log('Courses API Response:', data);
            const courseFilter = document.querySelector('#courseFilter');

            if (data.message === 'Courses fetched' && data.data && courseFilter) {
                const courses = data.data;

                // Reset filter options
                courseFilter.innerHTML = `<option value="">All Courses</option>`;

                if (courses.length > 0) {
                    courses.forEach(course => {
                        const option = document.createElement('option');
                        option.value = course.course_code;
                        option.textContent = `${course.course_code} - ${course.course_title}`;
                        courseFilter.appendChild(option);
                    });
                }
            } else {
                console.error('Unexpected courses response format:', data);
            }
        })
        .catch(error => {
            console.error('Courses fetch error:', error.message);
        });
    }

    
    
    // Export table to CSV
    function exportTableToCSV(studentName, matricNumber) {
        const courseFilter = document.querySelector("#courseFilter");
        let courseTitle = "All Courses";
        if (courseFilter && courseFilter.value) {
            courseTitle = courseFilter.options[courseFilter.selectedIndex].text;
        }

        // Table rows
        const rows = [...document.querySelectorAll("#attendance-table tr")].map(row =>
            [...row.querySelectorAll("td")].map(col => `"${col.innerText}"`)
        );

        // Add header info at the top
        const csvContent = [
            [`"Student Attendance Records"`],
            [`"Name: ${studentName}"`],
            [`"Matric Number: ${matricNumber}"`],
            [`"Course: ${courseTitle}"`],
            [""], // blank line before table
            ['"ID"', '"Course Title"', '"Course Code"', '"Hall"', '"Date"'],
            ...rows
        ].map(e => e.join(",")).join("\n");

        // Download CSV
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `attendance-${matricNumber}-${courseTitle.replace(/\s+/g, "_")}.csv`;
        link.click();
    }


    // Export table to PDF
    function exportTableToPDF(studentName, matricNumber) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Get course filter
        const courseFilter = document.querySelector("#courseFilter");
        let courseTitle = "All Courses";
        if (courseFilter && courseFilter.value) {
            courseTitle = courseFilter.options[courseFilter.selectedIndex].text;
        }

        // Header info
        doc.setFontSize(14);
        doc.text("Student Attendance Records", 14, 15);

        doc.setFontSize(11);
        doc.text(`Name: ${studentName}`, 14, 22);
        doc.text(`Matric Number: ${matricNumber}`, 14, 29);
        doc.text(`Course: ${courseTitle}`, 14, 36);

        // Collect table rows
        const head = [['ID', 'Course Title', 'Course Code', 'Hall', 'Date']];
        const body = [...document.querySelectorAll("#attendance-table tr")].map(row =>
            [...row.querySelectorAll("td")].map(col => col.innerText)
        );

        // AutoTable
        doc.autoTable({
            head: head,
            body: body,
            startY: 45
        });

        // Save file
        doc.save(`attendance-${matricNumber}-${courseTitle.replace(/\s+/g, "_")}.pdf`);
    }

    document.querySelector("#exportPDF").addEventListener("click", () => {
        exportTableToPDF(studentName, matricNumber);
    });

    document.querySelector("#exportCSV").addEventListener("click", () => {
        exportTableToCSV(studentName, matricNumber);
    });


    
    // // Attach to buttons
    // document.getElementById("exportCSV").addEventListener("click", () => {
    //     exportTableToCSV("attendance.csv");
    // });

    // document.getElementById("exportPDF").addEventListener("click", () => {
    //     exportTableToPDF();
    // });
    




    
    fetchCoursesForFilter();
    fetchAttendance();
  


   

    const courseFilter = document.querySelector('#courseFilter');
    if (courseFilter) {
        courseFilter.addEventListener('change', function () {
            fetchAttendance(this.value); // passes selected course code
        });
    }
});