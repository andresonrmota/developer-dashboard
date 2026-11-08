#!/usr/bin/env node
/**
 * Mapeia a pasta de projetos e atualiza src/data/portfolio.json.
 *
 *   node scripts/mapear-projetos.mjs            # grava o JSON e imprime o relatório
 *   node scripts/mapear-projetos.mjs --dry      # só imprime o relatório, não grava
 *   node scripts/mapear-projetos.mjs --json     # relatório em JSON (usado pelo botão do dashboard)
 *   node scripts/mapear-projetos.mjs --dir /outra/pasta
 *
 * Pasta base: --dir, ou a variável PROJETOS_DIR, ou dois níveis acima deste
 * repositório (…/ProjetosIA/Particular/developer-dashboard → …/ProjetosIA).
 *
 * Divisão de responsabilidade (o Smart Sync no App.tsx segue a mesma regra):
 *   - Campos que vêm do código e são sobrescritos aqui a cada rodada:
 *     version, stack, repoUrl, lastUpdated, group.
 *   - Campos que este script só preenche quando estão vazios (curadoria humana
 *     depois no próprio JSON): name, description, category.
 *   - Campos que este script nunca toca (vivem no Firestore, editados no app):
 *     status, url, hostingAccount, firebaseLogin, vercelLogin, modules,
 *     entities, notes.
 *
 * Só stdlib do Node — roda igual no Mac e no Windows.
 */
import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const JSON_PATH = join(ROOT, 'src', 'data', 'portfolio.json')

const args = process.argv.slice(2)
const flag = (name) => args.includes(name)
const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined }

const BASE_DIR = resolve(opt('--dir') ?? process.env.PROJETOS_DIR ?? resolve(ROOT, '..', '..'))
const DRY = flag('--dry')
const AS_JSON = flag('--json')

const IGNORED_DIRS = new Set(['node_modules', 'dist', 'build', 'out', '.git', '.venv', 'venv', '__pycache__', 'android', 'ios'])
const MAX_DEPTH = 4

// ---------- utilidades ----------

