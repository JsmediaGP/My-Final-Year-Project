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
    const hallsTable = document.querySelector('#halls-table');
    const addHallForm = document.getElementById('addHallForm');
    const addHallSubmit = document.getElementById('addHallSubmit');
    const addError = document.getElementById('addError');
    const editHallForm = document.getElementById('editHallForm');
    const editHallSubmit = document.getElementById('editHallSubmit');
    const editError = document.getElementById('editError');

    // Debug: Log table element
    console.log('Halls table element:', hallsTable);

    // Show loading state
    if (hallsTable) {
        hallsTable.innerHTML = '<tr><td colspan="4" class="text-center">Loading...</td></tr>';
    } else {
        console.error('Halls table not found in DOM');
    }

    // Fetch halls
    function fetchHalls() {
        fetch(`${API_BASE_URL}/admin/halls`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json().then(data => ({ status: response.status, data })))
        .then(({ status, data }) => {
            console.log('Halls API Response:', data);
            if (status >= 200 && status < 300 && hallsTable) {
                const halls = data.data || [];
                if (halls.length > 0) {
                    hallsTable.innerHTML = halls.map(hall => `
                        <tr>
                            
                            <td>${hall.hall_name || 'N/A'}</td>
                            <td>${hall.capacity || 'N/A'}</td>
                            <td>
                                <button class="btn btn-sm btn-warning edit-btn" data-id="${hall.id}" data-bs-toggle="modal" data-bs-target="#editHallModal"><i class="fas fa-edit"></i></button>
                                <button class="btn btn-sm btn-danger delete-btn" data-id="${hall.id}"><i class="fas fa-trash"></i></button>
                            </td>
                        </tr>
                    `).join('');
                } else {
                    hallsTable.innerHTML = '<tr><td colspan="4" class="text-center">No halls found</td></tr>';
                }
                attachButtonListeners();
            } else {
                console.error('Failed to fetch halls:', data);
                if (hallsTable) hallsTable.innerHTML = '<tr><td colspan="4" class="text-center">Failed to load</td></tr>';
            }
        })
        .catch(error => {
            console.error('Halls fetch error:', error);
            if (hallsTable) hallsTable.innerHTML = '<tr><td colspan="4" class="text-center">Failed to load</td></tr>';
        });
    }

    // Attach edit and delete button listeners
    function attachButtonListeners() {
        // Edit buttons
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', function () {
                const hallId = this.getAttribute('data-id');
                fetch(`${API_BASE_URL}/admin/halls/${hallId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                })
                .then(response => response.json().then(data => ({ status: response.status, data })))
                .then(({ status, data }) => {
                    console.log('Hall fetch response:', data);
                    if (status >= 200 && status < 300 && data.data) {
                        document.getElementById('editHallId').value = data.data.id;
                        document.getElementById('editHallName').value = data.data.hall_name || '';
                        document.getElementById('editCapacity').value = data.data.capacity || '';
                    } else {
                        console.error('Failed to fetch hall:', data);
                        editError.textContent = data.message || 'Failed to load hall data';
                    }
                })
                .catch(error => {
                    console.error('Hall fetch error:', error);
                    editError.textContent = 'Error connecting to server';
                });
            });
        });

        // Delete buttons
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', function () {
                if (!confirm('Are you sure you want to delete this hall?')) return;
                const hallId = this.getAttribute('data-id');
                fetch(`${API_BASE_URL}/admin/halls/${hallId}`, {
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
                        alert('Hall deleted successfully');
                        fetchHalls();
                    } else {
                        console.error('Failed to delete hall:', data);
                        alert(data.message || 'Failed to delete hall');
                    }
                })
                .catch(error => {
                    console.error('Delete error:', error);
                    alert('Error connecting to server');
                });
            });
        });
    }

    // Add hall form submission
    if (addHallSubmit) {
        addHallSubmit.addEventListener('click', function () {
            const hall_name = document.getElementById('addHallName').value;
            const capacity = document.getElementById('addCapacity').value;

            if (!hall_name || !capacity) {
                addError.textContent = 'Please fill in all required fields';
                return;
            }

            addError.textContent = 'Saving...';
            addHallSubmit.disabled = true;

            fetch(`${API_BASE_URL}/admin/halls`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ hall_name, capacity: parseInt(capacity) })
            })
            .then(response => response.json().then(data => ({ status: response.status, data })))
            .then(({ status, data }) => {
                console.log('Add Hall API Response:', data);
                if (status >= 200 && status < 300) {
                    addError.textContent = 'Hall added successfully';
                    addError.style.color = 'green';
                    addHallForm.reset();
                    fetchHalls();
                    setTimeout(() => {
                        bootstrap.Modal.getInstance(document.getElementById('addHallModal')).hide();
                        addError.textContent = '';
                        addError.style.color = '';
                    }, 2000);
                } else {
                    addError.textContent = data.message || 'Failed to add hall';
                    addError.style.color = 'red';
                }
                addHallSubmit.disabled = false;
            })
            .catch(error => {
                console.error('Add hall error:', error);
                addError.textContent = 'Error connecting to server';
                addError.style.color = 'red';
                addHallSubmit.disabled = false;
            });
        });
    }

    // Edit hall form submission
    if (editHallSubmit) {
        editHallSubmit.addEventListener('click', function () {
            const id = document.getElementById('editHallId').value;
            const hall_name = document.getElementById('editHallName').value;
            const capacity = document.getElementById('editCapacity').value;

            if (!id || !hall_name || !capacity) {
                editError.textContent = 'Please fill in all required fields';
                return;
            }

            editError.textContent = 'Saving...';
            editHallSubmit.disabled = true;

            fetch(`${API_BASE_URL}/admin/halls/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ hall_name, capacity: parseInt(capacity) })
            })
            .then(response => response.json().then(data => ({ status: response.status, data })))
            .then(({ status, data }) => {
                console.log('Edit Hall API Response:', data);
                if (status >= 200 && status < 300) {
                    editError.textContent = 'Hall updated successfully';
                    editError.style.color = 'green';
                    fetchHalls();
                    setTimeout(() => {
                        bootstrap.Modal.getInstance(document.getElementById('editHallModal')).hide();
                        editError.textContent = '';
                        editError.style.color = '';
                    }, 2000);
                } else {
                    editError.textContent = data.message || 'Failed to update hall';
                    editError.style.color = 'red';
                }
                editHallSubmit.disabled = false;
            })
            .catch(error => {
                console.error('Edit hall error:', error);
                editError.textContent = 'Error connecting to server';
                editError.style.color = 'red';
                editHallSubmit.disabled = false;
            });
        });
    }

    // Initial fetch
    fetchHalls();
});