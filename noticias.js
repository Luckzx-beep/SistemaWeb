const STORAGE_KEY_USERS = "cryptoUsers";
const STORAGE_KEY_SESSION = "cryptoUser";

function setStatus(message, type = "info") {
  const statusBox = document.getElementById("user-status");
  if (!statusBox) return;

  statusBox.textContent = message;
  statusBox.style.borderColor = type === "success" ? "#22c55e" : type === "error" ? "#ef4444" : "#38bdf8";
}

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_USERS)) || [];
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
}

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_SESSION));
  } catch {
    return null;
  }
}

function saveUser(user) {
  localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(user));
}

function clearUser() {
  localStorage.removeItem(STORAGE_KEY_SESSION);
}

function hashPassword(password) {
  let hash = 0;
  for (let i = 0; i < password.length; i += 1) {
    hash = (hash << 5) - hash + password.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString(16).padStart(8, "0");
}

function renderNews(news) {
  const container = document.getElementById("news-list");
  if (!container) return;

  container.innerHTML = "";

  news.slice(0, 10).forEach((noticia) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h2>${noticia.title}</h2>
      <p>${(noticia.body || "Leia mais no site").substring(0, 140)}...</p>
      <p style="font-size:12px;color:#94a3b8;">Fonte: ${noticia.source || "CryptoCompare"}</p>
      <a href="${noticia.url}" target="_blank">🔗 Ler notícia completa</a>
    `;
    container.appendChild(card);
  });
}

async function carregarNoticias() {
  const container = document.getElementById("news-list");
  if (!container) return;

  container.innerHTML = "<p>Carregando notícias...</p>";

  const fallbackNews = [
    {
      title: "Mercado cripto cresce no Brasil",
      body: "O Brasil segue entre os mercados mais ativos da América Latina em criptomoedas.",
      url: "https://news.google.com/search?q=criptomoedas+brasil",
      source: "Brasil"
    },
    {
      title: "Bitcoin mostra força em nova semana",
      body: "A maior criptomoeda do mercado continua atraindo atenção de investidores e traders.",
      url: "https://coinmarketcap.com/pt-br/",
      source: "Mercado"
    },
    {
      title: "Ethereum reforça presença no ecossistema DeFi",
      body: "Novas iniciativas e volume de uso consolidam o papel da rede Ethereum.",
      url: "https://ethereum.org/pt-br/",
      source: "Ethereum"
    }
  ];

  try {
    const res = await fetch("https://api.rss2json.com/v1/api.json?rss_url=https://cointelegraph.com/rss");

    if (!res.ok) {
      throw new Error("Falha ao buscar notícias externas");
    }

    const data = await res.json();
    const noticias = (data.items || []).map((item) => ({
      title: item.title,
      body: item.description?.replace(/<[^>]*>/g, "").trim() || "Leia mais no site",
      url: item.link,
      source: item.author || "Cointelegraph"
    }));

    if (noticias.length) {
      renderNews(noticias);
      return;
    }
  } catch (error) {
    console.warn("Usando notícias locais:", error.message);
  }

  renderNews(fallbackNews);
}

function verMais() {
  window.open(
    "https://news.google.com/search?q=criptomoedas+brasil&hl=pt-BR&gl=BR&ceid=BR:pt-419",
    "_blank"
  );
}

function registrarUsuario(event) {
  event.preventDefault();

  const name = document.getElementById("register-name").value.trim();
  const email = document.getElementById("register-email").value.trim();
  const password = document.getElementById("register-password").value;

  if (!name || !email || !password) {
    setStatus("Preencha todos os campos para cadastrar.", "error");
    return;
  }

  const users = getUsers();
  const alreadyExists = users.some((user) => user.email.toLowerCase() === email.toLowerCase());

  if (alreadyExists) {
    setStatus("Este e-mail já está cadastrado.", "error");
    return;
  }

  const newUser = {
    id: Date.now().toString(),
    name,
    email: email.toLowerCase(),
    passwordHash: hashPassword(password)
  };

  users.push(newUser);
  saveUsers(users);
  document.getElementById("register-form").reset();
  setStatus(`Cadastro concluído para ${newUser.name}!`, "success");
}

function entrarUsuario(event) {
  event.preventDefault();

  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;

  if (!email || !password) {
    setStatus("Informe e-mail e senha para entrar.", "error");
    return;
  }

  const users = getUsers();
  const user = users.find((item) => item.email.toLowerCase() === email.toLowerCase());

  if (!user || user.passwordHash !== hashPassword(password)) {
    setStatus("E-mail ou senha inválidos.", "error");
    return;
  }

  saveUser({ id: user.id, name: user.name, email: user.email });
  document.getElementById("login-form").reset();
  atualizarInterface();
  setStatus(`Bem-vindo, ${user.name}!`, "success");
}

function atualizarInterface() {
  const user = getStoredUser();
  const statusBox = document.getElementById("user-status");

  if (!statusBox) return;

  if (user) {
    statusBox.innerHTML = `Olá, <strong>${user.name}</strong>! Você está logado e pode acompanhar as notícias.`;
  } else {
    statusBox.textContent = "Faça login para acessar a área completa.";
  }
}

function configurarEventos() {
  const registerForm = document.getElementById("register-form");
  const loginForm = document.getElementById("login-form");
  const btnVerMais = document.getElementById("btn-ver-mais");

  if (registerForm) registerForm.addEventListener("submit", registrarUsuario);
  if (loginForm) loginForm.addEventListener("submit", entrarUsuario);
  if (btnVerMais) btnVerMais.addEventListener("click", verMais);
}

window.addEventListener("DOMContentLoaded", () => {
  configurarEventos();
  atualizarInterface();
  carregarNoticias();
});