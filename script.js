// shortcuts
const $ = id => document.getElementById(id);

// field mapping
const fieldIds = ['name', 'job', 'email', 'phone', 'location', 'about', 'objective', 'education', 'experience', 'certifications', 'languages', 'skills', 'linkedin', 'github', 'portfolio', 'preference'];
const F = {};
fieldIds.forEach(id => F[id] = $(id));

// other elements
const photoInput = $('photoInput'), photoPreview = $('photoPreview'), p_photo = $('p_photo');
const gradEls = document.querySelectorAll('.grad');
const paperInner = $('paperInner');
const accentPicker = $('accentPicker'), secondaryPicker = $('secondaryPicker'), backgroundPicker = $('backgroundPicker');
const yearSpan = $('year'); yearSpan.textContent = new Date().getFullYear();

// preview nodes
const p_name = $('p_name'), p_role = $('p_role'), p_contact = $('p_contact');
const p_about = $('p_about'), p_objective = $('p_objective'), p_education = $('p_education'), p_experience = $('p_experience');
const p_certifications = $('p_certifications'), p_languages = $('p_languages'), p_skills = $('p_skills'), p_social = $('p_social');
const p_preference = $('p_preference');

// color helpers
function hexToRgb(h) { if (!h) return [255, 255, 255]; h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(x => x + x).join(''); const n = parseInt(h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function luminance(h) { const [r, g, b] = hexToRgb(h).map(v => v / 255).map(v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)); return 0.2126 * r + 0.7152 * g + 0.0722 * b; }
function avgHex(a, b) { const A = hexToRgb(a), B = hexToRgb(b); const C = [Math.round((A[0] + B[0]) / 2), Math.round((A[1] + B[1]) / 2), Math.round((A[2] + B[2]) / 2)]; return '#' + C.map(x => x.toString(16).padStart(2, '0')).join(''); }
function shorten(url) { try { return url.replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace('www.', ''); } catch (e) { return url } }

// defaults
function defaultObjective() { return 'A motivated professional looking to contribute skills and grow in a dynamic environment.'; }

// update preview content
function updatePreview() {
    p_name.textContent = (F.name.value || 'Your Name');
    const roleText = (F.job.value ? F.job.value : 'Front End Developer') + (F.location.value ? ' • ' + F.location.value : '');
    p_role.textContent = roleText;
    p_contact.textContent = `${F.email.value || 'email@example.com'} • ${F.phone.value || 'phone'}`;

    p_about.textContent = F.about.value || 'Short about/summary will appear here. Mention strengths & goals.';
    p_objective.textContent = F.objective.value || defaultObjective();
    p_education.textContent = F.education.value || 'Education details will appear here.';
    p_experience.textContent = F.experience.value || 'Short descriptions of roles or projects.';
    p_certifications.textContent = F.certifications.value || 'List certifications here.';
    p_languages.textContent = F.languages.value || 'Languages will appear here.';
    p_preference.textContent = F.preference.value || 'Preferred work style / role.';

    // skills chips
    p_skills.innerHTML = '';
    const rawSkills = (F.skills.value || '').trim();
    if (rawSkills) {
        const arr = rawSkills.split(',').map(s => s.trim()).filter(Boolean).slice(0, 40);
        arr.forEach(x => { const d = document.createElement('div'); d.className = 'chip'; d.textContent = x; p_skills.appendChild(d); });
    } else {
        ['Communication', 'Problem Solving', 'HTML'].forEach(x => { const d = document.createElement('div'); d.className = 'chip'; d.textContent = x; p_skills.appendChild(d); });
    }

    // socials
    const socials = [];
    if (F.linkedin.value) socials.push(`<div>LinkedIn: <a href="${F.linkedin.value}" target="_blank">${shorten(F.linkedin.value)}</a></div>`);
    if (F.github.value) socials.push(`<div>GitHub: <a href="${F.github.value}" target="_blank">${shorten(F.github.value)}</a></div>`);
    if (F.portfolio.value) socials.push(`<div>Portfolio: <a href="${F.portfolio.value}" target="_blank">${shorten(F.portfolio.value)}</a></div>`);
    p_social.innerHTML = socials.join('');

    // photo
    if (photoPreview.dataset.src) {
        p_photo.src = photoPreview.dataset.src; p_photo.style.display = 'block'; photoPreview.style.display = 'inline-block';
    } else {
        p_photo.style.display = 'none'; photoPreview.style.display = 'none';
    }
}

// live wiring
Object.values(F).forEach(el => { if (el) el.addEventListener('input', updatePreview); });

// photo chooser wiring
document.querySelector('label[for="photoInput"]').addEventListener('click', () => photoInput.click());
photoInput.addEventListener('change', e => {
    const f = e.target.files && e.target.files[0];
    if (!f) { delete photoPreview.dataset.src; photoPreview.src = ''; updatePreview(); return; }
    const reader = new FileReader();
    reader.onload = ev => {
        photoPreview.src = ev.target.result;
        photoPreview.dataset.src = ev.target.result;
        photoPreview.style.display = 'inline-block';
        p_photo.src = ev.target.result;
        p_photo.style.display = 'block';
    };
    reader.readAsDataURL(f);
});

// apply background & colors (only within preview)
function applyBackground(c1, c2, isWhite) {
    if (isWhite === '1' || (c1 === '#ffffff' && c2 === '#ffffff')) {
        // White / custom background path - We'll use backgroundPicker if available
        const bg = backgroundPicker.value || '#ffffff';
        paperInner.style.background = bg;
    } else {
        paperInner.style.background = `linear-gradient(135deg, ${c1}, ${c2})`;
    }
}

function updatePreviewColors(c1, c2, isWhite) {
    // determine text color based on average
    let base;
    if (isWhite === '1' || (c1 === '#ffffff' && c2 === '#ffffff')) base = backgroundPicker.value || '#ffffff';
    else base = avgHex(c1, c2);
    const lum = luminance(base);
    // set text color for preview
    paperInner.style.color = (lum > 0.62 ? '#0f172a' : '#f7fbff');
    // chips background
    document.querySelectorAll('#paperInner .chip').forEach(ch => ch.style.background = (lum > 0.62 ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)'));
    // apply accent & secondary pickers only inside preview (css variables limited to preview)
    const accent = accentPicker.value || '#5b6cff';
    const secondary = secondaryPicker.value || '#6b7280';
    // headings
    document.querySelectorAll('#paperInner .section h3').forEach(h => h.style.color = accent);
    // muted text
    document.querySelectorAll('#paperInner .muted').forEach(m => m.style.color = secondary);
    // small role color
    document.querySelectorAll('#paperInner .role').forEach(r => r.style.color = secondary);
}

// gradient selection logic + backgroundPicker interplay
// Each grad element has data-c1, data-c2 and data-is-white (optional, '1' means white/no-gradient)
function selectGradElement(el) {
    gradEls.forEach(x => x.classList.remove('selected'));
    el.classList.add('selected');
    const c1 = el.dataset.c1 || '#ffffff';
    const c2 = el.dataset.c2 || '#ffffff';
    const isWhite = el.dataset.isWhite || '0';
    // if white/no-gradient selected -> enable backgroundPicker, else disable it
    if (isWhite === '1' || (c1 === '#ffffff' && c2 === '#ffffff')) {
        backgroundPicker.disabled = false;
        backgroundPicker.parentElement.style.opacity = '1';
    } else {
        backgroundPicker.disabled = true;
        backgroundPicker.parentElement.style.opacity = '0.6';
    }
    applyBackground(c1, c2, isWhite);
    updatePreviewColors(c1, c2, isWhite);
}

gradEls.forEach(g => g.addEventListener('click', function () { selectGradElement(this); }));

// backgroundPicker: only active when 'white' selected
backgroundPicker.addEventListener('input', () => {
    // find the currently selected grad element
    const sel = document.querySelector('.grad.selected');
    if (!sel) return;
    const isWhite = sel.dataset.isWhite === '1' || (sel.dataset.c1 === '##ffffff' && sel.dataset.c2 === '##ffffff');
    // use backgroundPicker value as paper background when white/no-gradient is selected
    if (sel.dataset.isWhite === '1' || (sel.dataset.c1 === '#ffffff' && sel.dataset.c2 === '#ffffff')) {
        paperInner.style.background = backgroundPicker.value;
        updatePreviewColors(backgroundPicker.value, backgroundPicker.value, '1');
    }
});

// accent & secondary pickers: apply only to preview (no global CSS changes)
accentPicker.addEventListener('input', () => {
    document.querySelectorAll('#paperInner .section h3').forEach(h => h.style.color = accentPicker.value);
});
secondaryPicker.addEventListener('input', () => {
    document.querySelectorAll('#paperInner .muted').forEach(m => m.style.color = secondaryPicker.value);
    document.querySelectorAll('#paperInner .role').forEach(r => r.style.color = secondaryPicker.value);
});

// Create a small initial state: pick the selected grad (or default)
(function initGradState() {
    const sel = document.querySelector('.grad.selected') || gradEls[0];
    if (sel) selectGradElement(sel);
    // if initial is white, ensure backgroundPicker enabled/disabled properly
    const isWhiteInit = sel && (sel.dataset.isWhite === '1' || (sel.dataset.c1 === '#ffffff' && sel.dataset.c2 === '#ffffff'));
    backgroundPicker.disabled = !isWhiteInit;
    if (!isWhiteInit) backgroundPicker.parentElement.style.opacity = '0.6';
})();

// preview update wiring
updatePreview(); // initial

// generate PDF
function generatePDF() {
    updatePreview(); // ensure latest
    // ensure we wait a tiny moment for styles/images to settle
    setTimeout(() => {
        const element = $('paper');
        const opt = {
            margin: 0.35,
            filename: (F.name.value ? F.name.value.replace(/\s+/g, '_') : 'CVCraft') + '_CV.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, allowTaint: true, backgroundColor: null },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(element).save();
    }, 120);
}

$('generate').addEventListener('click', generatePDF);
$('generateTop').addEventListener('click', generatePDF);

// reset function (stable)
function resetAll() {
    $('cvForm').reset();
    // clear photo
    delete photoPreview.dataset.src; photoPreview.src = ''; photoPreview.style.display = 'none'; p_photo.src = ''; p_photo.style.display = 'none';
    // reset pickers to defaults
    accentPicker.value = '#5b6cff'; secondaryPicker.value = '#6b7280'; backgroundPicker.value = '#ffffff';
    // reset preview colors
    document.querySelectorAll('#paperInner .section h3').forEach(h => h.style.color = accentPicker.value);
    document.querySelectorAll('#paperInner .muted').forEach(m => m.style.color = secondaryPicker.value);
    // reset grad selection
    gradEls.forEach(x => x.classList.remove('selected'));
    const def = document.querySelector('.grad[data-c2="#e9e6ff"]') || gradEls[0];
    if (def) selectGradElement(def);
    updatePreview();
}
$('resetBtn').addEventListener('click', resetAll);
$('resetTop').addEventListener('click', resetAll);

// final helpers: photo wiring and live updates
document.querySelector('label[for="photoInput"]').addEventListener('click', () => photoInput.click());
photoInput.addEventListener('change', e => {
    const f = e.target.files && e.target.files[0];
    if (!f) { delete photoPreview.dataset.src; photoPreview.src = ''; updatePreview(); return; }
    const reader = new FileReader();
    reader.onload = ev => {
        photoPreview.src = ev.target.result;
        photoPreview.dataset.src = ev.target.result;
        photoPreview.style.display = 'inline-block';
        p_photo.src = ev.target.result;
        p_photo.style.display = 'block';
    };
    reader.readAsDataURL(f);
});

// ensure preview updates with small debounce (prevent flicker)
let previewTimer = null;
function updatePreviewDebounced() {
    clearTimeout(previewTimer);
    previewTimer = setTimeout(updatePreview, 60);
}
Object.values(F).forEach(el => { if (el) el.addEventListener('input', updatePreviewDebounced); });

// initial preview
(function init() {
    updatePreview();
})();