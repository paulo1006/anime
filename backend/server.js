import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import jwt from "jsonwebtoken";
import fetch from "node-fetch"; 
import User from "./Models/User.js";

const app = express();
app.use(cors());
app.use(express.json());


if (!process.env.MONGO_URI) {
    console.error("Dev verifica o MONGO_URI");
    process.exit(1);
}

mongoose
    .connect(process.env.MONGO_URI, { dbName: "animes" })
    .then(() => console.log(" MongoDB conectado"))
    .catch(err => console.error("Erro no MongoDB:", err));


const auth = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer "))
        return res.status(401).json({ message: "Token inválido" });

    jwt.verify(authHeader.split(" ")[1], process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ message: "Token inválido" });
        req.userId = decoded.id;
        next();
    });
};


app.get("/api/profile", auth, async (req, res) => {
    const user = await User.findById(req.userId);

    if (!user) return res.status(404).json({ message: "Usuário não encontrado" });

    res.json({ user });
});


app.post("/api/login", async (req, res) => {
    const { email, nome } = req.body;

    if (!email) return res.status(400).json({ message: "Email obrigatório" });

    let user = await User.findOne({ email });

    if (!user)
        user = await User.create({ email, nome: nome || "Usuário", favoritos: [] });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({ token });
});

app.post("/api/register", async (req, res) => {
    const { email, nome } = req.body;

    if (!email || !nome)
        return res.status(400).json({ message: "Nome e email obrigatórios" });

    let exists = await User.findOne({ email });
    if (exists)
        return res.status(400).json({ message: "Email já cadastrado" });

    const user = await User.create({ email, nome, favoritos: [] });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({ token });
});


const generoMap = {
    "Ação": "1", "Aventura": "2", "Comédia": "4", "Drama": "8",
    "Fantasia": "10", "Mistério": "7", "Romance": "22", "Sci-Fi": "24", "Terror": "14"
};

app.post("/api/quiz", auth, async (req, res) => {
    try {
        const { serieLongaOuCurta, generosMaisGosta, pergunta9 } = req.body;

        let url = "https://api.jikan.moe/v4/anime?order_by=score&sort=desc&limit=25";

        if (generoMap[serieLongaOuCurta]) url += `&genres=${generoMap[serieLongaOuCurta]}`;

        if (pergunta9 === "Shonen") url += "&genres=27";
        if (pergunta9 === "Seinen") url += "&genres=42";

        const { data } = await fetch(url).then(r => r.json());

        if (!data)
            return res.status(503).json({ message: "API Jikan fora do ar" });

        let filtrados = data;

        if (generosMaisGosta) {
            const filters = {
                "Curta (<25 eps)": eps => eps < 25,
                "Media (25-50 eps)": eps => eps >= 25 && eps <= 50,
                "Longa (>50 eps)": eps => eps > 50
            };

            const rule = filters[generosMaisGosta];
            if (rule) filtrados = data.filter(a => rule(a.episodes || 0));
        }

        res.json({ animes: filtrados.sort(() => Math.random() - 0.5).slice(0, 10) });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro ao recomendar" });
    }
});


app.get("/api/noticias", auth, async (req, res) => {
    try {
        const xml = await fetch("https://www.animenewsnetwork.com/news/rss.xml")
            .then(r => r.text());

        const items = xml.match(/<item>[\s\S]*?<\/item>/g) || [];

        const clean = t => t.replace(/<[^>]+>/g, "").trim();

        const noticias = items.slice(0, 10).map(i => ({
            title: clean(i.match(/<title>(.*?)<\/title>/)?.[1] || ""),
            link: clean(i.match(/<link>(.*?)<\/link>/)?.[1] || ""),
            description: clean(i.match(/<description>(.*?)<\/description>/)?.[1] || "").slice(0, 180) + "...",
            pubDate: clean(i.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || "")
        }));

        res.json({ noticias });
    } catch (e) {
        res.status(500).json({ message: "Erro ao carregar noticias" });
    }
});

app.post("/api/favoritos", auth, async (req, res) => {
    const { mal_id, title, image } = req.body;

    if (!mal_id) return res.status(400).json({ message: "mal_id é obrigatório" });

    const user = await User.findById(req.userId);

    if (!user) return res.status(404).json({ message: "Usuario não encontrado" });

    if (user.favoritos.find(f => f.mal_id === mal_id))
        return res.json({ message: "Já favorito" });

    user.favoritos.push({ mal_id, title, image });
    await user.save();

    res.json({ message: "Favoritado!" });
});

app.get("/api/favoritos", auth, async (req, res) => {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "Usuario não encontrado" });

    res.json({ favoritos: user.favoritos });
});

app.delete("/api/favoritos/:id", auth, async (req, res) => {
    const user = await User.findById(req.userId);

    user.favoritos = user.favoritos.filter(f => f.mal_id != req.params.id);
    await user.save();

    res.json({ message: "Removido!" });
});


app.listen(4000, () => console.log("http://localhost:4000"));
