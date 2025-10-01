// document.addEventListener('DOMContentLoaded', function () {
//     // Sidebar toggle for mobile
//     const sidebarToggle = document.querySelector('.sidebar-toggle');
//     if (sidebarToggle) {
//         sidebarToggle.addEventListener('click', function () {
//             document.querySelector('.sidebar').classList.toggle('active');
//         });
//     }

//     // Logout button
//     const logoutBtn = document.querySelector('.logout-btn');
//     if (logoutBtn) {
//         logoutBtn.addEventListener('click', function () {
//             localStorage.removeItem('token');
//             localStorage.removeItem('role');
//             window.location.href = '../../index.html';
//         });
//     }

//     // Check for admin role
//     const token = localStorage.getItem('token');
//     const role = localStorage.getItem('role');
//     if (!token || role.toLowerCase() !== 'admin') {
//         alert('Unauthorized access. Please log in as an admin.');
//         window.location.href = '../../../index.html';
//         return;
//     }

//     // Get table and filter elements
//     const attendanceTable = document.querySelector('#attendance-table');
//     const filterMatricNumber = document.getElementById('filterMatricNumber');
//     const filterCourse = document.getElementById('filterCourse');
//     const filterDate = document.getElementById('filterDate');
//     const applyFilters = document.getElementById('applyFilters');

//     // Debug: Log elements and token
//     console.log('Attendance table element:', attendanceTable);
//     console.log('Filter Matric Number:', filterMatricNumber);
//     console.log('Filter Course:', filterCourse);
//     console.log('Filter Date:', filterDate);
//     console.log('Apply Filters button:', applyFilters);
//     console.log('Token:', token);
//     console.log('API_BASE_URL:', API_BASE_URL);

//     // Show loading state
//     if (attendanceTable) {
//         attendanceTable.innerHTML = '<tr><td colspan="7" class="text-center">Loading...</td></tr>';
//     } else {
//         console.error('Attendance table not found in DOM');
//     }

//     // Fetch courses for filter dropdown
//     let courses = [];
//     function fetchCourses() {
//         const url = `${API_BASE_URL}/admin/courses`;
//         console.log('Fetching courses from:', url);
//         fetch(url, {
//             method: 'GET',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${token}`
//             }
//         })
//         .then(response => response.json())
//         .then(data => {
//             console.log('Courses API Response:', data);
//             if (data.message === 'Courses fetched' && data.data) {
//                 courses = data.data;
//                 populateCourseFilter();
//             } else {
//                 console.error('Failed to fetch courses:', data);
//                 if (filterCourse) filterCourse.innerHTML = '<option value="" disabled selected>Error loading courses</option>';
//             }
//         })
//         .catch(error => {
//             console.error('Courses fetch error:', error);
//             if (filterCourse) filterCourse.innerHTML = '<option value="" disabled selected>Error loading courses</option>';
//         });
//     }

   
//     function populateCourseFilter() {
//         if (filterCourse) {
//             filterCourse.innerHTML = `<option value="" selected>All Courses</option>` + 
//                 courses.map(course => `<option value="${course.id}">${course.course_title} (${course.course_code})</option>`).join('');
//         }
//     }

//     // Fetch attendance
//     let allAttendance = [];
//     function fetchAttendance() {
//         const url = `${API_BASE_URL}/admin/attendance`;
//         console.log('Fetching attendance from:', url);
//         fetch(url, {
//             method: 'GET',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${token}`
//             }
//         })
//         .then(response => response.json())
//         .then(data => {
//             console.log('Attendance API Response:', data);
//             if (data.message === 'Attendance fetched' && data.data) {
//                 allAttendance = data.data;
//                 renderAttendance(allAttendance);
//             } else {
//                 console.error('Failed to fetch attendance:', data);
//                 if (attendanceTable) attendanceTable.innerHTML = '<tr><td colspan="7" class="text-center">Failed to load</td></tr>';
//             }
//         })
//         .catch(error => {
//             console.error('Attendance fetch error:', error);
//             if (attendanceTable) attendanceTable.innerHTML = '<tr><td colspan="7" class="text-center">Failed to load</td></tr>';
//         });
//     }
//     // -------------------- PAGINATION VARIABLES --------------------
//     let currentPage = 1;
//     const recordsPerPage = 25;
   
