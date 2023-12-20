import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  block.textContent = '';

  // load footer fragment
  const footerPath = footerMeta.footer || '/footer';
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  const footer = document.createElement('div');
  footer.classList.add("footer-row")
  while (fragment.firstElementChild) console.log(footer, fragment.firstElementChild);
  // while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  console.log(block, footer)
  
  // block.append(footer);
}
