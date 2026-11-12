import type { Project } from '../types'

export interface GithubInfo {
  /** Versão do package.json na branch padrão. */
  version?: string
  /** Data/hora (ISO) do último commit da branch padrão. */
  lastCommitAt?: string
}

/**
 * Lê do GitHub, para cada projeto, a versão (package.json) e a data do último
 * commit da branch padrão, usando o token do login com GitHub.
 * Projetos sem package.json ficam só com a data do commit.
 *
 * Devolve { [projectId]: info } apenas para os que foram lidos com sucesso.
 */
export async function fetchGithubInfo(
  projects: Project[],
  token: string,
): Promise<Record<string, GithubInfo>> {
  const result: Record<string, GithubInfo> = {}

  await Promise.all(
    projects.map(async (p) => {
      const repo = parseRepo(p.repoUrl)
      if (!repo) return
      const base = `https://api.github.com/repos/${repo.owner}/${repo.name}`
      const headers = {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
      }
      const info: GithubInfo = {}

      try {
        const res = await fetch(`${base}/contents/package.json`, { headers })
        if (res.ok) {
          const data = (await res.json()) as { content?: string; encoding?: string }
          if (data.content && data.encoding === 'base64') {
            const pkg = JSON.parse(decodeBase64Utf8(data.content)) as { version?: string }
            if (pkg.version) info.version = pkg.version
          }
        }
      } catch (err) {
        console.warn(`GitHub: não consegui ler a versão de ${p.id}`, err)
      }

      try {
        const res = await fetch(`${base}/commits?per_page=1`, { headers })
        if (res.ok) {
          const commits = (await res.json()) as Array<{ commit?: { committer?: { date?: string } } }>
          const date = commits[0]?.commit?.committer?.date
          if (date) info.lastCommitAt = new Date(date).toISOString()
        }
      } catch (err) {
        console.warn(`GitHub: não consegui ler o último commit de ${p.id}`, err)
      }

      if (info.version || info.lastCommitAt) result[p.id] = info
    }),
  )

  return result
}

function parseRepo(url?: string): { owner: string; name: string } | null {
  if (!url) return null
  const m = url.match(/github\.com\/([^/]+)\/([^/#?]+?)(?:\.git)?\/?$/i)
  return m ? { owner: m[1], name: m[2] } : null
}

function decodeBase64Utf8(b64: string): string {
  const clean = b64.replace(/\s/g, '')
  const bytes = Uint8Array.from(atob(clean), (c) => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}
