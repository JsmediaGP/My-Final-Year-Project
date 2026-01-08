document.addEventListener('DOMContentLoaded', function () {
    // -------------------- COMMON --------------------
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    if (sidebarToggle) sidebarToggle.addEventListener('click', () => document.querySelector('.sidebar').classList.toggle('active'));

    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function (e) {
            e.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            setTimeout(() => { window.location.href = '../../index.html'; }, 50);
        });
    }

    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (!token || role.toLowerCase() !== 'lecturer') {
        alert('Unauthorized access. Please log in as a lecturer.');
        window.location.href = '../../index.html';
        return;
    }

    console.log('Token:', token, 'Role:', role, 'API_BASE_URL:', API_BASE_URL);

    // -------------------- DOM ELEMENTS --------------------
    const coursesTable = document.querySelector('#courses-table');
    const todaySchedulesTable = document.querySelector('#today-schedules-table');
    const schedulesTable = document.querySelector('#schedules-table');
    const editStatusForm = document.getElementById('editStatusForm');
    const editStatusSubmit = document.getElementById('editStatusSubmit');
    const editError = document.getElementById('editError');

    // Attendance elements
    
    const attendanceTable = document.querySelector('#attendance-table');
    const filterCourse = document.getElementById("filterCourse");
    const filterMatric = document.getElementById("filterMatric");
    const filterDate = document.getElementById("filterDate");
    const filterBtn = document.getElementById("filterBtn");
    
    const exportCsvBtn = document.getElementById("exportCsv");
    const exportPdfBtn = document.getElementById("exportPdf");

    // -------------------- LOADING STATES --------------------
    if (coursesTable) coursesTable.innerHTML = '<tr><td colspan="5" class="text-center">Loading...</td></tr>';
    if (todaySchedulesTable) todaySchedulesTable.innerHTML = '<tr><td colspan="6" class="text-center">Loading...</td></tr>';
    if (schedulesTable) schedulesTable.innerHTML = '<tr><td colspan="9" class="text-center">Loading...</td></tr>';
    if (attendanceTable) attendanceTable.innerHTML = '<tr><td colspan="7" class="text-center">Loading...</td></tr>';

    // -------------------- FETCH FUNCTIONS --------------------
    function fetchCourses() {
        fetch(`${API_BASE_URL}/lecturer/courses`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
            if (data.message === 'Courses fetched' && data.data && coursesTable) {
                const courses = data.data;
                coursesTable.innerHTML = courses.length > 0
                    ? courses.map(c => `<tr>
                        <td>${c.id || 'N/A'}</td>
                        <td>${c.course_title || 'N/A'}</td>
                        <td>${c.course_code || 'N/A'}</td>
                        <td>${c.unit || 'N/A'}</td>
                        <td>
                            <a href="schedules.html?course_id=${c.id}" class="btn btn-sm btn-info"><i class="fas fa-calendar"></i> Schedules</a>
                            <a href="attendance.html?course_id=${c.id}" class="btn btn-sm btn-success"><i class="fas fa-check-circle"></i> Attendance</a>
                        </td>
                    </tr>`).join('')
                    : '<tr><td colspan="5" class="text-center">No courses assigned</td></tr>';

                // // Populate attendance course filter
                // populateCourseDropdown(courses);
            } else if (coursesTable) coursesTable.innerHTML = '<tr><td colspan="5" class="text-center">Failed to load</td></tr>';
        })
        .catch(err => { if (coursesTable) coursesTable.innerHTML = '<tr><td colspan="5" class="text-center">Failed to load</td></tr>'; });
    }

    function fetchTodaySchedules() {
        fetch(`${API_BASE_URL}/lecturer/class-schedules/today`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
            if (data.message === 'Today schedule fetched' && data.data && todaySchedulesTable) {
                const schedules = data.data;
                todaySchedulesTable.innerHTML = schedules.length > 0
                    ? schedules.map(s => `<tr>
                        <td>${s.hall_name || 'N/A'}</td>
                        <td>${s.course_title || 'N/A'}</td>
                        <td>${s.course_code || 'N/A'}</td>
                        <td>${s.start_time || 'N/A'}</td>
                        <td>${s.end_time || 'N/A'}</td>
                        <td>${s.status || 'N/A'}</td>
                    </tr>`).join('')
                    : '<tr><td colspan="6" class="text-center">No courses scheduled for today</td></tr>';
            } else if (todaySchedulesTable) todaySchedulesTable.innerHTML = '<tr><td colspan="6" class="text-center">Failed to load</td></tr>';
        })
        .catch(err => { if (todaySchedulesTable) todaySchedulesTable.innerHTML = '<tr><td colspan="6" class="text-center">Failed to load</td></tr>'; });
    }

    function fetchSchedules() {
        const params = new URLSearchParams(window.location.search);
        const courseId = params.get("course_id");

        let url = `${API_BASE_URL}/lecturer/class-schedules`;
        if (courseId) {
            url += `?course_id=${encodeURIComponent(courseId)}`;
        }
        fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
            if (data.message === 'All schedules fetched' && data.data && schedulesTable) {
                const schedules = data.data;
                schedulesTable.innerHTML = schedules.length > 0
                    ? schedules.map(s => `<tr>
                        <td>${s.id || 'N/A'}</td>
                        <td>${s.course_title || 'N/A'}</td>
                        <td>${s.course_code || 'N/A'}</td>
                        <td>${s.hall_name || 'N/A'}</td>
                        <td>${s.day || 'N/A'}</td>
                        <td>${s.start_time || 'N/A'}</td>
                        <td>${s.end_time || 'N/A'}</td>
                        <td>${s.status || 'N/A'}</td>
                        <td>
                            <button class="btn btn-sm btn-warning edit-status-btn" data-id="${s.id}" data-bs-toggle="modal" data-bs-target="#editStatusModal"><i class="fas fa-edit"></i> Edit Status</button>
                        </td>
                    </tr>`).join('')
                    : '<tr><td colspan="9" class="text-center">No schedules assigned</td></tr>';
                attachEditButtons();
            } else if (schedulesTable) schedulesTable.innerHTML = '<tr><td colspan="9" class="text-center">Failed to load</td></tr>';
        })
        .catch(err => { if (schedulesTable) schedulesTable.innerHTML = '<tr><td colspan="9" class="text-center">Failed to load</td></tr>'; });
    }

    // -------------------- ATTENDANCE --------------------
    function getAttendanceExportData() {
        return filteredAttendance.map(r => ({
            matric: r.student?.matric_number || 'N/A',
            name: r.student 
                ? `${r.student.first_name} ${r.student.last_name}` 
                : 'N/A',
            course: r.class_schedule?.course?.course_title || 'N/A',
            hall: r.class_schedule?.hall?.hall_name || 'N/A',
            date: r.date || 'N/A'
        }));
    }
    
    let currentPage = 1;
    const recordsPerPage = 25;
    let filteredAttendance = [];

    function fetchAttendance() {
        
        const urlParams = new URLSearchParams(window.location.search);
        const urlCourseId = urlParams.get("course_id");

        // 2. Check filter inputs
        const courseId = filterCourse ? filterCourse.value : "";
        const matricNumber = filterMatric ? filterMatric.value : "";
        const date = filterDate ? filterDate.value : "";

        let url = `${API_BASE_URL}/lecturer/attendance?`;

        // Priority: if user comes from dashboard → use urlCourseId
        if (urlCourseId) {
            url += `course_id=${urlCourseId}&`;
        } else if (courseId) {
            url += `course_id=${courseId}&`;
        }

        if (matricNumber) url += `matric_number=${matricNumber}&`;
        if (date) url += `date=${date}&`;

        fetch(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
            if (data.message === 'Attendance fetched' && data.data) {
                filteredAttendance = data.data; // store full data initially
                renderAttendance(filteredAttendance);
            } else if (attendanceTable) attendanceTable.innerHTML = '<tr><td colspan="7" class="text-center">Failed to load</td></tr>';
        })
        .catch(err => { if (attendanceTable) attendanceTable.innerHTML = '<tr><td colspan="7" class="text-center">Failed to load</td></tr>'; });
    }

    function renderAttendance(data) {
        if (!attendanceTable) return;

        const totalPages = Math.ceil(data.length / recordsPerPage);
        const start = (currentPage - 1) * recordsPerPage;
        const end = start + recordsPerPage;
        const pageData = data.slice(start, end);

        attendanceTable.innerHTML = pageData.length > 0
            ? pageData.map(r => `<tr>
                <td>${r.student?.matric_number || 'N/A'}</td>
                <td>${r.student ? r.student.first_name + ' ' + r.student.last_name : 'N/A'}</td>
                <td>${r.class_schedule?.course?.course_title || 'N/A'}</td>
                <td>${r.class_schedule?.hall?.hall_name || r.class_schedule?.hall_id || 'N/A'}</td>
                <td>${r.date || 'N/A'}</td>
            </tr>`).join('')
            : '<tr><td colspan="5" class="text-center">No attendance found</td></tr>';

        renderPagination(totalPages);
    }

    function renderPagination(totalPages) {
        const paginationContainerId = 'pagination-container';
        let paginationContainer = document.getElementById(paginationContainerId);

        if (!paginationContainer) {
            paginationContainer = document.createElement('div');
            paginationContainer.id = paginationContainerId;
            paginationContainer.className = 'd-flex justify-content-center mt-2';
            attendanceTable.parentNode.appendChild(paginationContainer);
        }

        let buttons = '';
        for (let i = 1; i <= totalPages; i++) {
            buttons += `<button class="btn btn-sm ${i === currentPage ? 'btn-primary' : 'btn-outline-primary'} mx-1" data-page="${i}">${i}</button>`;
        }
        paginationContainer.innerHTML = buttons;

        paginationContainer.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', () => {
                currentPage = parseInt(btn.getAttribute('data-page'));
                renderAttendance(filteredAttendance);
            });
        });
    }

    if (exportCsvBtn) {
        exportCsvBtn.addEventListener("click", () => {
            const data = getAttendanceExportData();

            if (!data.length) {
                alert("No attendance data to export");
                return;
            }

            let csv = "Matric Number,Student Name,Course,Hall,Date\n";

            data.forEach(r => {
                csv += `"${r.matric}","${r.name}","${r.course}","${r.hall}","${r.date}"\n`;
            });

            const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = "attendance_records.csv";
            link.click();
        });
    }

    if (exportPdfBtn) {
        exportPdfBtn.addEventListener("click", () => {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            const data = getAttendanceExportData();

            if (!data.length) {
                alert("No attendance data to export");
                return;
            }

            const rows = data.map(r => [
                r.matric,
                r.name,
                r.course,
                r.hall,
                r.date
            ]);

            doc.text("EduTrack Attendance Records", 14, 15);

            doc.autoTable({
                head: [["Matric Number", "Student Name", "Course", "Hall", "Date"]],
                body: rows,
                startY: 20
            });

            doc.save("attendance_records.pdf");
        });
    }

 


    
  

    // -------------------- EDIT STATUS --------------------
    function attachEditButtons() {
        document.querySelectorAll('.edit-status-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.getElementById('editScheduleId').value = btn.getAttribute('data-id');
            });
        });
    }

    if (editStatusSubmit) {
        editStatusSubmit.addEventListener('click', () => {
            const id = document.getElementById('editScheduleId').value;
            const status = document.getElementById('editStatus').value;
            if (!id || !status) {
                editError.textContent = 'Please select a status';
                return;
            }

            editError.textContent = 'Saving...';
            editStatusSubmit.disabled = true;

            fetch(`${API_BASE_URL}/lecturer/class-schedules/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ status })
            })
            .then(res => res.json())
            .then(data => {
                if (data.message === 'Status updated') {
                    editError.textContent = 'Status updated successfully';
                    editError.style.color = 'green';
                    fetchSchedules();
                    setTimeout(() => {
                        const modalEl = document.getElementById('editStatusModal');
                        const modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
                        modalInstance.hide();
                        editError.textContent = '';
                        editError.style.color = '';
                    }, 2000);
                } else {
                    editError.textContent = data.message || 'Failed to update status';
                    editError.style.color = 'red';
                }
                editStatusSubmit.disabled = false;
            })
            .catch(err => {
                editError.textContent = 'Error connecting to server';
                editError.style.color = 'red';
                editStatusSubmit.disabled = false;
            });
        });
    }

    // -------------------- POPULATE COURSE DROPDOWN --------------------
    function fetchCoursesForFilter() {
        fetch(`${API_BASE_URL}/lecturer/courses`, {
            method: 'GET',
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${token}` 
            }
        })
        .then(res => res.json())
        .then(data => {
            if (data.message === 'Courses fetched' && data.data) {
                const courses = data.data;
                populateCourseDropdown(courses); // 🔹 only handle dropdown
            } else {
                if (filterCourse) filterCourse.innerHTML = '<option value="">No courses available</option>';
            }
        })
        .catch(err => {
            if (filterCourse) filterCourse.innerHTML = '<option value="">Failed to load courses</option>';
        });
    }

    function populateCourseDropdown(courses) {
        if (filterCourse) {
            filterCourse.innerHTML = `<option value="">All Courses</option>` +
                courses.map(c => 
                    `<option value="${c.id}">${c.course_title} (${c.course_code})</option>`
                ).join('');
        }
    }



    //------------------student for course ------------------------------------
    function fetchStudentsForCourse(courseId) {
        if (!courseId) {
            filterMatric.innerHTML = '<option value="">All Students</option>';
            return;
        }

        fetch(`${API_BASE_URL}/lecturer/course-students?course_id=${courseId}`, {
            method: 'GET',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        .then(res => res.json())
        .then(data => {
            if (data.message === 'Students fetched' && data.data) {
                populateStudentDropdown(data.data);
            } else {
                filterMatric.innerHTML = '<option value="">No students found</option>';
            }
        })
        .catch(err => {
            filterMatric.innerHTML = '<option value="">Failed to load students</option>';
        });
    }

    function populateStudentDropdown(students) {
        if (filterMatric) {
            filterMatric.innerHTML = `<option value="">All Students</option>` +
                students.map(s => 
                    `<option value="${s.matric_number}">${s.matric_number} </option>`
                ).join('');
        }
    }

   

//    

 // -------------------- EVENT LISTENERS --------------------
    if (filterBtn) {
        filterBtn.addEventListener("click", (e) => {
            e.preventDefault();
            fetchAttendance();
        });
    }

    if (filterCourse) {
        filterCourse.addEventListener("change", () => {
            const courseId = filterCourse.value;
            if (courseId) {
                fetchStudentsForCourse(courseId);
            } else {
                filterMatric.innerHTML = `<option value="">All Students</option>`;
            }
        });
    }
    



    // -------------------- INITIAL FETCH --------------------
    fetchCourses();
    fetchTodaySchedules();
    fetchSchedules();
    fetchAttendance();
    fetchCoursesForFilter(); 
});
 