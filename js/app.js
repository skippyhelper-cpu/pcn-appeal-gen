/**
 * RATE LIMITING IMPLEMENTED
 * ========================
 * Client-side rate limiting is implemented with exponential backoff:
 * - retryWithBackoff() function handles automatic retries on 429 responses
 * - Maximum 3 retries with exponential backoff (1s, 2s, 4s)
 * - Server-side rate limiting also implemented in functions/index.js
 * 
 * For production, also consider Firebase App Check for additional protection
 */

// FineFighters - Main Application Logic

// Global state
let currentStep = 1;
let formData = {};
let captchaToken = null;
let stripe = null;
let paymentIntentId = null;

// Client-side rate limiting
const RATE_LIMIT_MAX_RETRIES = 3;
const RATE_LIMIT_BASE_DELAY = 1000; // 1 second base delay
let requestAttempts = {};

// Retry function with exponential backoff
async function retryWithBackoff(fn, maxRetries = RATE_LIMIT_MAX_RETRIES, baseDelay = RATE_LIMIT_BASE_DELAY) {
    let lastError;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            if (error.response?.status === 429) {
                // Rate limited - exponential backoff
                const delay = baseDelay * Math.pow(2, attempt);
                console.log(`Rate limited, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries + 1})`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                // Non-rate-limit error, throw immediately
                throw error;
            }
        }
    }
    throw lastError;
}

// Draft storage
const DRAFT_KEY = 'pcn_appeal_draft';
let autoSaveTimer = null;
const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

// Evidence upload state
let uploadedFiles = [];  // Array of { file, preview, id }
const MAX_FILES = 3;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

const FILE_SIGNATURES = {
    'image/jpeg': [[0xFF, 0xD8, 0xFF]],
    'image/png': [[0x89, 0x50, 0x4E, 0x47]],
    'application/pdf': [[0x25, 0x50, 0x44, 0x46]]
};

function validateFileSignature(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const arr = new Uint8Array(e.target.result);
            const signatures = FILE_SIGNATURES[file.type];
            
            if (!signatures) {
                resolve(false);
                return;
            }
            
            const isValid = signatures.some(sig => {
                if (arr.length < sig.length) return false;
                return sig.every((byte, index) => arr[index] === byte);
            });
            
            resolve(isValid);
        };
        reader.onerror = () => resolve(false);
        reader.readAsArrayBuffer(file.slice(0, 8));
    });
}

// DOM Elements
const step1 = document.getElementById('step1');
const step2 = document.getElementById('step2');
const step3 = document.getElementById('step3');
const pcnForm = document.getElementById('appealForm');
const checkBtn = document.getElementById('checkBtn');
const payBtn = document.getElementById('payBtn');
const downloadBtn = document.getElementById('downloadBtn');
const newAppealBtn = document.getElementById('newAppealBtn');
const alertContainer = document.getElementById('alert-container');
const alertBox = document.getElementById('alert-box');
const loadingOverlay = document.getElementById('loadingOverlay');
const loadingText = document.getElementById('loadingText');
const summary = document.getElementById('summary');
const codeDescription = document.getElementById('code-description');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    initializeFileUpload();
    initializeDraftSystem();
    trackFormAnalytics();
    initializeInputValidation();
});

function initializeApp() {
    // Set up event listeners
    pcnForm.addEventListener('submit', handleFormSubmit);
    
    // Only add these listeners if elements exist (multi-step flow)
    if (payBtn) payBtn.addEventListener('click', handlePayment);
    if (downloadBtn) downloadBtn.addEventListener('click', handleDownload);
    if (newAppealBtn) newAppealBtn.addEventListener('click', resetApp);
    
    // Set up contravention code description and example arguments
    const contraventionSelect = document.getElementById('contraventionCode');
    if (contraventionSelect) {
        contraventionSelect.addEventListener('change', (e) => {
            const code = e.target.value;
            if (codeDescription) {
                const codeDescriptions = window.codeDescriptions || {
                    '01': 'Restricted street',
                    '02': 'Loading restriction',
                    '05': 'Expired paid time',
                    '06': 'No ticket displayed',
                    '11': 'No payment',
                    '12': 'No resident permit',
                    '16': 'No permit',
                    '21': 'Suspended bay',
                    '25': 'Loading place',
                    '30': 'Overstay',
                    '31': 'Box junction',
                    '34': 'Bus lane',
                    '40': 'School area',
                    '45': 'Taxi rank',
                    '47': 'Bus stop',
                    '62': 'Footway parking'
                };
                if (code && codeDescriptions[code]) {
                    codeDescription.textContent = codeDescriptions[code];
                } else {
                    codeDescription.textContent = '';
                }
            }
            // Populate example arguments dropdown
            if (typeof window.populateExampleArguments === 'function') {
                window.populateExampleArguments(code);
            }
        });
    }
    
    // Set max date to today for date picker
    const dateInput = document.getElementById('contraventionDate');
    if (dateInput) {
        dateInput.max = new Date().toISOString().split('T')[0];
    }
}

