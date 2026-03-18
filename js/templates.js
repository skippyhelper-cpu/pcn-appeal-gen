// Static Appeal Templates for Different Contravention Codes
// Supports England and Wales with different legal frameworks
// Each template is a function that accepts data and returns HTML content

const templates = {
    // ENGLAND TEMPLATES
    england: {
        // 01 - Parked in a restricted street during prescribed hours
        "01": {
            title: "Appeal for Contravention Code 01 - Parked in a Restricted Street",
            grounds: [
                "The restriction was not clearly indicated by traffic signs",
                "The vehicle was being loaded/unloaded at the time",
                "The restriction had not been in force for the required period",
                "The traffic order was invalid or defective"
            ],
            generate: (data) => generateEnglandTemplate('01', data)
        },

        // 02 - Parked or loading/unloading in a restricted street
        "02": {
            title: "Appeal for Contravention Code 02 - Loading Restriction",
            grounds: [
                "Active loading or unloading was taking place",
                "The restriction was not clearly signed",
                "The vehicle was exempt from the restriction"
            ],
            generate: (data) => generateEnglandTemplate('02', data)
        },

        // 05 - Parked after the expiry of paid for time
        "05": {
            title: "Appeal for Contravention Code 05 - Expiry of Paid Time",
            grounds: [
                "Payment was made and valid at the time",
                "Payment machine was faulty",
                "Observation period was insufficient"
            ],
            generate: (data) => generateEnglandTemplate('05', data)
        },

        // 06 - Parked without clearly displaying a valid pay and display ticket
        "06": {
            title: "Appeal for Contravention Code 06 - No Valid Ticket Displayed",
            grounds: [
                "A valid ticket was displayed but overlooked",
                "Pay-by-phone payment was active",
                "Payment machine was not functioning"
            ],
            generate: (data) => generateEnglandTemplate('06', data)
        },

        // 11 - Parked without payment of parking charge
        "11": {
            title: "Appeal for Contravention Code 11 - No Payment",
            grounds: [
                "Payment was made electronically",
                "Payment machine was faulty",
                "Signage for cashless parking was inadequate"
            ],
            generate: (data) => generateEnglandTemplate('11', data)
        },

        // 12 - Parked in a residents' parking space without a permit
        "12": {
            title: "Appeal for Contravention Code 12 - No Resident Permit",
            grounds: [
                "Valid permit was held but not displayed",
                "Permit had been purchased but not received",
                "Visitor voucher was valid"
            ],
            generate: (data) => generateEnglandTemplate('12', data)
        },

        // 16 - Parked in a permit space without a permit
        "16": {
            title: "Appeal for Contravention Code 16 - Permit Space",
            grounds: [
                "Valid permit held",
                "Permit not clearly visible",
                "Signage inadequate"
            ],
            generate: (data) => generateEnglandTemplate('16', data)
        },

        // 21 - Parked in a suspended bay/space
        "21": {
            title: "Appeal for Contravention Code 21 - Suspended Bay",
            grounds: [
                "Suspension signage inadequate",
                "Suspension not properly authorised",
                "Not aware of suspension"
            ],
            generate: (data) => generateEnglandTemplate('21', data)
        },

        // 25 - Parked in a loading place during restricted hours
        "25": {
            title: "Appeal for Contravention Code 25 - Loading Place",
            grounds: [
                "Active loading/unloading",
                "Commercial vehicle exemption",
                "Signage inadequate"
            ],
            generate: (data) => generateEnglandTemplate('25', data)
        },

        // 30 - Parked for longer than permitted
        "30": {
            title: "Appeal for Contravention Code 30 - Overstay",
            grounds: [
                "Loading or unloading",
                "Medical emergency",
                "Vehicle breakdown"
            ],
            generate: (data) => generateEnglandTemplate('30', data)
        },

        // 31 - Entering and stopping in a box junction
        "31": {
            title: "Appeal for Contravention Code 31 - Box Junction",
            grounds: [
                "Exit was clear when entering",
                "Blocked by other traffic",
                "De minimis stop"
            ],
            generate: (data) => generateEnglandTemplate('31', data)
        },

        // 34 - Being in a bus lane
        "34": {
            title: "Appeal for Contravention Code 34 - Bus Lane",
            grounds: [
                "Outside operational hours",
                "Signage inadequate",
                "Avoiding obstruction"
            ],
            generate: (data) => generateEnglandTemplate('34', data)
        },

        // 40 - Stopped in a restricted area outside a school
        "40": {
            title: "Appeal for Contravention Code 40 - School Restricted Area",
            grounds: [
                "Picking up or setting down passengers",
                "Signage inadequate",
                "Emergency situation"
            ],
            generate: (data) => generateEnglandTemplate('40', data)
        },

        // 45 - Stopped on a taxi rank
        "45": {
            title: "Appeal for Contravention Code 45 - Taxi Rank",
            grounds: [
                "Setting down or picking up passengers",
                "Taxi rank signage inadequate",
                "Momentary stop only"
            ],
            generate: (data) => generateEnglandTemplate('45', data)
        },

        // 47 - Stopped on a restricted bus stop
        "47": {
            title: "Appeal for Contravention Code 47 - Bus Stop",
            grounds: [
                "Emergency situation",
                "Mechanical breakdown",
                "Signage inadequate"
            ],
            generate: (data) => generateEnglandTemplate('47', data)
        },

        // 62 - Parked with one or more wheels on a footpath
        "62": {
            title: "Appeal for Contravention Code 62 - Footway Parking",
            grounds: [
                "Vehicle was wholly on carriageway",
                "Special Enforcement Area not properly designated",
                "Necessity due to narrow carriageway"
            ],
            generate: (data) => generateEnglandTemplate('62', data)
        }
    },

    // WALES TEMPLATES
    wales: {
        // 01 - Parked in a restricted street during prescribed hours
        "01": {
            title: "Appeal for Contravention Code 01 - Parked in a Restricted Street (Wales)",
            grounds: [
                "The restriction was not clearly indicated by traffic signs",
                "The vehicle was being loaded/unloaded at the time",
                "The restriction had not been in force for the required period",
                "The traffic order was invalid or defective"
            ],
            generate: (data) => generateWalesTemplate('01', data)
        },

        // 02 - Parked or loading/unloading in a restricted street
        "02": {
            title: "Appeal for Contravention Code 02 - Loading Restriction (Wales)",
            grounds: [
                "Active loading or unloading was taking place",
                "The restriction was not clearly signed",
                "The vehicle was exempt from the restriction"
            ],
            generate: (data) => generateWalesTemplate('02', data)
        },

        // 05 - Parked after the expiry of paid for time
        "05": {
            title: "Appeal for Contravention Code 05 - Expiry of Paid Time (Wales)",
            grounds: [
                "Payment was made and valid at the time",
                "Payment machine was faulty",
                "Observation period was insufficient"
            ],
            generate: (data) => generateWalesTemplate('05', data)
        },

        // 06 - Parked without clearly displaying a valid pay and display ticket
        "06": {
            title: "Appeal for Contravention Code 06 - No Valid Ticket Displayed (Wales)",
            grounds: [
                "A valid ticket was displayed but overlooked",
                "Pay-by-phone payment was active",
                "Payment machine was not functioning"
            ],
            generate: (data) => generateWalesTemplate('06', data)
        },

        // 11 - Parked without payment of parking charge
        "11": {
            title: "Appeal for Contravention Code 11 - No Payment (Wales)",
            grounds: [
                "Payment was made electronically",
                "Payment machine was faulty",
                "Signage for cashless parking was inadequate"
            ],
            generate: (data) => generateWalesTemplate('11', data)
        },

        // 12 - Parked in a residents' parking space without a permit
        "12": {
            title: "Appeal for Contravention Code 12 - No Resident Permit (Wales)",
            grounds: [
                "Valid permit was held but not displayed",
                "Permit had been purchased but not received",
                "Visitor voucher was valid"
            ],
            generate: (data) => generateWalesTemplate('12', data)
        },

        // 16 - Parked in a permit space without a permit
        "16": {
            title: "Appeal for Contravention Code 16 - Permit Space (Wales)",
            grounds: [
                "Valid permit held",
                "Permit not clearly visible",
                "Signage inadequate"
            ],
            generate: (data) => generateWalesTemplate('16', data)
        },

        // 21 - Parked in a suspended bay/space
        "21": {
            title: "Appeal for Contravention Code 21 - Suspended Bay (Wales)",
            grounds: [
                "Suspension signage inadequate",
                "Suspension not properly authorised",
                "Not aware of suspension"
            ],
            generate: (data) => generateWalesTemplate('21', data)
        },

        // 25 - Parked in a loading place during restricted hours
        "25": {
            title: "Appeal for Contravention Code 25 - Loading Place (Wales)",
            grounds: [
                "Active loading/unloading",
                "Commercial vehicle exemption",
                "Signage inadequate"
            ],
            generate: (data) => generateWalesTemplate('25', data)
        },

        // 30 - Parked for longer than permitted
        "30": {
            title: "Appeal for Contravention Code 30 - Overstay (Wales)",
            grounds: [
                "Loading or unloading",
                "Medical emergency",
                "Vehicle breakdown"
            ],
            generate: (data) => generateWalesTemplate('30', data)
        },

        // 31 - Entering and stopping in a box junction
        "31": {
            title: "Appeal for Contravention Code 31 - Box Junction (Wales)",
            grounds: [
                "Exit was clear when entering",
                "Blocked by other traffic",
                "De minimis stop"
            ],
            generate: (data) => generateWalesTemplate('31', data)
        },

        // 34 - Being in a bus lane
        "34": {
            title: "Appeal for Contravention Code 34 - Bus Lane (Wales)",
            grounds: [
                "Outside operational hours",
                "Signage inadequate",
                "Avoiding obstruction"
            ],
            generate: (data) => generateWalesTemplate('34', data)
        },

        // 40 - Stopped in a restricted area outside a school
        "40": {
            title: "Appeal for Contravention Code 40 - School Restricted Area (Wales)",
            grounds: [
                "Picking up or setting down passengers",
                "Signage inadequate",
                "Emergency situation"
            ],
            generate: (data) => generateWalesTemplate('40', data)
        },

        // 45 - Stopped on a taxi rank
        "45": {
            title: "Appeal for Contravention Code 45 - Taxi Rank (Wales)",
            grounds: [
                "Setting down or picking up passengers",
                "Taxi rank signage inadequate",
                "Momentary stop only"
            ],
            generate: (data) => generateWalesTemplate('45', data)
        },

        // 47 - Stopped on a restricted bus stop
        "47": {
            title: "Appeal for Contravention Code 47 - Bus Stop (Wales)",
            grounds: [
                "Emergency situation",
                "Mechanical breakdown",
                "Signage inadequate"
            ],
            generate: (data) => generateWalesTemplate('47', data)
        },

        // 62 - Parked with one or more wheels on a footpath
        "62": {
            title: "Appeal for Contravention Code 62 - Footway Parking (Wales)",
            grounds: [
                "Vehicle was wholly on carriageway",
                "Special Enforcement Area not properly designated",
                "Necessity due to narrow carriageway"
            ],
            generate: (data) => generateWalesTemplate('62', data)
        }
    }
};

