import { RouteConfig } from 'vue-router'

export enum ROUTE_NAMES {
  DOCS = 'Docs',
}

const routes: RouteConfig[] = [
  {
    path: '/',
    component: () => import('layouts/LandingPageLayout.vue'),
    children: [{ path: '', component: () => import('pages/LandingPage.vue') }],
  },
  {
    path: '/docs',
    component: () => import('layouts/DocsLayout.vue'),
    children: [
      {
        path: '',
        name: ROUTE_NAMES.DOCS,
        component: () => import('pages/DocsPage.vue'),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '*',
    component: () => import('pages/Error404.vue'),
  },
]

export default routes
