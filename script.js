const TEMPO_POR_LETRA_SEGUNDOS = 60; // 1 minuto por letra/erro
const TEMPO_COOLDOWN_ERRO_MS = 1000; // 1 segundo de intervalo (cooldown) obrigatorio

// 🎵 LISTA DE MÚSICAS (COLOQUE SEUS ARQUIVOS AQUI)
const playlist = [
    "m1.mp3",
    "m2.mp3",
    "m3.mp3"
];
let indiceMusicaAtual = 0;

function normalizarTexto(texto) {
    return texto
        .toLowerCase()
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

// SUAS PERGUNTAS (TEXTO + FOTOS)
const perguntas = [
    {
        tipo: "texto",
        pergunta: "Qual artista musical nós mais conversamos no início do nosso relacionamento, bobona? 🎶",
        resposta: "Joji"
    },
    {
        tipo: "texto",
        pergunta: "Qual é o nome da nossa música especial? 💙💝💜",
        resposta: "Pink Bubblegum"
    },
    {
        tipo: "texto",
        pergunta: "Qual foi o primeiro anime que vimos juntos? 🎬",
        resposta: "Erased"
    },
    {
        tipo: "texto",
        pergunta: "Qual o nome do Carequinha que eu sou apaixonado? 👨‍🦲",
        resposta: "Lucas"
    },
    {
        tipo: "texto",
        pergunta: "Qual era o apelido que usamos um com o outro? 🤪",
        resposta: "Malucos"
    },
    {
        tipo: "texto",
        pergunta: "Qual foi o primeiro filme que assistimos juntos? 🌹",
        resposta: "Scott Pilgrim contra o mundo"
    },
    {
        tipo: "texto",
        pergunta: "Aonde você me trancava no inicio do nosso relacionamento? 😭",
        resposta: "Cativeiro"
    },
    {
        tipo: "foto",
        pergunta: "Qual dessas fotos de Comida é a primeira que você me enviou quando começamos a conversar?",
        opcoes: [
            { img: "img2.jpg", correta: false },
            { img: "img1.jpg", correta: true },
            { img: "img3.jpg", correta: false }
        ]
    },
    {
        tipo: "foto",
        pergunta: "Qual dessas 3 eu mais gostaria de cair de boca? 😳",
        opcoes: [
            { img: "img4.jpg", correta: false },
            { img: "img5.jpg", correta: false },
            { 
                img: "img6.jpg",             
                imgHover: "img7.jpg",        
                gif: "comemoracao.gif",      
                correta: true 
            }
        ]
    },
    {
        tipo: "foto",
        pergunta: "Dentre essas fotos, qual é a eu mais gosto?💖\n(Dica: todas)",
        opcoes: [
            { img: "img10.jpg", gif: "final3.jpg", correta: true },
            { img: "img9.jpg", gif: "final3.jpg", correta: true },
            { img: "img8.jpg", gif: "final3.jpg", correta: true } 
        ]
    }
];

let indiceAtual = 0;
let letrasReveladas = 0;
let segundosRestantes = TEMPO_POR_LETRA_SEGUNDOS;
let timerInterval;
let delayTimeout;
let podeResponder = true;

const elementoPergunta = document.getElementById("texto-pergunta");
const elementoContador = document.getElementById("contador-pergunta");
const elementoTimer = document.getElementById("timer-display");
const elementoFeedback = document.getElementById("mensagem-feedback");

const blocoTexto = document.getElementById("bloco-texto");
const blocoFotos = document.getElementById("bloco-fotos");

function carregarPergunta() {
    clearInterval(timerInterval);
    clearTimeout(delayTimeout);

    podeResponder = true;

    const atual = perguntas[indiceAtual];
    elementoPergunta.textContent = atual.pergunta;
    elementoContador.textContent = `Pergunta ${indiceAtual + 1} de ${perguntas.length}`;
    elementoFeedback.textContent = "";

    const btnVoltar = document.getElementById("btn-voltar");
    if (btnVoltar) {
        btnVoltar.disabled = (indiceAtual === 0);
    }

    if (atual.tipo === "texto") {
        blocoTexto.classList.remove("escondido");
        blocoFotos.classList.add("escondido");
        elementoTimer.style.display = "inline-block";

        const input = document.getElementById("resposta-input");
        input.value = "";
        letrasReveladas = 0;
        atualizarPista();
        iniciarContadorTempo();

    } else if (atual.tipo === "foto") {
        blocoTexto.classList.add("escondido");
        blocoFotos.classList.remove("escondido");
        elementoTimer.style.display = "none";

        renderizarFotos(atual.opcoes);
    }
}

function renderizarFotos(opcoes) {
    const container = document.getElementById("opcoes-fotos-container");
    container.innerHTML = "";

    opcoes.forEach(opcao => {
        const img = document.createElement("img");
        img.src = opcao.img;
        img.className = "foto-card";

        if (opcao.imgHover) {
            img.onmouseenter = () => { img.src = opcao.imgHover; };
            img.onmouseleave = () => { img.src = opcao.img; };
        }

        img.onclick = () => verificarFoto(img, opcao);
        container.appendChild(img);
    });
}

function verificarFoto(elementoClicado, opcao) {
    if (!podeResponder) return;

    const todasFotos = document.querySelectorAll('.foto-card');
    todasFotos.forEach(foto => foto.classList.remove('correta', 'errada'));

    if (opcao.correta) {
        podeResponder = false;
        elementoClicado.classList.add('correta');
        elementoFeedback.textContent = "Acertou em cheio! 💖";
        elementoFeedback.className = "feedback sucesso";

        if (opcao.gif) {
            mostrarGifEProsseguir(opcao.gif, true);
        } else {
            proximaPerguntaComDelay();
        }
    } else {
        podeResponder = false;
        elementoClicado.classList.add('errada');
        elementoFeedback.textContent = "Ops, essa foto não! Tente outra 😉";
        elementoFeedback.className = "feedback erro";

        if (opcao.gif) {
            mostrarGifEProsseguir(opcao.gif, false);
        } else {
            setTimeout(() => { podeResponder = true; }, TEMPO_COOLDOWN_ERRO_MS);
        }
    }
}

function mostrarGifEProsseguir(urlGif, avancar = true) {
    const overlay = document.getElementById("overlay-gif");
    const imgGif = document.getElementById("gif-animacao");

    imgGif.src = urlGif;
    overlay.classList.remove("escondido");

    const fechar = () => {
        overlay.classList.add("escondido");
        overlay.removeEventListener("click", fechar);
        clearTimeout(timerGif);
        
        if (avancar) {
            proximaPerguntaComDelay();
        } else {
            podeResponder = true;
        }
    };

    overlay.addEventListener("click", fechar);
    const timerGif = setTimeout(fechar, 2500);
}

function responderTexto() {
    if (!podeResponder) return;

    const inputEl = document.getElementById("resposta-input");
    const input = normalizarTexto(inputEl.value);
    const atual = perguntas[indiceAtual];
    const respostaCerta = normalizarTexto(atual.resposta);

    podeResponder = false;

    if (input === respostaCerta) {
        inputEl.blur();
        elementoFeedback.textContent = "Acertou! ✨";
        elementoFeedback.className = "feedback sucesso";
        clearInterval(timerInterval);

        if (atual.gifAcerto) {
            mostrarGifEProsseguir(atual.gifAcerto, true);
        } else {
            proximaPerguntaComDelay();
        }
    } else {
        const resposta = atual.resposta;
        if (letrasReveladas < resposta.length) {
            letrasReveladas++;
            atualizarPista();
            segundosRestantes = TEMPO_POR_LETRA_SEGUNDOS;
            elementoFeedback.textContent = "Errou! Liberamos +1 letra de ajuda! 😉";
        } else {
            elementoFeedback.textContent = "Ops, tenta de novo!";
        }
        elementoFeedback.className = "feedback erro";

        setTimeout(() => {
            if (perguntas[indiceAtual]?.tipo === "texto") {
                podeResponder = true;
            }
        }, TEMPO_COOLDOWN_ERRO_MS);
    }
}

function proximaPergunta() {
    clearInterval(timerInterval);
    clearTimeout(delayTimeout);

    if (indiceAtual < perguntas.length - 1) {
        indiceAtual++;
        carregarPergunta();
    } else {
        document.getElementById("quiz-card").classList.add("escondido");
        document.getElementById("tela-final").classList.remove("escondido");
    }
}

function perguntaAnterior() {
    clearInterval(timerInterval);
    clearTimeout(delayTimeout);

    if (indiceAtual > 0) {
        indiceAtual--;
        carregarPergunta();
    }
}

function proximaPerguntaComDelay() {
    clearTimeout(delayTimeout);
    delayTimeout = setTimeout(() => {
        proximaPergunta();
    }, 1200);
}

function iniciarContadorTempo() {
    clearInterval(timerInterval);
    segundosRestantes = TEMPO_POR_LETRA_SEGUNDOS;
    atualizarExibicaoTimer();

    timerInterval = setInterval(() => {
        segundosRestantes--;
        atualizarExibicaoTimer();

        if (segundosRestantes <= 0) {
            const resposta = perguntas[indiceAtual].resposta;
            if (letrasReveladas < resposta.length) {
                letrasReveladas++;
                atualizarPista();
                segundosRestantes = TEMPO_POR_LETRA_SEGUNDOS;
            } else {
                clearInterval(timerInterval);
            }
        }
    }, 1000);
}

function atualizarExibicaoTimer() {
    const min = String(Math.floor(segundosRestantes / 60)).padStart(2, '0');
    const seg = String(segundosRestantes % 60).padStart(2, '0');
    elementoTimer.textContent = `⏳ ${min}:${seg}`;
}

function atualizarPista() {
    const resposta = perguntas[indiceAtual].resposta;
    let exibicao = "";
    for (let i = 0; i < resposta.length; i++) {
        if (resposta[i] === " ") exibicao += "   ";
        else if (i < letrasReveladas) exibicao += resposta[i] + " ";
        else exibicao += "_ ";
    }
    document.getElementById("pista-resposta").textContent = exibicao.trim();
}

let tempoPopup;
function mostrarDica() {
    const popup = document.getElementById("popup-dica");
    if (!popup) return;

    popup.classList.remove("escondido");
    clearTimeout(tempoPopup);

    tempoPopup = setTimeout(() => {
        popup.classList.add("escondido");
    }, 4000);
}

document.getElementById("resposta-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        if (e.repeat) return;
        responderTexto();
    }
});

