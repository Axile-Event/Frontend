// Utility for handling cookies across Axile subdomains
export function getCookie(name) {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

export function setCookie(name, value, maxAgeDays = 7) {
  if (typeof document === 'undefined') return;
  const isProd = typeof window !== 'undefined' && 
                 (window.location.hostname.endsWith('.axile.ng') || window.location.hostname === 'axile.ng');
  const domain = isProd ? '; domain=.axile.ng' : '';
  const secure = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; secure' : '';
  const maxAge = maxAgeDays * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; samesite=lax${domain}${secure}`;
}
