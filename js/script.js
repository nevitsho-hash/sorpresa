// ... (Mantenemos audios, precarga y base de datos igual) ...

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

// ... (Resto de funciones iguales) ...
