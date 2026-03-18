// Google reCAPTCHA v3 Configuration
const RECAPTCHA_SITE_KEY = '6LdlX40sAAAAADTiPnvn7tLAM-511ALVzSIzxgGp';
const RECAPTCHA_SECRET_KEY = '6LdlX40sAAAAAGYeEOyKl9N8QlO9XoHPIES_eIus';

// Execute reCAPTCHA on form submit
function executeRecaptcha(action) {
    return new Promise((resolve, reject) => {
        grecaptcha.ready(function() {
            grecaptcha.execute(RECAPTCHA_SITE_KEY, {action: action})
                .then(function(token) {
                    resolve(token);
                })
                .catch(function(error) {
                    reject(error);
                });
        });
    });
}
