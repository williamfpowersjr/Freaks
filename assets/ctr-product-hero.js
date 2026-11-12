const CTR_OTP_SELECTOR = '[data-ctr-otp-atc]';

const getShopifyRoot = () => window?.Shopify?.routes?.root || '/';

const getFormForTrigger = (trigger) =>
  trigger.closest('form') || trigger.closest('product-form')?.querySelector('form');

const getOtpPayload = (form) => {
  const variantInput = form.querySelector('input[name="id"]');
  const quantityInput = form.querySelector('input[name="quantity"]');
  const variantId = Number(variantInput?.value);
  const quantity = Number(quantityInput?.value) || 1;

  if (!variantId) return null;

  return {
    items: [
      {
        id: variantId,
        quantity,
      },
    ],
  };
};

const setTriggerBusy = (trigger, isBusy) => {
  trigger.disabled = isBusy;
  trigger.setAttribute('aria-busy', isBusy ? 'true' : 'false');
};

const addOtpToCart = (form, payload, trigger) => {
  setTriggerBusy(trigger, true);

  const finish = () => setTriggerBusy(trigger, false);

  if (window.liquidAjaxCart?.add) {
    window.liquidAjaxCart.add(payload, {
      lastCallback: (requestState) => {
        finish();
        if (requestState.responseData && requestState.responseData.ok === false) {
          const body = requestState.responseData.body || {};
          const message = body.description || body.message || "Sorry, this couldn't be added to your cart.";
          const errorEl = form.querySelector('[data-ajax-cart-errors="form"]');
          if (errorEl) errorEl.textContent = message;
        }
      },
    });
    return;
  }

  fetch(`${getShopifyRoot()}cart/add.js`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    credentials: 'same-origin',
  })
    .then((response) => {
      if (!response.ok) throw new Error('Failed to add item to cart');
      document.querySelector('cart-drawer-element')?.openCartDrawer?.();
    })
    .catch((error) => {
      console.error('ctr-product-hero one-time add failed', error);
    })
    .finally(finish);
};

const keepSubscriptionUiActive = (form) => {
  const root = form.closest('product-form-subscriptions') || form;
  root.classList.add('js-subscription-active');
  root.classList.remove('js-one-time-active');

  const subscriptionRadio = form.querySelector("[id^='selling_plan_subscription']");
  if (subscriptionRadio) subscriptionRadio.checked = true;

  form.querySelectorAll("select[id^='selling_plan']").forEach((select) => {
    select.disabled = false;
  });

  form.querySelectorAll('[data-plan-trigger]').forEach((trigger) => {
    trigger.disabled = false;
  });
};

const handleOtpClick = (event) => {
  const trigger = event.target.closest(CTR_OTP_SELECTOR);
  if (!trigger) return;

  event.preventDefault();
  event.stopPropagation();

  if (trigger.disabled) return;

  const form = getFormForTrigger(trigger);
  if (!(form instanceof HTMLFormElement)) return;

  const payload = getOtpPayload(form);
  if (!payload) return;

  keepSubscriptionUiActive(form);
  addOtpToCart(form, payload, trigger);
};

document.addEventListener('click', handleOtpClick);

const initCtrProductHero = () => {
  document.querySelectorAll(CTR_OTP_SELECTOR).forEach((trigger) => {
    trigger.setAttribute('data-ctr-otp-ready', 'true');
  });
};

initCtrProductHero();

document.addEventListener('shopify:section:load', initCtrProductHero);
document.addEventListener('shopify:section:reorder', initCtrProductHero);
document.addEventListener('shopify:section:select', initCtrProductHero);
document.addEventListener('shopify:section:deselect', initCtrProductHero);
