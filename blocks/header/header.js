import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';
import decorateHeaderSearch from './header-search.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 768px)');

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav?.querySelector('.nav-sections');
    const navSectionExpanded = navSections?.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  sections
    .querySelectorAll('.nav-sections .default-content-wrapper > ul > li')
    .forEach((section) => {
      section.setAttribute('aria-expanded', expanded);
    });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded =
    forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = expanded || isDesktop.matches ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  // enable nav dropdown keyboard accessibility
  const navDrops = navSections.querySelectorAll('.nav-drop');
  if (isDesktop.matches) {
    navDrops.forEach((drop) => {
      if (!drop.hasAttribute('tabindex')) {
        drop.setAttribute('role', 'button');
        drop.setAttribute('tabindex', 0);
        drop.addEventListener('focus', focusNavSection);
      }
    });
  } else {
    navDrops.forEach((drop) => {
      drop.removeAttribute('role');
      drop.removeAttribute('tabindex');
      drop.removeEventListener('focus', focusNavSection);
    });
  }
  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    // collapse menu on escape press
    window.addEventListener('keydown', closeOnEscape);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
  }
}

/**
 * decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  // decorate nav DOM
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  const navBrand = nav.querySelector('.nav-brand');
  const brandLink = navBrand.querySelector('.button');
  if (brandLink) {
    brandLink.className = '';
    brandLink.closest('.button-container').className = '';
  }

  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    navSections
      .querySelectorAll(':scope .default-content-wrapper > ul > li')
      .forEach((navSection) => {
        if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');
        navSection.addEventListener('click', () => {
          if (isDesktop.matches) {
            const expanded = navSection.getAttribute('aria-expanded') === 'true';
            toggleAllNavSections(navSections);
            navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
          }
        });
      });
  }

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');
  // prevent mobile nav behavior on window resize
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
  const navArray = [...block.querySelectorAll('.default-content-wrapper ul li a')];
  const mobileNavArray = [];
  const FillMobileNavArray = () => {
    let toggle = false;
    // eslint-disable-next-line space-in-parens
    for (let i = 0; i < navArray.length; ) {
      if (toggle) {
        // Group of 2 elements
        mobileNavArray.push(navArray.slice(i, i + 2));
        i += 2;
      } else {
        // Single element
        mobileNavArray.push([navArray[i]]);
        i += 1;
      }
      toggle = !toggle;
    }
  };
  FillMobileNavArray();
  const half = Math.ceil(navArray.length / 2);
  const firstHalf = navArray.slice(0, half);
  const secondHalf = navArray.slice(half, navArray.length);
  let mobileNavOpen = false;
  const logo = `<a class="hexagon-logo hexagon-menu" href="/" aria-label="Home">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 888.1 1024" style="enable-background:new 0 0 888.1 1024" xml:space="preserve">
  <path class="hexagon-logo-path-1" style="fill:#D40C0C" d="M0 256.4 444.1 0l444 256.4v512.7l-444 256.4L0 769.1z"/>
  <path class="hexagon-logo-path-2" d="M425.97 88.69c-12.78 25.38-16.74 35.1-16.74 40.5 0 3.96 1.98 22.5 4.5 41.4 2.52 18.72 6.12 47.16 8.1 63 2.16 15.84 5.4 38.52 7.2 50.4 1.98 11.88 4.32 29.16 5.4 38.52 2.16 18.9 6.84 39.78 9 39.78 1.62 0 7.92-18.54 9.72-27.9.54-3.06 2.7-18.72 4.5-35.1 5.58-46.44 12.42-100.26 17.46-138.6l4.86-35.1-17.64-34.2c-9.72-18.9-18-34.74-18.72-35.28-.53-.54-8.64 14.04-17.64 32.58zM321.03 186.26c0 57.78.72 96.66 1.8 100.62 1.62 6.12 30.6 35.1 93.24 94.14l7.74 7.38-1.08-9.9c-.54-5.4-3.42-28.08-6.3-50.4s-9.54-75.42-14.58-117.9c-6.3-51.48-10.26-78.48-11.88-80.28-1.44-1.8-13.32-8.64-26.28-15.3-13.14-6.66-27.72-14.4-32.4-17.28-4.68-2.7-9-5.04-9.36-5.04-.54-.01-.9 42.29-.9 93.96zM547.84 101.47c-8.46 5.04-23.4 13.14-33.3 18.18-9.9 5.04-18.36 9.36-18.72 9.72-.36.36-2.52 17.46-4.86 37.98-2.16 20.52-5.76 49.5-7.74 64.44-1.98 14.76-5.22 42.3-7.38 61.2-1.98 18.72-5.4 46.98-7.38 62.82-1.98 15.66-3.24 28.8-2.88 29.16.18.36 18.54-16.74 40.68-38.16 22.14-21.24 43.02-40.86 46.44-43.38 3.42-2.7 7.74-7.74 9.72-11.52 3.24-6.48 3.42-11.52 3.42-103.32 0-52.92-.54-96.3-1.26-96.12-.9 0-8.28 4.14-16.74 9zM260.55 256.1c-7.74 6.84-14.94 13.5-16.02 14.76-.9 1.26-5.76 6.84-10.62 12.24-4.86 5.4-13.68 17.1-19.62 26.1-30.06 45.54-43.2 90.54-43.2 148.5 0 42.3 5.58 72.18 19.8 106.02 23.76 56.88 54.72 95.4 103.14 127.98 11.34 7.74 51.12 28.8 54.18 28.8.9 0 1.62-6.66 1.62-14.94 0-8.46 1.26-19.26 2.88-24.48 1.44-5.22 2.52-9.72 2.16-9.72-50.22-23.94-86.76-58.86-110.34-105.66-21.24-41.94-28.98-82.8-24.48-127.8 5.22-50.94 22.68-92.7 50.94-121.68l10.8-11.16-3.96-11.34c-3.96-11.7-5.22-33.12-2.7-44.82.72-3.06.9-5.4.36-5.4-.36 0-7.2 5.58-14.94 12.6zM611.38 246.02c3.96 10.26.18 45.54-5.76 54.9-1.26 1.98 1.62 6.12 11.16 16.56 38.34 40.86 57.42 107.46 49.14 170.1-7.2 55.08-28.44 98.1-67.86 137.88-19.62 19.62-38.16 33.3-56.16 41.04-7.56 3.42-9.9 5.22-9 7.2 3.96 9.54 6.12 22.14 5.58 32.94l-.72 12.42 5.04-1.08c18.18-3.6 61.02-30.24 83.7-51.84 18.54-17.82 53.82-64.26 57.24-75.6.72-2.34 4.86-10.98 9.18-19.44 4.14-8.46 9.36-21.42 11.34-28.8 1.98-7.38 4.5-16.38 5.58-19.8 3.78-12.78 7.2-41.04 7.2-61.2-.18-74.34-26.1-140.4-74.88-189.54-17.82-18-32.4-30.24-30.78-25.74z"/>
  <path class="hexagon-logo-path-3" d="M290.25 370.04c-24.3 38.16-31.32 99.18-16.74 145.62 13.14 41.58 43.2 80.46 76.5 98.64l9.72 5.22 1.98-12.6c1.26-6.84 3.96-15.84 5.94-19.98 3.06-6.3 3.24-7.92 1.26-9-19.8-11.16-42.12-36.72-52.56-60.3-16.38-36.9-14.94-91.44 3.24-124.56 5.94-10.98 6.66-13.68 4.68-15.48-7.56-6.66-24.3-20.7-25.02-20.7-.36 0-4.5 5.94-9 13.14zM575.74 366.8c-5.94 5.58-12.24 10.44-13.86 10.98-2.52.72-1.98 2.7 4.14 14.04 9.72 18.18 13.86 31.32 16.2 51.3 3.24 27.54-2.88 59.04-16.56 84.78-7.92 14.76-26.28 36-39.24 45.18l-10.62 7.38 4.5 9.72c2.34 5.4 4.86 14.22 5.4 19.62s1.8 9.9 2.7 9.9c4.14 0 28.44-17.64 38.16-27.72 21.42-22.32 41.58-57.78 50.04-88.74 5.76-20.52 5.58-66.96 0-87.84-4.5-16.56-17.64-44.1-25.02-52.56l-5.04-5.76-10.8 9.72zM426.33 436.46c-1.26 3.96-13.5 105.66-13.5 112.5 0 .18 13.86.54 30.78.54h30.96l-1.08-10.44c-1.44-16.02-10.26-87.48-11.7-96.12l-1.44-7.74-16.56-.54c-12.24-.36-16.74.18-17.46 1.8zM408.51 584.06c-2.52 16.02-2.34 22.86.18 23.76 4.14 1.62 70.38 1.26 71.46-.36.36-.72 0-7.56-1.08-15.3l-1.97-13.86h-67.68l-.91 5.76zM401.13 646.71c-.54 5.4-1.44 12.06-1.8 14.76l-.72 5.04h43.74c23.94 0 44.1-.36 44.64-.9.72-.9-1.08-16.56-3.06-25.2-.72-3.42-2.16-3.6-41.22-3.6l-40.5-.18-1.08 10.08zM395.91 704.67c-.54 5.22-1.08 12.24-1.08 15.3v5.94H494.37l-1.26-11.34c-.72-6.12-1.8-12.96-2.34-15.3l-.9-3.96H397.17l-1.26 9.36zM391.77 779.37c.54 20.52 1.08 24.12 5.22 32.04 5.4 10.26 16.2 21.42 23.58 24.12 3.78 1.44 4.86 3.06 4.86 7.2 0 5.76 13.5 107.82 15.84 120.78.9 4.68 2.16 7.02 2.7 5.4 3.78-9.72 13.5-77.22 16.74-116.28l1.08-14.58 9.18-6.12c5.76-3.78 12.24-10.44 16.92-17.46l7.74-11.34v-46.62H391.05l.72 22.86z"/>
  </svg></a>`;

  block.innerHTML = /* html */ `<nav class="menu">
    <ul class="nav-items nav-items-first-half">${firstHalf
      .map((navFirst) => `<li><span class="hex">${navFirst.outerHTML}</span></li>`)
      .join('')}
    </ul>
    ${logo}
    <ul class="nav-items nav-items-second-half">${secondHalf
      .map((navSecond) => `<li><span class="hex">${navSecond.outerHTML}</span></li>`)
      .join('')}
    </ul>
    
    <div class="hex hamburger-menu">
      <input id="toggle-checker" type="checkbox">
<label id="toggler-label" for="toggle-checker">
  <div class="checkboxtoggler">
    <div class="line-1"></div>
    <div class="line-2"></div>
    <div class="line-3"></div>
  </div>
</label></div>
    <div class='nav-items-mobile'>${mobileNavArray
      .map(
        (navContainer) =>
          `<ul>${navContainer
            .map((navMobile) => `<li><span class="hex">${navMobile.outerHTML}</span></li>`)
            .join('')}</ul>`,
      )
      .join('')}
      </div>
</nav><div class="mobile-nav-background"/>`;

  const hamburgerMenu = document.getElementById('toggle-checker');
  const mobileMenu = document.getElementsByClassName('nav-items-mobile')[0];
  const mobileNavBackground = document.getElementsByClassName('mobile-nav-background')[0];

  function toggleMobileNav() {
    mobileNavOpen = !mobileNavOpen;
    if (mobileNavOpen) {
      mobileMenu.classList.add('nav-items-mobile-open');
      mobileNavBackground.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
    } else {
      mobileMenu.classList.remove('nav-items-mobile-open');
      mobileNavBackground.style.display = 'none';
      document.body.style.overflow = 'auto';
      document.body.style.position = '';
    }
  }

  const searchLinks = mobileMenu.querySelectorAll('a:has(.icon-search)');
  searchLinks.forEach((link) => {
    link.addEventListener('click', toggleMobileNav);
  });

  hamburgerMenu.addEventListener('click', toggleMobileNav);

  decorateHeaderSearch(block);
}