// Analytics tracking for form
function trackFormAnalytics() {
    let formStarted = false;
    
    const formInputs = ['pcnRef', 'vehicleReg', 'council', 'contraventionCode',
                        'contraventionDate', 'contraventionTime', 'location', 'email', 'circumstances'];
    
    formInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('focus', () => {
                if (!formStarted) {
                    formStarted = true;
                    gtag('event', 'form_start', {
                        form_name: 'appeal'
                    });
                }
            });
        }
    });
}

// =====================
// DRAFT SYSTEM
// =====================

function initializeDraftSystem() {
    const saveDraftBtn = document.getElementById('saveDraftBtn');
    const draftModal = document.getElementById('draftModal');
    const restoreDraftBtn = document.getElementById('restoreDraftBtn');
    const discardDraftBtn = document.getElementById('discardDraftBtn');
    
    // Save Draft button click
    if (saveDraftBtn) {
        saveDraftBtn.addEventListener('click', () => {
            saveDraft();
            showDraftSavedMessage();
        });
    }
    
    // Restore Draft button click
    if (restoreDraftBtn) {
        restoreDraftBtn.addEventListener('click', () => {
            restoreDraft();
            hideDraftModal();
        });
    }
    
    // Discard Draft button click
    if (discardDraftBtn) {
        discardDraftBtn.addEventListener('click', () => {
            clearDraft();
            hideDraftModal();
        });
    }
    
    // Check for existing draft on page load
    checkDraftOnLoad();
    
    // Set up auto-save on form inputs
    setupAutoSave();
}

function checkDraftOnLoad() {
    const draft = getDraft();
    if (draft && Object.keys(draft).length > 0) {
        showDraftModal();
    }
}

function getDraft() {
    try {
        const draft = localStorage.getItem(DRAFT_KEY);
        return draft ? JSON.parse(draft) : null;
    } catch (error) {
        console.error('Error reading draft:', error);
        return null;
    }
}

function saveDraft() {
    const countryElement = document.querySelector('input[name="country"]:checked');
    const country = countryElement ? countryElement.value : 'england';
    
    const draftData = {
        pcnRef: document.getElementById('pcnRef')?.value?.trim() || '',
        vehicleReg: document.getElementById('vehicleReg')?.value?.trim() || '',
        council: document.getElementById('council')?.value?.trim() || '',
        contraventionCode: document.getElementById('contraventionCode')?.value || '',
        contraventionDate: document.getElementById('contraventionDate')?.value || '',
        contraventionTime: document.getElementById('contraventionTime')?.value || '',
        location: document.getElementById('location')?.value?.trim() || '',
        email: document.getElementById('email')?.value?.trim() || '',
        applicantName: document.getElementById('applicantName')?.value?.trim() || '',
        applicantAddress: document.getElementById('applicantAddress')?.value?.trim() || '',
        applicantPostcode: document.getElementById('applicantPostcode')?.value?.trim() || '',
        circumstances: document.getElementById('circumstances')?.value?.trim() || '',
        country: country,
        savedAt: new Date().toISOString()
    };
    
    try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
        console.log('Draft saved:', draftData.savedAt);
        return true;
    } catch (error) {
        console.error('Error saving draft:', error);
        return false;
    }
}

