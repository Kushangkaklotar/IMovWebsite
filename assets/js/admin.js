/**
 * IMovadmin - Portal Management Logic
 * Handles Authentication, APK Upload & IndexedDB Binary Persistence,
 * Specifications Customization, Real-Time Sync, and JSON Export/Import.
 */

const DEFAULT_ADMIN_PASSCODE = 'admin123';
const SESSION_AUTH_KEY = 'imov_admin_authenticated';

document.addEventListener('DOMContentLoaded', () => {
  initAuthGate();
  initAdminTabs();
  loadConfigIntoForm();
  initApkDropzone();
  initFormSaveHandler();
  initExportImport();
  initResetHandler();
});

/* ==========================================================================
   1. Passcode Authentication Gate
   ========================================================================== */
function initAuthGate() {
  const authOverlay = document.getElementById('auth-overlay');
  const authForm = document.getElementById('auth-form');
  const passcodeInput = document.getElementById('admin-passcode-input');
  const authError = document.getElementById('auth-error');
  const logoutBtn = document.getElementById('admin-logout-btn');

  const isAuthenticated = sessionStorage.getItem(SESSION_AUTH_KEY) === 'true';

  if (isAuthenticated) {
    if (authOverlay) authOverlay.style.display = 'none';
  } else {
    if (authOverlay) authOverlay.style.display = 'flex';
  }

  if (authForm) {
    authForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const entered = (passcodeInput.value || '').trim();

      if (entered === DEFAULT_ADMIN_PASSCODE) {
        sessionStorage.setItem(SESSION_AUTH_KEY, 'true');
        authOverlay.style.display = 'none';
        if (authError) authError.style.display = 'none';
        showAdminToast('Welcome, Administrator! Authenticated successfully.');
      } else {
        if (authError) {
          authError.style.display = 'block';
          passcodeInput.classList.add('shake');
          setTimeout(() => passcodeInput.classList.remove('shake'), 400);
        }
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem(SESSION_AUTH_KEY);
      window.location.reload();
    });
  }
}

/* ==========================================================================
   2. Admin Tabs Navigation
   ========================================================================== */
function initAdminTabs() {
  const tabButtons = document.querySelectorAll('.admin-tab-btn');
  const tabPanels = document.querySelectorAll('.admin-tab-content');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      tabPanels.forEach(p => p.style.display = 'none');

      btn.classList.add('active');
      const targetId = btn.getAttribute('data-tab');
      const targetPanel = document.getElementById(targetId);
      if (targetPanel) {
        targetPanel.style.display = 'block';
      }
    });
  });
}

/* ==========================================================================
   3. Load Stored Configuration into Form Inputs & Stats
   ========================================================================== */
async function loadConfigIntoForm() {
  const config = getSiteConfig();

  // Populate Dashboard Summary Metrics
  const statVer = document.getElementById('metric-version');
  const statSize = document.getElementById('metric-size');
  const statOs = document.getElementById('metric-os');
  const statSource = document.getElementById('metric-source');

  if (statVer) statVer.textContent = config.version || 'v12.4';
  if (statSize) statSize.textContent = config.fileSize || '24.8 MB';
  if (statOs) statOs.textContent = config.androidVersion ? config.androidVersion.split(' to ')[0] : 'Android 5.0+';

  // Check if we have an uploaded APK in IndexedDB
  const fileBadge = document.getElementById('selected-file-badge');
  const fileNameText = document.getElementById('selected-file-name');
  const testDlBtn = document.getElementById('test-download-apk-btn');

  if (typeof getApkFromIndexedDB === 'function') {
    const storedApk = await getApkFromIndexedDB();
    if (storedApk && storedApk.blob) {
      if (statSource) statSource.textContent = 'Custom Uploaded APK';
      if (fileBadge && fileNameText) {
        fileNameText.innerHTML = `<strong>${storedApk.fileName}</strong> (${storedApk.fileSize || formatBytesToMB(storedApk.blob.size)}) - Active in Database!`;
        fileBadge.style.display = 'inline-flex';
      }
      if (testDlBtn) {
        testDlBtn.style.display = 'inline-flex';
        testDlBtn.onclick = (e) => {
          e.preventDefault();
          const testUrl = URL.createObjectURL(storedApk.blob);
          const a = document.createElement('a');
          a.href = testUrl;
          a.download = storedApk.fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        };
      }
    } else {
      if (statSource) statSource.textContent = 'Official Default';
    }
  }

  // Populate APK & Version Fields
  setVal('input-app-version', config.version);
  setVal('input-file-size', config.fileSize);
  setVal('input-apk-filename', config.apkFileName);
  setVal('input-apk-download-url', config.apkDownloadUrl);

  // Populate Specifications Table Fields
  setVal('input-spec-app-name', config.appName);
  setVal('input-spec-version', config.version);
  setVal('input-spec-size', config.fileSize);
  setVal('input-spec-os', config.androidVersion);
  setVal('input-spec-license', config.license);
  setVal('input-spec-root', config.rootRequired);
  setVal('input-spec-category', config.category);
  setVal('input-spec-package', config.packageName);
  setVal('input-spec-languages', config.languages);
  setVal('input-spec-safety', config.safetyStatus);
  setVal('input-spec-updated', config.lastUpdated);

  // Populate Content & Announcements
  setVal('input-announcement', config.announcement);
  setVal('input-hero-title', config.heroTitle);
  setVal('input-hero-subtitle', config.heroSubtitle);
}

