// 1. GESTIÓN CENTRALIZADA DE AUDIOS
const sonidos = {
    boton: new Audio('assets/sng/clic.mp3'),
    captura: new Audio('assets/sng/captura.wav'),
    espera: new Audio('assets/sng/espera-pokeball.mp3'),
    escapo: new Audio('assets/sng/escapo.mp3'),
    brillo: new Audio('assets/sng/brillocofre.mp3')
};

const canalGrito = new Audio();

let html5QrCode;
let pokemonDetectado = true;
let audioDesbloqueado = false;

const pokemonDB = {
    "BEAUTIFLY": { text: "¡BEAUTIFLY!", sprite: "assets/img/BEAUTIFLY.png", catchRate: 0.5, cry: "assets/sng/beautifly.mp3" },
    "SNORLAX": { text: "¡SNORLAX!", sprite: "assets/img/SNORLAX.png", catchRate: 0.2, cry: "assets/sng/snorlax.mp3" },
    "SWALOT": { text: "¡SWALOT!", sprite: "assets/img/SWALOT.png", catchRate: 0.4, cry: "assets/sng/swalot.mp3" },
    "TOTODILE": { text: "¡TOTODILE!", sprite: "assets/img/TOTODILE.png", catchRate: 0.6, cry: "assets/sng/totodile.mp3" },
    "UMBREON": { text: "¡UMBREON!", sprite: "assets/img/UMBREON.png", catchRate: 0.3, cry: "assets/sng/umbreon.mp3" },
    "JIGGLYPUFF": { text: "¡JIGGLYPUFF!", sprite: "assets/img/JIGGLYPUFF.png", catchRate: 0.7, cry: "assets/sng/jigglypuff.mp3" },
    "GENGAR": { text: "¡GENGAR!", sprite: "assets/img/GENGAR.png", catchRate: 0.1, cry: "assets/sng/gengar.mp3" }
};

window.addEventListener('DOMContentLoaded', () => {
    html5QrCode = new Html5Qrcode("reader");
});

// FUNCIÓN DE DESBLOQUEO (Silenciosa para evitar solapamientos)
function desbloquearAudio() {
    if (!audioDesbloqueado) {
        Object.values(sonidos).forEach(s => {
            s.muted = true; // Muteamos para que no se oiga nada al pulsar el botón verde
            s.play().then(() => { 
                s.pause(); 
                s.currentTime = 0; 
                s.muted = false; // Ya tenemos el permiso, quitamos el mute para después
            }).catch(() => {});
        });
        
        canalGrito.muted = true;
        canalGrito.play().then(() => { 
            canalGrito.pause(); 
            canalGrito.muted = false;
        }).catch(() => {});
        
        audioDesbloqueado = true;
    }
}

async function activarEscaner() {
    // Desbloqueamos los canales en silencio absoluto
    desbloquearAudio(); 
    
    // Eliminado: sonidos.boton.play() para evitar ruidos al iniciar cámara
    
    pokemonDetectado = true;
    const sprite = document.getElementById('main-sprite');
    sprite.classList.remove('is-pokeball', 'shaking-hard', 'shaking-slow', 'clickable-chest', 'ring-reveal', 'anillo-animado', 'captured-success');
    sprite.style.opacity = "1";
    sprite.style.transform = "scale(1)";

    document.getElementById('pokedex-content').style.display = 'none';
    document.getElementById('reader').style.display = 'block';

    try {
        if (html5QrCode && html5QrCode.isScanning) { await html5QrCode.stop(); }
        await html5QrCode.start({ facingMode: "environment" }, { fps: 20, qrbox: 250 }, (text) => {
            let code = text.toUpperCase().trim();
            if (pokemonDB[code]) {
                // Pre-carga el grito en el momento de la detección
                canalGrito.src = pokemonDB[code].cry;
                canalGrito.load();
                
                html5QrCode.stop().then(() => {
                    pokemonActualData = pokemonDB[code];
                    actualizarPantalla();
                });
            }
        });
    } catch (err) { restaurarInterfaz(); }
}

