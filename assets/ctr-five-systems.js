class CtrFiveSystems extends HTMLElement {
  connectedCallback() {
    if (this._initialized) return;
    this._initialized = true;

    this.formSubmitHandler = this.handleFormSubmit.bind(this);
    this.videoPlayHandler = this.handleVideoPlay.bind(this);
    this.bindFormEvents();
    this.bindVideoEvents();
  }

  disconnectedCallback() {
    this.unbindFormEvents();
    this.unbindVideoEvents();
    this._initialized = false;
  }

  bindFormEvents() {
    this.querySelectorAll('.ctr-five-systems__product-atc-form').forEach((form) => {
      form.addEventListener('submit', this.formSubmitHandler);
    });
  }

  unbindFormEvents() {
    this.querySelectorAll('.ctr-five-systems__product-atc-form').forEach((form) => {
      form.removeEventListener('submit', this.formSubmitHandler);
    });
  }

  bindVideoEvents() {
    this.querySelectorAll('.ctr-five-systems__hero-video').forEach((video) => {
      video.addEventListener('play', this.videoPlayHandler);
    });
  }

  unbindVideoEvents() {
    this.querySelectorAll('.ctr-five-systems__hero-video').forEach((video) => {
      video.removeEventListener('play', this.videoPlayHandler);
    });
  }

  handleVideoPlay(event) {
    const activeVideo = event.currentTarget;
    if (!(activeVideo instanceof HTMLVideoElement)) return;

    document.querySelectorAll('video').forEach((video) => {
      if (video !== activeVideo) {
        video.pause();
      }
    });
  }

  async handleFormSubmit(event) {
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
      console.error('ctr-five-systems add to cart failed', error);
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.removeAttribute('aria-busy');
      }
    }
  }
}

if (!customElements.get('ctr-five-systems')) {
  customElements.define('ctr-five-systems', CtrFiveSystems);
}

const initCtrFiveSystems = (container) => {
  if (!container || typeof container.querySelectorAll !== 'function') return;

  container.querySelectorAll('ctr-five-systems').forEach((section) => {
    if (typeof section.connectedCallback === 'function') {
      section.connectedCallback();
    }
  });
};

document.addEventListener('shopify:section:load', (event) => {
  initCtrFiveSystems(event.target);
});

document.addEventListener('shopify:section:reorder', (event) => {
  initCtrFiveSystems(event.target);
});

document.addEventListener('shopify:section:select', (event) => {
  initCtrFiveSystems(event.target);
});

document.addEventListener('shopify:section:deselect', (event) => {
  initCtrFiveSystems(event.target);
});
