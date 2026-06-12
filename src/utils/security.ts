export function generateCSP(nonce: string): string {
  // Base CSP directives (same as in _headers but without script-src inline)
  const directives = [
    "default-src 'self'",
    "img-src 'self' data: https:" ,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "media-src 'self' https://cdn.jsdelivr.net https://music.163.com",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    // Allow scripts only from self with nonce
    `script-src 'self' 'nonce-${nonce}'`,
    // Optionally enable report-uri (can be added separately)
  ];
  return directives.join('; ');
}
