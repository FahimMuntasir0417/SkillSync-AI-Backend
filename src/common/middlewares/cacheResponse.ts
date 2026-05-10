import type { RequestHandler } from "express";

type CacheEntry = {
  body: unknown;
  expiresAt: number;
  statusCode: number;
};

const responseCache = new Map<string, CacheEntry>();

const buildCacheKey = (baseUrl: string, originalUrl: string) =>
  `${baseUrl}:${originalUrl}`;

export const cacheResponse = (ttlSeconds = 60): RequestHandler => {
  return (req, res, next) => {
    if (req.method !== "GET" || req.headers.authorization || req.headers.cookie) {
      next();
      return;
    }

    const cacheKey = buildCacheKey(req.baseUrl, req.originalUrl);
    const cached = responseCache.get(cacheKey);
    const now = Date.now();

    if (cached && cached.expiresAt > now) {
      res.setHeader("X-Cache", "HIT");
      res.status(cached.statusCode).json(cached.body);
      return;
    }

    if (cached) {
      responseCache.delete(cacheKey);
    }

    const originalJson = res.json.bind(res);

    res.json = (body: unknown) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        responseCache.set(cacheKey, {
          body,
          expiresAt: now + ttlSeconds * 1000,
          statusCode: res.statusCode,
        });
        res.setHeader("X-Cache", "MISS");
      }

      return originalJson(body);
    };

    next();
  };
};
