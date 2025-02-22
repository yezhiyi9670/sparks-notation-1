// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

const title = 'Sparks NMN'
const desc = '用文本格式高效地编写简谱'
const domain = 'notation.sparkslab.art'
const site = 'https://' + domain + '/'

const ghProfile = 'https://github.com/yezhiyi9670'
const ghRepo = 'https://github.com/yezhiyi9670/sparks-notation-1'
const ghIssue = ghRepo + '/issues'
const siteDemo = site + 'playground/'
const siteDonate = site + 'donate/'
const siteSparksLab = 'https://sparkslab.art/'

async function createConfigAsync() {
  /** @type {import('@docusaurus/types').Config} */
  const config = {
    title: title,
    tagline: desc,
    favicon: 'logo.ico',
  
    // Set the production url of your site here
    url: site,
    // Set the /<baseUrl>/ pathname under which your site is served
    // For GitHub pages deployment, it is often '/<projectName>/'
    baseUrl: '/',
  
    // GitHub pages deployment config.
    // If you aren't using GitHub pages, you don't need these.
    organizationName: 'yezhiyi9670', // Usually your GitHub org/user name.
    projectName: 'sparks-nmn-website', // Usually your repo name.
  
    onBrokenLinks: 'throw',
    onBrokenMarkdownLinks: 'warn',
  
    // Even if you don't use internalization, you can use this field to set useful
    // metadata like html lang. For example, if your site is Chinese, you may want
    // to replace "en" with "zh-Hans".
    i18n: {
      defaultLocale: 'zh-Hans',
      locales: ['zh-Hans'],
    },
  
    scripts: [
      // umami TRACKING SCRIPT
      {
        src: 'https://analytics.sparkslab.art/script.js',
        async: true,
        'data-website-id': '1070a9aa-0b89-4e2c-9ad2-1022aa1d6c65',
        'data-domains': domain
      },
      {
        src: '/script/track-proxy.js',
      }
    ],
    headTags: [],
  
    presets: [
      [
        'classic',
        /** @type {import('@docusaurus/preset-classic').Options} */
        ({
          docs: {
            sidebarPath: require.resolve('./sidebars.js'),
            remarkPlugins: [(await import('remark-math')).default, (await import('remark-cjk-friendly')).default],
            rehypePlugins: [(await import('rehype-katex')).default],
          },
          blog: {
            showReadingTime: true,
          },
          pages: {
            remarkPlugins: [(await import('remark-math')).default, (await import('remark-cjk-friendly')).default],
            rehypePlugins: [(await import('rehype-katex')).default],
          },
          theme: {
            customCss: require.resolve('./src/css/custom.css'),
          },
        }),
      ],
    ],
  
    themes: [
      [
        require.resolve('@easyops-cn/docusaurus-search-local'),
        // /** @type {import("@easyops-cn/docusaurus-search-local").PluginOptions} */
        ({
          // ... Your options.
          // `hashed` is recommended as long-term-cache of index file is possible.
          hashed: true,
  
          // For Docs using Chinese, it is recomended to set:
          language: ["en", "zh"],

          explicitSearchResultPath: true
        })
      ]
    ],
  
    themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      metadata: [{name: 'keywords', content: '音乐, 简谱, 制作, 脚本, 文本语言'}],
      colorMode: { defaultMode: 'light', disableSwitch: true },
      navbar: {
        logo: {
          src: '/logo.png'
        },
        title: title,
        items: [
          {
            to: '/examples',
            position: 'left',
            label: '示例乐谱',
          },
          {
            type: 'doc',
            docId: 'intro',
            position: 'left',
            label: '指南',
          },
          {
            to: '/desktop-download',
            label: '下载',
            position: 'left',
          },
          // {to: '/blog', label: '博客', position: 'left'},
          {
            to: '/changelogs',
            label: '更新日志',
            position: 'left'
          },
          {
            label: '试用',
            href: siteDemo,
            position: 'left',
          },
          {
            label: '捐赠',
            href: siteDonate,
            position: 'left',
          },
          {
            href: ghRepo,
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'light',
        links: [
          {
            title: 'Sparks NMN',
            items: [
              {
                label: '指南',
                to: '/docs/intro',
              },
              // {
              //   label: '博客',
              //   to: '/blog',
              // },
              {
                label: '桌面版下载',
                to: '/desktop-download',
              },
              {
                label: '更新日志',
                to: '/changelogs',
              },
              {
                label: '在线试玩',
                href: siteDemo,
              },
            ],
          },
          {
            title: 'GitHub',
            items: [
              {
                label: 'GitHub',
                href: ghRepo,
              },
              {
                label: '反馈问题',
                href: ghIssue
              }
            ],
          },
          {
            title: 'Author',
            items: [
              {
                label: 'Sparks Lab',
                href: siteSparksLab
              },
              {
                label: 'yezhiyi9670',
                href: ghProfile
              },
              {
                label: '爱发电捐赠',
                href: siteDonate,
              },
            ],
          },
        ],
        copyright: `Contact: yezhiyi9670 at sparkslab dot art<br />Copyright © ${new Date().getFullYear()} yezhiyi9670. Built with Docusaurus.`,
      },
      docs: {
        sidebar: {
          autoCollapseCategories: true,
        },
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
        magicComments: [
          // Remember to extend the default highlight class name as well!
          {
            className: 'theme-code-block-highlighted-line',
            line: 'highlight-next-line',
            block: {start: 'highlight-start', end: 'highlight-end'},
          },
          {
            className: 'code-block-strip',
            line: 'strip-next-line',
            block: {start: 'strip-start', end: 'strip-end'}
          },
          {
            className: 'code-block-preserve',
            line: 'preserve-next-line',
            block: {start: 'preserve-start', end: 'preserve-end'}
          }
        ],
      },
    }),
    stylesheets: [
      {
        href: '/katex/katex.min.css',
        type: 'text/css',
        crossorigin: 'anonymous',
      },
    ],
  };
  return config;
}

module.exports = createConfigAsync;
