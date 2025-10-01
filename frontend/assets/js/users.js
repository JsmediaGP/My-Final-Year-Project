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
    const usersTable = document.querySelector('#users-table');
    const roleFilter = document.getElementById('roleFilter');
    const addUserForm = document.getElementById('addUserForm');
    const addUserSubmit = document.getElementById('addUserSubmit');
    const addError = document.getElementById('addError');
    const addRole = document.getElementById('addRole');
    const addStudentFields = document.querySelectorAll('.add-student-fields');
    const editUserForm = document.getElementById('editUserForm');
    const editUserSubmit = document.getElementById('editUserSubmit');
    const editError = document.getElementById('editError');
    const editRole = document.getElementById('editRole');
    const editStudentFields = document.querySelectorAll('.edit-student-fields');

    // Debug: Log table element
    console.log('Users table element:', usersTable);

    // Show loading state
    if (usersTable) {
        usersTable.innerHTML = '<tr><td colspan="7" class="text-center">Loading...</td></tr>';
    } else {
        console.error('Users table not found in DOM');
    }

    // Toggle student fields in Add modal
    if (addRole) {
        addRole.addEventListener('change', function () {
            addStudentFields.forEach(field => {
                field.style.display = this.value === 'student' ? 'block' : 'none';
                if (this.value === 'student') {
                    field.querySelector('input').required = true;
                } else {
                    field.querySelector('input').required = false;
                }
            });
        });
    }

    // Fetch users
    let allUsers = [];
    function fetchUsers() {
        fetch(`${API_BASE_URL}/admin/users`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json().then(data => ({ status: response.status, data })))
        .then(({ status, data }) => {
            console.log('Users API Response:', data);
            if (status >= 200 && status < 300 && usersTable) {
                allUsers = data.data || [];
                filterUsers();
            } else {
                console.error('Failed to fetch users:', data);
                if (usersTable) usersTable.innerHTML = '<tr><td colspan="7" class="text-center">Failed to load</td></tr>';
            }
        })
        .catch(error => {
            console.error('Users fetch error:', error);
            if (usersTable) usersTable.innerHTML = '<tr><td colspan="7" class="text-center">Failed to load</td></tr>';
        });
    }

    // Filter users based on role
    // function filterUsers() {
    //     const filter = roleFilter.value;
    //     const filteredUsers = filter === 'all' ? allUsers : allUsers.filter(user => user.role === filter);
    //     if (usersTable) {
    //         if (filteredUsers.length > 0) {
    //             usersTable.innerHTML = filteredUsers.map(user => `
                   
                
    //                 <tr>
                       
    //                     <td>${user.first_name || 'N/A'}</td>
    //                     <td>${user.last_name || 'N/A'}</td>
    //                     <td>${user.email || 'N/A'}</td>
    //                     <td>${user.role || 'N/A'}</td>
    //                     <td>${user.role === 'student' ? (user.matric_number || 'N/A') : 'N/A'}</td>
    //                     <td>${user.role === 'student' ? (user.rfid_uid || 'N/A') : 'N/A'}</td>
    //                      <td>
    //                         ${user.picture 
    //                             ? `<img src="${user.picture}" alt="Profile" class="rounded-circle" width="40" height="40">`
    //                             : `<img src="../../assets/img/default-avatar.png" alt="Default" class="rounded-circle" width="40" height="40">`
    //                         }
    //                     </td>
    //                     <td>
    //                         <button class="btn btn-sm btn-warning edit-btn" data-id="${user.id}" data-bs-toggle="modal" data-bs-target="#editUserModal"><i class="fas fa-edit"></i></button>
    //                         <button class="btn btn-sm btn-danger delete-btn" data-id="${user.id}"><i class="fas fa-trash"></i></button>
    //                     </td>
                        
    //                 </tr>
    //             `).join('');
    //         } else {
    //             usersTable.innerHTML = '<tr><td colspan="7" class="text-center">No users found</td></tr>';
    //         }
    //         attachButtonListeners();
    //     }
    // }

    // Function to display users in the table
