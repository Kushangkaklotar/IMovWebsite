# IMov - Official Website & APK Landing Page

Modern, high-conversion, fully responsive and animated website for the **IMov** streaming application. Built with pure HTML5, CSS3, and JavaScript with zero external frameworks or bloated libraries.

## 🚀 Key Highlights & Features

- **Branding & Visual Design**: Built specifically to match the IMov official gradient icon (Cosmic Dark `#070913`, Electric Indigo `#6366f1`, Neon Purple `#a855f7`, and Radiant Pink `#ec4899`).
- **Dynamic Ambient Canvas**: Lightweight particle starfield in the background simulating a cinematic atmosphere.
- **Interactive 3D App Showcase**: Smartphone mockup featuring the IMov streaming interface with trending movies, category pills, and floating live badges.
- **High-Conversion APK Download Hub**:
  - Direct 1-click download with automatic safety scan & countdown modal.
  - Alternate CDN fast download mirror links (Global Server 1, Asia Server 2, IMov Lite 14MB).
  - Built-in QR Code modal for quick mobile scanning & instant APK installation.
- **App Specifications**: Glassmorphism technical specs table (package name, version, file size, Android OS compatibility, checksum, etc.).
- **Live Content Showcase**: Filterable catalog (Trending Movies, Web Series, Live Cricket / Sports, Anime & K-Drama).
- **Why Choose IMov? Comparison Matrix**: Side-by-side comparison table against Netflix, Amazon Prime Video, and Disney+ Hotstar.
- **Multi-Device Installation Guides**: Illustrated 4-step tabbed instructions for Android Phones, Smart TVs & FireStick, PC Emulators (BlueStacks/LDPlayer), and Troubleshooting fixes.
- **Safety & Antivirus Certifications**: Verified malware-free badges (VirusTotal, CM Security, Lookout, McAfee).
- **FAQ Accordion**: 8 animated collapsible questions and answers.
- **Sticky Download Bar**: Floating bottom bar on mobile screens and upon scrolling past the hero section.
- **Recent Download Toasts**: Realistic live notification alerts ("Someone from Mumbai downloaded IMov APK").

## 📁 File Structure

```
IMovWebsite/
├── index.html                       # Semantic, SEO-optimized landing page
├── README.md                        # Documentation & setup guide
├── assets/
│   ├── css/
│   │   ├── style.css                # Core design system, glassmorphism, responsive grid
│   │   └── animations.css           # Keyframes, glows, floating elements, reveal transitions
│   ├── js/
│   │   └── main.js                  # Particle canvas, countdown modal, tabs, toasts, FAQ accordion
│   └── images/
│       ├── imov-icon.png            # Official app icon
│       └── favicon.png              # Browser favicon
└── downloads/
    └── imov-v12.4-official.apk      # Downloadable APK file
```

## 🛠️ How to Run Locally

You can preview the website immediately using any local HTTP server:

```bash
# Using Python
python3 -m http.server 8080

# Using Node.js npx
npx serve .
```

Then open [http://localhost:8080](http://localhost:8080) in your browser.

## 📦 How to Update the APK File

To deploy your actual Android APK:
1. Copy your compiled `.apk` file into the `downloads/` directory.
2. Name it `imov-v12.4-official.apk` (or update the filename in `index.html` and `assets/js/main.js`).
