// Tipos e interfaces para o sistema de publicação automática

export interface DailyPost {
  id: string;
  message: string;
  link?: string | null;
  imageUrl?: string | null;
  kind?: 'feed' | 'reel';
  videoUrl?: string | null;
  days: string[];
}

export interface DailyPostsConfig {
  posts: DailyPost[];
  schedule: {
    time: string;
    timezone: string;
    enabled: boolean;
  };
}

export interface PublicationEntry {
  id: string;
  postId: string | null;
  message: string;
  link?: string;
  kind?: 'feed' | 'reel';
  status: 'success' | 'error' | 'processing';
  timestamp: string;
  error?: string;
  dayOfWeek: string;
}

export interface PublicationLog {
  publications: PublicationEntry[];
}

export interface PublicationStats {
  total: number;
  success: number;
  failed: number;
  processing?: number;
  lastPublication: PublicationEntry | null;
}

export interface SchedulerStatus {
  enabled: boolean;
  nextPost: DailyPost | null;
  nextPublicationTime: string | null;
  lastPublication: PublicationEntry | null;
  stats: PublicationStats;
}
