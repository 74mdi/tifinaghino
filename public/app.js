const LATIN_DIGRAPH_MAP = { gh: 'ⵖ', kh: 'ⵅ', sh: 'ⵛ', ch: 'ⵛ' };
const LATIN_MAP = { a:'ⴰ',b:'ⴱ',c:'ⵛ',d:'ⴷ',e:'ⴻ',f:'ⴼ',g:'ⴳ',h:'ⵀ',i:'ⵉ',j:'ⵊ',k:'ⴽ',l:'ⵍ',m:'ⵎ',n:'ⵏ',o:'ⵓ',p:'ⴱ',q:'ⵇ',r:'ⵔ',s:'ⵙ',t:'ⵜ',u:'ⵓ',v:'ⴼ',w:'ⵡ',x:'ⵅ',y:'ⵢ',z:'ⵣ' };
const LATIN_ROMAN = { ...Object.fromEntries(Object.keys(LATIN_MAP).map(letter => [letter, letter])) };
const ARABIC_MAP = { 'ا':'ⴰ','أ':'ⴰ','آ':'ⴰ','ٱ':'ⴰ','إ':'ⵉ','ب':'ⴱ','ت':'ⵜ','ث':'ⵙ','ج':'ⵊ','ح':'ⵃ','خ':'ⵅ','د':'ⴷ','ذ':'ⵣ','ر':'ⵔ','ز':'ⵣ','س':'ⵙ','ش':'ⵛ','ص':'ⵚ','ض':'ⴷ','ط':'ⵟ','ظ':'ⵥ','ع':'ⵄ','غ':'ⵖ','ف':'ⴼ','ق':'ⵇ','ك':'ⴽ','ل':'ⵍ','م':'ⵎ','ن':'ⵏ','ه':'ⵀ','ة':'ⵜ','و':'ⵓ','ي':'ⵢ','ء':'ⴰ','ى':'ⵢ' };
const ARABIC_ROMANIZATION = { 'ا':'a','أ':'a','آ':'a','ٱ':'a','إ':'i','ب':'b','ت':'t','ث':'s','ج':'j','ح':'ḥ','خ':'x','د':'d','ذ':'z','ر':'r','ز':'z','س':'s','ش':'sh','ص':'ṣ','ض':'d','ط':'ṭ','ظ':'ẓ','ع':'ɛ','غ':'gh','ف':'f','ق':'q','ك':'k','ل':'l','م':'m','ن':'n','ه':'h','ة':'t','و':'u','ي':'y','ء':'a','ى':'y' };
const TIFINAGH_TO_LATIN = { 'ⴰ':'a','ⴱ':'b','ⴳ':'g','ⴷ':'d','ⴻ':'e','ⴼ':'f','ⴽ':'k','ⵀ':'h','ⵃ':'ḥ','ⵄ':'ɛ','ⵅ':'kh','ⵇ':'q','ⵉ':'i','ⵊ':'j','ⵍ':'l','ⵎ':'m','ⵏ':'n','ⵓ':'u','ⵔ':'r','ⵕ':'ṛ','ⵖ':'gh','ⵙ':'s','ⵚ':'ṣ','ⵛ':'sh','ⵜ':'t','ⵟ':'ṭ','ⵡ':'w','ⵢ':'y','ⵣ':'z','ⵥ':'ẓ','ⴶ':'ḡ','ⵐ':'ny' };
const TIFINAGH_TO_ARABIC = { 'ⴰ':'ا','ⴱ':'ب','ⴳ':'گ','ⴷ':'د','ⴻ':'e','ⴼ':'ف','ⴽ':'ك','ⵀ':'ه','ⵃ':'ح','ⵄ':'ع','ⵅ':'خ','ⵇ':'ق','ⵉ':'ي','ⵊ':'ج','ⵍ':'ل','ⵎ':'م','ⵏ':'ن','ⵓ':'و','ⵔ':'ر','ⵕ':'ر','ⵖ':'غ','ⵙ':'س','ⵚ':'ص','ⵛ':'ش','ⵜ':'ت','ⵟ':'ط','ⵡ':'و','ⵢ':'ي','ⵣ':'ز','ⵥ':'ظ','ⴶ':'گ','ⵐ':'ني' };
const ALPHABET = [
  ['ⴰ','a','ا'],['ⴱ','b','ب'],['ⴳ','g','گ'],['ⴷ','d','د'],['ⴻ','e',''],['ⴼ','f','ف'],['ⴽ','k','ك'],
  ['ⵀ','h','ه'],['ⵃ','ḥ','ح'],['ⵄ','ɛ','ع'],['ⵅ','x','خ'],['ⵇ','q','ق'],['ⵉ','i','ي'],['ⵊ','j','ج'],
  ['ⵍ','l','ل'],['ⵎ','m','م'],['ⵏ','n','ن'],['ⵓ','u','و'],['ⵔ','r','ر'],['ⵕ','ṛ',''],['ⵖ','gh','غ'],
  ['ⵙ','s','س'],['ⵚ','ṣ','ص'],['ⵛ','sh','ش'],['ⵜ','t','ت'],['ⵟ','ṭ','ط'],['ⵡ','w','و'],['ⵢ','y','ي'],
  ['ⵣ','z','ز'],['ⵥ','ẓ','ظ'],['ⴶ','ḡ',''],['ⵐ','ny',''],['ⵣⴰ','za','']
];
const CHARACTER_STAGGER_MS = 4;
const MAX_STAGGERED_CHARACTERS = 32;

