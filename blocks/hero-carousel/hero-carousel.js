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
    slide.append(column);
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
  const isSingleSlide = rows.length < 2;

  const placeholders = await fetchPlaceholders();

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', placeholders.heroCarousel || 'Carousel');

  const container = document.createElement('div');
  container.classList.add('hero-carousel-slides-container');

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

  rows.forEach((row, idx) => {
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
