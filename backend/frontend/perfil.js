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

async function carregarFavoritos() {
    const container = document.getElementById("listaFavoritos");

    try {
        const { favoritos } = await fetch(`${API}/favoritos`, {
            headers: { "Authorization": `Bearer ${token}` }
        }).then(res => res.json());

        if (!favoritos?.length) {
            container.innerHTML = "<p>Nenhum anime favoritado.</p>";
            return;
        }

        container.innerHTML = favoritos.map(a => `
            <div class="card">
                <h3>${a.title}</h3>
                <img src="${a.image}" width="180">
                <button onclick="removerFavorito(${a.mal_id})"
                    style="background:red;color:white;padding:8px;border-radius:5px;cursor:pointer;">
                    Remover
                </button>
            </div>
        `).join("");

    } catch (error) {
        container.innerHTML = "<p style='color:red;'>Erro ao carregar favoritos.</p>";
    }
}

async function removerFavorito(id) {
    await fetch(`${API}/favoritos/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
    });
    carregarFavoritos();
}

carregarFavoritos();