let pendingTimeouts = [];
let reverseLanguage = 'en';
let tifinaghInput = false;
let renderedChars = [];
let renderedUnits = [];
const textarea = document.getElementById('source-input');
const output = document.getElementById('output');
const copyButton = document.getElementById('copy-button');
const copyStatus = document.getElementById('copy-status');
const count = document.getElementById('char-count');

function stripArabicDiacritics(text) { return text.replace(/[\u064B-\u0652\u0640]/g, ''); }

function translate(text) {
  cancelPendingAnimation();
  text = stripArabicDiacritics(text);
  const result = [];
  let i = 0;
  while (i < text.length) {
    const code = text.codePointAt(i);
    const ch = String.fromCodePoint(code);
    if (/\p{Script=Arabic}/u.test(ch)) {
      result.push({ source: ch, tifinagh: ARABIC_MAP[ch] ?? ch, roman: ARABIC_ROMANIZATION[ch] ?? ch });
      i += ch.length;
      continue;
    }
    const two = text.slice(i, i + 2).toLowerCase();
    if (LATIN_DIGRAPH_MAP[two]) {
      result.push({ source: text.slice(i, i + 2), tifinagh: LATIN_DIGRAPH_MAP[two], roman: two });
      i += 2;
    } else {
      const one = text[i].toLowerCase();
      result.push({ source: text[i], tifinagh: LATIN_MAP[one] ?? text[i], roman: LATIN_ROMAN[one] ?? one });
      i += ch.length;
    }
  }
  return result;
}

function reverseTranslate(text, lang) {
  return Array.from(text).map(ch => ({
    source: ch,
    tifinagh: (lang === 'ar' ? TIFINAGH_TO_ARABIC[ch] : TIFINAGH_TO_LATIN[ch]) ?? ch,
    roman: ''
  }));
}

function cancelPendingAnimation() { pendingTimeouts.forEach(clearTimeout); pendingTimeouts = []; }

