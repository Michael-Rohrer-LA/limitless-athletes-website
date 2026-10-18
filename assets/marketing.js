/* Shared consent gate for Meta Pixel. No Meta requests before opt-in. */
(() => {
  'use strict';
  const CONSENT_KEY = 'la.marketing-consent.v1';
  const SENT_PREFIX = 'la.schedule.v1.';
  const MAX_AGE = 180 * 24 * 60 * 60 * 1000;
  const namespace = 'kostenloses-telefongesprach-fur-allfallige-fragen';
  let choice = null, initialized = false, pageViewed = false, revision = 0;
  const sent = new Set();
  function readChoice() {
    try {
      const value = JSON.parse(localStorage.getItem(CONSENT_KEY));
      return value && Date.now() - value.time < MAX_AGE && ['granted', 'denied'].includes(value.choice) ? value.choice : null;
    } catch { return null; }
  }
  function enablePixel() {
    if (choice !== 'granted') return;
    if (!initialized) {
      if (!window.fbq) {
        const fbq = window.fbq = function () {
          fbq.callMethod ? fbq.callMethod.apply(fbq, arguments) : fbq.queue.push(arguments);
        };
        window._fbq = fbq;
        fbq.push = fbq; fbq.loaded = true; fbq.version = '2.0'; fbq.queue = [];
        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://connect.facebook.net/en_US/fbevents.js';
        document.head.appendChild(script);
      }
      window.fbq('consent', 'grant');
      window.fbq('init', '1478118944230580');
      initialized = true;
    } else window.fbq('consent', 'grant');
    if (!pageViewed) {
      window.fbq('track', 'PageView');
      pageViewed = true;
    }
  }
  function removeMetaCookies() {
    for (const name of ['_fbp', '_fbc']) {
      document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
      const parts = location.hostname.split('.');
      for (let i = 0; i < parts.length - 1; i++) {
        document.cookie = `${name}=; Max-Age=0; path=/; domain=.${parts.slice(i).join('.')}; SameSite=Lax`;
      }
    }
  }
  function applyChoice(value) {
    choice = value; revision++;
    if (value === 'granted') enablePixel();
    else {
      if (window.fbq) window.fbq('consent', 'revoke');
      removeMetaCookies();
    }
  }
  async function schedule(event) {
    const detail = event && event.detail;
    const data = detail && detail.data;
    // Ignore views, slot selection, rescheduling, dry runs, pending requests and payment flows.
    if (choice !== 'granted' || !detail || detail.type !== 'bookingSuccessfulV2' ||
        detail.namespace !== namespace || !data || data.status !== 'ACCEPTED' ||
        data.paymentRequired !== false || typeof data.uid !== 'string' || !data.uid.trim()) return;
    const atRevision = revision;
    let id = data.uid;
    try {
      const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data.uid));
      id = Array.from(new Uint8Array(hash), b => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // Without crypto, use in-memory deduplication only; do not persist raw booking IDs.
      id = null;
    }
    const key = SENT_PREFIX + (id || data.uid);
    const sendOnce = () => {
      if (choice !== 'granted' || revision !== atRevision || sent.has(key)) return;
      if (id) {
        try { if (localStorage.getItem(key)) { sent.add(key); return; } } catch {}
      }
      sent.add(key);
      try {
        window.fbq('track', 'Schedule');
        if (id) { try { localStorage.setItem(key, '1'); } catch {} }
      } catch { sent.delete(key); }
    };
    // Web Locks serializes simultaneous callbacks across tabs where supported.
    if (navigator.locks && id) await navigator.locks.request(key, sendOnce);
    else sendOnce();
  }
  window.LAMarketing = Object.freeze({ schedule });
  choice = readChoice();
  if (choice === 'granted') enablePixel();

  // Shadow DOM isolates this small consent control from the existing page styles.
  const host = document.createElement('div');
  host.style.cssText = 'position:fixed;bottom:12px;left:12px;right:12px;z-index:10000;pointer-events:none';
  const root = host.attachShadow({ mode: 'open' });
  root.innerHTML = `<style>
    :host{font:14px/1.5 Arial,sans-serif;color:#f3f6f1}*{box-sizing:border-box}
    [hidden]{display:none!important}section{pointer-events:auto;max-width:480px;padding:18px;background:#141b14;border:1px solid #52614f;border-radius:12px;box-shadow:0 8px 28px #0008;max-height:80vh;overflow:auto}
    h2{font-size:18px;margin:0 0 8px}p{margin:0 0 12px}a{color:#5cff86}
    .actions{display:flex;flex-wrap:wrap;gap:10px}button{pointer-events:auto;cursor:pointer;border:1px solid #71806e;border-radius:6px;padding:10px 14px;font:inherit;background:#141b14;color:#f3f6f1}
    button:focus-visible,a:focus-visible{outline:2px solid #5cff86;outline-offset:3px}
    #settings{font-size:12px;padding:6px 10px}
    </style>
    <section role="region" aria-labelledby="title" hidden>
      <h2 id="title">Marketing-Tracking</h2>
      <p>Mit deiner Erlaubnis nutzen wir den Meta Pixel, um Seitenaufrufe und erfolgreiche Terminbuchungen zu messen und unsere Werbung auszuwerten. Dabei werden Daten wie IP-Adresse und Browserinformationen an Meta übermittelt und Cookies verwendet. Die Website und die Buchung funktionieren auch ohne Zustimmung.</p>
      <p>Deine Auswahl wird für 180 Tage gespeichert. Du kannst sie jederzeit unter „Marketing-Einstellungen“ ändern. <a href="https://www.facebook.com/privacy/policy/" target="_blank" rel="noopener">Datenschutz bei Meta</a></p>
      <div class="actions"><button id="deny" type="button">Ablehnen</button><button id="allow" type="button">Erlauben</button><button id="close" type="button">Schliessen</button></div>
    </section><button id="settings" type="button">Marketing-Einstellungen</button>`;
  document.body.appendChild(host);
  const panel = root.querySelector('section'), settings = root.getElementById('settings');
  function show(open) {
    panel.hidden = !open; settings.hidden = open;
    root.getElementById('close').hidden = choice === null;
  }
  function choose(value) {
    try { localStorage.setItem(CONSENT_KEY, JSON.stringify({ choice: value, time: Date.now() })); } catch {}
    applyChoice(value); show(false); settings.focus();
  }
  root.getElementById('deny').onclick = () => choose('denied');
  root.getElementById('allow').onclick = () => choose('granted');
  root.getElementById('close').onclick = () => { show(false); settings.focus(); };
  settings.onclick = () => { show(true); root.getElementById('deny').focus(); };
  window.addEventListener('storage', e => {
    if (e.key === CONSENT_KEY || e.key === null) { applyChoice(readChoice()); show(choice === null); }
  });
  show(choice === null);
})();