function restoreDraft() {
    const draft = getDraft();
    if (!draft) return false;
    
    // Populate form fields
    if (draft.pcnRef) document.getElementById('pcnRef').value = draft.pcnRef;
    if (draft.vehicleReg) document.getElementById('vehicleReg').value = draft.vehicleReg;
    if (draft.council) document.getElementById('council').value = draft.council;
    if (draft.contraventionCode) document.getElementById('contraventionCode').value = draft.contraventionCode;
    if (draft.contraventionDate) document.getElementById('contraventionDate').value = draft.contraventionDate;
    if (draft.contraventionTime) document.getElementById('contraventionTime').value = draft.contraventionTime;
    if (draft.location) document.getElementById('location').value = draft.location;
    if (draft.email) document.getElementById('email').value = draft.email;
    if (draft.applicantName) document.getElementById('applicantName').value = draft.applicantName;
    if (draft.applicantAddress) document.getElementById('applicantAddress').value = draft.applicantAddress;
    if (draft.applicantPostcode) document.getElementById('applicantPostcode').value = draft.applicantPostcode;
    if (draft.circumstances) document.getElementById('circumstances').value = draft.circumstances;
    
    // Restore country selection
    if (draft.country) {
        const countryRadio = document.getElementById(draft.country === 'wales' ? 'countryWales' : 'countryEngland');
        if (countryRadio) countryRadio.checked = true;
    }
    
    // Trigger contravention code description update
    const contraventionSelect = document.getElementById('contraventionCode');
    if (contraventionSelect && draft.contraventionCode) {
        contraventionSelect.dispatchEvent(new Event('change'));
    }
    
    showAlert('Draft restored successfully!', 'success');
    return true;
}

function clearDraft() {
    try {
        localStorage.removeItem(DRAFT_KEY);
        console.log('Draft cleared');
        return true;
    } catch (error) {
        console.error('Error clearing draft:', error);
        return false;
    }
}

function showDraftModal() {
    const draftModal = document.getElementById('draftModal');
    if (draftModal) {
        draftModal.classList.remove('hidden');
    }
}

function hideDraftModal() {
    const draftModal = document.getElementById('draftModal');
    if (draftModal) {
        draftModal.classList.add('hidden');
    }
}

function showDraftSavedMessage() {
    const messageEl = document.getElementById('draftSavedMessage');
    if (messageEl) {
        messageEl.classList.remove('hidden');
        setTimeout(() => {
            messageEl.classList.add('hidden');
        }, 3000);
    }
}

function setupAutoSave() {
    const formInputs = [
        'pcnRef', 'vehicleReg', 'council', 'contraventionCode',
        'contraventionDate', 'contraventionTime', 'location', 'email',
        'applicantName', 'applicantAddress', 'applicantPostcode', 'circumstances'
    ];
    
    let lastSaveTime = 0;
    
    // Debounced auto-save: save 2 seconds after last keystroke, but at most every 30 seconds
    formInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('input', () => {
                // Clear existing timer
                if (autoSaveTimer) {
                    clearTimeout(autoSaveTimer);
                }
                
                // Set new timer to save after 2 seconds of inactivity
                autoSaveTimer = setTimeout(() => {
                    const now = Date.now();
                    // Only show message if at least 30 seconds since last save
                    if (now - lastSaveTime >= AUTO_SAVE_INTERVAL) {
                        saveDraft();
                        showDraftSavedMessage();
                        lastSaveTime = now;
                    } else {
                        // Silent save without message
                        saveDraft();
                    }
                }, 2000);
            });
        }
    });
    
    // Also auto-save on country change
    const countryRadios = document.querySelectorAll('input[name="country"]');
    countryRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            saveDraft();
            showDraftSavedMessage();
        });
    });
}

// =====================
// FILE UPLOAD HANDLING
// =====================

function initializeFileUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('evidenceFiles');
    
    if (!uploadArea || !fileInput) return;
    
    // Click to upload
    uploadArea.addEventListener('click', () => {
        if (uploadedFiles.length < MAX_FILES) {
            fileInput.click();
        } else {
            showAlert(`Maximum ${MAX_FILES} files allowed. Remove a file to add more.`, 'warning');
        }
    });
    
    // File input change
    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
        fileInput.value = ''; // Reset input
    });
    
    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('border-blue-400', 'bg-blue-50');
    });
    
    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('border-blue-400', 'bg-blue-50');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('border-blue-400', 'bg-blue-50');
        handleFiles(e.dataTransfer.files);
    });
}

async function handleFiles(files) {
    const filesArray = Array.from(files);
    
    for (const file of filesArray) {
        if (uploadedFiles.length >= MAX_FILES) {
            showAlert(`Maximum ${MAX_FILES} files allowed.`, 'warning');
            break;
        }
        
        if (!ALLOWED_TYPES.includes(file.type)) {
            showAlert(`Invalid file type: ${file.name}. Only JPG, PNG, and PDF are allowed.`, 'error');
            continue;
        }
        
        const validSignature = await validateFileSignature(file);
        if (!validSignature) {
            showAlert(`Invalid file content: ${file.name}. File signature does not match its extension.`, 'error');
            continue;
        }
        
        if (file.size > MAX_FILE_SIZE) {
            showAlert(`File too large: ${file.name}. Maximum size is 5MB.`, 'error');
            continue;
        }
        
        if (uploadedFiles.some(f => f.file.name === file.name && f.file.size === file.size)) {
            showAlert(`File already added: ${file.name}`, 'warning');
            continue;
        }
        
        const fileId = 'file_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                uploadedFiles.push({
                    id: fileId,
                    file: file,
                    preview: e.target.result,
                    type: 'image'
                });
                renderFilePreviews();
            };
            reader.readAsDataURL(file);
        } else {
            uploadedFiles.push({
                id: fileId,
                file: file,
                preview: null,
                type: 'pdf'
            });
            renderFilePreviews();
        }
    }
}

