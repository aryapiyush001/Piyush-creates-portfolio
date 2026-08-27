// ============ Dynamic footer year ============
document.getElementById('footer-year').textContent = new Date().getFullYear();

// =========================================================
// SCROLL REVEAL: fade-in-up for hero copy + every category
// section / card as it enters view
// =========================================================
const revealTargets = document.querySelectorAll('.fade-up');

const revealObserver = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      obs.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

revealTargets.forEach(el => revealObserver.observe(el));

// =========================================================
// ALL WORK: video sources by category, keyed by data-video-id
// =========================================================
const VIDEO_SOURCES = {
  // Talking Head
  'talking-1':    { type: 'drive', id: '1TgTzjT0x_3ThT-D4u-1y2olDd13jrz6p' },
  'talking-2':    { type: 'drive', id: '1Xan2SECcKvXgtffyd7zL6-bQ6Ha5kUuX' },
  'talking-3':    { type: 'drive', id: '1s6mAsM6Dlb95zUFlQXvZeqiaoIeEIudn' },
  'talking-4':    { type: 'drive', id: '1fNJbi7E0CWAHVjQrdbRfE1qJSo4Xeaq-' },
  'talking-5':    { type: 'drive', id: '176AgqUei6c_gGT6Chy5UOMj27ln50kRd' },

  // Bikes
  'bikes-1':      { type: 'drive', id: '14WfIq3VJ_gABRnd4rM22Yx3H3oPx5qiN' },

  // Café
  'cafe-1':       { type: 'drive', id: '12rl7_qyKxCV4hLxKfk1eiqhDxg-Y_B9G' },
  'cafe-2':       { type: 'drive', id: '1bFaFltnI3WcHiRBSnEXKuSNaVQYlQuBa' },
  'cafe-3':       { type: 'drive', id: '1cPMATK22trM0ZnQA2AMz6XbictYHYn4b' },

  // Events
  'events-1':     { type: 'drive', id: '1NcG7FZh1j93RZ_ABRRQ-Rad7XbZouhgU' },
  'events-2':     { type: 'drive', id: '1ouJ-li_IO6NhJw77K7UFGtqCbe9G0S39' },
  'events-3':     { type: 'drive', id: '1HlgM_krbdLAMzPmOa_JznIPzes2CwCCZ' },

  // Fashion
  'fashion-1':    { type: 'drive', id: '1NLYg-R7AUBQB1FTA1tGDy2ViiPuampw7' },
  'fashion-2':    { type: 'drive', id: '1NH6u-xPJDMwUtbs8stjL8Ox-EZYOXH8_' },
  'fashion-3':    { type: 'drive', id: '142nlVQb39xpAHZrADusWkcyPTCm3xA6K' },

  // Launch Events
  'launch-1':     { type: 'drive', id: '1skISU0P0npphj4qMcnVVubPAk__0fFcO' },
  'launch-2':     { type: 'drive', id: '1uHg6NFuX2XaHhK-VP8MFnE8O0HvzBOu-' },
  'launch-3':     { type: 'drive', id: '1PcgI1KTTa_NF-BNGV40ZKHCaFeJMbo_v' },

  // Perfume
  'perfume-1':    { type: 'drive', id: '1tR_9xotxAxQU1BLjweX52yb3kMkzBT9n' },
  'perfume-2':    { type: 'drive', id: '1wRNL1YB0E02GAp1g-PzcK-IBESWFOGSH' },
  'perfume-3':    { type: 'drive', id: '1lwpSSBMOktsK_MksXtnjnvGZCPtn2mPS' },

  // Properties
  'properties-1': { type: 'drive', id: '1155wshX96nl5eIHk9kfYTAEc4Cu7HxjA' },

  // Shoes
  'shoes-1':      { type: 'drive', id: '1U07PPTOD9anczwPMPzVYzRty211K101b' },

  // Sports
  'sports-1':     { type: 'drive', id: '1W-lOApypof7YdBz54NUm1pQwwI11rYHo' },

  // Vlogs
  'vlogs-1':      { type: 'drive', id: '1gGOwR2kgEm57Ny1v1u92Hp2PBFjQ00ZM' },

  // Watches
  'watches-1':    { type: 'drive', id: '1U4sPuO5U4uYJEHqmnzDplY2ClU7PtRVS' }
};

