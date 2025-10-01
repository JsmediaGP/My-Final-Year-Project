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

//     // Check for student role
//     const token = localStorage.getItem('token');
//     const role = localStorage.getItem('role');
//     if (!token || role.toLowerCase() !== 'student') {
//         alert('Unauthorized access. Please log in as a student.');
//         window.location.href = '../../index.html';
//         return;
//     }

//     // Get elements
//     const coursesTable = document.querySelector('#courses-table');
//     const courseIdSelect = document.getElementById('courseId');
//     const registerCourseSubmit = document.getElementById('registerCourseSubmit');
//     const registerError = document.getElementById('registerError');

//     // Debug: Log elements and token
//     console.log('Courses table element:', coursesTable);
//     console.log('Course select element:', courseIdSelect);
//     console.log('Token:', token);
//     console.log('API_BASE_URL:', API_BASE_URL || 'Not defined! Check config.js');

//     // Show loading state
//     if (coursesTable) {
//         coursesTable.innerHTML = '<tr><td colspan="5" class="text-center">Loading...</td></tr>';
//     } else {
//         console.error('Courses table not found in DOM');
//     }

//     // Fetch student's registered courses
//     function fetchRegisteredCourses() {
//         const url = `${API_BASE_URL}/student/course-registrations/student/{id}`;
//         console.log('Fetching registered courses from:', url);
//         fetch(url, {
//             method: 'GET',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${token}`
//             },
//             signal: AbortSignal.timeout(5000)
//         })
//         .then(response => {
//             console.log('Registered courses response status:', response.status, 'Content-Type:', response.headers.get('content-type'));
//             if (!response.ok) {
//                 return response.text().then(text => {
//                     console.error('Registered courses response text:', text.slice(0, 200));
//                     throw new Error(HTTP `${response.status}: ${text.slice(0, 200)}`);
//                 });
//             }
//             return response.json();
//         })
//         .then(data => {
//             console.log('Registered Courses API Response:', data);
//             if (data.message === 'Student courses fetched' && data.data && coursesTable) {
//                 const courses = data.data;
//                 if (courses.length > 0) {
//                     coursesTable.innerHTML = courses.map(course => `
//                         <tr>
//                             <td>${course.id || 'N/A'}</td>
//                             <td>${course.course_title || 'N/A'}</td>
//                             <td>${course.course_code || 'N/A'}</td>
//                             <td>${course.unit || 'N/A'}</td>
//                             <td>
//                                 <button class="btn btn-sm btn-danger delete-course-btn" data-id="${course.id}"><i class="fas fa-trash"></i> Delete</button>
//                             </td>
//                         </tr>
//                     `).join('');
//                     attachDeleteListeners();
//                 } else {
//                     coursesTable.innerHTML = '<tr><td colspan="5" class="text-center">No courses registered</td></tr>';
//                 }
//             } else {
//                 console.error('Unexpected registered courses response format:', data);
//                 if (coursesTable) coursesTable.innerHTML = '<tr><td colspan="5" class="text-center">Failed to load</td></tr>';
//             }
//         })
//         .catch(error => {
//             console.error('Registered courses fetch error:', error.message);
//             if (coursesTable) coursesTable.innerHTML = '<tr><td colspan="5" class="text-center">Failed to load: ' + error.message + '</td></tr>';
//         });
//     }

//     // Fetch available courses for registration
//     function fetchAvailableCourses() {
//         const url = `${API_BASE_URL}/student/allCourses`;
//         console.log('Fetching available courses from:', url);
//         fetch(url, {
//             method: 'GET',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${token}`
//             },
//             signal: AbortSignal.timeout(5000)
//         })
//         .then(response => {
//             console.log('Available courses response status:', response.status, 'Content-Type:', response.headers.get('content-type'));
//             if (!response.ok) {
//                 return response.text().then(text => {
//                     console.error('Available courses response text:', text.slice(0, 200));
//                     throw new Error(HTTP `${response.status}: ${text.slice(0, 200)}`);
//                 });
//             }
//             return response.json();
//         })
//         .then(data => {
//             console.log('Available Courses API Response:', data);
//             if (data.message === 'Courses fetched' && data.data && courseIdSelect) {
//                 const courses = data.data;
//                 if (courses.length > 0) {
//                     courseIdSelect.innerHTML = '<option value="" disabled selected>Select course</option>' + 
//                         courses.map(course => <option value="${course.id}">${course.course_title} (${course.course_code})</option>).join('');
//                 } else {
//                     courseIdSelect.innerHTML = '<option value="" disabled selected>No courses available</option>';
//                 }
//             } else {
//                 console.error('Unexpected available courses response format:', data);
//                 if (courseIdSelect) courseIdSelect.innerHTML = '<option value="" disabled selected>Failed to load courses</option>';
//             }
//         })
//         .catch(error => {
//             console.error('Available courses fetch error:', error.message);
//             if (courseIdSelect) courseIdSelect.innerHTML = '<option value="" disabled selected>Failed to load: ' + error.message + '</option>';
//         });
//     }

