# IMov - Official Website & APK Landing Page

Modern, high-conversion, fully responsive and animated website for the **IMov** streaming application. Built with pure HTML5, CSS3, and JavaScript with zero external frameworks or bloated libraries.

## 🚀 Key Highlights & Features

- **Branding & Visual Design**: Built specifically to match the IMov official gradient icon (Cosmic Dark `#070913`, Electric Indigo `#6366f1`, Neon Purple `#a855f7`, and Radiant Pink `#ec4899`).
- **100% Focused on Movies & Web Series**: Hollywood, Bollywood, South Indian Dubbed, Netflix/Prime Series, and Anime streaming in 4K Ultra HD & Dolby Atmos.
- **Dynamic Ambient Canvas**: Lightweight particle starfield in the background simulating a cinematic atmosphere.
- **Interactive 3D App Showcase**: Smartphone mockup featuring the IMov streaming interface with trending movies, category pills, and floating cinema badges.
- **High-Conversion APK Download Hub**:
  - Direct 1-click download with automatic safety scan & countdown modal.
  - Alternate CDN fast download mirror links (Global Server 1, Asia Server 2, IMov Lite 14MB).
  - Built-in QR Code modal for quick mobile scanning & instant APK installation.
- **App Specifications**: Glassmorphism technical specs table (package name, version, file size, Android OS compatibility, checksum, etc.).
- **Live Content Showcase**: Filterable catalog (Trending Movies, Web Series, Hollywood Blockbusters, Anime & K-Drama).
- **Why Choose IMov? Comparison Matrix**: Side-by-side comparison table against Netflix, Amazon Prime Video, and Disney+ Hotstar.
- **Multi-Device Installation Guides**: Illustrated 4-step tabbed instructions for Android Phones, Smart TVs & FireStick, PC Emulators (BlueStacks/LDPlayer), and Troubleshooting fixes.
- **Safety & Antivirus Certifications**: Verified malware-free badges (VirusTotal, CM Security, Lookout, McAfee).
- **FAQ Accordion**: 8 animated collapsible questions and answers.
- **Sticky Download Bar**: Floating bottom bar on mobile screens and upon scrolling past the hero section.

---

## ⚙️ IMovadmin Portal (`imovadmin.html`)

A dedicated administration dashboard where the site administrator can modify app details and synchronize them site-wide in real-time.

### Admin Features
1. **Security Passcode**: Protected access (Default passcode: `admin123`).
2. **APK Upload & Version Control**:
   - Drag & drop or select any `.apk` file.
   - Automatically computes file size in MB.
   - Automatically extracts and updates version tag (e.g. `v12.4`, `v13.0`).
   - Syncs download links to every download button on the site.
3. **Full Specifications Section Editor**:
   - App Display Name
   - Version String
   - Package File Size
   - Android OS Requirement
   - License / Pricing status
   - Root Requirement
   - App Category
   - Android Package Name (Application ID)
   - Audio & Subtitles
   - Antivirus & Safety Status
4. **Site Content & Announcement Customizer**:
   - Change top announcement banner and hero headline.
5. **Backup & Restore**:
   - Export configuration as JSON backup.
   - Import JSON configuration.
   - Factory reset to default settings.

---

## 📁 File Structure

```
IMovWebsite/
├── index.html                       # Main user-facing landing page
├── imovadmin.html                   # Admin control center
├── README.md                        # Documentation & setup guide
├── assets/
│   ├── css/
│   │   ├── style.css                # Core design system & responsive layout
│   │   ├── animations.css           # Keyframe animations & transitions
│   │   └── admin.css                # Admin portal styling
│   ├── js/
│   │   ├── config.js                # Shared configuration & dynamic sync engine
│   │   ├── main.js                  # Canvas, countdown modal, tabs, toasts, FAQ
│   │   └── admin.js                 # Admin authentication, APK inspection, and save logic
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

- Main Website: [http://localhost:8080](http://localhost:8080)
- Admin Portal: [http://localhost:8080/imovadmin.html](http://localhost:8080/imovadmin.html) (Passcode: `admin123`)