// Template content generators for England
function generateEnglandTemplate(code, data) {
    const content = getTemplateContent('england', code);
    return generateHTMLLetter(content, data, 'england');
}

// Template content generators for Wales
function generateWalesTemplate(code, data) {
    const content = getTemplateContent('wales', code);
    return generateHTMLLetter(content, data, 'wales');
}

// Get template content based on country and code
function getTemplateContent(country, code) {
    const contents = {
        england: {
            '01': {
                section2Title: 'Signage and Road Markings',
                section2Content: `<p>For a code 01 contravention to be valid, the waiting restrictions must be properly signed and marked. The yellow lines at this location should comply with the Traffic Signs Regulations and General Directions 2016 (TSRGD 2016). If the lines are faded, broken, or the wrong width, or if the time plate signs are missing or hard to read, the restriction may not be enforceable.</p>
                <p>The High Court case <em>Herron v The Parking Adjudicator</em> [2010] confirmed that signage problems at the actual location of the contravention can make a PCN invalid. Please confirm that the lines and signs at this specific location meet all the requirements.</p>`,
                section3Title: 'Procedural Requirements',
                section3Content: `<p>The PCN must include certain information required by the Traffic Management Act 2004 and the 2007 Regulations, such as the date of the notice and the date of the alleged contravention. If any of this information is missing or incorrect, the PCN may be invalid.</p>`,
                legalFramework: `<p>This PCN was issued under Section 66 of the Traffic Management Act 2004. The parking restriction should be backed by a valid Traffic Regulation Order under the Road Traffic Regulation Act 1984, with signage that meets TSRGD 2016 standards.</p>`,
                regulations: 'Civil Enforcement of Parking Contraventions (England) General Regulations 2007'
            },
            '02': {
                section2Title: 'Loading Restriction Signs',
                section2Content: `<p>For a code 02 contravention, there should be yellow kerb marks (blips) on the pavement edge as well as yellow lines. If I was loading or unloading at the time, and there are no kerb marks or the no-loading signs don't meet the requirements, then this contravention may not apply.</p>
                <p>Please confirm whether kerb blips were present at this exact location and whether the signs comply with TSRGD 2016.</p>`,
                section3Title: 'Correct Contravention Code',
                section3Content: `<p>The PCN should correctly identify what happened. Issuing a code 02 PCN where no loading restriction exists (no kerb blips) would not be appropriate.</p>`,
                legalFramework: `<p>Loading restrictions require a Traffic Regulation Order under the Road Traffic Regulation Act 1984 and must be signed according to TSRGD 2016.</p>`,
                regulations: 'Civil Enforcement of Parking Contraventions (England) General Regulations 2007'
            },
            '05': {
                section2Title: 'Payment Was Valid',
                section2Content: `<p>A code 05 PCN is issued when paid parking time has run out. If I had paid for parking (by ticket, app, or phone) and the session was still active when the CEO checked, then no contravention occurred. Adjudicators have found that councils should check payment records properly before issuing these PCNs, especially for pay-by-phone parking.</p>`,
                section3Title: 'Payment Machine Problems',
                section3Content: `<p>If the pay and display machine wasn't working at the time, I couldn't have bought a ticket. Please confirm whether the machine was operational.</p>`,
                legalFramework: `<p>Paid parking enforcement comes from Section 66 of the Traffic Management Act 2004 and the relevant Traffic Regulation Order.</p>`,
                regulations: 'Civil Enforcement of Parking Contraventions (England) General Regulations 2007'
            },
            '06': {
                section2Title: 'Pay-by-Phone Payment',
                section2Content: `<p>When parking is paid for by phone or app, you don't need to display a paper ticket. If I had a valid parking session on the app at the time, this PCN shouldn't have been issued. The CEO should have checked the electronic payment records first.</p>`,
                section3Title: 'Machine Not Working',
                section3Content: `<p>If the pay and display machine was broken, I couldn't get a ticket to display. Please confirm if the machine was working at the time.</p>`,
                legalFramework: `<p>Enforcement is under Section 66 of the Traffic Management Act 2004 and the relevant Traffic Regulation Order.</p>`,
                regulations: 'Civil Enforcement of Parking Contraventions (England) General Regulations 2007'
            },
            '11': {
                section2Title: 'Payment Was Made',
                section2Content: `<p>Code 11 applies to cashless parking areas. If I paid by phone or app and had a valid session running when the CEO checked, then there was no contravention. The council needs to show they checked the payment records before issuing this PCN.</p>`,
                section3Title: 'Signs for Cashless Parking',
                section3Content: `<p>The signs should make it clear that payment is electronic only and explain how to pay. If the signs don't clearly explain this, the contravention may not be valid.</p>`,
                legalFramework: `<p>The council's power comes from Section 66 of the Traffic Management Act 2004 and the relevant Traffic Regulation Order.</p>`,
                regulations: 'Civil Enforcement of Parking Contraventions (England) General Regulations 2007'
            },
            '12': {
                section2Title: 'I Had a Valid Permit',
                section2Content: `<p>I had a valid permit to park in this area at the time. The permit wasn't visible for reasons outside my control. I was entitled to park there, and I can provide evidence of my permit.</p>`,
                section3Title: 'Procedural Requirements',
                section3Content: `<p>The PCN needs to comply with the Traffic Management Act 2004 and the 2007 Regulations. Any missing information could make it invalid.</p>`,
                legalFramework: `<p>Parking enforcement is under Section 66 of the Traffic Management Act 2004 and the relevant Traffic Regulation Order.</p>`,
                regulations: 'Civil Enforcement of Parking Contraventions (England) General Regulations 2007'
            },
            '16': {
                section2Title: 'Valid Permit',
                section2Content: `<p>I had a valid permit for this permit space at the time. The permit may not have been clearly displayed, but I was authorised to park there.</p>`,
                section3Title: 'Bay Markings and Signs',
                section3Content: `<p>Permit bays must be clearly marked with signs that meet TSRGD 2016 requirements. If the markings or signs don't comply, the restriction may not be enforceable.</p>`,
                legalFramework: `<p>Enforcement comes from Section 66 of the Traffic Management Act 2004 and the relevant Traffic Regulation Order.</p>`,
                regulations: 'Civil Enforcement of Parking Contraventions (England) General Regulations 2007'
            },
            '21': {
                section2Title: 'Suspension Signs Not Clear',
                section2Content: `<p>The suspended bay wasn't clearly marked. The signs either weren't there, weren't visible, or didn't give enough notice of the suspension. Under TSRGD 2016, restrictions need to be clearly signed so drivers can see them.</p>`,
                section3Title: 'Procedural Requirements',
                section3Content: `<p>The PCN must meet the requirements of the Traffic Management Act 2004 and the 2007 Regulations.</p>`,
                legalFramework: `<p>Enforcement is under Section 66 of the Traffic Management Act 2004 and the relevant Traffic Regulation Order.</p>`,
                regulations: 'Civil Enforcement of Parking Contraventions (England) General Regulations 2007'
            },
            '25': {
                section2Title: 'Loading or Unloading',
                section2Content: `<p>I was actively loading or unloading goods at the time. This is allowed in loading bays under the Road Traffic Regulation Act 1984. I didn't leave the vehicle unattended for longer than needed.</p>`,
                section3Title: 'Bay Markings',
                section3Content: `<p>Loading bays need clear markings and signs that comply with TSRGD 2016. Non-compliant markings could make the restriction unenforceable.</p>`,
                legalFramework: `<p>Enforcement is under Section 66 of the Traffic Management Act 2004. Loading exemptions come from the Road Traffic Regulation Act 1984.</p>`,
                regulations: 'Civil Enforcement of Parking Contraventions (England) General Regulations 2007'
            },
            '30': {
                section2Title: 'Circumstances Beyond My Control',
                section2Content: `<p>I couldn't move the vehicle within the time limit due to circumstances I couldn't control. Given what happened, enforcing this PCN would be unreasonable.</p>`,
                section3Title: 'Procedural Requirements',
                section3Content: `<p>The PCN must comply with the Traffic Management Act 2004 and the 2007 Regulations.</p>`,
                legalFramework: `<p>Enforcement comes from Section 66 of the Traffic Management Act 2004 and the relevant Traffic Regulation Order.</p>`,
                regulations: 'Civil Enforcement of Parking Contraventions (England) General Regulations 2007'
            },
            '31': {
                section2Title: 'Exit Was Clear',
                section2Content: `<p>When I entered the box junction, my exit was clear. I expected to drive straight through, but other traffic moved and blocked me. This is a valid defence. The Highway Code and the regulations say a contravention only happens if you enter when your exit isn't clear.</p>`,
                section3Title: 'Box Junction Markings',
                section3Content: `<p>Box junction markings must meet TSRGD 2016 standards. If they're faded or wrong, the box junction can't be enforced.</p>`,
                legalFramework: `<p>Enforcement is under Section 66 of the Traffic Management Act 2004. Box junction rules come from TSRGD 2016.</p>`,
                regulations: 'Civil Enforcement of Parking Contraventions (England) General Regulations 2007'
            },
            '34': {
                section2Title: 'Bus Lane Signs',
                section2Content: `<p>At the time of this alleged contravention, either the bus lane wasn't operating, or the signs weren't adequate. Bus lanes only run during certain hours, and the signs need to meet TSRGD 2016 standards.</p>`,
                section3Title: 'Operating Hours',
                section3Content: `<p>Bus lanes only operate during specific times. If this happened outside those hours, there was no contravention. Please confirm the bus lane was operating at the exact time shown on the PCN.</p>`,
                legalFramework: `<p>Enforcement is under Section 66 of the Traffic Management Act 2004 and the relevant Traffic Regulation Order. Bus lane rules come from the Road Traffic Regulation Act 1984 and TSRGD 2016.</p>`,
                regulations: 'Civil Enforcement of Parking Contraventions (England) General Regulations 2007'
            },
            '40': {
                section2Title: 'Blue Badge Display',
                section2Content: `<p>A Blue Badge should show the photo, expiry date and badge number. If the badge was there but hard to read because of sunlight or where it was placed, the CEO should have tried harder to check it.</p>`,
                section3Title: 'Disabled Bay Requirements',
                section3Content: `<p>Disabled bays need a Traffic Regulation Order and signs that meet TSRGD 2016. If the bay wasn't properly set up or signed, it may not be enforceable.</p>`,
                legalFramework: `<p>The council needs to show: a valid Traffic Regulation Order for the bay, compliant signage, and that no valid Blue Badge was properly displayed.</p>`,
                regulations: 'Civil Enforcement of Parking Contraventions (England) General Regulations 2007'
            },
            '45': {
                section2Title: 'Dropping Off Passengers',
                section2Content: `<p>Code 45 is for vehicles stopped on a taxi rank. If I only stopped briefly to let someone out or pick them up, that's different from "stopping" on the rank. Licensed taxis can use ranks, and a brief stop to drop off passengers is usually allowed.</p>`,
                section3Title: 'Rank Markings',
                section3Content: `<p>Taxi ranks need clear road markings and signs meeting TSRGD 2016. Faded or missing markings could mean the rank isn't enforceable.</p>`,
                legalFramework: `<p>Taxi ranks are set up by Traffic Regulation Orders under the Road Traffic Regulation Act 1984 and must be signed according to TSRGD 2016.</p>`,
                regulations: 'Civil Enforcement of Parking Contraventions (England) General Regulations 2007'
            },
            '47': {
                section2Title: 'Reason for Stopping',
                section2Content: `<p>I had a good reason for stopping, or the bus stop signs weren't adequate. Stopping on a bus stop can be justified in emergencies, breakdowns, or situations beyond the driver's control.</p>`,
                section3Title: 'Bus Stop Signs',
                section3Content: `<p>Bus stops need proper markings and signs that meet TSRGD 2016. Non-compliant signs could mean the restriction isn't enforceable.</p>`,
                legalFramework: `<p>Enforcement comes from Section 66 of the Traffic Management Act 2004 and the relevant Traffic Regulation Order.</p>`,
                regulations: 'Civil Enforcement of Parking Contraventions (England) General Regulations 2007'
            },
            '62': {
                section2Title: 'Where the Vehicle Was',
                section2Content: `<p>Code 62 is for parking with wheels on the footpath. If my vehicle was completely on the road (the carriageway), then this contravention doesn't apply. Footway parking enforcement only applies in designated Special Enforcement Areas.</p>`,
                section3Title: 'Narrow Roads',
                section3Content: `<p>Sometimes there's no choice but to have wheels partly on the pavement because the road is too narrow to park without blocking traffic. Adjudicators recognise this can be necessary in some situations.</p>`,
                legalFramework: `<p>Footway parking enforcement comes from Section 66 of the Traffic Management Act 2004 and Schedule 3A of the Road Traffic Regulation Act 1984. The council needs to show this location is in a properly designated Special Enforcement Area.</p>`,
                regulations: 'Civil Enforcement of Parking Contraventions (England) General Regulations 2007'
            }
        },
        wales: {
            '01': {
                section2Title: 'Signage and Road Markings',
                section2Content: `<p>For a code 01 contravention to be valid, the waiting restrictions must be properly signed and marked. The yellow lines at this location should comply with the Traffic Signs Regulations and General Directions 2016 (TSRGD 2016). If the lines are faded, broken, or the wrong width, or if the time plate signs are missing or hard to read, the restriction may not be enforceable.</p>
                <p>The High Court case <em>Herron v The Parking Adjudicator</em> [2010] confirmed that signage problems at the actual location of the contravention can make a PCN invalid. Please confirm that the lines and signs at this specific location meet all the requirements for Wales.</p>`,
                section3Title: 'Procedural Requirements',
                section3Content: `<p>The PCN must include certain information required by the Traffic Management Act 2004 and the 2008 Wales Regulations, such as the date of the notice and the date of the alleged contravention. If any of this information is missing or incorrect, the PCN may be invalid.</p>`,
                legalFramework: `<p>This PCN was issued under Section 66 of the Traffic Management Act 2004. The parking restriction should be backed by a valid Traffic Regulation Order under the Road Traffic Regulation Act 1984, with signage that meets TSRGD 2016 standards. Welsh councils must also follow the Civil Enforcement of Parking Contraventions (Wales) Regulations 2008.</p>`,
                regulations: 'Civil Enforcement of Parking Contraventions (Wales) Regulations 2008'
            },
            '02': {
                section2Title: 'Loading Restriction Signs',
                section2Content: `<p>For a code 02 contravention, there should be yellow kerb marks (blips) on the pavement edge as well as yellow lines. If I was loading or unloading at the time, and there are no kerb marks or the no-loading signs don't meet the requirements, then this contravention may not apply.</p>
                <p>Please confirm whether kerb blips were present at this exact location and whether the signs comply with TSRGD 2016.</p>`,
                section3Title: 'Correct Contravention Code',
                section3Content: `<p>The PCN should correctly identify what happened. Issuing a code 02 PCN where no loading restriction exists (no kerb blips) would not be appropriate.</p>`,
                legalFramework: `<p>Loading restrictions require a Traffic Regulation Order under the Road Traffic Regulation Act 1984 and must be signed according to TSRGD 2016.</p>`,
                regulations: 'Civil Enforcement of Parking Contraventions (Wales) Regulations 2008'
            },
            '05': {
                section2Title: 'Payment Was Valid',
                section2Content: `<p>A code 05 PCN is issued when paid parking time has run out. If I had paid for parking (by ticket, app, or phone) and the session was still active when the CEO checked, then no contravention occurred.</p>`,
                section3Title: 'Payment Machine Problems',
                section3Content: `<p>If the pay and display machine wasn't working at the time, I couldn't have bought a ticket. Please confirm whether the machine was operational.</p>`,
                legalFramework: `<p>Paid parking enforcement comes from Section 66 of the Traffic Management Act 2004 and the relevant Traffic Regulation Order.</p>`,
                regulations: 'Civil Enforcement of Parking Contraventions (Wales) Regulations 2008'
            },
            '06': {
                section2Title: 'Pay-by-Phone Payment',
                section2Content: `<p>When parking is paid for by phone or app, you don't need to display a paper ticket. If I had a valid parking session on the app at the time, this PCN shouldn't have been issued. The CEO should have checked the electronic payment records first.</p>`,
                section3Title: 'Machine Not Working',
                section3Content: `<p>If the pay and display machine was broken, I couldn't get a ticket to display. Please confirm if the machine was working at the time.</p>`,
                legalFramework: `<p>Enforcement is under Section 66 of the Traffic Management Act 2004 and the relevant Traffic Regulation Order.</p>`,
                regulations: 'Civil Enforcement of Parking Contraventions (Wales) Regulations 2008'
            },
            '11': {
                section2Title: 'Payment Was Made',
                section2Content: `<p>Code 11 applies to cashless parking areas. If I paid by phone or app and had a valid session running when the CEO checked, then there was no contravention. The council needs to show they checked the payment records before issuing this PCN.</p>`,
                section3Title: 'Signs for Cashless Parking',
                section3Content: `<p>The signs should make it clear that payment is electronic only and explain how to pay. If the signs don't clearly explain this, the contravention may not be valid.</p>`,
                legalFramework: `<p>The council's power comes from Section 66 of the Traffic Management Act 2004 and the relevant Traffic Regulation Order.</p>`,
                regulations: 'Civil Enforcement of Parking Contraventions (Wales) Regulations 2008'
            },
            '12': {
                section2Title: 'I Had a Valid Permit',
                section2Content: `<p>I had a valid permit to park in this area at the time. The permit wasn't visible for reasons outside my control. I was entitled to park there, and I can provide evidence of my permit.</p>`,
                section3Title: 'Procedural Requirements',
                section3Content: `<p>The PCN needs to comply with the Traffic Management Act 2004 and the 2008 Wales Regulations. Any missing information could make it invalid.</p>`,
                legalFramework: `<p>Parking enforcement is under Section 66 of the Traffic Management Act 2004 and the relevant Traffic Regulation Order.</p>`,
                regulations: 'Civil Enforcement of Parking Contraventions (Wales) Regulations 2008'
            },
            '16': {
                section2Title: 'Valid Permit',
                section2Content: `<p>I had a valid permit for this permit space at the time. The permit may not have been clearly displayed, but I was authorised to park there.</p>`,
                section3Title: 'Bay Markings and Signs',
                section3Content: `<p>Permit bays must be clearly marked with signs that meet TSRGD 2016 requirements. If the markings or signs don't comply, the restriction may not be enforceable.</p>`,
                legalFramework: `<p>Enforcement comes from Section 66 of the Traffic Management Act 2004 and the relevant Traffic Regulation Order.</p>`,
                regulations: 'Civil Enforcement of Parking Contraventions (Wales) Regulations 2008'
            },
            '21': {
                section2Title: 'Suspension Signs Not Clear',
                section2Content: `<p>The suspended bay wasn't clearly marked. The signs either weren't there, weren't visible, or didn't give enough notice of the suspension. Under TSRGD 2016, restrictions need to be clearly signed so drivers can see them.</p>`,
                section3Title: 'Procedural Requirements',
                section3Content: `<p>The PCN must meet the requirements of the Traffic Management Act 2004 and the 2008 Wales Regulations.</p>`,
                legalFramework: `<p>Enforcement is under Section 66 of the Traffic Management Act 2004 and the relevant Traffic Regulation Order.</p>`,
                regulations: 'Civil Enforcement of Parking Contraventions (Wales) Regulations 2008'
            },
            '25': {
                section2Title: 'Loading or Unloading',
                section2Content: `<p>I was actively loading or unloading goods at the time. This is allowed in loading bays under the Road Traffic Regulation Act 1984. I didn't leave the vehicle unattended for longer than needed.</p>`,
                section3Title: 'Bay Markings',
                section3Content: `<p>Loading bays need clear markings and signs that comply with TSRGD 2016. Non-compliant markings could make the restriction unenforceable.</p>`,
                legalFramework: `<p>Enforcement is under Section 66 of the Traffic Management Act 2004. Loading exemptions come from the Road Traffic Regulation Act 1984.</p>`,
                regulations: 'Civil Enforcement of Parking Contraventions (Wales) Regulations 2008'
            },
            '30': {
                section2Title: 'Circumstances Beyond My Control',
                section2Content: `<p>I couldn't move the vehicle within the time limit due to circumstances I couldn't control. Given what happened, enforcing this PCN would be unreasonable.</p>`,
                section3Title: 'Procedural Requirements',
                section3Content: `<p>The PCN must comply with the Traffic Management Act 2004 and the 2008 Wales Regulations.</p>`,
                legalFramework: `<p>Enforcement comes from Section 66 of the Traffic Management Act 2004 and the relevant Traffic Regulation Order.</p>`,
                regulations: 'Civil Enforcement of Parking Contraventions (Wales) Regulations 2008'
            },
            '31': {
                section2Title: 'Exit Was Clear',
                section2Content: `<p>When I entered the box junction, my exit was clear. I expected to drive straight through, but other traffic moved and blocked me. This is a valid defence. The Highway Code and the regulations say a contravention only happens if you enter when your exit isn't clear.</p>`,
                section3Title: 'Box Junction Markings',
                section3Content: `<p>Box junction markings must meet TSRGD 2016 standards. If they're faded or wrong, the box junction can't be enforced.</p>`,
                legalFramework: `<p>Enforcement is under Section 66 of the Traffic Management Act 2004. Box junction rules come from TSRGD 2016.</p>`,
                regulations: 'Civil Enforcement of Parking Contraventions (Wales) Regulations 2008'
            },
            '34': {
                section2Title: 'Bus Lane Signs',
                section2Content: `<p>At the time of this alleged contravention, either the bus lane wasn't operating, or the signs weren't adequate. Bus lanes only run during certain hours, and the signs need to meet TSRGD 2016 standards.</p>`,
                section3Title: 'Operating Hours',
                section3Content: `<p>Bus lanes only operate during specific times. If this happened outside those hours, there was no contravention. Please confirm the bus lane was operating at the exact time shown on the PCN.</p>`,
                legalFramework: `<p>Enforcement is under Section 66 of the Traffic Management Act 2004 and the relevant Traffic Regulation Order. Bus lane rules come from the Road Traffic Regulation Act 1984 and TSRGD 2016.</p>`,
                regulations: 'Civil Enforcement of Parking Contraventions (Wales) Regulations 2008'
            },
            '40': {
                section2Title: 'Blue Badge Display',
                section2Content: `<p>A Blue Badge should show the photo, expiry date and badge number. If the badge was there but hard to read because of sunlight or where it was placed, the CEO should have tried harder to check it.</p>`,
                section3Title: 'Disabled Bay Requirements',
                section3Content: `<p>Disabled bays need a Traffic Regulation Order and signs that meet TSRGD 2016. If the bay wasn't properly set up or signed, it may not be enforceable.</p>`,
                legalFramework: `<p>The council needs to show: a valid Traffic Regulation Order for the bay, compliant signage, and that no valid Blue Badge was properly displayed.</p>`,
                regulations: 'Civil Enforcement of Parking Contraventions (Wales) Regulations 2008'
            },
            '45': {
                section2Title: 'Dropping Off Passengers',
                section2Content: `<p>Code 45 is for vehicles stopped on a taxi rank. If I only stopped briefly to let someone out or pick them up, that's different from "stopping" on the rank. Licensed taxis can use ranks, and a brief stop to drop off passengers is usually allowed.</p>`,
                section3Title: 'Rank Markings',
                section3Content: `<p>Taxi ranks need clear road markings and signs meeting TSRGD 2016. Faded or missing markings could mean the rank isn't enforceable.</p>`,
                legalFramework: `<p>Taxi ranks are set up by Traffic Regulation Orders under the Road Traffic Regulation Act 1984 and must be signed according to TSRGD 2016.</p>`,
                regulations: 'Civil Enforcement of Parking Contraventions (Wales) Regulations 2008'
            },
            '47': {
                section2Title: 'Reason for Stopping',
                section2Content: `<p>I had a good reason for stopping, or the bus stop signs weren't adequate. Stopping on a bus stop can be justified in emergencies, breakdowns, or situations beyond the driver's control.</p>`,
                section3Title: 'Bus Stop Signs',
                section3Content: `<p>Bus stops need proper markings and signs that meet TSRGD 2016. Non-compliant signs could mean the restriction isn't enforceable.</p>`,
                legalFramework: `<p>Enforcement comes from Section 66 of the Traffic Management Act 2004 and the relevant Traffic Regulation Order.</p>`,
                regulations: 'Civil Enforcement of Parking Contraventions (Wales) Regulations 2008'
            },
            '62': {
                section2Title: 'Where the Vehicle Was',
                section2Content: `<p>Code 62 is for parking with wheels on the footpath. If my vehicle was completely on the road (the carriageway), then this contravention doesn't apply. Footway parking enforcement only applies in designated Special Enforcement Areas.</p>`,
                section3Title: 'Narrow Roads',
                section3Content: `<p>Sometimes there's no choice but to have wheels partly on the pavement because the road is too narrow to park without blocking traffic. Adjudicators recognise this can be necessary in some situations.</p>`,
                legalFramework: `<p>Footway parking enforcement comes from Section 66 of the Traffic Management Act 2004 and Schedule 3A of the Road Traffic Regulation Act 1984. The council needs to show this location is in a properly designated Special Enforcement Area.</p>`,
                regulations: 'Civil Enforcement of Parking Contraventions (Wales) Regulations 2008'
            }
        }
    };
    
    return contents[country][code] || contents['england']['01'];
}