carregarPergunta();

// =========================================================
// LÓGICA DE MÚSICA DE FUNDO (PLAYLIST + LOOPING INFINITO)
// =========================================================

let fadeInterval;
let audioCtx;
let analyser;
let sourceNode;
let dataArray;
let audioContextIniciado = false;

function obterVolumeDoSlider() {
    const slider = document.getElementById("volume-slider");
    return slider ? (parseFloat(slider.value) / 100) : 0.5;
}

function inicializarAnalisadorAudio() {
    if (audioContextIniciado) return;

    const audio = document.getElementById("audio-fundo");
    
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();
    
    analyser.fftSize = 64; 
    dataArray = new Uint8Array(analyser.frequencyBinCount);

    sourceNode = audioCtx.createMediaElementSource(audio);
    sourceNode.connect(analyser);
    analyser.connect(audioCtx.destination);

    audioContextIniciado = true;
    pulsarComABatida();
}

function pulsarComABatida() {
    requestAnimationFrame(pulsarComABatida);

    const audio = document.getElementById("audio-fundo");
    const bgPulse = document.getElementById("bg-pulse");

    if (audio.paused || !analyser) {
        if (bgPulse) bgPulse.style.opacity = "0";
        return;
    }

    analyser.getByteFrequencyData(dataArray);

    let graves = (dataArray[0] + dataArray[1] + dataArray[2] + dataArray[3]) / 4;
    let intensidade = graves / 255; 

    if (bgPulse) {
        bgPulse.style.opacity = (intensidade * 0.35).toFixed(2);
    }
}

