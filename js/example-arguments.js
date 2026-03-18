// Example Arguments for each Contravention Code
const EXAMPLE_ARGUMENTS = {
    "01": [
        "The signage at the location was obscured by overgrown vegetation, making it impossible to see the restriction clearly.",
        "I was actively loading/unloading goods from my vehicle, which is a permitted activity. The brief stop was necessary and reasonable.",
        "The road markings were faded and unclear. I genuinely believed I was parking in a permitted area.",
        "I had broken down and was waiting for assistance. My hazard lights were on and I was not parked voluntarily."
    ],
    "02": [
        "I was engaged in loading/unloading activities. The Traffic Management Act 2004 permits this in restricted streets.",
        "The restriction signs were obscured by a parked van, making them invisible from my approach.",
        "I was dropping off a passenger with mobility issues. This is a reasonable exemption under equality considerations.",
        "The loading restriction times were unclear on the sign. I believed I was within permitted hours."
    ],
    "05": [
        "I had paid for parking using the pay-by-phone app. The session was active when I returned to my vehicle.",
        "The pay and display machine was not working. I attempted to pay but the machine would not accept my coins.",
        "I returned to my vehicle before the paid time expired. The CEO must have misread the ticket or time.",
        "The ticket was face-up on the dashboard but may have been obscured by condensation or sunlight."
    ],
    "06": [
        "A valid pay and display ticket was displayed on the dashboard. It may have been overlooked by the CEO.",
        "I paid for parking using the mobile app. No physical ticket is required when using electronic payment.",
        "The pay and display machine was out of order. I had no way to obtain a physical ticket.",
        "The ticket fell from the windscreen. I have the receipt showing valid payment was made."
    ],
    "11": [
        "The parking machine was out of order. I attempted to pay using the app but it would not accept my registration.",
        "I have a valid residents' permit but it fell from the windscreen. I can provide proof of purchase.",
        "The pay-and-display ticket was clearly visible on my dashboard. The CEO must have missed it.",
        "I was in the process of purchasing a ticket when the CEO arrived. I have the timestamped receipt."
    ],
    "12": [
        "I hold a valid residents' parking permit for this zone. It was not displayed due to [reason: falling off dashboard/wrong vehicle/etc].",
        "I am a visitor of a resident and was using their visitor permit, which I can provide evidence for.",
        "The permit was visible in the windscreen but may have been obscured by sunlight reflection.",
        "I had applied for a permit and was waiting for it to arrive. I have the application confirmation."
    ],
    "16": [
        "I hold a valid permit for this car park. It was not displayed correctly but I can provide proof of purchase.",
        "The permit machine was not working and I could not obtain a ticket despite trying multiple times.",
        "I was using a disabled badge which permits parking in permit spaces. The badge was visible.",
        "The permit had expired that day and I was in the process of renewing it. I have the renewal confirmation."
    ],
    "21": [
        "The suspension signage was not visible from my approach due to its positioning behind a tree/building.",
        "The suspension notice was dated for tomorrow, not today. I have a photograph showing the incorrect date.",
        "I was a disabled badge holder and the suspension did not apply to disabled bays.",
        "The bay was not clearly marked as suspended. The sign was missing or damaged."
    ],
    "25": [
        "I was actively loading/unloading goods. This is permitted in loading places and does not constitute parking.",
        "The loading restriction times had ended. I checked the sign and believed I was within permitted hours.",
        "I was collecting a pre-ordered item which took longer than expected due to store delays.",
        "The vehicle is a commercial vehicle with goods being loaded/unloaded. This is the purpose of the bay."
    ],
    "30": [
        "I was delayed due to an emergency phone call regarding a family member. This was beyond my control.",
        "The parking meter was faulty and would not accept payment, preventing me from extending my stay.",
        "I have a valid Blue Badge and am entitled to additional parking time.",
        "The time limit was unclear on the signage. I believed I was within the permitted duration."
    ],
    "31": [
        "I entered the box junction when my exit was clear. Traffic ahead stopped unexpectedly due to a breakdown.",
        "I was waiting to turn right and was prevented from clearing the junction by oncoming traffic.",
        "The vehicle ahead of me broke down in the junction, blocking my exit.",
        "I was following the vehicle in front which stopped suddenly, leaving me trapped in the junction."
    ],
    "34": [
        "The bus lane was not in operation at the time. The signage indicated restricted hours which had ended.",
        "I entered the bus lane to avoid an obstruction in the main carriageway.",
        "I was directed into the bus lane by police/traffic officer due to an incident ahead.",
        "The bus lane signage was obscured and I was unaware I had entered a restricted lane."
    ],
    "40": [
        "I was picking up a child from school. This was a brief stop, not parking.",
        "The school restriction signage was not clearly visible or was missing.",
        "I was setting down a disabled passenger. This is permitted under the regulations.",
        "The restriction was not in force at the time stated on the PCN."
    ],
    "45": [
        "I stopped only momentarily to set down a passenger. This was not parking on a taxi rank.",
        "The taxi rank markings were faded and unclear. I was not aware I was in a restricted area.",
        "I am a licensed taxi driver and was lawfully using the rank.",
        "I was directed to stop there by a traffic warden/police officer."
    ],
    "47": [
        "I stopped only to set down a passenger with mobility difficulties. This is permitted.",
        "I was directed to stop by a bus driver who was unable to pull into the stop due to obstruction.",
        "The bus stop was not clearly marked and I was unaware it was a restricted area.",
        "I stopped for less than 30 seconds to check my directions. This was momentary, not parking."
    ],
    "62": [
        "My vehicle was wholly on the carriageway. No wheel was on the footpath or verge.",
        "The carriageway was too narrow to park without obstructing traffic. I had no choice but to mount the kerb.",
        "This area is not within a designated Special Enforcement Area for footway parking.",
        "The signage indicating the footway parking restriction was absent or non-compliant."
    ]
};

// Function to populate example dropdown
function populateExampleArguments(code) {
    const examples = EXAMPLE_ARGUMENTS[code] || [];
    const select = document.getElementById('example-arguments');
    
    if (!select) return;
    
    select.innerHTML = '<option value="">Select an example to get ideas...</option>';
    
    examples.forEach((example, index) => {
        const option = document.createElement('option');
        option.value = example;
        option.textContent = example.substring(0, 80) + '...';
        select.appendChild(option);
    });
}

// Function to handle example selection - populates circumstances textarea
function handleExampleSelection(e) {
    const selectedExample = e.target.value;
    const circumstancesTextarea = document.getElementById('circumstances');
    
    if (selectedExample && circumstancesTextarea) {
        // Append to existing text or replace if empty
        const currentText = circumstancesTextarea.value.trim();
        if (currentText) {
            circumstancesTextarea.value = currentText + '\n\n' + selectedExample;
        } else {
            circumstancesTextarea.value = selectedExample;
        }
        // Reset dropdown to placeholder
        e.target.value = '';
        // Focus on textarea for editing
        circumstancesTextarea.focus();
    }
}

// Initialize example arguments event listener
document.addEventListener('DOMContentLoaded', () => {
    const exampleSelect = document.getElementById('example-arguments');
    if (exampleSelect) {
        exampleSelect.addEventListener('change', handleExampleSelection);
    }
});

// Make functions globally available
window.EXAMPLE_ARGUMENTS = EXAMPLE_ARGUMENTS;
window.populateExampleArguments = populateExampleArguments;