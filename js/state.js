(function () {
  const SESSION_KEY = 'piyush-creates-session';
  const PERSISTED_KEY = 'piyush-creates-preferences';

  function read(storage, key, fallback) {
    try {
      const value = JSON.parse(storage.getItem(key));
      return value && typeof value === 'object' ? value : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function write(key, value) {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      return false;
    }
    return true;
  }

  const session = read(sessionStorage, SESSION_KEY, {});
  const preferences = read(localStorage, PERSISTED_KEY, {});

  function updateSession(values) {
    Object.assign(session, values);
    return write(SESSION_KEY, session);
  }

  function updatePreferences(values) {
    Object.assign(preferences, values);
    try {
      localStorage.setItem(PERSISTED_KEY, JSON.stringify(preferences));
    } catch (error) {
      return false;
    }
    return true;
  }

  window.SiteState = {
    get(name, fallback = null) {
      return name in session ? session[name] : name in preferences ? preferences[name] : fallback;
    },
    set(name, value, { persist = false } = {}) {
      return persist ? updatePreferences({ [name]: value }) : updateSession({ [name]: value });
    },
    clear(name, { persist = false } = {}) {
      delete (persist ? preferences : session)[name];
      if (persist) {
        try { localStorage.setItem(PERSISTED_KEY, JSON.stringify(preferences)); } catch (error) { return false; }
        return true;
      }
      return write(SESSION_KEY, session);
    },
    saveHomePosition() {
      return updateSession({ homeScrollY: window.scrollY });
    },
    restoreHomePosition() {
      const position = Number(session.homeScrollY);
      if (session.returnToHome && !location.hash && Number.isFinite(position)) {
        requestAnimationFrame(() => window.scrollTo(0, position));
        updateSession({ returnToHome: false });
      }
    }
  };

  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (link && /(^|\/)work\.html(?:#|$)/.test(link.getAttribute('href'))) {
      SiteState.saveHomePosition();
      SiteState.set('returnToHome', true);
    }
  });

  window.addEventListener('pagehide', () => {
    if (location.pathname.endsWith('index.html') || location.pathname === '/') {
      SiteState.saveHomePosition();
    }
  });
})();