//     // Attach delete button listeners
//     function attachDeleteListeners() {
//         document.querySelectorAll('.delete-course-btn').forEach(button => {
//             button.addEventListener('click', function () {
//                 if (!confirm('Are you sure you want to delete this course?')) return;
//                 const courseId = this.getAttribute('data-id');
//                 const url = `${API_BASE_URL}/student/courses/${courseId}`;
//                 console.log('Deleting course:', url);
//                 fetch(url, {
//                     method: 'DELETE',
//                     headers: {
//                         'Content-Type': 'application/json',
//                         'Authorization': `Bearer ${token}`
//                     },
//                     signal: AbortSignal.timeout(5000)
//                 })
//                 .then(response => {
//                     console.log('Delete course response status:', response.status, 'Content-Type:', response.headers.get('content-type'));
//                     if (!response.ok) {
//                         return response.text().then(text => {
//                             console.error('Delete course response text:', text.slice(0, 200));
//                             throw new Error(HTTP `${response.status}: ${text.slice(0, 200)}`);
//                         });
//                     }
//                     return response.json();
//                 })
//                 .then(data => {
//                     console.log('Delete Course API Response:', data);
//                     if (data.message === 'Course deleted') {
//                         alert('Course deleted successfully');
//                         fetchRegisteredCourses();
//                     } else {
//                         console.error('Unexpected delete response format:', data);
//                         alert('Failed to delete course');
//                     }
//                 })
//                 .catch(error => {
//                     console.error('Delete course error:', error.message);
//                     alert('Error: ' + error.message);
//                 });
//             });
//         });
//     }

//     // Register course form submission
//     if (registerCourseSubmit) {
//         registerCourseSubmit.addEventListener('click', function () {
//             const courseId = courseIdSelect.value;
//             if (!courseId) {
//                 registerError.textContent = 'Please select a course';
//                 registerError.style.color = '#DC3545';
//                 return;
//             }

//             registerError.textContent = 'Registering...';
//             registerError.style.color = '#007BFF';
//             registerCourseSubmit.disabled = true;

//             const url = `${API_BASE_URL}/student/course-registrations`;
//             console.log('Registering course:', url, { course_id: courseId });
//             fetch(url, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': `Bearer ${token}`
//                 },
//                 body: JSON.stringify({ course_id: parseInt(courseId) }),
//                 signal: AbortSignal.timeout(5000)
//             })
//             .then(response => {
//                 console.log('Register course response status:', response.status, 'Content-Type:', response.headers.get('content-type'));
//                 if (!response.ok) {
//                     return response.text().then(text => {
//                         console.error('Register course response text:', text.slice(0, 200));
//                         throw new Error(HTTP `${response.status}: ${text.slice(0, 200)}`);
//                     });
//                 }
//                 return response.json();
//             })
//             .then(data => {
//                 console.log('Register Course API Response:', data);
//                 if (data.message === 'Course registered') {
//                     registerError.textContent = 'Course registered successfully';
//                     registerError.style.color = '#28A745';
//                     fetchRegisteredCourses();
//                     setTimeout(() => {
//                         bootstrap.Modal.getInstance(document.getElementById('registerCourseModal')).hide();
//                         registerError.textContent = '';
//                         registerError.style.color = '';
//                     }, 2000);
//                 } else {
//                     registerError.textContent = data.message || 'Failed to register course';
//                     registerError.style.color = '#DC3545';
//                 }
//                 registerCourseSubmit.disabled = false;
//             })
//             .catch(error => {
//                 console.error('Register course error:', error.message);
//                 registerError.textContent = 'Error: ' + error.message;
//                 registerError.style.color = '#DC3545';
//                 registerCourseSubmit.disabled = false;
//             });
//         });
//     }

