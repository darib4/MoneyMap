import { supabase} from "./supabase.js";

const registerForm = document.querySelector(".register-form");

const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("toggle-password");
const toggleIcon = togglePassword.querySelector("img");

const confirmPasswordInput = document.getElementById("confirm-password");
const toggleConfirmPassword = document.getElementById("toggle-password");
const toggleConfirmIcon = toggleConfirmPassword.querySelector("img");

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

toggleConfirmPassword.addEventListener("click", function() {
    if(confirmPasswordInput.type === "password") {
        confirmPasswordInput.type = "text";
        toggleConfirmIcon.src = "../assets/login-register/eye-off.svg";
    } else {
        confirmPasswordInput.type = "password";
         toggleConfirmIcon.src = "../assets/login-register/eye.svg";
    }
});

registerForm.addEventListener("submit", async function(event) {
    event.preventDefault();
    console.log("Register clicked");

    const firstName = document.getElementById("first_name").value.trim();
    const lastName = document.getElementById("last_name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    if(password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    const {data, error} = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
            data: {
                first_name: firstName,
                last_name: lastName
            }
        }
    });

    if(error){
        alert(error.message);
        return;
    }

    alert("The registration was successful!");
});

