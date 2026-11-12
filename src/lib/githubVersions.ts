import type { Project } from '../types'

/**
 * Lê a versão de cada projeto direto do GitHub (branch padrão), usando o token
 * do login com GitHub. Só lê `package.json`; projetos sem ele ficam com a
 * versão que já está no portfolio.json.
 *
 * Devolve { [projectId]: version } apenas para os que foram lidos com sucesso.
 */
export async function fetchGithubVersions(
  projects: Project[],
  token: string,
): Promise<Record<string, string>> {
  const result: Record<string, string> = {}

  await Promise.all(
    projects.map(async (p) => {
      const repo = parseRepo(p.repoUrl)
      if (!repo) return
      try {
        const res = await fetch(
          `https://api.github.com/repos/${repo.owner}/${repo.name}/contents/package.json`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/vnd.github+json',
            },
          },
        )
        if (!res.ok) return
        const data = (await res.json()) as { content?: string; encoding?: string }
        if (!data.content || data.encoding !== 'base64') return
        const pkg = JSON.parse(decodeBase64Utf8(data.content)) as { version?: string }
        if (pkg.version) result[p.id] = pkg.version
      } catch (err) {
        console.warn(`GitHub: não consegui ler a versão de ${p.id}`, err)
      }
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
