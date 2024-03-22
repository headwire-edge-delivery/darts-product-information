export default function decorateDFC(block) {
  block.parentNode.classList.add('glass-bg');

  // if no image is found, remove the block
  if (!block.querySelector('picture')) {
    block.parentNode.parentNode.remove();
    return;
  }

  const cardImage = block.querySelector('picture')?.parentNode?.parentNode;
  cardImage.classList.add('darts-feature-card-image');

  const image = block.querySelector('picture img');

  let imgWidth;
  let imgHeight;
  let screenWidth;
  let calculatedImgWidth;
  let calculatedImgHeight;

  function updateImageSize() {
    imgWidth = image.naturalWidth;
    imgHeight = image.naturalHeight;

    screenWidth = window.innerWidth;
    calculatedImgWidth = screenWidth > imgWidth ? imgWidth : screenWidth - 64;
    calculatedImgHeight = screenWidth > imgWidth ? imgHeight : imgHeight * (screenWidth / imgWidth);

    if (window.innerWidth > 768) {
      // horizontal View
      block.style.maxWidth = `${imgWidth}px`;
      cardImage.style.marginTop = '0';
      block.style.height = 'auto';
    } else {
      // vertical View
      block.style.height = `${calculatedImgWidth}px`;
      cardImage.style.marginTop = `${(calculatedImgWidth / 2) * 0.85}px`;
    }
  }

  function onImageLoad() {
    updateImageSize();

    const { children } = block.querySelector('.darts-feature-item-container') || block;
    Array.from(children).forEach((child) => {
      if (child.classList.value !== 'darts-feature-card-image') {
        child.classList.add(`darts-feature-item-${child.children[0].textContent.toLowerCase()}`);
      }
    });

    const featureItems = block.querySelectorAll('[class^="darts-feature-item-"]');
    const itemContainer =
      block.querySelector('.darts-feature-item-container') || document.createElement('div');
    if (!block.querySelector('.darts-feature-item-container')) {
      featureItems.forEach((item) => {
        itemContainer.classList.add('darts-feature-item-container');
        item.parentNode.insertBefore(itemContainer, item);
        itemContainer.appendChild(item);
      });
    }

    const isDesktop = window.innerWidth > 768;
    itemContainer.childNodes.forEach((item) => {
      item.style.marginTop = isDesktop ? `-${calculatedImgHeight + 50}px` : '0';
    });

    itemContainer.style.marginLeft = isDesktop
      ? `${100 / (itemContainer.children.length + 1)}%`
      : '0';
  }

  // Check if the image is already loaded or wait for it to load
  if (image?.complete && image?.naturalHeight !== 0) {
    onImageLoad();
  } else {
    image?.addEventListener('load', onImageLoad);
  }

  window.addEventListener('resize', onImageLoad);
}
