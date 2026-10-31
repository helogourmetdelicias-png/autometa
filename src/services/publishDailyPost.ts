import { DailyPost } from '@/types/scheduler';
import { publishToFacebook } from './facebook';
import { publishReel } from './reels';

export function publishDailyPost(post: DailyPost) {
  return post.kind === 'reel'
    ? publishReel(post.message, post.videoUrl || '', post.link || undefined)
    : publishToFacebook(post.message, post.link || undefined, post.imageUrl || undefined);
}
