import {supabase} from "./supabase.js";

const greetingElement = document.getElementById("greeting");
const userFirstNameElement = document.getElementById("user-first-name");
const currentHour = new Date().getHours();
let greeting;

const profileButton = document.getElementById("profile-button");
const profileMenu = document.getElementById("profile-menu");

const logoutButton = document.getElementById("logout-button");


profileButton.addEventListener("click", function() {
    profileMenu.classList.toggle("active");
});

if(currentHour < 12) {
    greeting = "Good morning";
} else if(currentHour < 18){
    greeting = "Good afternoon";
} else {
    greeting = "Good evening";
}

greetingElement.textContent = greeting;

const {data: {user}} = await supabase.auth.getUser();

if(!user){
    window.location.replace("login.html");
} else {
    const firstName = user.user_metadata.first_name;
    userFirstNameElement.textContent = firstName;
}

logoutButton.addEventListener("click", async function(){
    const {error} = await supabase.auth.signOut();

    if(error){
        alert("Logout failed!");
        return;
    }

    window.location.replace("login.html");
});