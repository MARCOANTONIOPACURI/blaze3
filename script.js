/* =========================================================
   CONFIGURACIÓN: edita aquí
   ========================================================= */
const CONFIG = {
  // Textos
  inicioTitulo:     "BLAZE",
  inicioSubtitulo:  "Fuego que inspira, grandeza que domina",
  equipoTitulo:     "BLAZE",
  equipoSubtitulo:  "Somos un equipo",
  finalTitulo:      "Gracias",
  finalSubtitulo:   "por tantos recuerdos",

  // Archivos
  carpetaFotos: "BLAZE/",   // carpeta con las fotos, el video, la música y el logo (con "/" al final). "" si están junto al index.html
  logo: "BLAZE/icon.png",                 // ruta exacta del logo (ej. "BLAZE/logo.png"). Vacío = se busca solo (logo.png, blaze.png, ...)

  // Música instrumental: suena desde el inicio y en bucle hasta el final
  musica: "",               // ruta exacta del audio (ej. "BLAZE/instrumental.mp3"). Vacío = se busca solo (instrumental, musica, cancion...)
  volumenMusica: 0.5,       // volumen normal, de 0 (silencio) a 1 (máximo)
  volumenMusicaVideo: 0.12, // volumen mientras se reproduce el video (baja pero no desaparece)

  // Tiempos
  esperaTrasVideo: 0,       // segundos de espera al terminar el video antes de pasar solo a las fotos del equipo (0 = de frente)
  segundosPorFotoEquipo: 3, // fotos de la promoción BLAZE: cada una dura 3 segundos
  segundosPorFoto: 2,       // cada foto se muestra 2 segundos antes de desvanecerse a la siguiente
  velocidadEscritura: 55    // milisegundos por letra (más bajo = más rápido)
};

// Extensiones que se probarán automáticamente
const EXT_FOTO  = ["jpg", "JPG", "jpeg", "JPEG", "png", "PNG", "webp"];
const EXT_VIDEO = ["mp4", "MP4", "webm", "mov", "MOV", "m4v"];
const EXT_AUDIO = ["mp3", "MP3", "wav", "WAV", "ogg", "m4a", "aac"];

/* ---------------------------------------------------------
   FOTOS DEL EQUIPO: BLAZE1, BLAZE2, BLAZE3 ... (mayúsculas o minúsculas).
   Se detectan solas: pueden ser 5, 10 o las que haya. Pasan una vez
   con desvanecimiento y al terminar se pasa solo a los estudiantes.
   --------------------------------------------------------- */
const CLAVE_EQUIPO = "BLAZE";
const MAX_FOTOS_EQUIPO = 40;

/* ---------------------------------------------------------
   LISTA DE ESTUDIANTES
   Las fotos se buscan con el nombre en MAYÚSCULAS + número:
     Yuri       -> BLAZE/YURI1.jpg  y  BLAZE/YURI2.jpg
     Liam Ramos -> BLAZE/LIAM RAMOS1.jpg (también prueba LIAMRAMOS1 y LIAM_RAMOS1)
   --------------------------------------------------------- */
const LISTA = [
  "Liam Ramos", "Yuri", "Ricardo", "Romina", "Anghely", "Jhilmer", "Andrea",
  "Maximiliano", "Imanol", "Valentino", "Santiago", "Liam Valeriano", "Lia",
  "Zamira", "Samanta", "Xavi", "Catalina", "Cristel", "Ilay"
];

/* ---------------------------------------------------------
   DATOS PERSONALES (opcional). La clave es el nombre tal cual
   está en LISTA. Todo lo que no pongas usa los valores por defecto.
     nombre : nombre completo que se escribe en pantalla
     datos  : lista de [etiqueta, valor] (gustos y demás cosas)
     firma  : ruta a una imagen PNG de su firma (ej. "BLAZE/FIRMA YURI.png")
              o un texto; si no pones nada se dibuja su nombre
     pies   : [texto foto 1, texto foto 2] bajo cada foto (opcional)
   --------------------------------------------------------- */
