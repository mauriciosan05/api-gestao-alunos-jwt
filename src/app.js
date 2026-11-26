import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(express.json());

// usuarios cadastrados pelo /register
const users = [];

// alunos ja comecam com alguns dados mockados
const alunos = [
    {
        id: 1,
        nome: "Asdrubal",
        ra: "11111",
        nota1: 8.5,
        nota2: 9.5
    },
    {
        id: 2,
        nome: "Lupita",
        ra: "22222",
        nota1: 7.5,
        nota2: 7
    },
    {
        id: 3,
        nome: "Zoroastro",
        ra: "33333",
        nota1: 3,
        nota2: 4
    }
];

function buscaAluno(id) {
    return alunos.findIndex(aluno => aluno.id === Number(id));
}

function calculaMedia(aluno) {
    return (Number(aluno.nota1) + Number(aluno.nota2)) / 2;
}

const authenticateJWT = (req, res, next) => {

    const authHeader = req.header("Authorization");

    let token;

    if (authHeader) {
        const parts = authHeader.split(" ");
        if (parts.length === 2) {
            token = parts[1];
        }
    }

    if (!token) {
        return res.status(401).json({ message: "Acesso negado. Token não fornecido." });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {

        if (err) {
            if (err.name === "TokenExpiredError") {
                return res.status(401).json({ message: "Acesso negado. Token expirado." });
            } else if (err.name === "JsonWebTokenError") {
                return res.status(403).json({ message: "Acesso negado. Token inválido." });
            } else {
                return res.status(403).json({ message: "Acesso negado. Erro na verificação do token." });
            }
        }

        req.user = user;
        next();
    });
};

app.post("/register", async (req, res) => {

    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Informe o username e o password!" });
    }

    if (users.find(user => user.username === username)) {
        return res.status(400).json({ message: "Usuário já cadastrado!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    users.push({ username, password: hashedPassword });

    res.status(201).json({ message: "Usuário criado!" });
});

app.post("/login", async (req, res) => {

    const { username, password } = req.body;

    const user = users.find(user => user.username === username);

    if (!user || !password || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: "Login Incorreto!" });
    }

    const token = jwt.sign(
        { username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "1h", algorithm: "HS256" }
    );

    console.log("Login efetuado pelo usuário " + user.username);

    res.status(200).json({
        message: "Login efetuado pelo usuário " + user.username,
        jwt: token
    });
});

// daqui pra baixo todas as rotas precisam do token
app.use(authenticateJWT);

app.get("/alunos", (req, res) => {
    res.status(200).json(alunos);
});

// medias e aprovados ficam antes do /alunos/:id
// senao o express entende "medias" como se fosse um id
app.get("/alunos/medias", (req, res) => {

    const medias = alunos.map(aluno => {
        return {
            nome: aluno.nome,
            media: calculaMedia(aluno)
        };
    });

    res.status(200).json(medias);
});

app.get("/alunos/aprovados", (req, res) => {

    const aprovados = alunos.map(aluno => {
        return {
            nome: aluno.nome,
            status: calculaMedia(aluno) >= 6 ? "aprovado" : "reprovado"
        };
    });

    res.status(200).json(aprovados);
});

app.get("/alunos/:id", (req, res) => {

    const index = buscaAluno(req.params.id);

    if (index === -1) {
        return res.status(404).json({ message: "Aluno não encontrado!" });
    }

    res.status(200).json(alunos[index]);
});

app.post("/alunos", (req, res) => {

    const { id, nome, ra, nota1, nota2 } = req.body;

    if (id === undefined || !nome || !ra || nota1 === undefined || nota2 === undefined) {
        return res.status(400).json({ message: "Dados do aluno incompletos!" });
    }

    if (buscaAluno(id) !== -1) {
        return res.status(400).json({ message: "Já existe um aluno com esse id!" });
    }

    alunos.push({
        id: Number(id),
        nome,
        ra,
        nota1: Number(nota1),
        nota2: Number(nota2)
    });

    res.status(201).json({ message: "Aluno criado com sucesso!" });
});

app.put("/alunos/:id", (req, res) => {

    const index = buscaAluno(req.params.id);

    if (index === -1) {
        return res.status(404).json({ message: "Aluno não encontrado!" });
    }

    const { nome, ra, nota1, nota2 } = req.body;

    if (nome !== undefined) alunos[index].nome = nome;
    if (ra !== undefined) alunos[index].ra = ra;
    if (nota1 !== undefined) alunos[index].nota1 = Number(nota1);
    if (nota2 !== undefined) alunos[index].nota2 = Number(nota2);

    res.status(200).json(alunos[index]);
});

app.delete("/alunos/:id", (req, res) => {

    const index = buscaAluno(req.params.id);

    if (index === -1) {
        return res.status(404).json({ message: "Aluno não encontrado!" });
    }

    alunos.splice(index, 1);

    res.status(200).json({ message: "Aluno removido!" });
});

export default app;
