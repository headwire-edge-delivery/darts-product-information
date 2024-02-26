export default function generateDFC() {
  document.querySelector('.darts-feature-card-wrapper').classList.add('glass-bg');

  const cardImage = document.querySelector('.darts-feature-card').querySelector('div');
  cardImage.classList.add('darts-feature-card-image');

  const imgWidth = document.querySelector('.darts-feature-card-image picture img').naturalWidth;
  const imgHeight = document.querySelector('.darts-feature-card-image picture img').naturalHeight;

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
      item.style.marginTop = `-${calculatedImgHeight}px`;
    });

    document.querySelector('.darts-feature-card').style.maxWidth = `${imgWidth}px`;
    itemContainer.style.marginLeft = `${100 / (itemContainer.children.length + 1)}%`;
  } else {
    // vertical View
    document.querySelector('.darts-feature-card').style.height = `${calculatedImgWidth}px`;
    cardImage.style.marginTop = `${(calculatedImgWidth / 2) * 0.85}px`;
  }
}
