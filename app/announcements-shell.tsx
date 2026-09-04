"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import MarketBoard from "./market-board";
import { bindNavigationHover } from "./navigation-hover";

type View = "announcements" | "markets" | "top200";

// Keep the original mirror responsible for its frame, navigation, animation,
// sidebar, typography and scrolling. Mount only the new page content into it.
export default function AnnouncementsShell() {
  const pathname = usePathname();
  const router = useRouter();
  const view: View = pathname === '/top200' ? 'top200' : pathname === '/announcements' ? 'announcements' : 'markets';
  const frame = useRef<HTMLIFrameElement>(null);
  const [host, setHost] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const iframe = frame.current;
    if (!iframe) return;
    let observer: MutationObserver | undefined;
    let attachedDocument: Document | undefined;
    let revealing = false;
    let disposed = false;
    let cleanupHover: (() => void) | undefined;
    let cleanupNavigation: (() => void) | undefined;
    router.prefetch('/');
    router.prefetch('/top200');
    const revealWhenReady = () => {
      const doc = iframe.contentDocument;
      if (!doc || doc !== attachedDocument || revealing || iframe.dataset.ready === 'true') return;
      const stylesheet = doc.querySelector<HTMLLinkElement>('#float-page-styles');
      const brand = doc.querySelector('.Header_header__logo__SW90s .float-brand');
      const contentReady = view === 'announcements' || doc.querySelector('#float-market-content .float-content');
      if (!stylesheet?.sheet || !brand || !contentReady) return;
      revealing = true;
      const logos = Array.from(doc.querySelectorAll<HTMLImageElement>('.float-brand-logo'));
      Promise.allSettled([
        doc.fonts.load('700 28px FloatNeueBit'),
        ...logos.map(logo => logo.decode()),
      ]).then(() => {
        // Wait for the portal, font and logo to paint before exposing the frame.
        iframe.contentWindow?.requestAnimationFrame(() => {
          if (disposed || iframe.contentDocument !== doc) return;
          iframe.dataset.ready = 'true';
          iframe.removeAttribute('aria-hidden');
          iframe.closest('main')?.setAttribute('aria-busy', 'false');
        });
      });
    };
    const attach = () => {
      const doc = iframe.contentDocument;
      if (!doc || !doc.querySelector(".Header_header__navigation__K_Gty")) return;
      // The mirror fades its title in after hydration. Wait for that signal
      // before adding nodes, so its React tree can hydrate without mismatches.
      const originalTitle = doc.querySelector(".section--announcements h1");
      if (!originalTitle || Number(iframe.contentWindow?.getComputedStyle(originalTitle).opacity ?? 0) === 0) return;
      attachedDocument = doc;
      cleanupNavigation?.();
      const navigate = (event: MouseEvent) => {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a');
        if (!link || link.hasAttribute('download')) return;
        const url = new URL(link.href, doc.baseURI);
        if (url.origin !== window.location.origin || !['/', '/markets', '/market', '/top200', '/announcements'].includes(url.pathname)) return;
        event.preventDefault();
        event.stopPropagation();
        const destination = ['/market', '/markets'].includes(url.pathname) ? '/' : url.pathname;
        router.push(destination, { scroll: false });
      };
      doc.addEventListener('click', navigate, true);
      cleanupNavigation = () => doc.removeEventListener('click', navigate, true);
      const scroller = doc.getElementById('main-content');
      if (scroller) scroller.scrollTop = 0;
      cleanupHover?.();
      cleanupHover = bindNavigationHover(doc);
      observer?.disconnect();
      const sync = () => {
        if (!doc.querySelector('#float-page-styles')) {
          const css = doc.createElement('link');
          css.id = 'float-page-styles';
          css.rel = 'stylesheet';
          css.href = '/announcements-markets.css';
          doc.head.append(css);
        }
        const pageTitle = `${view === 'top200' ? 'Top 200' : view === 'markets' ? 'Markets' : 'Announcements'} | Float`;
        if (doc.title !== pageTitle) doc.title = pageTitle;
        doc.querySelectorAll<HTMLAnchorElement>('.Header_header__logo__SW90s a, .Footer_footer__logo__Y6Djb a').forEach(link => {
          if (link.dataset.floatBrand) return;
          link.dataset.floatBrand = 'true';
          link.classList.add('float-brand');
          link.href = '/';
          link.target = '_top';
          link.setAttribute('aria-label', 'Float home');
          const wordmark = doc.createElement('span');
          wordmark.className = 'float-wordmark';
          wordmark.setAttribute('aria-label', 'Float');
          for (const character of 'Float') {
            const glyph = doc.createElement('span');
            glyph.className = 'float-wordmark-glyph';
            glyph.setAttribute('aria-hidden', 'true');
            glyph.textContent = character;
            wordmark.append(glyph);
          }
          const logo = doc.createElement('img');
          logo.src = '/sailboat-black-300.png';
          logo.alt = '';
          logo.width = 36;
          logo.height = 36;
          logo.className = 'float-brand-logo';
          const iconBox = doc.createElement('span');
          iconBox.className = 'float-brand-icon';
          iconBox.append(logo);
          link.replaceChildren(iconBox, wordmark);
        });
        const copyright = doc.querySelector('.Footer_footer__copyright__mQ8W6');
        const copyrightText = '© 2026 Float. All rights reserved.';
        if (copyright && copyright.textContent !== copyrightText) copyright.textContent = copyrightText;
        // Hide unused links in both the desktop header and its mobile menu.
        doc.querySelectorAll<HTMLAnchorElement>('.Header_header__pLWYI a').forEach(link => {
          const href = link.getAttribute('href') ?? '';
          if (href.includes('#products') || href.includes('blog.dottxt.ai') || href.includes('announcements')) {
            const item = link.closest<HTMLElement>('.Header_header__button__0V17s, [role="menuitem"]') ?? link;
            item.hidden = true;
            item.style.display = 'none';
          }
        });
        const nav = doc.querySelector('.Header_header__navigation__K_Gty');
        if (nav && !nav.querySelector('[data-float-navigation]')) {
          const additions = doc.createElement('div');
          additions.dataset.floatNavigation = 'true';
          additions.className = 'float-navigation';
          for (const [label, path, key, color] of [['Markets', '/', 'M', '#BD932F'], ['Top 200', '/top200', '2', '#A6B4A3']]) {
            const link = doc.createElement('a');
            link.href = path;
            link.target = '_top';
            link.className = 'btn btn--secondary';
            if ((view === 'markets' && path === '/') || view === path.slice(1)) link.setAttribute('aria-current', 'page');
            const badge = doc.createElement('span');
            badge.className = 'key mr-3';
            badge.style.backgroundColor = color;
            badge.style.color = 'black';
            badge.textContent = key;
            const text = doc.createElement('span');
            text.className = 'label hover-effect hover-effect--cursor-square';
            link.setAttribute('aria-label', label);
            text.setAttribute('aria-hidden', 'true');
            for (const character of label) {
              const glyph = doc.createElement('span');
              glyph.dataset.character = character;
              glyph.textContent = character;
              text.append(glyph);
            }
            link.append(badge, text);
            additions.append(link);
          }
          nav.prepend(additions);
          // The existing desktop navigation is hidden on mobile. Put the same
          // two links beside its original Menu control, using the same styling.
          const mobile = doc.querySelector('.Header_header__mobileMenu__qnaKh');
          if (mobile && !mobile.querySelector('[data-float-navigation]')) mobile.prepend(additions.cloneNode(true));
        }
        doc.querySelectorAll<HTMLAnchorElement>('a[href="announcements.html"]').forEach(link => {
          link.href = '/announcements';
          link.target = '_top';
        });
        doc.querySelectorAll<HTMLAnchorElement>('[data-float-navigation] a').forEach(link => {
          const active = (view === 'markets' && link.pathname === '/') || (view === 'top200' && link.pathname === '/top200');
          if (active) link.setAttribute('aria-current', 'page');
          else link.removeAttribute('aria-current');
        });
        if (view === 'announcements') {
          const section = doc.querySelector('.section--announcements');
          section?.classList.remove('float-market-page');
          const title = section?.querySelector('h1');
          if (title && title.textContent !== 'Announcements') title.textContent = 'Announcements';
          return;
        }
        const section = doc.querySelector('.section--announcements');
        const container = section?.querySelector('.AnnouncementsList_announcementsList__container__V7Z59');
        if (!section || !container) return;
        section.classList.add('float-market-page');
        const title = section.querySelector('h1');
        const label = view === 'markets' ? 'Markets' : 'Top 200';
        if (title && title.textContent !== label) title.textContent = label;
        let mount = doc.getElementById('float-market-content');
        if (!mount) {
          mount = doc.createElement('div');
          mount.id = 'float-market-content';
          mount.className = 'AnnouncementsList_announcementsList__listWrapper__aigtX';
          container.prepend(mount);
          setHost(mount);
        }
      };
      sync();
      observer = new MutationObserver(sync);
      observer.observe(doc.documentElement, { childList: true, subtree: true });
    };
    iframe.addEventListener('load', attach);
    attach();
    // Remote images in the original mirror can delay the iframe load event.
    // Mount as soon as its document has parsed the header instead.
    const ready = window.setInterval(() => {
      if (iframe.contentDocument !== attachedDocument) attach();
      revealWhenReady();
    }, 100);
    return () => { disposed = true; cleanupNavigation?.(); cleanupHover?.(); window.clearInterval(ready); observer?.disconnect(); iframe.removeEventListener('load', attach); };
  }, [view, router]);

  return <main className="mirror-shell" aria-busy="true"><iframe ref={frame} className="mirror-frame" aria-hidden="true" src="/dottxt/index.html" title={view === 'top200' ? 'Top 200' : view === 'markets' ? 'Markets' : 'Announcements'} allow="fullscreen" />{view !== 'announcements' && host && createPortal(<MarketBoard key={view} view={view} />, host)}</main>;
}
