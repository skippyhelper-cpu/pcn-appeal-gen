// PDF Generator using jsPDF
// Generates professional appeal letter PDFs with evidence appendix
// Uses the same templates as the preview for consistency

var PDFGenerator = {
    // Helper: Fetch image as base64 for embedding in PDF
    fetchImageAsBase64: async function(url) {
        try {
            // Try fetching with no-cors mode first (for Firebase Storage URLs)
            const response = await fetch(url, { mode: 'cors' });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            const blob = await response.blob();
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.warn('Error fetching image, trying alternative method:', error.message);
            // Fallback: try to use the URL directly (works for some CORS-enabled URLs)
            try {
                // For Firebase Storage URLs, we can sometimes use them directly
                // by creating an image element and drawing to canvas
                return await this.fetchImageViaCanvas(url);
            } catch (canvasError) {
                console.error('Failed to fetch image via canvas:', canvasError.message);
                return null;
            }
        }
    },
    
    // Alternative: Fetch image via canvas (works for CORS-enabled images)
    fetchImageViaCanvas: async function(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    const dataUrl = canvas.toDataURL('image/jpeg');
                    resolve(dataUrl);
                } catch (e) {
                    reject(e);
                }
            };
            img.onerror = () => reject(new Error('Image load failed'));
            img.src = url;
        });
    },

    // Generate PDF from appeal data (now async to handle images)
    generate: async function(data) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Create structured PDF document using the same templates as preview
        await this.createPDF(doc, data);
        
        return doc;
    },
    
    // Create structured PDF document using template content
    createPDF: async function(doc, data) {
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 25;
        let yPos = margin;
        const lineHeight = 6;
        const paragraphGap = 4;
        
        // Get template content from templates.js (same as preview)
        const country = data.country || 'england';
        const template = getTemplate(data.contraventionCode, country);
        const templateContent = getTemplateContent(country, data.contraventionCode);
        
        // Header - Sender Address (right aligned)
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        
        const senderName = data.applicantName || 'Your Name';
        const senderAddress = data.applicantAddress || 'Your Address';
        const senderPostcode = data.applicantPostcode || 'Your Postcode';
        
        const senderLines = [senderName, senderAddress, senderPostcode];
        senderLines.forEach((line, index) => {
            const textWidth = doc.getTextWidth(line);
            doc.text(line, pageWidth - margin - textWidth, yPos);
            yPos += lineHeight;
        });
        
        yPos += lineHeight * 2; // Gap after sender address
        
        // Date
        const today = new Date();
        const dateStr = today.toLocaleDateString('en-GB', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        });
        doc.text(dateStr, margin, yPos);
        yPos += lineHeight * 2;
        
        // Recipient
        doc.text('Parking Services', margin, yPos);
        yPos += lineHeight;
        doc.text(data.council, margin, yPos);
        yPos += lineHeight * 2;
        
        // Subject line - matches template structure
        doc.setFont('helvetica', 'bold');
        const subjectLines = [
            `RE: Formal Representations Against Penalty Charge Notice ${data.pcnRef}`,
            `Vehicle Registration: ${data.vehicleReg}`,
            `Date of Contravention: ${new Date(data.contraventionDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`,
            `Location: ${data.location}`
        ];
        subjectLines.forEach(line => {
            doc.text(line, margin, yPos);
            yPos += lineHeight;
        });
        yPos += lineHeight * 2;
        
        // Salutation
        doc.setFont('helvetica', 'normal');
        doc.text('Dear Sir or Madam,', margin, yPos);
        yPos += lineHeight * 2;
        
        // Opening paragraph - matches template
        const openingText = `I am writing to make formal representations against Penalty Charge Notice ${data.pcnRef}, issued by ${data.council} in respect of vehicle ${data.vehicleReg} at ${data.location} on ${new Date(data.contraventionDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}.`;
        
        const openingLines = doc.splitTextToSize(openingText, pageWidth - margin * 2);
        openingLines.forEach(line => {
            if (yPos > pageHeight - margin * 2) {
                doc.addPage();
                yPos = margin;
            }
            doc.text(line, margin, yPos);
            yPos += lineHeight;
        });
        yPos += paragraphGap;
        
        // Second paragraph - matches template
        const secondText = 'Having reviewed the circumstances and the evidence available, I believe the Penalty Charge Notice should be cancelled on the following grounds.';
        const secondLines = doc.splitTextToSize(secondText, pageWidth - margin * 2);
        secondLines.forEach(line => {
            if (yPos > pageHeight - margin * 2) {
                doc.addPage();
                yPos = margin;
            }
            doc.text(line, margin, yPos);
            yPos += lineHeight;
        });
        yPos += paragraphGap;
        
        // Section 1: The Contravention Did Not Occur
        doc.setFont('helvetica', 'bold');
        doc.text('1. The Contravention Did Not Occur', margin, yPos);
        yPos += lineHeight;
        
        doc.setFont('helvetica', 'normal');
        const section1Lines = doc.splitTextToSize(data.circumstances, pageWidth - margin * 2);
        section1Lines.forEach(line => {
            if (yPos > pageHeight - margin * 2) {
                doc.addPage();
                yPos = margin;
            }
            doc.text(line, margin, yPos);
            yPos += lineHeight;
        });
        yPos += paragraphGap;
        
        // Section 2: Template-specific content
        doc.setFont('helvetica', 'bold');
        doc.text(`2. ${templateContent.section2Title}`, margin, yPos);
        yPos += lineHeight;
        
        doc.setFont('helvetica', 'normal');
        const section2Text = this.stripHtml(templateContent.section2Content);
        const section2Lines = doc.splitTextToSize(section2Text, pageWidth - margin * 2);
        section2Lines.forEach(line => {
            if (yPos > pageHeight - margin * 2) {
                doc.addPage();
                yPos = margin;
            }
            doc.text(line, margin, yPos);
            yPos += lineHeight;
        });
        yPos += paragraphGap;
        
        // Section 3: Template-specific content
        doc.setFont('helvetica', 'bold');
        doc.text(`3. ${templateContent.section3Title}`, margin, yPos);
        yPos += lineHeight;
        
        doc.setFont('helvetica', 'normal');
        const section3Text = this.stripHtml(templateContent.section3Content);
        const section3Lines = doc.splitTextToSize(section3Text, pageWidth - margin * 2);
        section3Lines.forEach(line => {
            if (yPos > pageHeight - margin * 2) {
                doc.addPage();
                yPos = margin;
            }
            doc.text(line, margin, yPos);
            yPos += lineHeight;
        });
        yPos += paragraphGap;
        
        // Section 4: Legal Framework
        doc.setFont('helvetica', 'bold');
        doc.text('4. Legal Framework', margin, yPos);
        yPos += lineHeight;
        
        doc.setFont('helvetica', 'normal');
        const section5Text = this.stripHtml(templateContent.legalFramework);
        const section5Lines = doc.splitTextToSize(section5Text, pageWidth - margin * 2);
        section5Lines.forEach(line => {
            if (yPos > pageHeight - margin * 2) {
                doc.addPage();
                yPos = margin;
            }
            doc.text(line, margin, yPos);
            yPos += lineHeight;
        });
        yPos += paragraphGap;
        
        // Request paragraph
        const requestText = 'In light of the above, I respectfully request that the Penalty Charge Notice is cancelled in full.';
        const requestLines = doc.splitTextToSize(requestText, pageWidth - margin * 2);
        requestLines.forEach(line => {
            if (yPos > pageHeight - margin * 2) {
                doc.addPage();
                yPos = margin;
            }
            doc.text(line, margin, yPos);
            yPos += lineHeight;
        });
        yPos += paragraphGap;
        
        // Evidence request paragraph
        const evidenceRequestIntro = 'If you do not accept these representations, please treat this letter as a formal request for the following evidence:';
        const evidenceRequestLines = doc.splitTextToSize(evidenceRequestIntro, pageWidth - margin * 2);
        evidenceRequestLines.forEach(line => {
            if (yPos > pageHeight - margin * 2) {
                doc.addPage();
                yPos = margin;
            }
            doc.text(line, margin, yPos);
            yPos += lineHeight;
        });
        yPos += paragraphGap;
        
        // Evidence request list
        const evidenceItems = [
            'All Civil Enforcement Officer (CEO) notes and observations made at the time of the alleged contravention;',
            'All photographic evidence taken by the CEO or any CCTV/camera system;',
            'The relevant Traffic Regulation Order(s) (TRO) and any amendments or variations;',
            'Confirmation that the TRO is valid, properly made and currently in force;',
            `A full explanation of how all statutory requirements under the Traffic Management Act 2004 and the ${templateContent.regulations} have been satisfied.`
        ];
        
        evidenceItems.forEach((item, index) => {
            if (yPos > pageHeight - margin * 2) {
                doc.addPage();
                yPos = margin;
            }
            const bulletText = String.fromCharCode(149) + ' ' + item;
            const itemLines = doc.splitTextToSize(bulletText, pageWidth - margin * 2);
            itemLines.forEach((line, lineIndex) => {
                if (lineIndex === 0) {
                    doc.text(line, margin, yPos);
                } else {
                    doc.text(line, margin + 5, yPos);
                }
                yPos += lineHeight;
            });
        });
        yPos += paragraphGap;
        
        // Reservation paragraph
        const reservationText = 'I reserve the right to appeal to the Traffic Penalty Tribunal should representations be rejected, and to rely on any additional grounds that may arise from the evidence disclosed.';
        const reservationLines = doc.splitTextToSize(reservationText, pageWidth - margin * 2);
        reservationLines.forEach(line => {
            if (yPos > pageHeight - margin * 2) {
                doc.addPage();
                yPos = margin;
            }
            doc.text(line, margin, yPos);
            yPos += lineHeight;
        });
        yPos += paragraphGap;
        
        // Closing paragraph
        const closingText = 'I look forward to your response within the statutory period.';
        const closingLines = doc.splitTextToSize(closingText, pageWidth - margin * 2);
        closingLines.forEach(line => {
            if (yPos > pageHeight - margin * 2) {
                doc.addPage();
                yPos = margin;
            }
            doc.text(line, margin, yPos);
            yPos += lineHeight;
        });
        yPos += lineHeight * 2;
        
        // Sign off
        doc.setFont('helvetica', 'normal');
        doc.text('Yours faithfully,', margin, yPos);
        yPos += lineHeight * 4;
        
        // Signature line
        doc.text(senderName, margin, yPos);
        yPos += lineHeight * 3;
        
        // Footer with PCN details
        doc.setDrawColor(200);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += lineHeight;
        
        doc.setFontSize(9);
        doc.setTextColor(100);
        const contraventionDateStr = new Date(data.contraventionDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
        doc.text(`Vehicle Registration: ${data.vehicleReg}`, margin, yPos);
        yPos += lineHeight;
        doc.text(`PCN Reference: ${data.pcnRef}`, margin, yPos);
        yPos += lineHeight;
        doc.text(`Date of Contravention: ${contraventionDateStr}`, margin, yPos);
        yPos += lineHeight;
        doc.text(`Location: ${data.location}`, margin, yPos);
        
        // Add evidence appendix if files exist
        const evidenceFiles = data.evidenceFiles || [];
        if (evidenceFiles.length > 0) {
            await this.addEvidenceAppendix(doc, evidenceFiles, margin);
        }
        
        return doc;
    },
    
    // Strip HTML tags from content for plain text PDF
    stripHtml: function(html) {
        if (!html) return '';
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    },
    
    // Add evidence appendix to PDF
    addEvidenceAppendix: async function(doc, evidenceFiles, margin) {
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const contentWidth = pageWidth - margin * 2;
        
        // Add new page for appendix
        doc.addPage();
        let yPos = margin;
        
        // Appendix header
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0);
        doc.text('APPENDIX - Supporting Evidence', margin, yPos);
        yPos += 10;
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`The following ${evidenceFiles.length} file(s) have been provided as supporting evidence:`, margin, yPos);
        yPos += 8;
        
        // List files with descriptions
        evidenceFiles.forEach((file, index) => {
            doc.setFont('helvetica', 'normal');
            doc.text(`${index + 1}. ${file.name} (${file.type})`, margin + 5, yPos);
            yPos += 6;
            
            // Add description if available
            if (file.description && file.description.trim()) {
                doc.setFont('helvetica', 'italic');
                doc.setTextColor(80);
                const descLines = doc.splitTextToSize(`Description: ${file.description.trim()}`, contentWidth - 10);
                descLines.forEach(line => {
                    doc.text(line, margin + 10, yPos);
                    yPos += 5;
                });
                doc.setTextColor(0);
            }
        });
        yPos += 10;
        
        // Add images
        const imageFiles = evidenceFiles.filter(f => f.type.startsWith('image/'));
        
        for (let i = 0; i < imageFiles.length; i++) {
            const file = imageFiles[i];
            
            // Check if we need a new page (account for description if present)
            const descriptionHeight = file.description ? 20 : 0;
            if (yPos > pageHeight - 120 - descriptionHeight) {
                doc.addPage();
                yPos = margin;
            }
            
            // Image title
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0);
            doc.text(`Evidence ${i + 1}: ${file.name}`, margin, yPos);
            yPos += 6;
            
            // Add description below title if available
            if (file.description && file.description.trim()) {
                doc.setFontSize(9);
                doc.setFont('helvetica', 'italic');
                doc.setTextColor(80);
                const descLines = doc.splitTextToSize(file.description.trim(), contentWidth);
                descLines.forEach(line => {
                    doc.text(line, margin, yPos);
                    yPos += 5;
                });
                yPos += 3;
                doc.setTextColor(0);
            }
            
            // Try to fetch and embed the image
            try {
                if (file.url) {
                    const base64 = await this.fetchImageAsBase64(file.url);
                    if (base64) {
                        // Get image dimensions to fit in PDF
                        const imgWidth = contentWidth;
                        const imgHeight = 80; // Fixed height for evidence images
                        
                        // Determine image format from file type or data URL
                        let imgFormat = 'JPEG';
                        if (file.type === 'image/png') {
                            imgFormat = 'PNG';
                        } else if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
                            imgFormat = 'JPEG';
                        } else if (base64.startsWith('data:image/png')) {
                            imgFormat = 'PNG';
                        } else if (base64.startsWith('data:image/jpeg') || base64.startsWith('data:image/jpg')) {
                            imgFormat = 'JPEG';
                        }
                        
                        // Add image to PDF
                        try {
                            doc.addImage(base64, imgFormat, margin, yPos, imgWidth, imgHeight);
                            yPos += imgHeight + 10;
                        } catch (imgError) {
                            console.error('Error embedding image in PDF:', imgError.message);
                            doc.setFontSize(9);
                            doc.setFont('helvetica', 'italic');
                            doc.setTextColor(100);
                            doc.text(`[Image: ${file.name} - embedding failed]`, margin, yPos);
                            doc.setTextColor(0);
                            yPos += 15;
                        }
                    } else {
                        // Fallback: show file info
                        doc.setFontSize(9);
                        doc.setFont('helvetica', 'italic');
                        doc.setTextColor(100);
                        doc.text(`[Image: ${file.name} - could not fetch]`, margin, yPos);
                        doc.setTextColor(0);
                        yPos += 15;
                    }
                }
            } catch (error) {
                console.error('Error processing image:', file.name, error.message);
                doc.setFontSize(9);
                doc.setFont('helvetica', 'italic');
                doc.setTextColor(150);
                doc.text(`[Image: ${file.name} - error]`, margin, yPos);
                doc.setTextColor(0);
                yPos += 10;
            }
        }
        
        // Note about PDFs
        const pdfFiles = evidenceFiles.filter(f => f.type === 'application/pdf');
        if (pdfFiles.length > 0) {
            if (yPos > pageHeight - 80) {
                doc.addPage();
                yPos = margin;
            }
            
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0);
            doc.text('PDF Documents:', margin, yPos);
            yPos += 8;
            
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            pdfFiles.forEach((file, index) => {
                doc.text(`${index + 1}. ${file.name}`, margin + 5, yPos);
                yPos += 6;
                
                // Add description if available
                if (file.description && file.description.trim()) {
                    doc.setFont('helvetica', 'italic');
                    doc.setTextColor(80);
                    const descLines = doc.splitTextToSize(file.description.trim(), contentWidth - 10);
                    descLines.forEach(line => {
                        doc.text(line, margin + 10, yPos);
                        yPos += 5;
                    });
                    doc.setTextColor(0);
                    doc.setFont('helvetica', 'normal');
                }
            });
            yPos += 5;
            
            doc.setFontSize(9);
            doc.setFont('helvetica', 'italic');
            doc.setTextColor(100);
            doc.text('Note: PDF documents are attached separately to this letter.', margin, yPos);
            doc.setTextColor(0);
        }
    },
    
    // Download PDF
    download: async function(data) {
        const doc = await this.generate(data);
        const filename = `PCN_Appeal_${data.pcnRef}_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(filename);
        return filename;
    },
    
    // Get PDF as blob
    getBlob: async function(data) {
        const doc = await this.generate(data);
        return doc.output('blob');
    }
};

// Export for use in other scripts
window.PDFGenerator = PDFGenerator;
