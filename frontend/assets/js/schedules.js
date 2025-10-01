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
//             window.location.href = '../../../index.html';
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

//     // Get table and modal elements
//     const schedulesTable = document.querySelector('#schedules-table');
//     const addScheduleForm = document.getElementById('addScheduleForm');
//     const addScheduleSubmit = document.getElementById('addScheduleSubmit');
//     const addError = document.getElementById('addError');
//     const addCourseId = document.getElementById('addCourseId');
//     const addLecturerId = document.getElementById('addLecturerId');
//     const addHallId = document.getElementById('addHallId');
//     const editScheduleForm = document.getElementById('editScheduleForm');
//     const editScheduleSubmit = document.getElementById('editScheduleSubmit');
//     const editError = document.getElementById('editError');
//     const editCourseId = document.getElementById('editCourseId');
//     const editLecturerId = document.getElementById('editLecturerId');
//     const editHallId = document.getElementById('editHallId');

//     // Debug: Log elements and token
//     console.log('Schedules table element:', schedulesTable);
//     console.log('Add course dropdown:', addCourseId);
//     console.log('Add lecturer dropdown:', addLecturerId);
//     console.log('Add hall dropdown:', addHallId);
//     console.log('Edit course dropdown:', editCourseId);
//     console.log('Edit lecturer dropdown:', editLecturerId);
//     console.log('Edit hall dropdown:', editHallId);
//     console.log('Token:', token);
//     console.log('API_BASE_URL:', API_BASE_URL);

//     // Show loading state
//     if (schedulesTable) {
//         schedulesTable.innerHTML = '<tr><td colspan="8" class="text-center">Loading...</td></tr>';
//     } else {
//         console.error('Schedules table not found in DOM');
//     }

//     // Fetch dropdown data
//     let courses = [];
//     let lecturers = [];
//     let halls = [];

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
//         .then(response => {
//             console.log('Courses response status:', response.status, 'Content-Type:', response.headers.get('content-type'));
//             if (!response.ok) {
//                 return response.text().then(text => {
//                     console.error('Courses response text:', text.slice(0, 200));
//                     throw new Error(`HTTP ${response.status}: ${text.slice(0, 200)}`);
//                 });
//             }
//             if (!response.headers.get('content-type')?.includes('application/json')) {
//                 return response.text().then(text => {
//                     console.error('Courses non-JSON response:', text.slice(0, 200));
//                     throw new Error('Received non-JSON response');
//                 });
//             }
//             return response.json();
//         })
//         .then(data => {
//             console.log('Courses API Response:', data);
//             courses = (data.message === 'Courses fetched' && data.data) ? data.data : data;
//             populateCourseDropdowns();
//         })
//         .catch(error => {
//             console.error('Courses fetch error:', error.message);
//             if (addCourseId) addCourseId.innerHTML = '<option value="" disabled selected>Error loading courses</option>';
//             if (editCourseId) editCourseId.innerHTML = '<option value="" disabled selected>Error loading courses</option>';
//         });
//     }

//     function fetchLecturers() {
//         const url = `${API_BASE_URL}/admin/users/lecturers`;
//         console.log('Fetching lecturers from:', url);
//         fetch(url, {
//             method: 'GET',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${token}`
//             }
//         })
//         .then(response => {
//             console.log('Lecturers response status:', response.status, 'Content-Type:', response.headers.get('content-type'));
//             if (!response.ok) {
//                 return response.text().then(text => {
//                     console.error('Lecturers response text:', text.slice(0, 200));
//                     throw new Error(`HTTP ${response.status}: ${text.slice(0, 200)}`);
//                 });
//             }
//             if (!response.headers.get('content-type')?.includes('application/json')) {
//                 return response.text().then(text => {
//                     console.error('Lecturers non-JSON response:', text.slice(0, 200));
//                     throw new Error('Received non-JSON response');
//                 });
//             }
//             return response.json();
//         })
//         .then(data => {
//             console.log('Lecturers API Response:', data);
//             lecturers = (data.message === 'Lecturers fetched' && data.data) ? data.data : data;
//             populateLecturerDropdowns();
//         })
//         .catch(error => {
//             console.error('Lecturers fetch error:', error.message);
//             if (addLecturerId) addLecturerId.innerHTML = '<option value="" disabled selected>Error loading lecturers</option>';
//             if (editLecturerId) editLecturerId.innerHTML = '<option value="" disabled selected>Error loading lecturers</option>';
//         });
//     }