// =========================================================
// ALL WORK: muted hover-preview playback
//
// Note: these videos are hosted on Google Drive, which doesn't
// give us a controllable player the way a self-hosted <video>
// does. This uses Drive's direct-stream URL as a best-effort
// preview — it works for files shared as "Anyone with the link"
// that are small/short enough for Drive to stream directly, but
// large files can return Drive's virus-scan interstitial instead
// of the raw video, in which case the preview silently stays on
// the gradient placeholder (no error shown to the user) and the
// modal click-to-play still works as before. For guaranteed
// hover-preview on every card, self-hosting the mp4s under
// assets/videos/ and using {type:'local', src:'...'} in
// VIDEO_SOURCES is the reliable path.
// =========================================================
// =========================================================
// UNIVERSAL FULLSCREEN HELPER
// Mobile browsers don't agree on one fullscreen API, and some
// (in-app browsers like Instagram/Facebook, some Android
// WebViews) block the Fullscreen API entirely. Rather than
// picking one method and silently failing, this tries each in
// turn and always lands somewhere that actually fills the
// screen:
//   1) Real Fullscreen API on the requested element
//   2) iOS Safari's video-only native fullscreen
//   3) A CSS-only "pseudo fullscreen" (fixed, 100vw/100dvh)
//      that works everywhere, even where the API is blocked.
// =========================================================
function requestNativeFullscreen(el) {
  if (!el) return Promise.resolve(false);
  const fn = el.requestFullscreen || el.webkitRequestFullscreen;
  if (!fn) return Promise.resolve(false);
  try {
    return Promise.resolve(fn.call(el)).then(() => true).catch(() => false);
  } catch (e) {
    return Promise.resolve(false);
  }
}

async function goFullscreen(containerEl, videoEl, { preferVideo = false } = {}) {
  const tryVideoNative = async () => {
    if (!videoEl) return false;
    if (videoEl.webkitEnterFullscreen) {
      try { videoEl.webkitEnterFullscreen(); return true; } catch (e) { /* fall through */ }
    }
    return requestNativeFullscreen(videoEl);
  };

  if (preferVideo) {
    if (await tryVideoNative()) return 'native';
    if (await requestNativeFullscreen(containerEl)) return 'native';
  } else {
    if (await requestNativeFullscreen(containerEl)) return 'native';
    if (await tryVideoNative()) return 'native';
  }

  // Nothing worked (API blocked) — force it visually instead.
  if (containerEl) {
    containerEl.classList.add('pseudo-fullscreen');
    return 'pseudo';
  }
  return null;
}

function exitPseudoFullscreen(containerEl) {
  if (containerEl) containerEl.classList.remove('pseudo-fullscreen');
}

const isSmallScreen = () => window.matchMedia('(max-width: 700px)').matches;

const supportsHoverPreview = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

