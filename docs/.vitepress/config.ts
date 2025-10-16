import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'en-US',
  title: 'Magnetar',
  head: [['link', { rel: 'icon', type: 'image/svg+xml', href: '/icons/magnetar-icon.svg' }]],
  lastUpdated: true,
  themeConfig: {
    search: {
      provider: 'local',
    },
    logo: {
      light: '/media/magnetar-logo-dark.svg',
      dark: '/media/magnetar-logo-white.svg',
    },
    siteTitle: 'Magnetar Docs',
    socialLinks: [{ icon: 'github', link: 'https://github.com/cycraft/magnetar' }],
    sidebar: [
      {
        text: '',
        items: [
          {
            text: 'About',
            link: '/docs-main/about/',
          },
          {
            text: 'Concepts',
            link: '/docs-main/concepts/',
          },
          {
            text: 'Setup',
            link: '/docs-main/setup/',
          },
          {
            text: 'Write Data',
            link: '/docs-main/write-data/',
          },
          {
            text: 'Read Data',
            link: '/docs-main/read-data/',
          },
          {
            text: 'Module Setup',
            link: '/docs-main/module-setup/',
          },
          {
            text: 'Hooks and Events',
            link: '/docs-main/hooks-and-events/',
          },
          {
            text: 'Plugins',
            link: '/docs-main/plugins/',
          },
          {
            text: 'Frequently Asked Questions',
            link: '/docs-main/faq/',
          },
        ],
      },
    ],
    footer: {
      message: 'Made with 💜 by <a href="https://github.com/mesqueeb">Luca Ban - mesqueeb</a>',
    },
  },
})
