const sonidoBoton = new Audio('assets/sng/clic.mp3');
const sonidoCaptura = new Audio('assets/sng/captura.wav');
const sonidoEspera = new Audio('assets/sng/espera-pokeball.mp3');

// Precarga de imágenes críticas
const preAnillo = new Image(); preAnillo.src = "assets/img/anillo.png";
const preCofre = new Image(); preCofre.src = "assets/img/gengar-cofre.png";

let html5QrCode;
let pokemonDetectado = true;
let audioDesbloqueado = false; // Control de seguridad para el primer toque

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

// FUNCIÓN PARA DESBLOQUEAR EL AUDIO EN EL PRIMER CLIC
function desbloquearAudio() {
if (!audioDesbloqueado) {
// Reproducimos y pausamos instantáneamente todos los audios
[sonidoBoton, sonidoCaptura, sonidoEspera].forEach(audio => {
audio.play().then(() => {
audio.pause();
audio.currentTime = 0;
}).catch(() => {});
});
audioDesbloqueado = true;
}
}

async function activarEscaner() {
    // 1. Desbloqueo de audio y reseteo visual inmediato [cite: 2026-03-02]
    desbloquearAudio(); 
    sonidoBoton.play().catch(() => {}); 
    
    // 2. Limpieza total de estados anteriores para evitar bloqueos
    const sprite = document.getElementById('main-sprite');
    sprite.onclick = null; 
    sprite.style.cursor = "default";
    sprite.classList.remove('is-pokeball', 'shaking-hard', 'shaking-slow', 'clickable-chest', 'ring-reveal', 'captured-success');
    sprite.style.transform = "scale(1)";
    sprite.style.opacity = "1";

    // 3. Cambio de interfaz
    document.getElementById('pokedex-content').style.display = 'none';
    document.getElementById('reader').style.display = 'block';
    
    document.querySelectorAll('.led').forEach(l => {
        l.classList.remove('success');
        l.classList.add('animating');
    });

    try {
        // Aseguramos que si ya había un escáner, se detenga antes de empezar
        if(html5QrCode.isScanning) {
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
    } catch (err) { 
        console.error("Error cámara:", err);
        restaurarInterfaz(); 
    }
}

function actualizarPantalla() {
document.getElementById('reader').style.display = 'none';
document.getElementById('pokedex-content').style.display = 'flex';
document.getElementById('main-text').innerHTML = pokemonActualData.text;
document.querySelectorAll('.led').forEach(l => l.classList.remove('animating', 'success'));

```
const sprite = document.getElementById('main-sprite');
sprite.src = pokemonActualData.sprite;
sprite.style.opacity = "1";
sprite.style.transform = "scale(1)";
sprite.onclick = null;
sprite.classList.remove('is-pokeball', 'shaking-hard', 'shaking-slow', 'clickable-chest', 'ring-reveal');

// Reproducción del grito con un pequeño delay para asegurar el enfoque
setTimeout(() => {
    const grito = new Audio(pokemonActualData.cry);
    grito.play().catch(e => console.log("Audio bloqueado:", e));
}, 100);

pokemonDetectado = true;
```

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
    const pokemonSpriteURL = pokemonActualData.sprite; 
    const pokemonNombre = pokemonActualData.text;

    // FASE 0: EFECTO DE ZOOM HACIA ADENTRO (El Pokémon entra en la bola)
    sprite.style.transform = "scale(0)";
    sprite.style.opacity = "0";
    texto.innerHTML = "¡ALLÁ VA!";

    setTimeout(() => {
        // FASE 1: APARECE LA POKÉ BALL
        sprite.src = img;
        sprite.style.transform = "scale(0.65)"; // Tamaño de la bola
        sprite.style.opacity = "1";
        sprite.classList.add('is-pokeball', 'shaking-hard');
        texto.innerHTML = msg;

        // FASE 2: LA BOLA SE CALMA (SUSPENSE)
        setTimeout(() => {
            sprite.classList.remove('shaking-hard');
            sprite.classList.add('shaking-slow');
        }, 1500);

        // FASE 3: MOMENTO DE LA VERDAD
        setTimeout(() => {
            sprite.classList.remove('shaking-slow');
            if (Math.random() < prob) {
                // ÉXITO: CELEBRACIÓN
                texto.innerHTML = "¡ATRAPADO!";
                sonidoCaptura.currentTime = 0;
                sonidoCaptura.play().catch(() => {}); 
                sprite.classList.add('captured-success');
                document.querySelectorAll('.led').forEach(l => l.classList.add('success'));
                pokemonDetectado = false;

                // SECUENCIA DEL COFRE (Solo para Gengar con pausa de 4s)
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
                // FALLO: EL POKÉMON "SALE" DE LA BOLA
                texto.innerHTML = "¡SE ESCAPÓ!";
                sprite.style.transform = "scale(0.35)";
                setTimeout(() => {
                    sprite.classList.remove('is-pokeball');
                    sprite.src = pokemonSpriteURL;
                    sprite.style.transform = "scale(1.2)"; // Efecto de explosión al salir
                    sprite.style.opacity = "1";
                    
                    setTimeout(() => {
                        sprite.style.transform = "scale(1)"; 
                        texto.innerHTML = pokemonNombre; 
                    }, 200);
                }, 600);
            }
        }, 3500);
    }, 400); // Pequeña pausa para que se vea el zoom del Pokémon
}

function abrirCofre() {
const sprite = document.getElementById('main-sprite');
const texto = document.getElementById('main-text');
sprite.onclick = null;
sprite.classList.remove('clickable-chest');
sprite.style.cursor = "default";
sprite.style.opacity = "0";
setTimeout(() => {
sprite.src = "assets/img/anillo.png";
sprite.classList.add('ring-reveal');
sprite.style.opacity = "1";
texto.innerHTML = "¿QUIERES SER<br>MI PAREJA?";
}, 500);
}