function renderFilePreviews() {
    const previewArea = document.getElementById('filePreviewArea');
    const fileCountInfo = document.getElementById('fileCountInfo');
    const fileCountEl = document.getElementById('fileCount');
    const uploadArea = document.getElementById('uploadArea');
    
    if (uploadedFiles.length === 0) {
        previewArea.classList.add('hidden');
        fileCountInfo.classList.add('hidden');
        return;
    }
    
    previewArea.classList.remove('hidden');
    fileCountInfo.classList.remove('hidden');
    fileCountEl.textContent = uploadedFiles.length;
    
    // Update upload area visibility
    if (uploadedFiles.length >= MAX_FILES) {
        uploadArea.classList.add('opacity-50', 'cursor-not-allowed');
    } else {
        uploadArea.classList.remove('opacity-50', 'cursor-not-allowed');
    }
    
    // Render previews
    previewArea.innerHTML = uploadedFiles.map(fileData => {
        if (fileData.type === 'image') {
            return `
                <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200" id="preview-${fileData.id}">
                    <img src="${fileData.preview}" alt="${fileData.file.name}" class="w-16 h-16 object-cover rounded border">
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-gray-900 truncate">${fileData.file.name}</p>
                        <p class="text-xs text-gray-500">${formatFileSize(fileData.file.size)}</p>
                    </div>
                    <button type="button" onclick="removeFile('${fileData.id}')" class="text-red-500 hover:text-red-700 p-1">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            `;
        } else {
            // PDF
            return `
                <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200" id="preview-${fileData.id}">
                    <div class="w-16 h-16 bg-red-100 rounded border flex items-center justify-center">
                        <svg class="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd" />
                        </svg>
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-gray-900 truncate">${fileData.file.name}</p>
                        <p class="text-xs text-gray-500">${formatFileSize(fileData.file.size)}</p>
                    </div>
                    <button type="button" onclick="removeFile('${fileData.id}')" class="text-red-500 hover:text-red-700 p-1">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            `;
        }
    }).join('');
}