//     function fetchHalls() {
//         const url = `${API_BASE_URL}/admin/halls`;
//         console.log('Fetching halls from:', url);
//         fetch(url, {
//             method: 'GET',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${token}`
//             }
//         })
//         .then(response => {
//             console.log('Halls response status:', response.status, 'Content-Type:', response.headers.get('content-type'));
//             if (!response.ok) {
//                 return response.text().then(text => {
//                     console.error('Halls response text:', text.slice(0, 200));
//                     throw new Error(`HTTP ${response.status}: ${text.slice(0, 200)}`);
//                 });
//             }
//             if (!response.headers.get('content-type')?.includes('application/json')) {
//                 return response.text().then(text => {
//                     console.error('Halls non-JSON response:', text.slice(0, 200));
//                     throw new Error('Received non-JSON response');
//                 });
//             }
//             return response.json();
//         })
//         .then(data => {
//             console.log('Halls API Response:', data);
//             halls = (data.message === 'Halls fetched' && data.data) ? data.data : data;
//             populateHallDropdowns();
//         })
//         .catch(error => {
//             console.error('Halls fetch error:', error.message);
//             if (addHallId) addHallId.innerHTML = '<option value="" disabled selected>Error loading halls</option>';
//             if (editHallId) editHallId.innerHTML = '<option value="" disabled selected>Error loading halls</option>';
//         });
//     }

   
//     function populateCourseDropdowns() {
//     const options = courses.length > 0
//             ? courses.map(course => 
//                 `<option value="${course.id}">${course.course_title} (${course.course_code})</option>`
//             ).join('')
//             : '<option value="" disabled selected>No courses available</option>';

//         if (addCourseId) addCourseId.innerHTML = '<option value="" disabled selected>Select course</option>' + options;
//         if (editCourseId) editCourseId.innerHTML = '<option value="" disabled selected>Select course</option>' + options;
//     }

   
//     function populateLecturerDropdowns() {
//     const options = lecturers.length > 0
//         ? lecturers.map(lecturer => 
//             `<option value="${lecturer.id}">${lecturer.first_name} ${lecturer.last_name}</option>`
//         ).join('')
//         : '<option value="" disabled selected>No lecturers available</option>';

//     if (addLecturerId) addLecturerId.innerHTML = '<option value="" disabled selected>Select lecturer</option>' + options;
//     if (editLecturerId) editLecturerId.innerHTML = '<option value="" disabled selected>Select lecturer</option>' + options;
// }


//     function populateHallDropdowns() {
//     const options = halls.length > 0
//         ? halls.map(hall => 
//             `<option value="${hall.id}">${hall.hall_name}</option>`
//         ).join('')
//         : '<option value="" disabled selected>No halls available</option>';

//     if (addHallId) addHallId.innerHTML = '<option value="" disabled selected>Select hall</option>' + options;
//     if (editHallId) editHallId.innerHTML = '<option value="" disabled selected>Select hall</option>' + options;
// }


// function fetchSchedules() {
//     const url = `${API_BASE_URL}/admin/class-schedules`;
//     console.log('Fetching schedules from:', url);

//     fetch(url, {
//         method: 'GET',
//         headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${token}`
//         }
//     })
//     .then(response => {
//         console.log('Schedules response status:', response.status, 'Content-Type:', response.headers.get('content-type'));
//         if (!response.ok) {
//             return response.text().then(text => {
//                 console.error('Schedules response text:', text.slice(0, 200));
//                 throw new Error(`HTTP ${response.status}: ${text.slice(0, 200)}`);
//             });
//         }
//         if (!response.headers.get('content-type')?.includes('application/json')) {
//             return response.text().then(text => {
//                 console.error('Schedules non-JSON response:', text.slice(0, 200));
//                 throw new Error('Received non-JSON response');
//             });
//         }
//         return response.json();
//     })
//     .then(data => {
//         console.log('Schedules API Response:', data);

