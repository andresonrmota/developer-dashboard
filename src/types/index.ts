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
