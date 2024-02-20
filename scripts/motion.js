// eslint-disable-next-line import/no-unresolved
import { animate } from 'https://cdn.skypack.dev/pin/motion@v10.17.0-BH8LrXiUHw668sFYKran/mode=imports,min/optimized/motion.js';

animate(
  '.error-number',
  { x: [0, -100, 100, 0] },
  {
    duration: 2,
    offset: [0, 0.25, 0.75],
  },
);
