import { animate, scroll } from 'https://cdn.skypack.dev/motion?min';

export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`motion-${cols.length}-cols`);

  // setup image motion
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('motion-img-col');
        }
      }
    });
  });

  const items = document.querySelectorAll('.motion-img-col');

  // Animate gallery horizontally during vertical scroll
  scroll(
    animate('.motion-img-col', {
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
