// Browser mode: unlocks when the typed password's SHA-256 matches data-hash (asked on every load).
// Server mode: saves the passcode on the cart and reloads; Liquid decides whether the page is sent.
class CtrPasswordGate extends HTMLElement {
  connectedCallback() {
    if (this._initialized) return;
    this._initialized = true;

    this.storageKey = this.dataset.key;
    this.isServer = this.dataset.mode === 'server';
    document.documentElement.classList.add('ctr-pwg-locked');
    this.form = this.querySelector('form');
    this.input = this.querySelector('input');
    this.error = this.querySelector('.ctr-pwg__error');
    this.onSubmit = this.handleSubmit.bind(this);
    this.form.addEventListener('submit', this.onSubmit);
    this.prefillFromUrl();
    if (this.isServer) this.showServerError();
    this.input.focus();
  }

  disconnectedCallback() {
    if (this.form) this.form.removeEventListener('submit', this.onSubmit);
    this._initialized = false;
  }

  // Email links can carry ?access=<password>; it is only prefilled, the visitor still submits.
  prefillFromUrl() {
    const value = new URLSearchParams(window.location.search).get('access');
    if (value) this.input.value = value;
  }

  async hash(value) {
    const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
    return Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, '0')).join('');
  }

  // Server mode: a reload that is still locked after a submit means the passcode was wrong.
  showServerError() {
    try {
      if (sessionStorage.getItem(`${this.storageKey}-tried`)) {
        sessionStorage.removeItem(`${this.storageKey}-tried`);
        this.error.hidden = false;
      }
    } catch (error) {}
  }

  // Server mode: save the passcode on the cart so Liquid can check it, then reload.
  async submitToServer(value) {
    this.form.querySelector('button').disabled = true;
    try {
      sessionStorage.setItem(`${this.storageKey}-tried`, '1');
    } catch (error) {}
    try {
      await fetch(`${window.Shopify?.routes?.root || '/'}cart/update.js`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attributes: { _pwg: value } }),
      });
    } finally {
      window.location.reload();
    }
  }

  async handleSubmit(event) {
    event.preventDefault();
    const value = this.input.value.trim();
    if (this.isServer) {
      if (value) await this.submitToServer(value);
      return;
    }
    if (value && (await this.hash(value)) === this.dataset.hash) {
      this.unlock();
      return;
    }
    this.error.hidden = false;
    this.input.select();
  }

  unlock() {
    document.documentElement.classList.remove('ctr-pwg-locked');
    this.hidden = true;
  }
}

if (!customElements.get('ctr-password-gate')) {
  customElements.define('ctr-password-gate', CtrPasswordGate);
}
