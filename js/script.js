// 1. GESTIÓN CENTRALIZADA DE AUDIOS
const sonidos = {
    boton: new Audio('assets/sng/clic.mp3'),
    captura: new Audio('assets/sng/captura.wav'),
    espera: new Audio('assets/sng/espera-pokeball.mp3'),
    escapo: new Audio('assets/sng/escapo.mp3'),
    brillo: new Audio('assets/sng/brillocofre.mp3')
};

// Canal específico para los gritos (Punto crítico de tu error anterior)
const canalGrito = new Audio();

let html5QrCode;
let pokemonDetectado = true;
let audioDesbloqueado = false;

let pokemonActualData = { 
    text: "GENGAR", 
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/94.png", 
    catchRate: 0.1, 
    cry: "assets/sng/gengar.mp3" 
};

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

// 2. DESBLOQUEO DE CANALES (Solución definitiva al silencio inicial)
function desbloquearAudio() {
    if (!audioDesbloqueado) {
        // Desbloqueamos efectos fijos
        Object.values(sonidos).forEach(s => {
            s.muted = true;
            s.play().then(() => { s.pause(); s.currentTime = 0; s.muted = false; }).catch(() => {});
        });
        
        // "Calentamos" el canal de gritos con un micro-silencio (Acción crucial)
        canalGrito.muted = true;
        canalGrito.play().then(() => {
            canalGrito.pause();
            canalGrito.muted = false;
        }).catch(() => {});

        audioDesbloqueado = true;
    }
}

async function activarEscaner() {
    desbloquearAudio(); // Se dispara con el clic del botón verde
    sonidos.boton.play().catch(() => {});
    
    const sprite = document.getElementById('main-sprite');
    sprite.onclick = null;
    sprite.classList.remove('is-pokeball', 'shaking-hard', 'shaking-slow', 'clickable-chest', 'ring-reveal', 'captured-success');
    sprite.style.opacity = "1";
    sprite.style.transform = "scale(1)";

    document.getElementById('pokedex-content').style.display = 'none';
    document.getElementById('reader').style.display = 'block';
    document.querySelectorAll('.led').forEach(l => { l.classList.remove('success'); l.classList.add('animating'); });

    try {
        if (html5QrCode && html5QrCode.isScanning) {
            await html5QrCode.stop();
        }
        await html5QrCode.start({ facingMode: "environment" }, { fps: 20, qrbox: 250 }, (text) => {
            let code = text.toUpperCase().trim();
            if (pokemonDB[code]) {
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
    document.querySelectorAll('.led').forEach(l => l.classList.remove('animating', 'success'));
    
    const sprite = document.getElementById('main-sprite');
    sprite.src = pokemonActualData.sprite;
    sprite.onclick = null;
    sprite.classList.remove('is-pokeball', 'shaking-hard', 'shaking-slow', 'clickable-chest', 'ring-reveal', 'captured-success');
    
    // Reproducción del grito: El canal ya tiene permiso por el desbloquearAudio()
    canalGrito.src = pokemonActualData.cry;
    canalGrito.play().catch(e => console.error("Error Audio Pokémon:", e));
    
    pokemonDetectado = true; // Habilitamos botones
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

    pokemonDetectado = false; // Bloqueo de seguridad

    // ANIMACIÓN DE SUCCIÓN (Mejora de fluidez solicitada)
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
            if (sprite.classList.contains('shaking-hard')) {
                sprite.classList.replace('shaking-hard', 'shaking-slow'); 
            }
        }, 1500);

        setTimeout(() => {
            sprite.classList.remove('shaking-slow');
            if (Math.random() < prob) {
                // ÉXITO
                texto.innerHTML = "¡ATRAPADO!";
                sonidos.captura.play().catch(() => {});
                sprite.classList.add('captured-success');
                document.querySelectorAll('.led').forEach(l => l.classList.add('success'));

                if (esGengar) {
                    setTimeout(() => {
                        sprite.style.transition = "opacity 0.8s ease";
                        sprite.style.opacity = "0";
                        setTimeout(() => {
                            sonidos.brillo.play().catch(() => {});
                            sprite.src = "assets/img/gengar-cofre.png";
                            sprite.classList.remove('is-pokeball', 'captured-success');
                            sprite.classList.add('clickable-chest');
                            sprite.style.opacity = "1";
                            sprite.style.transform = "scale(1.2)";
                            texto.innerHTML = "GENGAR TIENE<br>ALGO PARA TI...";
                            sprite.onclick = abrirCofre;
                        }, 500);
                    }, 4000);
                } else {
                    // Si no es Gengar, liberamos botones tras pausa de éxito
                    setTimeout(() => { pokemonDetectado = true; }, 1200);
                }
            } else {
                // FALLO
                texto.innerHTML = "¡SE ESCAPÓ!";
                sonidos.escapo.play().catch(() => {});
                sprite.style.transform = "scale(0.35)";
                setTimeout(() => {
                    sprite.classList.remove('is-pokeball');
                    sprite.src = pokemonActualData.sprite;
                    sprite.style.transform = "scale(1.2)";
                    sprite.style.opacity = "1";
                    setTimeout(() => { 
                        sprite.style.transform = "scale(1)";
                        texto.innerHTML = pokemonActualData.text; 
                        pokemonDetectado = true; // Liberación tras escape
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
    sprite.classList.remove('clickable-chest');
    sprite.style.transition = "opacity 0.4s ease";
    sprite.style.opacity = "0";
    setTimeout(() => {
        sprite.src = "assets/img/anillo.png";
        sprite.classList.add('ring-reveal');
        sprite.style.opacity = "1";
        texto.innerHTML = "¿QUIERES SER<br>MI PAREJA?";
    }, 500);
}

function restaurarInterfaz() { 
    document.getElementById('reader').style.display = 'none'; 
    document.getElementById('pokedex-content').style.display = 'flex'; 
    pokemonDetectado = true;
}
