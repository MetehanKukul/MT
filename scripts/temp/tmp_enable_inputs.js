const fs = require('fs');

let code = fs.readFileSync('public/app.js', 'utf8');

code = code.replace(
    '<input type="text" id="settings-name" class="form-control" value="${name}" placeholder="Ad Soyadınızı girin" required disabled />',
    '<input type="text" id="settings-name" class="form-control" value="${name}" placeholder="Ad Soyadınızı girin" required />'
);

code = code.replace(
    '<input type="email" id="settings-email" class="form-control" value="${email}" placeholder="E-posta adresinizi girin" required disabled />',
    '<input type="email" id="settings-email" class="form-control" value="${email}" placeholder="E-posta adresinizi girin" required />'
);

// Form is saved locally but there's a phone input too, let's make sure that's saved if the user updates it
const oldSaveFuncMatch = "currentUser.name = newName;\n          currentUser.email = newEmail;";
const newSaveFuncMatch = "currentUser.name = newName;\n          currentUser.email = newEmail;\n          const newPhone = document.getElementById('settings-phone').value.trim();\n          currentUser.phone = newPhone;";
code = code.replace(oldSaveFuncMatch, newSaveFuncMatch);

// We need to fetch and set phone number in the initial render too
code = code.replace(
    "const regDate = currentUser && currentUser.registrationDate",
    "const phone = currentUser && currentUser.phone ? currentUser.phone : '';\n  const regDate = currentUser && currentUser.registrationDate"
);

code = code.replace(
    '<input type="tel" id="settings-phone" class="form-control" placeholder="05XX XXX XX XX" />',
    '<input type="tel" id="settings-phone" class="form-control" value="${phone}" placeholder="05XX XXX XX XX" />'
);

fs.writeFileSync('public/app.js', code);
console.log('App.js required disabled attributes removed');