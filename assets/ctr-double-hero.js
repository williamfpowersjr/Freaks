(() => {
  if (customElements.get('ctr-double-hero')) return;

  class CtrDoubleHero extends HTMLElement {
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
      this.querySelectorAll('video').forEach((video) => {
        video.addEventListener('play', this.videoPlayHandler);
      });
    }

    unbindVideoEvents() {
      this.querySelectorAll('video').forEach((video) => {
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

  customElements.define('ctr-double-hero', CtrDoubleHero);

  const initCtrDoubleHero = (container) => {
    if (!container || typeof container.querySelectorAll !== 'function') return;

    container.querySelectorAll('ctr-double-hero').forEach((section) => {
      if (typeof section.connectedCallback === 'function') {
        section.connectedCallback();
      }
    });
  };

  document.addEventListener('shopify:section:load', (event) => {
    initCtrDoubleHero(event.target);
  });

  document.addEventListener('shopify:section:reorder', (event) => {
    initCtrDoubleHero(event.target);
  });

  document.addEventListener('shopify:section:select', (event) => {
    initCtrDoubleHero(event.target);
  });

  document.addEventListener('shopify:section:deselect', (event) => {
    initCtrDoubleHero(event.target);
  });
})();