//         if (data.data && Array.isArray(data.data) && schedulesTable) {
//             const schedules = data.data;

//             if (schedules.length > 0) {
//                 schedulesTable.innerHTML = schedules.map(schedule => `
//                     <tr>
//                         <td>${schedule.course_title || 'N/A'} (${schedule.course_code || ''})</td>
//                         <td>${schedule.lecturer || 'N/A'}</td>
//                         <td>${schedule.hall_name || 'N/A'}</td>
//                         <td>${schedule.day || 'N/A'}</td>
//                         <td>${schedule.start_time ? schedule.start_time.slice(0, 5) : 'N/A'}</td>
//                         <td>${schedule.end_time ? schedule.end_time.slice(0, 5) : 'N/A'}</td>
//                         <td>${schedule.status || 'N/A'}</td>
//                         <td>
//                             <button class="btn btn-sm btn-warning edit-btn" data-id="${schedule.id || ''}" data-bs-toggle="modal" data-bs-target="#editScheduleModal">
//                                 <i class="fas fa-edit"></i> Edit
//                             </button>
//                             <button class="btn btn-sm btn-danger delete-btn" data-id="${schedule.id || ''}">
//                                 <i class="fas fa-trash"></i> Delete
//                             </button>
//                         </td>
//                     </tr>
//                 `).join('');
//             } else {
//                 schedulesTable.innerHTML = '<tr><td colspan="8" class="text-center">No schedules found</td></tr>';
//             }

//             attachButtonListeners();
//         } else {
//             console.error('Unexpected schedules response format:', data);
//             if (schedulesTable) schedulesTable.innerHTML = '<tr><td colspan="8" class="text-center">Failed to load</td></tr>';
//         }
//     })
//     .catch(error => {
//         console.error('Schedules fetch error:', error.message);
//         if (schedulesTable) schedulesTable.innerHTML = '<tr><td colspan="8" class="text-center">Failed to load</td></tr>';
//     });
// }


//     // Attach edit and delete button listeners
//     function attachButtonListeners() {
//         // Edit buttons
//         document.querySelectorAll('.edit-btn').forEach(button => {
//             button.addEventListener('click', function () {
//                 const scheduleId = this.getAttribute('data-id');
//                 const url = `${API_BASE_URL}/admin/class-schedules/${scheduleId}`;
//                 console.log('Fetching schedule:', url);
//                 fetch(url, {
//                     method: 'GET',
//                     headers: {
//                         'Content-Type': 'application/json',
//                         'Authorization': `Bearer ${token}`
//                     }
//                 })
//                 .then(response => {
//                     console.log('Schedule fetch response status:', response.status, 'Content-Type:', response.headers.get('content-type'));
//                     if (!response.ok) {
//                         return response.text().then(text => {
//                             console.error('Schedule fetch response text:', text.slice(0, 200));
//                             throw new Error(`HTTP ${response.status}: ${text.slice(0, 200)}`);
//                         });
//                     }
//                     if (!response.headers.get('content-type')?.includes('application/json')) {
//                         return response.text().then(text => {
//                             console.error('Schedule non-JSON response:', text.slice(0, 200));
//                             throw new Error('Received non-JSON response');
//                         });
//                     }
//                     return response.json();
//                 })
//                 .then(data => {
//                     console.log('Schedule fetch response:', data);
//                     const schedule = (data.data && data.message) ? data.data : data;
//                     if (schedule.id && schedule.course_id && schedule.lecturer_id && schedule.hall_id) {
//                         document.getElementById('editScheduleId').value = schedule.id || '';
//                         document.getElementById('editCourseId').value = schedule.course_id || '';
//                         document.getElementById('editLecturerId').value = schedule.lecturer_id || '';
//                         document.getElementById('editHallId').value = schedule.hall_id || '';
//                         document.getElementById('editDayOfWeek').value = schedule.day_of_week || '';
//                         document.getElementById('editStartTime').value = schedule.start_time ? schedule.start_time.slice(0, 5) : '';
//                         document.getElementById('editEndTime').value = schedule.end_time ? schedule.end_time.slice(0, 5) : '';
//                         editError.textContent = '';
//                     } else {
//                         console.error('Unexpected schedule response format:', data);
//                         editError.textContent = 'Failed to load schedule data';
//                         editError.style.color = '#DC3545';
//                     }
//                 })
//                 .catch(error => {
//                     console.error('Schedule fetch error:', error.message);
//                     editError.textContent = `Error: ${error.message}`;
//                     editError.style.color = '#DC3545';
//                 });
//             });
//         });

