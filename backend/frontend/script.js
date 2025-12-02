const API = 'http://localhost:4000/api';

const $ = id => document.getElementById(id);
const show = el => el.classList.remove('hidden');
const hide = el => el.classList.add('hidden');
const showMsg = (text, color='red') => {
  $('msg').textContent = text;
  $('msg').style.color = color;
  setTimeout(() => $('msg').textContent = '', 4000);
};

$('toLogin').onclick = e => {
  e.preventDefault();
  hide($('registerForm'));
  show($('loginForm'));
};

$('toRegister').onclick = e => {
  e.preventDefault();
  show($('registerForm'));
  hide($('loginForm'));
};

const handleAuth = async (e, endpoint) => {
  e.preventDefault();
  const formData = Object.fromEntries(new FormData(e.target));

  try {
    const res = await fetch(`${API}/${endpoint}`, {  
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const data = await res.json();
    if (!res.ok) return showMsg(data.message || 'Erro');

    localStorage.setItem('token', data.token);
    window.location.href = "quiz.html";
  } catch (err) {
    showMsg('Erro de rede');
    console.error(err);
  }
};

$('registerForm').onsubmit = e => handleAuth(e, 'register');
$('loginForm').onsubmit = e => handleAuth(e, 'login');

async function fetchProfile() {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const { user } = await fetch(`${API}/profile`, {  
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => res.ok ? res.json() : Promise.reject());

    $('profileName').textContent = user.nome;
    $('profileEmail').textContent = user.email;
    show($('profile'));
    hide($('registerForm'));
    hide($('loginForm'));
  } catch (e) {
    console.log(e);
    localStorage.removeItem('token');
  }
}

$('logout').onclick = () => {
  localStorage.removeItem('token');
  hide($('profile'));
  show($('loginForm'));
};

$('goAnimes').onclick = () => window.location.href = "animes.html";

fetchProfile();