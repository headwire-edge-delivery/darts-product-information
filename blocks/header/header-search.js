function toggleSearch(e) {
  e.preventDefault();
  if (e.target?.closest('.header-search-block') === null || e.key === 'Escape') {
    const searchWrapper = document.querySelector('.header-search-wrapper');
    searchWrapper.querySelector('input[type="search"]').toggleAttribute('disabled');
    if (searchWrapper.classList.contains('active')) {
      searchWrapper?.classList.add('out');
      setTimeout(() => {
        searchWrapper?.classList.remove('active');
        document.body.classList.remove('search-modal-active');
        searchWrapper?.classList.remove('out');
      }, 1000);
    } else {
      searchWrapper?.classList.add('active');
      document.body.classList.add('search-modal-active');
    }

    if (searchWrapper.classList.contains('active')) {
      searchWrapper.querySelector('input[type="search"]').focus();
    }
  }
}

function searchButtonClickHandler(e) {
  const searchWrapper = e.target?.closest('.header-search-wrapper');
  const searchInput = searchWrapper?.querySelector('.header-search-input');
  searchInput.tabIndex = 0;
  const searchValue = searchInput?.value.trim();
  if (searchValue !== '') {
    window.location.href = `/search?q=${searchValue}`;
  }
}

function setupSearchInput(searchButton) {
  const searchInput = document.createElement('input');
  searchInput.classList.add('header-search-input');
  searchInput.setAttribute('type', 'search');
  searchInput.setAttribute('placeholder', 'Search');
  searchInput.setAttribute('disabled', '');
  searchInput.addEventListener('keydown', (e) => {
    const searchWrapper = document.querySelector('.header-search-wrapper');
    if (e.key === 'Enter') {
      e.preventDefault();
      searchButton.click();
    } else if (e.key === 'Tab') {
      searchWrapper?.classList.remove('active');
      /* requestAnimationFrame(() => {
        // searchInput?.toggleAttribute('disabled');
        const searchNav = document.querySelector('header [href="/search"]');
        // searchNav?.focus();
      }); */
    } else if (e.key === 'Escape') {
      toggleSearch(e);
    }
  });
  searchInput.addEventListener('blur', (e) => {
    if (e.relatedTarget === null) {
      toggleSearch(e);
    }
  });
  return searchInput;
}

export default function decorateHeaderSearch(block) {
  const numberOfSearchIcons = block.querySelectorAll('a:has(.icon-search)').length;

  const searchLink = block.querySelector('a:has(.icon-search)');
  searchLink.addEventListener('click', toggleSearch);

  if (numberOfSearchIcons > 1) {
    const searchLinks = block.querySelectorAll('a:has(.icon-search)');
    searchLinks.forEach((link) => {
      link.addEventListener('click', toggleSearch);
    });
  }
  const searchButton = document.createElement('button');
  const searchButtonText = document.createElement('span');
  searchButtonText.innerText = 'Search';
  searchButton.append(searchButtonText);
  searchButton.classList.add('button', 'search-button', 'hex');
  searchButton.addEventListener('click', searchButtonClickHandler);
  const buttonContainer = document.createElement('div');
  buttonContainer.classList.add('button-container');
  buttonContainer.append(searchButton);

  const searchWrapper = document.createElement('div');
  searchWrapper.classList.add('header-search-wrapper', 'search-modal-background');

  const searchContainer = document.createElement('div');
  searchContainer.classList.add('header-search-container', 'glass-bg');

  const searchBlock = document.createElement('form');
  searchBlock.classList.add('header-search-block', 'glass-bg');
  searchBlock.setAttribute('action', '/search?query=');
  searchBlock.append(setupSearchInput(searchButton));
  searchBlock.append(buttonContainer);

  searchWrapper.append(searchBlock);
  document.querySelector('main').appendChild(searchWrapper);
  searchWrapper.addEventListener('click', toggleSearch);
}
