/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

import { Route as rootRouteImport } from './routes/__root'
import { Route as SitemapDotxmlRouteImport } from './routes/sitemap[.]xml'
import { Route as RobotsDottxtRouteImport } from './routes/robots[.]txt'
import { Route as FeedDotxmlRouteImport } from './routes/feed[.]xml'
import { Route as PagesRouteImport } from './routes/pages'
import { Route as IndexRouteImport } from './routes/index'
import { Route as PagesSlugRouteImport } from './routes/pages.$slug'
import { Route as BlogSlugRouteImport } from './routes/blog.$slug'

const SitemapDotxmlRoute = SitemapDotxmlRouteImport.update({
  id: '/sitemap.xml',
  path: '/sitemap.xml',
  getParentRoute: () => rootRouteImport,
} as any)
const RobotsDottxtRoute = RobotsDottxtRouteImport.update({
  id: '/robots.txt',
  path: '/robots.txt',
  getParentRoute: () => rootRouteImport,
} as any)
const FeedDotxmlRoute = FeedDotxmlRouteImport.update({
  id: '/feed.xml',
  path: '/feed.xml',
  getParentRoute: () => rootRouteImport,
} as any)
const PagesRoute = PagesRouteImport.update({
  id: '/pages',
  path: '/pages',
  getParentRoute: () => rootRouteImport,
} as any)
const IndexRoute = IndexRouteImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRouteImport,
} as any)
const PagesSlugRoute = PagesSlugRouteImport.update({
  id: '/pages/$slug',
  path: '/pages/$slug',
  getParentRoute: () => rootRouteImport,
} as any)
const BlogSlugRoute = BlogSlugRouteImport.update({
  id: '/blog/$slug',
  path: '/blog/$slug',
  getParentRoute: () => rootRouteImport,
} as any)

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/pages': typeof PagesRoute
  '/feed.xml': typeof FeedDotxmlRoute
  '/robots.txt': typeof RobotsDottxtRoute
  '/sitemap.xml': typeof SitemapDotxmlRoute
  '/blog/$slug': typeof BlogSlugRoute
  '/pages/$slug': typeof PagesSlugRoute
}
export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/pages': typeof PagesRoute
  '/feed.xml': typeof FeedDotxmlRoute
  '/robots.txt': typeof RobotsDottxtRoute
  '/sitemap.xml': typeof SitemapDotxmlRoute
  '/blog/$slug': typeof BlogSlugRoute
  '/pages/$slug': typeof PagesSlugRoute
}
export interface FileRoutesById {
  __root__: typeof rootRouteImport
  '/': typeof IndexRoute
  '/pages': typeof PagesRoute
  '/feed.xml': typeof FeedDotxmlRoute
  '/robots.txt': typeof RobotsDottxtRoute
  '/sitemap.xml': typeof SitemapDotxmlRoute
  '/blog/$slug': typeof BlogSlugRoute
  '/pages/$slug': typeof PagesSlugRoute
}
export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths: '/' | '/pages' | '/feed.xml' | '/robots.txt' | '/sitemap.xml' | '/blog/$slug' | '/pages/$slug'
  fileRoutesByTo: FileRoutesByTo
  to: '/' | '/pages' | '/feed.xml' | '/robots.txt' | '/sitemap.xml' | '/blog/$slug' | '/pages/$slug'
  id:
    | '__root__'
    | '/'
    | '/pages'
    | '/feed.xml'
    | '/robots.txt'
    | '/sitemap.xml'
    | '/blog/$slug'
    | '/pages/$slug'
  fileRoutesById: FileRoutesById
}
export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  PagesRoute: typeof PagesRoute
  FeedDotxmlRoute: typeof FeedDotxmlRoute
  RobotsDottxtRoute: typeof RobotsDottxtRoute
  SitemapDotxmlRoute: typeof SitemapDotxmlRoute
  BlogSlugRoute: typeof BlogSlugRoute
  PagesSlugRoute: typeof PagesSlugRoute
}

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/sitemap.xml': {
      id: '/sitemap.xml'
      path: '/sitemap.xml'
      fullPath: '/sitemap.xml'
      preLoaderRoute: typeof SitemapDotxmlRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/robots.txt': {
      id: '/robots.txt'
      path: '/robots.txt'
      fullPath: '/robots.txt'
      preLoaderRoute: typeof RobotsDottxtRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/feed.xml': {
      id: '/feed.xml'
      path: '/feed.xml'
      fullPath: '/feed.xml'
      preLoaderRoute: typeof FeedDotxmlRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/pages': {
      id: '/pages'
      path: '/pages'
      fullPath: '/pages'
      preLoaderRoute: typeof PagesRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/pages/$slug': {
      id: '/pages/$slug'
      path: '/pages/$slug'
      fullPath: '/pages/$slug'
      preLoaderRoute: typeof PagesSlugRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/blog/$slug': {
      id: '/blog/$slug'
      path: '/blog/$slug'
      fullPath: '/blog/$slug'
      preLoaderRoute: typeof BlogSlugRouteImport
      parentRoute: typeof rootRouteImport
    }
  }
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  PagesRoute: PagesRoute,
  FeedDotxmlRoute: FeedDotxmlRoute,
  RobotsDottxtRoute: RobotsDottxtRoute,
  SitemapDotxmlRoute: SitemapDotxmlRoute,
  BlogSlugRoute: BlogSlugRoute,
  PagesSlugRoute: PagesSlugRoute,
}
export const routeTree = rootRouteImport
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

import type { getRouter } from './router.tsx'
import type { startInstance } from './start.ts'
declare module '@tanstack/react-start' {
  interface Register {
    ssr: true
    router: Awaited<ReturnType<typeof getRouter>>
    config: Awaited<ReturnType<typeof startInstance.getOptions>>
  }
}
