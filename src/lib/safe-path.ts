// Allows same-site paths only, so a stored redirect can never leave the site.
export function isSafePath(href: string) {
  return /^\/(?![/\\])/.test(href);
}
