const user = {
    name: "Ім'я користувача",
    role: "military" // змінити на "volunteer","military" щоб перевірити
};

const publishedRequests = [
    { title: "Медикаменти", status: "active" },
    { title: "Дрон", status: "completed" }
];

const acceptedRequests = [
    { title: "Тепловізор", status: "in_progress" }
];

function getStatusLabel(status) {
    if (status === "active") return "Активний";
    if (status === "in_progress") return "В процесі";
    if (status === "completed") return "Виконано";
}

function renderRequests(containerId, requests) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";

    requests.forEach(req => {
        container.innerHTML += `
            <div class="card request-card">
                <h3>${req.title}</h3>
                <span class="request-status ${req.status}">
                    ${getStatusLabel(req.status)}
                </span>
            </div>
        `;
    });
}

function setupTabs() {
    const tabs = document.getElementById("tabsContainer");

    if (user.role === "military") {
        tabs.innerHTML = `
            <button class="tab-btn active" onclick="showTab('published')">
                Опубліковані (${publishedRequests.length})
            </button>
        `;
        renderRequests("published", publishedRequests);
        document.getElementById("published").classList.add("active");
    }

    if (user.role === "volunteer") {
        tabs.innerHTML = `
            <button class="tab-btn active" onclick="showTab('accepted')">
                Прийняті (${acceptedRequests.length})
            </button>
        `;
        renderRequests("accepted", acceptedRequests);
        document.getElementById("accepted").classList.add("active");
    }
}


function showTab(id) {
    document.querySelectorAll(".tab-content").forEach(el =>
        el.classList.remove("active")
    );
    document.getElementById(id).classList.add("active");
}

setupTabs();