function animateOutput(chars) {
  cancelPendingAnimation();
  let prefixLength = 0;
  while (prefixLength < chars.length && prefixLength < renderedChars.length) {
    const previous = renderedChars[prefixLength];
    const next = chars[prefixLength];
    if (previous.source !== next.source || previous.tifinagh !== next.tifinagh || previous.roman !== next.roman) break;
    prefixLength += 1;
  }
  for (let index = renderedUnits.length - 1; index >= prefixLength; index -= 1) renderedUnits[index].remove();
  renderedChars = renderedChars.slice(0, prefixLength).concat(chars.slice(prefixLength));
  renderedUnits = renderedUnits.slice(0, prefixLength);
  copyButton.hidden = chars.length === 0;
  copyStatus.textContent = '';
  chars.slice(prefixLength).forEach(char => {
    const unit = document.createElement('div');
    unit.className = `char-unit${char.source === ' ' ? ' char-space' : ''}${char.tifinagh === char.source && char.source !== ' ' ? ' char-unknown' : ''}${/^\d$/u.test(char.source) ? ' char-number' : ''}${/[\p{P}\p{S}]/u.test(char.source) ? ' char-symbol' : ''}`;
    unit.setAttribute('aria-label', `${char.roman}: ${char.tifinagh}`);
    const tifinagh = document.createElement('span');
    tifinagh.className = 'char-tifinagh';
    tifinagh.textContent = char.source === ' ' ? '·' : char.tifinagh;
    const source = document.createElement('span');
    source.className = 'char-source';
    source.textContent = char.source;
    const roman = document.createElement('span');
    roman.className = 'char-roman';
    roman.textContent = char.roman;
    unit.append(tifinagh, source, roman);
    output.append(unit);
    renderedUnits.push(unit);
  });
  let staggeredCount = 0;
  renderedUnits.forEach(unit => {
    if (unit.classList.contains('visible')) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || staggeredCount >= MAX_STAGGERED_CHARACTERS) {
      unit.classList.add('visible');
      return;
    }
    const delay = staggeredCount * CHARACTER_STAGGER_MS;
    staggeredCount += 1;
    pendingTimeouts.push(setTimeout(() => unit.classList.add('visible'), delay));
  });
}

function triggerTranslation() {
  const value = textarea.value;
  tifinaghInput = /[\u2D30-\u2D7F]/u.test(value);
  const hasArabic = /\p{Script=Arabic}/u.test(value);
  textarea.dir = hasArabic && !tifinaghInput ? 'rtl' : 'ltr';
  textarea.lang = hasArabic && !tifinaghInput ? 'ar' : 'en';
  textarea.style.fontFamily = hasArabic && !tifinaghInput ? 'var(--font-arabic)' : 'var(--font-body)';
  textarea.setAttribute('aria-label', tifinaghInput ? 'Enter Tifinagh text to transliterate' : hasArabic ? 'Enter Arabic text' : 'Enter English text');
  const reverseControls = document.getElementById('reverse-controls');
  const outputPanel = document.querySelector('.output-panel');
  const outputLabel = document.getElementById('output-label');
  const disclaimer = document.querySelector('.disclaimer');
  reverseControls.hidden = !tifinaghInput;
  outputPanel.classList.toggle('reverse-mode', tifinaghInput);
  outputPanel.dir = 'ltr';
  outputPanel.lang = 'en';
  output.dir = tifinaghInput && reverseLanguage === 'ar' ? 'rtl' : 'ltr';
  output.lang = tifinaghInput ? reverseLanguage : 'zgh';
  outputLabel.textContent = tifinaghInput ? `REVERSE OUTPUT — ${reverseLanguage === 'ar' ? 'ARABIC' : 'ENGLISH'}` : 'ⵜⵉⴼⵉⵏⴰⵖ — TIFINAGH OUTPUT';
  disclaimer.hidden = tifinaghInput;
  animateOutput(tifinaghInput ? reverseTranslate(value, reverseLanguage) : translate(value));
  updateCounter();
}

function updateCounter() { const length = textarea.value.length; count.textContent = `${length} ${length === 1 ? 'character' : 'characters'}`; }

function copyOutput() {
  const text = Array.from(output.querySelectorAll('.char-tifinagh')).map(item => item.textContent === '·' ? ' ' : item.textContent).join('');
  if (!text) return;
  const fallback = () => { const temp = document.createElement('textarea'); temp.value = text; temp.style.position = 'fixed'; temp.style.opacity = '0'; document.body.append(temp); temp.select(); document.execCommand('copy'); temp.remove(); };
  try { if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).catch(fallback); else fallback(); copyStatus.textContent = 'Copied'; } catch { fallback(); copyStatus.textContent = 'Copied'; }
}

