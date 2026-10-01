/**
 * IMov - Shared Configuration & Synchronization Engine
 * Handles persistent settings across the main website and IMovadmin portal.
 */

const IMOV_STORAGE_KEY = 'imov_site_config';

const DEFAULT_IMOV_CONFIG = {
  appName: "IMOV",
  version: "v12.4",
  fileSize: "24.8 MB",
  androidVersion: "Android 5.0 to Android 16+",
  license: "100% Free (No In-App Purchases)",
  rootRequired: "No Root Required",
  category: "Movies & Web Series Streaming",
  packageName: "com.imov.entertainment.official",
  languages: "Hindi, English, Spanish + 40 Languages",
  safetyStatus: "Passed (0 Security Threats)",
  lastUpdated: "Latest 2026 Edition",
  announcement: "⚡ <strong>LATEST RELEASE:</strong> IMOV v12.4 Official APK (24.8 MB) &mdash; 4K Cinema Streaming &amp; Ad-Free Player!",
  heroTitle: "Stream Any Movie & Web Series",
  heroSubtitle: "Experience cinema-grade entertainment in stunning 4K Ultra HD & Dolby Atmos. Watch latest Hollywood blockbusters, Bollywood releases, Netflix & Prime originals, and trending Asian dramas with zero subscription, zero registration, and zero buffer.",
  apkDownloadUrl: "downloads/imov-v12.4-official.apk",
  apkFileName: "IMov-v12.4-Official.apk"
};

/**
 * Retrieve current configuration (localStorage or defaults)
 */
function getSiteConfig() {
  let config = { ...DEFAULT_IMOV_CONFIG };
  try {
    const stored = localStorage.getItem(IMOV_STORAGE_KEY);
    if (stored) {
      config = { ...config, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.warn('Failed to parse stored IMov config:', e);
  }

  // Ensure appName is IMOV
  if (!config.appName || config.appName === 'IMov APK' || config.appName === 'IMov') {
    config.appName = 'IMOV';
  }

  // If a custom APK was uploaded to IndexedDB, its metadata is cached
  if (typeof getCachedApkMeta === 'function') {
    const cachedMeta = getCachedApkMeta();
    if (cachedMeta && cachedMeta.hasCustomApk) {
      if (cachedMeta.fileName) config.apkFileName = cachedMeta.fileName;
      if (cachedMeta.fileSize) config.fileSize = cachedMeta.fileSize;
      if (cachedMeta.version) config.version = cachedMeta.version;
    }
  }

  return config;
}

/**
 * Save configuration to localStorage
 */
function saveSiteConfig(newConfig) {
  try {
    const updated = { ...getSiteConfig(), ...newConfig };
    localStorage.setItem(IMOV_STORAGE_KEY, JSON.stringify(updated));
    return true;
  } catch (e) {
    console.error('Failed to save IMov config:', e);
    return false;
  }
}

/**
 * Reset configuration to default factory values
 */
function resetSiteConfig() {
  try {
    localStorage.removeItem(IMOV_STORAGE_KEY);
    if (typeof deleteApkFromIndexedDB === 'function') {
      deleteApkFromIndexedDB();
    }
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Apply configuration dynamically to DOM elements with data-sync or specific IDs
 */
function applyConfigToDOM(config) {
  if (!config) config = getSiteConfig();

  // Announcement bar - dynamic original version name
  const annEl = document.querySelector('[data-sync="announcement"]');
  if (annEl) {
    let annText = config.announcement;
    // If announcement is the legacy default or mentions old hardcoded v12.4 is now live with, update to dynamic version format
    if (!annText || annText.includes('is now live with') || annText.includes('IMov v12.4')) {
      annText = `⚡ <strong>LATEST RELEASE:</strong> ${config.appName} ${config.version} Official APK (${config.fileSize}) &mdash; 4K Cinema Streaming &amp; Ad-Free Player!`;
    }
    annEl.innerHTML = annText;
  }

  // Top announcement download CTA
  const annCta = document.querySelector('.announcement-bar .trigger-download');
  if (annCta) {
    annCta.setAttribute('data-version', `${config.version} Official`);
    annCta.innerHTML = `Download ${config.version} APK &rarr;`;
  }

  // App Name
  document.querySelectorAll('[data-sync="appName"]').forEach(el => {
    el.textContent = config.appName;
  });

  // Version
  document.querySelectorAll('[data-sync="version"]').forEach(el => {
    el.textContent = config.version;
  });

  // File Size
  document.querySelectorAll('[data-sync="fileSize"]').forEach(el => {
    el.textContent = config.fileSize;
  });

  // Android Version
  document.querySelectorAll('[data-sync="androidVersion"]').forEach(el => {
    el.textContent = config.androidVersion;
  });

  // Specifications Table Fields
  const specMap = {
    'spec-app-name': config.appName,
    'spec-version': config.version + ` (${config.lastUpdated})`,
    'spec-size': config.fileSize + ' (Ultra-Lightweight)',
    'spec-os': config.androidVersion,
    'spec-license': config.license,
    'spec-root': config.rootRequired,
    'spec-category': config.category,
    'spec-package': config.packageName,
    'spec-languages': config.languages,
    'spec-safety': config.safetyStatus
  };

  for (const [id, value] of Object.entries(specMap)) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  // Hero Headlines
  const heroTitle = document.querySelector('[data-sync="heroTitle"]');
  if (heroTitle) {
    heroTitle.innerHTML = `${config.heroTitle} <span class="text-gradient">100% Free</span>`;
  }

  const heroSubtitle = document.querySelector('[data-sync="heroSubtitle"]');
  if (heroSubtitle) heroSubtitle.textContent = config.heroSubtitle;

  // Meta Tags & Title
  if (document.title && !window.location.pathname.includes('imovadmin')) {
    document.title = `${config.appName} Download (Official ${config.version}) For Android - Free Movies & Web Series`;
  }

  // Meta string on Hero CTA
  const heroMeta = document.querySelector('[data-sync="heroMeta"]');
  if (heroMeta) {
    heroMeta.textContent = `${config.version} Official • ${config.fileSize} • ${config.androidVersion.split(' to ')[0] || 'Android 5.0+'}`;
  }

  // Sticky bar meta
  const stickyMeta = document.querySelector('[data-sync="stickyMeta"]');
  if (stickyMeta) {
    stickyMeta.textContent = `Free • ${config.fileSize} • ${config.androidVersion.split(' to ')[0] || 'Android 5.0+'}`;
  }

  // Update download attributes and hrefs on buttons
  const fileName = config.apkFileName || 'IMov-Official.apk';
  document.querySelectorAll('a.btn-download-hero, a.btn-apk-main, #direct-download-action').forEach(btn => {
    btn.setAttribute('download', fileName);
    btn.setAttribute('data-version', config.version + ' Official');
    if (config.apkDownloadUrl) {
      btn.setAttribute('href', config.apkDownloadUrl);
    }
  });

  // If a binary APK is stored in IndexedDB, update direct download anchors to point to its active blob URL
  if (typeof getApkFromIndexedDB === 'function') {
    getApkFromIndexedDB().then(stored => {
      if (stored && stored.blob) {
        const liveBlobUrl = URL.createObjectURL(stored.blob);
        const customName = stored.fileName || fileName;
        document.querySelectorAll('a.btn-download-hero, a.btn-apk-main, #direct-download-action').forEach(btn => {
          btn.setAttribute('href', liveBlobUrl);
          btn.setAttribute('download', customName);
        });
      }
    }).catch(() => {});
  }
}
