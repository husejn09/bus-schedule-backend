document.getElementById("register-id").addEventListener("click", () =>{
    const login = document.getElementById("login-form-id");
    const register = document.getElementById("register-form-id");
    login.style.display = "none";
    register.style.display = "block";
})

document.getElementById("login-id").addEventListener("click", () =>{
    const login = document.getElementById("login-form-id");
    const register = document.getElementById("register-form-id");
    login.style.display = "block";
    register.style.display = "none";
})

document.getElementById("navbar-toggle").addEventListener("click", function () {
    document.querySelector(".navbar-list").classList.toggle("active");
});

document
    .querySelector(".navbar-list .close-btn")
    .addEventListener("click", function () {
    document.querySelector(".navbar-list").classList.remove("active");
});


document.getElementById('login-form-id').addEventListener('submit', async (event) => {
    event.preventDefault(); 
    
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
  
    try {
      const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
  
      const result = await response.json();
  
      if (response.ok) {
        localStorage.setItem('token', result.token);
        alert('Login successful');
        
      } else {
        alert(result.msg || 'Login failed');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  });
  

  document.getElementById('register-form-id').addEventListener('submit', async (event) => {
    event.preventDefault(); 
  
    const email = document.getElementById('register-email').value;
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
  
    try {
      const response = await fetch('http://localhost:3000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password }),
      });
  
      const result = await response.json();
  
      if (response.ok) {
        alert('Registration successful');
        // Optionally redirect or update UI
      } else {
        alert(result.msg || 'Registration failed');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  });
  




