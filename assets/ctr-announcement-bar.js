class CtrAnnouncementBar extends HTMLElement {
  connectedCallback() {
    if (this.intervalId) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this._initialized = true;
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
    this.timerValues = {
      hours: Array.from(this.querySelectorAll('[data-ctr-announcement-timer-value="hours"]')),
      minutes: Array.from(this.querySelectorAll('[data-ctr-announcement-timer-value="minutes"]')),
      seconds: Array.from(this.querySelectorAll('[data-ctr-announcement-timer-value="seconds"]')),
    };
    this.timerSegments = {
      hours: Array.from(this.querySelectorAll('[data-ctr-announcement-timer-segment="hours"]')),
    };
    this.timerSegments.hours.forEach((node) => {
      node.hidden = !this.shouldShowHours;
      node.setAttribute('aria-hidden', this.shouldShowHours ? 'false' : 'true');
    });
    if (!this.timerValues.hours.length && !this.timerValues.minutes.length && !this.timerValues.seconds.length) return;
    this.updateTimer();
    this.intervalId = window.setInterval(() => {
      this.updateTimer();
    }, 1000);
  }

  disconnectedCallback() {
    if (this.intervalId) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this._initialized = false;
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
}

if (!customElements.get('ctr-announcement-bar')) {
  customElements.define('ctr-announcement-bar', CtrAnnouncementBar);
}

const initCtrAnnouncementBar = (container) => {
  if (!container || typeof container.querySelectorAll !== 'function') return;
  container.querySelectorAll('ctr-announcement-bar').forEach((section) => {
    if (typeof section.connectedCallback === 'function') {
      section.connectedCallback();
    }
  });
};

document.addEventListener('shopify:section:load', (event) => {
  initCtrAnnouncementBar(event.target);
});

document.addEventListener('shopify:section:reorder', (event) => {
  initCtrAnnouncementBar(event.target);
});

document.addEventListener('shopify:section:select', (event) => {
  initCtrAnnouncementBar(event.target);
});

document.addEventListener('shopify:section:deselect', (event) => {
  initCtrAnnouncementBar(event.target);
});
