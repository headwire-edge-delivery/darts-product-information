import { animate } from 'https://cdn.skypack.dev/motion?min';
console.log('animate loaded:', animate);
animate(
  '.error-number',
  { x: [0, -100, 100, 0] },
  {
    duration: 2,
    offset: [0, 0.25, 0.75],
  }
);
