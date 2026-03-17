// ==UserScript==
// @name         YouTube Customizer (Memory Safe)
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  Removes elements and customizes YouTube safely
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

    function removeCountryCode() {
        const element = document.getElementById('country-code');
        if (element && !element.dataset.removed) {
            element.dataset.removed = 'true';
            element.remove();
            console.log('Country code removed');
        }
    }

    function changeLogoContent() {
        const logo = document.getElementById('logo');
        if (logo && !logo.dataset.modified) {
            logo.dataset.modified = 'true';
            logo.innerHTML = `<a href="/">
            <div id="chip-shape-container" class="style-scope yt-chip-cloud-chip-renderer">
            <chip-shape class="ytChipShapeHost">
            <button class="ytChipShapeButtonReset" role="tab" aria-selected="false">
            <div class="ytChipShapeChip ytChipShapeInactive ytChipShapeOnlyTextPadding">
            <div>Ultimate Mega Bic Mac Premium</div>
            <yt-touch-feedback-shape aria-hidden="true" class="yt-spec-touch-feedback-shape yt-spec-touch-feedback-shape--touch-response"><div class="yt-spec-touch-feedback-shape__stroke" style="border-radius: 8px;"></div><div class="yt-spec-touch-feedback-shape__fill" style="border-radius: 8px;"></div></yt-touch-feedback-shape></div></button></chip-shape>
</div></a>`;
            console.log('Logo #logo changed to Home');
        }
    }

    function removeButtonText() {
        const buttons = document.querySelectorAll('.yt-spec-button-shape-next__button-text-content');
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

        removeCountryCode();
        changeLogoContent();
        removeButtonText();
    }

    checkChanges();

    const intervalId = setInterval(checkChanges, INTERVAL);

    window.addEventListener('beforeunload', () => {
        clearInterval(intervalId);
    });

})();