function removeFile(fileId) {
    uploadedFiles = uploadedFiles.filter(f => f.id !== fileId);
    renderFilePreviews();
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// Make removeFile globally available
window.removeFile = removeFile;

// =====================
// FORM SUBMISSION
// =====================

// Form submission handler - redirects to preview
async function handleFormSubmit(e) {
    e.preventDefault();
    
    try {
        // Validate terms checkbox
        const termsCheckbox = document.getElementById('terms');
        if (!termsCheckbox) {
            console.error('Terms checkbox not found in DOM');
            showAlert('Form error: terms checkbox missing. Please refresh the page.', 'error');
            return;
        }
        if (!termsCheckbox.checked) {
            showAlert('Please accept the terms and conditions to continue.', 'warning');
            return;
        }
        
        // Get country selection
        const countryElement = document.querySelector('input[name="country"]:checked');
        const country = countryElement ? countryElement.value : 'england';
        
        // Collect form data
        formData = {
            pcnRef: document.getElementById('pcnRef')?.value?.trim()?.toUpperCase() || '',
            vehicleReg: document.getElementById('vehicleReg')?.value?.trim()?.toUpperCase()?.replace(/\s+/g, '') || '',
            council: document.getElementById('council')?.value?.trim() || '',
            contraventionCode: document.getElementById('contraventionCode')?.value || '',
            contraventionDate: document.getElementById('contraventionDate')?.value || '',
            contraventionTime: document.getElementById('contraventionTime')?.value || '',
            location: document.getElementById('location')?.value?.trim() || '',
            circumstances: document.getElementById('circumstances')?.value?.trim() || '',
            email: document.getElementById('email')?.value?.trim()?.toLowerCase() || '',
            applicantName: document.getElementById('applicantName')?.value?.trim() || '',
            applicantAddress: document.getElementById('applicantAddress')?.value?.trim() || '',
            applicantPostcode: document.getElementById('applicantPostcode')?.value?.trim()?.toUpperCase() || '',
            country: country,
            evidenceFiles: []
        };
        
        // Upload evidence files to Firebase Storage (if any)
        if (uploadedFiles.length > 0) {
            showLoading('Uploading evidence files...');
            try {
                const evidenceUrls = await uploadEvidenceFiles();
                formData.evidenceFiles = evidenceUrls;
            } catch (error) {
                console.error('Error uploading files:', error.message || error);
                const userMessage = error.message?.includes('connection') 
                    ? 'Unable to upload files. Please check your internet connection and try again.'
                    : 'There was a problem uploading your files. Please try again.';
                showAlert(userMessage, 'error');
                hideLoading();
                return;
            }
        }
        
        // Store data for preview page
        sessionStorage.setItem('appealPreviewData', JSON.stringify(formData));
        
        // Track form submission
        if (typeof gtag === 'function') {
            gtag('event', 'form_submit', {
                form_name: 'appeal',
                contravention_code: formData.contraventionCode
            });
        }
        
        // Redirect to preview
        showLoading('Generating preview...');
        window.location.href = 'preview.html';
        
    } catch (error) {
        console.error('Unexpected error in form submission:', error.message || error);
        hideLoading();
        showAlert('An unexpected error occurred. Please try again.', 'error');
    }
}

async function uploadFileWithRetry(storageRef, file, maxRetries = 2) {
    const baseDelay = 1000;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const snapshot = await storageRef.put(file);
            const url = await snapshot.ref.getDownloadURL();
            return { success: true, url };
        } catch (error) {
            const isRetryable = error.code === 'storage/retry-limit-exceeded' ||
                               error.code === 'storage/network-request-failed' ||
                               error.message?.includes('network') ||
                               error.message?.includes('timeout');
            
            if (isRetryable && attempt < maxRetries) {
                const delay = baseDelay * Math.pow(2, attempt);
                console.warn(`Upload failed for ${file.name} (attempt ${attempt + 1}), retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                throw error;
            }
        }
    }
    
    return { success: false };
}

async function uploadEvidenceFiles() {
    const storage = window.storage;
    
    if (!storage) {
        throw new Error('Storage not initialized. Please refresh the page and try again.');
    }
    
    const uploadPromises = uploadedFiles.map(async (fileData) => {
        const file = fileData.file;
        const timestamp = Date.now();
        const fileName = `evidence/${formData.pcnRef}/${timestamp}_${file.name}`;
        const storageRef = storage.ref(fileName);
        
        try {
            const result = await uploadFileWithRetry(storageRef, file);
            if (result.success) {
                return {
                    name: file.name,
                    type: file.type,
                    url: result.url,
                    path: fileName
                };
            }
            return null;
        } catch (error) {
            console.error('Error uploading file:', file.name, error.message || error);
            return null;
        }
    });
    
    const results = await Promise.all(uploadPromises);
    const successfulUploads = results.filter(r => r !== null);
    
    if (successfulUploads.length === 0 && uploadedFiles.length > 0) {
        throw new Error('Failed to upload any files. Please check your connection and try again.');
    }
    
    if (successfulUploads.length < uploadedFiles.length) {
        const failedCount = uploadedFiles.length - successfulUploads.length;
        console.warn(`${failedCount} file(s) failed to upload`);
    }
    
    return successfulUploads;
}

// Check if PCN reference has already been paid
async function checkDuplicate(pcnRef) {
    try {
        const snapshot = await db.collection('appeals')
            .where('pcnRef', '==', pcnRef)
            .where('paid', '==', true)
            .limit(1)
            .get();
        
        return !snapshot.empty;
    } catch (error) {
        console.error('Firestore error:', error);
        // If offline or error, allow to proceed
        return false;
    }
}

// Update summary display
function updateSummary() {
    if (!summary) return;
    
    const contraventionDate = new Date(formData.contraventionDate);
    const dateStr = contraventionDate.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    
    // Fallback if shared.js failed to load
    const codeDescriptions = window.codeDescriptions || {
        '01': 'Restricted street',
        '02': 'Loading restriction',
        '05': 'Expired paid time',
        '06': 'No ticket displayed',
        '11': 'No payment',
        '12': 'No resident permit',
        '16': 'No permit',
        '21': 'Suspended bay',
        '25': 'Loading place',
        '30': 'Overstay',
        '31': 'Box junction',
        '34': 'Bus lane',
        '40': 'School area',
        '45': 'Taxi rank',
        '47': 'Bus stop',
        '62': 'Footway parking'
    };
    
    let html = `
        <p><strong>PCN Reference:</strong> ${formData.pcnRef}</p>
        <p><strong>Vehicle Reg:</strong> ${formData.vehicleReg}</p>
        <p><strong>Council:</strong> ${formData.council}</p>
        <p><strong>Contravention:</strong> ${formData.contraventionCode} - ${codeDescriptions[formData.contraventionCode]}</p>
        <p><strong>Date:</strong> ${dateStr} at ${formData.contraventionTime}</p>
        <p><strong>Location:</strong> ${formData.location}</p>
    `;
    
    if (formData.evidenceFiles && formData.evidenceFiles.length > 0) {
        html += `<p><strong>Evidence:</strong> ${formData.evidenceFiles.length} file(s) attached</p>`;
    }
    
    summary.innerHTML = html;
}

// hCaptcha callback
function onCaptchaSuccess(token) {
    captchaToken = token;
    if (payBtn) {
        payBtn.disabled = false;
        payBtn.classList.remove('bg-gray-300', 'text-gray-500', 'cursor-not-allowed');
        payBtn.classList.add('bg-primary', 'hover:bg-blue-700', 'text-white', 'cursor-pointer');
        payBtn.innerHTML = `
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
            </svg>
            <span>Pay £2.99</span>
        `;
    }
}

// Handle payment
async function handlePayment() {
    console.log('[DEBUG] handlePayment called, URL:', window.location.href);
    console.log('[DEBUG] URL params:', window.location.search);
    
    if (!captchaToken) {
        showAlert('Please complete the CAPTCHA first.', 'warning');
        return;
    }
    
    showLoading('Processing payment...');
    
    try {
        // Create a pending appeal record
        let appealRef;
        // Generate access token for this appeal (32 character random string)
        const accessToken = Array.from({length: 32}, () => 'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 36)]).join('');
        try {
            appealRef = await db.collection('appeals').add({
                ...formData,
                accessToken: accessToken,
                captchaVerified: true,
                paid: false,
                paidAt: null,
                stripePaymentId: null,
                letterGenerated: false
            });
        } catch (dbError) {
            console.error('Database error creating appeal:', dbError.message || dbError);
            hideLoading();
            showAlert('Unable to connect to the server. Please check your connection and try again.', 'error');
            return;
        }
        
        console.log('[DEBUG] Appeal created:', appealRef.id);
        
        // Check for test mode - SECURITY: Only works on localhost
        const urlParams = new URLSearchParams(window.location.search);
        const isTestMode = urlParams.has('test');
        const isLocalhost = window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1' ||
                           window.location.hostname.endsWith('.local');
        console.log('[DEBUG] isTestMode:', isTestMode, 'isLocalhost:', isLocalhost);
        
        if (isTestMode && isLocalhost) {
            console.log('[TEST MODE] Bypassing payment (localhost only)...');
            
            try {
                const testResponse = await fetch('/testBypassPayment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        appealId: appealRef.id
                    })
                });
                
                if (testResponse.ok) {
                    const testData = await testResponse.json();
                    console.log('[TEST MODE] Payment bypassed, redirecting...');
                    window.location.href = testData.redirectUrl;
                    return;
                }
                console.warn('[TEST MODE] Bypass failed, using normal payment');
            } catch (testError) {
                console.warn('[TEST MODE] Bypass error, using normal payment:', testError.message);
            }
        }
        
        // Normal payment flow with rate limiting and exponential backoff
        const response = await retryWithBackoff(async () => {
            const res = await fetch('/createCheckoutSession', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    appealId: appealRef.id,
                    email: formData.email,
                    pcnRef: formData.pcnRef
                })
            });
            
            if (!res.ok) {
                // Create error with response for retry logic to handle
                const error = new Error('Request failed');
                error.response = { status: res.status };
                throw error;
            }
            return res;
        });
        
        if (!response.ok) {
            if (response.status === 429) {
                hideLoading();
                showAlert('Too many requests. Please wait a moment and try again.', 'error');
                return;
            }
            if (response.status >= 500) {
                hideLoading();
                showAlert('Server is temporarily unavailable. Please try again in a few moments.', 'error');
                return;
            }
            
            let errorMessage = 'Payment failed. Please try again.';
            try {
                const errorData = await response.json();
                if (errorData.error) {
                    errorMessage = errorData.error;
                }
            } catch (e) {
                // Keep default message
            }
            
            hideLoading();
            showAlert(errorMessage, 'error');
            return;
        }
        
        const data = await response.json();
        
        // Redirect directly to Stripe Checkout URL
        if (data.url) {
            window.location.href = data.url;
        } else {
            throw new Error('No checkout URL returned');
        }
            
    } catch (error) {
        hideLoading();
        console.error('Payment error:', error.message || error);
        
        if (error.message?.includes('network') || error.message?.includes('fetch')) {
            showAlert('Unable to connect to the server. Please check your internet connection.', 'error');
        } else {
            showAlert('An unexpected error occurred. Please try again.', 'error');
        }
    }
}

// Generate and download letter
function generateLetter() {
    try {
        // Prepare evidence data for PDF
        const evidenceForPdf = [...(formData.evidenceFiles || [])];
        
        // Pass evidence files to PDF generator
        const pdfData = {
            ...formData,
            evidenceFiles: evidenceForPdf
        };
        
        // Generate PDF
        const doc = PDFGenerator.generate(pdfData);
        
        // Download
        const filename = `PCN_Appeal_${formData.pcnRef}_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(filename);
        
        // Track download
        gtag('event', 'download', {
            event_category: 'Appeal',
            event_label: 'PDF Download'
        });
        
        showAlert(`Letter downloaded: ${filename}`, 'success');
    } catch (error) {
        console.error('PDF generation error:', error);
        showAlert('Error generating PDF. Please try again.', 'error');
    }
}

// Handle PDF download
function handleDownload() {
    generateLetter();
}

// Reset app to start
function resetApp() {
    // Reset state
    currentStep = 1;
    formData = {};
    captchaToken = null;
    uploadedFiles = [];
    
    // Reset form
    pcnForm.reset();
    
    // Clear saved draft
    clearDraft();
    
    // Reset file previews
    renderFilePreviews();
    
    // Reset CAPTCHA
    if (window.hcaptcha) {
        window.hcaptcha.reset();
    }
    
    // Reset payment button
    if (payBtn) {
        payBtn.disabled = true;
        payBtn.classList.add('bg-gray-300', 'text-gray-500', 'cursor-not-allowed');
        payBtn.classList.remove('bg-primary', 'hover:bg-blue-700', 'text-white', 'cursor-pointer');
        payBtn.innerHTML = `
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
            <span>Complete CAPTCHA to continue</span>
        `;
    }
    
    // Reset code description
    if (codeDescription) {
        codeDescription.textContent = '';
    }
    
    // Go to step 1
    goToStep(1);
}

// Step navigation
function goToStep(step) {
    currentStep = step;
    
    // Hide all steps
    if (step1) step1.classList.add('hidden');
    if (step2) step2.classList.add('hidden');
    if (step3) step3.classList.add('hidden');
    
    // Show current step
    if (step === 1 && step1) {
        step1.classList.remove('hidden');
    } else if (step === 2 && step2) {
        step2.classList.remove('hidden');
    } else if (step === 3 && step3) {
        step3.classList.remove('hidden');
    }
    
    // Update step indicators
    updateStepIndicators(step);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Show specific step (for simpler flow)
function showStep(step) {
    if (step3) {
        step3.classList.remove('hidden');
    }
}

// Update step indicators
function updateStepIndicators(currentStep) {
    const indicators = [1, 2, 3];
    
    indicators.forEach(step => {
        const indicator = document.getElementById(`step${step}-indicator`);
        const line = document.getElementById(`step${step}-line`);
        
        if (!indicator) return;
        
        if (step < currentStep) {
            // Completed
            indicator.classList.remove('bg-gray-300', 'text-gray-600');
            indicator.classList.add('bg-green-500', 'text-white');
            if (line) {
                line.classList.remove('bg-gray-300');
                line.classList.add('bg-green-500');
            }
        } else if (step === currentStep) {
            // Current
            indicator.classList.remove('bg-gray-300', 'text-gray-600', 'bg-green-500');
            indicator.classList.add('bg-primary', 'text-white');
        } else {
            // Upcoming
            indicator.classList.remove('bg-primary', 'bg-green-500', 'text-white');
            indicator.classList.add('bg-gray-300', 'text-gray-600');
        }
    });
}

// Show alert message
function showAlert(message, type = 'info') {
    // Create alert if container doesn't exist
    let alertContainer = document.getElementById('alert-container');
    if (!alertContainer) {
        alertContainer = document.createElement('div');
        alertContainer.id = 'alert-container';
        alertContainer.className = 'fixed top-4 right-4 z-50';
        document.body.appendChild(alertContainer);
    }
    
    const colors = {
        success: 'bg-green-100 border border-green-400 text-green-700',
        error: 'bg-red-100 border border-red-400 text-red-700',
        warning: 'bg-yellow-100 border border-yellow-400 text-yellow-700',
        info: 'bg-blue-100 border border-blue-400 text-blue-700'
    };
    
    const alertBox = document.createElement('div');
    alertBox.className = `p-4 rounded-lg ${colors[type]} mb-2 shadow-lg max-w-sm`;
    alertBox.textContent = message;
    
    alertContainer.appendChild(alertBox);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        alertBox.remove();
    }, 5000);
}

// Show loading overlay
function showLoading(text = 'Loading...') {
    let loadingOverlay = document.getElementById('loadingOverlay');
    
    if (!loadingOverlay) {
        loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'loadingOverlay';
        loadingOverlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        loadingOverlay.innerHTML = `
            <div class="bg-white rounded-lg p-6 flex items-center space-x-4">
                <svg class="animate-spin h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span id="loadingText">${text}</span>
            </div>
        `;
        document.body.appendChild(loadingOverlay);
    } else {
        loadingOverlay.classList.remove('hidden');
        const loadingText = document.getElementById('loadingText');
        if (loadingText) loadingText.textContent = text;
    }
}

// Hide loading overlay
function hideLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.classList.add('hidden');
    }
}

