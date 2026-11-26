# PRW2 - Avaliação 3

API em Node + Express para gerenciar alunos, com autenticação JWT.

## Integrantes

- Maurício Almeida — [@mauriciosan05](https://github.com/mauriciosan05)
- Héber Zanelli — [@zanelli94](https://github.com/zanelli94)

## Como rodar

```
npm install
npm run dev
```

O servidor sobe na porta 3000.

## Rotas

| Método | Rota | Token |
|---|---|---|
| POST | /register | não |
| POST | /login | não |
| GET | /alunos | sim |
| GET | /alunos/:id | sim |
| GET | /alunos/medias | sim |
| GET | /alunos/aprovados | sim |
| POST | /alunos | sim |
| PUT | /alunos/:id | sim |
| DELETE | /alunos/:id | sim |

Os dados ficam em array na memória, então ao reiniciar o servidor volta só com os 3 alunos iniciais.