function actualizarPantalla() {
    document.getElementById('reader').style.display = 'none';
    document.getElementById('pokedex-content').style.display = 'flex';
    document.getElementById('main-text').innerHTML = pokemonActualData.text;
    
    const sprite = document.getElementById('main-sprite');
    sprite.src = pokemonActualData.sprite;
    
    // Suena el grito del Pokémon detectado
    canalGrito.play().catch(e => console.log("Fallo audio:", e));
    
    pokemonDetectado = true;
}

function capturarNormal() {
    if (!pokemonDetectado) return;
    sonidos.espera.play().catch(() => {});
    iniciarCaptura('https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png', pokemonActualData.catchRate, "¡POKÉ BALL!");
}

function capturarSuper() {
    if (!pokemonDetectado) return;
    sonidos.espera.play().catch(() => {});
    iniciarCaptura('https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/great-ball.png', (pokemonActualData.catchRate * 2), "¡SUPER BALL!");
}

function iniciarCaptura(img, prob, msg) {
    const sprite = document.getElementById('main-sprite');
    const texto = document.getElementById('main-text');
    const esGengar = pokemonActualData.text.includes("GENGAR");

    pokemonDetectado = false;
    sprite.style.transition = "transform 0.4s ease, opacity 0.4s ease";
    sprite.style.transform = "scale(0)";
    sprite.style.opacity = "0";

    setTimeout(() => {
        sprite.src = img;
        sprite.style.transform = "scale(0.65)";
        sprite.style.opacity = "1";
        sprite.classList.add('is-pokeball', 'shaking-hard');
        texto.innerHTML = msg;

        setTimeout(() => {
            if (sprite.classList.contains('is-pokeball')) {
                sprite.classList.replace('shaking-hard', 'shaking-slow');
            }
        }, 1500);

        setTimeout(() => {
            sprite.classList.remove('shaking-slow');
            if (Math.random() < prob) {
                texto.innerHTML = "¡ATRAPADO!";
                sonidos.captura.play().catch(() => {});
                sprite.classList.remove('is-pokeball');
                setTimeout(() => {
                    sprite.classList.add('captured-success');
                }, 10);

                if (esGengar) {
                    setTimeout(() => {
                        sprite.style.opacity = "0";
                        setTimeout(() => {
                            sprite.classList.remove('captured-success');
                            sprite.src = "assets/img/gengar-cofre.png";
                            sonidos.brillo.play().catch(() => {});
                            sprite.style.opacity = "1";
                            sprite.style.transform = "scale(1.2)";
                            sprite.classList.add('clickable-chest');
                            texto.innerHTML = "GENGAR TIENE<br>ALGO PARA TI...";
                            sprite.onclick = abrirCofre;
                        }, 800);
                    }, 4000);
                } else {
                    setTimeout(() => { pokemonDetectado = true; }, 1500);
                }
            } else {
                texto.innerHTML = "¡SE ESCAPÓ!";
                sonidos.escapo.play().catch(() => {});
                sprite.style.transform = "scale(0.35)";
                setTimeout(() => {
                    sprite.classList.remove('is-pokeball', 'shaking-hard', 'shaking-slow');
                    sprite.src = pokemonActualData.sprite;
                    sprite.style.opacity = "1";
                    sprite.style.transform = "scale(1)";
                    setTimeout(() => { 
                        texto.innerHTML = pokemonActualData.text;
                        pokemonDetectado = true;
                    }, 200);
                }, 600);
            }
        }, 3500);
    }, 400);
}

function abrirCofre() {
    const sprite = document.getElementById('main-sprite');
    const texto = document.getElementById('main-text');
    sprite.onclick = null;
    sprite.style.opacity = "0";
    setTimeout(() => {
        sprite.src = "assets/img/anillo.png";
        sprite.style.opacity = "1";
        sprite.classList.add('ring-reveal');
        texto.innerHTML = "¿QUIERES SER<br>MI PAREJA?";
        setTimeout(() => { sprite.classList.add('anillo-animado'); }, 1500);
    }, 500);
}

function restaurarInterfaz() {
    document.getElementById('reader').style.display = 'none';
    document.getElementById('pokedex-content').style.display = 'flex';
    pokemonDetectado = true;
}