// Make onCaptchaSuccess globally available
window.onCaptchaSuccess = onCaptchaSuccess;

// =====================
// INPUT VALIDATION UX
// =====================

function initializeInputValidation() {
    initializeCharCounter();
    initializeVehicleRegFormatting();
    initializeEmailValidation();
}

function initializeCharCounter() {
    const circumstances = document.getElementById('circumstances');
    const charCounter = document.getElementById('charCounter');
    
    if (!circumstances || !charCounter) return;
    
    const updateCounter = () => {
        const length = circumstances.value.length;
        const maxLength = 5000;
        charCounter.textContent = `${length} / ${maxLength}`;
        
        if (length >= maxLength) {
            charCounter.classList.remove('text-gray-500', 'text-yellow-600');
            charCounter.classList.add('text-red-600', 'font-medium');
        } else if (length >= maxLength * 0.9) {
            charCounter.classList.remove('text-gray-500', 'text-red-600');
            charCounter.classList.add('text-yellow-600');
        } else {
            charCounter.classList.remove('text-red-600', 'text-yellow-600', 'font-medium');
            charCounter.classList.add('text-gray-500');
        }
    };
    
    circumstances.addEventListener('input', updateCounter);
    updateCounter();
}

function initializeVehicleRegFormatting() {
    const vehicleReg = document.getElementById('vehicleReg');
    const vehicleRegCheck = document.getElementById('vehicleRegCheck');
    
    if (!vehicleReg) return;
    
    vehicleReg.addEventListener('blur', () => {
        const value = vehicleReg.value.trim();
        if (value) {
            const formatted = value.toUpperCase().replace(/\s+/g, '');
            vehicleReg.value = formatted;
            if (vehicleRegCheck) {
                vehicleRegCheck.classList.remove('hidden');
            }
        }
    });
    
    vehicleReg.addEventListener('focus', () => {
        if (vehicleRegCheck) {
            vehicleRegCheck.classList.add('hidden');
        }
    });
}

