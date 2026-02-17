document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("login-form");

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const name = document.getElementById("name").value;
        const role = document.getElementById("role").value;

        localStorage.setItem("user", JSON.stringify({
            name: name,
            role: role
        }));

        window.location.href = "profile.html";
    });

});
