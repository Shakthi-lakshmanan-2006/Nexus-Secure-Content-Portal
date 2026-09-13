import type { Request, Response } from 'express';
import app from '../server/app.js';

export default function handler(req: Request, res: Response) {
  // If Vercel rewrites /api/foo to /foo when invoking the function, re-add /api prefix
  if (req.url && !req.url.startsWith('/api')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }
  return app(req, res);
}
