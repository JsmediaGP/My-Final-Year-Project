document.addEventListener('DOMContentLoaded', function () {
    // Sidebar toggle for mobile
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function () {
            document.querySelector('.sidebar').classList.toggle('active');
        });
    }

    // Check for admin role
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (!token || role.toLowerCase() !== 'admin') {
        alert('Unauthorized access. Please log in as an admin.');
        window.location.href = '../../index.html';
        return;
    }

    // Get table and modal elements
    const coursesTable = document.querySelector('#courses-table');
    const addCourseForm = document.getElementById('addCourseForm');
    const addCourseSubmit = document.getElementById('addCourseSubmit');
    const addError = document.getElementById('addError');
    const addLecturerId = document.getElementById('addLecturerId');
    const editCourseForm = document.getElementById('editCourseForm');
    const editCourseSubmit = document.getElementById('editCourseSubmit');
    const editError = document.getElementById('editError');
    const editLecturerId = document.getElementById('editLecturerId');

    // Debug: Log table and dropdown elements
    console.log('Courses table element:', coursesTable);
    console.log('Add lecturer dropdown:', addLecturerId);
    console.log('Edit lecturer dropdown:', editLecturerId);

    // Show loading state
    if (coursesTable) {
        coursesTable.innerHTML = '<tr><td colspan="6" class="text-center">Loading...</td></tr>';
    } else {
        console.error('Courses table not found in DOM');
    }

    // Fetch lecturers for dropdowns
    let lecturers = [];
    function fetchLecturers() {
        fetch(`${API_BASE_URL}/admin/users/lecturers`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json().then(data => ({ status: response.status, data })))
        .then(({ status, data }) => {
            console.log('Lecturers API Response:', data);
            if (status >= 200 && status < 300 && data.data) {
                lecturers = data.data;
                populateLecturerDropdowns();
            } else {
                console.error('Failed to fetch lecturers:', data);
                if (addLecturerId) addLecturerId.innerHTML = '<option value="" disabled selected>Error loading lecturers</option>';
                if (editLecturerId) editLecturerId.innerHTML = '<option value="" disabled selected>Error loading lecturers</option>';
            }
        })
        .catch(error => {
            console.error('Lecturers fetch error:', error);
            if (addLecturerId) addLecturerId.innerHTML = '<option value="" disabled selected>Error loading lecturers</option>';
            if (editLecturerId) editLecturerId.innerHTML = '<option value="" disabled selected>Error loading lecturers</option>';
        });
    }

    
    function populateLecturerDropdowns () {
    const options = lecturers.length > 0
        ? lecturers.map(l => `
            <option value="${l.id}">
                ${l.first_name} ${l.last_name}
            </option>
        `).join('')
        : '<option value="" disabled selected>No lecturers available</option>';

    if (addLecturerId)
        addLecturerId.innerHTML = '<option value="" disabled selected>Select lecturer</option>' + options;

    if (editLecturerId)
        editLecturerId.innerHTML = '<option value="" disabled selected>Select lecturer</option>' + options;
    }


    // Fetch courses
    function fetchCourses() {
        fetch(`${API_BASE_URL}/admin/courses`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json().then(data => ({ status: response.status, data })))
        .then(({ status, data }) => {
            console.log('Courses API Response:', data);
            if (status >= 200 && status < 300 && data.data && coursesTable) {
                const courses = data.data || [];
                if (courses.length > 0) {
                    coursesTable.innerHTML = courses.map(course => `
                        <tr>
                            <td>${course.id || 'N/A'}</td>
                            <td>${course.course_title || 'N/A'}</td>
                            <td>${course.course_code || 'N/A'}</td>
                            <td>${course.unit || 'N/A'}</td>
                            <td>${course.lecturer ? `${course.lecturer.first_name} ${course.lecturer.last_name}` : 'N/A'}</td>
                            <td>
                                <button class="btn btn-sm btn-warning edit-btn" data-id="${course.id}" data-bs-toggle="modal" data-bs-target="#editCourseModal"><i class="fas fa-edit"></i></button>
                                <button class="btn btn-sm btn-danger delete-btn" data-id="${course.id}"><i class="fas fa-trash"></i></button>
                            </td>
                        </tr>
                    `).join('');
                } else {
                    coursesTable.innerHTML = '<tr><td colspan="6" class="text-center">No courses found</td></tr>';
                }
                attachButtonListeners();
            } else {
                console.error('Failed to fetch courses:', data);
                if (coursesTable) coursesTable.innerHTML = '<tr><td colspan="6" class="text-center">Failed to load</td></tr>';
            }
        })
        .catch(error => {
            console.error('Courses fetch error:', error);
            if (coursesTable) coursesTable.innerHTML = '<tr><td colspan="6" class="text-center">Failed to load</td></tr>';
        });
    }

    // Attach edit and delete button listeners
    function attachButtonListeners() {
    // Edit buttons
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', function () {
            const courseId = this.getAttribute('data-id');
            console.log('Fetching course:', `${API_BASE_URL}/admin/courses/${courseId}`);
            fetch(`${API_BASE_URL}/admin/courses/${courseId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(response => {
                console.log('Course fetch response status:', response.status);
                if (!response.ok) {
                    return response.text().then(text => {
                        console.error('Course fetch response text:', text.slice(0, 200)); // Limit for readability
                        throw new Error(`HTTP ${response.status}: ${text.slice(0, 200)}`);
                    });
                }
                return response.json();
            })
            .then(data => {
                console.log('Course fetch response:', data);
                if (data.id && data.course_title && data.course_code && data.unit && data.lecturer_id) {
                    document.getElementById('editCourseId').value = data.id || '';
                    document.getElementById('editCourseTitle').value = data.course_title || '';
                    document.getElementById('editCourseCode').value = data.course_code || '';
                    document.getElementById('editUnit').value = data.unit || '';
                    document.getElementById('editLecturerId').value = data.lecturer_id || '';
                    editError.textContent = ''; // Clear any previous error
                } else {
                    console.error('Unexpected course response format:', data);
                    editError.textContent = `Error: ${error.message}`;
                }
            })
            .catch(error => {
                console.error('Course fetch error:', error.message);
                editError.textContent = `Error: ${error.message}`;
            });
        });
    });

        // Delete buttons
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', function () {
                if (!confirm('Are you sure you want to delete this course?')) return;
                const courseId = this.getAttribute('data-id');
                fetch(`${API_BASE_URL}/admin/courses/${courseId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                })
                .then(response => response.json().then(data => ({ status: response.status, data })))
                .then(({ status, data }) => {
                    console.log('Delete API Response:', data);
                    if (status >= 200 && status < 300) {
                        alert('Course deleted successfully');
                        fetchCourses();
                    } else {
                        console.error('Failed to delete course:', data);
                        alert(data.message || 'Failed to delete course');
                    }
                })
                .catch(error => {
                    console.error('Delete error:', error);
                    alert('Error connecting to server');
                });
            });
        });
    }

    // Add course form submission
    if (addCourseSubmit) {
        addCourseSubmit.addEventListener('click', function () {
            const course_title = document.getElementById('addCourseTitle').value;
            const course_code = document.getElementById('addCourseCode').value;
            const unit = document.getElementById('addUnit').value;
            const lecturer_id = document.getElementById('addLecturerId').value;

            if (!course_title || !course_code || !unit || !lecturer_id) {
                addError.textContent = 'Please fill in all required fields';
                return;
            }

            addError.textContent = 'Saving...';
            addCourseSubmit.disabled = true;

            fetch(`${API_BASE_URL}/admin/courses/store`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ course_title, course_code, unit: parseInt(unit), lecturer_id: parseInt(lecturer_id) })
            })
            .then(response => response.json().then(data => ({ status: response.status, data })))
            .then(({ status, data }) => {
                console.log('Add Course API Response:', data);
                if (status >= 200 && status < 300) {
                    addError.textContent = 'Course added successfully';
                    addError.style.color = 'green';
                    addCourseForm.reset();
                    fetchCourses();
                    setTimeout(() => {
                        bootstrap.Modal.getInstance(document.getElementById('addCourseModal')).hide();
                        addError.textContent = '';
                        addError.style.color = '';
                    }, 2000);
                } else {
                    addError.textContent = data.message || 'Failed to add course';
                    addError.style.color = 'red';
                }
                addCourseSubmit.disabled = false;
            })
            .catch(error => {
                console.error('Add course error:', error);
                addError.textContent = 'Error connecting to server';
                addError.style.color = 'red';
                addCourseSubmit.disabled = false;
            });
        });
    }

    // Edit course form submission
    if (editCourseSubmit) {
        editCourseSubmit.addEventListener('click', function () {
            const id = document.getElementById('editCourseId').value;
            const course_title = document.getElementById('editCourseTitle').value;
            const course_code = document.getElementById('editCourseCode').value;
            const unit = document.getElementById('editUnit').value;
            const lecturer_id = document.getElementById('editLecturerId').value;

            if (!id || !course_title || !course_code || !unit || !lecturer_id) {
                editError.textContent = 'Please fill in all required fields';
                return;
            }

            editError.textContent = 'Saving...';
            editCourseSubmit.disabled = true;

            console.log('Editing course:', { id, course_title, course_code, unit, lecturer_id });
            fetch(`${API_BASE_URL}/admin/courses/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ course_title, course_code, unit: parseInt(unit), lecturer_id: parseInt(lecturer_id) })
            })
            .then(response => {
                console.log('Edit course response status:', response.status);
                if (!response.ok) {
                    return response.text().then(text => {
                        console.error('Edit course response text:', text.slice(0, 200)); // Limit for readability
                        throw new Error(`HTTP ${response.status}: ${text.slice(0, 200)}`);
                    });
                }
                return response.json();
            })
            .then(data => {
                console.log('Edit Course API Response:', data);
                if (data.message) {
                    editError.textContent = 'Course updated successfully';
                    editError.style.color = 'green';
                    fetchCourses(); // Refresh table
                    setTimeout(() => {
                        bootstrap.Modal.getInstance(document.getElementById('editCourseModal')).hide();
                        editError.textContent = '';
                        editError.style.color = '';
                    }, 2000);
                } else {
                    editError.textContent = data.message || 'Failed to update course';
                    editError.style.color = 'red';
                }
                editCourseSubmit.disabled = false;
            })
            .catch(error => {
                console.error('Edit course error:', error.message);
                editError.textContent = `Error: ${error.message}`;
                editError.style.color = 'red';
                editCourseSubmit.disabled = false;
            });
        });
    }

    // Initial fetch
    fetchLecturers();
    fetchCourses();
});