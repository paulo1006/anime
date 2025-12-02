Introdução
O Mundo Anime é um projeto desenvolvido com Node.js + MongoDB no backend e HTML/CSS/JavaScript no frontend.

Meta:indicar animes que façam sentido para o usuário.
Funcionalidades
    • Cadastro e login com autenticação JWT
    • Quiz de preferências para recomendar animes filtrados
    • Integração com a API Jikan para buscar animes
    • Salvar e remover animes favoritos
    • Exibir notícias atualizadas relacionadas ao mundo dos animes
Tecnologias Utilizadas
Backend
    • Node.js
    • Express
    • MongoDB + Mongoose
    • JSON Web Token (JWT)
    • bcryptjs
    • node-fetch
    • dotenv
    • CORS
Frontend
    • HTML5
    • CSS3
    • JavaScript
APIs Integradas
    • API Jikan (animes)
    • RSS Anime News Network (notícias)
Instalação
npm init -y
npm install express dotenv
npm install express mongoose bcrypt jsonwebtoken cors
Como iniciar o servidor
node server.js

Endpoints da API
A seguir estão todas as rotas disponíveis no backend, com exemplos e descrições claras.

**POST /api/login
Realiza o login do usuário pelo email.
Se o email não existir, um novo usuário é criado automaticamente.
Body
{
  "email": "usuario@email.com",
  "nome": "Paulo"
}
Respostas
200 – Sucesso
Retorna o token JWT:
{
  "token": "jwt_aqui"
}
400 – Email não informado
{ "message": "Email obrigatório" }

**POST /api/register
Registra um novo usuário.
Exige nome e email obrigatoriamente.
Se o email já estiver cadastrado, o cadastro não é permitido.
Body
{
  "email": "usuario@email.com",
  "nome": "Paulo"
}
Respostas
200 – Sucesso
{
  "token": "jwt_aqui"
}
400 – Campos ausentes
{ "message": "Nome e email obrigatórios" }
400 – Email já cadastrado
{ "message": "Email já cadastrado" }

**GET /api/profile (rota protegida)
Retorna os dados completos do usuário autenticado.
Header necessário
Authorization: Bearer TOKEN
Resposta
{
  "user": {
    "_id": "...",
    "email": "...",
    "nome": "...",
    "favoritos": []
  }
}

**POST /api/quiz (rota protegida)
Gera recomendações de animes com base nas respostas do quiz.
A API aplica filtros como:
    • gênero escolhido
    • quantidade de episódios
    • preferência Shonen/Seinen
Body
{
  "serieLongaOuCurta": "Ação",
  "generosMaisGosta": "Curta (<25 eps)",
  "pergunta9": "Shonen"
}
Resposta
Retorna até 10 animes recomendados de forma aleatória.

**GET /api/noticias (rota protegida)
Busca notícias recentes da AnimeNewsNetwork via RSS, limpa os dados e retorna apenas informações essenciais.
Resposta
{
  "noticias": [
    {
      "title": "Notícia X",
      "link": "https://...",
      "description": "Resumo...",
      "pubDate": "Mon, 02 Dec 2024"
    }
  ]
}

**POST /api/favoritos (rota protegida)
Adiciona um anime à lista de favoritos do usuário.
O anime é identificado pelo mal_id.
Body
{
  "mal_id": 123,
  "title": "Naruto",
  "image": "url-da-imagem"
}
Retorna uma mensagem indicando que o anime foi favoritado.

**GET /api/favoritos (rota protegida)
Retorna todos os animes favoritos do usuário autenticado.
Resposta
{
  "favoritos": [
    {
      "mal_id": 123,
      "title": "Naruto",
      "image": "..."
    }
  ]
}

**DELETE /api/favoritos/:id (rota protegida)
Remove um anime dos favoritos usando o mal_id.
Exemplo
DELETE /api/favoritos/123
