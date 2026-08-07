/* MAHI Spiritual System - Utility Functions */

const Utils = {
    // Date formatting
    formatDate(date, format = 'long') {
        const d = new Date(date);
        const options = {
            long: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
            short: { month: 'short', day: 'numeric' },
            time: { hour: '2-digit', minute: '2-digit' },
            full: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
        };
        return d.toLocaleDateString('en-US', options[format] || options.long);
    },

    // Time formatting
    formatTime(date) {
        return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    },

    // Get current time period
    getCurrentPeriod() {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return 'fajr';
        if (hour >= 12 && hour < 15) return 'dhuhr';
        if (hour >= 15 && hour < 19) return 'asr';
        if (hour >= 19 && hour < 21) return 'maghrib';
        return 'isha';
    },

    // Get day of week
    getDayOfWeek(date = new Date()) {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[new Date(date).getDay()];
    },

    // Get power number for day
    getPowerNumber(dayOfWeek) {
        const numbers = {
            'Sunday': 7,
            'Monday': 3,
            'Tuesday': 9,
            'Wednesday': 7,
            'Thursday': 28,
            'Friday': 3,
            'Saturday': 11
        };
        return numbers[dayOfWeek] || 7;
    },

    // Calculate streak
    calculateStreak(history) {
        if (!history || history.length === 0) return 0;
        
        const sorted = [...history].sort((a, b) => new Date(b.date) - new Date(a.date));
        let streak = 1;
        let currentDate = new Date(sorted[0].date);
        
        for (let i = 1; i < sorted.length; i++) {
            const prevDate = new Date(sorted[i].date);
            const diffDays = Math.floor((currentDate - prevDate) / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
                streak++;
                currentDate = prevDate;
            } else {
                break;
            }
        }
        
        return streak;
    },

    // Check if same day
    isSameDay(date1, date2) {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        return d1.getFullYear() === d2.getFullYear() &&
               d1.getMonth() === d2.getMonth() &&
               d1.getDate() === d2.getDate();
    },

    // Check if today
    isToday(date) {
        return this.isSameDay(date, new Date());
    },

    // Calculate moon phase (simplified)
    getMoonPhase(date = new Date()) {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        
        let c = 0, e = 0, jd = 0, b = 0;
        
        if (month < 3) {
            c = year - 1;
            e = month + 12;
        } else {
            c = year;
            e = month;
        }
        
        jd = (365.25 * (c + 4716) | 0) + (30.6001 * (e + 1) | 0) + day - 1524.5;
        
        const daysInCycle = (jd - 2451550.1) / 29.530588853;
        const phase = ((daysInCycle % 1) + 1) % 1;
        
        if (phase < 0.0625) return { phase: 0, name: 'New Moon', emoji: '🌑' };
        if (phase < 0.1875) return { phase: 0.125, name: 'Waxing Crescent', emoji: '🌒' };
        if (phase < 0.3125) return { phase: 0.25, name: 'First Quarter', emoji: '🌓' };
        if (phase < 0.4375) return { phase: 0.375, name: 'Waxing Gibbous', emoji: '🌔' };
        if (phase < 0.5625) return { phase: 0.5, name: 'Full Moon', emoji: '🌕' };
        if (phase < 0.6875) return { phase: 0.625, name: 'Waning Gibbous', emoji: '🌖' };
        if (phase < 0.8125) return { phase: 0.75, name: 'Last Quarter', emoji: '🌗' };
        if (phase < 0.9375) return { phase: 0.875, name: 'Waning Crescent', emoji: '🌘' };
        return { phase: 0, name: 'New Moon', emoji: '🌑' };
    },

    // Get lunar mansion (28 day cycle)
    getLunarMansion(date = new Date()) {
        const mansions = [
            { name: 'Al-Thuraya', nakshatra: 'Krittika', meaning: 'Leadership' },
            { name: 'Al-Dabaran', nakshatra: 'Rohini', meaning: 'Growth' },
            { name: 'Al-Haqqa', nakshatra: 'Mrigashira', meaning: 'Exploration' },
            { name: 'Al-Thuayya', nakshatra: 'Ardra', meaning: 'Transformation' },
            { name: 'Al-Qalb', nakshatra: 'Punarvasu', meaning: 'Renewal' },
            { name: 'Al-Shaula', nakshatra: 'Pushya', meaning: 'Nourishment' },
            { name: 'Al-Na\'aith', nakshatra: 'Ashlesha', meaning: 'Healing' },
            { name: 'Al-Bakrah', nakshatra: 'Magha', meaning: 'Ancestral Power' },
            { name: 'Al-Tarafah', nakshatra: 'P.Phalguni', meaning: 'Creativity' },
            { name: 'Al-Athrah', nakshatra: 'U.Phalguni', meaning: 'Partnership' },
            { name: 'Al-Qalb', nakshatra: 'Hasta', meaning: 'Skill' },
            { name: 'Al-Shaula', nakshatra: 'Chitra', meaning: 'Beauty' },
            { name: 'Al-Na\'aith', nakshatra: 'Swati', meaning: 'Freedom' },
            { name: 'Al-Bakrah', nakshatra: 'Vishakha', meaning: 'Goal-setting' },
            { name: 'Al-Tarafah', nakshatra: 'Anuradha', meaning: 'Devotion' },
            { name: 'Al-Athrah', nakshatra: 'Jyeshtha', meaning: 'Power' },
            { name: 'Al-Qalb', nakshatra: 'Mula', meaning: 'Investigation' },
            { name: 'Al-Shaula', nakshatra: 'P.Ashadha', meaning: 'Victory' },
            { name: 'Al-Na\'aith', nakshatra: 'U.Ashadha', meaning: 'Rise' },
            { name: 'Al-Bakrah', nakshatra: 'Shravana', meaning: 'Listening' },
            { name: 'Al-Tarafah', nakshatra: 'Dhanishta', meaning: 'Music' },
            { name: 'Al-Athrah', nakshatra: 'Shatabhisha', meaning: 'Healing' },
            { name: 'Al-Qalb', nakshatra: 'P.Bhadra', meaning: 'Spiritual Fire' },
            { name: 'Al-Shaula', nakshatra: 'U.Bhadra', meaning: 'Determination' },
            { name: 'Al-Na\'aith', nakshatra: 'Revati', meaning: 'Journey' },
            { name: 'Al-Bakrah', nakshatra: 'Ashwini', meaning: 'Quick Action' },
            { name: 'Al-Tarafah', nakshatra: 'Bharani', meaning: 'Transformation' },
            { name: 'Al-Athrah', nakshatra: 'Krittika', meaning: 'Purification' }
        ];
        
        const dayOfMonth = date.getDate();
        const mansionIndex = (dayOfMonth - 1) % 28;
        
        return {
            day: mansionIndex + 1,
            ...mansions[mansionIndex]
        };
    },

    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttle function
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Generate unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // Sanitize HTML
    sanitize(html) {
        const div = document.createElement('div');
        div.textContent = html;
        return div.innerHTML;
    },

    // Animate element
    animate(element, animation, duration = 300) {
        return new Promise(resolve => {
            element.style.animation = `${animation} ${duration}ms ease`;
            setTimeout(() => {
                element.style.animation = '';
                resolve();
            }, duration);
        });
    },

    // Show notification
    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 12px 24px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }
};

// Export
window.Utils = Utils;
