interface StackBadgeProps {
  tech: string
}

const techColors: Record<string, string> = {
  // Frontend
  react:       'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  vue:         'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  angular:     'bg-red-500/10 text-red-400 border-red-500/20',
  svelte:      'bg-orange-500/10 text-orange-400 border-orange-500/20',
  nextjs:      'bg-slate-400/10 text-slate-300 border-slate-500/20',
  nuxt:        'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  astro:       'bg-orange-500/10 text-orange-300 border-orange-500/20',

  // Languages
  typescript:  'bg-blue-500/10 text-blue-400 border-blue-500/20',
  javascript:  'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  python:      'bg-blue-400/10 text-blue-300 border-blue-400/20',
  go:          'bg-cyan-400/10 text-cyan-300 border-cyan-400/20',
  rust:        'bg-orange-600/10 text-orange-400 border-orange-600/20',

  // Styling
  tailwind:    'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  tailwindcss: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  css:         'bg-blue-500/10 text-blue-400 border-blue-500/20',
  sass:        'bg-pink-500/10 text-pink-400 border-pink-500/20',

  // Backend
  nodejs:      'bg-green-500/10 text-green-400 border-green-500/20',
  'node.js':   'bg-green-500/10 text-green-400 border-green-500/20',
  express:     'bg-slate-400/10 text-slate-300 border-slate-500/20',
  fastapi:     'bg-teal-500/10 text-teal-400 border-teal-500/20',
  django:      'bg-green-600/10 text-green-400 border-green-600/20',

  // Databases & BaaS
  firebase:    'bg-amber-500/10 text-amber-400 border-amber-500/20',
  supabase:    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  postgresql:  'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  postgres:    'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  mongodb:     'bg-green-500/10 text-green-400 border-green-500/20',
  redis:       'bg-red-500/10 text-red-400 border-red-500/20',
  sqlite:      'bg-blue-400/10 text-blue-300 border-blue-400/20',

  // Cloud & DevOps
  vercel:      'bg-slate-300/10 text-slate-300 border-slate-400/20',
  netlify:     'bg-teal-500/10 text-teal-400 border-teal-500/20',
  aws:         'bg-amber-500/10 text-amber-400 border-amber-500/20',
  gcp:         'bg-blue-500/10 text-blue-400 border-blue-500/20',
  azure:       'bg-blue-600/10 text-blue-400 border-blue-600/20',
  docker:      'bg-blue-400/10 text-blue-300 border-blue-400/20',
  kubernetes:  'bg-blue-500/10 text-blue-400 border-blue-500/20',

  // AI / ML
  openai:      'bg-emerald-400/10 text-emerald-300 border-emerald-400/20',
  'google ai studio': 'bg-blue-400/10 text-blue-300 border-blue-400/20',
  'google ai': 'bg-blue-400/10 text-blue-300 border-blue-400/20',
  gemini:      'bg-violet-500/10 text-violet-400 border-violet-500/20',
  langchain:   'bg-violet-500/10 text-violet-400 border-violet-500/20',

  // Other
  graphql:     'bg-pink-500/10 text-pink-400 border-pink-500/20',
  trpc:        'bg-blue-500/10 text-blue-400 border-blue-500/20',
  prisma:      'bg-slate-400/10 text-slate-300 border-slate-500/20',
  stripe:      'bg-violet-500/10 text-violet-400 border-violet-500/20',
  vite:        'bg-purple-500/10 text-purple-400 border-purple-500/20',
}

export function StackBadge({ tech }: StackBadgeProps) {
  const key = tech.toLowerCase()
  const colorClass =
    techColors[key] ?? 'bg-slate-600/20 text-slate-400 border-slate-600/30'

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium border ${colorClass} transition-all duration-150 hover:brightness-125`}
    >
      {tech}
    </span>
  )
}
