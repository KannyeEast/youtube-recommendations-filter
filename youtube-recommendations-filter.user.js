// ==UserScript==
// @name         youtube-recommendations-filter
// @namespace    https://github.com/KannyeEast/youtube-recommendations-filter/
// @version      0.1.1
// @description  Filter your YouTube recommendations based on age, duration and views
// @author       https://github.com/KannyeEast
// @match        https://www.youtube.com/*
// @icon         https://github.com/KannyeEast/youtube-recommendations-filter/raw/main/icon.png
// @grant        GM_addStyle
// @run-at       document-idle
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';

    // User variables
    const maxAge = 200; // Days
    const minDuration = 5; // Minutes
    const minViews = 1000;

    GM_addStyle(`
        .filtered-video-hidden {
            display: none !important;
        }
    `);

    // Extract the relevant content
    const extractData = function(metadata, checkMatch) {
        for (const data of metadata) {
            if (data.textContent && data.textContent.includes(checkMatch)) {
                return data;
            }
        }

        return null;
    }

    // Duration Filter
    const parseDurationToMinutes = function(data) {
        if (data) {
            const text = data.textContent.trim();
            const value = text.split(':').map(Number);

            if (value) {
                switch (value.length) {
                    case 2:
                        return value[0]; // MM:SS
                    case 3:
                        return value[0] * 60 + value[1]; // HH:MM:SS
                }
            }
        }

        return null;
    }

    // Age Filter
    const parseAgeToDays = function(span) {
        if (span) {
            const text = span.textContent.trim();
            const match = text.match(/(\d+)\s*(second|minute|hour|day|week|month|year)s?\s*ago/i);

            if (match) {
                const value = parseInt(match[1], 10);
                const unit = match[2].toLowerCase();

                switch (unit) {
                    case "second":
                    case "minute":
                    case "hour":
                        return 0;
                    case 'day':
                        return value;
                    case 'week':
                        return value * 7;
                    case 'month':
                        return value * 30;
                    case 'year':
                        return value * 365;
                    default:
                        return null;
                }
            }
        }
        return null;
    }

    // View Filter
    const parseViewCount = function(span){
        if (span) {
            const text = span.textContent.trim();

            if (text.toLowerCase().includes("no views")) {
                return 0;
            }

            const match = text.match(/([\d,.]+)\s*(K|M|B)?\s*views/i);

            if (match) {
                let value = parseFloat(match[1].replace(/,/g, ''));
                const unit = match[2] ? match[2].toUpperCase() : null;

                switch(unit) {
                    case 'K':
                        return value * 1e3;
                    case 'M':
                        return value * 1e6;
                    case 'B':
                        return value * 1e9;
                    default:
                        return value;
                }
            }
        }

        return null;
    };

    // Checks each entry against the user chosen cutoff points and applies the filter accordingly
    const applyFilters = function(item) {
        const metadataSpans = item.querySelectorAll("span.yt-content-metadata-view-model__metadata-text");
        const timeDiv = item.querySelectorAll("div.yt-badge-shape__text");

        const duration = parseDurationToMinutes(
            extractData(timeDiv, ":")
        );

        const age = parseAgeToDays(
            extractData(metadataSpans, "ago")
        );

        const views = parseViewCount(
            extractData(metadataSpans, "views")
        );

        // Exit early if any of the entries isnt valid
        if (duration == null || age == null || views == null) {
            item.classList.add("filter-failed");
            return null;
        }

        // Actual check
        if (duration < minDuration || age > maxAge || views < minViews) {
            item.classList.add("filtered-video-hidden");
        }

        // Successfully handled the process
        item.classList.add("filter-processed");
    }

    let isRunning = false;
    const runCheck = () => {
        if (isRunning) return;

        isRunning = true;

        const contentSelectors = [
            'ytd-rich-item-renderer',
            'ytd-video-renderer',
            'ytd-compact-video-renderer',
            'ytd-grid-video-renderer',
            'ytd-item-section-renderer'
        ];

        // Check if query has already been marked as completed, avoids reruns of the same content
        const query = contentSelectors.map(selector => `${selector}:not(.filtered-processed)`).join(', ');
        const newContent = document.querySelectorAll(query);

        for (const item of newContent) {
            applyFilters(item)
        }

        isRunning = false;
    };

    // List of whitelisted YouTube subpages
    const isAllowedPage = () => {
        const path = window.location.pathname;

        if (
            // Subscriptions
            path.includes("/feed/") ||
            // Channels
            path.includes("/channel/") ||
            path.includes("/@")
        ) {
            return false;
        }

        return true;
    };

    const resetFilters = () => {
        document
            .querySelectorAll('.filter-processed, .filter-failed, .filtered-video-hidden')
            .forEach(entry => {
            entry.classList.remove('filter-processed');
            entry.classList.remove("filter-failed");
            entry.classList.remove('filtered-video-hidden');
        });
    };

    // Rerun the filter on page reload and reset the previous filter (needed when reloading the same page, i.e. YouTube homefeed)
    window.addEventListener('yt-navigate-finish', () => {
        if (!isAllowedPage()) return;

        setTimeout(() => {
            resetFilters();
            runCheck();
        }, 500);
    });

    let debounceTimeout;
    const observer = new MutationObserver(mutations => {
        if (!isAllowedPage()) return;

        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
            runCheck();
        }, 50);
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Intial run, loaded on first page load or hard refresh
    setTimeout(() => {
        if (!isAllowedPage()) return;

        runCheck();
    }, 1000);
})();



