const {
  gsap,
  gsap: { registerPlugin, set, to, timeline },
  MorphSVGPlugin,
  Draggable } =
window;
registerPlugin(MorphSVGPlugin);

const AUDIO = {
  CLICK: new Audio('https://assets.codepen.io/605876/click.mp3') };

  

const ON = document.querySelector('#on');
const OFF = document.querySelector('#off');
    const signupBtn = document.getElementById('signupBtn');
    const signinBtn = document.getElementById('signinBtn');
    const heading = document.querySelector('h3');
    const submitBtn = document.querySelector('.submit-btn');
    const blob = document.querySelector('.blob');
    const card = document.querySelector('.card');

    card.style.opacity = "0";
    blob.style.opacity = "0";
    card.style.pointerEvents = "none";
    blob.style.pointerEvents = "none";
    blob.classList.remove('blob');
    card.classList.remove('card');


    signinBtn.addEventListener('click', () => {
      signupBtn.classList.remove('active');
      signinBtn.classList.add('active');
      heading.textContent = "Welcome back";
      submitBtn.textContent = "Sign in";
    });

    signupBtn.addEventListener('click', () => {
      signinBtn.classList.remove('active');
      signupBtn.classList.add('active');
      heading.textContent = "Create an account";
      submitBtn.textContent = "Create an account";
    });


// Used to calculate distance of "tug"
let startX;
let startY;

const PROXY = document.createElement('div');

const CORDS = gsap.utils.toArray('.cords path');
const CORD_DURATION = 0.1;
const HIT = document.querySelector('.lamp__hit');
const DUMMY_CORD = document.querySelector('.cord--dummy');
const ENDX = DUMMY_CORD.getAttribute('x2');
const ENDY = DUMMY_CORD.getAttribute('y2');
const RESET = () => {
  set(PROXY, {
    x: ENDX,
    y: ENDY });

};
RESET();

const STATE = {
  ON: false };



gsap.set(['.cords', HIT], {
  x: -10 });


gsap.set('.lamp__eye', {
  rotate: 180,
  transformOrigin: '50% 50%',
  yPercent: 50 });


const CORD_TL = timeline({
  paused: true,
  onStart: () => {
    STATE.ON = !STATE.ON;
    card.style.opacity = STATE.ON ? 1 : 0;
    blob.style.opacity = STATE.ON ? 1 : 0;

    if(STATE.ON) {
      card.style.pointerEvents = 'auto';
      blob.style.pointerEvents = 'auto';
      card.style.display = 'block';
      blob.style.display = 'block';
      blob.classList.add('blob');
      card.classList.add('card');

    } else {
      card.style.pointerEvents = 'none';
      blob.style.pointerEvents = 'none';
      card.classList.remove('card');
      blob.classList.remove('blob');
    }

    set(document.documentElement, { '--on': STATE.ON ? 1 : 0 });
    set(document.documentElement, { '--shade-hue': gsap.utils.random(0, 359) });
    // when lamp is turned off, remove colored top by setting neutral greys; when on, restore stored color
    if (!STATE.ON) {
      document.documentElement.style.setProperty('--t-1', '#e0e0e0');
      document.documentElement.style.setProperty('--t-2', '#a0a0a0');
      document.documentElement.style.setProperty('--t-3', '#6f6f6f');
    } else {
      // restore previously stored color (if any)
      document.documentElement.style.setProperty('--t-1', storedTopHex);
      document.documentElement.style.setProperty('--t-2', storedTopHex + '80');
      document.documentElement.style.setProperty('--t-3', darkenHex(storedTopHex, 0.35));
    }
    set('.lamp__eye', {
      rotate: STATE.ON ? 0 : 180 });

    set([DUMMY_CORD, HIT], { display: 'none' });
    set(CORDS[0], { display: 'block' });
    AUDIO.CLICK.play();
    if (STATE.ON) {
      ON.setAttribute('checked', true);
      OFF.removeAttribute('checked');
    } else {
      ON.removeAttribute('checked');
      OFF.setAttribute('checked', true);
    }
  },
  onComplete: () => {
    set([DUMMY_CORD, HIT], { display: 'block' });
    set(CORDS[0], { display: 'none' });
    RESET();
  } });


for (let i = 1; i < CORDS.length; i++) {
  CORD_TL.add(
  to(CORDS[0], {
    morphSVG: CORDS[i],
    duration: CORD_DURATION,
    repeat: 1,
    yoyo: true }));


}

Draggable.create(PROXY, {
  trigger: HIT,
  type: 'x,y',
  onPress: e => {
    startX = e.x;
    startY = e.y;
  },
  onDrag: function () {
    set(DUMMY_CORD, {
      attr: {
        x2: this.x,
        y2: Math.max(400, this.y) } });


  },
  onRelease: function (e) {
    const DISTX = Math.abs(e.x - startX);
    const DISTY = Math.abs(e.y - startY);
    const TRAVELLED = Math.sqrt(DISTX * DISTX + DISTY * DISTY);
    to(DUMMY_CORD, {
      attr: { x2: ENDX, y2: ENDY },
      duration: CORD_DURATION,
      onComplete: () => {
        if (TRAVELLED > 50) {
          CORD_TL.restart();
        } else {
          RESET();
        }
      } });

  } });


gsap.set('.lamp', { display: 'block' });

// --- Settings / Color picker wiring ---
const settingsBtn = document.querySelector('.form-toggle .settings');
const colorInput = document.querySelector('#colorPicker');

// store the user's chosen top color so we can restore it when lamp turns on
let storedTopHex = colorInput ? colorInput.value || '#8ba6ab' : '#8ba6ab';

settingsBtn.addEventListener('click', () => {
  // open native color picker
  colorInput.focus();
  colorInput.click();
});

// When user picks color, update lamp top CSS variables so gradients and glow change
colorInput.addEventListener('input', (e) => {
  const hex = e.target.value;
  storedTopHex = hex;
  // set three variables used by gradients: --t-1, --t-2, --t-3
  document.documentElement.style.setProperty('--t-1', hex);
  // translucent version for t-2 (add alpha if browser supports 8-digit hex)
  document.documentElement.style.setProperty('--t-2', hex + '80');
  // darker variant for t-3
  const dark = darkenHex(hex, 0.35);
  document.documentElement.style.setProperty('--t-3', dark);
});

// Utility: darken a hex color by fraction (0..1)
function darkenHex(hex, amount) {
  // strip #
  const h = hex.replace('#','');
  const num = parseInt(h,16);
  let r = (num >> 16) & 0xFF;
  let g = (num >> 8) & 0xFF;
  let b = num & 0xFF;
  r = Math.round(r * (1 - amount));
  g = Math.round(g * (1 - amount));
  b = Math.round(b * (1 - amount));
  return '#' + ((1<<24) + (r<<16) + (g<<8) + b).toString(16).slice(1);
}


