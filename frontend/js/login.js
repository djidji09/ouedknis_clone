const loginForm = document.getElementById('loginForm');
    const errorDiv = document.getElementById('error');

    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value.trim();

      try {
        const res = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          errorDiv.textContent = data.message || 'Login failed';
        } else {
          localStorage.setItem('token', data.token);
          window.location.href = '/frontend/pages/client.html'; // adjust based on role
        }
      } catch (err) {
        errorDiv.textContent = 'Server error';
      }
    });