// 1. GESTIÓN CENTRALIZADA DE AUDIOS
const sonidos = {
    boton: new Audio('assets/sng/clic.mp3'),
    captura: new Audio('assets/sng/captura.wav'),
    espera: new Audio('assets/sng/espera-pokeball.mp3'),
    escapo: new Audio('assets/sng/escapo.mp3'),
    brillo: new Audio('assets/sng/brillocofre.mp3')
};

const canalGrito = new Audio();
let html5QrCode = null; // Instancia única
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

window.addEventListener('DOMContentLoaded', () => {
    // La inicialización se hace dinámicamente en activarEscaner para evitar bloqueos
});

function desbloquearAudio() {
    if (!audioDesbloqueado) {
        Object.values(sonidos).forEach(s => {
            s.volume = 0.1;
            s.play().then(() => { s.pause(); s.currentTime = 0; s.volume = 1; }).catch(() => {});
        });
        canalGrito.volume = 1.0;
        canalGrito.play().then(() => { canalGrito.pause(); canalGrito.volume = 1.0; }).catch(() => {});
        audioDesbloqueado = true;
    }
}

async function activarEscaner() {
    desbloquearAudio(); 

    const readerDiv = document.getElementById('reader');
    const pokedexContent = document.getElementById('pokedex-content');
    const sprite = document.getElementById('main-sprite');
    
    // 1. LIMPIEZA RADICAL: Eliminamos cualquier rastro previo de la cámara
    if (html5QrCode) {
        try {
            await html5QrCode.stop();
            await html5QrCode.clear();
        } catch (e) {
            readerDiv.innerHTML = ""; 
        }
        html5QrCode = null;
    }

    // 2. RESET VISUAL: Ocultamos el contenido para que no se vea nada detrás de la cámara
    pokemonDetectado = true;
    sprite.classList.remove('is-pokeball', 'shaking-hard', 'shaking-slow', 'clickable-chest', 'ring-reveal', 'anillo-animado', 'captured-success');
    sprite.style.opacity = "1";
    sprite.style.transform = "scale(1)";
    sprite.onclick = null;

    pokedexContent.style.visibility = 'hidden'; 
    pokedexContent.style.opacity = '0';

    // 3. PREPARAR EL CONTENEDOR DE CÁMARA
    readerDiv.style.display = 'block';
    readerDiv.style.position = 'absolute';
    readerDiv.style.top = '0';
    readerDiv.style.left = '0';
    readerDiv.style.width = '100%';
    readerDiv.style.height = '100%';
    readerDiv.style.zIndex = "9999"; // Prioridad absoluta sobre el Gengar o fondo
    readerDiv.style.backgroundColor = "black";

    // 4. INICIO CON RETRASO (Para que el navegador procese los cambios de CSS)
    setTimeout(async () => {
        try {
            html5QrCode = new Html5Qrcode("reader");
            await html5QrCode.start(
                { facingMode: "environment" }, 
                { 
                    fps: 25, 
                    qrbox: { width: 220, height: 220 },
                    aspectRatio: 1.0 
                }, 
                (text) => {
                    let code = text.toUpperCase().trim();
                    if (pokemonDB[code]) {
                        canalGrito.src = pokemonDB[code].cry;
                        canalGrito.load();
                        
                        html5QrCode.stop().then(() => {
                            html5QrCode.clear();
                            // Restauramos visibilidad
                            pokedexContent.style.visibility = 'visible';
                            pokedexContent.style.opacity = '1';
                            pokedexContent.style.display = 'flex';
                            readerDiv.style.display = 'none';
                            readerDiv.style.zIndex = "1";
                            
                            pokemonActualData = pokemonDB[code];
                            actualizarPantalla();
                        });
                    }
                }
            );

            document.querySelectorAll('.led').forEach(l => { 
                l.classList.remove('success'); 
                l.classList.add('animating'); 
            });

        } catch (err) { 
            console.error("Cámara bloqueada:", err);
            restaurarInterfaz(); 
        }
    }, 200);
}

function actualizarPantalla() {
    document.getElementById('reader').style.display = 'none';
    document.getElementById('pokedex-content').style.display = 'flex';
    document.getElementById('pokedex-content').style.visibility = 'visible';
    document.getElementById('pokedex-content').style.opacity = '1';
    document.getElementById('main-text').innerHTML = pokemonActualData.text;
    document.querySelectorAll('.led').forEach(l => l.classList.remove('animating', 'success'));
    
    const sprite = document.getElementById('main-sprite');
    sprite.src = pokemonActualData.sprite;
    
    setTimeout(() => {
        canalGrito.play().catch(() => {
            setTimeout(() => canalGrito.play(), 300);
        });
    }, 200);
    pokemonDetectado = true;
}

function capturarNormal() {
    if (!pokemonDetectado || !pokemonActualData) return;
    sonidos.espera.play().catch(() => {});
    iniciarCaptura('https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png', pokemonActualData.catchRate, "¡POKÉ BALL!");
}

function capturarSuper() {
    if (!pokemonDetectado || !pokemonActualData) return;
    sonidos.espera.play().catch(() => {});
    
    let probFinal = pokemonActualData.catchRate * 2;
    if (pokemonActualData.text.includes("GENGAR")) {
        probFinal = 0.7; 
    }
    
    iniciarCaptura('https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/great-ball.png', probFinal, "¡SUPER BALL!");
}

function iniciarCaptura(img, prob, msg) {
    const sprite = document.getElementById('main-sprite');
    const texto = document.getElementById('main-text');
    const esGengar = pokemonActualData.text.includes("GENGAR");

    pokemonDetectado = false;