function driveDirectStreamUrl(fileId) {
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

function setupHoverPreview(thumbEl) {
  if (!supportsHoverPreview) return; // touch devices: placeholder only, tap opens modal

  const videoId = thumbEl.dataset.videoId;
  const source = VIDEO_SOURCES[videoId];
  const previewEl = thumbEl.querySelector('.thumb-preview');
  if (!source || !previewEl) return;

  const previewSrc = source.type === 'local' ? source.src : driveDirectStreamUrl(source.id);
  let srcLoaded = false;

  function startPreview() {
    if (!srcLoaded) {
      previewEl.src = previewSrc;
      srcLoaded = true;
    }
    previewEl.currentTime = 0;
    previewEl.play()
      .then(() => previewEl.classList.add('is-ready'))
      .catch(() => {
        // Drive blocked direct streaming (interstitial page, permissions,
        // or file too large) — just keep showing the gradient placeholder.
      });
  }

  function stopPreview() {
    previewEl.pause();
    previewEl.classList.remove('is-ready');
  }

  thumbEl.addEventListener('mouseenter', startPreview);
  thumbEl.addEventListener('mouseleave', stopPreview);
  thumbEl.addEventListener('focus', startPreview);
  thumbEl.addEventListener('blur', stopPreview);
}

// =========================================================
// VIDEO MODAL: shared across every category card
// =========================================================
const videoModalOverlay = document.getElementById('video-modal-overlay');
const videoModalBody = document.getElementById('video-modal-body');
const videoModalClose = document.getElementById('video-modal-close');
const videoModal = videoModalOverlay.querySelector('.video-modal');
let lastFocusedEl = null;

// Give Drive's direct-stream link a generous window to prove it plays.
// A slow mobile connection just buffering is not the same as Drive
// blocking the file — bailing out too early lands the person in
// Drive's own cluttered embedded player for no good reason.
const VIDEO_LOAD_TIMEOUT = 9000;

function driveEmbedUrl(fileId) {
  return `https://drive.google.com/file/d/${fileId}/preview`;
}

function buildIframePlayer(src) {
  const iframe = document.createElement('iframe');
  iframe.src = src;
  iframe.allow = 'autoplay; fullscreen';
  iframe.allowFullscreen = true;
  return iframe;
}

function openVideoModal(videoId) {
  const source = VIDEO_SOURCES[videoId];
  if (!source) return;

  videoModalBody.innerHTML = '';
  videoModal.classList.remove('pseudo-fullscreen');
  let loadingEl = null;

  function showLoading() {
    if (loadingEl) return;
    loadingEl = document.createElement('div');
    loadingEl.className = 'video-modal-loading';
    loadingEl.innerHTML = '<div class="spinner"></div>';
    videoModalBody.appendChild(loadingEl);
  }
  function hideLoading() {
    if (loadingEl) { loadingEl.remove(); loadingEl = null; }
  }

  function fallbackToIframe() {
    if (source.type !== 'drive') return; // nothing else to fall back to for local files
    hideLoading();
    videoModalBody.innerHTML = '';
    videoModalBody.appendChild(buildIframePlayer(driveEmbedUrl(source.id)));
    if (isSmallScreen() && !document.fullscreenElement && !document.webkitFullscreenElement) {
      goFullscreen(videoModal, null);
    }
  }

  // Always try a real, self-controlled <video> first — it's the clean,
  // single-tap experience. Only Drive's own boxed-in embed (with its extra
  // toolbar/controls) is used as a last resort if that genuinely fails.
  const vid = document.createElement('video');
  vid.controls = true;
  vid.autoplay = true;
  vid.playsInline = true;
  vid.setAttribute('webkit-playsinline', '');

  let settled = false;
  const timer = source.type === 'drive'
    ? setTimeout(() => { if (!settled) { settled = true; fallbackToIframe(); } }, VIDEO_LOAD_TIMEOUT)
    : null;

  function markPlayable() {
    if (settled) return;
    settled = true;
    if (timer) clearTimeout(timer);
    hideLoading();
  }

  // Any of these mean the direct stream is actually working — don't wait
  // for all of them, the first one is enough to cancel the fallback timer.
  vid.addEventListener('loadeddata', markPlayable);
  vid.addEventListener('canplay', markPlayable);
  vid.addEventListener('playing', markPlayable);
  vid.addEventListener('error', () => {
    if (settled) return;
    settled = true;
    if (timer) clearTimeout(timer);
    fallbackToIframe();
  });

  videoModalBody.appendChild(vid);
  if (source.type === 'drive') showLoading();
  vid.src = source.type === 'local' ? source.src : driveDirectStreamUrl(source.id);
  videoModalBody.appendChild(vid);

  lastFocusedEl = document.activeElement;
  videoModalOverlay.classList.add('open');
  videoModalOverlay.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  videoModalClose.focus();

  // On phones, jump straight to a full, edge-to-edge player in one tap —
  // no hunting for a fullscreen icon inside a cramped embedded player.
  if (isSmallScreen()) {
    goFullscreen(videoModal, vid, { preferVideo: true });
  }

  vid.play().catch(() => {
    // Autoplay may be blocked until the person taps — controls still work.
  });
}

function closeVideoModal() {
  videoModalOverlay.classList.remove('open');
  videoModalOverlay.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
  videoModalBody.innerHTML = ''; // fully removes iframe/video so playback stops
  exitPseudoFullscreen(videoModal);
  if (document.fullscreenElement === videoModal || document.webkitFullscreenElement === videoModal) {
    if (document.exitFullscreen) document.exitFullscreen().catch(() => { });
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
  }
  if (lastFocusedEl) lastFocusedEl.focus();
}

document.querySelectorAll('.work-thumb[data-video-id]').forEach(thumb => {
  thumb.addEventListener('click', () => openVideoModal(thumb.dataset.videoId));
  thumb.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openVideoModal(thumb.dataset.videoId);
    }
  });
  setupHoverPreview(thumb);
});

videoModalClose.addEventListener('click', closeVideoModal);

videoModalOverlay.addEventListener('click', (e) => {
  if (e.target === videoModalOverlay) closeVideoModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && videoModalOverlay.classList.contains('open')) {
    closeVideoModal();
  }
});
