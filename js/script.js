// ============ Dynamic footer year ============
document.getElementById('footer-year').textContent = new Date().getFullYear();

// ============ Brands: + MORE expand/collapse ============
const brandsGrid = document.getElementById('brands-grid');
const brandsMore = document.getElementById('brands-more');
if (brandsMore && brandsGrid) {
  brandsMore.addEventListener('click', () => {
    const expanded = brandsGrid.classList.toggle('is-expanded');
    brandsMore.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    brandsMore.textContent = expanded ? '− LESS' : '+ MORE';
  });
}

// ============ Mobile Nav Toggle ============
const navToggle = document.getElementById('nav-toggle');
const mainNav = document.getElementById('main-nav');

navToggle.addEventListener('click', () => {
  mainNav.classList.toggle('open');
  navToggle.classList.toggle('active');
});

mainNav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => mainNav.classList.remove('open'));
});

document.addEventListener('click', (event) => {
  if (!mainNav.contains(event.target) && !navToggle.contains(event.target)) {
    mainNav.classList.remove('open');
    navToggle.classList.remove('active');
  }
});

// ============ Fix nav flicker on window resize ============
// Without this, resizing the browser across the 860px breakpoint made
// the mobile menu visibly animate open/closed even though the user
// never touched the toggle. Force it closed and briefly disable its
// transition while a resize is in progress.
let resizeSettleTimer;
window.addEventListener('resize', () => {
  document.body.classList.add('resizing');
  mainNav.classList.remove('open');
  navToggle.classList.remove('active');

  clearTimeout(resizeSettleTimer);
  resizeSettleTimer = setTimeout(() => {
    document.body.classList.remove('resizing');
  }, 150);
});

// =========================================================
// SHOWREEL BUTTON
// Play portfolio intro video in fullscreen
// =========================================================

const watchShowreelBtn = document.getElementById('watch-showreel');
const showreelVideo = document.getElementById('showreel-video');
const showreelFrame = document.getElementById('video-frame');

if (watchShowreelBtn && showreelVideo && showreelFrame) {

  watchShowreelBtn.addEventListener('click', async () => {

    try {
      // Start from the beginning
      showreelVideo.currentTime = 0;

      // Make sure the video has sound available
      showreelVideo.muted = false;

      // Enter fullscreen first
      if (showreelFrame.requestFullscreen) {
        await showreelFrame.requestFullscreen();
      } else if (showreelFrame.webkitRequestFullscreen) {
        showreelFrame.webkitRequestFullscreen();
      }

      // Play the portfolio intro
      await showreelVideo.play();

      // Update the player UI
      syncPlayUI();
      syncMuteUI();
      updateProgressUI();

    } catch (error) {
      console.error('Unable to start fullscreen showreel:', error);

      // Fallback: play normally if fullscreen is unavailable
      showreelVideo.play().catch(() => { });
    }

  });

}

// ============ Active Nav Link on Scroll ============
const sectionIds = ['top', 'services', 'about', 'contact'];
const navLinks = document.querySelectorAll('.main-nav a');

function updateActiveNav() {
  const scrollY = window.scrollY;
  let current = 'top';

  for (let i = sectionIds.length - 1; i >= 0; i--) {
    const el = document.getElementById(sectionIds[i]);
    if (!el) continue;
    const top = el.getBoundingClientRect().top + window.scrollY - 140;
    if (scrollY >= top) {
      current = sectionIds[i];
      break;
    }
  }

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
}

window.addEventListener('scroll', updateActiveNav, { passive: true });
window.addEventListener('load', updateActiveNav);

// =========================================================
// HERO: fade-in-up on page load
// =========================================================
window.addEventListener('DOMContentLoaded', () => {
  requestAnimationFrame(() => {
    document.querySelectorAll('.hero-fade').forEach(el => el.classList.add('in-view'));
  });
});

// =========================================================
// SCROLL REVEAL: fade-in-up for everything else as it enters view
// =========================================================
const revealTargets = document.querySelectorAll('.fade-up');

const revealObserver = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      obs.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

revealTargets.forEach(el => revealObserver.observe(el));

// =========================================================
// COUNTER: animate stat numbers from 0 -> target when visible
// =========================================================
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10) || 0;
  const duration = 1400;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target);
    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      el.textContent = target;
    }
  }
  requestAnimationFrame(tick);
}

const counters = document.querySelectorAll('.counter');
const counterObserver = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      obs.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

counters.forEach(el => counterObserver.observe(el));

