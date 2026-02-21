// Secret Admin Tap Handler
// Tap the ⛳ option-icon 5 times within 3 seconds to trigger admin password prompt.
// Used on index.html and rounds.html.

(function() {
    const TAP_COUNT_REQUIRED = 5;
    const TAP_WINDOW_MS = 3000;

    let tapTimestamps = [];

    // Find the first ⛳ option-icon in the nav
    const optionIcon = document.querySelector('.navbar .option-icon');
    if (!optionIcon) return;

    optionIcon.addEventListener('click', function(e) {
        const now = Date.now();

        // Remove taps outside the time window
        tapTimestamps = tapTimestamps.filter(t => now - t < TAP_WINDOW_MS);
        tapTimestamps.push(now);

        if (tapTimestamps.length >= TAP_COUNT_REQUIRED) {
            tapTimestamps = [];
            showAdminModal();
        }
    });
})();

// Show the admin password modal
function showAdminModal() {
    const modal = document.getElementById('admin-password-modal');
    const input = document.getElementById('admin-password-input');
    const error = document.getElementById('admin-password-error');

    if (!modal) return;

    modal.style.display = 'flex';
    error.style.display = 'none';
    input.value = '';
    document.body.style.overflow = 'hidden';

    // Focus the input after a brief delay (mobile keyboard)
    setTimeout(() => input.focus(), 100);
}

// Close the admin password modal
function closeAdminModal() {
    const modal = document.getElementById('admin-password-modal');
    if (!modal) return;

    modal.style.display = 'none';
    document.body.style.overflow = '';
}

// Submit the admin password
async function submitAdminPassword() {
    const input = document.getElementById('admin-password-input');
    const error = document.getElementById('admin-password-error');
    const submitBtn = document.querySelector('.admin-password-btn.submit');

    const password = input.value.trim();
    if (!password) return;

    // Disable button while verifying
    submitBtn.disabled = true;
    submitBtn.textContent = 'Verifying...';

    try {
        const isValid = await verifyAdminPassword(password);

        if (isValid) {
            // Store password for session verification
            localStorage.setItem('adminPassword', password);
            // Redirect to admin page
            window.location.href = 'admin.html';
        } else {
            error.style.display = 'block';
            input.value = '';
            input.focus();
        }
    } catch (err) {
        console.error('Admin verification error:', err);
        error.textContent = 'Verification failed. Try again.';
        error.style.display = 'block';
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Enter';
    }
}

// Handle Enter key in password input
document.addEventListener('DOMContentLoaded', function() {
    const input = document.getElementById('admin-password-input');
    if (input) {
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                submitAdminPassword();
            }
            // Hide error on new input
            const error = document.getElementById('admin-password-error');
            if (error) error.style.display = 'none';
        });
    }

    // Close modal on backdrop click
    const modal = document.getElementById('admin-password-modal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeAdminModal();
            }
        });
    }
});
