class CtrStickyAtc extends HTMLElement {
  connectedCallback() {
    if (this._initialized) return;
    this._initialized = true;

    this.onScroll = this.onScroll.bind(this);
    this.onResize = this.onResize.bind(this);
    this.footerElement = document.querySelector('[data-footer], footer');
    this.triggerElement =
      this.closest('.ctr-sticky-atc-section') ||
      this.closest('.shopify-section') ||
      this.parentElement;

    window.addEventListener('scroll', this.onScroll, { passive: true });
    window.addEventListener('resize', this.onResize);

    this.updateStickyState();
    this.setAttribute('data-ready', 'true');
  }

  disconnectedCallback() {
    window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('resize', this.onResize);

    this._initialized = false;
  }

  onScroll() {
    if (this._scrollTicking) return;

    this._scrollTicking = true;
    requestAnimationFrame(() => {
      this.updateStickyState();
      this._scrollTicking = false;
    });
  }

  onResize() {
    this.updateStickyState();
  }

  updateStickyState() {
    if (!this.triggerElement) return;

    const anchorTop = this.triggerElement.getBoundingClientRect().top + window.scrollY;
    const viewportBottom = window.scrollY + window.innerHeight;
    const footerRect = this.footerElement ? this.footerElement.getBoundingClientRect() : null;
    const isFooterInView = footerRect ? footerRect.top <= window.innerHeight : false;
    const shouldFix = viewportBottom >= anchorTop && !isFooterInView;

    if (shouldFix) {
      if (!this.classList.contains('is-fixed')) {
        this.classList.add('is-fixed');
      }
      return;
    }

    if (this.classList.contains('is-fixed')) {
      this.classList.remove('is-fixed');
    }
  }
}

if (!customElements.get('ctr-sticky-atc')) {
  customElements.define('ctr-sticky-atc', CtrStickyAtc);
}

const initCtrStickyAtc = (container) => {
  if (!container || typeof container.querySelectorAll !== 'function') return;

  container.querySelectorAll('ctr-sticky-atc').forEach((section) => {
    if (typeof section.connectedCallback === 'function') {
      section.connectedCallback();
    }
  });
};

document.addEventListener('shopify:section:load', (event) => {
  initCtrStickyAtc(event.target);
});

document.addEventListener('shopify:section:reorder', (event) => {
  initCtrStickyAtc(event.target);
});

document.addEventListener('shopify:section:select', (event) => {
  initCtrStickyAtc(event.target);
});

document.addEventListener('shopify:section:deselect', (event) => {
  initCtrStickyAtc(event.target);
});
