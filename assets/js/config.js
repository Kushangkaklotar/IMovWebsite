/**
 * IMov - Shared Configuration & Synchronization Engine
 * Handles persistent settings across the main website and IMovadmin portal.
 */

const IMOV_STORAGE_KEY = 'imov_site_config';
const IMOV_BLOB_KEY = 'imov_uploaded_apk_blob';

const DEFAULT_IMOV_CONFIG = {
  appName: "IMov APK",
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
  announcement: "⚡ NEW RELEASE: IMov v12.4 is now live with 4K Cinema Streaming & Ad-Free Player!",
  heroTitle: "Stream Any Movie & Web Series",
  heroSubtitle: "Experience cinema-grade entertainment in stunning 4K Ultra HD & Dolby Atmos. Watch latest Hollywood blockbusters, Bollywood releases, Netflix & Prime originals, and trending Asian dramas with zero subscription, zero registration, and zero buffer.",
  apkDownloadUrl: "downloads/imov-v12.4-official.apk",
  apkFileName: "IMov-v12.4-Official.apk"
};

/**
 * Retrieve current configuration (localStorage or defaults)
 */
function getSiteConfig() {
  try {
    const stored = localStorage.getItem(IMOV_STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_IMOV_CONFIG, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.warn('Failed to parse stored IMov config:', e);
  }
  return { ...DEFAULT_IMOV_CONFIG };
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
    localStorage.removeItem(IMOV_BLOB_KEY);
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

  // Announcement bar
  const annEl = document.querySelector('[data-sync="announcement"]');
  if (annEl) annEl.textContent = config.announcement;

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

  // Update Download Buttons & Links
  const activeApkUrl = getActiveApkDownloadUrl(config);
  document.querySelectorAll('a.btn-download-hero, a.btn-apk-main, #direct-download-action').forEach(btn => {
    btn.setAttribute('href', activeApkUrl);
    btn.setAttribute('download', config.apkFileName || 'IMov-Official.apk');
  });

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
}

/**
 * Returns either an uploaded Blob URL or the configured URL
 */
function getActiveApkDownloadUrl(config) {
  if (!config) config = getSiteConfig();
  const uploadedBlobUrl = localStorage.getItem(IMOV_BLOB_KEY);
  if (uploadedBlobUrl) {
    return uploadedBlobUrl;
  }
  return config.apkDownloadUrl || 'downloads/imov-v12.4-official.apk';
}
