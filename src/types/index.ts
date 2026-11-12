export type ProjectStatus =
  | 'production'
  | 'beta'
  | 'development'
  | 'archived'
  | 'maintenance';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  version: string;
  stack: string[];
  url?: string;
  repoUrl?: string;
  category?: string;
  /** Pasta de primeiro nível em ProjetosIA (Consultoria, Corporativo, Particular…). Vem do mapeamento. */
  group?: string;
  /** Data do último commit (ISO). Vem do mapeamento. */
  lastUpdated?: string;
  /** Quando a versão mudou pela última vez via GitHub (ISO). Preenchido pelo login com GitHub. */
  githubSyncedAt?: string;
  /** Data/hora (ISO) do último commit, lida do GitHub no login com GitHub. */
  lastCommitAt?: string;
  owner?: string;
  hostingAccount?: string;
  firebaseLogin?: string;
  vercelLogin?: string;
  notes?: string;
  modules?: string;
  entities?: string;
  createdAt?: any;
  updatedAt?: any;
}

export type SortField = 'name' | 'lastUpdated' | 'status';
export type SortOrder = 'asc' | 'desc';

export interface FilterState {
  query: string;
  status: ProjectStatus | 'all';
  sortField: SortField;
  sortOrder: SortOrder;
}
