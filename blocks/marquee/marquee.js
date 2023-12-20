export default function decorate(block) {
  const divs = [...block.querySelectorAll('.marquee > div')];
  divs.forEach((div) => {
    div.classList.add('marquee-item');
  });

  block.innerHTML = `<article>
  <div class="marquee">
    <div class="marquee__group">
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
