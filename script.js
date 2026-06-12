// Login

const loginForm = document.getElementById("loginForm");
const errorMessage = document.getElementById("errorMessage");

const demoUser = {
    username: "gliaTest",
    password: "testGlia"
};

if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (username === demoUser.username && password === demoUser.password) {
        localStorage.setItem("ceGliaBankLoggedIn", "true");
        window.location.href = "dashboard.html";
    } else {
        errorMessage.textContent = "Invalid username or password.";
    }
    });
}

// Dashbpard
const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
    logoutBtn.addEventListener("click", function() {
        localStorage.removeItem("ceGliaBankLoggedIn");
        window.location.href = "login.html";
    });
}
