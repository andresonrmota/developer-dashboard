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

## Mantendo o portfólio atualizado

A fonte dos dados é a pasta de projetos no disco (`…/ProjetosIA`). Um script lê cada
repositório Git dela e reescreve `src/data/portfolio.json`:

```bash
npm run mapear          # grava o JSON e imprime o relatório
npm run mapear -- --dry # só mostra o que mudaria
```

Pasta base: dois níveis acima deste repositório, ou `--dir <pasta>` / variável `PROJETOS_DIR`.
Repositórios cujo `origin` é de outro dono (clones de estudo) ficam de fora. Com o
`gh` autenticado, o script também puxa do GitHub a URL de produção e a descrição do repositório.

### Pelo botão (localhost)

Em `npm run dev`, logado como owner, o cabeçalho mostra **Mapear projetos**. O botão chama
`POST /__mapear` (um middleware do Vite, só no dev server), roda o script, mostra o relatório
e oferece **Recarregar e sincronizar**, que dispara o Smart Sync pro Firestore.

### Pelo Claude

Sem o botão à mão, cole no Claude Code aberto nesta pasta:

> Na pasta do developer-dashboard, rode `npm run mapear` e leia o relatório. Para cada projeto em
> NOVOS, revise em src/data/portfolio.json a descrição (uma frase, o que o projeto faz) e o status
> (production se tem versão >= 1.0 e está em uso; beta se está em validação; development se não).
> Confira os SEM PASTA LOCAL: mantenha só os que ainda existem. Rode `npm run build`, faça commit e
> push. Depois abra o dashboard logado como owner: o Smart Sync envia as mudanças ao Firestore sozinho.

### Quem manda em cada campo

| Fonte de verdade | Campos | Como muda |
|---|---|---|
| `portfolio.json` (gerado) | `version` `stack` `repoUrl` `lastUpdated` `group` | sobrescritos a cada `npm run mapear` |
| `portfolio.json` (curado) | `name` `description` `category` | o script só preenche quando vazio; edite à mão no JSON |
| Firestore (editado no app) | `status` `url` `hostingAccount` `firebaseLogin` `vercelLogin` `modules` `entities` `notes` | o JSON nunca sobrescreve; `url` é preenchida pelo script só quando vazia |

O **Smart Sync** (App.tsx) roda quando o owner abre o dashboard: cria no Firestore os projetos que
só existem no JSON e empurra qualquer diferença nos campos do JSON. Projetos sem pasta local são
mantidos e listados no relatório — apagar é decisão sua.

## Schema de um projeto

Cada entrada de `src/data/portfolio.json` tem este formato:

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
    "group": "Particular",
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
| `lastUpdated` | string   | ✅          | Data ISO 8601 do último commit (o card e a ordenação usam esta) |
| `url`         | string   | —           | URL do projeto em produção                        |
| `repoUrl`     | string   | —           | URL do repositório (GitHub, GitLab, etc.)         |
| `category`    | string   | —           | Tipo: `Web App` `Desktop App` `Game` `Automation` `API` `Internal Tool` `Study` `Video` `Tool` |
| `group`       | string   | —           | Pasta de primeiro nível em ProjetosIA (`Consultoria`, `Corporativo`, `Particular`…) |
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
npm run mapear   # Lê a pasta de projetos e atualiza src/data/portfolio.json
```

## Estrutura do Projeto

```
dev-portal/
├── scripts/
│   └── mapear-projetos.mjs  # Mapeia a pasta ProjetosIA → portfolio.json (só stdlib do Node)
├── src/
│   ├── components/
│   │   ├── Header.tsx       # Cabeçalho com métricas e o botão "Mapear projetos" (dev + owner)
│   │   ├── MapearModal.tsx  # Relatório do mapeamento e o prompt pro Claude
│   │   ├── ProjectCard.tsx  # Card de cada projeto
│   │   ├── EditModal.tsx    # Metadados editados no Firestore (infra, módulos, notas)
│   │   ├── SearchBar.tsx    # Busca e filtro por status
│   │   ├── StatusBadge.tsx  # Badge colorido de status
│   │   ├── StackBadge.tsx   # Badge de tecnologia
│   │   ├── EmptyState.tsx   # Estado vazio
│   │   └── downloads/       # Páginas de download dos apps desktop
│   ├── data/
│   │   └── portfolio.json   # ← Gerado pelo mapeamento + curadoria manual
│   ├── types/
│   │   └── index.ts         # Tipos TypeScript
│   ├── App.tsx              # Roteamento, Firestore em tempo real e Smart Sync
│   ├── main.tsx
│   └── index.css
├── tailwind.config.js
├── vite.config.ts           # Plugin do endpoint POST /__mapear (dev server)
└── package.json
```