//         // Delete buttons
//         document.querySelectorAll('.delete-btn').forEach(button => {
//             button.addEventListener('click', function () {
//                 if (!confirm('Are you sure you want to delete this schedule?')) return;
//                 const scheduleId = this.getAttribute('data-id');
//                 const url = `${API_BASE_URL}/admin/class-schedules/${scheduleId}`;
//                 console.log('Deleting schedule:', url);
//                 fetch(url, {
//                     method: 'DELETE',
//                     headers: {
//                         'Content-Type': 'application/json',
//                         'Authorization': `Bearer ${token}`
//                     }
//                 })
//                 .then(response => {
//                     console.log('Delete response status:', response.status, 'Content-Type:', response.headers.get('content-type'));
//                     if (!response.ok) {
//                         return response.text().then(text => {
//                             console.error('Delete response text:', text.slice(0, 200));
//                             throw new Error(`HTTP ${response.status}: ${text.slice(0, 200)}`);
//                         });
//                     }
//                     if (!response.headers.get('content-type')?.includes('application/json')) {
//                         return response.text().then(text => {
//                             console.error('Delete non-JSON response:', text.slice(0, 200));
//                             throw new Error('Received non-JSON response');
//                         });
//                     }
//                     return response.json();
//                 })
//                 .then(data => {
//                     console.log('Delete API Response:', data);
//                     if (data.message || data.id) {
//                         alert('Schedule deleted successfully');
//                         fetchSchedules();
//                     } else {
//                         console.error('Failed to delete schedule:', data);
//                         alert(data.message || 'Failed to delete schedule');
//                     }
//                 })
//                 .catch(error => {
//                     console.error('Delete error:', error.message);
//                     alert(`Error: ${error.message}`);
//                 });
//             });
//         });
//     }

//     // Add schedule form submission
//     if (addScheduleSubmit) {
//         addScheduleSubmit.addEventListener('click', function () {
//             const course_id = document.getElementById('addCourseId').value;
//             const lecturer_id = document.getElementById('addLecturerId').value;
//             const hall_id = document.getElementById('addHallId').value;
//             const day_of_week = document.getElementById('addDayOfWeek').value;
//             const start_time = document.getElementById('addStartTime').value;
//             const end_time = document.getElementById('addEndTime').value;

//             if (!course_id || !lecturer_id || !hall_id || !day_of_week || !start_time || !end_time) {
//                 addError.textContent = 'Please fill in all required fields';
//                 addError.style.color = '#DC3545';
//                 return;
//             }

//             addError.textContent = 'Saving...';
//             addScheduleSubmit.disabled = true;

