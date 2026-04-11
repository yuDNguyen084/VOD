import { redis } from '../../redis';
export const cache = (ttl: number) => async (req: any, res: any, next: any) => {
  if (req.method !== 'GET') return next();
  const key = `cache:${req.originalUrl}`;
  const data = await redis.get(key);
  if (data) return res.json(JSON.parse(data));
  const oldJson = res.json.bind(res);
  res.json = (body:any) => { redis.setex(key, ttl, JSON.stringify(body)); return oldJson(body); };
  next();
};