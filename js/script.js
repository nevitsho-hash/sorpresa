// Audios y Precarga
const sonidoBoton = new Audio('assets/sng/clic.mp3');
const sonidoCaptura = new Audio('assets/sng/captura.wav'); 
const sonidoEspera = new Audio('assets/sng/espera-pokeball.mp3'); 

const preAnillo = new Image(); preAnillo.src = "assets/img/anillo.png"; 
const preCofre = new Image(); preCofre.src = "assets/img/gengar-cofre.png";

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

// Desbloqueo optimizado: no silencia el clic principal
function desbloquearCanalesSecundarios() {
    if (!audioDesbloqueado) {
        [sonidoCaptura, sonidoEspera].forEach(audio => {
            audio.muted = true;
            audio.play().then(() => {
                audio.pause();
                audio.currentTime = 0;
                audio.muted = false;
            }).catch(() => {});
        });
        audioDesbloqueado = true;
    }
}

async function activarEscaner() {
    // 1. Sonido inmediato (Acción directa del usuario)
    sonidoBoton.currentTime = 0;
    sonidoBoton.play().catch(e => console.log("Error clic:", e));
    
    // 2. Desbloqueo silencioso de los demás en paralelo
    desbloquearCanalesSecundarios(); 
    
    document.getElementById('pokedex-content').style.display = 'none';
    document.getElementById('reader').style.display = 'block';
    
    document.querySelectorAll('.led').forEach(l => {
        l.classList.remove('success');
        l.classList.add('animating');
    });

    try {
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
    sprite.style.opacity = "1";
    sprite.style.transform = "scale(1)";
    sprite.onclick = null; 
    sprite.classList.remove('is-pokeball', 'shaking-hard', 'shaking-slow', 'clickable-chest', 'ring-reveal');
    
    setTimeout(() => {
        const grito = new Audio(pokemonActualData.cry);
        grito.play().catch(e => console.log("Audio bloqueado:", e));
    }, 100);
    
    pokemonDetectado = true;
}

function restaurarInterfaz() {
    document.getElementById('reader').style.display = 'none';
    document.getElementById('pokedex-content').style.display = 'flex';
}

function capturarNormal() {
    if (!pokemonDetectado) return;
    sonidoEspera.play().catch(() => {});
    iniciarCaptura('https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png', pokemonActualData.catchRate, "¡POKÉ BALL!");
}

function capturarSuper() {
    if (!pokemonDetectado) return;
    sonidoEspera.play().catch(() => {});
    iniciarCaptura('https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/great-ball.png', (pokemonActualData.catchRate * 2), "¡SUPER BALL!");
}

function iniciarCaptura(img, prob, msg) {
    const sprite = document.getElementById('main-sprite');
    const texto = document.getElementById('main-text');
    const pokemonNombre = pokemonActualData.text;

    sprite.src = img;
    sprite.classList.add('is-pokeball', 'shaking-hard');
    texto.innerHTML = msg;

    setTimeout(() => {
        sprite.classList.remove('shaking-hard');
        sprite.classList.add('shaking-slow');
    }, 1500);

    setTimeout(() => {
        sprite.classList.remove('shaking-slow');
        if (Math.random() < prob) {
            texto.innerHTML = "¡ATRAPADO!";
            sonidoCaptura.currentTime = 0;
            sonidoCaptura.play().catch(() => {}); 
            sprite.classList.add('captured-success');
            document.querySelectorAll('.led').forEach(l => l.classList.add('success'));
            pokemonDetectado = false;

            if (pokemonNombre.includes("GENGAR")) {
                setTimeout(() => {
                    sprite.classList.remove('is-pokeball', 'captured-success');
                    sprite.style.opacity = "0"; 
                    
                    setTimeout(() => {
                        sprite.src = "assets/img/gengar-cofre.png";
                        sprite.classList.add('clickable-chest');
                        sprite.style.opacity = "1";
                        sprite.style.transform = "scale(1.2)";
                        texto.innerHTML = "GENGAR TIENE<br>ALGO PARA TI...";
                        sprite.onclick = abrirCofre;
                    }, 500);
                }, 4000); 
            }
        } else {
            texto.innerHTML = "¡SE ESCAPÓ!";
            sprite.style.transform = "scale(0.35)";
            setTimeout(() => {
                sprite.classList.remove('is-pokeball');
                sprite.src = pokemonActualData.sprite;
                sprite.style.transform = "scale(1)"; 
                setTimeout(() => { texto.innerHTML = pokemonNombre; }, 800);
            }, 600);
        }
    }, 3500);
}

function abrirCofre() {
    const sprite = document.getElementById('main-sprite');
    const texto = document.getElementById('main-text');

    sprite.onclick = null;
    sprite.classList.remove('clickable-chest');
    sprite.style.opacity = "0";
    
    setTimeout(() => {
        sprite.src = "assets/img/anillo.png"; 
        sprite.classList.add('ring-reveal');
        sprite.style.opacity = "1";
        texto.innerHTML = "¿QUIERES SER<br>MI PAREJA?";
    }, 500);
}
