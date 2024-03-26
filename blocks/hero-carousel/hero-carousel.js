import { fetchPlaceholders } from '../../scripts/aem.min.js';

function updateActiveSlide(slide) {
  const block = slide.closest('.hero-carousel');
  const slideIndex = parseInt(slide.dataset.slideIndex, 10);
  block.dataset.activeSlide = slideIndex;

  const slides = block.querySelectorAll('.hero-carousel-slide');

  slides.forEach((aSlide, idx) => {
    aSlide.setAttribute('aria-hidden', idx !== slideIndex);
    aSlide.querySelectorAll('a').forEach((link) => {
      if (idx !== slideIndex) {
        link.setAttribute('tabindex', '-1');
      } else {
        link.removeAttribute('tabindex');
      }
    });
  });

  const indicators = block.querySelectorAll('.hero-carousel-slide-indicator');
  indicators.forEach((indicator, idx) => {
    if (idx !== slideIndex) {
      indicator.querySelector('button').removeAttribute('disabled');
    } else {
      indicator.querySelector('button').setAttribute('disabled', 'true');
    }
  });
}

function showSlide(block, slideIndex = 0) {
  const slides = block.querySelectorAll('.hero-carousel-slide');
  let realSlideIndex = slideIndex < 0 ? slides.length - 1 : slideIndex;
  if (slideIndex >= slides.length) realSlideIndex = 0;
  const activeSlide = slides[realSlideIndex];

  activeSlide.querySelectorAll('a').forEach((link) => link.removeAttribute('tabindex'));
  block.querySelector('.hero-carousel-slides').scrollTo({
    top: 0,
    left: activeSlide.offsetLeft,
    behavior: 'smooth',
  });
}

function bindEvents(block) {
  let autoSlideInterval;

  function startAutoSlide() {
    const changeSlide = () => {
      const activeSlideIndex = parseInt(block.dataset.activeSlide, 10);
      showSlide(block, activeSlideIndex + 1);
    };

    autoSlideInterval = setInterval(changeSlide, 5000);
  }

  function pauseAutoSlide() {
    clearInterval(autoSlideInterval);
    autoSlideInterval = null;
  }

  function resumeAutoSlide() {
    if (!autoSlideInterval) {
      startAutoSlide();
    }
  }

  block.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      pauseAutoSlide();
      showSlide(block, parseInt(block.dataset.activeSlide, 10) - 1);
      resumeAutoSlide();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      pauseAutoSlide();
      showSlide(block, parseInt(block.dataset.activeSlide, 10) + 1);
      resumeAutoSlide();
    }
  });

  block.querySelector('.slide-prev').addEventListener('click', () => {
    pauseAutoSlide();
    showSlide(block, parseInt(block.dataset.activeSlide, 10) - 1);
    resumeAutoSlide();
  });
  block.querySelector('.slide-prev').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      pauseAutoSlide();
      showSlide(block, parseInt(block.dataset.activeSlide, 10) - 1);
      resumeAutoSlide();
    }
  });
  block.querySelector('.slide-next').addEventListener('click', () => {
    pauseAutoSlide();
    showSlide(block, parseInt(block.dataset.activeSlide, 10) + 1);
    resumeAutoSlide();
  });
  block.querySelector('.slide-next').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      pauseAutoSlide();
      showSlide(block, parseInt(block.dataset.activeSlide, 10) + 1);
      resumeAutoSlide();
    }
  });

  const slideObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) updateActiveSlide(entry.target);
      });
    },
    { threshold: 0.5 },
  );
  block.querySelectorAll('.hero-carousel-slide').forEach((slide) => {
    slideObserver.observe(slide);
  });

  // Pause auto-slide on user interaction
  block.addEventListener('mouseenter', pauseAutoSlide);
  block.addEventListener('focusin', pauseAutoSlide);
  block.addEventListener('touchstart', pauseAutoSlide);

  // Resume auto-slide when user interaction ends
  block.addEventListener('mouseleave', resumeAutoSlide);
  block.addEventListener('focusout', resumeAutoSlide);
  block.addEventListener('touchend', resumeAutoSlide);

  resumeAutoSlide();
}