// =========================================================
// VIDEO PLAYER: real media — play/pause, mute, fullscreen, seek
// =========================================================
const video = document.getElementById('showreel-video');
const playBtn = document.getElementById('video-play');
const iconPlay = playBtn.querySelector('.icon-play');
const iconPause = playBtn.querySelector('.icon-pause');
const progressBar = document.getElementById('progress-bar');
const progressFill = document.getElementById('progress-fill');
const progressHandle = document.getElementById('progress-handle');
const videoTime = document.getElementById('video-time');
const muteBtn = document.getElementById('video-mute');
const iconVolume = muteBtn.querySelector('.icon-volume');
const iconMuted = muteBtn.querySelector('.icon-muted');
const fullscreenBtn = document.getElementById('video-fullscreen');
const iconExpand = fullscreenBtn.querySelector('.icon-expand');
const iconCompress = fullscreenBtn.querySelector('.icon-compress');
const videoFrame = document.getElementById('video-frame');

function formatTime(sec) {
  if (!isFinite(sec) || sec < 0) sec = 0;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function updateProgressUI() {
  const duration = video.duration || 0;
  const current = video.currentTime || 0;
  const pct = duration ? Math.min(Math.max(current / duration, 0), 1) * 100 : 0;
  progressFill.style.width = pct + '%';
  progressHandle.style.left = pct + '%';
  videoTime.textContent = `${formatTime(current)} / ${formatTime(duration)}`;
}

function syncPlayUI() {
  const playing = !video.paused;
  iconPlay.style.display = playing ? 'none' : 'block';
  iconPause.style.display = playing ? 'block' : 'none';
  playBtn.setAttribute('aria-label', playing ? 'Pause video' : 'Play video');
}

function syncMuteUI() {
  const muted = video.muted;
  iconVolume.style.display = muted ? 'none' : 'block';
  iconMuted.style.display = muted ? 'block' : 'none';
  muteBtn.setAttribute('aria-label', muted ? 'Unmute' : 'Mute');
}

function togglePlay() {
  if (video.paused) {
    video.play().catch(() => { });
  } else {
    video.pause();
  }
}

playBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  togglePlay();
});

video.addEventListener('click', () => togglePlay());

video.addEventListener('play', syncPlayUI);
video.addEventListener('pause', syncPlayUI);
video.addEventListener('timeupdate', updateProgressUI);
video.addEventListener('loadedmetadata', updateProgressUI);
video.addEventListener('durationchange', updateProgressUI);

muteBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  video.muted = !video.muted;
  syncMuteUI();
});

function isFullscreen() {
  return document.fullscreenElement === videoFrame ||
    document.webkitFullscreenElement === videoFrame;
}

function updateFullscreenUI() {
  const fs = isFullscreen();
  iconExpand.style.display = fs ? 'none' : 'block';
  iconCompress.style.display = fs ? 'block' : 'none';
  fullscreenBtn.setAttribute('aria-label', fs ? 'Exit fullscreen' : 'Fullscreen');
}

fullscreenBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  if (isFullscreen()) {
    if (document.exitFullscreen) document.exitFullscreen();
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
  } else {
    if (videoFrame.requestFullscreen) videoFrame.requestFullscreen();
    else if (videoFrame.webkitRequestFullscreen) videoFrame.webkitRequestFullscreen();
  }
});

document.addEventListener('fullscreenchange', updateFullscreenUI);
document.addEventListener('webkitfullscreenchange', updateFullscreenUI);

let isDragging = false;

function seekFromEvent(clientX) {
  const duration = video.duration || 0;
  if (!duration) return;
  const rect = progressBar.getBoundingClientRect();
  let pct = (clientX - rect.left) / rect.width;
  pct = Math.min(Math.max(pct, 0), 1);
  video.currentTime = pct * duration;
  updateProgressUI();
}

progressBar.addEventListener('pointerdown', (e) => {
  e.stopPropagation();
  isDragging = true;
  progressBar.setPointerCapture(e.pointerId);
  seekFromEvent(e.clientX);
});
progressBar.addEventListener('pointermove', (e) => {
  if (isDragging) seekFromEvent(e.clientX);
});
progressBar.addEventListener('pointerup', () => { isDragging = false; });
progressBar.addEventListener('pointercancel', () => { isDragging = false; });

syncMuteUI();
syncPlayUI();
updateProgressUI();
video.play().catch(() => {
  syncPlayUI();
});

// =========================================================
// CONTACT FORM
// Field background state
// =========================================================

const contactForm = document.getElementById('contact-form');

const contactFields = [
  document.getElementById('cf-name'),
  document.getElementById('cf-email'),
  document.getElementById('cf-message')
];

