
import '../css/index.css';

import Alpine from 'alpinejs'
import collapse from '@alpinejs/collapse';
import intersect from '@alpinejs/intersect'
window.Alpine = Alpine

// Add Alpine extensions here
Alpine.plugin(collapse);
Alpine.plugin(intersect);

const lang = getLanguage();
document.documentElement.lang = lang;

document.addEventListener('DOMContentLoaded', function() {
    const lang = getLanguage();
    document.documentElement.lang = lang;
});


window.applyAnimation = (element) => {
    console.log('applying animation to element', element);
    const animation = element.getAttribute('data-animation'); // Get the specified animation
    if (animation) {
        element.classList.remove('opacity-0'); // Remove initial hidden class
        element.classList.add(animation); // Add animation class
    }
};

function switchLanguage(language) {
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('lang', language);
    window.history.pushState({}, '', currentUrl); // Update URL without reload
    localStorage.setItem('lang', language);
    document.documentElement.lang = language;
    window.location.reload(); // Reload the page to apply the new language
}

function getLanguage() {
    return localStorage.getItem('lang') || 'en';
}

window.countdownTimer = function (targetDateString) {
    console.log('countdownTimer called with targetDateString:', targetDateString);
    return {
      time: { days: 0, hours: 0, minutes: 0, seconds: 0 },
      start() {
        const target = new Date(targetDateString);
        const update = () => {
          const now = new Date();
          const diff = Math.max(0, target - now);

          this.time.days = Math.floor(diff / (1000 * 60 * 60 * 24));
          this.time.hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
          this.time.minutes = Math.floor((diff / 1000 / 60) % 60);
          this.time.seconds = Math.floor((diff / 1000) % 60);
        };

        update(); // run once immediately
        setInterval(update, 1000);
      }
    };
  }


Alpine.start()