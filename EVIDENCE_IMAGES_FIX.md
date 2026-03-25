# Evidence Images Fix - Deployment Summary

## Problem
Evidence images were missing from both PDFs:
1. **Browser PDF** (download button) - images not showing
2. **Email PDF** (server-side) - images not included

## Root Causes

### Browser PDF
- `success.html` was not including `evidenceFiles` or applicant details in `window.formData`
- PDF generator couldn't access the evidence file URLs

### Server-side PDF
- `generateAppealLetterHTML` function didn't include evidence images at all
- No image fetching or embedding logic existed

## Changes Made

### 1. `/success.html` (Line ~270)
**Fixed:** Added missing fields to `window.formData`:
```javascript
window.formData = {
    // ... existing fields ...
    applicantName: data.applicantName || '',
    applicantAddress: data.applicantAddress || '',
    applicantPostcode: data.applicantPostcode || '',
    evidenceFiles: data.evidenceFiles || []  // ← ADDED
};
```

### 2. `/functions/index.js`
**Added:** `fetchImageAsBase64` helper function to fetch images from Firebase Storage URLs and convert to base64 data URLs.

**Modified:** `generatePDF` function to be async and await the HTML generation.

**Modified:** `generateAppealLetterHTML` function:
- Changed from sync to async
- Fetches all evidence images as base64 before generating HTML
- Adds an evidence appendix section with embedded images
- Images are embedded as data URLs (no external dependencies)

### 3. `/js/pdf-generator.js`
**Enhanced:** `fetchImageAsBase64` function:
- Added CORS handling with fallback to canvas-based fetching
- Better error handling and logging

**Enhanced:** `addEvidenceAppendix` function:
- Better error messages when images can't be embedded
- Shows file info even if image embedding fails

## How It Works

### Server-side PDF (Email Attachment)
1. When payment completes, webhook triggers `sendConfirmationEmail`
2. `generatePDF` is called with appeal data
3. `generateAppealLetterHTML` fetches each evidence image from Firebase Storage
4. Images are converted to base64 and embedded in HTML
5. Puppeteer renders HTML to PDF with embedded images
6. PDF is attached to confirmation email

### Browser PDF (Download Button)
1. User clicks "Download Your PDF" on success page
2. `window.formData` now includes `evidenceFiles` array
3. `PDFGenerator.download()` is called with complete data
4. For each image file, `fetchImageAsBase64` retrieves the image
5. Images are embedded in the PDF appendix
6. PDF is downloaded to user's device

## Firebase Storage CORS

Firebase Storage URLs should work without CORS issues for public access. If images still don't appear in browser PDF:

1. Check Firebase Storage CORS configuration:
```bash
gsutil cors set cors.json gs://<your-bucket>
```

2. Or use the server-side PDF (email attachment) which doesn't have CORS restrictions

## Testing

To test the fix:

1. **Create a new appeal** with image evidence files
2. **Complete payment** (or use test mode)
3. **Check email** - PDF attachment should include evidence images
4. **Click download button** on success page - PDF should include evidence images

## Deployment

Deploy Firebase Functions:
```bash
cd ~/.openclaw/workspace/projects/pcn-appeal/functions
firebase deploy --only functions
```

No changes needed to hosting (HTML/JS files are served from the project root).

## Files Modified
- `success.html` - Added evidenceFiles to formData
- `functions/index.js` - Added image fetching and embedding
- `js/pdf-generator.js` - Enhanced image handling

## Notes
- Server-side PDF generation is more reliable (no CORS issues)
- Browser PDF may have CORS issues depending on Firebase Storage configuration
- Large images are scaled to fit PDF width (contentWidth x 80px height)
- PDF documents in evidence are listed but not embedded (too large)