contactFields.forEach((field) => {
  if (!field) return;

  const updateFieldState = () => {
    if (field.value.trim().length > 0) {
      field.classList.add('has-value');
    } else {
      field.classList.remove('has-value');
    }
  };

  field.addEventListener('input', updateFieldState);
  field.addEventListener('change', updateFieldState);

  updateFieldState();
});


// =========================================================
// CONTACT FORM
// =========================================================

const RECIPIENT_EMAIL = 'Piyusharya701@gmail.com';
const STATIC_SUBJECT = 'New Enquiry — Piyush Creates Website';

contactForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const name =
    document.getElementById('cf-name').value.trim();

  const email =
    document.getElementById('cf-email').value.trim();

  const message =
    document.getElementById('cf-message').value.trim();


  // =========================================================
  // VALIDATION
  // =========================================================

  if (!name || !email || !message) {
    alert('Please fill in all fields.');
    return;
  }


  // =========================================================
  // CHANGE BUTTON TO "SENDING..."
  // =========================================================

  const submitButton = contactForm.querySelector(
    'button[type="submit"], input[type="submit"]'
  );

  if (submitButton) {
    if (submitButton.tagName === 'INPUT') {
      submitButton.value = 'Sending...';
    } else {
      submitButton.textContent = 'Sending...';
    }

    submitButton.disabled = true;
  }


  // =========================================================
  // POPUP MESSAGE
  // =========================================================

  let popupMessage =
    document.getElementById('gmail-popup-message');

  if (!popupMessage) {
    popupMessage = document.createElement('div');

    popupMessage.id = 'gmail-popup-message';

    popupMessage.textContent =
      'If Gmail does not open, please allow popups to open it in a new browser tab.';

    popupMessage.style.marginTop = '10px';
    popupMessage.style.fontSize = '13px';
    popupMessage.style.textAlign = 'center';
    popupMessage.style.opacity = '0.75';

    if (submitButton) {
      submitButton.parentElement.appendChild(popupMessage);
    }
  }


  // =========================================================
  // FORMAT NAME AND MESSAGE
  // =========================================================

  const formattedName =
    name.charAt(0).toUpperCase() + name.slice(1);

  const formattedMessage =
    message.charAt(0).toUpperCase() + message.slice(1);


  // =========================================================
  // EMAIL BODY
  // =========================================================

  const body =
    `Hello Piyush,\n\n` +
    `A new enquiry has been registered through the Piyush Creates website.\n\n` +
    `Registered by: ${formattedName}\n\n` +
    `The submitted enquiry is provided below:\n\n` +
    `"${formattedMessage}"\n\n` +
    `Regards,\n` +
    `${formattedName}`;


  const encodedSubject =
    encodeURIComponent(STATIC_SUBJECT);

  const encodedBody =
    encodeURIComponent(body);


  // =========================================================
  // TRY INSTALLED EMAIL APPLICATION
  // =========================================================

  const mailtoURL =
    `mailto:${RECIPIENT_EMAIL}` +
    `?subject=${encodedSubject}` +
    `&body=${encodedBody}`;

  window.location.href = mailtoURL;


  // =========================================================
  // GMAIL FALLBACK
  // =========================================================

  setTimeout(() => {

    const useGmail = confirm(
      'If your email application did not open,\n\n' +
      'Would you like to open Gmail in a new browser tab instead?'
    );


    // =======================================================
    // USER CANCELLED
    // =======================================================

    if (!useGmail) {

      if (submitButton) {
        if (submitButton.tagName === 'INPUT') {
          submitButton.value = 'Send Message';
        } else {
          submitButton.textContent = 'Send Message';
        }

        submitButton.disabled = false;
      }

      if (popupMessage) {
        popupMessage.remove();
      }

      return;
    }


    // =======================================================
    // GMAIL URL
    // =======================================================

    const gmailURL =
      `https://mail.google.com/mail/u/0/?view=cm&fs=1` +
      `&to=${encodeURIComponent(RECIPIENT_EMAIL)}` +
      `&su=${encodedSubject}` +
      `&body=${encodedBody}`;


    // =======================================================
    // OPEN GMAIL IN NEW TAB
    // =======================================================

    const gmailWindow =
      window.open(gmailURL, '_blank');


    // =======================================================
    // GMAIL OPENED SUCCESSFULLY
    // =======================================================

    if (gmailWindow) {

      // Clear all fields
      contactFields.forEach((field) => {
        if (!field) return;

        field.value = '';
        field.classList.remove('has-value');
      });


      // Restore button
      if (submitButton) {
        if (submitButton.tagName === 'INPUT') {
          submitButton.value = 'Send Message';
        } else {
          submitButton.textContent = 'Send Message';
        }

        submitButton.disabled = false;
      }


      // Remove popup instruction
      if (popupMessage) {
        popupMessage.remove();
      }

    } else {

      // =====================================================
      // POPUP BLOCKED
      // =====================================================

      alert(
        'Gmail could not be opened because the popup was blocked. ' +
        'Please allow popups for this website and try again.'
      );

      if (submitButton) {
        if (submitButton.tagName === 'INPUT') {
          submitButton.value = 'Send Message';
        } else {
          submitButton.textContent = 'Send Message';
        }

        submitButton.disabled = false;
      }

    }

  }, 1500);

});

