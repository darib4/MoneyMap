import { supabase} from "./supabase.js";

const registerForm = document.querySelector(".register-form");

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

