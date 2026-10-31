import { readJson, writeJson } from './jsonStore';

export async function readState(): Promise<{ enabled: boolean }> {
  return readJson('logs/scheduler-state.json', { enabled: process.env.SCHEDULER_ENABLED === 'true' });
}

export async function writeState(state: { enabled: boolean }): Promise<void> {
  await writeJson('logs/scheduler-state.json', state);
}
