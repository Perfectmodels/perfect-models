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
  useState,
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
  try { sessionStorage.setItem(`${STATE_PREFIX}${href}`, JSON.stringify(state)); } catch { /* no-op */ }
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
  const [state] = useState(() => readState(href));
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
    const value = next instanceof URLSearchParams ? next : new URLSearchParams(typeof next === 'string' ? next : next);
    const href = `${pathname}${value.toString() ? `?${value.toString()}` : ''}`;
    if (options?.replace) router.replace(href);
    else router.push(href);
  }, [pathname, router]);
  return [params, setParams];
}

interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'className' | 'style'> {
  to: To;
  replace?: boolean;
  state?: unknown;
  className?: string | ((args: { isActive: boolean }) => string);
  style?: CSSProperties | ((args: { isActive: boolean }) => CSSProperties);
  children?: ReactNode | ((args: { isActive: boolean }) => ReactNode);
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { to, replace, state, onClick, children, className, style, ...props },
  ref,
) {
  const router = useRouter();
  const pathname = usePathname() || '/';
  const href = toHref(to);
  const active = pathname === href || (href !== '/' && pathname.startsWith(`${href}/`));
  const resolvedClass = typeof className === 'function' ? className({ isActive: active }) : className;
  const resolvedStyle = typeof style === 'function' ? style({ isActive: active }) : style;
  const content = typeof children === 'function' ? children({ isActive: active }) : children;

  return (
    <NextLink
      {...props}
      ref={ref}
      href={href}
      className={resolvedClass}
      style={resolvedStyle}
      onClick={(event) => {
        storeState(href, state);
        onClick?.(event);
        if (replace && !event.defaultPrevented) {
          event.preventDefault();
          router.replace(href);
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
  React.useEffect(() => navigate(to, { replace, state }), [navigate, to, replace, state]);
  return null;
}

export function BrowserRouter({ children }: { children: ReactNode }) { return <>{children}</>; }
export function Routes({ children }: { children: ReactNode }) { return <>{children}</>; }
export function Route({ element }: { element?: ReactElement }) { return element ?? null; }
export function Outlet() { return null; }

export function useHref(to: To) { return toHref(to); }
export function useResolvedPath(to: To) {
  const href = toHref(to);
  const [pathname, rest = ''] = href.split('?');
  const [search = '', hash = ''] = rest.split('#');
  return { pathname: pathname || '/', search: search ? `?${search}` : '', hash: hash ? `#${hash}` : '' };
}

export function createSearchParams(init?: string | Record<string, string> | URLSearchParams) {
  return new URLSearchParams(init instanceof URLSearchParams ? init.toString() : init);
}

export function generatePath(pattern: string, params: Record<string, string | number | undefined> = {}) {
  return Object.entries(params).reduce((path, [key, value]) => path.replace(`:${key}`, encodeURIComponent(String(value ?? ''))), pattern);
}

export function matchPath(pattern: string | { path: string; end?: boolean }, pathname: string) {
  const config = typeof pattern === 'string' ? { path: pattern, end: true } : pattern;
  const escaped = config.path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\\:([A-Za-z0-9_]+)/g, '[^/]+');
  const regex = new RegExp(`^${escaped}${config.end === false ? '' : '$'}`);
  return regex.test(pathname) ? { params: {}, pathname, pathnameBase: pathname, pattern: config } : null;
}

export function useMatch(pattern: string | { path: string; end?: boolean }) {
  const pathname = usePathname() || '/';
  return matchPath(pattern, pathname);
}

export { Fragment };
