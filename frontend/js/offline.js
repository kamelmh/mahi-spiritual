const OfflineManager = {
  _queue: [],
  _db: null,
  _banner: null,
  _indicator: null,

  async init() {
    this._db = await this._openDB();
    this._createBanner();
    this._createIndicator();
    this._updateUI();
    window.addEventListener('online', () => this._onOnline());
    window.addEventListener('offline', () => this._onOffline());
    console.log('[OfflineManager] initialized, online:', navigator.onLine);
  },

  isOnline() {
    return navigator.onLine;
  },

  async queueAction(action) {
    const entry = {
      ...action,
      timestamp: Date.now(),
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36)
    };
    this._queue.push(entry);
    await this._persist(entry);
    this._updateUI();
    return entry.id;
  },

  _openDB() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open('mahi-sync', 1);
      req.onupgradeneeded = e => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('pending-sync')) {
          db.createObjectStore('pending-sync', { keyPath: 'id', autoIncrement: true });
        }
      };
      req.onsuccess = e => resolve(e.target.result);
      req.onerror = e => reject(e.target.error);
    });
  },

  async _persist(entry) {
    if (!this._db) return;
    const tx = this._db.transaction('pending-sync', 'readwrite');
    tx.objectStore('pending-sync').put({ data: entry });
  },

  _createBanner() {
    this._banner = document.createElement('div');
    this._banner.id = 'offline-banner';
    this._banner.textContent = 'You are offline. Changes will sync when reconnected.';
    Object.assign(this._banner.style, {
      display: 'none',
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      padding: '8px 16px',
      background: '#d4a574',
      color: '#0a0a0f',
      textAlign: 'center',
      fontSize: '14px',
      fontWeight: '600',
      zIndex: '99999',
      fontFamily: 'system-ui, sans-serif'
    });
    document.body.prepend(this._banner);
  },

  _createIndicator() {
    this._indicator = document.createElement('div');
    this._indicator.id = 'connection-status';
    Object.assign(this._indicator.style, {
      position: 'fixed',
      bottom: '16px',
      right: '16px',
      width: '12px',
      height: '12px',
      borderRadius: '50%',
      zIndex: '99999',
      transition: 'background 0.3s',
      boxShadow: '0 0 6px rgba(0,0,0,0.3)'
    });
    document.body.appendChild(this._indicator);
  },

  _updateUI() {
    const online = navigator.onLine;
    if (this._banner) {
      this._banner.style.display = online ? 'none' : 'block';
    }
    if (this._indicator) {
      this._indicator.style.background = online ? '#4caf50' : '#f44336';
    }
  },

  async _onOnline() {
    this._updateUI();
    console.log('[OfflineManager] back online, syncing...');
    await this._syncQueue();
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      if (reg.sync) {
        try { await reg.sync.register('sync-practice'); } catch {}
      }
    }
  },

  _onOffline() {
    this._updateUI();
    console.log('[OfflineManager] gone offline');
  },

  async _syncQueue() {
    const tx = this._db.transaction('pending-sync', 'readwrite');
    const store = tx.objectStore('pending-sync');
    const req = store.getAll();
    const items = await new Promise(r => { req.onsuccess = () => r(req.result); req.onerror = () => r([]); });
    for (const item of items) {
      try {
        await fetch(item.data.endpoint || '/api/practice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.data)
        });
        store.delete(item.id);
        this._queue = this._queue.filter(q => q.id !== item.data.id);
      } catch {
        break;
      }
    }
    this._updateUI();
  }
};

window.OfflineManager = OfflineManager;