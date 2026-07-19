/* ══════════════════════════════════════════════════════════════════
   The5th — "The Journey" scroll story engine (framework-free)

   Drives the #t5-story scene: as the visitor scrolls through the tall
   section, a procedurally-animated SVG face shifts GAZE and EXPRESSION along
   an emotional arc — pensive/looking away while stuck → relieved/looking up
   toward freedom after The5th. The world warms from cool grey to gold and
   aspiration words drift in.

   Keyframes map scroll progress p∈[0,1] to gaze (gx,gy ∈ [-1,1]) + emotion
   (e ∈ [-1,1]). Everything is numeric, so the SVG can later be swapped for a
   sequence of AI-rendered 3D face frames driven by the same p.
   ══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var section = document.getElementById('t5-story');
  if (!section) return;
  var head = document.getElementById('tsx-head');
  var pupilL = document.getElementById('tsx-pupilL');
  var pupilR = document.getElementById('tsx-pupilR');
  var eyeL = document.getElementById('tsx-eyeLs');
  var eyeR = document.getElementById('tsx-eyeRs');
  var browL = document.getElementById('tsx-browL');
  var browR = document.getElementById('tsx-browR');
  var mouth = document.getElementById('tsx-mouth');
  var bg = document.getElementById('tsx-bg');
  var glow = document.getElementById('tsx-glow');
  var spark = document.getElementById('tsx-spark');
  var blushL = document.getElementById('tsx-blushL');
  var blushR = document.getElementById('tsx-blushR');
  var cta = document.getElementById('tsx-cta');
  var hint = document.getElementById('tsx-hint');
  var prog = document.getElementById('tsx-progfill');
  var beats = [].slice.call(section.querySelectorAll('.tsx-beat'));
  var words = [].slice.call(section.querySelectorAll('.tsx-word'));

  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function smooth(t) { return t * t * (3 - 2 * t); }

  // gaze + emotion keyframes across the scroll
  var KF = [
    { p: 0.00, gx: -0.55, gy: -0.62, e: -0.95 }, // up-left, pensive
    { p: 0.29, gx: -0.85, gy: 0.10, e: -0.85 },  // left, anxious
    { p: 0.50, gx: 0.00, gy: 0.00, e: 0.05 },    // center, hopeful
    { p: 0.72, gx: 0.72, gy: 0.10, e: 0.72 },    // right, relieved
    { p: 1.00, gx: 0.50, gy: -0.58, e: 1.00 }    // up-right, radiant
  ];
  function sample(p) {
    var i = 0;
    for (; i < KF.length - 1; i++) { if (p <= KF[i + 1].p) break; }
    var a = KF[Math.min(i, KF.length - 2)], b = KF[Math.min(i + 1, KF.length - 1)];
    var t = b.p === a.p ? 0 : clamp((p - a.p) / (b.p - a.p), 0, 1);
    t = smooth(t);
    return { gx: lerp(a.gx, b.gx, t), gy: lerp(a.gy, b.gy, t), e: lerp(a.e, b.e, t) };
  }

  // brow path for one eye given emotion e (t: 0 worried → 1 happy)
  function brow(outerX, midX, innerX, e) {
    var t = (e + 1) / 2;
    var oY = lerp(176, 164, t);   // outer end
    var iY = lerp(155, 170, t);   // inner end (rises when worried)
    var mY = lerp(160, 162, t);
    return 'M ' + outerX + ' ' + oY + ' Q ' + midX + ' ' + mY + ' ' + innerX + ' ' + iY;
  }

  function rgb(a, b, t) { return 'rgb(' + Math.round(lerp(a[0], b[0], t)) + ',' + Math.round(lerp(a[1], b[1], t)) + ',' + Math.round(lerp(a[2], b[2], t)) + ')'; }
  var COOL_T = [234, 231, 238], COOL_B = [210, 205, 216];
  var WARM_T = [252, 246, 232], WARM_B = [241, 216, 152];

  function render(p) {
    var s = sample(p);

    // pupils follow the gaze
    var dx = s.gx * 13, dy = s.gy * 7;
    pupilL.setAttribute('transform', 'translate(' + dx + ' ' + dy + ')');
    pupilR.setAttribute('transform', 'translate(' + dx + ' ' + dy + ')');

    // eyes narrow into a smile / widen when tense
    var ry = s.e > 0 ? (17 - s.e * 7) : (17 - s.e * 1.7);
    eyeL.setAttribute('ry', ry.toFixed(1));
    eyeR.setAttribute('ry', ry.toFixed(1));

    // brows + mouth carry the emotion
    browL.setAttribute('d', brow(148, 175, 202, s.e));
    browR.setAttribute('d', brow(292, 265, 238, s.e));
    var endY = 286 - s.e * 6, cy = 286 + s.e * 34;
    mouth.setAttribute('d', 'M 182 ' + endY.toFixed(1) + ' Q 220 ' + cy.toFixed(1) + ' 258 ' + endY.toFixed(1));

    // mascot warmth: aura glow, cheek blush, and the summit sparkle
    var hap = clamp(s.e, 0, 1);
    if (glow) glow.style.opacity = (clamp((s.e + 0.15) / 1.15, 0, 1) * 0.9).toFixed(3);
    if (blushL) { blushL.setAttribute('opacity', hap.toFixed(3)); blushR.setAttribute('opacity', hap.toFixed(3)); }
    if (spark) spark.setAttribute('opacity', clamp((s.e - 0.35) / 0.65, 0, 1).toFixed(3));

    // head drifts left→right and tilts toward the gaze
    var tx = lerp(-26, 26, p), ang = s.gx * 5;
    head.setAttribute('transform', 'translate(' + tx.toFixed(1) + ' 0) rotate(' + ang.toFixed(2) + ' 220 212)');

    // world warms from cool to gold
    var w = smooth(clamp((p - 0.32) / 0.55, 0, 1));
    bg.style.background = 'linear-gradient(180deg,' + rgb(COOL_T, WARM_T, w) + ',' + rgb(COOL_B, WARM_B, w) + ')';

    // narrative beats crossfade
    for (var i = 0; i < beats.length; i++) {
      var c = parseFloat(beats[i].getAttribute('data-c'));
      beats[i].style.opacity = clamp(1 - Math.abs(p - c) / 0.12, 0, 1);
    }
    // aspiration words drift in
    for (var j = 0; j < words.length; j++) {
      var p0 = parseFloat(words[j].getAttribute('data-p'));
      var o = clamp((p - p0) / 0.07, 0, 1);
      words[j].style.opacity = (o * 0.92).toFixed(3);
      words[j].style.transform = 'translateY(' + ((1 - o) * 22).toFixed(1) + 'px)';
    }
    // CTA at the summit, hint fades quickly
    cta.style.opacity = clamp((p - 0.9) / 0.06, 0, 1);
    cta.style.pointerEvents = p > 0.92 ? 'auto' : 'none';
    if (hint) hint.style.opacity = clamp(1 - p * 12, 0, 1).toFixed(2);
    if (prog) prog.style.width = (p * 100).toFixed(2) + '%';
  }

  var ticking = false;
  function calc() {
    ticking = false;
    var r = section.getBoundingClientRect();
    var total = section.offsetHeight - window.innerHeight;
    var p = total > 0 ? clamp(-r.top / total, 0, 1) : 0;
    render(p);
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(calc); } }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  calc();
})();
