// PDF Generator using jsPDF
// Generates professional appeal letter PDFs with evidence appendix

const PDFGenerator = {
    // Generate PDF from appeal data
    generate: function(data) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Get the appropriate template based on country and code
        const country = data.country || 'england';
        const template = getTemplate(data.contraventionCode, country);
        const htmlContent = template.generate(data);
        
        // Convert HTML to structured PDF content
        this.createPDF(doc, data);
        
        return doc;
    },
    
    // Create structured PDF document
    createPDF: async function(doc, data) {
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 25;
        let yPos = margin;
        const lineHeight = 6;
        const paragraphGap = 4;
        
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
        
        // Subject line
        doc.setFont('helvetica', 'bold');
        doc.text(`RE: FORMAL REPRESENTATION - PCN ${data.pcnRef}`, margin, yPos);
        yPos += lineHeight * 2;
        
        // Salutation
        doc.setFont('helvetica', 'normal');
        doc.text('Dear Sir/Madam,', margin, yPos);
        yPos += lineHeight * 2;
        
        // Opening paragraph
        const contraventionDate = new Date(data.contraventionDate);
        const contraventionDateStr = contraventionDate.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        
        const openingText = `I am writing to formally challenge the above Penalty Charge Notice (PCN) issued on ${contraventionDateStr} at ${data.contraventionTime} to vehicle registration ${data.vehicleReg} at ${data.location}.`;
        
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
        
        // Grounds for Appeal heading
        doc.setFont('helvetica', 'bold');
        doc.text('Grounds for Appeal:', margin, yPos);
        yPos += lineHeight;
        
        // Grounds content
        doc.setFont('helvetica', 'normal');
        const country = data.country || 'england';
        const groundsText = this.getGroundsText(data.contraventionCode, country);
        const groundsLines = doc.splitTextToSize(groundsText, pageWidth - margin * 2);
        groundsLines.forEach(line => {
            if (yPos > pageHeight - margin * 2) {
                doc.addPage();
                yPos = margin;
            }
            doc.text(line, margin, yPos);
            yPos += lineHeight;
        });
        yPos += paragraphGap;
        
        // Circumstances heading
        doc.setFont('helvetica', 'bold');
        doc.text('Circumstances:', margin, yPos);
        yPos += lineHeight;
        
        // Circumstances content
        doc.setFont('helvetica', 'normal');
        const circumstancesLines = doc.splitTextToSize(data.circumstances, pageWidth - margin * 2);
        circumstancesLines.forEach(line => {
            if (yPos > pageHeight - margin * 2) {
                doc.addPage();
                yPos = margin;
            }
            doc.text(line, margin, yPos);
            yPos += lineHeight;
        });
        yPos += paragraphGap;
        
        // Closing paragraph
        doc.setFont('helvetica', 'normal');
        const closingText = 'I therefore request that the PCN be cancelled. Should my representation be rejected, I request a formal Notice of Rejection detailing the reasons for rejection, and I reserve the right to appeal to the independent adjudicator.';
        
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
        
        // Evidence reference
        const evidenceFiles = data.evidenceFiles || [];
        if (evidenceFiles.length > 0) {
            doc.setFont('helvetica', 'italic');
            const evidenceText = `Please find attached ${evidenceFiles.length} piece(s) of supporting evidence as referenced in the appendix.`;
            const evidenceLines = doc.splitTextToSize(evidenceText, pageWidth - margin * 2);
            evidenceLines.forEach(line => {
                if (yPos > pageHeight - margin * 2) {
                    doc.addPage();
                    yPos = margin;
                }
                doc.text(line, margin, yPos);
                yPos += lineHeight;
            });
            yPos += paragraphGap;
        }
        
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
        doc.text(`Vehicle Registration: ${data.vehicleReg}`, margin, yPos);
        yPos += lineHeight;
        doc.text(`PCN Reference: ${data.pcnRef}`, margin, yPos);
        yPos += lineHeight;
        doc.text(`Date of Contravention: ${contraventionDateStr}`, margin, yPos);
        yPos += lineHeight;
        doc.text(`Location: ${data.location}`, margin, yPos);
        
        // Add evidence appendix if files exist
        if (evidenceFiles.length > 0) {
            this.addEvidenceAppendix(doc, evidenceFiles, margin);
        }
        
        return doc;
    },
    
    // Add evidence appendix to PDF
    addEvidenceAppendix: function(doc, evidenceFiles, margin) {
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
        
        // List files
        evidenceFiles.forEach((file, index) => {
            doc.setFont('helvetica', 'normal');
            doc.text(`${index + 1}. ${file.name} (${file.type})`, margin + 5, yPos);
            yPos += 6;
        });
        yPos += 10;
        
        // Add images
        const imageFiles = evidenceFiles.filter(f => f.type.startsWith('image/'));
        
        imageFiles.forEach((file, index) => {
            // Check if we need a new page
            if (yPos > pageHeight - 100) {
                doc.addPage();
                yPos = margin;
            }
            
            // Image title
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text(`Evidence ${index + 1}: ${file.name}`, margin, yPos);
            yPos += 8;
            
            // Try to add the image
            try {
                // For images loaded from URLs, we need to handle async loading
                // For now, we'll add a placeholder that can be replaced
                if (file.url) {
                    // Add image from URL - jsPDF can handle this with base64
                    // We'll add the URL as a reference
                    doc.setFontSize(9);
                    doc.setFont('helvetica', 'italic');
                    doc.setTextColor(100);
                    doc.text(`Image URL: ${file.url}`, margin, yPos);
                    doc.setTextColor(0);
                    yPos += 15;
                }
            } catch (error) {
                console.error('Error adding image to PDF:', error);
                doc.setFontSize(9);
                doc.setFont('helvetica', 'italic');
                doc.setTextColor(150);
                doc.text('[Image could not be embedded]', margin, yPos);
                doc.setTextColor(0);
                yPos += 10;
            }
        });
        
        // Note about PDFs
        const pdfFiles = evidenceFiles.filter(f => f.type === 'application/pdf');
        if (pdfFiles.length > 0) {
            if (yPos > pageHeight - 60) {
                doc.addPage();
                yPos = margin;
            }
            
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text('PDF Documents:', margin, yPos);
            yPos += 8;
            
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            pdfFiles.forEach((file, index) => {
                doc.text(`${index + 1}. ${file.name}`, margin + 5, yPos);
                yPos += 6;
            });
            yPos += 5;
            
            doc.setFontSize(9);
            doc.setFont('helvetica', 'italic');
            doc.setTextColor(100);
            doc.text('Note: PDF documents are attached separately to this letter.', margin, yPos);
            doc.setTextColor(0);
        }
    },
    
    // Get grounds text based on contravention code
    getGroundsText: function(code, country = 'england') {
        const grounds = {
            '01': 'The restriction was not clearly indicated by traffic signs compliant with the Traffic Signs Regulations and General Directions 2016. The restriction was not adequately indicated to a motorist exercising due care and attention.',
            '02': 'At the time of the alleged contravention, I was actively engaged in loading or unloading goods to/from a nearby property. This activity falls within the exemption provided for loading restrictions under the Road Traffic Regulation Act 1984.',
            '05': 'A code 05 contravention requires that the paid-for time had expired at the precise moment the CEO made observations. If payment was active at that point — whether by pay and display ticket, electronic payment, or pay-by-phone — no contravention occurred.',
            '06': 'A code 06 PCN may only be issued where no valid ticket or voucher was clearly displayed. If a ticket was present but overlooked, or if pay-by-phone payment was active, the contravention did not occur.',
            '11': 'The penalty charge exceeded the amount applicable in the circumstances of the case. I attempted to pay the parking charge but was unable to do so due to circumstances beyond my control.',
            '12': 'At the time of the alleged contravention, I held a valid permit or authority to park in the area. The absence of a visible permit was due to circumstances beyond my control.',
            '16': 'I held a valid permit to park in the designated permit space at the time of the alleged contravention. The permit was either not clearly visible due to circumstances beyond my control.',
            '21': 'The bay suspension was not clearly indicated or the signage was inadequate to provide reasonable notice of the suspension to a motorist exercising due care and attention.',
            '25': 'At the time of the alleged contravention, I was actively engaged in loading or unloading goods. This activity is a statutory exemption from parking restrictions in loading bays.',
            '30': 'The alleged contravention did not occur, or there were compelling reasons why I was unable to move the vehicle within the permitted time limit.',
            '31': 'When I entered the box junction, my exit was clear and I had a reasonable expectation of being able to clear the box. I was subsequently prevented from doing so by the movement of other traffic.',
            '34': 'At the time of the alleged contravention, the bus lane was either not in operation, or the signage was inadequate to indicate the bus lane restriction.',
            '40': 'A Blue Badge must be displayed with the front face showing the badge holder\'s photograph, the expiry date and the badge number. A CEO must make reasonable efforts to read the badge before issuing a PCN.',
            '45': 'Code 45 applies to vehicles stopped on a designated taxi rank. The contravention does not occur where the vehicle was stationary only momentarily for a lawful purpose such as dropping off a passenger.',
            '47': 'The stopping was justified by circumstances beyond my control, or the signage indicating the bus stop restriction was inadequate.',
            '62': 'Code 62 applies to footway parking in areas designated as special enforcement areas (SEAs) under Schedule 3A to the Road Traffic Regulation Act 1984. If the vehicle was wholly on the carriageway, code 62 is not made out.'
        };
        
        return grounds[code] || grounds['01'];
    },
    
    // Download PDF
    download: function(data) {
        const doc = this.generate(data);
        const filename = `PCN_Appeal_${data.pcnRef}_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(filename);
        return filename;
    },
    
    // Get PDF as blob
    getBlob: function(data) {
        const doc = this.generate(data);
        return doc.output('blob');
    },
    
    // Generate PDF with embedded images (for client-side only)
    generateWithImages: async function(data, imageBlobs) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Create main letter
        await this.createPDF(doc, data);
        
        // Add embedded images if provided
        if (imageBlobs && imageBlobs.length > 0) {
            this.addEmbeddedImages(doc, imageBlobs);
        }
        
        return doc;
    },
    
    // Add embedded images to PDF
    addEmbeddedImages: function(doc, imageBlobs) {
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 25;
        const maxWidth = pageWidth - margin * 2;
        const maxHeight = 120;
        
        // Add new page for images
        doc.addPage();
        let yPos = margin;
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Supporting Evidence - Images', margin, yPos);
        yPos += 15;
        
        imageBlobs.forEach((imgData, index) => {
            // Check if we need a new page
            if (yPos > pageHeight - maxHeight - 30) {
                doc.addPage();
                yPos = margin;
            }
            
            try {
                // Add image
                const img = new Image();
                img.src = imgData;
                
                // Calculate dimensions to fit
                let imgWidth = img.width;
                let imgHeight = img.height;
                
                // Scale to fit width
                if (imgWidth > maxWidth) {
                    const ratio = maxWidth / imgWidth;
                    imgWidth = maxWidth;
                    imgHeight = imgHeight * ratio;
                }
                
                // Scale to fit height if needed
                if (imgHeight > maxHeight) {
                    const ratio = maxHeight / imgHeight;
                    imgHeight = maxHeight;
                    imgWidth = imgWidth * ratio;
                }
                
                doc.addImage(imgData, 'JPEG', margin, yPos, imgWidth, imgHeight);
                yPos += imgHeight + 10;
                
            } catch (error) {
                console.error('Error embedding image:', error);
            }
        });
    }
};

// Export for use in other scripts
window.PDFGenerator = PDFGenerator;