/** Builds public-asset URLs that also work from a GitHub Pages project subpath. */
export function assetUrl(path: string) {
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`;
}
