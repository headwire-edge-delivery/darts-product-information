import { animate, scroll } from 'https://cdn.skypack.dev/motion?min';

export default function decorate(block) {
  const imageArray = [...block.querySelectorAll('picture')];

  block.innerHTML = `<section class="scroll-right-section">
  <ul>
  ${imageArray
    .map(
      (picture) => `
              <li class="scroll-right-item">
                ${picture.outerHTML}
              </li>
            `
    )
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
    { target: document.querySelector('section') }
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