//             const url = `${API_BASE_URL}/admin/class-schedules`;
//             console.log('Adding schedule:', url, { course_id, lecturer_id, hall_id, day_of_week, start_time, end_time });
//             fetch(url, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': `Bearer ${token}`
//                 },
//                 body: JSON.stringify({ course_id: parseInt(course_id), lecturer_id: parseInt(lecturer_id), hall_id: parseInt(hall_id), day_of_week, start_time, end_time })
//             })
//             .then(response => {
//                 console.log('Add schedule response status:', response.status, 'Content-Type:', response.headers.get('content-type'));
//                 if (!response.ok) {
//                     return response.text().then(text => {
//                         console.error('Add schedule response text:', text.slice(0, 200));
//                         throw new Error(`HTTP ${response.status}: ${text.slice(0, 200)}`);
//                     });
//                 }
//                 if (!response.headers.get('content-type')?.includes('application/json')) {
//                     return response.text().then(text => {
//                         console.error('Add schedule non-JSON response:', text.slice(0, 200));
//                         throw new Error('Received non-JSON response');
//                     });
//                 }
//                 return response.json();
//             })
//             .then(data => {
//                 console.log('Add Schedule API Response:', data);
//                 if (data.message || data.id) {
//                     addError.textContent = 'Schedule added successfully';
//                     addError.style.color = '#28A745';
//                     addScheduleForm.reset();
//                     fetchSchedules();
//                     setTimeout(() => {
//                         bootstrap.Modal.getInstance(document.getElementById('addScheduleModal')).hide();
//                         addError.textContent = '';
//                         addError.style.color = '';
//                     }, 2000);
//                 } else {
//                     addError.textContent = data.message || 'Failed to add schedule';
//                     addError.style.color = '#DC3545';
//                 }
//                 addScheduleSubmit.disabled = false;
//             })
//             .catch(error => {
//                 console.error('Add schedule error:', error.message);
//                 addError.textContent = `Error: ${error.message}`;
//                 addError.style.color = '#DC3545';
//                 addScheduleSubmit.disabled = false;
//             });
//         });
//     }

//     // Edit schedule form submission
//     if (editScheduleSubmit) {
//         editScheduleSubmit.addEventListener('click', function () {
//             const id = document.getElementById('editScheduleId').value;
//             const course_id = document.getElementById('editCourseId').value;
//             const lecturer_id = document.getElementById('editLecturerId').value;
//             const hall_id = document.getElementById('editHallId').value;
//             const day_of_week = document.getElementById('editDayOfWeek').value;
//             const start_time = document.getElementById('editStartTime').value;
//             const end_time = document.getElementById('editEndTime').value;

//             if (!id || !course_id || !lecturer_id || !hall_id || !day_of_week || !start_time || !end_time) {
//                 editError.textContent = 'Please fill in all required fields';
//                 editError.style.color = '#DC3545';
//                 return;
//             }

//             editError.textContent = 'Saving...';
//             editScheduleSubmit.disabled = true;

//             const url = `${API_BASE_URL}/admin/class-schedules/${id}`;
//             console.log('Editing schedule:', url, { id, course_id, lecturer_id, hall_id, day_of_week, start_time, end_time });
//             fetch(url, {
//                 method: 'PUT',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': `Bearer ${token}`
//                 },
//                 body: JSON.stringify({ course_id: parseInt(course_id), lecturer_id: parseInt(lecturer_id), hall_id: parseInt(hall_id), day_of_week, start_time, end_time })
//             })
//             .then(response => {
//                 console.log('Edit schedule response status:', response.status, 'Content-Type:', response.headers.get('content-type'));
//                 if (!response.ok) {
//                     return response.text().then(text => {
//                         console.error('Edit schedule response text:', text.slice(0, 200));
//                         throw new Error(`HTTP ${response.status}: ${text.slice(0, 200)}`);
//                     });
//                 }
//                 if (!response.headers.get('content-type')?.includes('application/json')) {
//                     return response.text().then(text => {
//                         console.error('Edit schedule non-JSON response:', text.slice(0, 200));
//                         throw new Error('Received non-JSON response');
//                     });
//                 }
//                 return response.json();
//             })
//             .then(data => {
//                 console.log('Edit Schedule API Response:', data);
//                 if (data.id || (data.message && data.data)) {
//                     editError.textContent = 'Schedule updated successfully';
//                     editError.style.color = '#28A745';
//                     fetchSchedules();
//                     setTimeout(() => {
//                         bootstrap.Modal.getInstance(document.getElementById('editScheduleModal')).hide();
//                         editError.textContent = '';
//                         editError.style.color = '';
//                     }, 2000);
//                 } else {
//                     console.error('Unexpected edit response format:', data);
//                     editError.textContent = data.message || 'Failed to update schedule';
//                     editError.style.color = '#DC3545';
//                 }
//                 editScheduleSubmit.disabled = false;
//             })
//             .catch(error => {
//                 console.error('Edit schedule error:', error.message);
//                 editError.textContent = `Error: ${error.message}`;
//                 editError.style.color = '#DC3545';
//                 editScheduleSubmit.disabled = false;
//             });
//         });
//     }

