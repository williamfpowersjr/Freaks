class CtrMeetTheScents extends HTMLElement {
  connectedCallback() {
    if (this._initialized) return;
    this._initialized = true;

    this.interaction = this.dataset.interaction || 'both';
    this.bottles = Array.from(this.querySelectorAll('.ctr-meet-the-scents__bottle'));
    this.indexedEls = Array.from(this.querySelectorAll('[data-scent-index]'));
    this.hoverQuery = window.matchMedia('(hover: hover) and (pointer: fine)');

    this.clickHandler = this.handleClick.bind(this);
    this.enterHandler = this.handleEnter.bind(this);
    this.focusHandler = this.handleFocus.bind(this);
    this.blockSelectHandler = this.handleBlockSelect.bind(this);

    this.bindEvents();
  }

  disconnectedCallback() {
    this.unbindEvents();
    this._initialized = false;
  }

  bindEvents() {
    this.bottles.forEach((bottle) => {
      bottle.addEventListener('click', this.clickHandler);
      bottle.addEventListener('mouseenter', this.enterHandler);
      bottle.addEventListener('focus', this.focusHandler);
    });

    document.addEventListener('shopify:block:select', this.blockSelectHandler);
  }

  unbindEvents() {
    this.bottles.forEach((bottle) => {
      bottle.removeEventListener('click', this.clickHandler);
      bottle.removeEventListener('mouseenter', this.enterHandler);
      bottle.removeEventListener('focus', this.focusHandler);
    });

    document.removeEventListener('shopify:block:select', this.blockSelectHandler);
  }

  // Touch devices can't hover, so they always get tap regardless of the setting.
  get canHover() {
    return this.hoverQuery.matches;
  }

  handleClick(event) {
    if (this.interaction === 'hover' && this.canHover) return;
    this.select(Number(event.currentTarget.dataset.scentIndex));
  }

  handleEnter(event) {
    if (this.interaction === 'click' || !this.canHover) return;
    this.select(Number(event.currentTarget.dataset.scentIndex));
  }

  handleFocus(event) {
    if (!event.currentTarget.matches(':focus-visible')) return;
    this.select(Number(event.currentTarget.dataset.scentIndex));
  }

  handleBlockSelect(event) {
    const bottle = this.bottles.find((el) => el.dataset.blockId === event.detail.blockId);
    if (bottle) this.select(Number(bottle.dataset.scentIndex));
  }

  select(index) {
    if (Number.isNaN(index) || index === Number(this.dataset.activeIndex)) return;

    this.dataset.activeIndex = String(index);
    this.classList.remove('is-idle');

    this.indexedEls.forEach((el) => {
      el.classList.toggle('is-active', Number(el.dataset.scentIndex) === index);
    });

    this.bottles.forEach((bottle) => {
      bottle.setAttribute('aria-pressed', String(Number(bottle.dataset.scentIndex) === index));
    });
  }
}

if (!customElements.get('ctr-meet-the-scents')) {
  customElements.define('ctr-meet-the-scents', CtrMeetTheScents);
}
