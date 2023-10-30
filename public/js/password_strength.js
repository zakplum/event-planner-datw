$(document).ready(function() {
    const passwordInput = $('#password');
    const progressBar = $('#password-strength-bar');


    passwordInput.on('input', function() {
        const password = passwordInput.val();
        let strength = 0;

        if (password.length >= 8) {
            strength += 50;
        } 

        if (/[!@#$%^&*]/.test(password)) {
            strength += 50;
        } 
        progressBar.val(strength);
    });
});