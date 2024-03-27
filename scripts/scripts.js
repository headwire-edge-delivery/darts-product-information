import {
  sampleRUM,
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForLCP,
  loadBlocks,
  loadCSS,
} from './aem.min.js';

const LCP_BLOCKS = []; // add your LCP blocks to the list

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) {
      sessionStorage.setItem('fonts-loaded', 'true');
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  decorateSections(main);
  decorateBlocks(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await waitForLCP(LCP_BLOCKS);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  await loadBlocks(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadHeader(doc.querySelector('header'));
  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();

  sampleRUM('lazy');
  sampleRUM.observe(main.querySelectorAll('div[data-block-name]'));
  sampleRUM.observe(main.querySelectorAll('picture > img'));
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

const cookieBannerPageScoreFixes = () => {
  function showCookieBanner() {
    const cookieBanner = document.body.querySelector('#cookie-notification:not(.appear)');
    if (cookieBanner) {
      cookieBanner.classList.add('appear');
    }
  }

  document.body.addEventListener('scroll', showCookieBanner, { once: true, passive: true });
  document.body.addEventListener('mousemove', showCookieBanner, { once: true, passive: true });
  document.body.addEventListener('touchmove', showCookieBanner, { once: true, passive: true });
  document.body.addEventListener('keydown', showCookieBanner, { once: true, passive: true });

  let intervalRuns = 0;
  const crawlableLinkFixInterval = setInterval(() => {
    if (intervalRuns > 9) {
      clearInterval(crawlableLinkFixInterval);
    }

    intervalRuns += 1;
    const javascriptLinks = document.querySelectorAll(
      '#cookie-notification a[href^="javascript:"]',
    );

    if (javascriptLinks.length) {
      javascriptLinks.forEach((link) => {
        link.href = '#';
      });
      clearInterval(crawlableLinkFixInterval);
    }
  }, 200);
};

cookieBannerPageScoreFixes();

const updateLinks = () => {
  const externalLinks = document.querySelectorAll(
    `a:not([href^="${window.location.origin}" i], [href^="/"], [href^="#"], [target="_blank"], [href^="javascript:"])`,
  );

  externalLinks.forEach((link) => {
    link.target = '_blank';
    link.setAttribute('rel', 'nofollow');
  });

  const brokenHashLinks = document.querySelectorAll(
    `a[href^="${window.location.origin}/#" i], a[href^="/#"]`,
  );
  brokenHashLinks.forEach((link) => {
    link.href = `#${link.href.split('#').pop()}`;
  });
};

window.addEventListener('load', updateLinks, { once: true });

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
