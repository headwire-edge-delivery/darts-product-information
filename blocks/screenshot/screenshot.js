export default async function decorateBlock(block) {
  const isDesktop = block.classList.contains('desktop');
  const isMobile = block.classList.contains('mobile');

  // desktop variation
  if (isDesktop) {
    block.querySelector(':scope > div').classList.add('browser-header');
    const browserHeader = block.querySelector('.browser-header');

    // add a container to wrap the close, minimize, and maximize buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('button-container');
    browserHeader.appendChild(buttonContainer);

    // add three divs to the block to represent close, minimize, and maximize buttons
    const close = document.createElement('div');
    close.classList.add('close');
    buttonContainer.appendChild(close);

    const minimize = document.createElement('div');
    minimize.classList.add('minimize');
    buttonContainer.appendChild(minimize);

    const maximize = document.createElement('div');
    maximize.classList.add('maximize');
    buttonContainer.appendChild(maximize);

    // add a wrapper to the address bar
    const addressBarWrapper = document.createElement('div');
    addressBarWrapper.classList.add('address-bar-wrapper');
    const addressBar = document.createElement('div');
    addressBar.classList.add('address-bar');
    addressBarWrapper.appendChild(addressBar);
    browserHeader.appendChild(addressBarWrapper);

    // find the picture element and its parent div and move it outside of its parent div
    const picture = block.querySelector('picture');
    const parent = picture.parentElement;
    parent.removeChild(picture);
    block.appendChild(picture);
    parent.remove();

    // get the image src and add it to the address bar as textContent
    const img = picture.querySelector('img');
    img.setAttribute('loading', 'eager');
    addressBar.textContent = img.src;

    // mobile variation
  } else if (isMobile) {
    // add a container to wrap the image
    const frameContainer = document.createElement('div');
    frameContainer.classList.add('iphone-frame');
    block.appendChild(frameContainer);

    // move picture element inside the frame container
    const picture = block.querySelector('picture');
    frameContainer.appendChild(picture);

    // set img as background img inside framecontainer
    const img = picture.querySelector('img');
    img.setAttribute('loading', 'eager');
    frameContainer.setAttribute('style', `background-image: url('${img.src}')`);
  }
}
