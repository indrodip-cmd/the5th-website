/* ══════════════════════════════════════════════════════════════════
   The5th — reusable video-testimonial wall (framework-free)

   Drop this on ANY static page to render real client video reviews:
     <div data-t5-videos data-t5-limit="9"></div>
     <script defer src="/testimonials.js"></script>

   Optional attributes:
     data-t5-limit="9"   → cap how many clips show (default: all)
     data-t5-more="/results" → show a "see all" button linking here
   Single source of truth for the clips (mirrors components/VideoWall.tsx).
   ══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var GOLD = '#C9A84C', PLUM_DEEP = '#231029';
  var VIDEOS = [
    { s: 'https://fast.wistia.net/embed/iframe/5yh07cwlui?seo=true&videoFoam=false', w: 560, h: 315 },
    { s: 'https://fast.wistia.net/embed/iframe/tnorqgs7dj?seo=true&videoFoam=false', w: 560, h: 315 },
    { s: 'https://fast.wistia.net/embed/iframe/yz9coq1jwd?seo=true&videoFoam=false', w: 560, h: 315 },
    { s: 'https://fast.wistia.net/embed/iframe/ukn3ruu2nr?seo=true&videoFoam=false', w: 560, h: 315 },
    { s: 'https://fast.wistia.net/embed/iframe/tikovukneu?seo=true&videoFoam=false', w: 560, h: 315 },
    { s: 'https://fast.wistia.net/embed/iframe/oni4jy3cuf?seo=true&videoFoam=false', w: 560, h: 315 },
    { s: 'https://fast.wistia.net/embed/iframe/tcqebjpgyk?seo=true&videoFoam=false', w: 560, h: 315 },
    { s: 'https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F1628699258559837%2F&show_text=false&width=560&t=0', w: 560, h: 314 },
    { s: 'https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F2068186330612350%2F&show_text=false&width=560&t=0', w: 560, h: 314 },
    { s: 'https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fwww.facebook.com%2Fthinkwithindrodip%2Fvideos%2F1041170600725458%2F&show_text=false&width=560&t=0', w: 560, h: 314 },
    { s: 'https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fwww.facebook.com%2Fthinkwithindrodip%2Fvideos%2F1340424980399186%2F&show_text=false&width=560&t=0', w: 560, h: 314 },
    { s: 'https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fwww.facebook.com%2Fthinkwithindrodip%2Fvideos%2F1002983741962578%2F&show_text=false&width=560&t=0', w: 560, h: 314 },
    { s: 'https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fwww.facebook.com%2Fthinkwithindrodip%2Fvideos%2F1000671825545007%2F&show_text=false&width=560&t=0', w: 560, h: 314 },
    { s: 'https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fwww.facebook.com%2Fthinkwithindrodip%2Fvideos%2F2214638572292265%2F&show_text=false&width=560&t=0', w: 560, h: 314 },
    { s: 'https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fwww.facebook.com%2Fthinkwithindrodip%2Fvideos%2F1185750126579075%2F&show_text=false&width=560&t=0', w: 560, h: 314 },
    { s: 'https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Fthinkwithindrodip%2Fvideos%2F1837980330329319%2F&show_text=false&width=269&t=0', w: 269, h: 476 },
    { s: 'https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fwww.facebook.com%2Fthinkwithindrodip%2Fvideos%2F1696526020989444%2F&show_text=false&width=560&t=0', w: 560, h: 314 },
    { s: 'https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fwww.facebook.com%2Fthinkwithindrodip%2Fvideos%2F660960940097323%2F&show_text=false&width=560&t=0', w: 560, h: 314 },
    { s: 'https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fwww.facebook.com%2Fthinkwithindrodip%2Fvideos%2F9605505709570127%2F&show_text=false&width=560&t=0', w: 560, h: 314 },
    { s: 'https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Fthinkwithindrodip%2Fvideos%2F635711518831315%2F&show_text=false&width=267&t=0', w: 267, h: 476 },
    { s: 'https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fwww.facebook.com%2Fthinkwithindrodip%2Fvideos%2F1468194697216348%2F&show_text=false&width=560&t=0', w: 560, h: 314 },
    { s: 'https://www.facebook.com/plugins/video.php?height=316&href=https%3A%2F%2Fwww.facebook.com%2Fthinkwithindrodip%2Fvideos%2F471183985565185%2F&show_text=false&width=560&t=0', w: 560, h: 316 },
    { s: 'https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fwww.facebook.com%2Fthinkwithindrodip%2Fvideos%2F450258107449460%2F&show_text=false&width=560&t=0', w: 560, h: 314 }
  ];

  function ensureStyle() {
    if (document.getElementById('t5-vw-style')) return;
    var st = document.createElement('style'); st.id = 't5-vw-style';
    st.textContent =
      '.t5-vw{column-count:3;column-gap:20px}' +
      '@media(max-width:900px){.t5-vw{column-count:2}}' +
      '@media(max-width:560px){.t5-vw{column-count:1}}' +
      '.t5-vc{break-inside:avoid;margin-bottom:20px;border-radius:16px;overflow:hidden;background:' + PLUM_DEEP + ';box-shadow:0 14px 34px -26px rgba(46,26,53,.7);transition:transform .2s ease,box-shadow .2s ease}' +
      '@media(hover:hover){.t5-vc:hover{transform:translateY(-3px);box-shadow:0 22px 46px -28px rgba(46,26,53,.7)}}' +
      '.t5-vc .t5-ar{position:relative;width:100%}' +
      '.t5-vc iframe{position:absolute;inset:0;width:100%;height:100%;border:0}' +
      '.t5-vmore{display:inline-block;margin-top:26px;background:linear-gradient(180deg,#E4C879,' + GOLD + ' 60%,#B0902F);color:#2E1A35;font:700 15px/1 Inter,system-ui,sans-serif;padding:15px 30px;border-radius:8px;text-decoration:none;box-shadow:0 14px 34px rgba(201,168,76,.3)}';
    document.head.appendChild(st);
  }

  function render(host) {
    var limit = parseInt(host.getAttribute('data-t5-limit') || '0', 10) || VIDEOS.length;
    var more = host.getAttribute('data-t5-more') || '';
    ensureStyle();
    var wall = document.createElement('div'); wall.className = 't5-vw';
    VIDEOS.slice(0, limit).forEach(function (v, i) {
      var fig = document.createElement('figure'); fig.className = 't5-vc'; fig.style.margin = '0 0 20px';
      var ar = document.createElement('div'); ar.className = 't5-ar'; ar.style.aspectRatio = v.w + ' / ' + v.h;
      var f = document.createElement('iframe');
      f.src = v.s; f.title = 'Client review ' + (i + 1); f.loading = 'lazy'; f.allowFullscreen = true;
      f.setAttribute('allow', 'autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share');
      ar.appendChild(f); fig.appendChild(ar); wall.appendChild(fig);
    });
    host.appendChild(wall);
    if (more) {
      var wrap = document.createElement('div'); wrap.style.textAlign = 'center';
      var a = document.createElement('a'); a.className = 't5-vmore'; a.href = more; a.textContent = 'See all client results →';
      wrap.appendChild(a); host.appendChild(wrap);
    }
  }

  function run() {
    var hosts = document.querySelectorAll('[data-t5-videos]');
    for (var i = 0; i < hosts.length; i++) { try { render(hosts[i]); } catch (e) {} }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