function createSlide(row, slideIndex, carouselId) {
  const slide = document.createElement('li');
  slide.dataset.slideIndex = slideIndex;
  slide.setAttribute('id', `hero-carousel-${carouselId}-slide-${slideIndex}`);
  slide.classList.add('hero-carousel-slide');

  row.querySelectorAll(':scope > div').forEach((column, colIdx) => {
    column.classList.add(`hero-carousel-slide-${colIdx === 0 ? 'image' : 'content'}`);

    // removes a p tag if it has no class, but keeps the content
    column.querySelectorAll('p').forEach((p) => {
      if (p.classList.length === 0) {
        p.outerHTML = p.innerHTML;
      }
    });

    slide.append(column);
  });

  slide.querySelectorAll('.button-container').forEach((buttonContainer) => {
    if (buttonContainer.tagName.toLowerCase() === 'p') {
      buttonContainer.outerHTML = `<div class="button-container hero-carousel-slide-content">${buttonContainer.innerHTML}</div>`;
    }
    buttonContainer.classList.add('hero-carousel-slide-content');

    // if the buttonContainer is inside a .hero-carousel-slide-image,
    // move it outside as a direct sibling
    const imageContainer = slide.querySelector('.hero-carousel-slide-image');
    const newButtonContainer = imageContainer.querySelector('.button-container');
    if (imageContainer.contains(newButtonContainer)) {
      imageContainer.after(newButtonContainer);
    }
  });

  const labeledBy = slide.querySelector('h1, h2, h3, h4, h5, h6');
  if (labeledBy) {
    slide.setAttribute('aria-labelledby', labeledBy.getAttribute('id'));
  }

  return slide;
}

let carouselId = 0;
export default async function decorate(block) {
  carouselId += 1;
  block.setAttribute('id', `hero-carousel-${carouselId}`);
  const rows = block.querySelectorAll(':scope > div');
  const pictures = [];
  rows.forEach((row) => {
    if (row.querySelectorAll('picture').length > 1) {
      const allPictures = row.querySelectorAll('picture');

      allPictures.forEach((singlePicture) => {
        const newRow = row.cloneNode(true);
        newRow.querySelectorAll('picture').forEach((picture, i) => {
          // replaces the first picture with the singlePicture, and remove every other picture
          if (i === 0) {
            picture.replaceWith(singlePicture);
          }
          if (i > 0) {
            picture.remove();
          }
        });
        pictures.push(newRow);
      });
    } else {
      pictures.push(row);
    }
  });

  const isSingleSlide = rows.length < 2;

  const placeholders = await fetchPlaceholders();

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', placeholders.heroCarousel || 'Carousel');

  const container = document.createElement('div');
  container.classList.add('hero-carousel-slides-container');
  // cleanes the .hero-carousel from elements that are not .hero-carousel-slides-container
  block
    .querySelectorAll(':scope > :not(.hero-carousel-slides-container)')
    .forEach((el) => el.remove());

  const slidesWrapper = document.createElement('ul');
  slidesWrapper.classList.add('hero-carousel-slides');
  block.prepend(slidesWrapper);

  if (!isSingleSlide) {
    const slideNavButtons = document.createElement('div');
    slideNavButtons.classList.add('hero-carousel-navigation-buttons');
    slideNavButtons.innerHTML = `<div class="button-container">
      <div type="button" tabindex="0" class="slide-prev hero-carousel-button hex" aria-label="${
        placeholders.previousSlide || 'Previous Slide'
      }"><span class="icon icon-chevron-left"><img data-icon-name="chevron-left" alt="chevron-left-icon" src="/icons/chevron-left.svg" loading="lazy"></span></div></div>
      <div class="button-container"><div type="button" tabindex="0" class="slide-next hero-carousel-button hex" aria-label="${
        placeholders.nextSlide || 'Next Slide'
      }"><span class="icon icon-chevron-right"><img data-icon-name="chevron-right" alt="chevron-right-icon" src="/icons/chevron-right.svg" loading="lazy"></span></div></div>
    `;

    container.append(slideNavButtons);
  }

  pictures.forEach((row, idx) => {
    const slide = createSlide(row, idx, carouselId);
    slidesWrapper.append(slide);
    row.remove();
  });

  container.append(slidesWrapper);
  block.prepend(container);

  if (!isSingleSlide) {
    bindEvents(block);
  }
}
