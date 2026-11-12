class CtrSteps extends HTMLElement {
  connectedCallback() {
    if (this._initialized) return;
    this._initialized = true;
    this.activeIndex = 0;

    this.triggers = Array.from(this.querySelectorAll("[data-ctr-steps-trigger]"));
    this.items = Array.from(this.querySelectorAll("[data-ctr-steps-item]"));
    this.panels = Array.from(this.querySelectorAll("[data-ctr-steps-panel]"));
    this.videoToggles = Array.from(this.querySelectorAll("[data-ctr-steps-play-toggle]"));
    this.videos = Array.from(this.querySelectorAll("[data-ctr-steps-video]"));

    this.triggerClickHandler = this.handleTriggerClick.bind(this);
    this.itemClickHandler = this.handleItemClick.bind(this);
    this.videoToggleHandler = this.handleVideoToggle.bind(this);
    this.videoPlayHandler = this.handleVideoPlay.bind(this);

    this.bindEvents();
    this.setActiveStep(0, true);
  }

  disconnectedCallback() {
    this.unbindEvents();
    this._initialized = false;
  }

  bindEvents() {
    this.triggers.forEach((trigger) => {
      trigger.addEventListener("click", this.triggerClickHandler);
    });

    this.items.forEach((item) => {
      item.addEventListener("click", this.itemClickHandler);
    });

    this.videoToggles.forEach((toggle) => {
      toggle.addEventListener("click", this.videoToggleHandler);
    });

    this.videos.forEach((video) => {
      video.addEventListener("play", this.videoPlayHandler);
    });
  }

  unbindEvents() {
    this.triggers.forEach((trigger) => {
      trigger.removeEventListener("click", this.triggerClickHandler);
    });

    this.items.forEach((item) => {
      item.removeEventListener("click", this.itemClickHandler);
    });

    this.videoToggles.forEach((toggle) => {
      toggle.removeEventListener("click", this.videoToggleHandler);
    });

    this.videos.forEach((video) => {
      video.removeEventListener("play", this.videoPlayHandler);
    });
  }

  handleTriggerClick(event) {
    const trigger = event.currentTarget;
    if (!(trigger instanceof HTMLElement)) return;

    const index = Number(trigger.dataset.ctrStepsIndex);
    if (Number.isNaN(index)) return;

    this.setActiveStep(index, true);
  }

  handleItemClick(event) {
    const item = event.currentTarget;
    if (!(item instanceof HTMLElement)) return;

    const target = event.target;
    if (target instanceof Element) {
      const interactive = target.closest("a, button, input, select, textarea, video");
      if (interactive && interactive !== item) return;
    }

    const index = Number(item.dataset.ctrStepsIndex);
    if (Number.isNaN(index)) return;

    this.setActiveStep(index, true);
  }

  handleVideoToggle(event) {
    const toggle = event.currentTarget;
    if (!(toggle instanceof HTMLElement)) return;

    const panel = toggle.closest("[data-ctr-steps-panel]");
    if (!(panel instanceof HTMLElement)) return;

    const video = panel.querySelector("[data-ctr-steps-video]");
    if (!(video instanceof HTMLVideoElement)) return;

    if (video.paused) {
      video.play().catch(() => {});
      toggle.textContent = "II";
      return;
    }

    video.pause();
    toggle.textContent = ">";
  }

  handleVideoPlay(event) {
    const current = event.currentTarget;
    if (!(current instanceof HTMLVideoElement)) return;

    document.querySelectorAll("video").forEach((video) => {
      if (video !== current) {
        video.pause();
      }
    });
  }

  setActiveStep(index, playVideo) {
    this.activeIndex = index;

    this.triggers.forEach((trigger) => {
      const triggerIndex = Number(trigger.dataset.ctrStepsIndex);
      const isActive = triggerIndex === index;
      trigger.classList.toggle("is-active", isActive);
      trigger.setAttribute("aria-expanded", isActive ? "true" : "false");

      const center = trigger.querySelector(".ctr-steps__indicator-center");
      const indicatorImage = trigger.querySelector(".ctr-steps__indicator-image");
      const title = trigger.querySelector(".ctr-steps__trigger-title");

      if (center) {
        center.classList.toggle("is-visible", isActive);
      }

      if (indicatorImage) {
        indicatorImage.classList.toggle("is-active", isActive);
      }

      if (title) {
        title.classList.toggle("is-inactive", !isActive);
      }
    });

    this.panels.forEach((panel) => {
      const panelIndex = Number(panel.dataset.ctrStepsIndex);
      panel.classList.toggle("is-active", panelIndex === index);
    });

    this.syncVideos(playVideo);
  }

  syncVideos(playVideo) {
    this.videos.forEach((video) => {
      video.pause();
    });

    const activePanels = this.querySelectorAll(`[data-ctr-steps-panel][data-ctr-steps-index="${this.activeIndex}"]`);

    activePanels.forEach((panel) => {
      if (!(panel instanceof HTMLElement)) return;

      const video = panel.querySelector("[data-ctr-steps-video]");
      const toggle = panel.querySelector("[data-ctr-steps-play-toggle]");

      if (!(video instanceof HTMLVideoElement)) return;

      const panelVisible = window.getComputedStyle(panel).display !== "none" && panel.offsetParent !== null;
      if (!panelVisible) return;

      if (playVideo) {
        video.play().catch(() => {});
      }

      if (toggle instanceof HTMLElement) {
        toggle.textContent = video.paused ? ">" : "II";
      }
    });
  }
}

if (!customElements.get("ctr-steps")) {
  customElements.define("ctr-steps", CtrSteps);
}

const initCtrSteps = (container) => {
  if (!container || typeof container.querySelectorAll !== "function") return;

  container.querySelectorAll("ctr-steps").forEach((section) => {
    if (typeof section.connectedCallback === "function") {
      section.connectedCallback();
    }
  });
};

document.addEventListener("shopify:section:load", (event) => {
  initCtrSteps(event.target);
});

document.addEventListener("shopify:section:reorder", (event) => {
  initCtrSteps(event.target);
});

document.addEventListener("shopify:section:select", (event) => {
  initCtrSteps(event.target);
});

document.addEventListener("shopify:section:deselect", (event) => {
  initCtrSteps(event.target);
});
