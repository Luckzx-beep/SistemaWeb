const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { XMLParser } = require("fast-xml-parser");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "data", "users.json");

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

function readUsers() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, "[]", "utf8");
  }

  return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}

function writeUsers(users) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2), "utf8");
}

function createPasswordHash(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
  return { salt, hash };
}

function verifyPassword(password, salt, storedHash) {
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
  return hash === storedHash;
}

async function getNewsFromApi() {
  const fallbackNews = [
    {
      title: "Mercado cripto cresce no Brasil",
      body: "O Brasil segue entre os principais mercados de criptomoedas da América Latina.",
      url: "https://news.google.com/search?q=criptomoedas+brasil",
      source: "Brasil"
    }
  ];

  try {
    const response = await axios.get("https://cointelegraph.com/rss", { timeout: 10000 });
    const parser = new XMLParser();
    const parsed = parser.parse(response.data);

    const news = (parsed?.rss?.channel?.item || []).map((item) => ({
      title: item.title,
      body: item.description?.replace(/<[^>]*>/g, "").trim() || "Leia mais no site",
      url: item.link,
      source: "Cointelegraph"
    }));

    return [...fallbackNews, ...news.slice(0, 20)];
  } catch (error) {
    console.error("Erro ao buscar notícias:", error.message);
    return fallbackNews;
  }
}

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "API funcionando" });
});

app.post("/api/auth/register", (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Preencha nome, e-mail e senha." });
  }

  const users = readUsers();
  const emailExists = users.some((user) => user.email.toLowerCase() === email.toLowerCase());

  if (emailExists) {
    return res.status(409).json({ error: "E-mail já cadastrado." });
  }

  const { salt, hash } = createPasswordHash(password);
  const newUser = {
    id: Date.now().toString(),
    name,
    email: email.toLowerCase(),
    salt,
    passwordHash: hash,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  writeUsers(users);

  res.status(201).json({
    message: "Cadastro realizado com sucesso!",
    user: { id: newUser.id, name: newUser.name, email: newUser.email }
  });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Informe e-mail e senha." });
  }

  const users = readUsers();
  const user = users.find((item) => item.email.toLowerCase() === email.toLowerCase());

  if (!user || !verifyPassword(password, user.salt, user.passwordHash)) {
    return res.status(401).json({ error: "E-mail ou senha inválidos." });
  }

  res.json({
    message: "Login realizado com sucesso!",
    user: { id: user.id, name: user.name, email: user.email }
  });
});

app.get("/api/news", async (req, res) => {
  try {
    const news = await getNewsFromApi();
    res.json(news);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/news", async (req, res) => {
  try {
    const news = await getNewsFromApi();
    res.json(news);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use((req, res) => {
  res.sendFile(path.join(__dirname, "Noticias.html"));
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});