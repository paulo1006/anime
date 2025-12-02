const API = "http://localhost:4000/api";

const checkAuth = () => {
    const token = localStorage.getItem("token");
    if (!token) window.location.href = "index.html";
    return token;
};

const token = checkAuth();

document.getElementById("logoutBtn").onclick = () => {
    localStorage.removeItem("token");
    window.location.href = "index.html";
};

document.getElementById("quizForm").onsubmit = async (e) => {
    e.preventDefault();

    const { animes } = await fetch(`${API}/quiz`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(Object.fromEntries(new FormData(e.target)))
    }).then(res => res.json());

    const resultados = document.getElementById("resultados");

    if (!animes?.length) {
        resultados.innerHTML = "<p>Nenhum anime encontrado.</p>";
        return;
    }

    resultados.innerHTML = `<h2>Recomendações</h2>` + animes.map(a => `
        <div class="card">
            <h3>${a.title}</h3>
            <img src="${a.images.jpg.image_url}" width="180">
            <button class="favBtn" data-id="${a.mal_id}" data-title="${a.title}" 
                    data-img="${a.images.jpg.image_url}">Favoritar</button>
        </div>
    `).join("");

    resultados.querySelectorAll(".favBtn").forEach(btn => {
        btn.onclick = async () => {
            const res = await fetch(`${API}/favoritos`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    mal_id: Number(btn.dataset.id),
                    title: btn.dataset.title,
                    image: btn.dataset.img
                })
            });

            if (!res.ok) return alert("Erro ao favoritar!");

            btn.innerText = "Favoritado";
            btn.style.background = "green";
            btn.disabled = true;
        };
    });
};