const PERSONALIZADO = {
  "Yuri": {
    nombre: "Yuri ... (nombre completo)",
    datos: [
      ["Apodo:", "..."],
      ["Cumpleaños:", "..."],
      ["Le gusta:", "..."],
      ["Sueña con:", "..."],
      ["Frase:", "«...»"]
    ],
    firma: "Yuri",
    pies: ["", ""]
  }
  // , "Ricardo": { ... }
};

const DATOS_POR_DEFECTO = [
  ["Le gusta:", "por completar"],
  ["Sueña con:", "por completar"],
  ["Frase:", "por completar"]
];

const ESTUDIANTES = LISTA.map((clave) => {
  const p = PERSONALIZADO[clave] || {};
  return {
    clave,
    nombre: p.nombre || clave,
    datos:  p.datos  || DATOS_POR_DEFECTO,
    firma:  p.firma  || clave,
    pies:   p.pies   || ["", ""]
  };
});

/* =========================================================
   MOTOR DE LA PRESENTACIÓN (no hace falta tocar esto)
   ========================================================= */
const $ = (s, r = document) => r.querySelector(s);
const slidesBox = $("#slides");
const hint = $("#hint");
const dotsBox = $("#dots");
const flashEl = $("#flash");

const PLACEHOLDER = "data:image/svg+xml;utf8," + encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='500'>
     <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
       <stop offset='0' stop-color='#8f1d0e'/><stop offset='1' stop-color='#2a0f08'/></linearGradient></defs>
     <rect width='100%' height='100%' fill='url(#g)'/>
     <circle cx='200' cy='190' r='62' fill='#ffc21f' opacity='.35'/>
     <path d='M70 430c10-90 70-130 130-130s120 40 130 130z' fill='#ffc21f' opacity='.35'/>
     <text x='200' y='475' text-anchor='middle' font-family='serif' font-size='22' fill='#ffc21f' opacity='.8'>sin foto</text>
   </svg>`
);

/* ---------- búsqueda automática de archivos ---------- */
function carpetas() {
  return [...new Set([CONFIG.carpetaFotos, "BLAZE/", "Blaze/", ""])];
}

function probarImagen(url) {
  return new Promise((res) => {
    const i = new Image();
    i.onload = () => res(url);
    i.onerror = () => res(null);
    i.src = url;
  });
}

function probarMedia(tag) {
  return (url) => new Promise((res) => {
    const m = document.createElement(tag);
    let hecho = false;
    const fin = (r) => { if (hecho) return; hecho = true; m.removeAttribute("src"); m.load(); res(r); };
    m.preload = "metadata";
    m.onloadedmetadata = () => fin(url);
    m.onerror = () => fin(null);
    setTimeout(() => fin(null), 4000);
    m.src = url;
  });
}
const probarVideo = probarMedia("video");
const probarAudio = probarMedia("audio");

// Prueba candidatos por tandas en paralelo y devuelve el primero (en orden de prioridad) que exista
async function primeroQueExista(candidatos, probar, tanda = 14) {
  for (let i = 0; i < candidatos.length; i += tanda) {
    const r = await Promise.all(candidatos.slice(i, i + tanda).map(probar));
    const ok = r.find(Boolean);
    if (ok) return ok;
  }
  return null;
}

const ruta = (carpeta, base, ext) => carpeta + encodeURIComponent(base) + "." + ext;

const fotoCache = new Map();
function buscarFoto(clave, n) {
  const key = clave + "#" + n;
  if (fotoCache.has(key)) return fotoCache.get(key);

  const sinEsp = (s) => s.replace(/\s+/g, "");
  const guion  = (s) => s.replace(/\s+/g, "_");
  const nombres = [...new Set([clave.toUpperCase(), clave, clave.toLowerCase()])];
  const bases = [];
  for (const nom of nombres)
    for (const b of [nom + n, sinEsp(nom) + n, guion(nom) + n, nom + " " + n])
      if (!bases.includes(b)) bases.push(b);

  const cand = [];
  for (const c of carpetas()) for (const b of bases) for (const e of EXT_FOTO) cand.push(ruta(c, b, e));
  const p = primeroQueExista(cand, probarImagen);
  fotoCache.set(key, p);
  return p;
}

// Detecta cuántas fotos del equipo hay (BLAZE1, BLAZE2, ...) y devuelve sus rutas en orden
let equipoPromesa = null;
function buscarFotosEquipo() {
  if (equipoPromesa) return equipoPromesa;
  equipoPromesa = (async () => {
    const urls = [];
    let fallos = 0;
    for (let n = 1; n <= MAX_FOTOS_EQUIPO && fallos < 2; n++) {
      const u = await buscarFoto(CLAVE_EQUIPO, n);
      if (u) { urls.push(u); fallos = 0; } else fallos++;
    }
    return urls;
  })();
  return equipoPromesa;
}

let videoPromesa = null;
function buscarVideo() {
  if (videoPromesa) return videoPromesa;
  videoPromesa = (async () => {
    const bases = ["video 1", "video1", "VIDEO 1", "VIDEO1", "Video 1", "Video1", "video_1", "VIDEO_1"];
    for (const c of carpetas()) {
      for (const b of bases) {
        const r = await primeroQueExista(EXT_VIDEO.map((e) => ruta(c, b, e)), probarVideo, 6);
        if (r) return r;
      }
    }
    return null;
  })();
  return videoPromesa;
}

let logoPromesa = null;
function buscarLogo() {
  if (logoPromesa) return logoPromesa;
  if (CONFIG.logo) { logoPromesa = probarImagen(CONFIG.logo); return logoPromesa; }
  const bases = ["logo", "LOGO", "Logo", "blaze", "BLAZE", "Blaze", "logo blaze", "LOGO BLAZE", "logo_blaze", "leon", "LEON"];
  const exts = ["png", "PNG", "webp", "jpg", "JPG", "jpeg", "svg"];
  const cand = [];
  for (const c of carpetas()) for (const b of bases) for (const e of exts) cand.push(ruta(c, b, e));
  logoPromesa = primeroQueExista(cand, probarImagen, 20);
  return logoPromesa;
}

async function mostrarLogo(img) {
  const url = await buscarLogo();
  if (url) { img.src = url; img.hidden = false; }
}

let musicaPromesa = null;
function buscarMusica() {
  if (musicaPromesa) return musicaPromesa;
  musicaPromesa = (async () => {
    if (CONFIG.musica) return await probarAudio(CONFIG.musica);
    const bases = ["instrumental", "INSTRUMENTAL", "Instrumental", "musica", "MUSICA", "Musica",
                   "música", "Música", "music", "MUSIC", "cancion", "canción", "audio", "AUDIO", "fondo"];
    for (const c of carpetas()) {
      for (const b of bases) {
        const r = await primeroQueExista(EXT_AUDIO.map((e) => ruta(c, b, e)), probarAudio, 7);
        if (r) return r;
      }
    }
    return null;
  })();
  return musicaPromesa;
}

/* ---------- música instrumental ---------- */
let musica = null, musicaSonando = false, musicaPendiente = false;
let silenciada = false, videoReproduciendo = false, fadeTimer = null;

// Mientras suena el video la música baja (sin desaparecer); el resto del tiempo va a volumen normal
const volumenObjetivo = () => (videoReproduciendo ? CONFIG.volumenMusicaVideo : CONFIG.volumenMusica);

function fadeMusica(a, hasta, ms, alFinal) {
  clearInterval(fadeTimer);
  const desde = a.volume, pasos = 20, dt = ms / pasos;
  let n = 0;
  fadeTimer = setInterval(() => {
    n++;
    a.volume = Math.min(1, Math.max(0, desde + (hasta - desde) * n / pasos));
    if (n >= pasos) { clearInterval(fadeTimer); if (alFinal) alFinal(); }
  }, dt);
}

async function prepararMusica() {
  const url = await buscarMusica();
  if (!url) return false;
  if (!musica) {
    musica = new Audio(url);
    musica.loop = true;               // al terminar vuelve a empezar hasta el final de la presentación
    musica.preload = "auto";
    musica.volume = 0;
    musica.muted = silenciada;
  }
  return true;
}

async function iniciarMusica() {
  if (musicaSonando) return true;
  if (!(await prepararMusica())) return false;
  try { await musica.play(); }
  catch (_) { return false; }         // el navegador bloquea el sonido hasta que haya un clic
  musicaSonando = true;
  musicaPendiente = false;
  fadeMusica(musica, volumenObjetivo(), 2500);
  return true;
}

function ajustarVolumen(ms = 1500) {
  if (musica && musicaSonando) fadeMusica(musica, volumenObjetivo(), ms);
}

function alternarSilencio() {
  silenciada = !silenciada;
  if (musica) musica.muted = silenciada;
  $("#mute").classList.toggle("off", silenciada);
}

/* ---------- utilidades de animación ---------- */
function makeHelpers(ctl) {
  const sleep = (ms) => new Promise((res) => {
    const t0 = performance.now();
    (function tick() {
      if (ctl.dead || ctl.skip || performance.now() - t0 >= ms) return res();
      requestAnimationFrame(tick);
    })();
  });

  // Efecto de escritura: el texto restante queda invisible para que nada se mueva
  async function type(el, text, speed = CONFIG.velocidadEscritura) {
    el.classList.add("tw", "typing");
    el.innerHTML = '<span class="v"></span><span class="h"></span>';
    const v = el.firstChild, h = el.lastChild;
    h.textContent = text;
    for (let i = 1; i <= text.length; i++) {
      if (ctl.dead) return;
      if (ctl.skip) { v.textContent = text; h.textContent = ""; break; }
      v.textContent = text.slice(0, i);
      h.textContent = text.slice(i);
      const ch = text[i - 1];
      const pausa = ",.;:".includes(ch) ? speed * 4 : ch === " " ? speed * .6 : speed * (.6 + Math.random() * .8);
      await sleep(pausa);
    }
    el.classList.remove("typing");
  }

  return { sleep, type };
}

function crearFirma(firma) {
  const wrap = document.createElement("div");
  wrap.className = "firma-wrap";
  const tag = document.createElement("span");
  tag.className = "tag";
  tag.textContent = "firma:";
  const f = document.createElement("div");
  f.className = "firma";

  const comoTexto = (t) => {
    const s = document.createElement("span");
    s.className = "firma-texto";
    s.textContent = t;
    f.appendChild(s);
  };

  if (/\.(png|jpe?g|webp|svg|gif)$/i.test(firma)) {
    const img = document.createElement("img");
    img.alt = "Firma";
    img.src = firma;
    img.onerror = () => { img.remove(); comoTexto("firma"); };
    f.appendChild(img);
  } else {
    comoTexto(firma);
  }
  wrap.append(tag, f);
  return { wrap, firmaEl: f };
}

/* ---------- polaroid con carrusel (sirve para 2 fotos, 5, 10...) ---------- */
function crearPolaroid(n, pies = []) {
  const photos = document.createElement("div");
  photos.className = "photos";
  photos.innerHTML = `
    <div class="polaroid ghost"></div>
    <figure class="polaroid main">
      <span class="tape"></span>
      <div class="frame"></div>
      <figcaption></figcaption>
    </figure>
    <div class="pdots"></div>`;
  const frame = $(".frame", photos), cap = $("figcaption", photos), pd = $(".pdots", photos);
  const imgs = [], caps = [], dots = [];

  const agregar = (k) => {
    for (let j = 0; j < k; j++) {
      const i = imgs.length;
      const im = document.createElement("img");
      im.className = "ph";
      im.alt = "";
      frame.appendChild(im); imgs.push(im);

      const c = document.createElement("span");
      c.className = "cap";
      c.textContent = pies[i] || "";
      cap.appendChild(c); caps.push(c);

      const d = document.createElement("i");
      pd.appendChild(d); dots.push(d);
    }
  };
  agregar(n);
  return { photos, imgs, caps, dots, agregar };
}

// Pone las fotos y arranca el carrusel automático con desvanecimiento.
//  opts.unaVuelta : pasa por todas las fotos una sola vez y luego llama a opts.alTerminar()
//  (sin unaVuelta el carrusel se repite hasta que se haga clic)
function arrancarFotos(ctl, P, urls, altBase, opts = {}) {
  let validos = urls.map((u, i) => (u ? i : -1)).filter((i) => i >= 0);
  if (!validos.length) { P.imgs[0].src = PLACEHOLDER; validos = [0]; }

  P.imgs.forEach((im, i) => {
    im.alt = `${altBase} (foto ${i + 1})`;
    if (urls[i]) im.src = urls[i];
    im.classList.toggle("on", i === validos[0]);
  });
  P.caps.forEach((c, i) => c.classList.toggle("on", i === validos[0]));
  P.dots.forEach((d, i) => {
    d.style.display = validos.includes(i) ? "" : "none";
    d.classList.toggle("on", i === validos[0]);
  });

  P.photos.classList.add("in");              // caen las polaroids y se revelan

  const seg = (opts.segundos || CONFIG.segundosPorFoto) * 1000;
  const espera = 3000 + seg;                 // la primera foto termina de "revelarse" y se muestra sus segundos

  if (validos.length < 2) {
    if (opts.unaVuelta && opts.alTerminar) setTimeout(() => { if (!ctl.dead) opts.alTerminar(); }, espera);
    return;
  }

  let pos = 0;
  const paso = () => {
    if (ctl.dead) return;
    if (opts.unaVuelta && pos === validos.length - 1) {   // ya se vio la última foto
      if (opts.alTerminar) opts.alTerminar();
      return;
    }
    pos = (pos + 1) % validos.length;
    const a = validos[pos];
    P.imgs.forEach((im, i) => im.classList.toggle("on", i === a));
    P.caps.forEach((c, i) => c.classList.toggle("on", i === a));
    P.dots.forEach((d, i) => d.classList.toggle("on", i === a));
    setTimeout(paso, seg);
  };
  setTimeout(paso, espera);
}

/* ---------- constructores de diapositivas ---------- */
function slideTitulo({ titulo, subtitulo, hintTexto, directo }) {
  return () => {
    const el = document.createElement("section");
    el.className = "slide title";
    el.innerHTML = `
      <div class="title-box">
        <img class="logo" alt="Logo BLAZE" hidden>
        <div class="big fire-text"></div>
        <div class="sub"></div>
        <div class="ornament"></div>
      </div>`;
    return {
      el,
      hint: hintTexto,
      directNext: !!directo,
      run: async (ctl) => {
        const { sleep, type } = makeHelpers(ctl);
        mostrarLogo($(".logo", el));
        await sleep(900);
        await type($(".big", el), titulo, CONFIG.velocidadEscritura * 1.8);
        if (ctl.dead) return;
        await sleep(300);
        await type($(".sub", el), subtitulo, CONFIG.velocidadEscritura * 1.1);
      }
    };
  };
}

function slideVideo() {
  return () => {
    const el = document.createElement("section");
    el.className = "slide video";
    el.innerHTML = `<div class="vbox"><video playsinline preload="auto"></video><div class="vmsg"></div></div>`;
    const v = $("video", el), msg = $(".vmsg", el);
    return {
      el,
      directNext: true,                       // un clic durante el video salta al siguiente
      hint: "haz clic para continuar",
      run: async (ctl) => {
        const url = await buscarVideo();
        if (ctl.dead) return;
        if (!url) {
          v.style.width = "min(70vw, 120vh)"; v.style.height = "40vh";
          msg.textContent = "No se encontró «video 1» en la carpeta BLAZE (prueba .mp4)";
          return;
        }
        ctl.cleanup = () => { try { v.pause(); } catch (_) {} videoReproduciendo = false; };
        v.src = url;
        videoReproduciendo = true;            // la música baja de volumen mientras suena el video
        ajustarVolumen(1200);
        try { await v.play(); }
        catch (_) { v.muted = true; try { await v.play(); } catch (__) {} }

        let fallo = false;
        await new Promise((res) => {
          v.addEventListener("ended", res, { once: true });
          v.addEventListener("error", () => { fallo = true; res(); }, { once: true });
        });
        if (ctl.dead) return;
        videoReproduciendo = false;
        ajustarVolumen(2000);                 // la música vuelve a su volumen normal
        if (fallo) { msg.textContent = "No se pudo reproducir el video (prueba con formato .mp4)"; return; }

        // Video terminado: pasa de frente a las fotos del equipo
        if (CONFIG.esperaTrasVideo > 0) {
          await new Promise((res) => setTimeout(res, CONFIG.esperaTrasVideo * 1000));
        }
        if (!ctl.dead) show(idx + 1);
      }
    };
  };
}

function slideEquipo() {
  return () => {
    const el = document.createElement("section");
    el.className = "slide team";
    const P = crearPolaroid(0);
    el.appendChild(P.photos);
    const t = document.createElement("div");
    t.className = "teamtext";
    t.innerHTML = `
      <img class="logo" alt="Logo BLAZE" hidden>
      <div class="big fire-text"></div>
      <div class="sub"></div>
      <div class="ornament"></div>`;
    el.appendChild(t);

    return {
      el,
      directNext: true,                       // un clic salta a los estudiantes sin esperar
      run: async (ctl) => {
        const { sleep, type } = makeHelpers(ctl);
        mostrarLogo($(".logo", t));

        const lista = await buscarFotosEquipo();
        if (ctl.dead) return;
        const urls = lista.length ? lista : [null];
        P.agregar(urls.length);
        // pasan todas las fotos una vez y luego se pasa solo al primer estudiante
        arrancarFotos(ctl, P, urls, "Equipo BLAZE", {
          unaVuelta: true,
          segundos: CONFIG.segundosPorFotoEquipo,
          alTerminar: () => { if (!ctl.dead) show(idx + 1); }
        });

        await sleep(1700);
        await type($(".big", t), CONFIG.equipoTitulo, CONFIG.velocidadEscritura * 1.8);
        if (ctl.dead) return;
        await sleep(300);
        await type($(".sub", t), CONFIG.equipoSubtitulo, CONFIG.velocidadEscritura * 1.1);
      }
    };
  };
}

function slideEstudiante(e) {
  return () => {
    const el = document.createElement("section");
    el.className = "slide student";
    const P = crearPolaroid(2, e.pies);
    el.appendChild(P.photos);

    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `<h2 class="nombre"></h2><div class="rule"></div><ul class="datos"></ul>`;
    el.appendChild(card);

    // líneas de datos (vacías, se escriben después)
    const ul = $(".datos", card);
    const lineas = e.datos.map(([lbl, val]) => {
      const li = document.createElement("li");
      const a = document.createElement("span"); a.className = "lbl";
      const b = document.createElement("span"); b.className = "val";
      li.append(a, b);
      ul.appendChild(li);
      return { a, b, lbl, val };
    });

    // firma
    const { wrap, firmaEl } = crearFirma(e.firma);
    card.appendChild(wrap);

    return {
      el,
      run: async (ctl) => {
        const { sleep, type } = makeHelpers(ctl);

        // las 2 fotos se alternan con desvanecimiento hasta que se haga clic
        Promise.all([buscarFoto(e.clave, 1), buscarFoto(e.clave, 2)]).then((urls) => {
          if (!ctl.dead) arrancarFotos(ctl, P, urls, e.nombre);
        });

        await sleep(1900);
        await type($(".nombre", card), e.nombre, CONFIG.velocidadEscritura * 1.3);
        if (ctl.dead) return;
        await sleep(250);
        for (const l of lineas) {
          if (ctl.dead) return;
          await type(l.a, l.lbl, CONFIG.velocidadEscritura * .8);
          await type(l.b, l.val, CONFIG.velocidadEscritura);
          await sleep(120);
        }
        if (ctl.dead) return;
        await sleep(350);
        firmaEl.classList.add("write");      // la firma se "escribe" de izquierda a derecha
        await sleep(2500);
      }
    };
  };
}

/* ---------- orden de la presentación ----------
   1) inicio BLAZE (manual)  2) video  3) fotos del equipo (solas)
   4) cada estudiante (con clic)  5) cierre                         */
const SLIDES = [
  slideTitulo({ titulo: CONFIG.inicioTitulo, subtitulo: CONFIG.inicioSubtitulo, hintTexto: "haz clic para comenzar", directo: true }),
  slideVideo(),
  slideEquipo(),
  ...ESTUDIANTES.map(slideEstudiante),
  slideTitulo({ titulo: CONFIG.finalTitulo, subtitulo: CONFIG.finalSubtitulo })
];
// qué precargar al llegar a cada diapositiva (las siguientes)
const PRECARGA = [
  null, null,
  { equipo: true },
  ...ESTUDIANTES.map((e) => ({ clave: e.clave, n: 2 })),
  null
];

/* ---------- control ---------- */
let idx = -1, ctl = null, finished = true, directNext = false;

SLIDES.forEach(() => dotsBox.appendChild(document.createElement("i")));

function updateDots() {
  [...dotsBox.children].forEach((d, i) => d.classList.toggle("on", i === idx));
}

function flash() {
  flashEl.classList.remove("go");
  void flashEl.offsetWidth;
  flashEl.classList.add("go");
}

function precargar(p) {
  if (!p) return;
  if (p.equipo) buscarFotosEquipo();
  else for (let k = 1; k <= p.n; k++) buscarFoto(p.clave, k);
}
function precargarSiguiente(i) {
  precargar(PRECARGA[i + 1]);
  precargar(PRECARGA[i + 2]);
}

function textoHintInicio() {
  return musicaPendiente ? "haz clic para activar el sonido" : "haz clic para comenzar";
}

function show(i) {
  if (i < 0 || i >= SLIDES.length) return;
  if (ctl) { ctl.dead = true; if (ctl.cleanup) ctl.cleanup(); }   // detiene escritura, carrusel y video anteriores

  const old = $(".slide.current", slidesBox);
  if (old) {
    old.classList.remove("current");
    old.classList.add("leaving");
    setTimeout(() => old.remove(), 1000);
  }

  flash();
  idx = i;
  const s = SLIDES[i]();
  s.el.classList.add("current");
  slidesBox.appendChild(s.el);

  const mine = { skip: false, dead: false, el: s.el };
  ctl = mine;
  finished = false;
  directNext = !!s.directNext;
  hint.classList.remove("on");
  hint.textContent = i === 0 ? textoHintInicio() : (s.hint || "haz clic para continuar");
  updateDots();
  precargarSiguiente(i);
  ajustarVolumen();                          // si venimos del video, la música vuelve a su volumen

  s.run(mine).then(() => {
    if (mine.dead) return;
    s.el.classList.add("instant");
    finished = true;
    hint.classList.add("on");
  });
}

function next() {
  // Si el navegador bloqueó la música al abrir la página, el primer clic en el inicio solo la activa
  if (idx === 0 && musicaPendiente) {
    iniciarMusica().finally(() => {
      musicaPendiente = false;
      if (idx === 0) hint.textContent = textoHintInicio();
    });
    return;
  }
  if (!finished && !directNext) {      // primer clic: completa lo que se está escribiendo
    ctl.skip = true;
    ctl.el.classList.add("instant");
    return;
  }
  show(idx + 1 >= SLIDES.length ? 0 : idx + 1);
}

function prev() {
  if (idx > 0) show(idx - 1);
}

/* ---------- eventos ---------- */
$("#stage").addEventListener("click", next);
$("#prev").addEventListener("click", (ev) => { ev.stopPropagation(); prev(); });
$("#mute").addEventListener("click", (ev) => { ev.stopPropagation(); alternarSilencio(); });
function alternarPantallaCompleta() {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {});
  else document.exitFullscreen?.();
}
$("#fs").addEventListener("click", (ev) => {
  ev.stopPropagation();
  alternarPantallaCompleta();
});

document.addEventListener("keydown", (ev) => {
  if (ev.key === "F5") { ev.preventDefault(); alternarPantallaCompleta(); }   // F5 = pantalla completa (como en PowerPoint)
  else if (["ArrowRight", "ArrowDown", " ", "Enter", "PageDown"].includes(ev.key)) { ev.preventDefault(); next(); }
  else if (["ArrowLeft", "ArrowUp", "PageUp"].includes(ev.key)) { ev.preventDefault(); prev(); }
  else if (ev.key.toLowerCase() === "f") $("#fs").click();
  else if (ev.key.toLowerCase() === "m") alternarSilencio();
});

/* ---------- brasas de fuego ---------- */
(function brasas() {
  const c = $("#dust"), x = c.getContext("2d");
  const COLORES = ["255,194,31", "255,138,26", "240,80,27", "200,50,26"];
  let w, h, P = [];
  const resize = () => { w = c.width = innerWidth; h = c.height = innerHeight; };
  resize(); addEventListener("resize", resize);
  const mk = (inicial) => ({
    x: Math.random() * w,
    y: inicial ? Math.random() * h : h + Math.random() * 40,
    r: Math.random() * 2.2 + .6,
    vy: -(Math.random() * 1 + .35),
    sway: Math.random() * 1.2 + .3,
    t: Math.random() * 6.28,
    a: Math.random() * .6 + .3,
    col: COLORES[(Math.random() * COLORES.length) | 0]
  });
  for (let i = 0; i < 90; i++) P.push(mk(true));
  (function loop() {
    x.clearRect(0, 0, w, h);
    for (const p of P) {
      p.t += .03;
      p.x += Math.sin(p.t) * p.sway * .5;
      p.y += p.vy;
      p.a -= .0012;
      if (p.y < -10 || p.a <= 0) Object.assign(p, mk(false));
      const al = Math.max(0, p.a * (.65 + .35 * Math.sin(p.t * 3)));
      x.beginPath();
      x.fillStyle = `rgba(${p.col},${al})`;
      x.shadowColor = `rgba(${p.col},.9)`;
      x.shadowBlur = 10;
      x.arc(p.x, p.y, p.r, 0, 6.283);
      x.fill();
    }
    requestAnimationFrame(loop);
  })();
})();

/* ---------- logo como marca de agua + precarga inicial ---------- */
buscarLogo().then((u) => { if (u) { const wm = $("#wm"); wm.src = u; wm.hidden = false; } });
buscarVideo();
buscarFotosEquipo();

/* ---------- arrancar ---------- */
show(0);

// Música desde el inicio. Los navegadores suelen bloquear el sonido hasta el primer clic:
// si pasa, el primer clic en el inicio activa la música y el siguiente clic comienza el video.
iniciarMusica().then((ok) => {
  if (!ok && musica) {
    musicaPendiente = true;
    if (idx === 0) hint.textContent = textoHintInicio();
  }
});