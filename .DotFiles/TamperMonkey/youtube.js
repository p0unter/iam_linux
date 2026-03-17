// ==UserScript==
// @name         YouTube Customizer (Memory Safe)
// @namespace    http://tampermonkey.net/
// @version      2.1
// @description  Removes elements + animated glow + voice search
// @author       Popo
// @match        https://www.youtube.com/*
// @match        https://youtube.com/*
// @match        https://m.youtube.com/*
// @icon         https://www.youtube.com/favicon.ico
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let lastRun = 0;
    const INTERVAL = 1500;

    // function removeCountryCode() {
    //     const element = document.getElementById('country-code');
    //     if (element && !element.dataset.removed) {
    //         element.dataset.removed = 'true';
    //         element.remove();
    //         console.log('Country code removed');
    //     }
    // }

    function removeVoiceSearch() {
        const element = document.getElementById('voice-search-button');
        if (element && !element.dataset.removed) {
            element.dataset.removed = 'true';
            element.remove();
            console.log('Voice search button removed');
        }
    }

    function changeLogoContent() {
        const logo = document.getElementById('logo');
        if (logo && !logo.dataset.modified) {
            logo.dataset.modified = 'true';
            logo.innerHTML = `<a href="/">
                <div id="glow-container" class="glow-container">
                    <div id="chip-shape-container" class="style-scope yt-chip-cloud-chip-renderer">
                        <chip-shape class="ytChipShapeHost">
                            <button class="ytChipShapeButtonReset glow-chip" role="tab" aria-selected="false">
                                <div class="ytChipShapeChip ytChipShapeInactive ytChipShapeOnlyTextPadding" style="background: none !important;">
                                    <div>Ultimate Mega Bic Mac Premium</div>
                                </div>
                            </button>
                        </chip-shape>
                    </div>
                </div>
            </a>`;
            addGlowEffect();
            console.log('Logo changed with glow');
        }
    }

    function addGlowEffect() {
        if (document.getElementById('glow-styles')) return;

        const style = document.createElement('style');
        style.id = 'glow-styles';
        style.textContent = `
            .glow-container {
                filter: drop-shadow(0 0 6px rgba(255,255,255,0.5));
                animation: glowMove 3s ease-in-out infinite;
                transition: filter 0.3s ease;
            }

            .glow-container:hover {
                filter: drop-shadow(0 0 7px rgba(255,255,255,1)) drop-shadow(0 0 30px rgba(255,100,255,0.5)) !important;
                animation-play-state: paused;
            }

            .glow-chip {
                transition: filter 0.3s ease;
            }

            @keyframes glowMove {
                0%, 100% {
                    filter: drop-shadow(0 0 6px rgba(255,255,255,0.5));
                }
                25% {
                    filter: drop-shadow(0 0 10px rgba(255,255,255,0.7));
                }
                75% {
                    filter: drop-shadow(0 0 10px rgba(255,100,255,0.6));
                }
            }
        `;
        document.head.appendChild(style);
    }

    function removeButtonText() {
        const buttons = document.querySelectorAll('#end #buttons .style-scope .yt-spec-button-shape-next__button-text-content');
        buttons.forEach(button => {
            if (!button.dataset.removed) {
                button.dataset.removed = 'true';
                button.remove();
                console.log('Button text removed');
            }
        });

        const iconContainers = document.querySelectorAll('.yt-spec-button-shape-next__icon');
        iconContainers.forEach(icon => {
            if (!icon.dataset.styled) {
                icon.dataset.styled = 'true';
                icon.style.margin = '0';
                console.log('Icon margin fixed');
            }
        });
    }

    function checkChanges() {
        const now = Date.now();
        if (now - lastRun < INTERVAL) return;
        lastRun = now;

        // removeCountryCode();
        removeVoiceSearch();
        changeLogoContent();
        removeButtonText();
    }

    checkChanges();
    const intervalId = setInterval(checkChanges, INTERVAL);

    window.addEventListener('beforeunload', () => {
        clearInterval(intervalId);
    });

})();
