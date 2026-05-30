export function generateIdempotencyKey(): string {
  return 'idemp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
}
