import type { Project } from '../types'

export interface GithubInfo {
  /** Versão lida dos arquivos do repositório (mesma ordem do `npm run mapear`). */
  version?: string
  /** Data/hora (ISO) do último commit da branch padrão. */
  lastCommitAt?: string
}

/** Arquivos onde a versão pode estar, na raiz do repositório. */
const FILES = {
  pkg: 'package.json',
  py: 'pyproject.toml',
  props: 'version.properties',
  gradle: 'build.gradle.kts',
  gradleAndroid: 'android/build.gradle.kts',
  godot: 'project.godot',
} as const

type Blob = { text?: string | null } | null
type RepoNode = {
  defaultBranchRef?: { target?: { committedDate?: string } | null } | null
} & Partial<Record<keyof typeof FILES, Blob>>

/**
 * Lê do GitHub, numa única chamada GraphQL, a versão e a data do último commit
 * de cada projeto. Uma chamada só evita os 404 que a API REST devolvia para
 * cada repositório sem package.json.
 *
 * Devolve { [projectId]: info } apenas para os repositórios encontrados.
 */
export async function fetchGithubInfo(
  projects: Project[],
  token: string,
): Promise<Record<string, GithubInfo>> {
  const repos = projects
    .map((p) => ({ id: p.id, repo: parseRepo(p.repoUrl) }))
    .filter((r): r is { id: string; repo: { owner: string; name: string } } => !!r.repo)
  if (repos.length === 0) return {}

  const fileFields = Object.entries(FILES)
    .map(([alias, path]) => `${alias}: object(expression: "HEAD:${path}") { ... on Blob { text } }`)
    .join('\n')
  const query = `query {
    ${repos
      .map(
        (r, i) => `r${i}: repository(owner: ${JSON.stringify(r.repo.owner)}, name: ${JSON.stringify(r.repo.name)}) {
      defaultBranchRef { target { ... on Commit { committedDate } } }
      ${fileFields}
    }`,
      )
      .join('\n')}
  }`

  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  })
  if (!res.ok) throw new Error(`GitHub GraphQL: HTTP ${res.status}`)
  const json = (await res.json()) as { data?: Record<string, RepoNode | null> }
  const data = json.data ?? {}

  const result: Record<string, GithubInfo> = {}
  repos.forEach((r, i) => {
    const node = data[`r${i}`]
    if (!node) {
      console.warn(`GitHub: repositório não encontrado para ${r.id}`)
      return
    }
    const info: GithubInfo = {}
    const date = node.defaultBranchRef?.target?.committedDate
    if (date) info.lastCommitAt = new Date(date).toISOString()
    const version = detectVersion(node)
    if (version) info.version = version
    if (info.version || info.lastCommitAt) result[r.id] = info
  })
  return result
}

/** Mesma ordem de scripts/mapear-projetos.mjs: package.json, pyproject, version.properties, gradle, godot. */
function detectVersion(node: RepoNode): string | undefined {
  const text = (k: keyof typeof FILES) => node[k]?.text ?? ''
  try {
    const pkg = text('pkg') ? (JSON.parse(text('pkg')) as { version?: string }) : null
    if (pkg?.version) return pkg.version
  } catch {
    /* package.json inválido: segue para os próximos */
  }
  const py = text('py').match(/^\s*version\s*=\s*["']([^"']+)["']/m)
  if (py) return py[1]
  const props = text('props').match(/^\s*versionName\s*=\s*(.+)$/m)
  if (props) return props[1].trim().replace(/^["']|["']$/g, '')
  const gradle = (text('gradle') + text('gradleAndroid')).match(/versionName\s*=?\s*["']([^"']+)["']/)
  if (gradle) return gradle[1]
  const godot = text('godot').match(/config\/version\s*=\s*"([^"]+)"/)
  if (godot) return godot[1]
  return undefined
}

function parseRepo(url?: string): { owner: string; name: string } | null {
  if (!url) return null
  const m = url.match(/github\.com\/([^/]+)\/([^/#?]+?)(?:\.git)?\/?$/i)
  return m ? { owner: m[1], name: m[2] } : null
}
