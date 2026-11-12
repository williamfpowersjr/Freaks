// Fills the {amount} token in the free-shipping claim with this market's Intelligems
// threshold (same source as the cart drawer's trust badges), falling back to the
// editor amount already rendered server-side.
class CtrBuyBoxMiniKit extends HTMLElement {
  connectedCallback() {
    if (this._initialized) return;
    this._initialized = true;

    this.claims = Array.from(this.querySelectorAll('[data-free-shipping-claim]'));
    if (!this.claims.length) return;

    this.applyHandler = this.applyFreeShippingClaims.bind(this);
    window.addEventListener('ig:ready', this.applyHandler);
    this.applyFreeShippingClaims();
  }

  disconnectedCallback() {
    if (this.applyHandler) window.removeEventListener('ig:ready', this.applyHandler);
    this._initialized = false;
  }

  freeShippingThresholdCents() {
    const offersApi = window.igData && window.igData.offers;
    if (!offersApi || typeof offersApi.getAll !== 'function') return null;

    let lowestCents = null;
    try {
      for (const entry of offersApi.getAll()) {
        const offer = (entry && entry.offer) || entry;
        const discount = (offer && offer.discount) || offer;
        if (!discount || discount.enabled === false) continue;
        const unitType = discount.unitType || (offer && offer.unitType);
        if (unitType && unitType !== 'dollar') continue;
        for (const tier of discount.tiers || []) {
          if (!tier || tier.isFreeShipping !== true || typeof tier.minimumUnits !== 'number') continue;
          const cents = Math.round(tier.minimumUnits * 100);
          if (lowestCents == null || cents < lowestCents) lowestCents = cents;
        }
      }
    } catch (error) {
      return null;
    }
    return lowestCents;
  }

  formatAmount(cents) {
    const units = cents / 100;
    try {
      const currency = (window.Shopify && window.Shopify.currency && window.Shopify.currency.active) || 'USD';
      return new Intl.NumberFormat(document.documentElement.lang || 'en', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
      }).format(units);
    } catch (error) {
      return `$${units}`;
    }
  }

  applyFreeShippingClaims() {
    const cents = this.freeShippingThresholdCents();
    if (cents == null) return;

    const amount = this.formatAmount(cents);
    this.claims.forEach((claim) => {
      const text = claim.querySelector('[data-free-shipping-text]');
      if (text) text.textContent = (text.dataset.claimTemplate || '').replace('{amount}', amount);
    });
  }
}

if (!customElements.get('ctr-buy-box-mini-kit')) {
  customElements.define('ctr-buy-box-mini-kit', CtrBuyBoxMiniKit);
}
