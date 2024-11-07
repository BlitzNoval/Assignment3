const form = document.getElementById('trainerForm');
let isFormValid = false;

form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (validateForm()) {
        showSuccessModal();
    }
});

form.addEventListener('input', function (e) {
    const fieldId = e.target.id;
    validateField(fieldId);
});

function validateForm() {
    let isValid = true;
    isValid &= validateField('name');
    isValid &= validateField('trainerName');
    isValid &= validateField('email');
    isValid &= validateField('password');
    isValid &= validateField('phone');
    isFormValid = isValid;
    return isValid;
}

function validateField(id) {
    const input = document.getElementById(id);
    const error = document.getElementById(`${id}Error`);
    let isValid = true;

    switch (id) {
        case 'name':
            isValid = /^[A-Za-z\s]+$/.test(input.value);
            error.textContent = 'Name must contain only letters and spaces';
            break;
        case 'trainerName':
            const trainerNameLength = input.value.length;
            if (trainerNameLength < 3) {
                isValid = false;
                error.textContent = 'The trainer name cannot exceed 12 characters.';
            } else if (trainerNameLength > 12) {
                isValid = false;
                error.textContent = 'Trainer name cannot be longer than 12 characters';
            } else {
                isValid = true;
            }
            updateCharacterCount('trainerName', trainerNameLength, 12);
            break;
        case 'email':
            isValid = /^[^\s@]+@(gmail|yahoo|outlook|hotmail)\.com$/.test(input.value);
            error.textContent = 'Please enter a valid email (e.g., @gmail.com, @yahoo.com)';
            break;
        case 'password':
            isValid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(input.value);
            error.textContent = 'Password must be at least 8 characters, include uppercase, lowercase, a number, and a special character';
            break;
        case 'phone':
            isValid = /^\d{10}$/.test(input.value);
            error.textContent = 'Phone number must be 10 digits';
            updateCharacterCount('phone', input.value.length, 10);
            break;
    }

    if (!isValid) {
        error.style.display = 'block';
        input.style.borderColor = 'red';
    } else {
        error.style.display = 'none';
        input.style.borderColor = '#ddd';
    }

    return isValid;
}

function updateCharacterCount(fieldId, currentLength, requiredLength) {
    const countElement = document.getElementById(`${fieldId}Count`);
    countElement.textContent = `${currentLength}/${requiredLength}`;
}

const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');

togglePassword.addEventListener('click', function() {
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        togglePassword.classList.add('hidden');
    } else {
        passwordInput.type = 'password';
        togglePassword.classList.remove('hidden');
    }
});

function googleLogin() {
    alert("Redirecting to Google login...");
}

function showSuccessModal() {
    const modal = document.getElementById('successModal');
    modal.style.display = 'flex';
}

// Add click outside modal to close
document.addEventListener('click', function(event) {
    const modal = document.getElementById('successModal');
    const successContent = document.querySelector('.success-content');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});
