
// Event listener for the register form to show or dissapear
document.getElementById("register-id").addEventListener("click", () =>{
    const login = document.getElementById("login-form-id");
    const register = document.getElementById("register-form-id");
    login.style.display = "none";
    register.style.display = "block";
})

// Event listener for the login form to show or dissapear
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

// Event listener for submiting the login form and checking if the fetch will pass
// if the user came from the cart page and needs to login, if he logs in redirect him back to where he was
// if the user came from the homepage directly to login redirect him where he was
document.getElementById('login-form-id').addEventListener('submit', async (event) => {
  event.preventDefault();

  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;

  // Get the redirect parameter from the URL
  const urlParams = new URLSearchParams(window.location.search);
  const redirectPage = urlParams.get('redirect') || 'index.html';

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
      window.location.href = redirectPage; // Redirect back to the original page
    } else {
      alert(result.msg || 'Login failed');
    }
  } catch (error) {
    console.error('Error:', error);
  }
});

  
// Event listener for the register form, if the user register successfully redirect him to the login form
// if not try again
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
        const login = document.getElementById("login-form-id");
        const register = document.getElementById("register-form-id");
        login.style.display = "block";
        register.style.display = "none";
        
        
      } else {
        alert(result.msg || 'Registration failed');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  });
  
  document.getElementById("cart-img").addEventListener("click", () => {
    window.location.href ="cart.html";
  })



