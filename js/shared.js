window.codeDescriptions = {
    '01': 'Parked in a restricted street during prescribed hours',
    '02': 'Parked or loading/unloading in a restricted street where waiting and loading restrictions are in force',
    '05': 'Parked after the expiry of paid for time',
    '06': 'Parked without clearly displaying a valid pay and display ticket or voucher',
    '11': 'Parked without payment of the parking charge',
    '12': 'Parked in a residents\' parking space without displaying a valid permit',
    '16': 'Parked in a permit space without displaying a valid permit',
    '21': 'Parked in a suspended bay/space or part of bay/space',
    '25': 'Parked in a loading place during restricted hours without loading',
    '30': 'Parked for longer than permitted',
    '31': 'Entering and stopping in a box junction when prohibited',
    '34': 'Being in a bus lane',
    '40': 'Stopped in a restricted area outside a school',
    '45': 'Stopped on a taxi rank',
    '47': 'Stopped on a restricted bus stop/stand',
    '62': 'Parked with one or more wheels on or over a footpath or any part of a road other than a carriageway'
};

window.renderProgressStepper = function(currentStep) {
    const steps = [
        { num: 1, label: 'Details' },
        { num: 2, label: 'Preview' },
        { num: 3, label: 'Payment' },
        { num: 4, label: 'Download' }
    ];
    
    let html = '<div class="flex items-center justify-between">';
    
    steps.forEach((step, index) => {
        const isCompleted = step.num < currentStep;
        const isCurrent = step.num === currentStep;
        const isPending = step.num > currentStep;
        
        let circleClass, textClass, lineClass, circleContent;
        
        if (isCompleted) {
            circleClass = 'step-complete';
            textClass = 'text-gray-900';
            lineClass = 'bg-green-500';
            circleContent = '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>';
        } else if (isCurrent) {
            circleClass = 'step-active';
            textClass = 'text-blue-600';
            lineClass = 'bg-gray-200';
            circleContent = step.num;
        } else {
            circleClass = 'step-pending';
            textClass = 'text-gray-500';
            lineClass = 'bg-gray-200';
            circleContent = step.num;
        }
        
        html += `
            <div class="flex items-center">
                <div class="w-10 h-10 rounded-full ${circleClass} flex items-center justify-center font-semibold">${circleContent}</div>
                <span class="ml-3 text-sm font-medium ${textClass}">${step.label}</span>
            </div>`;
        
        if (index < steps.length - 1) {
            const nextStep = steps[index + 1];
            const lineDoneClass = (step.num < currentStep) ? 'bg-green-500' : ((step.num === currentStep) ? 'bg-blue-500' : 'bg-gray-200');
            html += `<div class="flex-1 mx-4 h-1 ${lineDoneClass} rounded"></div>`;
        }
    });
    
    html += '</div>';
    return html;
};