import {
  animate,
  scroll,
  // eslint-disable-next-line import/no-unresolved
} from 'https://cdn.skypack.dev/pin/motion@v10.17.0-BH8LrXiUHw668sFYKran/mode=imports,min/optimized/motion.js';
import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const imageArray = [...block.querySelectorAll('picture')];

  block.innerHTML = `<section class="scroll-right-section">
  <ul>
  ${imageArray
    .map((picture) => {
      const img = picture.querySelector('img');
      const { height, width } = img;

      return `
                <li class="scroll-right-item" >
                  ${
                    createOptimizedPicture(img.src.split('?')[0], img.alt, false, [
                      { height, width },
                      { height: height / 2, width: width / 2 },
                      { height: height / 4, width: width / 4 },
                      { height: height / 6, width: width / 6 },
                      // { width: 375 },
                    ]).outerHTML
                  }
                </li>
              `;
    })
    .join('')}
  </ul>
</section>`;
  // select all li items inside the scroll-right-section class
  const scrollRightSection = document.querySelector('.scroll-right-section');
  const items = scrollRightSection.querySelectorAll('li');

  // Animate gallery horizontally during vertical scroll
  scroll(
    animate('ul', {
      transform: ['none', `translateX(-${items.length - 1}00vw)`],
    }),
    { target: document.querySelector('section') },
  );

  // Image title parallax
  const segmentLength = 1 / items.length;
  items.forEach((item, i) => {
    const header = item.querySelector('h2');

    scroll(animate(header, { x: [200, -200] }), {
      target: document.querySelector('section'),
      offset: [
        [i * segmentLength, 1],
        [(i + 1) * segmentLength, 0],
      ],
    });
  });
}
