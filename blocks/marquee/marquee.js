import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const divs = [...block.querySelectorAll('.marquee > div')];
  divs.forEach((div) => {
    div.classList.add('marquee-item');
  });

  block.innerHTML = `<article>
  <div class="marquee">
    <div class="marquee__group">
  ${divs
    .map((div) => {
      let picture = div.querySelector('picture');
      if (picture) {
        const img = picture.querySelector('img');
        const height = img.height;
        const width = img.width;
        const factor = height / 100;
        console.log(height, width, factor, height / factor, width / factor);
        picture.replaceWith(
          createOptimizedPicture(img.src.split('?')[0], img.alt, false, [
            { height: `${height}`, width: `${width / factor}` },
          ])
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
    <div aria-hidden="true" class="marquee__group">
  ${divs
    .map(
      (div) => `
              <div class="marquee-item">
                ${div.outerHTML}
              </div>
            `
    )
    .join('')}
    </div>
  </div>
</article>
`;
}
