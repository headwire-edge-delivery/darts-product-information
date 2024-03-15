import { getMetadata } from '../../scripts/aem.min.js';
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
  while (fragment.firstElementChild) block.append(fragment.firstElementChild);

  block.querySelectorAll('img[data-icon-name]').forEach((img) => {
    img.alt = `${img.dataset.iconName} icon`;
  });
}
