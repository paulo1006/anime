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

async function carregarNoticias() {
    const listaNoticias = document.getElementById("listaNoticias");
    
    try {
        const { noticias } = await fetch(`${API}/noticias`, {
            headers: { "Authorization": `Bearer ${token}` }
        }).then(res => res.json());

        if (!noticias?.length) {
            listaNoticias.innerHTML = "<p>Neste momento nenhuma noticia foi encontrada.</p>";
            return;
        }

        listaNoticias.innerHTML = noticias.map(n => `
            <div class="card" style="margin-bottom: 20px; text-align: left;">
                <h3 style="color: #2c3e50; margin-bottom: 10px;">${n.title}</h3>
                <p style="color: #7f8c8d; font-size: 0.9em; margin-bottom: 10px;">
                    📅 ${new Date(n.pubDate).toLocaleDateString('pt-BR')}
                </p>
                <p style="color: #34495e; line-height: 1.6;">${n.description}</p>
                <a href="${n.link}" target="_blank" 
                   style="display: inline-block; margin-top: 10px; padding: 8px 15px; 
                          background: #3498db; color: white; text-decoration: none; 
                          border-radius: 5px; font-size: 0.9em;">
                    Ler mais →
                </a>
            </div>
        `).join("");

    } catch (error) {
        console.error("falha ao carregar as noticiais:", error);
        listaNoticias.innerHTML = "<p style='color: red;'>falha ao carregar as noticiais. verifique novamente mais tarde.</p>";
    }
}

carregarNoticias();