// ==UserScript==
// @name         youtube-recommendations-filter
// @namespace    https://github.com/KannyeEast/youtube-recommendations-filter/
// @version      0.2.1
// @description  Filter your YouTube recommendations based on age, duration and views
// @author       https://github.com/KannyeEast
// @match        https://www.youtube.com/*
// @icon         https://github.com/KannyeEast/youtube-recommendations-filter/raw/main/icon.png
// @downloadURL	 https://github.com/KannyeEast/youtube-recommendations-filter/raw/main/youtube-recommendations-filter.user.js
// @updateURL	 https://github.com/KannyeEast/youtube-recommendations-filter/raw/main/youtube-recommendations-filter.user.js
// @grant        GM_addStyle
// @run-at       document-idle
// @license      MIT
// ==/UserScript==

(function() {
    "use strict";

    // User variables
    const SETTINGS = {
        config: {
            maxAge: 200, // Days
            minDuration: 5, // Minutes
            minViews: 1000
        },
        whitelist: {
            // Subscription
            sub: "/feed/",
            // Channels
            channel: "/channel",
            channel_handle: "/@"
        }
    };

    // YouTube uses mutliple different ways to display information, so we need to keep track of all of them
    const RENDERERS = {
        // Homepage
        "ytd-rich-item-renderer": {
            stats: [
                "span.yt-content-metadata-view-model__metadata-text"
            ],
            duration: [
                "div.yt-badge-shape__text"
            ]
        },

        // Search
        "ytd-video-renderer": {
            stats: [
                "span.ytd-video-meta-block"
            ],
            duration: [
                "div.yt-badge-shape__text"
            ]
        },

        // Watchpage
        "yt-lockup-view-model": {
            stats: [
                "span.yt-content-metadata-view-model__metadata-text"
            ],
            duration: [
                "div.yt-badge-shape__text"
            ]
        },

        // Watchpage
        "ytd-compact-video-renderer": {
            stats: [
                "span.ytd-video-meta-block"
            ],
            duration: [
                "div.yt-badge-shape__text"
            ]
        },

        // Channel-Homepage
        "ytd-grid-video-renderer": {
            stats: [
                "span.ytd-grid-video-renderer"
            ],
            duration: [
                "div.yt-badge-shape__text"
            ]
        }
    };

    const RENDERER_TAGS = Object.keys(RENDERERS);


    GM_addStyle(`
        .filtered-video-hidden {
            display: none !important;
        }
    `);

    // Extract correct nodes based on regex
    const extractMatch = function(nodes, regex) {
        for (const node of nodes) {
            const text = node.textContent?.trim()
            if (!text) continue;

            const match = text.match(regex);
            if (match) return match;
        }

        return null;
    }

    // Age filter
    const parseAgeToDays = function(match) {
        if (!match) return null;

        const value = Number(match[1]);
        const unit = match[2].toLowerCase();

        const multipliers = {
            second: 0,
            minute: 0,
            hour:   0,
            day:    1,
            week:   7,
            month:  30,
            year:   365
        };

        // If value is valid return value multiplied by correct time frame, otherwise return null
        return multipliers[unit] !== undefined ? value * multipliers[unit] : null;
    };


    // Duration Filter
    const parseDurationToMinutes = function(match) {
        if (!match) return null;

        const parts = match[0].split(":").map(Number);

        switch (parts.length) {
            case 2:
                return parts[0];
            case 3:
                return parts[0] * 60 + parts[1];
            default:
                return null;
        }
    };

    // View Filter
    const parseViewCount = function(match) {
        if (!match) return null;

        let value = parseFloat(match[1].replace(/,/g, ""));
        const unit = match[2] ? match[2].toUpperCase() : null;

        const multipliers = {
            K: 1e3, // Thousand
            M: 1e6, // Million
            B: 1e9 // Billion
        };

        // Same as age parsing, except as default we return the base value (so anything <1000), as that value is already correct
        return multipliers[unit] ? value * multipliers[unit] : value;
    };

    // Detects which renderer(s) is needed
    const getRendererConfig = function(item) {
        for (const key in RENDERERS) {
            if (item.matches(key)) {
                return RENDERERS[key];
            }
        }

        return null;
    }

    // Returns the correct stat/duration query depending on the renderer
    const queryAllFromSelectors = function(root, selectors) {
        let results = [];

        for (const selector of selectors) {
            results = results.concat([...root.querySelectorAll(selector)]);
        }

        return results;
    }

    // Checks each entry against the user chosen cutoff points and applies the filter accordingly
    const applyFilters = function(item) {
        const config = getRendererConfig(item);
        if (!config) return;

        const statNodes = queryAllFromSelectors(item, config.stats);
        const durationNodes = queryAllFromSelectors(item, config.duration);

        const age = parseAgeToDays(
            extractMatch(statNodes, /(\d+)\s*(second|minute|hour|day|week|month|year)s?\s*ago/i)
        );

        const duration = parseDurationToMinutes(
            extractMatch(durationNodes, /^\s*(\d{1,2}:)?\d{1,2}:\d{2}\s*$/)
        );

        const views = parseViewCount(
            extractMatch(statNodes, /([\d,.]+)\s*(K|M|B)?\s*views/i)
        );

        // Exit early if any of the entries isnt valid
        if (duration == null || age == null || views == null) {
            item.classList.add("filter-failed");
            return;
        }

        // Actual check
        if (duration < SETTINGS.config.minDuration || age > SETTINGS.config.maxAge || views < SETTINGS.config.minViews) {
            item.classList.add("filtered-video-hidden");
        }

        // Successfully handled the process
        item.classList.add("filter-processed");
    }

    let isRunning = false;
    const runCheck = () => {
        if (isRunning) return;
        isRunning = true;

        // Check if query has already been marked as completed, avoids reruns of the same content
        const query = RENDERER_TAGS
        .map(tag => `${tag}:not(.filter-processed)`)
        .join(", ");

        const newContent = document.querySelectorAll(query);

        for (const item of newContent) {
            applyFilters(item)
        }

        isRunning = false;
    };

    // List of whitelisted YouTube subpages
    const isAllowedPage = () => {
        const path = window.location.pathname;

        const isWhitelisted = Object.values(SETTINGS.whitelist)
        .some(entry => path.includes(entry));

        if (isWhitelisted) {
            resetFilters();
            return false;
        }

        return true;
    };

    const resetFilters = () => {
        document
            .querySelectorAll(".filter-processed, .filter-failed, .filtered-video-hidden")
            .forEach(entry => {
            entry.classList.remove("filter-processed");
            entry.classList.remove("filter-failed");
            entry.classList.remove('filtered-video-hidden');
        });
    };

    // Rerun the filter on page reload and reset the previous filter (needed when reloading the same page, i.e. YouTube homefeed)
    window.addEventListener("yt-navigate-finish", () => {
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
