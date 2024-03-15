export default function generateDFC() {
  document.querySelector('.darts-feature-card-wrapper').classList.add('glass-bg');

  const cardImage = document.querySelector('.darts-feature-card').querySelector('div');
  cardImage.classList.add('darts-feature-card-image');

  const image = document.querySelector('.darts-feature-card-image picture img');

  function onImageLoad() {
    const imgWidth = image.naturalWidth;
    const imgHeight = image.naturalHeight;

    const screenWidth = window.innerWidth;
    const calculatedImgWidth = screenWidth > imgWidth ? imgWidth : screenWidth - 64;
    const calculatedImgHeight =
      screenWidth > imgWidth ? imgHeight : imgHeight * (screenWidth / imgWidth);

    const { children } = document.querySelector('.darts-feature-card');
    for (let i = 1; i < children.length; i += 1) {
      children[i].classList.add(
        `darts-feature-item-${children[i].children[0].textContent.toLowerCase()}`,
      );
    }

    const featureItems = document.querySelectorAll('[class^="darts-feature-item-"]');
    const itemContainer = document.createElement('div');
    featureItems.forEach((item) => {
      itemContainer.classList.add('darts-feature-item-container');
      item.parentNode.insertBefore(itemContainer, item);
      itemContainer.appendChild(item);
    });

    if (window.innerWidth > 1100) {
      // horizontal View
      itemContainer.childNodes.forEach((item) => {
        item.style.marginTop = `-${calculatedImgHeight + 50}px`;
      });

      document.querySelector('.darts-feature-card').style.maxWidth = `${imgWidth}px`;
      itemContainer.style.marginLeft = `${100 / (itemContainer.children.length + 1)}%`;
    } else {
      // vertical View
      document.querySelector('.darts-feature-card').style.height = `${calculatedImgWidth}px`;
      cardImage.style.marginTop = `${(calculatedImgWidth / 2) * 0.85}px`;
    }
  }

  // Check if the image is already loaded (for cached images) else wait for the image to be loaded
  if (image.complete && image.naturalHeight !== 0) {
    onImageLoad();
  } else {
    image.addEventListener('load', onImageLoad);
  }
}
