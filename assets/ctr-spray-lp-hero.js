class CtrSprayLpHero extends HTMLElement {
  connectedCallback() {
    if (this._initialized) return;
    this._initialized = true;

    this.videoPlayHandler = this.handleVideoPlay.bind(this);
    this.bindVideoEvents();
  }

  disconnectedCallback() {
    this.unbindVideoEvents();
    this._initialized = false;
  }

  bindVideoEvents() {
    this.querySelectorAll('.ctr-spray-lp-hero__video-element').forEach((video) => {
      video.addEventListener('play', this.videoPlayHandler);
    });
  }

  unbindVideoEvents() {
    this.querySelectorAll('.ctr-spray-lp-hero__video-element').forEach((video) => {
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
}

if (!customElements.get('ctr-spray-lp-hero')) {
  customElements.define('ctr-spray-lp-hero', CtrSprayLpHero);
}

const initCtrSprayLpHero = (container) => {
  if (!container || typeof container.querySelectorAll !== 'function') return;

  container.querySelectorAll('ctr-spray-lp-hero').forEach((section) => {
    if (typeof section.connectedCallback === 'function') {
      section.connectedCallback();
    }
  });
};

document.addEventListener('shopify:section:load', (event) => {
  initCtrSprayLpHero(event.target);
});

document.addEventListener('shopify:section:reorder', (event) => {
  initCtrSprayLpHero(event.target);
});

document.addEventListener('shopify:section:select', (event) => {
  initCtrSprayLpHero(event.target);
});

document.addEventListener('shopify:section:deselect', (event) => {
  initCtrSprayLpHero(event.target);
});