//         function renderAttendance(data) {
//         if (!attendanceTable) return;

//         const totalPages = Math.ceil(data.length / recordsPerPage);
//         const start = (currentPage - 1) * recordsPerPage;
//         const end = start + recordsPerPage;
//         const pageData = data.slice(start, end);

//         attendanceTable.innerHTML = pageData.length > 0
//             ? pageData.map(r => `<tr>
//                 <td>${r.student?.matric_number || 'N/A'}</td>
//                 <td>${r.student ? r.student.first_name + ' ' + r.student.last_name : 'N/A'}</td>
//                 <td>${r.class_schedule?.course?.course_title || 'N/A'}</td>
//                 <td>${r.class_schedule?.hall?.name || r.class_schedule?.hall_id || 'N/A'}</td>
//                 <td>${r.date || 'N/A'}</td>
//             </tr>`).join('')
//             : '<tr><td colspan="5" class="text-center">No attendance found</td></tr>';

//         renderPagination(totalPages);
//     }

//     // -------------------- RENDER PAGINATION CONTROLS --------------------
//     function renderPagination(totalPages) {
//         const paginationContainerId = 'pagination-container';
//         let paginationContainer = document.getElementById(paginationContainerId);

//         if (!paginationContainer) {
//             // Create pagination container below table if it doesn't exist
//             paginationContainer = document.createElement('div');
//             paginationContainer.id = paginationContainerId;
//             paginationContainer.className = 'd-flex justify-content-center mt-2';
//             attendanceTable.parentNode.appendChild(paginationContainer);
//         }

//         let buttons = '';
//         for (let i = 1; i <= totalPages; i++) {
//             buttons += `<button class="btn btn-sm ${i === currentPage ? 'btn-primary' : 'btn-outline-primary'} mx-1" onclick="goToPage(${i})">${i}</button>`;
//         }
//         paginationContainer.innerHTML = buttons;
//     }
//     function goToPage(page) {
//         currentPage = page;
//         renderAttendance(allAttendance); // allAttendance = your full data array
//         }
    

//     // Apply filters
//     if (applyFilters) {
//         applyFilters.addEventListener('click', function () {
//             const matric = filterMatricNumber.value.toLowerCase();
//             const course = filterCourse.value;
//             const date = filterDate.value;

//             const filtered = allAttendance.filter(record => {
//                 return (matric === '' || record.matric_number.toLowerCase().includes(matric)) &&
//                        (course === '' || record.course_id == course) &&
//                        (date === '' || record.date_time.startsWith(date));
//             });

//             renderAttendance(filtered);
//         });
//     }

