export interface Repository {
  name: string;
  author: string;
  url: string;
  description?: string;
  language?: string;
  languageColor?: string;
  stars: number;
  forks: number;
  starsInPeriod: number;
  rank: number;
  avatar?: string;
  topics?: string[];
  // AI enhanced fields
  aiSummary?: string;
  keyFeatures?: string[];
  useCases?: string[];
}

export interface Developer {
  username: string;
  name?: string;
  url: string;
  avatar: string;
}

export interface TrendOptions {
  language?: string;
  since?: 'daily' | 'weekly' | 'monthly';
  limit?: number;
  topics?: string[];
}

export interface FilterOptions {
  limit: number;
  topics?: string[];
}

export interface SearchOptions {
  sort?: 'stars' | 'forks' | 'updated';
  order?: 'asc' | 'desc';
  limit?: number;
}

export interface SearchResult {
  totalCount: number;
  items: Repository[];
}
