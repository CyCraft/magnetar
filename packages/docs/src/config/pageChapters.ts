import { ROUTE_NAMES } from '../router/routes'

export const routeNamePageChaptersMap: { [key in ROUTE_NAMES]: string[] } = {
  [ROUTE_NAMES.DOCS]: [
    'About.md',
    'Setup.md',
    'Write.md',
    'Read.md',
    'Module Setup.md',
    'Hooks and Events.md',
    'Plugins.md',
    'FAQ.md',
  ],
}