function buildAlphabet() {
  const grid = document.getElementById('alphabet-grid');
  if (!grid) return;
  ALPHABET.forEach(([character, roman, arabic]) => {
    const card = document.createElement('button');
    card.className = 'letter-card'; card.type = 'button'; card.dataset.latin = roman;
    card.setAttribute('aria-label', `Tifinagh letter ${roman} — ${character}`);
    const tifinagh = document.createElement('span');
    tifinagh.className = 'letter-tifinagh';
    tifinagh.lang = 'zgh';
    tifinagh.textContent = character;
    const romanization = document.createElement('span');
    romanization.className = 'letter-roman';
    romanization.textContent = roman;
    const arabicLabel = document.createElement('span');
    arabicLabel.className = 'letter-arabic';
    arabicLabel.lang = 'ar';
    arabicLabel.textContent = arabic;
    card.append(tifinagh, romanization, arabicLabel);
    card.addEventListener('click', () => { window.location.href = `/?text=${encodeURIComponent(roman)}`; });
    grid.append(card);
  });
}

const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('revealed'); revealObserver.unobserve(entry.target); } }), { threshold: .12, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('[data-reveal]').forEach(element => revealObserver.observe(element));

if (textarea) {
  textarea.addEventListener('input', triggerTranslation);
  const initialText = new URLSearchParams(window.location.search).get('text');
  if (initialText) { textarea.value = initialText; triggerTranslation(); }
}
document.getElementById('translate-button')?.addEventListener('click', triggerTranslation);
copyButton?.addEventListener('click', copyOutput);
window.addEventListener('scroll', () => document.querySelector('.site-header').classList.toggle('nav-scrolled', window.scrollY > 60), { passive: true });

const menuToggle = document.querySelector('.menu-toggle');
const siteMenu = document.getElementById('site-menu');
function closeMenu() { if (!menuToggle || !siteMenu) return; menuToggle.classList.remove('is-open'); menuToggle.setAttribute('aria-expanded', 'false'); menuToggle.setAttribute('aria-label', 'Open navigation menu'); siteMenu.classList.remove('is-open'); }
menuToggle?.addEventListener('click', () => { const open = !siteMenu.classList.contains('is-open'); menuToggle.classList.toggle('is-open', open); menuToggle.setAttribute('aria-expanded', open); menuToggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu'); siteMenu.classList.toggle('is-open', open); if (open) siteMenu.querySelector('a').focus(); });
siteMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape' && siteMenu?.classList.contains('is-open')) { closeMenu(); menuToggle.focus(); } });
const currentPage = location.pathname.endsWith('alphabet.html') ? 'alphabet' : location.pathname.endsWith('history.html') ? 'history' : location.pathname.endsWith('about.html') ? 'about' : 'home';
document.querySelector(`[data-page="${currentPage}"]`)?.setAttribute('aria-current', 'page');

const themeToggle = document.getElementById('theme-toggle');
let savedTheme = 'dark';
try { savedTheme = localStorage.getItem('tifinaghino-theme') || 'dark'; } catch { savedTheme = 'dark'; }
document.documentElement.dataset.theme = savedTheme;
function updateThemeButton() {
  if (!themeToggle) return;
  const isLight = document.documentElement.dataset.theme === 'light';
  themeToggle.querySelector('.theme-label').textContent = isLight ? 'Light' : 'Dark';
  themeToggle.setAttribute('aria-label', `Current theme: ${isLight ? 'light' : 'dark'}. Toggle theme`);
}
themeToggle?.addEventListener('click', () => {
  const nextTheme = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
  document.documentElement.dataset.theme = nextTheme;
  try { localStorage.setItem('tifinaghino-theme', nextTheme); } catch {}
  updateThemeButton();
});
updateThemeButton();

buildAlphabet();

document.querySelectorAll('[data-reverse-lang]').forEach(button => button.addEventListener('click', () => {
  reverseLanguage = button.dataset.reverseLang;
  document.querySelectorAll('[data-reverse-lang]').forEach(option => {
    const active = option === button;
    option.classList.toggle('active', active);
    option.setAttribute('aria-pressed', active);
  });
  if (tifinaghInput) triggerTranslation();
}));
