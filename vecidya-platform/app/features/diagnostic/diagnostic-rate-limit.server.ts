export type RateLimitBinding = {
  limit(options: { readonly key: string }): Promise<{ readonly success: boolean }>;
};

export function trustedClientAddress(request: Request): string | null {
  const value = request.headers.get("cf-connecting-ip")?.trim();
  return value && value.length <= 64 ? value : null;
}

/** Cloudflare owns this short-window counter; source addresses are never written to D1 or logs. */
export async function allowRateLimitedRequest(
  limiter: RateLimitBinding,
  request: Request,
  bucket: string,
  additionalKeys: readonly string[] = [],
): Promise<boolean> {
  const address = trustedClientAddress(request);
  if (!address) return false;
  return allowRateLimitedKeys(limiter, [`${bucket}:ip:${address}`, ...additionalKeys.map((key) => `${bucket}:${key}`)]);
}

export async function allowRateLimitedActor(limiter: RateLimitBinding, bucket: string, actorKey: string): Promise<boolean> {
  return allowRateLimitedKeys(limiter, [`${bucket}:${actorKey}`]);
}

async function allowRateLimitedKeys(limiter: RateLimitBinding, keys: readonly string[]): Promise<boolean> {
  try {
    for (const key of keys) {
      const result = await limiter.limit({ key });
      if (!result.success) return false;
    }
    return true;
  } catch {
    return false;
  }
}
