import type { MiddlewareHandler } from 'astro';
import { randomBytes } from 'crypto';
import { generateCSP } from '../utils/security';

export const onRequest: MiddlewareHandler = async ({ request, locals }, next) => {
  const nonce = randomBytes(16).toString('base64');
  // Store nonce for use in pages/components
  locals.cspNonce = nonce;
  const cspHeader = generateCSP(nonce);
  const response = await next();
  // Overwrite existing CSP header with nonce-based one
  response.headers.set('Content-Security-Policy', cspHeader);
  // Optionally add a report-uri for violations
  response.headers.set('Report-To', '{"group":"csp","max_age":10886400,"endpoints":[{"url":"/csp-report"}],"include_subdomains":true}');
  return response;
};
