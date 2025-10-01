// Sidebar toggle for mobile
document.addEventListener('DOMContentLoaded', function () {
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function () {
            document.querySelector('.sidebar').classList.toggle('active');
        });
    }

    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    // Check for admin role
    if (!token || role.toLowerCase() !== 'admin') {
        alert('Unauthorized access. Please log in as an admin.');
        window.location.href = '../../index.html';
        return;
    }

    const totalStudents = document.querySelector('#total-students');
    const totalLecturers = document.querySelector('#total-lecturers');
    const activeHalls = document.querySelector('#active-halls');
    const totalCourses = document.querySelector('#courses');

    // Show loading state
    if (totalStudents) totalStudents.textContent = 'Loading...';
    if (totalLecturers) totalLecturers.textContent = 'Loading...';
    if (activeHalls) activeHalls.textContent = 'Loading...';
    if (totalCourses) totalCourses.textContent = 'Loading...';

    // Fetch student count
    fetch(`${API_BASE_URL}/admin/users/students/count`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json().then(data => ({ status: response.status, data })))
    .then(({ status, data }) => {
        console.log('Students API Response:', data); // Debug
        if (status >= 200 && status < 300 && totalStudents) {
            totalStudents.textContent = data.data?.students ?? 'N/A';
        } else {
            console.error('Failed to fetch student count:', data);
            if (totalStudents) totalStudents.textContent = 'Failed to load';
        }
    })
    .catch(error => {
        console.error('Student count error:', error);
        if (totalStudents) totalStudents.textContent = 'Failed to load';
    });

    // Fetch lecturer count
    fetch(`${API_BASE_URL}/admin/users/lecturers/count`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json().then(data => ({ status: response.status, data })))
    .then(({ status, data }) => {
        console.log('Lecturers API Response:', data); // Debug
        if (status >= 200 && status < 300 && totalLecturers) {
            totalLecturers.textContent = data.data?.lecturers ?? 'N/A';
        } else {
            console.error('Failed to fetch lecturer count:', data);
            if (totalLecturers) totalLecturers.textContent = 'Failed to load';
        }
    })
    .catch(error => {
        console.error('Lecturer count error:', error);
        if (totalLecturers) totalLecturers.textContent = 'Failed to load';
    });

    // Fetch hall count
    fetch(`${API_BASE_URL}/admin/halls/count`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json().then(data => ({ status: response.status, data })))
    .then(({ status, data }) => {
        console.log('Halls API Response:', data); // Debug
        if (status >= 200 && status < 300 && activeHalls) {
            activeHalls.textContent = data.data?.halls ?? 'N/A';
        } else {
            console.error('Failed to fetch hall count:', data);
            if (activeHalls) activeHalls.textContent = 'Failed to load';
        }
    })
    .catch(error => {
        console.error('Hall count error:', error);
        if (activeHalls) activeHalls.textContent = 'Failed to load';
    });

    // Fetch course count
    fetch(`${API_BASE_URL}/admin/courses/count`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json().then(data => ({ status: response.status, data })))
    .then(({ status, data }) => {
        console.log('Courses API Response:', data); // Debug
        if (status >= 200 && status < 300 && totalCourses) {
            totalCourses.textContent = data.data?.courses ?? 'N/A';
        } else {
            console.error('Failed to fetch course count:', data);
            if (totalCourses) totalCourses.textContent = 'Failed to load';
        }
    })
    .catch(error => {
        console.error('Course count error:', error);
        if (totalCourses) totalCourses.textContent = 'Failed to load';
    });



// Fetch today's schedules
    const schedulesTable = document.querySelector('#schedules-table');
    fetch(`${API_BASE_URL}/admin/class-schedules/today`, {
        
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json().then(data => ({ status: response.status, data })))
    .then(({ status, data }) => {
        console.log('Schedules API Response:', data); // Debug
        if (status >= 200 && status < 300 && schedulesTable) {
            if (data.data && data.data.length > 0) {
                schedulesTable.innerHTML = data.data.map(schedule => `
                    <tr>
                        <td>${schedule.hall_name || 'N/A'}</td>
                        <td>${schedule.course_title || 'N/A'}</td>
                        <td>${schedule.course_code || 'N/A'}</td>
                        <td>${schedule.start_time || 'N/A'}</td>
                        <td>${schedule.end_time || 'N/A'}</td>
                        <td>${schedule.day || 'N/A'}</td>
                        <td>${schedule.lecturer || 'N/A'}</td>
                        <td><span class="badge bg-${schedule.status === 'holding' ? 'success' : schedule.status === 'not_olding' ? 'danger' : 'warning'}">${schedule.status || 'N/A'}</span></td>
                    </tr>
                `).join('');
            } else {
                schedulesTable.innerHTML = '<tr><td colspan="7" class="text-center">No schedules today</td></tr>';
            }
        } else {
            console.error('Failed to fetch schedules:', data);
            if (schedulesTable) schedulesTable.innerHTML = '<tr><td colspan="7" class="text-center">Failed to load</td></tr>';
        }
    })
    .catch(error => {
        console.error('Schedules error:', error);
        if (schedulesTable) schedulesTable.innerHTML = '<tr><td colspan="7" class="text-center">Failed to load</td></tr>';
    });
});




