import {supabase} from "./supabase.js";

const loginForm = document.querySelector(".register-form");

const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("toggle-password");
const toggleIcon = togglePassword.querySelector("img");

togglePassword.addEventListener("click", function(){
    if(passwordInput.type === "password") {
        passwordInput.type = "text";
        toggleIcon.src = "../assets/login-register/eye-closed.svg";
        togglePassword.setAttribute("aria-label", "Hide password");
    } else {
        password.passwordInput.type = "password";
        toggleIcon.src = "../assets/login-register/eye.svg";
        togglePassword.setAttribute("aria-label", "Show password");
    }
});

loginForm.addEventListener("submit", async function(event){
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    const {data, error} = await supabase.auth.signInWithPassword({
        email:email,
        password: password
    });

    if(error){
        alert("Invalid email or password!");
        return;
    }

    window.location.href="dashboard.html";
});