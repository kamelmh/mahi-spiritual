/* MAHI Spiritual System - State Management */

const StateManager = {
    // Default state
    defaults: {
        profile: {
            name: 'Kamel M. Abdelghani',
            birthDate: '1996-03-06',
            birthTime: '14:00',
            birthLocation: 'El Bayadh, Algeria',
            coordinates: { latitude: 33.6833, longitude: 1.0167 }
        },
        practice: {
            streak: 0,
            lastPracticeDate: null,
            totalRecitations: 0,
            totalJournalEntries: 0,
            history: [],
            journal: []
        },
        recitations: {
            yunus: { count: 0, target: 100, lastRecited: null },
            arRahman: { count: 0, target: 1, lastRecited: null },
            alQalam: { count: 0, target: 1, lastRecited: null },
            yunusDhikr: { count: 0, target: 100, lastRecited: null },
            yaHafiz: { count: 0, target: 33, lastRecited: null },
            yaRahman: { count: 0, target: 33, lastRecited: null },
            yaAlim: { count: 0, target: 33, lastRecited: null }
        },
        settings: {
            theme: 'dark',
            language: 'en',
            notifications: true,
            fajrTime: '05:00',
            asrTime: '15:30',
            maghribTime: '19:30',
            ishaTime: '21:00'
        },
        lunar: {
            currentPhase: null,
            lastUpdated: null,
            mansionDay: 1
        }
    },

    // Current state
    state: null,

    // Initialize state
    init() {
        const saved = localStorage.getItem('mahi_state');
        if (saved) {
            try {
                this.state = JSON.parse(saved);
                this.state = this.mergeDeep(this.defaults, this.state);
            } catch (e) {
                console.error('Failed to parse saved state:', e);
                this.state = JSON.parse(JSON.stringify(this.defaults));
            }
        } else {
            this.state = JSON.parse(JSON.stringify(this.defaults));
        }

        // Sync standalone keys if present
        try {
            const standalonePractice = localStorage.getItem('practice');
            if (standalonePractice) {
                const parsedP = JSON.parse(standalonePractice);
                this.state.practice = this.mergeDeep(this.state.practice, parsedP);
            }
            const standaloneRecitations = localStorage.getItem('recitations');
            if (standaloneRecitations) {
                const parsedR = JSON.parse(standaloneRecitations);
                this.state.recitations = this.mergeDeep(this.state.recitations, parsedR);
            }
        } catch(e) {
            console.error('Error syncing standalone practice keys:', e);
        }

        // Bind visibility and unload listeners for auto-save
        window.addEventListener('beforeunload', () => this.save());
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') this.save();
        });

        this.save();
        return this.state;
    },

    // Get state value by path
    get(path) {
        return path.split('.').reduce((obj, key) => obj?.[key], this.state);
    },

    // Set state value by path
    set(path, value) {
        const keys = path.split('.');
        const last = keys.pop();
        const target = keys.reduce((obj, key) => obj[key], this.state);
        target[last] = value;
        this.save();
        this.emit('change', { path, value });
    },

    // Save to localStorage
    save() {
        try {
            localStorage.setItem('mahi_state', JSON.stringify(this.state));
        } catch (e) {
            console.error('Failed to save state:', e);
        }
    },

    // Export state as JSON
    export() {
        return JSON.stringify(this.state, null, 2);
    },

    // Import state from JSON
    import(json) {
        try {
            const imported = JSON.parse(json);
            this.state = this.mergeDeep(this.defaults, imported);
            this.save();
            this.emit('import', this.state);
            return true;
        } catch (e) {
            console.error('Failed to import state:', e);
            return false;
        }
    },

    // Reset to defaults
    reset() {
        this.state = JSON.parse(JSON.stringify(this.defaults));
        this.save();
        this.emit('reset', this.state);
    },

    // Event system
    listeners: {},

    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    },

    off(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
        }
    },

    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(data));
        }
    },

    // Deep merge objects
    mergeDeep(target, source) {
        const output = Object.assign({}, target);
        if (this.isObject(target) && this.isObject(source)) {
            Object.keys(source).forEach(key => {
                if (this.isObject(source[key])) {
                    if (!(key in target)) {
                        Object.assign(output, { [key]: source[key] });
                    } else {
                        output[key] = this.mergeDeep(target[key], source[key]);
                    }
                } else {
                    Object.assign(output, { [key]: source[key] });
                }
            });
        }
        return output;
    },

    isObject(item) {
        return (item && typeof item === 'object' && !Array.isArray(item));
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    StateManager.init();
});

// Export for use in other modules
window.StateManager = StateManager;