//     // Initial fetch
//     fetchCourses();
//     fetchLecturers();
//     fetchHalls();
//     fetchSchedules();
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
            window.location.href = '../../../index.html';
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

    // Get table and modal elements
    const schedulesTable = document.querySelector('#schedules-table');
    const addScheduleForm = document.getElementById('addScheduleForm');
    const addScheduleSubmit = document.getElementById('addScheduleSubmit');
    const addError = document.getElementById('addError');
    const addCourseId = document.getElementById('addCourseId');
    const addHallId = document.getElementById('addHallId');
    const editScheduleForm = document.getElementById('editScheduleForm');
    const editScheduleSubmit = document.getElementById('editScheduleSubmit');
    const editError = document.getElementById('editError');
    const editCourseId = document.getElementById('editCourseId');
    const editHallId = document.getElementById('editHallId');

    // Debug: Log elements and token
    console.log('Schedules table element:', schedulesTable);
    console.log('Add course dropdown:', addCourseId);
    console.log('Add hall dropdown:', addHallId);
    console.log('Edit course dropdown:', editCourseId);
    console.log('Edit hall dropdown:', editHallId);
    console.log('Token:', token);
    console.log('API_BASE_URL:', API_BASE_URL);

    // Show loading state
    if (schedulesTable) {
        schedulesTable.innerHTML = '<tr><td colspan="8" class="text-center">Loading...</td></tr>';
    } else {
        console.error('Schedules table not found in DOM');
    }

    // Fetch dropdown data
    let courses = [];
    let halls = [];

    function fetchCourses() {
        const url = `${API_BASE_URL}/admin/courses`;
        fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        .then(res => res.json())
        .then(data => {
            courses = (data.message === 'Courses fetched' && data.data) ? data.data : data;
            populateCourseDropdowns();
        })
        .catch(error => {
            console.error('Courses fetch error:', error.message);
            if (addCourseId) addCourseId.innerHTML = '<option value="" disabled selected>Error loading courses</option>';
            if (editCourseId) editCourseId.innerHTML = '<option value="" disabled selected>Error loading courses</option>';
        });
    }

    function fetchHalls() {
        const url = `${API_BASE_URL}/admin/halls`;
        fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        .then(res => res.json())
        .then(data => {
            halls = (data.message === 'Halls fetched' && data.data) ? data.data : data;
            populateHallDropdowns();
        })
        .catch(error => {
            console.error('Halls fetch error:', error.message);
            if (addHallId) addHallId.innerHTML = '<option value="" disabled selected>Error loading halls</option>';
            if (editHallId) editHallId.innerHTML = '<option value="" disabled selected>Error loading halls</option>';
        });
    }

    function populateCourseDropdowns() {
        const options = courses.length > 0
            ? courses.map(course => 
                `<option value="${course.id}">${course.course_title} (${course.course_code})</option>`
            ).join('')
            : '<option value="" disabled selected>No courses available</option>';

        if (addCourseId) addCourseId.innerHTML = '<option value="" disabled selected>Select course</option>' + options;
        if (editCourseId) editCourseId.innerHTML = '<option value="" disabled selected>Select course</option>' + options;
    }

    function populateHallDropdowns() {
        const options = halls.length > 0
            ? halls.map(hall => 
                `<option value="${hall.id}">${hall.hall_name}</option>`
            ).join('')
            : '<option value="" disabled selected>No halls available</option>';

        if (addHallId) addHallId.innerHTML = '<option value="" disabled selected>Select hall</option>' + options;
        if (editHallId) editHallId.innerHTML = '<option value="" disabled selected>Select hall</option>' + options;
    }

    // Fetch schedules
    function fetchSchedules() {
        const url = `${API_BASE_URL}/admin/class-schedules`;
        fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        .then(res => res.json())
        .then(data => {
            if (data.data && Array.isArray(data.data) && schedulesTable) {
                const schedules = data.data;
                if (schedules.length > 0) {
                    schedulesTable.innerHTML = schedules.map(schedule => `
                        <tr>
                            <td> ${schedule.id || 'N/A'}</td>
                            <td>${schedule.course_title || 'N/A'} (${schedule.course_code || ''})</td>
                            <td>${schedule.lecturer || 'N/A'}</td>
                            <td>${schedule.hall_name || 'N/A'}</td>
                            <td>${schedule.day || 'N/A'}</td>
                            <td>${schedule.start_time ? schedule.start_time.slice(0, 5) : 'N/A'}</td>
                            <td>${schedule.end_time ? schedule.end_time.slice(0, 5) : 'N/A'}</td>
                            <td>${schedule.status || 'N/A'}</td>
                            <td>
                                <button class="btn btn-sm btn-warning edit-btn" data-id="${schedule.id || ''}" data-bs-toggle="modal" data-bs-target="#editScheduleModal">
                                    <i class="fas fa-edit"></i> Edit
                                </button>
                                <button class="btn btn-sm btn-danger delete-btn" data-id="${schedule.id || ''}">
                                    <i class="fas fa-trash"></i> Delete
                                </button>
                            </td>
                        </tr>
                    `).join('');
                } else {
                    schedulesTable.innerHTML = '<tr><td colspan="8" class="text-center">No schedules found</td></tr>';
                }
                attachButtonListeners();
            }
        })
        .catch(error => {
            console.error('Schedules fetch error:', error.message);
            if (schedulesTable) schedulesTable.innerHTML = '<tr><td colspan="8" class="text-center">Failed to load</td></tr>';
        });
    }

    // Attach edit and delete button listeners
    function attachButtonListeners() {
        // Edit buttons
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', function () {
                const scheduleId = this.getAttribute('data-id');
                const url = `${API_BASE_URL}/admin/class-schedules/${scheduleId}`;
                fetch(url, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                })
                .then(res => res.json())
               
                .then(data => {
                    const schedule = (data.data && data.message) ? data.data : data;
                    if (schedule.id) {
                        // // document.getElementById('editScheduleId').value = schedule.id || '';
                        // // document.getElementById('editCourseName').value = schedule.course_title || ''; // ✅ display course name only
                        // document.getElementById('editCourseTitle').value = schedule.course_title || '';
                        // document.getElementById('editHallId').value = schedule.hall_id || '';
                        // document.getElementById('editDayOfWeek').value = schedule.day || ''; // ✅ use "day" not "day_of_week"
                        // document.getElementById('editStartTime').value = schedule.start_time ? schedule.start_time.slice(0, 5) : '';
                        // document.getElementById('editEndTime').value = schedule.end_time ? schedule.end_time.slice(0, 5) : '';
                        document.getElementById('editScheduleId').value = schedule.id || '';
                        document.getElementById('editCourseTitle').value =
                            `${schedule.course_title} (${schedule.course_code})` || '';
                        document.getElementById('editCourseId').value = schedule.course_id || '';
                        document.getElementById('editHallId').value = schedule.hall_id || '';
                        document.getElementById('editDayOfWeek').value = schedule.day || '';
                        document.getElementById('editStartTime').value = schedule.start_time ? schedule.start_time.slice(0, 5) : '';
                        document.getElementById('editEndTime').value = schedule.end_time ? schedule.end_time.slice(0, 5) : '';
                        editError.textContent = '';
                    } else {
                        editError.textContent = 'Failed to load schedule data';
                        editError.style.color = '#DC3545';
                    }
               
                })
                .catch(error => {
                    console.error('Schedule fetch error:', error.message);
                    editError.textContent = `Error: ${error.message}`;
                    editError.style.color = '#DC3545';
                });
            });
        });

        // Delete buttons
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', function () {
                if (!confirm('Are you sure you want to delete this schedule?')) return;
                const scheduleId = this.getAttribute('data-id');
                const url = `${API_BASE_URL}/admin/class-schedules/${scheduleId}`;
                fetch(url, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                })
                .then(res => res.json())
                .then(data => {
                    alert('Schedule deleted successfully');
                    fetchSchedules();
                })
                .catch(error => {
                    console.error('Delete error:', error.message);
                    alert(`Error: ${error.message}`);
                });
            });
        });
    }

    // Add schedule form submission
    if (addScheduleSubmit) {
        addScheduleSubmit.addEventListener('click', function () {
            const course_id = document.getElementById('addCourseId').value;
            const hall_id = document.getElementById('addHallId').value;
            const day = document.getElementById('addDayOfWeek').value;
            const start_time = document.getElementById('addStartTime').value;
            const end_time = document.getElementById('addEndTime').value;

            if (!course_id || !hall_id || !day || !start_time || !end_time) {
                addError.textContent = 'Please fill in all required fields';
                addError.style.color = '#DC3545';
                return;
            }

            addError.textContent = 'Saving...';
            addScheduleSubmit.disabled = true;

            const url = `${API_BASE_URL}/admin/class-schedules`;
            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ course_id: parseInt(course_id), hall_id: parseInt(hall_id), day, start_time, end_time })
            })
            .then(res => res.json())
            .then(data => {
                addError.textContent = 'Schedule added successfully';
                addError.style.color = '#28A745';
                addScheduleForm.reset();
                fetchSchedules();
                setTimeout(() => {
                    bootstrap.Modal.getInstance(document.getElementById('addScheduleModal')).hide();
                    addError.textContent = '';
                }, 2000);
                addScheduleSubmit.disabled = false;
            })
            .catch(error => {
                console.error('Add schedule error:', error.message);
                addError.textContent = `Error: ${error.message}`;
                addError.style.color = '#DC3545';
                addScheduleSubmit.disabled = false;
            });
        });
    }

    // Edit schedule form submission
    if (editScheduleSubmit) {
        editScheduleSubmit.addEventListener('click', function () {
            const id = document.getElementById('editScheduleId').value;
            const course_id = document.getElementById('editCourseId').value;
            const hall_id = document.getElementById('editHallId').value;
            const day = document.getElementById('editDayOfWeek').value;
            const start_time = document.getElementById('editStartTime').value;
            const end_time = document.getElementById('editEndTime').value;

            if (!id || !course_id || !hall_id || !day || !start_time || !end_time) {
                editError.textContent = 'Please fill in all required fields';
                editError.style.color = '#DC3545';
                return;
            }

            editError.textContent = 'Saving...';
            editScheduleSubmit.disabled = true;

            const url = `${API_BASE_URL}/admin/class-schedules/${id}`;
            fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ course_id: parseInt(course_id), hall_id: parseInt(hall_id), day, start_time, end_time })
            })
            .then(res => res.json())
            .then(data => {
                editError.textContent = 'Schedule updated successfully';
                editError.style.color = '#28A745';
                fetchSchedules();
                setTimeout(() => {
                    bootstrap.Modal.getInstance(document.getElementById('editScheduleModal')).hide();
                    editError.textContent = '';
                }, 2000);
                editScheduleSubmit.disabled = false;
            })
            .catch(error => {
                console.error('Edit schedule error:', error.message);
                editError.textContent = `Error: ${error.message}`;
                editError.style.color = '#DC3545';
                editScheduleSubmit.disabled = false;
            });
        });
    }

    // Initial fetch
    fetchCourses();
    fetchHalls();
    fetchSchedules();
});
