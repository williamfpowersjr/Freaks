/*
 * Ocean Works impact banner (drawer cart).
 * Fetches the OW shop config + live cart and renders the plastic-collection
 * message into #ow-cart-banner-id. Hardened from the vendor original:
 *  - Null-safe: the banner isn't rendered on empty/wholesale carts — bail
 *    instead of crashing on getElementById(...).innerHTML.
 *  - Market-aware money: OW config amounts are in the shop's base currency
 *    (USD); cart totals are in the shopper's presentment currency. Convert via
 *    Shopify.currency.rate and format in the active currency.
 *  - No blink: ajax cart re-renders replace the banner subtree with empty
 *    markup; the last rendered state is cached and re-applied instantly on
 *    liquid-ajax-cart:request-end, then refreshed from the live data.
 */
(function () {
  var lastState = null;

  function getBannerEls() {
    var banner = document.getElementById('ow-cart-banner-id');
    var title = document.getElementById('ow-cart-title-id');
    var description = document.getElementById('ow-cart-description-id');
    return banner && title && description ? { banner: banner, title: title, description: description } : null;
  }

  function applyState(els, state) {
    if (!state || !state.show) {
      els.banner.style.display = 'none';
      return;
    }
    els.title.textContent = state.title;
    els.banner.style.display = 'flex';
    if (state.description) {
      els.description.textContent = state.description;
      els.description.style.display = 'block';
    } else {
      els.description.style.display = 'none';
    }
  }

  /* Formats an amount given in the shop's base currency, converted to and
     labelled with the shopper's presentment currency. */
  function formatMoney(shopAmount, active, rate) {
    var presented = shopAmount * rate;
    try {
      return new Intl.NumberFormat(undefined, { style: 'currency', currency: active }).format(presented);
    } catch (e) {
      return '$' + presented.toFixed(2);
    }
  }

  function getImpactConfig() {
    var els = getBannerEls();
    if (!els) return; // empty/wholesale carts render no banner

    var root = (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || '/';
    Promise.all([
      fetch(root + 'cart.js').then(function (r) {
        return r.json();
      }),
      fetch('/apps/impact-config/api/shop-config', { cache: 'no-store' }).then(function (r) {
        return r.json();
      }),
    ])
      .then(function (results) {
        var cartData = results[0];
        var body = results[1];
        var els2 = getBannerEls();
        if (!els2) return; // re-rendered away (cart emptied) while fetching

        if (body.appStatus !== 'ACTIVE') {
          lastState = { show: false };
          applyState(els2, lastState);
          return;
        }

        var currency = (window.Shopify && window.Shopify.currency) || {};
        var active = currency.active || 'USD';
        var rate = parseFloat(currency.rate) || 1;

        var minSpend = Number(body.everyOrderMinimumSpend) || 0;
        var cartTotalShop = cartData.total_price / 100 / rate;
        var isAboveMinimum = !minSpend || cartTotalShop > minSpend;
        var lbs = body.everyOrderQuantity != null ? String(body.everyOrderQuantity) : '';

        var state = { show: true };
        if (isAboveMinimum) {
          state.title = lbs + ' lbs of plastic will be collected with this order';
          state.description = '';
        } else {
          state.title =
            'Spend an additional ' +
            formatMoney(minSpend - cartTotalShop, active, rate) +
            ' and we will collect ' +
            lbs +
            ' lbs of plastic waste.';
          state.description =
            'When your cart total reaches ' +
            formatMoney(minSpend, active, rate) +
            ' we will fund the removal of ' +
            lbs +
            ' lbs of plastic waste.';
        }
        lastState = state;
        applyState(els2, state);
      })
      .catch(function () {
        /* OW app/config unreachable — leave the banner hidden */
      });
  }

  /* Fires after every liquid-ajax-cart DOM swap (including third-party cart
     mutations, which cart-controller routes back through the library). Re-apply
     the cached state instantly — the swap rendered the banner empty. */
  document.addEventListener('liquid-ajax-cart:request-end', function () {
    var els = getBannerEls();
    if (els && lastState) applyState(els, lastState);
    getImpactConfig();
  });

  getImpactConfig();
})();
