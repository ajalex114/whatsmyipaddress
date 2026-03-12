# What's My IP Address

A lightweight Chrome/Edge extension that displays your current public IP address in a **Matrix**-inspired UI.

![Matrix Style](https://img.shields.io/badge/style-matrix-00ff41?style=flat&labelColor=0a0a0a)
![Manifest V3](https://img.shields.io/badge/manifest-v3-blue)
![Screenshot](screenshots/screenshot.png)

## Features

- **IPv4 & IPv6** — shows both addresses side by side
- **Matrix rain** — animated katakana/hex background canvas
- **Typewriter reveal** — IP addresses appear character by character
- **Copy buttons** — one-click copy for each address
- **Accessible** — ARIA labels, keyboard navigation, `prefers-reduced-motion` support
- **Lightweight** — no dependencies, no background scripts, no tracking

## Installation

### From source (Developer mode)

1. Clone the repository:
   ```bash
   git clone https://github.com/ajalex114/whatsmyipaddress.git
   ```
2. Open **Chrome** → `chrome://extensions` or **Edge** → `edge://extensions`
3. Enable **Developer mode**
4. Click **Load unpacked** and select the cloned folder

### From the store

> Coming soon

## How It Works

When you click the extension icon, it fetches your public IP from the [ipify API](https://www.ipify.org/):

| Endpoint | Purpose |
|---|---|
| `api.ipify.org` | IPv4 address |
| `api64.ipify.org` | IPv6 address (falls back to IPv4 if unavailable) |

No data is stored, logged, or sent anywhere else.

## Tech Stack

- **Manifest V3** — modern Chrome/Edge extension format
- **Vanilla JS** — no frameworks, no build step
- **Canvas API** — matrix rain animation
- **ipify.org** — free, open-source IP lookup API

## Project Structure

```
whatsmyipaddress/
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── manifest.json
├── popup.html
├── popup.css
├── popup.js
└── README.md
```

## Privacy

This extension:
- **Does not** collect or store any personal data
- **Does not** use cookies or local storage
- **Only** makes requests to `api.ipify.org` and `api64.ipify.org` to fetch your public IP
- **Does not** transmit your IP to any other service

## Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

