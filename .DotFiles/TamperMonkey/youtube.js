// ==UserScript==
// @name         YouTube Customizer (Memory Safe)
// @namespace    http://tampermonkey.net/
// @version      24.0
// @description  Ultimate Customization + Focus Mode + Flawless Timeline Analytics + Absolute Positioning Fixes
// @author       Popo
// @match        https://www.youtube.com/*
// @match        https://youtube.com/*
// @match        https://m.youtube.com/*
// @icon         https://www.youtube.com/favicon.ico
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const ENABLE_POPUP = true;
    const INTERVAL = 1500;

    let lastRun = 0;
    let popupClosedByUser = false;
    let isMinimized = localStorage.getItem('yt-popup-minimized') !== 'false';
    let isDetailedOpen = localStorage.getItem('yt-detailed-open') === 'true';
    let lastPath = window.location.pathname;
    let preDetailPos = null;
    let draggedInDetail = false;

    const defaultSettings = {
        activityMode: true,
        glow: true,
        voice: true,
        texts: true,
        opacity: 95,
        blur: 12,
        graphOpacity: 25,
        logoText: "Ultimate Premium",
        yellowThreshold: 30,
        redThreshold: 60,
        destroyOnClose: false,
        hideShorts: false,
        hideRelated: false,
        compactCorner: 'br',
        feedLimitEnabled: false,
        feedLimitMins: 120,
        hideComments: false,
        hideBell: false,
        hideMetrics: false,
        hideMerch: false,
        hideEndCards: false,
        hideWatermarks: false,
        playerColor: 'default'
    };

    let settings = JSON.parse(localStorage.getItem('yt-custom-settings')) || {};
    settings = { ...defaultSettings, ...settings };

    if (!settings.activityMode) {
        isMinimized = true;
    }

    let dailySeconds = 0;
    const today = new Date().toLocaleDateString();
    let usageData = JSON.parse(localStorage.getItem('yt-usage-data-v4'));

    if (!usageData || usageData.date !== today) {
        usageData = { date: today, dailySeconds: 0, buckets: Array(48).fill(0) };
        localStorage.setItem('yt-usage-data-v4', JSON.stringify(usageData));
    }
    dailySeconds = usageData.dailySeconds;
    let currentColorRGB = [59, 130, 246];
    let wasFeedBlocked = settings.feedLimitEnabled && dailySeconds >= settings.feedLimitMins * 60;

    function saveSettings() {
        localStorage.setItem('yt-custom-settings', JSON.stringify(settings));
        applyFeatureCSS();
        updateTimerUI();
    }

    function applyFeatureCSS() {
        let styleEl = document.getElementById('yt-custom-dynamic-styles');
        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = 'yt-custom-dynamic-styles';
            document.head.appendChild(styleEl);
        }

        let css = '';

        if (settings.voice) css += '#voice-search-button { display: none !important; }\n';
        if (settings.texts) {
            css += '#end .yt-spec-button-shape-next__button-text-content { display: none !important; }\n';
            css += '.yt-spec-button-shape-next__icon { margin: 0 !important; }\n';
        }
        if (!settings.glow) {
            css += '.glow-container { animation: none !important; filter: none !important; drop-shadow: none !important; }\n';
            css += '.glow-container:hover { filter: none !important; }\n';
        }

        if (settings.hideShorts) {
            css += 'ytd-rich-section-renderer.ytd-rich-grid-renderer { display: none !important; }\n';
            css += 'ytd-reel-shelf-renderer { display: none !important; }\n';
            css += 'a[title="Shorts"] { display: none !important; }\n';
            css += 'ytd-mini-guide-entry-renderer[aria-label="Shorts"] { display: none !important; }\n';
            css += 'ytd-guide-entry-renderer:has(a[title="Shorts"]) { display: none !important; }\n';
        }
        if (settings.hideRelated) css += '#secondary { display: none !important; }\n';
        if (settings.hideComments) css += '#comments { display: none !important; }\n';
        if (settings.hideBell) css += 'ytd-notification-topbar-button-renderer { display: none !important; }\n';
        if (settings.hideMerch) css += 'ytd-merch-shelf-renderer, ytd-donation-shelf-renderer { display: none !important; }\n';
        if (settings.hideMetrics) {
            css += '#metadata-line, ytd-video-primary-info-renderer #info-text { display: none !important; }\n';
            css += '#factoids { display: none !important; }\n';
        }

        if (settings.hideEndCards) css += '.ytp-ce-element { display: none !important; }\n';
        if (settings.hideWatermarks) css += '.annotation-shape, .ytp-watermark { display: none !important; }\n';

        if (settings.playerColor !== 'default') {
            const colors = { blue: '#3ea6ff', green: '#2ba640', purple: '#a13eff', pink: '#ff3e9e', orange: '#ff8c3e' };
            const hex = colors[settings.playerColor];
            if (hex) {
                css += `.ytp-swatch-background-color { background-color: ${hex} !important; }\n`;
                css += `.ytp-swatch-background-color-secondary { background-color: ${hex} !important; opacity: 0.5; }\n`;
                css += `.ytp-settings-button.ytp-hd-quality-badge::after { background-color: ${hex} !important; }\n`;
            }
        }

        const isFeedBlocked = settings.feedLimitEnabled && dailySeconds >= settings.feedLimitMins * 60;
        if (isFeedBlocked) {
            css += 'ytd-browse[page-subtype="home"] #primary { display: none !important; }\n';
            css += '#secondary { display: none !important; }\n';
            css += 'ytd-watch-next-secondary-results-renderer { display: none !important; }\n';
        }

        styleEl.textContent = css;

        const popup = document.getElementById('my-custom-yt-popup');
        if (popup) {
            popup.style.background = `rgba(15, 15, 15, ${settings.opacity / 100})`;
            popup.style.backdropFilter = `blur(${settings.blur}px)`;
        }
    }

    applyFeatureCSS();

    function injectUIStyles() {
        if (document.getElementById('yt-custom-ui-styles')) return;
        const style = document.createElement('style');
        style.id = 'yt-custom-ui-styles';
        style.textContent = `
            @keyframes ytPopIn {
                0% { opacity: 0; transform: scale(0.9) translateY(-10px); }
                100% { opacity: 1; transform: scale(1) translateY(0); }
            }
            .yt-dropdown-anim { animation: ytPopIn 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.1) forwards; transform-origin: top right; }

            .yt-switch { position: relative; display: inline-block; width: 36px; height: 14px; margin-top: 2px; flex-shrink: 0; }
            .yt-switch input { opacity: 0; width: 0; height: 0; }
            .yt-slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #717171; transition: background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1); border-radius: 14px; }
            .yt-slider:before { position: absolute; content: ""; height: 20px; width: 20px; left: -2px; bottom: -3px; background-color: #f1f1f1; transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1); border-radius: 50%; box-shadow: 0 1px 3px rgba(0,0,0,0.4); }
            .yt-switch input:checked + .yt-slider { background-color: rgba(62, 166, 255, 0.5); }
            .yt-switch input:checked + .yt-slider:before { transform: translateX(20px); background-color: #3ea6ff; }

            .yt-range { -webkit-appearance: none; -moz-appearance: none; appearance: none; width: 100%; background: transparent; margin: 14px 0 8px 0; outline: none; box-sizing: border-box; }
            .yt-range::-webkit-slider-runnable-track { width: 100%; height: 4px; cursor: pointer; background: rgba(255,255,255,0.2); border-radius: 2px; transition: background 0.3s; }
            .yt-range:hover::-webkit-slider-runnable-track { background: rgba(255,255,255,0.3); }
            .yt-range::-moz-range-track { width: 100%; height: 4px; cursor: pointer; background: rgba(255,255,255,0.2); border-radius: 2px; transition: background 0.3s; }
            .yt-range:hover::-moz-range-track { background: rgba(255,255,255,0.3); }
            .yt-range::-webkit-slider-thumb { -webkit-appearance: none; height: 16px; width: 16px; border-radius: 50%; background: #3ea6ff; cursor: pointer; margin-top: -6px; box-shadow: 0 0 6px rgba(0,0,0,0.4); transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
            .yt-range::-moz-range-thumb { border: none; height: 16px; width: 16px; border-radius: 50%; background: #3ea6ff; cursor: pointer; box-shadow: 0 0 6px rgba(0,0,0,0.4); transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
            .yt-range::-webkit-slider-thumb:hover, .yt-range::-moz-range-thumb:hover { transform: scale(1.25); }

            .yt-timer-toggle-btn {
                width: 36px; height: 36px; border-radius: 50%; border: 1px solid transparent; outline: none;
                cursor: pointer; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                display: flex; align-items: center; justify-content: center; margin-top: 8px; flex-shrink: 0;
            }
            .yt-timer-toggle-btn.running { background: rgba(43, 166, 64, 0.15); color: #4ade80; border-color: rgba(43, 166, 64, 0.3); }
            .yt-timer-toggle-btn.running:hover { background: rgba(43, 166, 64, 0.25); transform: scale(1.1); }
            .yt-timer-toggle-btn.paused { background: rgba(239, 68, 68, 0.15); color: #f87171; border-color: rgba(239, 68, 68, 0.3); }
            .yt-timer-toggle-btn.paused:hover { background: rgba(239, 68, 68, 0.25); transform: scale(1.1); }
            .yt-timer-toggle-btn:active { transform: scale(0.95) !important; }

            .yt-select { padding: 6px 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); color: #f1f1f1; font-family: 'Roboto', Arial, sans-serif; font-size: 13px; outline: none; cursor: pointer; transition: border-color 0.3s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s; }
            .yt-select:hover { background: rgba(255,255,255,0.1); }
            .yt-select:focus { border-color: #3ea6ff; background: rgba(0,0,0,0.3); }
            .yt-select option { background: #282828; color: #f1f1f1; }

            .yt-text-input, .yt-number-input { padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.2); color: #f1f1f1; font-family: 'Roboto', Arial, sans-serif; font-size: 14px; outline: none; transition: border-color 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s; box-sizing: border-box; }
            .yt-text-input { width: 100%; margin-top: 6px; }
            .yt-number-input { width: 70px; text-align: center; font-weight: 500; }
            .yt-text-input:focus, .yt-number-input:focus { border-color: #3ea6ff; box-shadow: 0 0 0 1px rgba(62,166,255,0.3); }

            .yt-btn-action { width: 100%; padding: 10px; border-radius: 18px; border: none; font-size: 14px; font-weight: 500; cursor: pointer; transition: background 0.2s, transform 0.1s cubic-bezier(0.4, 0, 0.2, 1); margin-top: 12px; box-sizing: border-box; font-family: 'Roboto', Arial, sans-serif; display: flex; align-items: center; justify-content: center; gap: 6px; }
            .yt-btn-action:active { transform: scale(0.97); }
            .yt-btn-secondary { background: rgba(255,255,255,0.1); color: #f1f1f1; }
            .yt-btn-secondary:hover { background: rgba(255,255,255,0.2); }
            .yt-btn-danger { background: rgba(239, 68, 68, 0.1); color: #ff4e45; }
            .yt-btn-danger:hover { background: rgba(239, 68, 68, 0.2); }

            .yt-accordion-header { font-size: 14px; font-weight: 500; color: #f1f1f1; margin: 0; padding: 14px 0; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center; cursor: pointer; user-select: none; transition: color 0.2s ease; }
            .yt-accordion-header:hover { color: #3ea6ff; }
            .yt-accordion-header svg { transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1); }
            .yt-accordion-header.active svg { transform: rotate(180deg); }

            .yt-accordion-content { display: grid; grid-template-rows: 0fr; opacity: 0; transition: grid-template-rows 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), margin 0.35s cubic-bezier(0.4, 0, 0.2, 1); margin-bottom: 0; }
            .yt-accordion-content.active { grid-template-rows: 1fr; opacity: 1; margin-bottom: 12px; }
            .yt-accordion-inner { min-height: 0; overflow: hidden; display: flex; flex-direction: column; }

            .yt-setting-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; width: 100%; box-sizing: border-box; border-bottom: 1px solid transparent; }
            .yt-setting-label { font-size: 14px; color: #f1f1f1; font-weight: 400; }
            .yt-setting-sublabel { font-size: 11px; color: #aaa; margin-top: 4px; line-height: 1.4; }

            .yt-settings-scroll::-webkit-scrollbar { width: 6px; }
            .yt-settings-scroll::-webkit-scrollbar-track { background: transparent; }
            .yt-settings-scroll::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 4px; transition: background 0.3s; }
            .yt-settings-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.4); }

            .yt-tooltip-anim {
                position: absolute; left: 50%; transform: translateX(-50%); background: #282828; border: 1px solid rgba(255,255,255,0.1); padding: 6px 8px; border-radius: 6px; display: flex; flex-direction: column; align-items: center; gap: 2px; opacity: 0; pointer-events: none;
                transition: opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1), bottom 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                z-index: 10; box-shadow: 0 4px 16px rgba(0,0,0,0.5);
                bottom: 80%;
            }
            .yt-analytics-bar-wrap:hover .yt-tooltip-anim { opacity: 1; bottom: 110%; }
        `;
        document.head.appendChild(style);
    }

    function refreshAccordionHeight() {
        const popupBox = document.getElementById('my-custom-yt-popup');
        if(!popupBox) return;
        const activeContent = popupBox.querySelector('.yt-accordion-content.active');
        if (activeContent) {
            activeContent.style.gridTemplateRows = '0fr';
            requestAnimationFrame(() => {
                activeContent.style.gridTemplateRows = '1fr';
            });
        }
    }

    window.addEventListener('storage', (e) => {
        if (e.key === 'yt-usage-data-v4') {
            const newData = JSON.parse(e.newValue);
            if (newData && newData.date === today) {
                usageData = newData;
                dailySeconds = usageData.dailySeconds;
                updateTimerUI();
            }
        }
    });

    setInterval(() => {
        if (!settings.activityMode || settings.timerPaused) return;

        if (document.visibilityState === 'visible' && document.hasFocus()) {
            const currentDay = new Date().toLocaleDateString();

            if (usageData.date !== currentDay) {
                usageData = { date: currentDay, dailySeconds: 0, buckets: Array(48).fill(0) };
                dailySeconds = 0;
            } else {
                usageData.dailySeconds++;
                const now = new Date();
                const bIdx = now.getHours() * 2 + Math.floor(now.getMinutes() / 30);
                usageData.buckets[bIdx]++;
                dailySeconds = usageData.dailySeconds;
            }

            localStorage.setItem('yt-usage-data-v4', JSON.stringify(usageData));
            updateTimerUI();

            const currentBlockedState = settings.feedLimitEnabled && dailySeconds >= settings.feedLimitMins * 60;
            if (currentBlockedState !== wasFeedBlocked) {
                wasFeedBlocked = currentBlockedState;
                applyFeatureCSS();

                const actionsDiv = document.getElementById('yt-limit-actions');
                if (actionsDiv) {
                    actionsDiv.style.display = currentBlockedState ? 'flex' : 'none';
                    refreshAccordionHeight();
                }
            }
        }
    }, 1000);

    function updateTimerUI() {
        if (!settings.activityMode) return;

        const timeEl = document.getElementById('yt-time-display');
        if (!timeEl) return;

        const h = Math.floor(dailySeconds / 3600);
        const m = Math.floor((dailySeconds % 3600) / 60);
        const s = dailySeconds % 60;

        let timeStr = '';
        if (h > 0) timeStr += `${h}h `;
        if (h > 0 || m > 0) timeStr += `${m}m `;
        timeStr += `${s}s`;

        timeEl.innerText = timeStr.trim();

        if (settings.timerPaused) {
            timeEl.style.color = '#888';
            timeEl.style.textShadow = 'none';
            drawBackgroundGraph();
            if (isDetailedOpen) updateDetailedGraph();
            return;
        }

        const blue = [59, 130, 246];
        const yellow = [234, 179, 8];
        const red = [239, 68, 68];

        const yellowSec = Math.max(1, settings.yellowThreshold * 60);
        const redSec = Math.max(yellowSec + 1, settings.redThreshold * 60);

        if (dailySeconds <= yellowSec) {
            const f = dailySeconds / yellowSec;
            currentColorRGB = [
                Math.round(blue[0] + f * (yellow[0] - blue[0])),
                Math.round(blue[1] + f * (yellow[1] - blue[1])),
                Math.round(blue[2] + f * (yellow[2] - blue[2]))
            ];
        } else if (dailySeconds <= redSec) {
            const f = (dailySeconds - yellowSec) / (redSec - yellowSec);
            currentColorRGB = [
                Math.round(yellow[0] + f * (red[0] - yellow[0])),
                Math.round(yellow[1] + f * (red[1] - yellow[1])),
                Math.round(yellow[2] + f * (red[2] - yellow[2]))
            ];
        } else {
            currentColorRGB = red;
        }

        timeEl.style.color = `rgb(${currentColorRGB[0]}, ${currentColorRGB[1]}, ${currentColorRGB[2]})`;
        timeEl.style.textShadow = `0 0 16px rgba(${currentColorRGB[0]}, ${currentColorRGB[1]}, ${currentColorRGB[2]}, 0.4)`;

        drawBackgroundGraph();
        if (isDetailedOpen) updateDetailedGraph();
    }

    document.addEventListener('fullscreenchange', () => {
        const isFS = !!document.fullscreenElement;
        const popup = document.getElementById('my-custom-yt-popup');
        const restoreBtn = document.getElementById('my-custom-yt-restore-btn');

        if (isFS) {
            if (popup) popup.style.setProperty('display', 'none', 'important');
            if (restoreBtn) restoreBtn.style.setProperty('display', 'none', 'important');
        } else {
            if (popupClosedByUser) return;
            const currentPath = window.location.pathname;
            const isAllowedPage = currentPath === '/' || currentPath === '/watch';
            if (!isAllowedPage) return;

            if (isMinimized || (!settings.activityMode && !document.getElementById('my-custom-yt-popup').classList.contains('settings-open'))) {
                if (popup) popup.style.display = 'none';
                if (restoreBtn) restoreBtn.style.display = 'flex';
            } else {
                if (popup) popup.style.display = 'flex';
                if (restoreBtn) restoreBtn.style.display = 'none';
            }
        }
    });

    function formatTime(idx) {
        const totalMins = idx * 30;
        const hh = Math.floor(totalMins / 60).toString().padStart(2, '0');
        const mm = (totalMins % 60).toString().padStart(2, '0');

        const nextMins = (idx + 1) * 30;
        const nhh = Math.floor(nextMins / 60).toString().padStart(2, '0');
        const nmm = (nextMins % 60).toString().padStart(2, '0');

        return `${hh}:${mm} - ${nhh === '24' ? '00' : nhh}:${nmm}`;
    }

    function formatTimeOnly(idx, isEnd = false) {
        const totalMins = isEnd ? (idx + 1) * 30 : idx * 30;
        const hh = Math.floor(totalMins / 60).toString().padStart(2, '0');
        const mm = (totalMins % 60).toString().padStart(2, '0');
        return `${hh === '24' ? '00' : hh}:${mm}`;
    }

    function formatUsage(secs) {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        if (m > 0) return `${m}m ${s}s`;
        return `${s}s`;
    }

    function showCustomPopup() {
        if (!ENABLE_POPUP || !document.body) return;

        injectUIStyles();

        const currentPath = window.location.pathname;
        const isAllowedPage = currentPath === '/' || currentPath === '/watch';
        const existingPopup = document.getElementById('my-custom-yt-popup');
        const existingRestoreBtn = document.getElementById('my-custom-yt-restore-btn');

        if (existingPopup) {
            if (document.fullscreenElement) return;

            if (currentPath !== lastPath) {
                if (currentPath === '/watch' && existingPopup.setCompact && settings.activityMode) {
                    existingPopup.setCompact(true);
                }
                lastPath = currentPath;
            }

            const isSettingsOpenLocally = existingPopup.classList.contains('settings-open');

            if (!isAllowedPage || popupClosedByUser) {
                existingPopup.style.display = 'none';
                if(existingRestoreBtn) existingRestoreBtn.style.display = 'none';
            } else if (isMinimized || (!settings.activityMode && !isSettingsOpenLocally)) {
                existingPopup.style.display = 'none';
                if(existingRestoreBtn) existingRestoreBtn.style.display = 'flex';
            } else {
                existingPopup.style.display = 'flex';
                if(existingRestoreBtn) existingRestoreBtn.style.display = 'none';
            }
            return;
        }

        if (!isAllowedPage || popupClosedByUser) return;
        if (document.fullscreenElement) return;

        let isSettingsOpen = !settings.activityMode;

        // SVGs
        const svgSettingsGear = `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M19.43 12.98c.04-.32.07-.64.07-.98 0-.34-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/></svg>`;
        const svgExpand = `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M21 11L21 3L13 3L16.3 6.3L10.6 12L12 13.4L17.7 7.7L21 11ZM3 13L3 21L11 21L7.7 17.7L13.4 12L12 10.6L6.3 16.3L3 13Z"/></svg>`;
        const svgMenu = `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 16.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5zM10.5 12c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5-.67-1.5-1.5-1.5-1.5.67-1.5 1.5zm0-6c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5-.67-1.5-1.5-1.5-1.5.67-1.5 1.5z"/></svg>`;
        const svgClose = `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12.71 12l8.15 8.15-.71.71L12 12.71l-8.15 8.15-.71-.71L11.29 12 3.15 3.85l.71-.71L12 11.29l8.15-8.15.71.71L12.71 12z"/></svg>`;
        const svgBack = `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>`;
        const svgGraph = `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z"/></svg>`;

        const iconClock = `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" style="opacity: 0.8"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>`;
        const iconFocus = `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" style="opacity: 0.8"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5.5-8c0-3.03 2.47-5.5 5.5-5.5s5.5 2.47 5.5 5.5-2.47 5.5-5.5 5.5-5.5-2.47-5.5-5.5z"/></svg>`;
        const iconPlayer = `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" style="opacity: 0.8"><path d="M8 5v14l11-7z"/></svg>`;
        const iconEye = `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" style="opacity: 0.8"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>`;
        const iconGear = `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" style="opacity: 0.8"><path d="M19.43 12.98c.04-.32.07-.64.07-.98 0-.34-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/></svg>`;
        const iconData = `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" style="opacity: 0.8"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 9h-2V7h2v5zm4 0h-2V7h2v5zM8 12H6V7h2v5z"/></svg>`;
        const iconChevron = `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/></svg>`;

        const svgPlaySolid = `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;
        const svgPauseSolid = `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;

        const btnStyle = `
            width: 34px; height: 34px; border-radius: 50%;
            background: transparent; border: none; color: #f1f1f1;
            display: flex; align-items: center; justify-content: center;
            cursor: pointer; transition: background 0.2s, transform 0.1s cubic-bezier(0.4, 0, 0.2, 1); padding: 0; flex-shrink: 0; box-sizing: border-box;
        `;

        const expandBtn = document.createElement('button');
        expandBtn.innerHTML = svgExpand;
        expandBtn.style.cssText = btnStyle;

        const backBtn = document.createElement('button');
        backBtn.innerHTML = svgBack;
        backBtn.style.cssText = btnStyle + 'display: none;';

        const menuBtn = document.createElement('button');
        menuBtn.innerHTML = svgMenu;
        menuBtn.style.cssText = btnStyle;

        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = svgClose;
        closeBtn.style.cssText = btnStyle;

        [expandBtn, backBtn, menuBtn, closeBtn].forEach(btn => {
            btn.onmouseover = () => btn.style.background = 'rgba(255, 255, 255, 0.15)';
            btn.onmouseout = () => btn.style.background = 'transparent';
            btn.onmousedown = () => btn.style.transform = 'scale(0.9)';
            btn.onmouseup = () => btn.style.transform = 'scale(1)';
        });

        const dropdown = document.createElement('div');
        dropdown.style.cssText = `
            position: absolute; right: 8px; background: #282828;
            border-radius: 12px; padding: 8px 0; display: none; flex-direction: column;
            min-width: 150px; box-shadow: 0 4px 20px rgba(0,0,0,0.6); z-index: 1000000;
        `;

        const ddItemStyle = `
            background: transparent; border: none; color: #f1f1f1; padding: 12px 18px; box-sizing: border-box;
            text-align: left; cursor: pointer; font-size: 14px; width: 100%; transition: background 0.2s;
        `;

        const compactOption = document.createElement('button');
        compactOption.innerText = 'Compact Mode';
        compactOption.style.cssText = ddItemStyle;

        const settingsOption = document.createElement('button');
        settingsOption.innerText = 'Settings';
        settingsOption.style.cssText = ddItemStyle;

        const resetPosOption = document.createElement('button');
        resetPosOption.innerText = 'Reset Position';
        resetPosOption.style.cssText = ddItemStyle;

        [compactOption, settingsOption, resetPosOption].forEach(btn => {
            btn.onmouseover = () => btn.style.background = 'rgba(255, 255, 255, 0.1)';
            btn.onmouseout = () => btn.style.background = 'transparent';
        });

        const restoreBtn = document.createElement('button');
        restoreBtn.id = 'my-custom-yt-restore-btn';
        restoreBtn.style.cssText = `
            position: fixed; bottom: 0; right: 48px; width: 64px; height: 28px; border-radius: 14px 14px 0 0;
            background: rgba(20, 20, 20, ${Math.max(0.6, settings.opacity / 100)}); backdrop-filter: blur(${settings.blur}px);
            color: #aaa; border: 1px solid rgba(255, 255, 255, 0.1); border-bottom: none; box-shadow: 0 -4px 20px rgba(0,0,0,0.5);
            display: flex; flex-direction: column; align-items: center; justify-content: flex-start; cursor: pointer; z-index: 999999;
            transition: height 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), background 0.3s, color 0.3s;
            padding-top: 4px; box-sizing: border-box;
        `;
        restoreBtn.innerHTML = `
            <div style="width: 24px; height: 3px; border-radius: 2px; background: rgba(255,255,255,0.2); margin-bottom: 4px; transition: background 0.3s;"></div>
            ${svgSettingsGear}
        `;
        restoreBtn.onmouseover = () => {
            restoreBtn.style.height = '38px';
            restoreBtn.style.color = '#3ea6ff';
            restoreBtn.style.background = 'rgba(35, 35, 35, 0.95)';
            restoreBtn.querySelector('div').style.background = 'rgba(255,255,255,0.5)';
        };
        restoreBtn.onmouseout = () => {
            restoreBtn.style.height = '28px';
            restoreBtn.style.color = '#aaa';
            restoreBtn.style.background = `rgba(20, 20, 20, ${Math.max(0.6, settings.opacity / 100)})`;
            restoreBtn.querySelector('div').style.background = 'rgba(255,255,255,0.2)';
        };
        document.body.appendChild(restoreBtn);

        const popupBox = document.createElement('div');
        popupBox.id = 'my-custom-yt-popup';
        if (isSettingsOpen) popupBox.classList.add('settings-open');

        popupBox.style.cssText = `
            position: fixed;
            background: rgba(15, 15, 15, ${settings.opacity / 100});
            backdrop-filter: blur(${settings.blur}px);
            color: #f1f1f1;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5), 0 2px 10px rgba(0, 0, 0, 0.2);
            font-family: 'Roboto', Arial, sans-serif;
            z-index: 999999;
            display: flex;
            flex-direction: column;
            transition: width 0.35s cubic-bezier(0.4, 0, 0.2, 1), border-radius 0.35s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s;
            overflow: visible;
        `;

        if (isMinimized || !settings.activityMode) {
            popupBox.style.display = 'none';
            restoreBtn.style.display = 'flex';
        } else {
            popupBox.style.display = 'flex';
            restoreBtn.style.display = 'none';
        }

        const header = document.createElement('div');
        header.style.cssText = `display: flex; justify-content: space-between; align-items: center; user-select: none; transition: padding 0.35s cubic-bezier(0.4, 0, 0.2, 1);`;
        const leftGroup = document.createElement('div');
        leftGroup.style.cssText = 'display: flex; align-items: center; gap: 8px;';
        const title = document.createElement('span');
        title.innerText = 'Advanced';
        title.style.cssText = `font-size: 16px; font-weight: 500; pointer-events: none; color: #f1f1f1; letter-spacing: 0.2px;`;
        const rightGroup = document.createElement('div');
        rightGroup.style.cssText = 'display: flex; align-items: center; gap: 4px; position: relative;';

        const mainContent = document.createElement('div');
        mainContent.style.cssText = 'display: flex; flex-direction: column; width: 100%; position: relative; min-height: 80px; transition: padding 0.35s cubic-bezier(0.4, 0, 0.2, 1); border-radius: 0 0 16px 16px;';

        const canvasBg = document.createElement('canvas');
        canvasBg.id = 'yt-bg-canvas';
        canvasBg.style.cssText = 'position:absolute; left:0; top:0; width:100%; height:100%; z-index:0; pointer-events:none; border-radius: 0 0 16px 16px; transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);';

        const timerWrapper = document.createElement('div');
        timerWrapper.style.cssText = 'position:relative; z-index:1; display:flex; flex-direction:column; align-items:center; justify-content:center; width: 100%; box-sizing: border-box; flex: 1; pointer-events: auto;';

        const timeDisplay = document.createElement('div');
        timeDisplay.id = 'yt-time-display';
        timeDisplay.style.cssText = 'font-weight: 700; transition: font-size 0.35s cubic-bezier(0.4, 0, 0.2, 1), color 1s ease; white-space: nowrap; text-align: center;';
        timeDisplay.innerText = '0s';

        const btnTimerToggle = document.createElement('button');
        btnTimerToggle.id = 'yt-timer-toggle-btn';
        btnTimerToggle.className = settings.timerPaused ? 'yt-timer-toggle-btn paused' : 'yt-timer-toggle-btn running';
        btnTimerToggle.innerHTML = settings.timerPaused ? svgPlaySolid : svgPauseSolid;
        btnTimerToggle.title = settings.timerPaused ? 'Resume Timer' : 'Pause Timer';

        const btnDetailed = document.createElement('button');
        btnDetailed.innerHTML = svgGraph;
        btnDetailed.style.cssText = 'position:absolute; bottom:12px; right:12px; background:transparent; border:none; color:#888; cursor:pointer; z-index:2; padding:8px; border-radius:50%; transition:color 0.2s, background 0.2s, transform 0.1s; display:flex; align-items:center; justify-content:center;';
        btnDetailed.onmouseover = () => { btnDetailed.style.color = '#f1f1f1'; btnDetailed.style.background = 'rgba(255,255,255,0.15)'; };
        btnDetailed.onmouseout = () => { btnDetailed.style.color = isDetailedOpen ? '#3ea6ff' : '#888'; btnDetailed.style.background = 'transparent'; };
        btnDetailed.onmousedown = () => { btnDetailed.style.transform = 'scale(0.9)'; };
        btnDetailed.onmouseup = () => { btnDetailed.style.transform = 'scale(1)'; };

        const detailedView = document.createElement('div');
        detailedView.id = 'yt-detailed-view';
        detailedView.style.cssText = 'display:none; flex-direction:column; width:100%; padding: 0 16px 54px 16px; box-sizing:border-box; z-index:1; position:relative; border-top: 1px solid rgba(255,255,255,0.05); margin-top: 16px;';
        detailedView.innerHTML = `
            <div id="yt-detailed-bars" style="display:flex; align-items:flex-end; height:80px; gap:2px; width:100%; position:relative;"></div>
            <div style="display:flex; justify-content:space-between; font-size:10px; color:#666; margin-top:6px; padding: 0 2px;" id="yt-detailed-labels"></div>
        `;

        timerWrapper.appendChild(timeDisplay);
        timerWrapper.appendChild(btnTimerToggle);
        mainContent.appendChild(canvasBg);
        mainContent.appendChild(timerWrapper);
        mainContent.appendChild(btnDetailed);
        mainContent.appendChild(detailedView);

        const settingsContent = document.createElement('div');
        settingsContent.className = 'yt-settings-scroll';
        settingsContent.style.cssText = 'display: none; flex-direction: column; padding: 0 16px 16px 16px; max-height: 480px; overflow-y: auto; overflow-x: hidden; width: 100%; box-sizing: border-box;';

        settingsContent.innerHTML = `
            <div class="yt-accordion-header active" data-target="yt-acc-limits">
                <div style="display:flex; align-items:center; gap:10px;">${iconClock} Timer & Limits</div>
                ${iconChevron}
            </div>
            <div class="yt-accordion-content active" id="yt-acc-limits">
                <div class="yt-accordion-inner">
                    <div class="yt-setting-row" style="padding-top: 4px;">
                        <span class="yt-setting-label">Yellow Warning (mins)</span>
                        <input type="number" id="yt-set-yellow" class="yt-number-input" value="${settings.yellowThreshold}" min="1">
                    </div>
                    <div class="yt-setting-row">
                        <span class="yt-setting-label">Red Warning (mins)</span>
                        <input type="number" id="yt-set-red" class="yt-number-input" value="${settings.redThreshold}" min="2">
                    </div>
                    <div class="yt-setting-row">
                        <div style="display:flex; flex-direction: column;">
                            <span class="yt-setting-label" style="color: #ff4e45;">Block Feeds Limit</span>
                            <span class="yt-setting-sublabel">Hides feeds when time is up</span>
                        </div>
                        <label class="yt-switch"><input type="checkbox" id="yt-set-feedlimit" ${settings.feedLimitEnabled ? 'checked' : ''}><span class="yt-slider"></span></label>
                    </div>
                    <div class="yt-setting-row" id="yt-row-feedlimit-mins" style="padding-bottom: 0; display: ${settings.feedLimitEnabled ? 'flex' : 'none'};">
                        <span class="yt-setting-label">Time Limit (mins)</span>
                        <input type="number" id="yt-set-feedlimit-mins" class="yt-number-input" value="${settings.feedLimitMins}" min="1">
                    </div>
                    <div id="yt-limit-actions" style="display: ${wasFeedBlocked ? 'flex' : 'none'}; flex-direction: column; gap: 8px; padding-top: 12px; padding-bottom: 4px;">
                        <button id="yt-btn-add-15" class="yt-btn-action yt-btn-secondary" style="margin: 0;">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                            Add +15 Mins
                        </button>
                        <button id="yt-btn-disable-limit" class="yt-btn-action yt-btn-danger" style="margin: 0;">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg>
                            Disable Limit & Unblock
                        </button>
                    </div>
                </div>
            </div>

            <div class="yt-accordion-header" data-target="yt-acc-focus">
                <div style="display:flex; align-items:center; gap:10px;">${iconFocus} Focus & Distractions</div>
                ${iconChevron}
            </div>
            <div class="yt-accordion-content" id="yt-acc-focus">
                <div class="yt-accordion-inner">
                    <div class="yt-setting-row" style="padding-top: 4px;">
                        <div style="display:flex; flex-direction: column;">
                            <span class="yt-setting-label">Hide Shorts</span>
                            <span class="yt-setting-sublabel">Removes from feed & sidebar</span>
                        </div>
                        <label class="yt-switch"><input type="checkbox" id="yt-set-shorts" ${settings.hideShorts ? 'checked' : ''}><span class="yt-slider"></span></label>
                    </div>
                    <div class="yt-setting-row">
                        <div style="display:flex; flex-direction: column;">
                            <span class="yt-setting-label">Hide Related Videos</span>
                            <span class="yt-setting-sublabel">Cleans the right sidebar</span>
                        </div>
                        <label class="yt-switch"><input type="checkbox" id="yt-set-related" ${settings.hideRelated ? 'checked' : ''}><span class="yt-slider"></span></label>
                    </div>
                    <div class="yt-setting-row">
                        <div style="display:flex; flex-direction: column;">
                            <span class="yt-setting-label">Hide Comments</span>
                            <span class="yt-setting-sublabel">Disable comment section</span>
                        </div>
                        <label class="yt-switch"><input type="checkbox" id="yt-set-comments" ${settings.hideComments ? 'checked' : ''}><span class="yt-slider"></span></label>
                    </div>
                    <div class="yt-setting-row">
                        <div style="display:flex; flex-direction: column;">
                            <span class="yt-setting-label">Hide Notification Bell</span>
                            <span class="yt-setting-sublabel">Remove top bar alerts</span>
                        </div>
                        <label class="yt-switch"><input type="checkbox" id="yt-set-bell" ${settings.hideBell ? 'checked' : ''}><span class="yt-slider"></span></label>
                    </div>
                    <div class="yt-setting-row">
                        <div style="display:flex; flex-direction: column;">
                            <span class="yt-setting-label">Hide Views & Dates</span>
                            <span class="yt-setting-sublabel">Reduces FOMO bias</span>
                        </div>
                        <label class="yt-switch"><input type="checkbox" id="yt-set-metrics" ${settings.hideMetrics ? 'checked' : ''}><span class="yt-slider"></span></label>
                    </div>
                    <div class="yt-setting-row" style="padding-bottom: 0;">
                        <div style="display:flex; flex-direction: column;">
                            <span class="yt-setting-label">Hide Merch & Store</span>
                            <span class="yt-setting-sublabel">Clean below video UI</span>
                        </div>
                        <label class="yt-switch"><input type="checkbox" id="yt-set-merch" ${settings.hideMerch ? 'checked' : ''}><span class="yt-slider"></span></label>
                    </div>
                </div>
            </div>

            <div class="yt-accordion-header" data-target="yt-acc-player">
                <div style="display:flex; align-items:center; gap:10px;">${iconPlayer} Player Tweaks</div>
                ${iconChevron}
            </div>
            <div class="yt-accordion-content" id="yt-acc-player">
                <div class="yt-accordion-inner">
                    <div class="yt-setting-row" style="padding-top: 4px;">
                        <div style="display:flex; flex-direction: column;">
                            <span class="yt-setting-label">Hide End Cards</span>
                            <span class="yt-setting-sublabel">Blocks last 10s video overlays</span>
                        </div>
                        <label class="yt-switch"><input type="checkbox" id="yt-set-endcards" ${settings.hideEndCards ? 'checked' : ''}><span class="yt-slider"></span></label>
                    </div>
                    <div class="yt-setting-row">
                        <div style="display:flex; flex-direction: column;">
                            <span class="yt-setting-label">Hide Channel Watermark</span>
                            <span class="yt-setting-sublabel">Removes bottom right logos</span>
                        </div>
                        <label class="yt-switch"><input type="checkbox" id="yt-set-watermark" ${settings.hideWatermarks ? 'checked' : ''}><span class="yt-slider"></span></label>
                    </div>
                    <div class="yt-setting-row" style="padding-bottom: 0;">
                        <div style="display:flex; flex-direction: column;">
                            <span class="yt-setting-label">Progress Bar Color</span>
                            <span class="yt-setting-sublabel">Custom theme color</span>
                        </div>
                        <select id="yt-set-pcolor" class="yt-select">
                            <option value="default" ${settings.playerColor==='default'?'selected':''}>Default Red</option>
                            <option value="blue" ${settings.playerColor==='blue'?'selected':''}>Ocean Blue</option>
                            <option value="green" ${settings.playerColor==='green'?'selected':''}>Neon Green</option>
                            <option value="purple" ${settings.playerColor==='purple'?'selected':''}>Royal Purple</option>
                            <option value="pink" ${settings.playerColor==='pink'?'selected':''}>Hot Pink</option>
                            <option value="orange" ${settings.playerColor==='orange'?'selected':''}>Sunset Orange</option>
                        </select>
                    </div>
                </div>
            </div>

            <div class="yt-accordion-header" data-target="yt-acc-visuals-ui">
                <div style="display:flex; align-items:center; gap:10px;">${iconEye} Interface Visuals</div>
                ${iconChevron}
            </div>
            <div class="yt-accordion-content" id="yt-acc-visuals-ui">
                <div class="yt-accordion-inner">
                    <div class="yt-setting-row" style="flex-direction: column; align-items: flex-start; padding-top: 4px;">
                        <span class="yt-setting-label">Custom Logo Text</span>
                        <input type="text" id="yt-set-logo-text" class="yt-text-input" value="${settings.logoText}">
                    </div>
                    <div class="yt-setting-row">
                        <span class="yt-setting-label">Glow Logo Effect</span>
                        <label class="yt-switch"><input type="checkbox" id="yt-set-glow" ${settings.glow ? 'checked' : ''}><span class="yt-slider"></span></label>
                    </div>
                    <div class="yt-setting-row">
                        <span class="yt-setting-label">Hide Voice Search</span>
                        <label class="yt-switch"><input type="checkbox" id="yt-set-voice" ${settings.voice ? 'checked' : ''}><span class="yt-slider"></span></label>
                    </div>
                    <div class="yt-setting-row">
                        <span class="yt-setting-label">Hide Header Texts</span>
                        <label class="yt-switch"><input type="checkbox" id="yt-set-texts" ${settings.texts ? 'checked' : ''}><span class="yt-slider"></span></label>
                    </div>
                    <div class="yt-setting-row" style="flex-direction: column; align-items: flex-start;">
                        <div style="display:flex; justify-content:space-between; width:100%;">
                            <span class="yt-setting-label">Background Opacity</span>
                            <span class="yt-setting-label" id="yt-opacity-val" style="color:#aaa;">${settings.opacity}%</span>
                        </div>
                        <input type="range" id="yt-set-opacity" class="yt-range" min="20" max="100" value="${settings.opacity}">
                    </div>
                    <div class="yt-setting-row" style="flex-direction: column; align-items: flex-start;">
                        <div style="display:flex; justify-content:space-between; width:100%;">
                            <span class="yt-setting-label">Background Blur</span>
                            <span class="yt-setting-label" id="yt-blur-val" style="color:#aaa;">${settings.blur}px</span>
                        </div>
                        <input type="range" id="yt-set-blur" class="yt-range" min="0" max="30" value="${settings.blur}">
                    </div>
                    <div class="yt-setting-row" style="flex-direction: column; align-items: flex-start; padding-bottom: 0;">
                        <div style="display:flex; justify-content:space-between; width:100%;">
                            <span class="yt-setting-label">Graph Opacity</span>
                            <span class="yt-setting-label" id="yt-graph-op-val" style="color:#aaa;">${settings.graphOpacity}%</span>
                        </div>
                        <input type="range" id="yt-set-graph-opacity" class="yt-range" min="0" max="100" value="${settings.graphOpacity}">
                    </div>
                </div>
            </div>

            <div class="yt-accordion-header" data-target="yt-acc-behavior">
                <div style="display:flex; align-items:center; gap:10px;">${svgSettingsGear} Behavior</div>
                ${iconChevron}
            </div>
            <div class="yt-accordion-content" id="yt-acc-behavior">
                <div class="yt-accordion-inner">
                    <div class="yt-setting-row" style="padding-top: 4px;">
                        <div style="display:flex; flex-direction: column;">
                            <span class="yt-setting-label">Activity Mode</span>
                            <span class="yt-setting-sublabel">Show timer and tracking features</span>
                        </div>
                        <label class="yt-switch"><input type="checkbox" id="yt-set-activity" ${settings.activityMode ? 'checked' : ''}><span class="yt-slider"></span></label>
                    </div>
                    <div class="yt-setting-row">
                        <div style="display:flex; flex-direction: column;">
                            <span class="yt-setting-label">Compact Corner</span>
                            <span class="yt-setting-sublabel">Where it docks when shrunk</span>
                        </div>
                        <select id="yt-set-corner" class="yt-select">
                            <option value="br" ${settings.compactCorner==='br'?'selected':''}>Bottom Right</option>
                            <option value="bl" ${settings.compactCorner==='bl'?'selected':''}>Bottom Left</option>
                            <option value="tr" ${settings.compactCorner==='tr'?'selected':''}>Top Right</option>
                            <option value="tl" ${settings.compactCorner==='tl'?'selected':''}>Top Left</option>
                        </select>
                    </div>
                    <div class="yt-setting-row" style="padding-bottom: 0;">
                        <div style="display:flex; flex-direction: column;">
                            <span class="yt-setting-label">Destroy on Close</span>
                            <span class="yt-setting-sublabel">Removes completely instead of minimize</span>
                        </div>
                        <label class="yt-switch"><input type="checkbox" id="yt-set-destroy" ${settings.destroyOnClose ? 'checked' : ''}><span class="yt-slider"></span></label>
                    </div>
                </div>
            </div>

            <div class="yt-accordion-header" data-target="yt-acc-data" style="border-bottom: none;">
                <div style="display:flex; align-items:center; gap:10px;">${iconData} Data Controls</div>
                ${iconChevron}
            </div>
            <div class="yt-accordion-content" id="yt-acc-data">
                <div class="yt-accordion-inner">
                    <button id="yt-set-reset" class="yt-btn-action yt-btn-secondary" style="margin-top: 0;">Reset Timer</button>
                    <button id="yt-set-reset-all" class="yt-btn-action yt-btn-danger">Reset All Settings</button>
                </div>
            </div>
        `;

        leftGroup.appendChild(expandBtn);
        leftGroup.appendChild(backBtn);
        leftGroup.appendChild(title);
        rightGroup.appendChild(menuBtn);
        rightGroup.appendChild(dropdown);
        rightGroup.appendChild(closeBtn);
        header.appendChild(leftGroup);
        header.appendChild(rightGroup);

        dropdown.appendChild(compactOption);
        dropdown.appendChild(settingsOption);
        dropdown.appendChild(resetPosOption);

        popupBox.appendChild(header);
        popupBox.appendChild(mainContent);
        popupBox.appendChild(settingsContent);
        document.body.appendChild(popupBox);

        setTimeout(() => {
            const headers = popupBox.querySelectorAll('.yt-accordion-header');

            headers.forEach(h => {
                h.addEventListener('click', () => {
                    const targetId = h.getAttribute('data-target');
                    const isActive = h.classList.contains('active');

                    popupBox.querySelectorAll('.yt-accordion-header').forEach(el => el.classList.remove('active'));
                    popupBox.querySelectorAll('.yt-accordion-content').forEach(el => el.classList.remove('active'));

                    if (!isActive) {
                        h.classList.add('active');
                        document.getElementById(targetId).classList.add('active');
                    }
                });
            });

            if (btnTimerToggle) {
                btnTimerToggle.addEventListener('click', (e) => {
                    e.stopPropagation();
                    settings.timerPaused = !settings.timerPaused;
                    saveSettings();
                    btnTimerToggle.className = settings.timerPaused ? 'yt-timer-toggle-btn paused' : 'yt-timer-toggle-btn running';
                    btnTimerToggle.innerHTML = settings.timerPaused ? svgPlaySolid : svgPauseSolid;
                    btnTimerToggle.title = settings.timerPaused ? 'Resume Timer' : 'Pause Timer';
                    updateTimerUI();
                });
            }

            document.getElementById('yt-btn-add-15').addEventListener('click', () => {
                settings.feedLimitMins += 15;
                document.getElementById('yt-set-feedlimit-mins').value = settings.feedLimitMins;
                saveSettings();
                wasFeedBlocked = false;
                document.getElementById('yt-limit-actions').style.display = 'none';
            });

            document.getElementById('yt-btn-disable-limit').addEventListener('click', () => {
                settings.feedLimitEnabled = false;
                document.getElementById('yt-set-feedlimit').checked = false;
                document.getElementById('yt-row-feedlimit-mins').style.display = 'none';
                saveSettings();
                wasFeedBlocked = false;
                document.getElementById('yt-limit-actions').style.display = 'none';
            });

            document.getElementById('yt-set-feedlimit').addEventListener('change', (e) => {
                settings.feedLimitEnabled = e.target.checked;
                saveSettings();
                document.getElementById('yt-row-feedlimit-mins').style.display = settings.feedLimitEnabled ? 'flex' : 'none';
                wasFeedBlocked = settings.feedLimitEnabled && dailySeconds >= settings.feedLimitMins * 60;
                document.getElementById('yt-limit-actions').style.display = wasFeedBlocked ? 'flex' : 'none';
            });
            document.getElementById('yt-set-feedlimit-mins').addEventListener('change', (e) => {
                let val = parseInt(e.target.value) || 1;
                e.target.value = val;
                settings.feedLimitMins = val;
                saveSettings();
                wasFeedBlocked = settings.feedLimitEnabled && dailySeconds >= settings.feedLimitMins * 60;
                document.getElementById('yt-limit-actions').style.display = wasFeedBlocked ? 'flex' : 'none';
            });

            const bindCheck = (id, key) => {
                const el = document.getElementById(id);
                if (el) el.addEventListener('change', (e) => { settings[key] = e.target.checked; saveSettings(); });
            };
            bindCheck('yt-set-comments', 'hideComments');
            bindCheck('yt-set-bell', 'hideBell');
            bindCheck('yt-set-metrics', 'hideMetrics');
            bindCheck('yt-set-merch', 'hideMerch');
            bindCheck('yt-set-endcards', 'hideEndCards');
            bindCheck('yt-set-watermark', 'hideWatermarks');
            bindCheck('yt-set-shorts', 'hideShorts');
            bindCheck('yt-set-related', 'hideRelated');
            bindCheck('yt-set-glow', 'glow');
            bindCheck('yt-set-voice', 'voice');
            bindCheck('yt-set-texts', 'texts');

            document.getElementById('yt-set-pcolor').addEventListener('change', (e) => { settings.playerColor = e.target.value; saveSettings(); });
            document.getElementById('yt-set-activity').addEventListener('change', (e) => { settings.activityMode = e.target.checked; saveSettings(); applyState(); });
            document.getElementById('yt-set-corner').addEventListener('change', (e) => { settings.compactCorner = e.target.value; saveSettings(); if(isCompact){ applyState(); } });
            document.getElementById('yt-set-destroy').addEventListener('change', (e) => { settings.destroyOnClose = e.target.checked; saveSettings(); });

            const logoInput = document.getElementById('yt-set-logo-text');
            logoInput.addEventListener('input', (e) => {
                settings.logoText = e.target.value;
                saveSettings();
                const textEl = document.getElementById('yt-custom-logo-text-el');
                if (textEl) textEl.innerText = settings.logoText;
            });

            const yellowInput = document.getElementById('yt-set-yellow');
            const redInput = document.getElementById('yt-set-red');

            yellowInput.addEventListener('change', (e) => {
                let val = parseInt(e.target.value) || 1;
                if (val >= settings.redThreshold) val = settings.redThreshold - 1;
                e.target.value = val;
                settings.yellowThreshold = val;
                saveSettings();
            });

            redInput.addEventListener('change', (e) => {
                let val = parseInt(e.target.value) || 2;
                if (val <= settings.yellowThreshold) val = settings.yellowThreshold + 1;
                e.target.value = val;
                settings.redThreshold = val;
                saveSettings();
            });

            const opSlider = document.getElementById('yt-set-opacity');
            const opVal = document.getElementById('yt-opacity-val');
            opSlider.addEventListener('input', (e) => {
                settings.opacity = e.target.value;
                opVal.innerText = `${settings.opacity}%`;
                popupBox.style.background = `rgba(15, 15, 15, ${settings.opacity / 100})`;
                restoreBtn.style.background = `rgba(20, 20, 20, ${Math.max(0.6, settings.opacity / 100)})`;
            });
            opSlider.addEventListener('change', () => saveSettings());

            const blurSlider = document.getElementById('yt-set-blur');
            const blurVal = document.getElementById('yt-blur-val');
            blurSlider.addEventListener('input', (e) => {
                settings.blur = e.target.value;
                blurVal.innerText = `${settings.blur}px`;
                popupBox.style.backdropFilter = `blur(${settings.blur}px)`;
                restoreBtn.style.backdropFilter = `blur(${settings.blur}px)`;
            });
            blurSlider.addEventListener('change', () => saveSettings());

            const graphOpSlider = document.getElementById('yt-set-graph-opacity');
            const graphOpVal = document.getElementById('yt-graph-op-val');
            if (graphOpSlider) {
                graphOpSlider.addEventListener('input', (e) => {
                    settings.graphOpacity = e.target.value;
                    graphOpVal.innerText = `${settings.graphOpacity}%`;
                    drawBackgroundGraph();
                });
                graphOpSlider.addEventListener('change', () => saveSettings());
            }

            document.getElementById('yt-set-reset').addEventListener('click', () => {
                dailySeconds = 0;
                usageData.dailySeconds = 0;
                usageData.buckets = Array(48).fill(0);
                localStorage.setItem('yt-usage-data-v4', JSON.stringify(usageData));
                updateTimerUI();
                if (isDetailedOpen) updateDetailedGraph(true);
            });

            document.getElementById('yt-set-reset-all').addEventListener('click', () => {
                if(confirm("Are you sure you want to reset all settings? This will reload the page.")) {
                    localStorage.removeItem('yt-custom-settings');
                    localStorage.removeItem('yt-popup-pos');
                    localStorage.removeItem('yt-popup-minimized');
                    localStorage.removeItem('yt-detailed-open');
                    location.reload();
                }
            });
        }, 100);

        let isCompact = localStorage.getItem('yt-popup-compact') === 'true';
        if (currentPath === '/watch' && settings.activityMode) isCompact = true;

        btnDetailed.onclick = () => {
            isDetailedOpen = !isDetailedOpen;
            localStorage.setItem('yt-detailed-open', isDetailedOpen);

            if (isDetailedOpen) {
                preDetailPos = { left: popupBox.style.left, top: popupBox.style.top, bottom: popupBox.style.bottom, right: popupBox.style.right };
                draggedInDetail = false;
                requestAnimationFrame(() => updateDetailedGraph());
                applyState();
            } else {
                applyState();

                if (!draggedInDetail && preDetailPos) {
                    setTimeout(() => {
                        popupBox.style.transition = 'none';
                        popupBox.style.left = preDetailPos.left;
                        popupBox.style.top = preDetailPos.top;
                        popupBox.style.bottom = preDetailPos.bottom;
                        popupBox.style.right = preDetailPos.right;

                        localStorage.setItem('yt-popup-pos', JSON.stringify({
                            left: popupBox.style.left,
                            top: popupBox.style.top
                        }));

                        void popupBox.offsetWidth;
                        popupBox.style.transition = 'width 0.35s cubic-bezier(0.4, 0, 0.2, 1), border-radius 0.35s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s';
                        ensureInBounds();
                    }, 10);
                }
            }
        };

        window.addEventListener('resize', () => {
            if (popupBox && popupBox.style.display !== 'none' && popupBox.style.left !== 'auto') {
                ensureInBounds();
            }
        });

        function ensureInBounds() {
            setTimeout(() => {
                if (popupBox.style.display === 'none' || popupBox.style.left === 'auto') return;

                const rect = popupBox.getBoundingClientRect();
                let currentLeftPx = rect.left;
                let currentTopPx = rect.top;
                let changed = false;

                const maxLeft = window.innerWidth - rect.width - 24;
                const maxTop = window.innerHeight - rect.height - 24;

                if (currentLeftPx > maxLeft + 2) { currentLeftPx = maxLeft; changed = true; }
                if (currentLeftPx < 22) { currentLeftPx = 24; changed = true; }

                if (currentTopPx > maxTop + 2) { currentTopPx = maxTop; changed = true; }
                if (currentTopPx < 22) { currentTopPx = 24; changed = true; }

                if (changed) {
                    popupBox.style.left = currentLeftPx + 'px';
                    popupBox.style.top = currentTopPx + 'px';
                    popupBox.style.bottom = 'auto';
                    popupBox.style.right = 'auto';

                    localStorage.setItem('yt-popup-pos', JSON.stringify({
                        left: popupBox.style.left,
                        top: popupBox.style.top
                    }));
                }
            }, 360);
        }

        function applyPosition(isCompactMode) {
            const savedPos = JSON.parse(localStorage.getItem('yt-popup-pos'));
            if (savedPos && savedPos.left && savedPos.top && savedPos.left !== 'auto') {
                popupBox.style.left = savedPos.left;
                popupBox.style.top = savedPos.top;
                popupBox.style.bottom = 'auto';
                popupBox.style.right = 'auto';
            } else {
                popupBox.style.top = 'auto';
                popupBox.style.bottom = 'auto';
                popupBox.style.left = 'auto';
                popupBox.style.right = 'auto';

                if (isCompactMode && !isSettingsOpen) {
                    if (settings.compactCorner === 'br') { popupBox.style.bottom = '24px'; popupBox.style.right = '24px'; }
                    else if (settings.compactCorner === 'bl') { popupBox.style.bottom = '24px'; popupBox.style.left = '24px'; }
                    else if (settings.compactCorner === 'tr') { popupBox.style.top = '70px'; popupBox.style.right = '24px'; }
                    else if (settings.compactCorner === 'tl') { popupBox.style.top = '70px'; popupBox.style.left = '24px'; }
                    else { popupBox.style.bottom = '24px'; popupBox.style.right = '24px'; }
                } else {
                    popupBox.style.bottom = '24px';
                    popupBox.style.right = '24px';
                }
            }
        }

        function applyState() {
            if (isSettingsOpen) popupBox.classList.add('settings-open');
            else popupBox.classList.remove('settings-open');

            if (!settings.activityMode && !isSettingsOpen && !isMinimized) {
                isMinimized = true;
                localStorage.setItem('yt-popup-minimized', 'true');
                popupBox.style.display = 'none';
                restoreBtn.style.display = 'flex';
                return;
            }

            if (isSettingsOpen) {
                popupBox.style.width = '290px';
                popupBox.style.minWidth = 'auto';
                popupBox.style.borderRadius = '16px';
                popupBox.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                popupBox.style.padding = '0';

                header.style.padding = '12px 14px 12px 14px';
                header.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';

                title.innerText = 'Settings';
                title.style.display = 'block';

                backBtn.style.display = settings.activityMode ? 'flex' : 'none';
                expandBtn.style.display = 'none';
                menuBtn.style.display = 'none';

                mainContent.style.display = 'none';
                settingsContent.style.display = 'flex';

                if (btnTimerToggle) btnTimerToggle.style.display = 'none';

                applyPosition(false);
                ensureInBounds();
                return;
            }

            title.innerText = 'Advanced';
            backBtn.style.display = 'none';
            settingsContent.style.display = 'none';

            if (isCompact) {
                popupBox.style.width = 'auto';
                popupBox.style.minWidth = 'max-content';
                popupBox.style.borderRadius = '32px';
                popupBox.style.border = '1px solid rgba(255,255,255,0.08)';
                popupBox.style.padding = '6px 8px 6px 10px';

                header.style.padding = '0';
                header.style.borderBottom = 'none';

                title.style.display = 'none';
                menuBtn.style.display = 'none';
                expandBtn.style.display = 'flex';

                timerWrapper.style.padding = '0';
                timeDisplay.style.fontSize = '15px';
                timeDisplay.style.margin = '0 14px';

                if (btnTimerToggle) btnTimerToggle.style.display = 'none';

                header.insertBefore(timeDisplay, rightGroup);

                mainContent.style.display = 'none';

                applyPosition(true);

            } else {
                popupBox.style.width = '260px';
                popupBox.style.minWidth = 'auto';
                popupBox.style.borderRadius = '16px';
                popupBox.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                popupBox.style.padding = '0';

                header.style.padding = '12px 14px';
                header.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';

                title.style.display = 'block';
                menuBtn.style.display = 'flex';
                expandBtn.style.display = 'none';

                timerWrapper.appendChild(timeDisplay);
                timerWrapper.style.padding = '24px 16px';
                timeDisplay.style.fontSize = '34px';
                timeDisplay.style.margin = '0';

                if (btnTimerToggle) {
                    timerWrapper.appendChild(btnTimerToggle);
                    btnTimerToggle.style.display = 'flex';
                }

                mainContent.style.display = 'flex';

                if (isDetailedOpen) {
                    detailedView.style.display = 'flex';
                    btnDetailed.style.color = '#3ea6ff';
                    canvasBg.style.opacity = '0';
                } else {
                    detailedView.style.display = 'none';
                    btnDetailed.style.color = '#888';
                    canvasBg.style.opacity = '1';
                }

                applyPosition(false);
            }

            drawBackgroundGraph();
            ensureInBounds();
        }

        popupBox.setCompact = (val) => {
            isSettingsOpen = false;
            isCompact = val;
            localStorage.setItem('yt-popup-compact', val);
            applyState();
        };

        menuBtn.onclick = (e) => {
            e.stopPropagation();
            if (dropdown.style.display === 'flex') {
                dropdown.style.display = 'none';
                dropdown.classList.remove('yt-dropdown-anim');
            } else {
                dropdown.style.display = 'flex';
                dropdown.classList.add('yt-dropdown-anim');

                dropdown.style.top = '100%';
                dropdown.style.bottom = 'auto';
                dropdown.style.marginTop = '8px';
                dropdown.style.marginBottom = '0';

                const btnRect = menuBtn.getBoundingClientRect();
                const ddRect = dropdown.getBoundingClientRect();

                if (btnRect.bottom + ddRect.height + 16 > window.innerHeight) {
                    dropdown.style.top = 'auto';
                    dropdown.style.bottom = '100%';
                    dropdown.style.marginTop = '0';
                    dropdown.style.marginBottom = '8px';
                }
            }
        };

        compactOption.onclick = () => {
            dropdown.style.display = 'none';
            dropdown.classList.remove('yt-dropdown-anim');
            popupBox.setCompact(true);
        };

        settingsOption.onclick = () => {
            dropdown.style.display = 'none';
            dropdown.classList.remove('yt-dropdown-anim');
            isSettingsOpen = true;
            applyState();
        };

        resetPosOption.onclick = () => {
            dropdown.style.display = 'none';
            dropdown.classList.remove('yt-dropdown-anim');
            localStorage.removeItem('yt-popup-pos');
            applyState();
        };

        backBtn.onclick = () => {
            if (!settings.activityMode) {
                isMinimized = true;
                isSettingsOpen = false;
                localStorage.setItem('yt-popup-minimized', 'true');
                popupBox.style.display = 'none';
                restoreBtn.style.display = 'flex';
            } else {
                isSettingsOpen = false;
                applyState();
            }
        };

        expandBtn.onclick = () => {
            popupBox.setCompact(false);
        };

        closeBtn.onclick = () => {
            if (settings.destroyOnClose) {
                popupClosedByUser = true;
                popupBox.style.display = 'none';
                restoreBtn.style.display = 'none';
            } else {
                isMinimized = true;
                isSettingsOpen = false;
                localStorage.setItem('yt-popup-minimized', 'true');
                popupBox.style.display = 'none';
                restoreBtn.style.display = 'flex';
            }
        };

        restoreBtn.onclick = () => {
            isMinimized = false;
            localStorage.setItem('yt-popup-minimized', 'false');

            if (!settings.activityMode) {
                isSettingsOpen = true;
            }

            restoreBtn.style.display = 'none';
            popupBox.style.display = 'flex';
            applyState();
        };

        document.addEventListener('click', (e) => {
            if (!menuBtn.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.style.display = 'none';
                dropdown.classList.remove('yt-dropdown-anim');
            }
        });

        applyState();
        updateTimerUI();

        let isDragging = false;
        let dragOffsetX, dragOffsetY;

        popupBox.addEventListener('mousedown', (e) => {
            if (e.target.closest('button') || e.target.closest('input') || e.target.closest('select') || e.target.closest('.yt-slider') || e.target.closest('.yt-accordion-header') || e.target.closest('.yt-analytics-bar-wrap') || e.target.closest('.yt-radio-btn')) return;
            isDragging = true;
            const rect = popupBox.getBoundingClientRect();

            popupBox.style.left = rect.left + 'px';
            popupBox.style.top = rect.top + 'px';
            popupBox.style.bottom = 'auto';
            popupBox.style.right = 'auto';

            dragOffsetX = e.clientX - rect.left;
            dragOffsetY = e.clientY - rect.top;
            popupBox.style.cursor = 'grabbing';
            popupBox.style.transition = 'none';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            let newLeft = e.clientX - dragOffsetX;
            let newTop = e.clientY - dragOffsetY;

            const maxLeft = window.innerWidth - popupBox.offsetWidth;
            const maxTop = window.innerHeight - popupBox.offsetHeight;

            if (newLeft < 0) newLeft = 0;
            if (newTop < 0) newTop = 0;
            if (newLeft > maxLeft) newLeft = maxLeft;
            if (newTop > maxTop) newTop = maxTop;

            popupBox.style.left = newLeft + 'px';
            popupBox.style.top = newTop + 'px';
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                popupBox.style.cursor = 'default';
                popupBox.style.transition = 'width 0.35s cubic-bezier(0.4, 0, 0.2, 1), border-radius 0.35s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s';

                if (isDetailedOpen) draggedInDetail = true;
                localStorage.setItem('yt-popup-pos', JSON.stringify({
                    left: popupBox.style.left,
                    top: popupBox.style.top
                }));
            }
        });
    }

    function drawBackgroundGraph() {
        const canvas = document.getElementById('yt-bg-canvas');
        if (!canvas || !canvas.parentElement) return;

        const rect = canvas.parentElement.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;

        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);

        const w = rect.width;
        const h = rect.height;
        ctx.clearRect(0, 0, w, h);

        if (isDetailedOpen) return;

        const buckets = usageData.buckets;
        const now = new Date();
        const currentIdx = now.getHours() * 2 + Math.floor(now.getMinutes() / 30);

        let firstIdx = buckets.findIndex(v => v > 0);
        if (firstIdx === -1) return;
        if (firstIdx > currentIdx) firstIdx = currentIdx;

        const span = Math.max(6, currentIdx - firstIdx + 1);
        const barW = w / span;

        let maxVal = 1;
        for (let i = firstIdx; i <= currentIdx; i++) {
            if (buckets[i] > maxVal) maxVal = buckets[i];
        }

        const graphH = h * 0.40;
        const baseAlpha = (settings.graphOpacity !== undefined ? settings.graphOpacity : 25) / 100;

        for (let i = firstIdx; i <= currentIdx; i++) {
            if (buckets[i] === 0) continue;

            const x = (i - firstIdx) * barW;
            const barH = Math.max(2, (buckets[i] / maxVal) * graphH);
            const y = h - barH;

            const grad = ctx.createLinearGradient(0, y, 0, h);
            grad.addColorStop(0, `rgba(${currentColorRGB.join(',')}, ${0.6 * baseAlpha})`);
            grad.addColorStop(1, `rgba(${currentColorRGB.join(',')}, 0.0)`);
            ctx.fillStyle = grad;

            const gap = barW >= 4 ? 1 : 0;
            ctx.fillRect(x, y, barW - gap, barH);

            ctx.fillStyle = `rgba(${currentColorRGB.join(',')}, ${0.95 * baseAlpha})`;
            ctx.fillRect(x, y, barW - gap, 2);
        }
    }

    function updateDetailedGraph(forceRebuild = false) {
        const container = document.getElementById('yt-detailed-bars');
        const labels = document.getElementById('yt-detailed-labels');
        if (!container || !labels) return;

        const buckets = usageData.buckets;
        const now = new Date();
        const currentIdx = now.getHours() * 2 + Math.floor(now.getMinutes() / 30);

        let firstIdx = buckets.findIndex(v => v > 0);
        if (firstIdx === -1) firstIdx = Math.max(0, currentIdx - 5);
        if (firstIdx > currentIdx) firstIdx = currentIdx;

        let span = currentIdx - firstIdx + 1;
        if (span < 6) {
            firstIdx = Math.max(0, currentIdx - 5);
            span = currentIdx - firstIdx + 1;
        }

        let maxH = 60;
        for(let i = firstIdx; i <= currentIdx; i++) {
            if(buckets[i] > maxH) maxH = buckets[i];
        }

        if (forceRebuild || container.children.length !== span || container.dataset.firstIdx !== String(firstIdx)) {
            container.innerHTML = '';
            container.dataset.firstIdx = firstIdx;

            for(let i = firstIdx; i <= currentIdx; i++) {
                const barWrapper = document.createElement('div');
                barWrapper.className = 'yt-analytics-bar-wrap';
                barWrapper.style.cssText = `flex: 1; display:flex; flex-direction:column; justify-content:flex-end; align-items:center; position:relative; height: 100%; cursor:crosshair;`;

                const bar = document.createElement('div');
                const tooltip = document.createElement('div');

                tooltip.className = 'yt-tooltip-anim';

                let posCSS = 'left: 50%; transform: translateX(-50%);';
                const idxOffset = i - firstIdx;
                if (idxOffset < Math.floor(span * 0.15)) posCSS = 'left: 0; transform: none;';
                else if (idxOffset > Math.ceil(span * 0.85)) posCSS = 'right: 0; left: auto; transform: none;';

                tooltip.style.left = posCSS.includes('left: 0') ? '0' : (posCSS.includes('right: 0') ? 'auto' : '50%');
                tooltip.style.right = posCSS.includes('right: 0') ? '0' : 'auto';
                tooltip.style.transform = posCSS.includes('transform: none') ? 'none' : 'translateX(-50%)';

                const timeSpan = document.createElement('span');
                timeSpan.style.cssText = `color:#aaa; font-size:10px; font-weight:500; white-space:nowrap; letter-spacing: 0.3px;`;

                const valSpan = document.createElement('span');
                valSpan.style.cssText = `color:#3ea6ff; font-weight:700; font-size:13px; white-space:nowrap;`;

                tooltip.appendChild(timeSpan);
                tooltip.appendChild(valSpan);

                barWrapper.onmouseover = () => {
                   bar.style.background = '#fff';
                };
                barWrapper.onmouseout = () => {
                   const val = buckets[i];
                   const barColor = `rgb(${currentColorRGB.join(',')})`;
                   bar.style.background = val > 0 ? barColor : 'rgba(255,255,255,0.05)';
                };

                barWrapper.appendChild(tooltip);
                barWrapper.appendChild(bar);
                container.appendChild(barWrapper);
            }
        }

        const barWrappers = container.children;
        const barColor = `rgb(${currentColorRGB.join(',')})`;

        for(let i = firstIdx; i <= currentIdx; i++) {
            const val = buckets[i];
            const wIdx = i - firstIdx;
            const barWrapper = barWrappers[wIdx];
            if(!barWrapper) continue;

            const tooltip = barWrapper.children[0];
            const timeSpan = tooltip.children[0];
            const valSpan = tooltip.children[1];
            const bar = barWrapper.children[1];

            const pct = (val / maxH) * 100;
            const hPx = val > 0 ? Math.max(3, pct) : 1;

            bar.style.cssText = `width: 90%; max-width: 8px; background: ${val > 0 ? barColor : 'rgba(255,255,255,0.05)'}; height: ${hPx}%; border-radius: 2px 2px 0 0; transition: height 0.4s cubic-bezier(0.25, 0.8, 0.25, 1), background 0.2s;`;

            timeSpan.innerText = formatTime(i);
            valSpan.innerText = formatUsage(val);
            valSpan.style.color = barColor;
        }

        labels.innerHTML = `<span>${formatTimeOnly(firstIdx)}</span><span>${formatTimeOnly(currentIdx, true)}</span>`;
    }

    function changeLogoContent() {
        const logo = document.querySelector('ytd-topbar-logo-renderer #logo.yt-simple-endpoint');
        if (logo && !logo.dataset.modified) {
            logo.dataset.modified = 'true';
            logo.innerHTML = `<div id="glow-container" class="glow-container">
                <div id="chip-shape-container" class="style-scope yt-chip-cloud-chip-renderer">
                    <chip-shape class="ytChipShapeHost">
                        <button class="ytChipShapeButtonReset glow-chip" role="tab" aria-selected="false">
                            <div class="ytChipShapeChip ytChipShapeInactive ytChipShapeOnlyTextPadding" style="background: none !important;">
                                <div id="yt-custom-logo-text-el">${settings.logoText}</div>
                            </div>
                        </button>
                    </chip-shape>
                </div>
            </div>`;
            addGlowEffect();
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
                0%, 100% { filter: drop-shadow(0 0 6px rgba(255,255,255,0.5)); }
                25% { filter: drop-shadow(0 0 10px rgba(255,255,255,0.7)); }
                75% { filter: drop-shadow(0 0 10px rgba(255,100,255,0.6)); }
            }
        `;
        document.head.appendChild(style);
    }

    function checkChanges() {
        const now = Date.now();
        if (now - lastRun < INTERVAL) return;
        lastRun = now;

        showCustomPopup();
        changeLogoContent();
    }

    checkChanges();
    const intervalId = setInterval(checkChanges, INTERVAL);

    window.addEventListener('beforeunload', () => {
        clearInterval(intervalId);
    });

})();
