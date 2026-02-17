fetch("css/header.html")
    .then(response => response.text())
    .then(data => {
        document.getElementById("header-placeholder").innerHTML = data;

        if (typeof initProfile === "function") {
            initProfile();
        }
    });
