// ==UserScript==
// @name        YouTube Recommendations Filter UI
// @namespace   HKR
// @match       https://www.youtube.com/*
// @grant       GM_getValue
// @grant       GM_setValue
// @version     1.0
// @author      HKR
// @description Userscript to filter YouTube recommendations
// ==/UserScript==

// The UI
let modal;

// The actual filter values
let maxAge;
let minDuration;
let minViews;

// The user input
let maxAgeInput;
let minDurationInput;
let minViewsInput;

//
// UI creation
//

function initUI() {
    modal = document.createElement('div')
    modal.classList.add("yt-hidden");

    modal.innerHTML = `
    <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); padding: 20px; background-color: hsl(0,0%,7%); border: 2px solid; border-radius: 8px; border-color: hsl(0,0%,18.82%);">
        <form id="yt-filter-form" style="color: white">
            <h2 style="margin-bottom: 10px"> YouTube Filter Settings </h2>
            <button type="button" id="yt-filter-close" style="position: absolute; top: 1px; right: 5px; font-size: 20px; color: white; background: none; border: none; cursor: pointer">×</button>

            <p style="margin-bottom: 15px">
                <input type="number" id="maxAge" min="0" style="width: 80px; padding: 5px; background-color: #444; color: #ccc; border-radius: 5px; border: none; margin-bottom: 5px">
                <label for="maxAge" style="font-size: 14px">max. Age (days)</label>
                <br>
                <input type="number" id="minDuration" min="0" style="width: 80px; padding: 5px; background-color: #444; color: #ccc; border-radius: 5px; border: none; margin-bottom: 5px">
                <label for="minDuration" style="font-size: 14px">min. Duration (minutes)</label>
                <br>
                <input type="number" id="minViews" step="100" min="0" style="width: 80px; padding: 5px; background-color: #444; color: #ccc; border-radius: 5px; border: none;">
                <label for="minViews" style="font-size: 14px">min. Views</label>
            </p>

            <button type="submit" style="background-color: #222222; color: white; padding: 10px; border: 1px solid; border-radius: 5px; border-color: hsl(0,0%,25%); cursor: pointer; font-size: 14px; width: 100%;">Save</button>
        </form>
    </div>
    `;

    document.body.appendChild(modal);

    const closeBtn = document.getElementById("yt-filter-close");
    closeBtn.addEventListener("click", () => {
        toggleModal();
    });

    maxAgeInput = document.getElementById("maxAge");
    minDurationInput = document.getElementById("minDuration");
    minViewsInput = document.getElementById("minViews");

    document
        .getElementById("yt-filter-form")
        .addEventListener("submit", handleSubmit);
}

// Initialize values from GM_getValue, or set defaults if not available
function loadSettings() {
    maxAge = GM_getValue("maxAge", 200); // Default to 200 days
    minDuration = GM_getValue("minDuration", 5); // Default to 5 minutes
    minViews = GM_getValue("minViews", 1000); // Default to 1000 views
}

function toggleModal() {
    const isHidden = modal.classList.toggle("yt-hidden");

    if (isHidden) return;

    loadSettings();

    maxAgeInput.value = maxAge;
    minDurationInput.value = minDuration;
    minViewsInput.value = minViews;
}

function handleSubmit(e) {
    e.preventDefault();

    GM_setValue("maxAge", Number(maxAgeInput.value));
    GM_setValue("minDuration", Number(minDurationInput.value));
    GM_setValue("minViews", Number(minViewsInput.value));

    toggleModal();
}

//
// Filter button
//

const buttonWrapper = document.createElement("div");
buttonWrapper.innerHTML = `
    <button id="yt-filter-open" class="button-filter">
        Filter
    </button>
`;

// Define and append button position on youtube
const div = document.querySelector("div#center.ytd-masthead");
div.appendChild(buttonWrapper);

// Bind logic
document
    .getElementById("yt-filter-open")
    .addEventListener("click", toggleModal);

//
// CSS
//

const style = document.createElement('style');
style.innerHTML = `
  .yt-hidden {
    display: none;
  }

  .button-filter {
    align-items: center;
    background-color: hsl(0,0%,7%);
    border: 1px solid;
    border-color: hsl(0,0%,18.82%);
    border-radius: 20px;
    box-sizing: border-box;
    color: #929292;
    cursor: pointer;
    font-family: "Roboto","Arial",sans-serif;
    font-size: 1.5rem;
    font-weight: 400;
    height: 42px;
    width: 64px;
    user-select: none;
    -webkit-user-select: none;
    z-index: 0;
    transition: border-color 0.5s;
    transition: color 0.5s;
  }

  .button-filter:hover {
    color: #ddd;
    border-color: hsl(0,0%,50%);
  }
`;

// Apply CSS
document.head.appendChild(style);

// change to yt-navigate-finish if needed
window.addEventListener("load", () => {
    initUI();
});