// =========================================================
// BEST WORK: video modal
// =========================================================
const VIDEO_SOURCES = {
  'cinematic-reel': { type: 'drive', id: '1Vz46fWxJIT0CY6HlBxVgcWM_ND4aon0c' },
  'behind-the-scenes': { type: 'local', src: 'assets/videos/best-work2.mp4' },
  'automotive-showcase': { type: 'local', src: 'assets/videos/best-work3.mp4' },
  'product-film': { type: 'drive', id: '1FQ2d5ocV9GCf1BU8wzLbViIYWiP3Ia3c' }
};

// =========================================================
// BEST WORK: muted hover-preview playback
//
// Note: these videos are hosted on Google Drive, which doesn't
// give us a controllable player the way a self-hosted <video>
// does. This uses Drive's direct-stream URL as a best-effort
// preview — it works for files shared as "Anyone with the link"
// that are small/short enough for Drive to stream directly, but
// large files can return Drive's virus-scan interstitial instead
// of the raw video, in which case the preview silently stays on
// the static thumbnail (no error shown to the user) and the
// modal click-to-play still works as before. For guaranteed
// hover-preview on every card, self-hosting the mp4s under
// assets/videos/ and using {type:'local', src:'...'} in
// VIDEO_SOURCES is the reliable path.
// =========================================================
const supportsHoverPreview = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

function driveDirectStreamUrl(fileId) {
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

function setupHoverPreview(thumbEl) {
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
        // or file too large) — just keep showing the static thumbnail.
      });
  }

  function stopPreview() {
    previewEl.pause();
    previewEl.classList.remove('is-ready');
  }

  if (thumbEl.dataset.autoplayPreview === 'true') {
    startPreview();
    return;
  }

  if (!supportsHoverPreview) return; // touch devices: thumbnail only, tap opens modal

  thumbEl.addEventListener('mouseenter', startPreview);
  thumbEl.addEventListener('mouseleave', stopPreview);
  thumbEl.addEventListener('focus', startPreview);
  thumbEl.addEventListener('blur', stopPreview);
}

const THUMB_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];

function loadThumbWithFallback(imgEl) {
  const base = imgEl.dataset.base;
  let i = 0;

  function tryNext() {
    if (i >= THUMB_EXTENSIONS.length) return;
    imgEl.src = `${base}.${THUMB_EXTENSIONS[i]}`;
    i++;
  }

  imgEl.addEventListener('error', tryNext);
  tryNext();
}

document.querySelectorAll('.thumb-img[data-base]').forEach(loadThumbWithFallback);

const videoModalOverlay = document.getElementById('video-modal-overlay');
const videoModalBody = document.getElementById('video-modal-body');
const videoModalClose = document.getElementById('video-modal-close');
let lastFocusedEl = null;

function openVideoModal(videoId) {
  const source = VIDEO_SOURCES[videoId];
  if (!source) return;

  videoModalBody.innerHTML = '';
  let localVideo = null;

  if (source.type === 'drive') {
    const iframe = document.createElement('iframe');
    iframe.src = `https://drive.google.com/file/d/${source.id}/preview`;
    iframe.allow = 'autoplay';
    iframe.allowFullscreen = true;
    videoModalBody.appendChild(iframe);
  } else if (source.type === 'local') {
    const vid = document.createElement('video');
    vid.src = source.src;
    vid.controls = true;
    vid.autoplay = true;
    vid.playsInline = true;
    videoModalBody.appendChild(vid);
    localVideo = vid;
  }

  lastFocusedEl = document.activeElement;
  videoModalOverlay.classList.add('open');
  videoModalOverlay.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  videoModalClose.focus();

  if (localVideo) {
    const fullscreenRequest = localVideo.requestFullscreen ? localVideo.requestFullscreen() :
      (localVideo.webkitEnterFullscreen ? localVideo.webkitEnterFullscreen() : null);
    if (fullscreenRequest && typeof fullscreenRequest.catch === 'function') {
      fullscreenRequest.catch(() => { });
    }
  }
}

function closeVideoModal() {
  videoModalOverlay.classList.remove('open');
  videoModalOverlay.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
  videoModalBody.innerHTML = '';
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
