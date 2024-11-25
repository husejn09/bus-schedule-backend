document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const loginNavbar = document.getElementById('login-navbar');
    
    if (token) {
      fetch('http://localhost:3000/api/userinfo', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (!res.ok) throw new Error('Invalid token');
        return res.json();
      })
      .then((user) => {
        loginNavbar.innerHTML = user.username;  // Update navbar with username
        loginNavbar.href = '#';  
      })
      .catch((err) => {
        console.error('Error fetching user info:', err);
        localStorage.removeItem('token');  
        loginNavbar.innerHTML = 'Login/Register';
        loginNavbar.href = 'login-register.html';  
      });
    } else {
      // No token, set login/register link
      loginNavbar.innerHTML = 'Login/Register';
      loginNavbar.href = 'login-register.html';  
    }
  });
  