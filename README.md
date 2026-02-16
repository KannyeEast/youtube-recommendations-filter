> [!CAUTION]
> This script depends on YouTube’s internal DOM structure. If YouTube changes its layout or class names, filtering may stop working until updated.

<br>

<p align="center">  
  <img src="icon.png" width="256" height="256">
</p>

<h1 align="center">YouTube Recommendations Filter</h1>

<p align="center">
  A configurable userscript that filters recommendations on YouTube based on <strong>age</strong>, <strong>duration</strong>, and <strong>views</strong>.
</p>

<p align="center">
  <a href="#installation">Installation</a> |
  <a href="#configuration">Configuration</a> |
  <a href="#whitelisting">Whitelisting</a> |
  <a href="#limitations">Limitations</a>
</p>

<p align="center">
    <img src="https://img.shields.io/github/license/KannyeEast/youtube-recommendations-filter" alt="License" />
    <img src="https://img.shields.io/github/v/release/KannyeEast/youtube-recommendations-filter" alt="Release" />
</p>

---

# Overview

This userscript filters recommended videos on YouTube by applying configurable thresholds:

- Maximum video age (in days)
- Minimum duration (in minutes)
- Minimum view count


Inspired by:  
https://github.com/kuronekozero/youtube-remove-unpopular-videos

---

# Installation

### 1. Install a Userscript Manager

Install one of the following:

<a href="https://www.tampermonkey.net/"><img src="https://img.shields.io/badge/Tampermonkey-000000?style=for-the-badge&logo=tampermonkey&logoColor=#00485B"/></a>
> <p>
>  <a href="https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/"><img src="https://img.shields.io/badge/Firefox-000000?style=for-the-badge&logo=firefoxbrowser&logoColor=#FF7139"/></a>
>  <a href="https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=en/"><img src="https://img.shields.io/badge/Chrome-000000?style=for-the-badge&logo=googlechrome&logoColor=white"/></a>
> </p>

<br>

<a href="https://violentmonkey.github.io/"><img src="https://img.shields.io/badge/Violentmonkey-000000?style=for-the-badge&logo=violentmonkey&logoColor=#FF7139"/></a>
> <p>
>  <a href="https://addons.mozilla.org/en-US/firefox/addon/violentmonkey/"><img src="https://img.shields.io/badge/Firefox-000000?style=for-the-badge&logo=firefoxbrowser&logoColor=#FF7139"/></a>
>  <a href="https://chromewebstore.google.com/detail/violentmonkey/jinjaccalgkegednnccohejagnlnfdag"><img src="https://img.shields.io/badge/Chrome-000000?style=for-the-badge&logo=googlechrome&logoColor=white"/></a>
> </p>

Supported on most Chromium-based browsers and Firefox.

### 2. Install the Script

Install via one of the following:

<a href="https://github.com/KannyeEast/youtube-recommendations-filter/raw/main/youtube-recommendations-filter.user.js"><img src="https://img.shields.io/badge/Direct_Link-000000?style=for-the-badge&logo=accenture&logoColor=#670000"/></a>
> Opening the URL in a browser with a userscript manager installed will trigger the installation prompt.

<br>

<a href="https://greasyfork.org/en/scripts/566462-youtube-recommendations-filter"><img src="https://img.shields.io/badge/Greasyfork-000000?style=for-the-badge&logo=greasyfork&logoColor=#670000"/></a>


> [!IMPORTANT]
> Reload all active YouTube tabs after installation.

---

# Configuration

Edit the variables at the top of the script:

```js
const maxAge = 200;      // Maximum age in days
const minDuration = 5;   // Minimum duration in minutes
const minViews = 1000;   // Minimum view count
```

> [!NOTE]
> A configuration UI is planned for a future version.
> Whitelisting logic may be adjusted once UI routing is introduced.

---

# Whitelisting

Filtering is disabled on these subpages:

- /feed/
> *Subscriptions*
- /channel/
- /@
> *Channels*

All other https://www.youtube.com/* routes are processed.

---

# Limitations

- Age calculation uses approximations (30 days/month, 365 days/year)

- Parsing assumes English UI formatting

- Minor visual flicker may occur due to post-render filtering

- Dependent on YouTube’s internal class names and markup structure

---

# Contributing

Issues and pull requests are accepted.

YouTube frequently modifies its frontend structure. If filtering stops working, selector updates or parsing adjustments may be required.


