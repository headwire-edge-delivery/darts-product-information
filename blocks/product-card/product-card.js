import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const divs = [...block.querySelectorAll('.product-card > div')];
  const picture = divs[0];
  const img = picture.querySelector('img');
  const height = img.height;
  const width = img.width;
  const button = divs[1];
  const context = divs[2];
  picture.classList.add('product-card-image');
  button.classList.add('product-card-button');
  context.classList.add('product-card-context');

  block.innerHTML = `
    <div class="product-card">
    ${
      createOptimizedPicture(img.src.split('?')[0], img.alt, true, [
        { height, width },
        { height: height / 2, width: width / 2 },
        { height: height / 4, width: width / 4 },
        { height: height / 6, width: width / 6 },
      ]).outerHTML
    }
        ${button.outerHTML}
        ${context.outerHTML}
    </div>
  `;
}
