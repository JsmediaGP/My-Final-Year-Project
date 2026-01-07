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

    // Get table element
    const schedulesTable = document.querySelector('#schedules-table');

    // Debug: Log elements and token
    console.log('Schedules table element:', schedulesTable);
    console.log('Token:', token);
    console.log('API_BASE_URL:', API_BASE_URL || 'Not defined! Check config.js');

    // Show loading state
    if (schedulesTable) {
        schedulesTable.innerHTML = '<tr><td colspan="8" class="text-center">Loading...</td></tr>';
    } else {
        console.error('Schedules table not found in DOM');
    }

    // Fetch student's schedules
    function fetchSchedules() {
          // Get course_code from query string
        const params = new URLSearchParams(window.location.search);
        const courseCode = params.get('course_code');
        let url = `${API_BASE_URL}/student/class-schedules`;
        if (courseCode) {
        url += `?course_code=${encodeURIComponent(courseCode)}`;
        }
        console.log('Fetching schedules from:', url);
        fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            signal: AbortSignal.timeout(5000)
        })
        .then(response => {
            console.log('Schedules response status:', response.status, 'Content-Type:', response.headers.get('content-type'));
            if (!response.ok) {
                return response.text().then(text => {
                    console.error('Schedules response text:', text.slice(0, 200));
                    throw new Error(HTTP `${response.status}: ${text.slice(0, 200)}`);
                });
            }
            if (!response.headers.get('content-type')?.includes('application/json')) {
                return response.text().then(text => {
                    console.error('Schedules non-JSON response:', text.slice(0, 200));
                    throw new Error('Received non-JSON response from /api/student/schedules');
                });
            }
            return response.json();
        })
        .then(data => {
            console.log('Schedules API Response:', data);
            if (data.message === 'All schedules fetched' && data.data && schedulesTable) {
                const schedules = data.data;
                if (schedules.length > 0) {
                    schedulesTable.innerHTML = schedules.map(schedule => `
                        <tr>
                            <td>${schedule.id || 'N/A'}</td>
                            <td>${schedule.course_title || 'N/A'}</td>
                            <td>${schedule.course_code || 'N/A'}</td>
                            <td>${schedule.hall_name || 'N/A'}</td>
                            <td>${schedule.day || 'N/A'}</td>
                            <td>${schedule.start_time ? schedule.start_time.slice(0, 5) : 'N/A'}</td>
                            <td>${schedule.end_time ? schedule.end_time.slice(0, 5) : 'N/A'}</td>
                            <td>${schedule.status || 'N/A'}</td>
                        </tr>
                    `).join('');
                } else {
                    schedulesTable.innerHTML = '<tr><td colspan="8" class="text-center">No schedules found</td></tr>';
                }
            } else {
                console.error('Unexpected schedules response format:', data);
                if (schedulesTable) schedulesTable.innerHTML = '<tr><td colspan="8" class="text-center">Failed to load</td></tr>';
            }
        })
        .catch(error => {
            console.error('Schedules fetch error:', error.message);
            if (schedulesTable) schedulesTable.innerHTML = '<tr><td colspan="8" class="text-center">Failed to load: ' + error.message + '</td></tr>';
        });
    }

    // Initial fetch
    fetchSchedules();
});