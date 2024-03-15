import { createOptimizedPicture, decorateIcons, fetchPlaceholders } from '../../scripts/aem.min.js';

function findNextHeading(el) {
  let preceedingEl = el.parentElement.previousElement || el.parentElement.parentElement;
  let h = 'H2';
  while (preceedingEl) {
    const lastHeading = [...preceedingEl.querySelectorAll('h1, h2, h3, h4, h5, h6')].pop();
    if (lastHeading) {
      const level = parseInt(lastHeading.nodeName[1], 10);
      h = level < 6 ? `H${level + 1}` : 'H6';
      preceedingEl = false;
    } else {
      preceedingEl = preceedingEl.previousElement || preceedingEl.parentElement;
    }
  }
  return h;
}

function renderResult(result, titleTag, index = 1) {
  const li = document.createElement('li');
  const a = document.createElement('a');
  a.classList.add('glass-bg');
  a.href = result.path;
  if (result.image) {
    const wrapper = document.createElement('div');
    wrapper.className = 'product-image';
    const pic = createOptimizedPicture(result.image, '', false, [{ width: '375' }]);
    wrapper.append(pic);
    a.append(wrapper);
    if (index === 0) {
      pic.querySelector('img').loading = 'eager';
    }
  }
  if (result.title) {
    const title = document.createElement(titleTag);
    title.className = 'product-title';
    const link = document.createElement('a');
    link.href = result.path;
    link.textContent = result.title;
    title.append(link);
    a.append(title);
  }
  if (result.description) {
    const description = document.createElement('p');
    description.textContent = result.description;
    a.append(description);
  }
  li.append(a);
  return li;
}

async function renderResults(block, filteredData) {
  const placeholders = await fetchPlaceholders();
  const searchResults = block.querySelector('.all-products');
  const headingTag = searchResults.dataset.h;

  if (filteredData.length) {
    searchResults.classList.remove('no-results');
    filteredData.forEach((result, index) => {
      const li = renderResult(result, headingTag, index);
      searchResults.append(li);
    });
  } else {
    const noResultsMessage = document.createElement('li');
    searchResults.classList.add('no-results');
    noResultsMessage.textContent = placeholders.searchNoResults || 'No results found.';
    searchResults.append(noResultsMessage);
  }
}

export async function fetchData(block, source) {
  const response = await fetch(source);
  if (!response.ok) {
    // eslint-disable-next-line no-console
    console.error('error loading API response', response);
    return null;
  }

  const json = await response.json();
  if (!json) {
    // eslint-disable-next-line no-console
    console.error('empty API response', source);
    return null;
  }

  await renderResults(block, json.data);

  return json.data;
}

function searchResultsContainer(block) {
  const results = document.createElement('ul');
  results.className = 'all-products';
  results.dataset.h = findNextHeading(block);
  return results;
}

export default async function decorate(block) {
  block.innerHTML = '';
  block.append(searchResultsContainer(block));
  const productCategory = block.classList[1];

  fetchData(block, `/query-index.json?sheet=${productCategory}`);
  decorateIcons(block);
}
