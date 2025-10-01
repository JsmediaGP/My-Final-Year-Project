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

    // Check for student role
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (!token || role.toLowerCase() !== 'student') {
        alert('Unauthorized access. Please log in as a student.');
        window.location.href = '../../index.html';
        return;
    }

    // Get table elements
    const coursesTable = document.querySelector('#courses-table');
    const todaySchedulesTable = document.querySelector('#today-schedules-table');

    // Debug: Log elements and token
    console.log('Courses table element:', coursesTable);
    console.log('Today schedules table element:', todaySchedulesTable);
    console.log('Token:', token);
    console.log('API_BASE_URL:', API_BASE_URL || 'Not defined! Check config.js');

    // Show loading state
    if (coursesTable) {
        coursesTable.innerHTML = '<tr><td colspan="5" class="text-center">Loading...</td></tr>';
    } else {
        console.error('Courses table not found in DOM');
    }
    if (todaySchedulesTable) {
        todaySchedulesTable.innerHTML = '<tr><td colspan="6" class="text-center">Loading...</td></tr>';
    } else {
        console.error('Today schedules table not found in DOM');
    }

    // Fetch student's courses
    function fetchCourses() {
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
                    throw new Error(HTTP `${response.status}: ${text.slice(0, 200)}`);
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
            if (data.message === 'Courses fetched' && data.data && coursesTable) {
                const courses = data.data;
                if (courses.length > 0) {
                    coursesTable.innerHTML = courses.map(course => `
                        <tr>
                            <td>${course.id || 'N/A'}</td>
                            <td>${course.course_title || 'N/A'}</td>
                            <td>${course.course_code || 'N/A'}</td>
                            <td>${course.unit || 'N/A'}</td>
                            <td>
                                <a href="schedules.html?course_code=${course.course_code}" class="btn btn-sm btn-info"><i class="fas fa-calendar"></i> Schedules</a>
                                <a href="attendance.html?course_code=${course.course_code}" class="btn btn-sm btn-success"><i class="fas fa-check-circle"></i> Attendance</a>
                            </td>
                        </tr>
                    `).join(''); 
                } else {
                    coursesTable.innerHTML = '<tr><td colspan="5" class="text-center">No courses registered</td></tr>';
                }
            } else {
                console.error('Unexpected courses response format:', data);
                if (coursesTable) coursesTable.innerHTML = '<tr><td colspan="5" class="text-center">Failed to load</td></tr>';
            }
        })
        .catch(error => {
            console.error('Courses fetch error:', error.message);
            if (coursesTable) coursesTable.innerHTML = '<tr><td colspan="5" class="text-center">Failed to load: ' + error.message + '</td></tr>';
        });
    }

    // Fetch today's scheduled courses
    function fetchTodaySchedules() {
        const url = `${API_BASE_URL}/student/class-schedules/today`;
        console.log('Fetching today schedules from:', url);
        fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            signal: AbortSignal.timeout(5000)
        })
        .then(response => {
            console.log('Today schedules response status:', response.status, 'Content-Type:', response.headers.get('content-type'));
            if (!response.ok) {
                return response.text().then(text => {
                    console.error('Today schedules response text:', text.slice(0, 200));
                    throw new Error(HTTP `${response.status}: ${text.slice(0, 200)}`);
                });
            }
            if (!response.headers.get('content-type')?.includes('application/json')) {
                return response.text().then(text => {
                    console.error('Today schedules non-JSON response:', text.slice(0, 200));
                    throw new Error('Received non-JSON response from /api/student/schedules/today');
                });
            }
            return response.json();
        })
        .then(data => {
            console.log('Today Schedules API Response:', data);
            if (data.message === 'Today schedule fetched' && data.data && todaySchedulesTable) {
                const schedules = data.data;
                if (schedules.length > 0) {
                    todaySchedulesTable.innerHTML = schedules.map(schedule => `
                        <tr>
                            <td>${schedule.hall_name || 'N/A'}</td>
                            <td>${schedule.course_title || 'N/A'}</td>
                            <td>${schedule.course_code || 'N/A'}</td>
                            <td>${schedule.start_time ? schedule.start_time.slice(0, 5) : 'N/A'}</td>
                            <td>${schedule.end_time ? schedule.end_time.slice(0, 5) : 'N/A'}</td>
                            <td>${schedule.status || 'N/A'}</td>
                        </tr>
                    `).join('');
                } else {
                    todaySchedulesTable.innerHTML = '<tr><td colspan="6" class="text-center">No courses scheduled for today</td></tr>';
                }
            } else {
                console.error('Unexpected today schedules response format:', data);
                if (todaySchedulesTable) todaySchedulesTable.innerHTML = '<tr><td colspan="6" class="text-center">Failed to load</td></tr>';
            }
        })
        .catch(error => {
            console.error('Today schedules fetch error:', error.message);
            if (todaySchedulesTable) todaySchedulesTable.innerHTML = '<tr><td colspan="6" class="text-center">Failed to load: ' + error.message + '</td></tr>';
        });
    }

    // Initial fetch
    fetchTodaySchedules();
    fetchCourses();
});