import defaults from '../../content/daily-posts.json';
import { DailyPostsConfig } from '@/types/scheduler';
import { readJson, writeJson } from './jsonStore';

export async function readConfig(): Promise<DailyPostsConfig> {
  return readJson('content/daily-posts.json', defaults as DailyPostsConfig);
}

export async function writeConfig(config: DailyPostsConfig): Promise<void> {
  await writeJson('content/daily-posts.json', config);
}