function initializeEmailValidation() {
    const email = document.getElementById('email');
    const emailCheck = document.getElementById('emailCheck');
    const emailError = document.getElementById('emailError');
    
    if (!email) return;
    
    const validateEmail = (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
    };
    
    email.addEventListener('input', () => {
        const value = email.value.trim();
        
        if (value === '') {
            if (emailCheck) emailCheck.classList.add('hidden');
            if (emailError) emailError.classList.add('hidden');
            email.classList.remove('border-green-500', 'border-red-500');
            return;
        }
        
        const isValid = validateEmail(value);
        
        if (isValid) {
            if (emailCheck) emailCheck.classList.remove('hidden');
            if (emailError) emailError.classList.add('hidden');
            email.classList.remove('border-red-500');
            email.classList.add('border-green-500');
        } else {
            if (emailCheck) emailCheck.classList.add('hidden');
            email.classList.remove('border-green-500');
        }
    });
    
    email.addEventListener('blur', () => {
        const value = email.value.trim();
        
        if (value === '') return;
        
        const isValid = validateEmail(value);
        
        if (!isValid) {
            if (emailError) emailError.classList.remove('hidden');
            email.classList.add('border-red-500');
            email.classList.remove('border-green-500');
        } else {
            if (emailError) emailError.classList.add('hidden');
            email.classList.remove('border-red-500');
            email.classList.add('border-green-500');
        }
    });
}