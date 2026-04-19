# Dev Portal — Internal Developer Dashboard

Dashboard pessoal para organizar e visualizar seu portfólio de aplicações. Construído com **React 18**, **TypeScript**, **Vite** e **Tailwind CSS** em dark mode.

## Início Rápido

```bash
# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

Acesse: `http://localhost:5173`

---

## Adicionando Projetos

Edite o arquivo `src/data/portfolio.json` com seus projetos. O schema de cada projeto é:

```json
[
  {
    "id": "unique-id",
    "name": "Nome do Projeto",
    "description": "Uma breve descrição do que o projeto faz.",
    "status": "production",
    "version": "1.0.0",
    "stack": ["React", "TypeScript", "Firebase", "Vercel"],
    "url": "https://meu-projeto.vercel.app",
    "repoUrl": "https://github.com/user/repo",
    "lastUpdated": "2024-06-15T10:30:00Z",
    "category": "Web App",
    "owner": "Andreson"
  }
]
```

### Campos

| Campo         | Tipo     | Obrigatório | Descrição                                         |
|---------------|----------|-------------|---------------------------------------------------|
| `id`          | string   | ✅          | Identificador único do projeto                    |
| `name`        | string   | ✅          | Nome de exibição                                  |
| `description` | string   | ✅          | Descrição curta (aparece no card)                 |
| `status`      | enum     | ✅          | `production` `beta` `development` `maintenance` `archived` |
| `version`     | string   | ✅          | Versão atual (ex: `2.1.3`)                        |
| `stack`       | string[] | ✅          | Lista de tecnologias usadas                       |
| `lastUpdated` | string   | ✅          | Data ISO 8601 da última atualização               |
| `url`         | string   | —           | URL do projeto em produção                        |
| `repoUrl`     | string   | —           | URL do repositório (GitHub, GitLab, etc.)         |
| `category`    | string   | —           | Categoria/tipo (ex: "Web App", "API", "CLI")      |
| `owner`       | string   | —           | Responsável pelo projeto                          |

### Status disponíveis

| Valor         | Cor     | Significado                        |
|---------------|---------|------------------------------------|
| `production`  | 🟢 Verde  | Projeto em produção e estável      |
| `beta`        | 🟡 Amarelo| Versão beta / testes com usuários  |
| `development` | 🔵 Azul   | Em desenvolvimento ativo           |
| `maintenance` | 🟠 Laranja| Em manutenção / sem novos features |
| `archived`    | ⚫ Cinza  | Arquivado / inativo                |

---

## Tecnologias com cores automáticas

O portal reconhece e colore automaticamente: React, Vue, Angular, Next.js, TypeScript, Python, Go, Tailwind, Firebase, Supabase, PostgreSQL, MongoDB, Redis, Vercel, Netlify, AWS, GCP, Docker, OpenAI, Gemini, Google AI Studio, GraphQL, Prisma, Stripe e muitas outras.

Tecnologias não reconhecidas aparecem com um badge cinza neutro.

---

## Scripts

```bash
npm run dev      # Inicia servidor de desenvolvimento
npm run build    # Build de produção (dist/)
npm run preview  # Preview do build local
npm run lint     # Verifica erros de ESLint
```

## Estrutura do Projeto

```
dev-portal/
├── src/
│   ├── components/
│   │   ├── Header.tsx       # Cabeçalho com métricas dinâmicas
│   │   ├── ProjectCard.tsx  # Card de cada projeto
│   │   ├── SearchBar.tsx    # Busca e filtro por status
│   │   ├── StatusBadge.tsx  # Badge colorido de status
│   │   ├── StackBadge.tsx   # Badge de tecnologia
│   │   └── EmptyState.tsx   # Estado vazio
│   ├── data/
│   │   └── portfolio.json   # ← Seus projetos ficam aqui
│   ├── types/
│   │   └── index.ts         # Tipos TypeScript
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── tailwind.config.js
├── vite.config.ts
└── package.json
```
# developer-dashboard
# developer-dashboard
