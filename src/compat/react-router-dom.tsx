'use client';

import NextLink from 'next/link';
import {
  useParams as useNextParams,
  usePathname,
  useRouter,
  useSearchParams as useNextSearchParams,
} from 'next/navigation';
import React, {
  Fragment,
  forwardRef,
  useCallback,
  useMemo,
  type AnchorHTMLAttributes,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react';

export type To = string | { pathname?: string; search?: string; hash?: string };
export interface NavigateOptions { replace?: boolean; state?: unknown; }

const STATE_PREFIX = '__pmm_router_state__:';

function toHref(to: To): string {
  if (typeof to === 'string') return to;
  return `${to.pathname || ''}${to.search || ''}${to.hash || ''}` || '/';
}

function storeState(href: string, state: unknown) {
  if (typeof window === 'undefined' || state === undefined) return;
  try { sessionStorage.setItem(`${STATE_PREFIX}${href}`, JSON.stringify(state)); } catch { /* Storage may be unavailable in private mode. */ }
}

function readState(href: string) {
  if (typeof window === 'undefined') return null;
  try {
    const value = sessionStorage.getItem(`${STATE_PREFIX}${href}`);
    return value ? JSON.parse(value) : null;
  } catch { return null; }
}

export function useNavigate() {
  const router = useRouter();
  return useCallback((to: To | number, options: NavigateOptions = {}) => {
    if (typeof to === 'number') {
      if (to < 0) router.back();
      else if (to > 0) router.forward();
      return;
    }
    const href = toHref(to);
    storeState(href, options.state);
    if (options.replace) router.replace(href);
    else router.push(href);
  }, [router]);
}

export function useLocation() {
  const pathname = usePathname() || '/';
  const params = useNextSearchParams();
  const search = params?.toString() ? `?${params.toString()}` : '';
  const href = `${pathname}${search}`;
  const state = useMemo(() => readState(href), [href]);
  const hash = typeof window !== 'undefined' ? window.location.hash : '';
  return { pathname, search, hash, state, key: pathname };
}

export function useParams<T extends Record<string, string | undefined> = Record<string, string>>() {
  return useNextParams() as T;
}

export function useSearchParams(): [URLSearchParams, (next: URLSearchParams | Record<string, string> | string, options?: { replace?: boolean }) => void] {
  const current = useNextSearchParams();
  const pathname = usePathname() || '/';
  const router = useRouter();
  const params = useMemo(() => new URLSearchParams(current?.toString() || ''), [current]);
  const setParams = useCallback((next: URLSearchParams | Record<string, string> | string, options?: { replace?: boolean }) => {
    const value = next instanceof URLSearchParams ? next : new URLSearchParams(next);
    const href = `${pathname}${value.toString() ? `?${value.toString()}` : ''}`;
    if (options?.replace) router.replace(href);
    else router.push(href);
  }, [pathname, router]);
  return [params, setParams];
}

interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'className' | 'style' | 'children'> {
  to: To;
  replace?: boolean;
  state?: unknown;
  preventScrollReset?: boolean;
  relative?: 'route' | 'path';
  reloadDocument?: boolean;
  viewTransition?: boolean;
  end?: boolean;
  caseSensitive?: boolean;
  className?: string | ((args: { isActive: boolean; isPending: boolean; isTransitioning: boolean }) => string);
  style?: CSSProperties | ((args: { isActive: boolean; isPending: boolean; isTransitioning: boolean }) => CSSProperties);
  children?: ReactNode | ((args: { isActive: boolean; isPending: boolean; isTransitioning: boolean }) => ReactNode);
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { to, replace, state, preventScrollReset, reloadDocument, end, caseSensitive, onClick, children, className, style, relative: _relative, viewTransition: _viewTransition, ...props },
  ref,
) {
  const router = useRouter();
  const currentPathname = usePathname() || '/';
  const href = toHref(to);
  const targetPath = href.split(/[?#]/)[0] || '/';
  const pathname = caseSensitive ? currentPathname : currentPathname.toLowerCase();
  const target = caseSensitive ? targetPath : targetPath.toLowerCase();
  const active = end ? pathname === target : pathname === target || (target !== '/' && pathname.startsWith(`${target}/`));
  const navState = { isActive: active, isPending: false, isTransitioning: false };
  const resolvedClass = typeof className === 'function' ? className(navState) : className;
  const resolvedStyle = typeof style === 'function' ? style(navState) : style;
  const content = typeof children === 'function' ? children(navState) : children;

  if (reloadDocument) {
    return <a {...props} ref={ref} href={href} className={resolvedClass} style={resolvedStyle} onClick={onClick}>{content}</a>;
  }

  return (
    <NextLink
      {...props}
      ref={ref}
      href={href}
      scroll={!preventScrollReset}
      className={resolvedClass}
      style={resolvedStyle}
      onClick={(event) => {
        storeState(href, state);
        onClick?.(event);
        if (replace && !event.defaultPrevented) {
          event.preventDefault();
          router.replace(href, { scroll: !preventScrollReset });
        }
      }}
    >
      {content}
    </NextLink>
  );
});

export const NavLink = Link;

export function Navigate({ to, replace = false, state }: { to: To; replace?: boolean; state?: unknown }) {
  const navigate = useNavigate();
  const href = toHref(to);
  React.useEffect(() => navigate(href, { replace, state }), [navigate, href, replace, state]);
  return null;
}

export function BrowserRouter({ children }: { children: ReactNode }) { return <>{children}</>; }
export function Routes({ children }: { children: ReactNode }) { return <>{children}</>; }
export function Route({ element }: { element?: ReactElement }) { return element ?? null; }
export function Outlet() { return null; }
export function useOutletContext<T = unknown>() { return undefined as T; }
export function useNavigationType() { return 'PUSH' as const; }

export function useHref(to: To) { return toHref(to); }
export function useResolvedPath(to: To) {
  const href = toHref(to);
  const url = new URL(href, 'https://perfectmodels.online');
  return { pathname: url.pathname, search: url.search, hash: url.hash };
}

export function createSearchParams(init?: string | Record<string, string> | URLSearchParams) {
  return new URLSearchParams(init instanceof URLSearchParams ? init.toString() : init);
}

export function generatePath(pattern: string, params: Record<string, string | number | undefined> = {}) {
  return Object.entries(params).reduce((path, [key, value]) => path.replace(`:${key}`, encodeURIComponent(String(value ?? ''))), pattern);
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function matchPath(pattern: string | { path: string; end?: boolean; caseSensitive?: boolean }, pathname: string) {
  const config = typeof pattern === 'string' ? { path: pattern, end: true, caseSensitive: false } : pattern;
  const names: string[] = [];
  const body = config.path.split('/').map((segment) => {
    if (segment === '*') { names.push('*'); return '(.*)'; }
    if (segment.startsWith(':')) { names.push(segment.slice(1)); return '([^/]+)'; }
    return escapeRegex(segment);
  }).join('/');
  const regex = new RegExp(`^${body}${config.end === false ? '(?:/|$)' : '/?$'}`, config.caseSensitive ? '' : 'i');
  const result = pathname.match(regex);
  if (!result) return null;
  const params = Object.fromEntries(names.map((name, index) => [name, decodeURIComponent(result[index + 1] || '')]));
  return { params, pathname: result[0], pathnameBase: result[0].replace(/\/$/, '') || '/', pattern: config };
}

export function useMatch(pattern: string | { path: string; end?: boolean; caseSensitive?: boolean }) {
  const pathname = usePathname() || '/';
  return matchPath(pattern, pathname);
}

export { Fragment };