function git(dir, ...cmd) {
  try {
    return execFileSync('git', ['-C', dir, ...cmd], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
  } catch {
    return ''
  }
}

function readJson(path) {
  try { return JSON.parse(readFileSync(path, 'utf8')) } catch { return null }
}

function readText(path) {
  try { return readFileSync(path, 'utf8') } catch { return '' }
}

/** git@github.com:a/b.git | https://github.com/a/b.git → https://github.com/a/b */
function normalizeRemote(url) {
  if (!url) return ''
  let u = url.trim()
  const ssh = u.match(/^git@([^:]+):(.+)$/)
  if (ssh) u = `https://${ssh[1]}/${ssh[2]}`
  return u.replace(/\.git$/, '').replace(/\/+$/, '')
}

function repoKey(url) {
  return normalizeRemote(url).toLowerCase()
}

function ownerOf(url) {
  const m = normalizeRemote(url).match(/github\.com\/([^/]+)\//i)
  return m ? m[1].toLowerCase() : ''
}

/** "AssistenteVirtual" → "Assistente Virtual"; "SorteadorMV2026" → "Sorteador MV2026" */
function splitCamel(s) {
  return s.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
}

function slug(s) {
  return splitCamel(s).normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function humanize(folder) {
  return splitCamel(folder).replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim()
}

function findRepos(base) {
  const found = []
  const walk = (dir, depth) => {
    if (depth > MAX_DEPTH) return
    let entries
    try { entries = readdirSync(dir, { withFileTypes: true }) } catch { return }
    if (entries.some((e) => e.name === '.git')) { found.push(dir); return }
    for (const e of entries) {
      if (!e.isDirectory() || e.name.startsWith('.') || IGNORED_DIRS.has(e.name)) continue
      walk(join(dir, e.name), depth + 1)
    }
  }
  walk(base, 0)
  return found.sort()
}

// ---------- detecção de stack ----------

const NPM_TO_TECH = [
  ['next', 'Next.js'], ['react', 'React'], ['vue', 'Vue'], ['svelte', 'Svelte'],
  ['typescript', 'TypeScript'], ['vite', 'Vite'], ['tailwindcss', 'Tailwind CSS'],
  ['electron', 'Electron'], ['@tauri-apps/api', 'Tauri'], ['@capacitor/core', 'Capacitor'],
  ['express', 'Express'], ['fastify', 'Fastify'], ['hono', 'Hono'],
  ['firebase', 'Firebase'], ['firebase-admin', 'Firebase'], ['@supabase/supabase-js', 'Supabase'],
  ['prisma', 'Prisma'], ['@prisma/client', 'Prisma'], ['mongoose', 'MongoDB'], ['pg', 'PostgreSQL'], ['better-sqlite3', 'SQLite'],
  ['playwright', 'Playwright'], ['@playwright/test', 'Playwright'], ['playwright-core', 'Playwright'], ['puppeteer', 'Puppeteer'], ['cheerio', 'Cheerio'],
  ['@google/generative-ai', 'Google AI (Gemini)'], ['@google/genai', 'Google AI (Gemini)'], ['openai', 'OpenAI'], ['@anthropic-ai/sdk', 'Anthropic (Claude)'],
  ['socket.io', 'Socket.io'], ['zustand', 'Zustand'], ['recharts', 'Recharts'], ['chart.js', 'Chart.js'], ['d3', 'D3.js'], ['three', 'Three.js'],
  ['jspdf', 'jsPDF'], ['pdfkit', 'PDFKit'], ['pdf-lib', 'pdf-lib'], ['nodemailer', 'Nodemailer'], ['resend', 'Resend'],
  ['node-cron', 'Cron'], ['cron', 'Cron'], ['remotion', 'Remotion'], ['@dnd-kit/core', 'DnD Kit'],
  ['vite-plugin-pwa', 'PWA'], ['workbox-window', 'PWA'], ['@ducanh2912/next-pwa', 'PWA'], ['next-pwa', 'PWA'],
  ['stripe', 'Stripe'], ['telegraf', 'Telegram Bot'], ['node-telegram-bot-api', 'Telegram Bot'],
  ['whatsapp-web.js', 'WhatsApp Web'], ['@whiskeysockets/baileys', 'WhatsApp (Baileys)'],
  ['d3-scale', 'D3.js'], ['exceljs', 'ExcelJS'], ['oracledb', 'Oracle DB'], ['@ai-sdk/google', 'Google AI (Gemini)'], ['@ai-sdk/openai', 'OpenAI'],
]

const PY_TO_TECH = [
  ['pyside6', 'PySide6 (Qt)'], ['pyqt', 'PyQt'], ['tkinter', 'Tkinter'], ['customtkinter', 'CustomTkinter'], ['flet', 'Flet'],
  ['fastapi', 'FastAPI'], ['flask', 'Flask'], ['django', 'Django'], ['streamlit', 'Streamlit'],
  ['playwright', 'Playwright'], ['selenium', 'Selenium'], ['scrapling', 'Scrapling'], ['beautifulsoup4', 'BeautifulSoup'], ['requests', 'Requests'], ['httpx', 'HTTPX'],
  ['openai', 'OpenAI'], ['google-generativeai', 'Google AI (Gemini)'], ['google-genai', 'Google AI (Gemini)'], ['anthropic', 'Anthropic (Claude)'],
  ['pandas', 'Pandas'], ['sqlalchemy', 'SQLAlchemy'], ['yt-dlp', 'yt-dlp'], ['pyinstaller', 'PyInstaller'],
  ['python-telegram-bot', 'Telegram Bot'], ['firebase-admin', 'Firebase'], ['reportlab', 'ReportLab'], ['openpyxl', 'openpyxl'],
  ['imapclient', 'IMAP'], ['pdfplumber', 'pdfplumber'], ['oracledb', 'Oracle DB'], ['cx_oracle', 'Oracle DB'],
]

/** Ferramentas que não aparecem como dependência (binários, SDKs externos): procuradas no texto do projeto. */
const TEXT_TO_TECH = [
  [/yt[-_]dlp/i, 'yt-dlp'], [/\bffmpeg\b/i, 'FFmpeg'], [/libgdx|badlogic/i, 'LibGDX'], [/\bbox2d\b/i, 'Box2D'],
  [/deepseek/i, 'DeepSeek'], [/\boracledb\b|cx_oracle|oracle 1\dc/i, 'Oracle DB'], [/\bscrapling\b/i, 'Scrapling'],
]

/**
 * Subpastas que costumam ser "a outra metade" do projeto (front/, runner/,
 * functions/…) e cujas dependências contam na stack. Lista fechada de
 * propósito: docs/, tests/, scripts/ têm package.json de ferramenta e
 * poluiriam a stack com coisa que o projeto não usa.
 */
const SUBPROJECT_NAMES = new Set(['front', 'frontend', 'web', 'app', 'client', 'server', 'backend', 'api', 'runner', 'functions', 'electron', 'desktop', 'mobile', 'site'])

function subprojectDirs(dir) {
  try {
    return readdirSync(dir, { withFileTypes: true })
      .filter((e) => e.isDirectory() && SUBPROJECT_NAMES.has(e.name.toLowerCase()))
      .map((e) => join(dir, e.name))
  } catch { return [] }
}

function detectStack(dir) {
  const stack = []
  const add = (t) => { if (t && !stack.includes(t)) stack.push(t) }
  const roots = [dir, ...subprojectDirs(dir)]
  const anyHas = (file) => roots.some((r) => existsSync(join(r, file)))

  // npm: união das dependências do projeto e dos subprojetos de primeiro nível
  let deps = null
  for (const r of roots) {
    const pkg = readJson(join(r, 'package.json'))
    if (pkg) deps = { ...(deps ?? {}), ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) }
  }

  // Python e heurísticas de texto só olham a raiz do projeto: um scripts/*.py
  // de apoio não faz de um app React um projeto Python.
  const rootFiles = (r) => { try { return readdirSync(r) } catch { return [] } }
  const pyText = (readText(join(dir, 'pyproject.toml')) + '\n' + readText(join(dir, 'requirements.txt'))).toLowerCase()
  const rootPyFiles = rootFiles(dir).filter((f) => f.endsWith('.py')).map((f) => join(dir, f))
  const isPython = pyText.trim() !== '' || rootPyFiles.length > 0

  const gradle = roots.map((r) => readText(join(r, 'build.gradle.kts')) + readText(join(r, 'build.gradle'))).join('\n')
  const srcText = ['README.md', 'readme.md', 'CLAUDE.md', 'pyproject.toml', 'requirements.txt', 'build.gradle.kts']
    .map((f) => readText(join(dir, f)))
    .concat(rootPyFiles.map((p) => readText(p)))
    .join('\n') + gradle

  if (anyHas('project.godot')) add('Godot')
  if (gradle.trim()) add('Kotlin')
  if (isPython) add('Python')

  if (deps) {
    if (!deps.react && !deps.next && !deps.vue && !deps.svelte && !deps.electron) add('Node.js')
    for (const [name, tech] of NPM_TO_TECH) if (name in deps) add(tech)
    if (!deps.typescript && anyHas('tsconfig.json')) add('TypeScript')
    if (!deps.typescript && !anyHas('tsconfig.json')) add('JavaScript')
  }

  if (isPython) {
    for (const [name, tech] of PY_TO_TECH) if (pyText.includes(name)) add(tech)
  }

  for (const [re, tech] of TEXT_TO_TECH) if (re.test(srcText)) add(tech)

  if (anyHas('Cargo.toml')) add('Rust')
  if (anyHas('src-tauri')) add('Tauri')
  if (anyHas('firebase.json')) add('Firebase')
  if (existsSync(join(dir, 'functions'))) add('Firebase Functions')
  if (anyHas('vercel.json')) add('Vercel')
  if (anyHas('android') || gradle.trim()) add('Android')
  if (roots.some((r) => { try { return readdirSync(r).some((f) => f.endsWith('.iss')) } catch { return false } })) add('Inno Setup')
  if (anyHas('Dockerfile')) add('Docker')

  return stack
}

function detectCategory(stack, dir, group) {
  const has = (t) => stack.includes(t)
  if (group === 'Jogos' || has('Godot') || has('LibGDX')) return 'Game'
  if (has('Remotion')) return 'Video'
  if (has('Electron') || has('Tauri') || has('PySide6 (Qt)') || has('PyQt') || has('Tkinter') || has('CustomTkinter') || has('Flet')) return 'Desktop App'
  if (has('Next.js') || has('React') || has('Vue') || has('Svelte')) return 'Web App'
  if (has('Express') || has('FastAPI') || has('Flask') || has('Django') || has('Fastify') || has('Hono')) return 'API'
  if (has('Playwright') || has('Puppeteer') || has('Selenium') || has('Scrapling') || has('Cron')) return 'Automation'
  if (existsSync(join(dir, 'index.html'))) return 'Web App'
  return 'Tool'
}

// ---------- leitura de um projeto ----------

/** Alguns repositórios guardam o app numa subpasta (ex.: Videos/meus-videos). */
function projectRoot(dir) {
  const markers = ['package.json', 'pyproject.toml', 'requirements.txt', 'project.godot', 'Cargo.toml', 'main.py', 'index.html']
  const hasMarker = (d) => markers.some((m) => existsSync(join(d, m)))
  if (hasMarker(dir)) return dir
  let subs = []
  try { subs = readdirSync(dir, { withFileTypes: true }) } catch { /* vazio */ }
  const sub = subs.find((e) => e.isDirectory() && !e.name.startsWith('.') && !IGNORED_DIRS.has(e.name) && hasMarker(join(dir, e.name)))
  return sub ? join(dir, sub.name) : dir
}

/** READMEs que o gerador de projeto deixou e ninguém reescreveu não dizem nada sobre o projeto. */
const BOILERPLATE = /bootstrapped with|This template provides|My Remotion video|Welcome to your Remotion project|create-react-app|create-next-app|Getting Started|run the development server|official plugins are available/i

function readmeSummary(dir) {
  let name
  try { name = readdirSync(dir).find((f) => /^readme(\.md)?$/i.test(f)) } catch { return '' }
  if (!name) return ''
  const text = readText(join(dir, name))
  const paragraphs = text.split(/\r?\n\s*\r?\n/)
  for (const p of paragraphs) {
    const line = p.replace(/\s+/g, ' ').trim()
    if (!line || line.startsWith('#') || line.startsWith('!') || line.startsWith('<') || line.startsWith('[') || line.startsWith('```') || line.startsWith('|')) continue
    const clean = line.replace(/[*_`>]/g, '').trim()
    if (clean.length < 20 || BOILERPLATE.test(clean)) continue
    return clean.length > 220 ? clean.slice(0, 217).replace(/\s+\S*$/, '') + '…' : clean
  }
  return ''
}

function detectVersion(root, dir) {
  const pkg = readJson(join(root, 'package.json'))
  if (pkg?.version) return pkg.version
  const py = readText(join(root, 'pyproject.toml')).match(/^\s*version\s*=\s*["']([^"']+)["']/m)
  if (py) return py[1]
  // Android/Kotlin: version.properties ou versionName no gradle
  const props = readText(join(root, 'version.properties')).match(/^\s*versionName\s*=\s*(.+)$/m)
  if (props) return props[1].trim().replace(/^["']|["']$/g, '')
  const gradle = (readText(join(root, 'build.gradle.kts')) + readText(join(root, 'android', 'build.gradle.kts'))).match(/versionName\s*=?\s*["']([^"']+)["']/)
  if (gradle) return gradle[1]
  const godot = readText(join(root, 'project.godot')).match(/config\/version\s*=\s*"([^"]+)"/)
  if (godot) return godot[1]
  const tag = git(dir, 'describe', '--tags', '--abbrev=0')
  if (tag) return tag.replace(/^v/i, '')
  return '0.1.0'
}

function scanProject(dir, base) {
  const rel = relative(base, dir)
  const group = rel.split(/[\\/]/)[0]
  const remote = normalizeRemote(git(dir, 'remote', 'get-url', 'origin'))
  const root = projectRoot(dir)
  const pkg = readJson(join(root, 'package.json'))
  const stack = detectStack(root)
  const pkgDescription = (pkg?.description ?? '').trim()
  return {
    folder: rel,
    group,
    name: humanize(basename(dir)),
    description: (BOILERPLATE.test(pkgDescription) ? '' : pkgDescription) || readmeSummary(root) || readmeSummary(dir),
    version: detectVersion(root, dir),
    stack,
    category: detectCategory(stack, root, group),
    repoUrl: remote,
    lastUpdated: git(dir, 'log', '-1', '--format=%cI') || new Date().toISOString(),
  }
}

/**
 * Dados que só o GitHub tem: URL de produção (a Vercel preenche o "homepage")
 * e descrição do repositório. Opcional — sem `gh` autenticado, segue sem eles.
 */
function githubInfo(owner) {
  if (!owner) return new Map()
  try {
    const out = execFileSync('gh', ['repo', 'list', owner, '--limit', '500', '--json', 'name,homepageUrl,description,isArchived'],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 30_000 })
    return new Map(JSON.parse(out).map((r) => [r.name.toLowerCase(), r]))
  } catch {
    return new Map()
  }
}

// ---------- fusão com o JSON existente ----------

const MACHINE_FIELDS = ['version', 'stack', 'repoUrl', 'lastUpdated', 'group']
const FILL_IF_EMPTY = ['name', 'description', 'category']

function same(a, b) { return JSON.stringify(a) === JSON.stringify(b) }

function main() {
  if (!existsSync(BASE_DIR)) {
    console.error(`Pasta base não encontrada: ${BASE_DIR}`)
    process.exit(1)
  }

  const existing = readJson(JSON_PATH) ?? []
  const byRepo = new Map(existing.filter((e) => e.repoUrl).map((e) => [repoKey(e.repoUrl), e]))
  const byId = new Map(existing.map((e) => [e.id, e]))

  // Dono = dono do remoto deste próprio dashboard. Repositórios de outros donos
  // são clones de estudo/terceiros e ficam fora do portfólio.
  const owner = ownerOf(git(ROOT, 'remote', 'get-url', 'origin'))

  const github = githubInfo(owner)
  const report = { base: BASE_DIR, owner, github: github.size > 0, novos: [], atualizados: [], inalterados: [], semPasta: [], terceiros: [], semRemoto: [] }
  const matchedIds = new Set()
  const result = []

  for (const dir of findRepos(BASE_DIR)) {
    const scanned = scanProject(dir, BASE_DIR)
    if (!scanned.repoUrl) { report.semRemoto.push(scanned.folder); continue }
    if (owner && ownerOf(scanned.repoUrl) !== owner) { report.terceiros.push(`${scanned.folder} → ${scanned.repoUrl}`); continue }

    const gh = github.get(basename(scanned.repoUrl).toLowerCase())
    if (gh && !scanned.description && gh.description) scanned.description = gh.description.trim()
    const ghUrl = gh?.homepageUrl?.trim() ?? ''

    const current = byRepo.get(repoKey(scanned.repoUrl)) ?? byId.get(slug(basename(dir)))
    if (current) {
      matchedIds.add(current.id)
      const next = { ...current }
      const mudancas = []
      for (const f of MACHINE_FIELDS) {
        if (!same(current[f], scanned[f])) { mudancas.push(f === 'lastUpdated' ? f : `${f}: ${JSON.stringify(current[f])} → ${JSON.stringify(scanned[f])}`); next[f] = scanned[f] }
      }
      for (const f of FILL_IF_EMPTY) {
        if (!current[f] && scanned[f]) { mudancas.push(`${f} (preenchido)`); next[f] = scanned[f] }
      }
      if (!current.url && ghUrl) { mudancas.push(`url (do GitHub): ${ghUrl}`); next.url = ghUrl }
      result.push(next)
      if (mudancas.length) report.atualizados.push({ id: current.id, name: next.name, mudancas })
      else report.inalterados.push(current.id)
    } else {
      const entry = {
        id: slug(basename(dir)),
        name: scanned.name,
        description: scanned.description,
        status: gh?.isArchived ? 'archived' : 'development',
        version: scanned.version,
        stack: scanned.stack,
        url: ghUrl,
        repoUrl: scanned.repoUrl,
        lastUpdated: scanned.lastUpdated,
        category: scanned.category,
        group: scanned.group,
        hostingAccount: '',
        firebaseLogin: '',
        vercelLogin: '',
        notes: '',
      }
      result.push(entry)
      report.novos.push({ id: entry.id, name: entry.name, folder: scanned.folder, version: entry.version, stack: entry.stack, category: entry.category, url: entry.url, description: entry.description })
    }
  }

  // Entradas antigas sem pasta local: ficam, mas avisamos (nunca apagamos sozinhos).
  for (const e of existing) {
    if (!matchedIds.has(e.id)) { result.push(e); report.semPasta.push(`${e.id} (${e.repoUrl || 'sem repoUrl'})`) }
  }

  result.sort((a, b) => (a.group ?? '~').localeCompare(b.group ?? '~') || a.name.localeCompare(b.name))
  report.total = result.length
  report.gravado = !DRY

  if (!DRY) writeFileSync(JSON_PATH, JSON.stringify(result, null, 2) + '\n')

  if (AS_JSON) { console.log(JSON.stringify(report, null, 2)); return }

  const line = (s = '') => console.log(s)
  line(`Pasta base: ${BASE_DIR}`)
  line(`Dono considerado: ${owner || '(qualquer)'}  ·  dados do GitHub: ${report.github ? 'sim' : 'não (gh indisponível)'}`)
  line()
  line(`NOVOS (${report.novos.length}) — entram como "development", revise descrição e status:`)
  for (const n of report.novos) {
    line(`  + ${n.id}  [${n.folder}]  v${n.version}  ${n.category}${n.url ? '  ' + n.url : ''}`)
    line(`      stack: ${n.stack.join(', ') || '—'}`)
    line(`      desc:  ${n.description || '(vazia)'}`)
  }
  line()
  line(`ATUALIZADOS (${report.atualizados.length}):`)
  for (const a of report.atualizados) line(`  ~ ${a.id}: ${a.mudancas.join('; ')}`)
  line()
  line(`Inalterados: ${report.inalterados.length}`)
  if (report.semPasta.length) { line(); line(`SEM PASTA LOCAL (mantidos, confira se ainda valem):`); report.semPasta.forEach((s) => line(`  ? ${s}`)) }
  if (report.terceiros.length) { line(); line(`Ignorados por serem de outro dono:`); report.terceiros.forEach((s) => line(`  - ${s}`)) }
  if (report.semRemoto.length) { line(); line(`Ignorados por não terem remoto:`); report.semRemoto.forEach((s) => line(`  - ${s}`)) }
  line()
  line(DRY ? `(--dry: nada foi gravado) total seria ${report.total}` : `Gravado em ${relative(ROOT, JSON_PATH)} — ${report.total} projetos.`)
}

main()