function carregarEProximaMusica() {
    const audio = document.getElementById("audio-fundo");
    audio.src = playlist[indiceMusicaAtual];
    fadeInAudio(audio);
}

function fadeInAudio(audio, duration = 1200) {
    clearInterval(fadeInterval);
    
    const targetVolume = obterVolumeDoSlider();

    if (targetVolume === 0) {
        audio.volume = 0;
        audio.play().then(() => inicializarAnalisadorAudio()).catch(() => {});
        return;
    }

    audio.volume = 0;

    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    audio.play().then(() => {
        inicializarAnalisadorAudio();

        const intervalTime = 30;
        const step = targetVolume / (duration / intervalTime);

        fadeInterval = setInterval(() => {
            if (audio.volume + step < targetVolume) {
                audio.volume += step;
            } else {
                audio.volume = targetVolume;
                clearInterval(fadeInterval);
            }
        }, intervalTime);
    }).catch(() => {});
}

function fadeOutAudio(audio, duration = 800) {
    clearInterval(fadeInterval);
    const intervalTime = 30;
    const step = audio.volume / (duration / intervalTime);

    fadeInterval = setInterval(() => {
        if (audio.volume - step > 0) {
            audio.volume -= step;
        } else {
            audio.volume = 0;
            audio.pause();
            const bgPulse = document.getElementById("bg-pulse");
            if (bgPulse) bgPulse.style.opacity = "0";
            clearInterval(fadeInterval);
        }
    }, intervalTime);
}

function alternarMusica() {
    const audio = document.getElementById("audio-fundo");
    const btn = document.getElementById("btn-musica");

    if (audio.paused) {
        if (!audio.src || audio.src === "") {
            audio.src = playlist[indiceMusicaAtual];
        }
        fadeInAudio(audio);
        btn.textContent = "🎵 Música: ON";
        btn.classList.add("tocando");
    } else {
        fadeOutAudio(audio);
        btn.textContent = "🔇 Música: OFF";
        btn.classList.remove("tocando");
    }
}

function ajustarVolume(novoVolume) {
    clearInterval(fadeInterval);
    const audio = document.getElementById("audio-fundo");
    audio.volume = parseFloat(novoVolume) / 100;
}

// QUANDO A MÚSICA TERMINAR: PASSA PARA A PRÓXIMA E LOOPA
const audioEl = document.getElementById("audio-fundo");
audioEl.addEventListener("ended", () => {
    indiceMusicaAtual = (indiceMusicaAtual + 1) % playlist.length; // Volta pro início se chegar ao fim
    carregarEProximaMusica();
});

// AUTOPLAY NO PRIMEIRA CLIQUE NA PÁGINA
document.addEventListener("click", function iniciarAudioNoClique() {
    const audio = document.getElementById("audio-fundo");
    const btn = document.getElementById("btn-musica");

    if (audio.paused) {
        audio.src = playlist[indiceMusicaAtual];
        fadeInAudio(audio);
        btn.textContent = "🎵 Música: ON";
        btn.classList.add("tocando");
    }

    document.removeEventListener("click", iniciarAudioNoClique);
}, { once: true });