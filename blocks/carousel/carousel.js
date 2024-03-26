import { fetchPlaceholders } from '../../scripts/aem.min.js';

function updateActiveSlide(slide) {
  const block = slide.closest('.carousel');
  const slideIndex = parseInt(slide.dataset.slideIndex, 10);
  block.dataset.activeSlide = slideIndex;
  block.classList.add('glass-bg');

  const slides = block.querySelectorAll('.carousel-slide');

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

  const indicators = block.querySelectorAll('.carousel-slide-indicator');
  indicators.forEach((indicator, idx) => {
    if (idx !== slideIndex) {
      indicator.querySelector('button').removeAttribute('disabled');
    } else {
      indicator.querySelector('button').setAttribute('disabled', 'true');
    }
  });
}

function showSlide(block, slideIndex = 0) {
  const slides = block.querySelectorAll('.carousel-slide');
  let realSlideIndex = slideIndex < 0 ? slides.length - 1 : slideIndex;
  if (slideIndex >= slides.length) realSlideIndex = 0;
  const activeSlide = slides[realSlideIndex];

  activeSlide.querySelectorAll('a').forEach((link) => link.removeAttribute('tabindex'));
  block.querySelector('.carousel-slides').scrollTo({
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

  const slideIndicators = block.querySelector('.carousel-slide-indicators');
  if (!slideIndicators) return;

  slideIndicators.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', (e) => {
      const slideIndicator = e.currentTarget.parentElement;
      showSlide(block, parseInt(slideIndicator.dataset.targetSlide, 10));
    });
  });

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
  block.querySelectorAll('.carousel-slide').forEach((slide) => {
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
  slide.setAttribute('id', `carousel-${carouselId}-slide-${slideIndex}`);
  slide.classList.add('carousel-slide');

  row.classList.add('carousel-slide-image');
  slide.append(row.cloneNode(true));

  return slide;
}

let carouselId = 0;
export default async function decorate(block) {
  carouselId += 1;
  block.setAttribute('id', `carousel-${carouselId}`);
  const rows = block.querySelectorAll('picture');
  const isSingleSlide = rows.length < 2;

  const placeholders = await fetchPlaceholders();

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', placeholders.carousel || 'Carousel');

  const container = document.createElement('div');
  container.classList.add('carousel-slides-container');

  const slidesWrapper = document.createElement('ul');
  slidesWrapper.classList.add('carousel-slides');
  block.prepend(slidesWrapper);

  let slideIndicators;
  if (!isSingleSlide) {
    const slideIndicatorsNav = document.createElement('nav');
    slideIndicatorsNav.setAttribute(
      'aria-label',
      placeholders.carouselSlideControls || 'Carousel Slide Controls',
    );
    slideIndicators = document.createElement('ol');
    slideIndicators.classList.add('carousel-slide-indicators');
    slideIndicatorsNav.append(slideIndicators);
    block.append(slideIndicatorsNav);

    const slideNavButtons = document.createElement('div');
    slideNavButtons.classList.add('carousel-navigation-buttons');
    slideNavButtons.innerHTML = `<div class="button-container">
      <div type="button" tabindex="0" class="slide-prev carousel-button hex" aria-label="${
        placeholders.previousSlide || 'Previous Slide'
      }"><span class="icon icon-chevron-left"><img data-icon-name="chevron-left" alt="chevron-left-icon" src="/icons/chevron-left.svg" loading="lazy"></span></div></div>
      <div class="button-container"><div type="button" tabindex="0" class="slide-next carousel-button hex" aria-label="${
        placeholders.nextSlide || 'Next Slide'
      }"><span class="icon icon-chevron-right"><img data-icon-name="chevron-right" alt="chevron-right-icon" src="/icons/chevron-right.svg" loading="lazy"></span></div></div>
    `;

    container.append(slideNavButtons);
  }

  rows.forEach((row, idx) => {
    const slide = createSlide(row, idx, carouselId);
    slidesWrapper.append(slide);

    if (slideIndicators) {
      const indicator = document.createElement('li');
      indicator.classList.add('carousel-slide-indicator');
      indicator.dataset.targetSlide = idx;
      indicator.innerHTML = `<button type="button" class="hex"><span>${
        placeholders.showSlide || 'Show Slide'
      } ${idx + 1} ${placeholders.of || 'of'} ${rows.length}</span></button>`;
      slideIndicators.append(indicator);
    }
    row.remove();
  });

  container.append(slidesWrapper);
  block.prepend(container);

  if (!isSingleSlide) {
    bindEvents(block);
  }

  // Removes all div's without a class, that will cleanup everything that's not a picture
  block.querySelectorAll('div:not([class])').forEach((div) => div.remove());
}