// Generate HTML letter from template content
function generateHTMLLetter(content, data, country) {
    const date = formatDate(new Date());
    const contraventionDate = formatDate(data.contraventionDate);
    
    return `
<div style="font-family: 'Times New Roman', serif; line-height: 1.6; max-width: 650px; margin: 0 auto; padding: 40px;">
    <div style="text-align: right; margin-bottom: 30px;">
        <p style="margin: 0;">${data.applicantName || 'Your Name'}</p>
        <p style="margin: 0;">${data.applicantAddress || 'Your Address'}</p>
        <p style="margin: 0;">${data.applicantPostcode || 'Your Postcode'}</p>
    </div>
    
    <div style="text-align: left; margin-bottom: 30px;">
        <p style="margin: 0;">${date}</p>
    </div>
    
    <div style="text-align: left; margin-bottom: 30px;">
        <p style="margin: 0;">Parking Services</p>
        <p style="margin: 0;">${data.council}</p>
    </div>
    
    <p style="font-weight: bold; margin-bottom: 20px; border-left: 3px solid #333; padding-left: 12px;">
        RE: Formal Representations Against Penalty Charge Notice ${data.pcnRef}<br>
        Vehicle Registration: ${data.vehicleReg}<br>
        Date of Contravention: ${contraventionDate}<br>
        Location: ${data.location}
    </p>
    
    <p>Dear Sir or Madam,</p>
    
    <p>I am writing to make formal representations against Penalty Charge Notice ${data.pcnRef}, issued by ${data.council} in respect of vehicle ${data.vehicleReg} at ${data.location} on ${contraventionDate}.</p>
    
    <p>Having reviewed the circumstances and the evidence available, I believe the Penalty Charge Notice should be cancelled on the following grounds.</p>
    
    <h3 style="margin-top: 28px; font-size: 1em; text-transform: uppercase; letter-spacing: 0.05em;">1. The Contravention Did Not Occur</h3>
    <p>${data.circumstances}</p>
    
    <h3 style="margin-top: 28px; font-size: 1em; text-transform: uppercase; letter-spacing: 0.05em;">2. ${content.section2Title}</h3>
    ${content.section2Content}
    
    <h3 style="margin-top: 28px; font-size: 1em; text-transform: uppercase; letter-spacing: 0.05em;">3. ${content.section3Title}</h3>
    ${content.section3Content}
    
    <h3 style="margin-top: 28px; font-size: 1em; text-transform: uppercase; letter-spacing: 0.05em;">4. Mitigating Circumstances</h3>
    <p>${data.circumstances}</p>
    
    <h3 style="margin-top: 28px; font-size: 1em; text-transform: uppercase; letter-spacing: 0.05em;">5. Legal Framework</h3>
    ${content.legalFramework}
    
    <p>In light of the above, I respectfully request that the Penalty Charge Notice is cancelled in full.</p>
    
    <p>If you do not accept these representations, please treat this letter as a formal request for the following evidence:</p>
    
    <ul style="margin-top: 8px;">
        <li style="margin-bottom: 4px;">All Civil Enforcement Officer (CEO) notes and observations made at the time of the alleged contravention;</li>
        <li style="margin-bottom: 4px;">All photographic evidence taken by the CEO or any CCTV/camera system;</li>
        <li style="margin-bottom: 4px;">The relevant Traffic Regulation Order(s) (TRO) and any amendments or variations;</li>
        <li style="margin-bottom: 4px;">Confirmation that the TRO is valid, properly made and currently in force;</li>
        <li style="margin-bottom: 4px;">A full explanation of how all statutory requirements under the Traffic Management Act 2004 and the ${content.regulations} have been satisfied.</li>
    </ul>
    
    <p>I reserve the right to appeal to the Traffic Penalty Tribunal should representations be rejected, and to rely on any additional grounds that may arise from the evidence disclosed.</p>
    
    <p>I look forward to your response within the statutory period.</p>
    
    <div style="margin-top: 40px;">
        <p>Yours faithfully,</p>
        <br>
        <p>${data.applicantName || 'Your Name'}</p>
    </div>
    
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ccc;">
        <p style="font-size: 12px; color: #666;">
            <strong>Vehicle Registration:</strong> ${data.vehicleReg}<br>
            <strong>PCN Reference:</strong> ${data.pcnRef}<br>
            <strong>Date of Contravention:</strong> ${contraventionDate}<br>
            <strong>Location:</strong> ${data.location}
        </p>
    </div>
</div>
    `;
}

// Helper function to format dates
function formatDate(date) {
    if (typeof date === 'string') {
        date = new Date(date);
    }
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('en-GB', options);
}

// Get template for a contravention code and country
function getTemplate(code, country = 'england') {
    const countryTemplates = templates[country] || templates['england'];
    return countryTemplates[code] || countryTemplates['01'];
}

// Export for use in other scripts
window.templates = templates;
window.getTemplate = getTemplate;
window.formatDate = formatDate;