//     // Initial fetch
//     fetchCourses();
//     fetchAttendance();


    
// });


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

    // Check for admin role
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (!token || role.toLowerCase() !== 'admin') {
        alert('Unauthorized access. Please log in as an admin.');
        window.location.href = '../../../index.html';
        return;
    }

    // Get table and filter elements
    const attendanceTable = document.querySelector('#attendance-table');
    const filterMatricNumber = document.getElementById('filterMatricNumber');
    const filterCourse = document.getElementById('filterCourse');
    const filterDate = document.getElementById('filterDate');
    const applyFilters = document.getElementById('applyFilters');

    // Show loading state
    if (attendanceTable) {
        attendanceTable.innerHTML = '<tr><td colspan="7" class="text-center">Loading...</td></tr>';
    } else {
        console.error('Attendance table not found in DOM');
    }

    // Fetch courses for filter dropdown
    let courses = [];
    function fetchCourses() {
        const url = `${API_BASE_URL}/admin/courses`;
        fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'Courses fetched' && data.data) {
                courses = data.data;
                populateCourseFilter();
            } else {
                console.error('Failed to fetch courses:', data);
                if (filterCourse) filterCourse.innerHTML = '<option value="" disabled selected>Error loading courses</option>';
            }
        })
        .catch(error => {
            console.error('Courses fetch error:', error);
            if (filterCourse) filterCourse.innerHTML = '<option value="" disabled selected>Error loading courses</option>';
        });
    }

    function populateCourseFilter() {
        if (filterCourse) {
            filterCourse.innerHTML = `<option value="" selected>All Courses</option>` + 
                courses.map(course => `<option value="${course.id}">${course.course_title} (${course.course_code})</option>`).join('');
        }
    }

    // Fetch attendance
    let allAttendance = [];
    function fetchAttendance() {
        const url = `${API_BASE_URL}/admin/attendance`;
        fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'Attendance fetched' && data.data) {
                allAttendance = data.data;
                currentPage = 1; // reset pagination
                renderAttendance(allAttendance);
            } else {
                console.error('Failed to fetch attendance:', data);
                if (attendanceTable) attendanceTable.innerHTML = '<tr><td colspan="7" class="text-center">Failed to load</td></tr>';
            }
        })
        .catch(error => {
            console.error('Attendance fetch error:', error);
            if (attendanceTable) attendanceTable.innerHTML = '<tr><td colspan="7" class="text-center">Failed to load</td></tr>';
        });
    }

    // -------------------- PAGINATION VARIABLES --------------------
    let currentPage = 1;
    const recordsPerPage = 25;
    let displayedData = []; // stores current data to render (filtered or all)

    // -------------------- RENDER ATTENDANCE --------------------
    function renderAttendance(data) {
        if (!attendanceTable) return;

        displayedData = data; // update displayed data for pagination
        const totalPages = Math.ceil(data.length / recordsPerPage);
        const start = (currentPage - 1) * recordsPerPage;
        const end = start + recordsPerPage;
        const pageData = data.slice(start, end);

        attendanceTable.innerHTML = pageData.length > 0
            ? pageData.map(r => `<tr>
                <td>${r.student?.matric_number || 'N/A'}</td>
                <td>${r.student ? r.student.first_name + ' ' + r.student.last_name : 'N/A'}</td>
                <td>${r.class_schedule?.course?.course_title || 'N/A'}</td>
                <td>${r.class_schedule?.hall?.name || r.class_schedule?.hall_id || 'N/A'}</td>
                <td>${r.date || 'N/A'}</td>
            </tr>`).join('')
            : '<tr><td colspan="5" class="text-center">No attendance found</td></tr>';

        renderPagination(totalPages);
    }

    // -------------------- RENDER PAGINATION CONTROLS --------------------
    function renderPagination(totalPages) {
        const paginationContainerId = 'pagination-container';
        let paginationContainer = document.getElementById(paginationContainerId);

        if (!paginationContainer) {
            paginationContainer = document.createElement('div');
            paginationContainer.id = paginationContainerId;
            paginationContainer.className = 'd-flex justify-content-center mt-2';
            attendanceTable.parentNode.appendChild(paginationContainer);
        }

        paginationContainer.innerHTML = ''; // clear previous buttons

        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement('button');
            btn.className = `btn btn-sm mx-1 ${i === currentPage ? 'btn-primary' : 'btn-outline-primary'}`;
            btn.textContent = i;
            btn.addEventListener('click', function () {
                currentPage = i;
                renderAttendance(displayedData);
            });
            paginationContainer.appendChild(btn);
        }
    }

    // -------------------- APPLY FILTERS --------------------
    if (applyFilters) {
        applyFilters.addEventListener('click', function () {
            const matric = filterMatricNumber.value.toLowerCase();
            const course = filterCourse.value;
            const date = filterDate.value;

            const filtered = allAttendance.filter(record => {
                return (matric === '' || (record.student?.matric_number || '').toLowerCase().includes(matric)) &&
                       (course === '' || record.class_schedule?.course?.id == course) &&
                       (date === '' || record.date.startsWith(date));
            });

            currentPage = 1; // reset pagination
            renderAttendance(filtered);
        });
    }

    // -------------------- INITIAL FETCH --------------------
    fetchCourses();
    fetchAttendance();
});
