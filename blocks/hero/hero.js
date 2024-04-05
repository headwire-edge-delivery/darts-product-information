import { decorateButtons } from '../../scripts/aem.min.js';

export default async function decorate(block) {
  // checks for a color Variant and applies the color to the text
  block.classList.forEach((className) => {
    if (className.startsWith('color-')) {
      const color = className.replace('color-', '');
      if (color.includes('-')) {
        const prefix = color.split('-')[0];

        if (prefix === 'hex') {
          block.style.color = `#${color.replace('hex-', '')}`;
        } else if (prefix === 'rgb') {
          block.style.color = `rgb(${color.replace('rgb-', '')})`;
        }
      } else {
        block.style.color = color;
      }
    }
  });
  decorateButtons(block);

  const heroContentWrapper = document.createElement('div');
  heroContentWrapper.classList.add('hero-content');
  block.append(heroContentWrapper);
  const picture = block.querySelector(':scope picture');

  if (picture) {
    picture.parentNode.replaceWith(picture);
    document.body.classList.add('has-hero');
    picture.classList.add('hero-picture');

    block.append(picture);
  } else {
    block.classList.add('hidden');
  }

  const heroTextWrapper = document.createElement('div');
  heroTextWrapper.classList.add('hero-text');
  const heroText = block.querySelectorAll(':scope div > div :is(h1, h2, h3)');
  heroTextWrapper.append(...heroText);
  heroContentWrapper.append(heroTextWrapper);
  const heroButtons = block.querySelectorAll(':scope div > div > .button-container');
  heroContentWrapper.append(...heroButtons);
  block.querySelector(':scope div > div')?.parentNode?.remove();
}
