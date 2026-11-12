class ProductCarouselElement extends HTMLElement {
  connectedCallback() {
    if (this._initialized) return;
    this._initialized = true;

    this.handleFormClick = this.handleFormClick.bind(this);
    this.formSubmitHandler = this.handleFormSubmit.bind(this);
    this.bindFormEvents();
  }

  disconnectedCallback() {
    this.unbindFormEvents();
    this._initialized = false;
  }

  bindFormEvents() {
    this.querySelectorAll('.product-card-atc-form').forEach((form) => {
      form.addEventListener('click', this.handleFormClick);
      form.addEventListener('submit', this.formSubmitHandler);
    });
  }

  unbindFormEvents() {
    this.querySelectorAll('.product-card-atc-form').forEach((form) => {
      form.removeEventListener('click', this.handleFormClick);
      form.removeEventListener('submit', this.formSubmitHandler);
    });
  }

  handleFormClick(event) {
    event.stopPropagation();
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
      console.error('product-carousel add to cart failed', error);
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.removeAttribute('aria-busy');
      }
    }
  }
}

if (!customElements.get('product-carousel-element')) {
  customElements.define('product-carousel-element', ProductCarouselElement);
}

const initProductCarousel = (container) => {
  if (!container || typeof container.querySelectorAll !== 'function') return;

  container.querySelectorAll('product-carousel-element').forEach((section) => {
    if (typeof section.connectedCallback === 'function') {
      section.connectedCallback();
    }
  });
};

document.addEventListener('shopify:section:load', (event) => {
  initProductCarousel(event.target);
});

document.addEventListener('shopify:section:reorder', (event) => {
  initProductCarousel(event.target);
});

document.addEventListener('shopify:section:select', (event) => {
  initProductCarousel(event.target);
});

document.addEventListener('shopify:section:deselect', (event) => {
  initProductCarousel(event.target);
});
