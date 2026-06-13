import type { MiddlewareHandler } from 'astro';
import { randomBytes } from 'crypto';

export const onRequest: MiddlewareHandler = async ({ locals }, next) => {
  const nonce = randomBytes(16).toString('base64');
  // Store nonce for use in pages/components
  locals.cspNonce = nonce;
  const response = await next();
  return response;
};
