import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const divs = [...block.querySelectorAll('.marquee > div')];
  divs.forEach((div) => {
    div.classList.add('marquee-item');
  });

  block.innerHTML = `<article>
  <div class="marquee">
    <div class="marquee-group">
  ${divs
    .map((div) => {
      const picture = div.querySelector('picture');
      if (picture) {
        const img = picture.querySelector('img');
        const targetHeight = 100;
        const { width, height } = img;
        const factor = height / targetHeight;
        picture.replaceWith(
          createOptimizedPicture(img.src.split('?')[0], img.alt, false, [
            { height: `${targetHeight}`, width: `${width / factor}` },
          ]),
        );
      }
      return `
              <div class="marquee-item">
                ${div.outerHTML}
              </div>
            `;
    })
    .join('')}
    </div>
    <div aria-hidden="true" class="marquee-group">
  ${divs
    .map(
      (div) => `
              <div class="marquee-item">
                ${div.outerHTML}
              </div>
            `,
    )
    .join('')}
    </div>
  </div>
</article>
`;
}
