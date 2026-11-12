class CtrProductShowcase extends HTMLElement {
  connectedCallback() {
    if (this.initialized) return;
    this.initialized = true;
    const configuredDurationHours = Number.parseInt(this.dataset.timerDurationHours || '24', 10);
    const configuredDurationMinutes = Number.parseInt(this.dataset.timerDurationMinutes || '0', 10);
    const safeDurationHours = Number.isFinite(configuredDurationHours) && configuredDurationHours > 0
      ? configuredDurationHours
      : 0;
    const safeDurationMinutes = Number.isFinite(configuredDurationMinutes) && configuredDurationMinutes >= 0
      ? Math.min(configuredDurationMinutes, 59)
      : 0;
    const computedTimerDurationSeconds = (safeDurationHours * 60 * 60) + (safeDurationMinutes * 60);
    this.timerDurationSeconds = computedTimerDurationSeconds > 0 ? computedTimerDurationSeconds : 24 * 60 * 60;
    this.shouldShowHours = this.timerDurationSeconds > (60 * 60);

    this.mediaItems = Array.from(this.querySelectorAll('[data-ctr-media-item]'));
    this.thumbs = Array.from(this.querySelectorAll('[data-ctr-thumb]'));
    this.videos = Array.from(this.querySelectorAll('video'));
    this.addToCartForms = Array.from(this.querySelectorAll('[data-ctr-product-showcase-atc-form]'));
    this.timerValues = {
      hours: Array.from(this.querySelectorAll('[data-ctr-product-showcase-timer-value="hours"]')),
      minutes: Array.from(this.querySelectorAll('[data-ctr-product-showcase-timer-value="minutes"]')),
      seconds: Array.from(this.querySelectorAll('[data-ctr-product-showcase-timer-value="seconds"]')),
    };
    this.timerSegments = {
      hours: Array.from(this.querySelectorAll('[data-ctr-product-showcase-timer-segment="hours"]')),
    };
    this.timerSegments.hours.forEach((node) => {
      node.hidden = !this.shouldShowHours;
      node.setAttribute('aria-hidden', this.shouldShowHours ? 'false' : 'true');
    });

    this.thumbHandlers = [];
    this.videoPlayHandlers = [];
    this.formSubmitHandlers = [];

    this.bindThumbs();
    this.bindVideos();
    this.bindAddToCartForms();
    this.bindTimer();
  }

  disconnectedCallback() {
    if (!this.initialized) return;

    this.thumbHandlers.forEach(({ thumb, handler }) => thumb.removeEventListener('click', handler));
    this.videoPlayHandlers.forEach(({ video, handler }) => video.removeEventListener('play', handler));
    this.formSubmitHandlers.forEach(({ form, handler }) => form.removeEventListener('submit', handler));

    this.thumbHandlers = [];
    this.videoPlayHandlers = [];
    this.formSubmitHandlers = [];
    if (this.timerIntervalId) {
      window.clearInterval(this.timerIntervalId);
      this.timerIntervalId = null;
    }
    this.initialized = false;
  }

  bindThumbs() {
    if (!this.thumbs.length || !this.mediaItems.length) return;

    this.thumbs.forEach((thumb) => {
      const handler = () => {
        const { mediaId } = thumb.dataset;
        this.activateMedia(mediaId);
      };

      thumb.addEventListener('click', handler);
      this.thumbHandlers.push({ thumb, handler });
    });
  }

  bindVideos() {
    if (!this.videos.length) return;

    this.videos.forEach((video) => {
      const handler = () => {
        this.pauseOtherVideos(video);
      };

      video.addEventListener('play', handler);
      this.videoPlayHandlers.push({ video, handler });
    });
  }

  bindAddToCartForms() {
    if (!this.addToCartForms.length) return;

    this.addToCartForms.forEach((form) => {
      const handler = (event) => this.handleAddToCart(event);
      form.addEventListener('submit', handler);
      this.formSubmitHandlers.push({ form, handler });
    });
  }

  bindTimer() {
    if (!this.timerValues.hours.length && !this.timerValues.minutes.length && !this.timerValues.seconds.length) return;

    this.updateTimer();
    this.timerIntervalId = window.setInterval(() => {
      this.updateTimer();
    }, 1000);
  }

  updateTimer() {
    const timerDurationSeconds = this.timerDurationSeconds || 24 * 60 * 60;
    const nowInSeconds = Math.floor(Date.now() / 1000);
    const elapsedInCycle = nowInSeconds % timerDurationSeconds;
    const secondsUntilReset = timerDurationSeconds - elapsedInCycle;
    const hours = Math.floor(secondsUntilReset / 3600);
    const minutes = this.shouldShowHours
      ? Math.floor((secondsUntilReset % 3600) / 60)
      : Math.floor(secondsUntilReset / 60);
    const seconds = secondsUntilReset % 60;
    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');

    this.timerValues.hours.forEach((node) => {
      node.textContent = formattedHours;
    });
    this.timerValues.minutes.forEach((node) => {
      node.textContent = formattedMinutes;
    });
    this.timerValues.seconds.forEach((node) => {
      node.textContent = formattedSeconds;
    });
  }

  activateMedia(mediaId) {
    if (!mediaId) return;

    this.mediaItems.forEach((item) => {
      const isActive = item.dataset.mediaId === mediaId;
      item.classList.toggle('is-active', isActive);

      if (!isActive) {
        const itemVideo = item.querySelector('video');
        if (itemVideo) itemVideo.pause();
      }
    });

    this.thumbs.forEach((thumb) => {
      thumb.classList.toggle('is-active', thumb.dataset.mediaId === mediaId);
    });
  }

  pauseOtherVideos(activeVideo) {
    document.querySelectorAll('video').forEach((video) => {
      if (video !== activeVideo) {
        video.pause();
      }
    });
  }

  async handleAddToCart(event) {
    event.preventDefault();
    event.stopPropagation();

    const form = event.currentTarget;
    if (!(form instanceof HTMLFormElement)) return;

    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton && submitButton.disabled) return;

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.setAttribute('aria-busy', 'true');
    }

    try {
      const root = window?.Shopify?.routes?.root || '/';
      const response = await fetch(`${root}cart/add.js`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
        body: new FormData(form),
        credentials: 'same-origin',
      });

      if (!response.ok) {
        throw new Error('Failed to add item to cart');
      }

      // The drawer owns the open; cart-controller's fetch watcher re-syncs it.
      document.querySelector('cart-drawer-element')?.openCartDrawer?.();
    } catch (error) {
      console.error('ctr-product-showcase add to cart failed', error);
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.removeAttribute('aria-busy');
      }
    }
  }
}

if (!customElements.get('ctr-product-showcase')) {
  customElements.define('ctr-product-showcase', CtrProductShowcase);
}

const initCtrProductShowcase = (container) => {
  if (!container || typeof container.querySelectorAll !== 'function') return;

  container.querySelectorAll('ctr-product-showcase').forEach((section) => {
    if (typeof section.connectedCallback === 'function') {
      section.connectedCallback();
    }
  });
};

document.addEventListener('shopify:section:load', (event) => {
  initCtrProductShowcase(event.target);
});

document.addEventListener('shopify:section:reorder', (event) => {
  initCtrProductShowcase(event.target);
});

document.addEventListener('shopify:section:select', (event) => {
  initCtrProductShowcase(event.target);
});

document.addEventListener('shopify:section:deselect', (event) => {
  initCtrProductShowcase(event.target);
});
