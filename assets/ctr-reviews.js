class CtrReviews extends HTMLElement {
  connectedCallback() {
    if (this._initialized) return;
    this._initialized = true;

    this.tabs = Array.from(this.querySelectorAll('[data-ctr-reviews-tab]'));
    this.slides = Array.from(this.querySelectorAll('.ctr-reviews__slide'));
    this.swiperHost = this.querySelector('.ctr-reviews__swiper');
    this.swiperEl = this.querySelector('swiper-container');
    this.videos = Array.from(this.querySelectorAll('video'));

    this.tabClickHandler = this.handleTabClick.bind(this);
    this.videoPlayHandler = this.handleVideoPlay.bind(this);

    this.bindEvents();
    this.initSwiper();
  }

  disconnectedCallback() {
    this.unbindEvents();
    this._initialized = false;
  }

  async initSwiper() {
    if (!this.swiperEl || !this.swiperHost) return;

    await customElements.whenDefined('swiper-container');
    await new Promise((resolve) => requestAnimationFrame(() => resolve()));

    if (typeof this.swiperEl.initialize !== 'function') {
      await new Promise((resolve) => requestAnimationFrame(() => resolve()));
    }

    if (this.swiperEl.swiper) return;

    const swiperId = this.swiperHost.id;

    Object.assign(this.swiperEl, {
      slidesPerView: 'auto',
      spaceBetween: 12,
      keyboard: true,
      slidesOffsetBefore: 20,
      slidesOffsetAfter: 20,

      breakpoints: {
        1024: {
          spaceBetween: 20,
          slidesOffsetBefore: 0,
          slidesOffsetAfter: 0,
        },
      },
      navigation: {
        nextEl: `#${swiperId} .swiper-button-next`,
        prevEl: `#${swiperId} .swiper-button-prev`,
      },
      scrollbar: {
        el: `#${swiperId} .swiper-scrollbar`,
      },
    });

    this.swiperEl.initialize();
  }

  bindEvents() {
    this.tabs.forEach((tab) => {
      tab.addEventListener('click', this.tabClickHandler);
    });

    this.videos.forEach((video) => {
      video.addEventListener('play', this.videoPlayHandler);
    });
  }

  unbindEvents() {
    this.tabs.forEach((tab) => {
      tab.removeEventListener('click', this.tabClickHandler);
    });

    this.videos.forEach((video) => {
      video.removeEventListener('play', this.videoPlayHandler);
    });
  }

  handleTabClick(event) {
    const tab = event.currentTarget;
    if (!(tab instanceof HTMLElement)) return;

    const category = tab.dataset.category || '';
    this.setActiveCategory(category);
  }

  handleVideoPlay(event) {
    const current = event.currentTarget;
    if (!(current instanceof HTMLVideoElement)) return;

    document.querySelectorAll('video').forEach((video) => {
      if (video !== current) {
        video.pause();
      }
    });
  }

  setActiveCategory(category) {
    this.tabs.forEach((tab) => {
      const isActive = tab.dataset.category === category;
      tab.classList.toggle('is-active', isActive);
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    this.pauseAllVideos();

    this.slides.forEach((slide) => {
      const matches = !category || slide.dataset.category === category;
      slide.classList.toggle('ctr-reviews__slide--hidden', !matches);
    });

    this.refreshSwiper();
  }

  pauseAllVideos() {
    this.videos.forEach((video) => {
      video.pause();
      video.currentTime = 0;
    });
  }

  refreshSwiper() {
    const swiper = this.swiperEl?.swiper;
    if (!swiper) {
      window.requestAnimationFrame(() => {
        const delayedSwiper = this.swiperEl?.swiper;
        if (!delayedSwiper) return;
        delayedSwiper.update();
        delayedSwiper.slideTo(0, 0);
      });
      return;
    }

    swiper.update();
    swiper.slideTo(0, 0);
  }
}

if (!customElements.get('ctr-reviews')) {
  customElements.define('ctr-reviews', CtrReviews);
}

const initCtrReviews = (container) => {
  if (!container || typeof container.querySelectorAll !== 'function') return;

  container.querySelectorAll('ctr-reviews').forEach((section) => {
    if (typeof section.connectedCallback === 'function') {
      section.connectedCallback();
    }
  });
};

document.addEventListener('shopify:section:load', (event) => {
  initCtrReviews(event.target);
});

document.addEventListener('shopify:section:reorder', (event) => {
  initCtrReviews(event.target);
});

document.addEventListener('shopify:section:select', (event) => {
  initCtrReviews(event.target);
});

document.addEventListener('shopify:section:deselect', (event) => {
  initCtrReviews(event.target);
});