function setVal(id, val) {
  const el = document.getElementById(id);
  if (el && val !== undefined) el.value = val;
}

function getVal(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

/* ==========================================================================
   4. APK File Drag & Drop Uploader with IndexedDB Persistence
   ========================================================================== */
function initApkDropzone() {
  const dropzone = document.getElementById('apk-dropzone');
  const fileInput = document.getElementById('apk-file-input');
  const fileBadge = document.getElementById('selected-file-badge');
  const fileNameText = document.getElementById('selected-file-name');
  const testDlBtn = document.getElementById('test-download-apk-btn');

  if (!dropzone || !fileInput) return;

  ['dragenter', 'dragover'].forEach(name => {
    dropzone.addEventListener(name, (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach(name => {
    dropzone.addEventListener(name, (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
    });
  });

  dropzone.addEventListener('drop', (e) => {
    if (e.dataTransfer.files && e.dataTransfer.files.length) {
      handleApkFile(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files && fileInput.files.length) {
      handleApkFile(fileInput.files[0]);
    }
  });

  async function handleApkFile(file) {
    if (!file) return;

    const sizeInMB = formatBytesToMB(file.size);
    const fileName = file.name;

    // Try to parse version number from filename (e.g. IMov-v13.0.apk -> v13.0)
    const verMatch = fileName.match(/v\d+(\.\d+)*/i);
    const detectedVer = verMatch ? verMatch[0] : (getVal('input-app-version') || 'v12.4');

    setVal('input-app-version', detectedVer);
    setVal('input-spec-version', detectedVer + ' (Latest 2026 Edition)');
    setVal('input-file-size', sizeInMB);
    setVal('input-spec-size', sizeInMB);
    setVal('input-apk-filename', fileName);
    setVal('input-announcement', `⚡ LATEST RELEASE: IMOV ${detectedVer} Official APK (${sizeInMB}) — 4K Cinema Streaming & Ad-Free Player!`);

    // Save binary file into IndexedDB
    try {
      if (typeof saveApkToIndexedDB === 'function') {
        await saveApkToIndexedDB(file, {
          fileName: fileName,
          fileSize: sizeInMB,
          version: detectedVer
        });
      }

      if (fileBadge && fileNameText) {
        fileNameText.innerHTML = `<strong>${fileName}</strong> (${sizeInMB}) - Saved into Database!`;
        fileBadge.style.display = 'inline-flex';
      }

      if (testDlBtn) {
        testDlBtn.style.display = 'inline-flex';
        testDlBtn.onclick = (e) => {
          e.preventDefault();
          const testUrl = URL.createObjectURL(file);
          const a = document.createElement('a');
          a.href = testUrl;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        };
      }

      showAdminToast(`✅ APK stored in database: ${fileName} (${sizeInMB}). Click "Save & Publish" to update website.`);
    } catch (err) {
      console.error('Error saving APK to IndexedDB:', err);
      showAdminToast(`Warning: Could not save APK to database. ${err.message}`);
    }
  }
}

/* ==========================================================================
   5. Save & Publish Changes
   ========================================================================== */
function initFormSaveHandler() {
  const saveBtn = document.getElementById('admin-save-all-btn');
  const statusIndicator = document.getElementById('save-status-text');

  if (!saveBtn) return;

  saveBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    const updatedConfig = {
      appName: getVal('input-spec-app-name') || 'IMov APK',
      version: getVal('input-app-version') || 'v12.4',
      fileSize: getVal('input-file-size') || '24.8 MB',
      apkFileName: getVal('input-apk-filename') || 'IMov-Official.apk',
      apkDownloadUrl: getVal('input-apk-download-url') || 'downloads/imov-v12.4-official.apk',

      // Specifications
      androidVersion: getVal('input-spec-os') || 'Android 5.0 to Android 16+',
      license: getVal('input-spec-license') || '100% Free (No In-App Purchases)',
      rootRequired: getVal('input-spec-root') || 'No Root Required',
      category: getVal('input-spec-category') || 'Movies & Web Series Streaming',
      packageName: getVal('input-spec-package') || 'com.imov.entertainment.official',
      languages: getVal('input-spec-languages') || 'Hindi, English, Spanish + 40 Languages',
      safetyStatus: getVal('input-spec-safety') || 'Passed (0 Security Threats)',
      lastUpdated: getVal('input-spec-updated') || 'Latest 2026 Edition',

      // Content
      announcement: getVal('input-announcement') || '⚡ NEW RELEASE: IMov is live with 4K Streaming!',
      heroTitle: getVal('input-hero-title') || 'Stream Any Movie & Web Series',
      heroSubtitle: getVal('input-hero-subtitle') || 'Experience cinema-grade entertainment in stunning 4K Ultra HD & Dolby Atmos.'
    };

    const success = saveSiteConfig(updatedConfig);

    if (success) {
      if (statusIndicator) {
        statusIndicator.innerHTML = `
          <span style="color: #34d399; font-weight: 700;">✓ All Changes Saved to Website! (${new Date().toLocaleTimeString()})</span>
        `;
      }

      await loadConfigIntoForm();
      showAdminToast('🚀 Changes published! Website download and specs updated.');
    } else {
      showAdminToast('❌ Error saving changes. Please check permissions.');
    }
  });
}

/* ==========================================================================
   6. Export & Import Configuration JSON
   ========================================================================== */
function initExportImport() {
  const exportBtn = document.getElementById('export-config-btn');
  const importInput = document.getElementById('import-config-file');

  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const config = getSiteConfig();
      const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `imov-site-config-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showAdminToast('Downloaded backup configuration JSON.');
    });
  }

  if (importInput) {
    importInput.addEventListener('change', () => {
      if (importInput.files && importInput.files.length) {
        const file = importInput.files[0];
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const imported = JSON.parse(e.target.result);
            saveSiteConfig(imported);
            await loadConfigIntoForm();
            showAdminToast('Successfully imported and restored configuration!');
          } catch (err) {
            alert('Invalid JSON file format.');
          }
        };
        reader.readAsText(file);
      }
    });
  }
}

/* ==========================================================================
   7. Factory Reset Handler
   ========================================================================== */
function initResetHandler() {
  const resetBtn = document.getElementById('reset-config-btn');
  if (!resetBtn) return;

  resetBtn.addEventListener('click', async () => {
    if (confirm('Are you sure you want to reset all site details, specifications, and uploaded APK back to default values?')) {
      resetSiteConfig();
      if (typeof deleteApkFromIndexedDB === 'function') {
        await deleteApkFromIndexedDB();
      }
      await loadConfigIntoForm();
      showAdminToast('Restored all settings back to default factory configuration.');
    }
  });
}

/* ==========================================================================
   8. Admin Toast Alert
   ========================================================================== */
function showAdminToast(msg) {
  let toast = document.getElementById('admin-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'admin-toast';
    toast.style.cssText = `
      position: fixed;
      top: 25px;
      right: 25px;
      background: rgba(18, 24, 52, 0.95);
      border: 1px solid rgba(168, 85, 247, 0.5);
      color: #fff;
      padding: 0.9rem 1.4rem;
      border-radius: 12px;
      z-index: 99999;
      font-size: 0.92rem;
      font-weight: 600;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
      transform: translateY(-50px);
      opacity: 0;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    `;
    document.body.appendChild(toast);
  }

  toast.textContent = msg;
  toast.style.transform = 'translateY(0)';
  toast.style.opacity = '1';

  setTimeout(() => {
    toast.style.transform = 'translateY(-50px)';
    toast.style.opacity = '0';
  }, 4000);
}