// Function to display users in the table
function filterUsers() {
    const filter = roleFilter.value;
    const filteredUsers = filter === 'all' ? allUsers : allUsers.filter(user => user.role === filter);
    if (usersTable) {
        if (filteredUsers.length > 0) {
            usersTable.innerHTML = filteredUsers.map(user => {
                // Use the full URL provided by the backend
                const pictureUrl = user.picture_url;
                
                return `
                    <tr>
                        <td>${user.first_name || 'N/A'}</td>
                        <td>${user.last_name || 'N/A'}</td>
                        <td>${user.email || 'N/A'}</td>
                        <td>${user.role || 'N/A'}</td>
                        <td>${user.role === 'student' ? (user.matric_number || 'N/A') : 'N/A'}</td>
                        <td>${user.role === 'student' ? (user.rfid_uid || 'N/A') : 'N/A'}</td>
                        <td>
                            <img src="${pictureUrl}" alt="Profile Picture" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover;">
                        </td>
                        <td>
                            <button class="btn btn-sm btn-warning edit-btn" data-id="${user.id}" data-bs-toggle="modal" data-bs-target="#editUserModal"><i class="fas fa-edit"></i></button>
                            <button class="btn btn-sm btn-danger delete-btn" data-id="${user.id}"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>
                `;
            }).join('');
        } else {
            usersTable.innerHTML = '<tr><td colspan="8" class="text-center">No users found</td></tr>';
        }
        attachButtonListeners();
    }
}

    // Attach edit and delete button listeners
    function attachButtonListeners() {
        // Edit buttons
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', function () {
                const userId = this.getAttribute('data-id');
                fetch(`${API_BASE_URL}/admin/users/${userId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                })
                .then(response => response.json().then(data => ({ status: response.status, data })))
                .then(({ status, data }) => {
                    console.log('User fetch response:', data);
                    if (status >= 200 && status < 300 && data.data) {
                        document.getElementById('editUserId').value = data.data.id;
                        document.getElementById('editFName').value = data.data.first_name || '';
                        document.getElementById('editLName').value = data.data.last_name || '';
                        document.getElementById('editEmail').value = data.data.email || '';
                        document.getElementById('editRole').value = data.data.role || 'student';
                        document.getElementById('editMatricNumber').value = data.data.matric_number || '';
                        document.getElementById('editRfidUid').value = data.data.rfid_uid || '';
                        editStudentFields.forEach(field => {
                            field.style.display = data.data.role === 'student' ? 'block' : 'none';
                            if (data.data.role === 'student') {
                                field.querySelector('input').required = true;
                            } else {
                                field.querySelector('input').required = false;
                            }
                        });
                    } else {
                        console.error('Failed to fetch user:', data);
                        editError.textContent = data.message || 'Failed to load user data';
                    }
                })
                .catch(error => {
                    console.error('User fetch error:', error);
                    editError.textContent = 'Error connecting to server';
                });
            });
        });

        // Delete buttons
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', function () {
                if (!confirm('Are you sure you want to delete this user?')) return;
                const userId = this.getAttribute('data-id');
                fetch(`${API_BASE_URL}/admin/users/${userId}`, {
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
                        alert('User deleted successfully');
                        fetchUsers();
                    } else {
                        console.error('Failed to delete user:', data);
                        alert(data.message || 'Failed to delete user');
                    }
                })
                .catch(error => {
                    console.error('Delete error:', error);
                    alert('Error connecting to server');
                });
            });
        });
    }

    // // Add user form submission

    // Add user form submission
if (addUserSubmit) {
    addUserSubmit.addEventListener('click', function () {
        const addUserModal = document.getElementById('addUserModal');

        // Create a FormData object from the form element.
        // This is the most crucial change. It automatically collects
        // all form fields and the file.
        const formData = new FormData(addUserForm);

        // Optional: Manual validation for student fields
        const role = formData.get('role');
        const picture = document.getElementById('addPicture').files[0];
        if (role === 'student' && (!formData.get('matric_number') || !formData.get('rfid_uid') || !picture)) {
             addError.textContent = 'Please fill in all required fields';
             return;
        }

        addError.textContent = 'Saving...';
        addUserSubmit.disabled = true;

        fetch(`${API_BASE_URL}/admin/users/store`, {
            method: 'POST',
            headers: {
                // REMOVE this line. The browser handles it with FormData.
                // 'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            // CHANGE this line to send the FormData object
            body: formData 
        })
        .then(response => response.json().then(data => ({ status: response.status, data })))
        .then(({ status, data }) => {
            console.log('Add User API Response:', data);
            if (status >= 200 && status < 300) {
                // Success logic
                addError.textContent = 'User added successfully';
                addError.style.color = 'green';
                addUserForm.reset();
                addStudentFields.forEach(field => (field.style.display = 'none'));
                fetchUsers();
                setTimeout(() => {
                    bootstrap.Modal.getInstance(addUserModal).hide();
                    addError.textContent = '';
                    addError.style.color = '';
                }, 2000);
            } else {
                // Failure logic
                let errorMessage = data.message || 'Failed to add user';
                if (data.errors) {
                    errorMessage += ': ' + Object.values(data.errors).flat().join(' ');
                }
                addError.textContent = errorMessage;
                addError.style.color = 'red';
            }
            addUserSubmit.disabled = false;
        })
        .catch(error => {
            // Network error logic
            console.error('Add user error:', error);
            addError.textContent = 'Error connecting to server';
            addError.style.color = 'red';
            addUserSubmit.disabled = false;
        });
    });
}
    

    // // Edit user form submission
    // Edit user form submission
if (editUserSubmit) {
    editUserSubmit.addEventListener('click', function () {
        const id = document.getElementById('editUserId').value;
        const first_name = document.getElementById('editFName').value;
        const last_name = document.getElementById('editLName').value;
        const email = document.getElementById('editEmail').value;
        const role = document.getElementById('editRole').value;
        const matric_number = document.getElementById('editMatricNumber').value;
        const rfid_uid = document.getElementById('editRfidUid').value;
        // Get the picture file
        const picture = document.getElementById('editPicture').files[0];

        if (!id || !first_name || !last_name || !email || !role || (role === 'student' && (!matric_number || !rfid_uid))) {
            editError.textContent = 'Please fill in all required fields';
            return;
        }

        editError.textContent = 'Saving...';
        editUserSubmit.disabled = true;

        // CREATE a new FormData object instead of a JSON payload
        const formData = new FormData();
        formData.append('first_name', first_name);
        formData.append('last_name', last_name);
        formData.append('email', email);
        formData.append('role', role);

        if (role === 'student') {
            formData.append('matric_number', matric_number);
            formData.append('rfid_uid', rfid_uid);
        }

        // Add the picture file to the FormData object if it exists
        if (picture) {
            formData.append('picture', picture);
        }

        // Add the method override for Laravel
        formData.append('_method', 'PUT');

        fetch(`${API_BASE_URL}/admin/users/${id}`, {
            method: 'POST', // CHANGE to 'POST' because FormData doesn't support 'PUT' with files
            headers: {
                // REMOVE this header. The browser handles it with FormData.
                // 'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            // CHANGE this line to send the FormData object
            body: formData
        })
        .then(response => response.json().then(data => ({ status: response.status, data })))
        .then(({ status, data }) => {
            console.log('Edit User API Response:', data);
            if (status >= 200 && status < 300) {
                editError.textContent = 'User updated successfully';
                editError.style.color = 'green';
                fetchUsers();
                setTimeout(() => {
                    bootstrap.Modal.getInstance(document.getElementById('editUserModal')).hide();
                    editError.textContent = '';
                    editError.style.color = '';
                }, 2000);
            } else {
                let errorMessage = data.message || 'Failed to update user';
                if (data.errors) {
                    errorMessage += ': ' + Object.values(data.errors).flat().join(' ');
                }
                editError.textContent = errorMessage;
                editError.style.color = 'red';
            }
            editUserSubmit.disabled = false;
        })
        .catch(error => {
            console.error('Edit user error:', error);
            editError.textContent = 'Error connecting to server';
            editError.style.color = 'red';
            editUserSubmit.disabled = false;
        });
    });
}
    

    // Role filter change
    if (roleFilter) {
        roleFilter.addEventListener('change', filterUsers);
    }

    // Initial fetch
    fetchUsers();
});