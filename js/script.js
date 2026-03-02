// 1. GESTIÓN CENTRALIZADA DE AUDIOS
const sonidos = {
    boton: new Audio('assets/sng/clic.mp3'),
    captura: new Audio('assets/sng/captura.wav'),
    espera: new Audio('assets/sng/espera-pokeball.mp3'),
    escapo: new Audio('assets/sng/escapo.mp3'),
    brillo: new Audio('assets/sng/brillocofre.mp3')
};

const canalGrito = new Audio();
let html5QrCode = null; // Variable única global
let pokemonDetectado = true;
let audioDesbloqueado = false;
let pokemonActualData = null;

const pokemonDB = {
    "BEAUTIFLY": { text: "¡BEAUTIFLY!", sprite: "assets/img/BEAUTIFLY.png", catchRate: 0.5, cry: "assets/sng/beautifly.mp3" },
    "SNORLAX": { text: "¡SNORLAX!", sprite: "assets/img/SNORLAX.png", catchRate: 0.5, cry: "assets/sng/snorlax.mp3" },
    "SWALOT": { text: "¡SWALOT!", sprite: "assets/img/SWALOT.png", catchRate: 0.5, cry: "assets/sng/swalot.mp3" },
    "TOTODILE": { text: "¡TOTODILE!", sprite: "assets/img/TOTODILE.png", catchRate: 0.5, cry: "assets/sng/totodile.mp3" },
    "UMBREON": { text: "¡UMBREON!", sprite: "assets/img/UMBREON.png", catchRate: 0.5, cry: "assets/sng/umbreon.mp3" },
    "JIGGLYPUFF": { text: "¡JIGGLYPUFF!", sprite: "assets/img/JIGGLYPUFF.png", catchRate: 0.5, cry: "assets/sng/jigglypuff.mp3" },
    "GENGAR": { text: "¡GENGAR!", sprite: "assets/img/GENGAR.png", catchRate: 0.2, cry: "assets/sng/gengar.mp3" }
};

// --- DESBLOQUEO DE AUDIO (Técnica del volumen 0.1) ---
function desbloquearAudio() {
    if (!audioDesbloqueado) {
        Object.values(sonidos).forEach(s => {
            s.volume = 0.1;
            s.play().then(() => { 
                s.pause(); 
                s.currentTime = 0; 
                s.volume = 1.0; 
            }).catch(() => {});
        });
        canalGrito.volume = 1.0;
        canalGrito.play().then(() => { 
            canalGrito.pause(); 
            canalGrito.volume = 1.0; 
        }).catch(() => {});
        audioDesbloqueado = true;
    }
}

// --- GESTIÓN DE ESCÁNER ---
async function activarEscaner() {
    desbloquearAudio(); 

    const readerDiv = document.getElementById('reader');
    const pokedexContent = document.getElementById('pokedex-content');
    const sprite = document.getElementById('main-sprite');
    
    // 1. Limpieza radical preventiva
    if (html5QrCode) {
        try {
            await html5QrCode.stop();
            await html5QrCode.clear();
        } catch (e) {
            readerDiv.innerHTML = ""; 
        }
        html5QrCode = null;
    }

    // 2. Reset visual y liberación de botones
    pokemonDetectado = true;
    sprite
