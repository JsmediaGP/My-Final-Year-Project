
// Login form submission
document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function (event) {
            event.preventDefault(); // Prevent form from refreshing page
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const errorDiv = document.getElementById('error');

            // Basic validation
            if (!email || !password) {
                errorDiv.textContent = 'Please fill in all fields';
                return;
            }

            // Log input for testing
            console.log('Email:', email);
            console.log('Password:', password);
            errorDiv.textContent = 'Logging in...';
            errorDiv.style.color = 'black';

            fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            })
            .then(response => response.json().then(data => ({ status: response.status, data })))
            .then(({ status, data }) => {
                console.log('Login API Response:', data); // Debug
                if (status >= 200 && status < 300 && data.token && data.user?.role) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('role', data.user.role);
                    localStorage.setItem('student_id', data.user.id);  // for student ID here
                    localStorage.setItem('matric_number', data.user.matric_number); 
                    localStorage.setItem('student_name', data.user.first_name + " " + data.user.last_name); // optional

                    errorDiv.textContent = 'Login successful! Redirecting...';
                    errorDiv.style.color = 'green';
                    setTimeout(() => {
                        const role = data.user.role.toLowerCase();
                        if (role === 'admin') {
                            window.location.href = 'pages/admin/index.html';
                        } else if (role === 'lecturer') {
                            window.location.href = 'pages/lecturer/index.html';
                        } else if (role === 'student') {
                            window.location.href = 'pages/student/index.html';
                        } else {
                            errorDiv.textContent = `Unknown role: ${data.user.role}`;
                            errorDiv.style.color = 'red';
                            console.error('Unknown role:', data.user.role);
                        }
                    }, 2000);
                } else {
                    errorDiv.textContent = data.message || 'Login failed';
                    errorDiv.style.color = 'red';
                    console.error('Login failed:', data);
                }
            })
            .catch(error => {
                errorDiv.textContent = 'Error connecting to server';
                errorDiv.style.color = 'red';
                console.error('Login error:', error);
            });
        });
    }

    // Password toggle functionality
    const togglePassword = document.getElementById('togglePassword');
    if (togglePassword) {
        togglePassword.addEventListener('click', function () {
            const passwordInput = document.getElementById('password');
            const icon = this;
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    }

    // Attach logout event listener
    console.log('Attaching logout listeners'); // Debug
    const logoutButtons = document.querySelectorAll('.logout-btn');
    console.log('Found logout buttons:', logoutButtons); // Debug
    logoutButtons.forEach(button => {
        button.addEventListener('click', logout);
    });
});

// Logout function
function logout() {
    console.log('Logout function triggered'); // Debug
    if (!confirm('Are you sure you want to log out?')) {
        console.log('Logout cancelled'); // Debug
        return;
    }

    const logoutButtons = document.querySelectorAll('.logout-btn');
    logoutButtons.forEach(button => {
        button.disabled = true;
        console.log('Logout button disabled:', button); // Debug

        fetch(`${API_BASE_URL}/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
        .then(response => response.json().then(data => ({ status: response.status, data })))
        .then(({ status, data }) => {
            console.log('Logout API Response:', data); // Debug
            if (status >= 200 && status < 300) {
                localStorage.removeItem('token');
                localStorage.removeItem('role');
                window.location.href = '../../index.html';
            } else {
                console.error('Logout failed:', data);
                alert(data.message || 'Logout failed');
                button.disabled = false;
            }
        })
        .catch(error => {
            console.error('Logout error:', error);
            alert('Error connecting to server');
            button.disabled = false;
        });
    });
}