//     // Initial fetch
//     fetchRegisteredCourses();
//     fetchAvailableCourses();
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

    // Check for student role
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (!token || role.toLowerCase() !== 'student') {
        alert('Unauthorized access. Please log in as a student.');
        window.location.href = '../../index.html';
        return;
    }

    // Get elements
    const coursesTable = document.querySelector('#courses-table');
    const courseIdSelect = document.getElementById('courseId');
    const registerCourseSubmit = document.getElementById('registerCourseSubmit');
    const registerError = document.getElementById('registerError');

    // Debug logs
    console.log('Courses table element:', coursesTable);
    console.log('Course select element:', courseIdSelect);
    console.log('Token:', token);
    console.log('API_BASE_URL:', API_BASE_URL || 'Not defined! Check config.js');

    // Show loading state
    if (coursesTable) {
        coursesTable.innerHTML = '<tr><td colspan="5" class="text-center">Loading...</td></tr>';
    }

    // Fetch student's registered courses
    function fetchRegisteredCourses() {
        const url = `${API_BASE_URL}/student/courses`;
        console.log('Fetching registered courses from:', url);

        fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log('Registered Courses API Response:', data);
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
                                <button class="btn btn-sm btn-danger delete-course-btn" data-id="${course.id}">
                                    <i class="fas fa-trash"></i> Delete
                                </button>
                            </td>
                        </tr>
                    `).join('');
                    attachDeleteListeners();
                } else {
                    coursesTable.innerHTML = '<tr><td colspan="5" class="text-center">No courses registered</td></tr>';
                }
            } else {
                coursesTable.innerHTML = '<tr><td colspan="5" class="text-center">Failed to load</td></tr>';
            }
        })
        .catch(error => {
            console.error('Registered courses fetch error:', error.message);
            if (coursesTable) coursesTable.innerHTML = '<tr><td colspan="5" class="text-center">Error: ' + error.message + '</td></tr>';
        });
    }

    // Fetch available courses for registration
    function fetchAvailableCourses() {
        const url = `${API_BASE_URL}/student/availableCourses`;
        console.log('Fetching available courses from:', url);

        fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log('Available Courses API Response:', data);
            if (data.message === 'Courses fetched' && data.data && courseIdSelect) {
                const courses = data.data;
                if (courses.length > 0) {
                    courseIdSelect.innerHTML = '<option value="" disabled selected>Select course</option>' + 
                        courses.map(course => `<option value="${course.id}">${course.course_title} (${course.course_code})</option>`).join('');
                } else {
                    courseIdSelect.innerHTML = '<option value="" disabled selected>No courses available</option>';
                }
            } else {
                courseIdSelect.innerHTML = '<option value="" disabled selected>Failed to load courses</option>';
            }
        })
        .catch(error => {
            console.error('Available courses fetch error:', error.message);
            if (courseIdSelect) courseIdSelect.innerHTML = '<option value="" disabled selected>Error: ' + error.message + '</option>';
        });
    }

    // Attach delete button listeners
    function attachDeleteListeners() {
        document.querySelectorAll('.delete-course-btn').forEach(button => {
            button.addEventListener('click', function () {
                if (!confirm('Are you sure you want to delete this course?')) return;
                const courseId = this.getAttribute('data-id');
                const url = `${API_BASE_URL}/student/course-registrations/${courseId}`;
                console.log('Deleting course:', url);

                fetch(url, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                })
                .then(response => response.json())
                .then(data => {
                    console.log('Delete Course API Response:', data);
                    if (data.message === 'Course deleted') {
                        alert('Course deleted successfully');
                        fetchRegisteredCourses();
                    } else {
                        alert(data.message || 'Failed to delete course');
                    }
                })
                .catch(error => {
                    console.error('Delete course error:', error.message);
                    alert('Error: ' + error.message);
                });
            });
        });
    }

   
    // Register course form submission
    if (registerCourseSubmit) {
        registerCourseSubmit.addEventListener('click', function () {
            const courseId = courseIdSelect.value;
            const studentId = localStorage.getItem('student_id'); 

            if (!courseId) {
                registerError.textContent = 'Please select a course';
                registerError.style.color = '#DC3545';
                return;
            }

            if (!studentId) {
                registerError.textContent = 'Student ID missing. Please re-login.';
                registerError.style.color = '#DC3545';
                return;
            }

            registerError.textContent = 'Registering...';
            registerError.style.color = '#007BFF';
            registerCourseSubmit.disabled = true;

            const url = `${API_BASE_URL}/student/course-registrations`;
            console.log('Registering course:', url, { student_id: studentId, course_id: courseId });

            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    student_id: parseInt(studentId),
                    course_id: parseInt(courseId)
                })
            })
            .then(response => response.json())
            .then(data => {
                console.log('Register Course API Response:', data);
                if (data.message === 'Course registered successfully') {
                    registerError.textContent = 'Course registered successfully';
                    registerError.style.color = '#28A745';
                    fetchRegisteredCourses();
                    setTimeout(() => {
                        bootstrap.Modal.getInstance(document.getElementById('registerCourseModal')).hide();
                        registerError.textContent = '';
                        registerError.style.color = '';
                    }, 2000);
                } else {
                    registerError.textContent = data.message || 'Failed to register course';
                    registerError.style.color = '#DC3545';
                }
                registerCourseSubmit.disabled = false;
            })
            .catch(error => {
                console.error('Register course error:', error.message);
                registerError.textContent = 'Error: ' + error.message;
                registerError.style.color = '#DC3545';
                registerCourseSubmit.disabled = false;
            });
        });
}


    // Initial fetch
    fetchRegisteredCourses();
    fetchAvailableCourses();
});
