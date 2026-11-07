// =====================================================
// PAULAPSOXFLIX — INTERAÇÕES DO CATÁLOGO
// Mantém vídeos, som, modal, avatares e navegação.
// Adiciona escolha manual de trailers e indicadores.
// =====================================================

"use strict";

// -----------------------------------------------------
// 1. Seletores
// -----------------------------------------------------

const videos = [...document.querySelectorAll(".video")];

const botaoSom = document.querySelector(".botao-som");
const botaoInfo = document.querySelector(".link-info");
const botaoAssistir = document.querySelector(".link-assistir");

const modal = document.querySelector(".modal");
const botaoFechar = document.querySelector(".fechar-modal");
const botaoContinuar = document.querySelector(".modal-ok");

const avatarContainer = document.querySelector(".avatar-container");
const avatarTrigger = document.querySelector(".avatar-trigger");
const avatarDropdown = document.querySelector(".avatar-dropdown");
const avatarTopo = document.querySelector(".avatar");
const opcoesAvatar = [...document.querySelectorAll(".avatar-opcao")];
const btnSair = document.querySelector(".btn-sair");

const linha = document.querySelector(".linha-filmes");
const btnLeft = document.querySelector(".scroll-btn.left");
const btnRight = document.querySelector(".scroll-btn.right");

const audio = document.querySelector(".audio");
const anoAtual = document.querySelector("#ano-atual");

const tituloDestaque = document.querySelector(".capa-titulo");
const descricaoDestaque = document.querySelector(".capa-descricao");

// Indicadores dos trailers.
const indicadoresDestaque = [
    ...document.querySelectorAll(".indicador-destaque")
];

// Botões de escolha de trailer no modal.
const botoesTrailerModal = [
    ...document.querySelectorAll("[data-trailer-index]")
];

const areaTrailers = document.querySelector(".modal-trailers");

// Informações correspondentes à ordem dos vídeos no HTML.
const informacoesDestaque = [
    {
        titulo: "Stranger Things",
        descricao: "Uma série de ficção científica e mistério. Em Hawkins, acontecimentos inexplicáveis mudam a vida de um grupo de amigos.",
        genero: "Ficção científica, drama",
        ano: "2016"
    },
    {
        titulo: "Squid Game",
        descricao: "Centenas de participantes endividados são convidados a competir em jogos misteriosos por um prêmio milionário. Mas perder pode custar a própria vida.",
        genero: "Suspense, drama",
        ano: "2021"
    }
];

// -----------------------------------------------------
// 2. Estado da aplicação
// -----------------------------------------------------

let videoAtual = 0;
let somAtivo = false;
let modalAberto = false;
let elementoAnterior = null;
let quadroCarrossel = null;
let ultimoTempoCarrossel = 0;
let pausaManualAte = 0;
let posicaoCarrossel = 0;

const movimentoReduzido = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
).matches;

// -----------------------------------------------------
// 3. Atualização dos indicadores
// -----------------------------------------------------

function atualizarIndicadores(index) {
    indicadoresDestaque.forEach((indicador, indicadorIndex) => {
        const ativo = indicadorIndex === index;

        indicador.classList.toggle("ativo", ativo);

        indicador.setAttribute(
            "aria-current",
            ativo ? "true" : "false"
        );

        indicador.style.removeProperty("--progresso");
    });

    atualizarProgressoIndicador(index);
}

// Preenche a barra de progresso do indicador do trailer em exibição.
function atualizarProgressoIndicador(index) {
    const video = videos[index];
    const indicador = indicadoresDestaque[index];

    if (!video || !indicador || !video.duration) {
        return;
    }

    const porcentagem = (video.currentTime / video.duration) * 100;

    indicador.style.setProperty("--progresso", `${porcentagem}%`);
}

// -----------------------------------------------------
// 4. Atualização dos botões de trailer
// -----------------------------------------------------

function atualizarBotoesTrailer() {
    botoesTrailerModal.forEach((botao) => {
        const indice = Number(botao.dataset.trailerIndex);

        const selecionado = indice === videoAtual;

        botao.classList.toggle("selecionado", selecionado);

        botao.setAttribute(
            "aria-pressed",
            String(selecionado)
        );
    });
}

// -----------------------------------------------------
// 5. Atualiza título, descrição e indicador do destaque
// -----------------------------------------------------

function atualizarDestaque(index) {
    const informacoes = informacoesDestaque[index];

    if (!informacoes) {
        return;
    }

    if (tituloDestaque) {
        tituloDestaque.textContent = informacoes.titulo;
    }

    if (descricaoDestaque) {
        descricaoDestaque.textContent = informacoes.descricao;
    }

    // Atualiza os indicadores conforme o vídeo atual.
    atualizarIndicadores(index);

    // Atualiza a seleção visual dos botões do modal.
    atualizarBotoesTrailer();
}

// -----------------------------------------------------
// 6. Vídeos do destaque
// -----------------------------------------------------

function tocarVideoAtual() {
    const video = videos[videoAtual];

    if (!video || document.hidden) {
        return;
    }

    const tentativa = video.play();

    if (tentativa && typeof tentativa.catch === "function") {
        tentativa.catch(() => {
            // O navegador pode bloquear reprodução automática.
            // Os botões continuam disponíveis para interação.
        });
    }
}

// Inicia os vídeos e configura o primeiro destaque.
function iniciarVideos() {
    if (!videos.length) {
        return;
    }

    videos.forEach((video, index) => {
        video.muted = true;
        video.loop = false;
        video.hidden = index !== 0;
        video.pause();
    });

    videoAtual = 0;

    videos[videoAtual].currentTime = 0;

    atualizarDestaque(videoAtual);

    tocarVideoAtual();
}

// Quando um vídeo termina, passa automaticamente para o próximo.
videos.forEach((video, index) => {
    video.addEventListener("ended", () => {
        video.pause();
        video.hidden = true;

        // Alterna entre Stranger Things e Squid Game.
        videoAtual = (index + 1) % videos.length;

        const proximoVideo = videos[videoAtual];

        proximoVideo.currentTime = 0;
        proximoVideo.hidden = false;
        proximoVideo.muted = !somAtivo;

        // Atualiza título, descrição e indicador.
        atualizarDestaque(videoAtual);

        tocarVideoAtual();
    });
});

// Sincroniza título e indicador sempre que um trailer começa a tocar
// e acompanha o progresso no indicador ativo.
videos.forEach((video, index) => {
    video.addEventListener("play", () => {
        videoAtual = index;
        atualizarDestaque(index);
    });

    video.addEventListener("timeupdate", () => {
        if (index === videoAtual) {
            atualizarProgressoIndicador(index);
        }
    });
});

// -----------------------------------------------------
// 7. Controle de som
// -----------------------------------------------------

if (botaoSom) {
    botaoSom.addEventListener("click", () => {
        somAtivo = !somAtivo;

        videos.forEach((video) => {
            video.muted = !somAtivo;
        });

        botaoSom.textContent = somAtivo ? "🔊" : "🔇";

        botaoSom.setAttribute(
            "aria-pressed",
            String(somAtivo)
        );

        botaoSom.setAttribute(
            "aria-label",
            somAtivo ? "Desativar som" : "Ativar som"
        );
    });
}

// -----------------------------------------------------
// 8. Botão Assistir trailer
// -----------------------------------------------------

if (botaoAssistir) {
    botaoAssistir.addEventListener("click", () => {
        const video = videos[videoAtual];

        if (!video) {
            return;
        }

        video.currentTime = 0;

        tocarVideoAtual();
    });
}

// -----------------------------------------------------
// 9. Seleção manual dos trailers
// -----------------------------------------------------

function selecionarTrailer(index) {
    const novoVideo = videos[index];

    if (!novoVideo || !informacoesDestaque[index]) {
        return;
    }

    // Pausa e esconde os outros vídeos.
    videos.forEach((video, videoIndex) => {
        if (videoIndex !== index) {
            video.pause();
            video.hidden = true;
        }
    });

    // Atualiza o vídeo selecionado.
    videoAtual = index;

    novoVideo.hidden = false;
    novoVideo.currentTime = 0;
    novoVideo.muted = !somAtivo;

    // Atualiza título, descrição e indicador.
    atualizarDestaque(videoAtual);

    // Atualiza a seleção visual no modal.
    atualizarBotoesTrailer();

    // Fecha o modal e inicia o trailer escolhido.
    fecharModal();

    tocarVideoAtual();
}

// Eventos dos botões de escolha de trailer.
botoesTrailerModal.forEach((botao) => {
    botao.addEventListener("click", () => {
        const indice = Number(botao.dataset.trailerIndex);

        selecionarTrailer(indice);
    });
});

// Indicadores clicáveis: trocam de trailer por clique ou teclado.
indicadoresDestaque.forEach((indicador, index) => {
    indicador.addEventListener("click", () => {
        if (index !== videoAtual) {
            selecionarTrailer(index);
        }
    });

    indicador.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();

            if (index !== videoAtual) {
                selecionarTrailer(index);
            }
        }
    });
});

// -----------------------------------------------------
// 10. Modal de informações
// -----------------------------------------------------

function preencherModal({ titulo, genero, ano, descricao }) {
    const tituloEl = document.querySelector("#modal-titulo");
    const generoEl = document.querySelector("#modal-genero");
    const anoEl = document.querySelector("#modal-ano");
    const descricaoEl = document.querySelector("#modal-descricao");

    if (tituloEl) tituloEl.textContent = titulo;
    if (generoEl) generoEl.textContent = genero;
    if (anoEl) anoEl.textContent = ano;
    if (descricaoEl) descricaoEl.textContent = descricao;
}

function abrirModal(card = null) {
    if (!modal) {
        return;
    }

    const veioDoCard = Boolean(card);
    const legendaModal = document.querySelector("#modal-legenda");
    const tituloTrailers = document.querySelector("#modal-trailers-titulo");
    const opcoesTrailers = document.querySelector(".modal-trailers-opcoes");

    let indiceTrailerDoTitulo = -1;

    if (veioDoCard) {
        // DETALHES DO TÍTULO: dados do card clicado.
        const dados = {
            titulo: card.dataset.titulo || "Detalhes do título",
            genero: card.dataset.genero || "Não informado",
            ano: card.dataset.ano || "Não informado",
            descricao: card.dataset.descricao || "Informações não disponíveis."
        };

        preencherModal(dados);

        // Só Stranger Things e Squid Game têm trailer.
        indiceTrailerDoTitulo = informacoesDestaque.findIndex(
            (item) => item.titulo === dados.titulo
        );

        if (legendaModal) {
            legendaModal.textContent = "DETALHES DO TÍTULO";
        }

        if (tituloTrailers) {
            tituloTrailers.textContent = "Assistir ao trailer";
        }

        // Mostra apenas o trailer do próprio título.
        botoesTrailerModal.forEach((botao) => {
            botao.hidden =
                Number(botao.dataset.trailerIndex) !== indiceTrailerDoTitulo;
        });

        if (opcoesTrailers) {
            opcoesTrailers.classList.add("unico");
        }

        if (areaTrailers) {
            areaTrailers.hidden = indiceTrailerDoTitulo === -1;
        }

    } else {
        // MAIS INFORMAÇÕES: dados do destaque atual + escolha entre os dois trailers.
        const informacoes = informacoesDestaque[videoAtual];

        if (informacoes) {
            preencherModal(informacoes);
        }

        if (legendaModal) {
            legendaModal.textContent = "EM DESTAQUE AGORA";
        }

        if (tituloTrailers) {
            tituloTrailers.textContent = "Escolha o trailer que deseja assistir";
        }

        botoesTrailerModal.forEach((botao) => {
            botao.hidden = false;
        });

        if (opcoesTrailers) {
            opcoesTrailers.classList.remove("unico");
        }

        if (areaTrailers) {
            areaTrailers.hidden = false;
        }
    }

    atualizarBotoesTrailer();

    // Pausa o trailer enquanto o modal está aberto.
    // fecharModal() retoma o vídeo atual.
    if (videos[videoAtual]) {
        videos[videoAtual].pause();
    }

    elementoAnterior = document.activeElement;

    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");

    requestAnimationFrame(() => {
        modal.classList.add("ativo");
    });

    modalAberto = true;

    // Impede a rolagem da página enquanto o modal estiver aberto.
    document.body.style.overflow = "hidden";

    if (botaoFechar) {
        botaoFechar.focus();
    }
}

function fecharModal() {
    if (!modal || modal.hidden) {
        return;
    }

    modal.classList.remove("ativo");

    modal.setAttribute("aria-hidden", "true");

    modalAberto = false;

    document.body.style.overflow = "";

    window.setTimeout(() => {
        if (!modal.classList.contains("ativo")) {
            modal.hidden = true;
        }
    }, 260);

    // Continua com o vídeo atualmente selecionado.
    tocarVideoAtual();

    // Retorna o foco ao elemento que abriu o modal.
    if (
        elementoAnterior &&
        typeof elementoAnterior.focus === "function"
    ) {
        elementoAnterior.focus();
    }
}

// Botão Mais informações.
if (botaoInfo) {
    botaoInfo.addEventListener("click", () => {
        abrirModal();
    });
}

// Botão fechar.
if (botaoFechar) {
    botaoFechar.addEventListener("click", fecharModal);
}

// Botão continuar explorando.
if (botaoContinuar) {
    botaoContinuar.addEventListener("click", fecharModal);
}

// Fecha ao clicar fora do conteúdo do modal.
if (modal) {
    modal.addEventListener("click", (event) => {
        if (event.target === modal) {
            fecharModal();
        }
    });
}

// Delegação de eventos para os cards do catálogo.
if (linha) {
    linha.addEventListener("click", (event) => {
        const card = event.target.closest(".card-titulo");

        if (card) {
            abrirModal(card);
        }
    });
}

// -----------------------------------------------------
// 11. Acessibilidade do modal e atalhos
// -----------------------------------------------------

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        fecharModal();
        fecharAvatarMenu();
    }

    if (
        event.key === "Tab" &&
        modal &&
        !modal.hidden &&
        modalAberto
    ) {
        // Ignora elementos escondidos (ex.: botões de trailer ocultos).
        const elementosFocaveis = [
            ...modal.querySelectorAll(
                'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
            )
        ].filter((el) => !el.hidden && el.offsetParent !== null);

        if (!elementosFocaveis.length) {
            return;
        }

        const primeiro = elementosFocaveis[0];
        const ultimo = elementosFocaveis[elementosFocaveis.length - 1];

        if (
            event.shiftKey &&
            document.activeElement === primeiro
        ) {
            event.preventDefault();
            ultimo.focus();

        } else if (
            !event.shiftKey &&
            document.activeElement === ultimo
        ) {
            event.preventDefault();
            primeiro.focus();
        }
    }
});

// -----------------------------------------------------
// 12. Menu de avatar e persistência no localStorage
// -----------------------------------------------------

function fecharAvatarMenu() {
    if (!avatarContainer || !avatarDropdown || !avatarTrigger) {
        return;
    }

    avatarContainer.classList.remove("ativo");

    avatarDropdown.hidden = true;

    avatarTrigger.setAttribute("aria-expanded", "false");
}

function alternarAvatarMenu() {
    if (!avatarContainer || !avatarDropdown || !avatarTrigger) {
        return;
    }

    const deveAbrir = avatarDropdown.hidden;

    avatarDropdown.hidden = !deveAbrir;

    avatarContainer.classList.toggle("ativo", deveAbrir);

    avatarTrigger.setAttribute(
        "aria-expanded",
        String(deveAbrir)
    );
}

if (avatarTrigger) {
    avatarTrigger.addEventListener("click", alternarAvatarMenu);
}

// Fecha o menu ao clicar fora.
document.addEventListener("click", (event) => {
    if (
        avatarContainer &&
        !avatarContainer.contains(event.target)
    ) {
        fecharAvatarMenu();
    }
});

// Carrega o avatar salvo.
function carregarAvatarSalvo() {
    if (!avatarTopo) {
        return;
    }

    try {
        const avatarSalvo = localStorage.getItem("avatar");

        if (!avatarSalvo) {
            return;
        }

        avatarTopo.src = avatarSalvo;

        opcoesAvatar.forEach((opcao) => {
            const imagem = opcao.querySelector("img");

            if (imagem && imagem.src === avatarSalvo) {
                opcao.classList.add("selecionado");
            }
        });

    } catch (erro) {
        console.warn(
            "Não foi possível carregar o avatar salvo.",
            erro
        );
    }
}

// Seleção de avatar.
opcoesAvatar.forEach((opcao) => {
    opcao.addEventListener("click", () => {
        const imagem = opcao.querySelector("img");

        if (!imagem || !avatarTopo) {
            return;
        }

        avatarTopo.src = imagem.src;

        opcoesAvatar.forEach((item) => {
            item.classList.remove("selecionado");
        });

        opcao.classList.add("selecionado");

        try {
            localStorage.setItem("avatar", imagem.src);

        } catch (erro) {
            console.warn(
                "Não foi possível salvar o avatar.",
                erro
            );
        }

        fecharAvatarMenu();
    });
});

// Botão voltar ao início.
if (btnSair) {
    btnSair.addEventListener("click", () => {
        try {
            localStorage.removeItem("avatar");

        } catch (erro) {
            console.warn(
                "Não foi possível remover o avatar salvo.",
                erro
            );
        }

        window.location.href = "./index.html";
    });
}

// -----------------------------------------------------
// 13. Carrossel contínuo e controles manuais
// -----------------------------------------------------

function prepararCarrossel() {
    if (!linha || movimentoReduzido) {
        return;
    }

    const cardsOriginais = [
        ...linha.querySelectorAll(".card-titulo")
    ];

    if (cardsOriginais.length < 2) {
        return;
    }

    // Duplica os cards para criar uma faixa contínua.
    cardsOriginais.forEach((card) => {
        const clone = card.cloneNode(true);

        clone.setAttribute("aria-hidden", "true");
        clone.setAttribute("tabindex", "-1");

        clone.querySelectorAll("button, a").forEach((elemento) => {
            elemento.setAttribute("tabindex", "-1");
        });

        linha.appendChild(clone);
    });

    iniciarMovimentoCarrossel();
}

function iniciarMovimentoCarrossel() {
    if (!linha || movimentoReduzido) {
        return;
    }

    cancelarMovimentoCarrossel();

    // O CSS usa scroll-behavior: smooth, o que "engole" os passos
    // pequenos do movimento automático. Aqui o movimento é direto;
    // os botões das setas continuam suaves (behavior: "smooth").
    linha.style.scrollBehavior = "auto";

    posicaoCarrossel = linha.scrollLeft;

    ultimoTempoCarrossel = 0;

    const velocidade = 24;

    function animarCarrossel(tempoAtual) {
        if (!linha) {
            return;
        }

        if (!ultimoTempoCarrossel) {
            ultimoTempoCarrossel = tempoAtual;
        }

        const intervalo = Math.min(
            (tempoAtual - ultimoTempoCarrossel) / 1000,
            0.05
        );

        ultimoTempoCarrossel = tempoAtual;

        const mouseSobreCarrossel = linha.matches(":hover");

        const focoNoCarrossel = linha.contains(
            document.activeElement
        );

        const usuarioInteragindo = Date.now() < pausaManualAte;

        if (
            !document.hidden &&
            !modalAberto &&
            !mouseSobreCarrossel &&
            !focoNoCarrossel &&
            !usuarioInteragindo
        ) {
            const metadeDaFaixa = linha.scrollWidth / 2;

            // Se o usuário rolou manualmente, acompanha a posição real.
            if (Math.abs(linha.scrollLeft - posicaoCarrossel) > 2) {
                posicaoCarrossel = linha.scrollLeft;
            }

            // Acumula em número decimal: o scrollLeft pode arredondar
            // passos menores que 1px e o carrossel ficaria parado.
            posicaoCarrossel += velocidade * intervalo;

            if (
                metadeDaFaixa > 0 &&
                posicaoCarrossel >= metadeDaFaixa
            ) {
                posicaoCarrossel -= metadeDaFaixa;
            }

            linha.scrollLeft = posicaoCarrossel;
        }

        quadroCarrossel = requestAnimationFrame(animarCarrossel);
    }

    quadroCarrossel = requestAnimationFrame(animarCarrossel);
}

function cancelarMovimentoCarrossel() {
    if (quadroCarrossel) {
        cancelAnimationFrame(quadroCarrossel);

        quadroCarrossel = null;
    }
}

function pausarCarrosselTemporariamente() {
    pausaManualAte = Date.now() + 2200;
}

function rolarCarrossel(direcao) {
    if (!linha) {
        return;
    }

    pausarCarrosselTemporariamente();

    const distancia = Math.max(
        240,
        linha.clientWidth * 0.78
    );

    linha.scrollBy({
        left: distancia * direcao,
        behavior: movimentoReduzido ? "auto" : "smooth"
    });
}

if (btnLeft) {
    btnLeft.addEventListener("click", () => {
        rolarCarrossel(-1);
    });
}

if (btnRight) {
    btnRight.addEventListener("click", () => {
        rolarCarrossel(1);
    });
}

if (linha) {
    linha.addEventListener(
        "pointerdown",
        pausarCarrosselTemporariamente
    );

    linha.addEventListener(
        "touchstart",
        pausarCarrosselTemporariamente,
        { passive: true }
    );

    linha.addEventListener(
        "wheel",
        pausarCarrosselTemporariamente,
        { passive: true }
    );

    linha.addEventListener(
        "keydown",
        pausarCarrosselTemporariamente
    );
}

// -----------------------------------------------------
// 14. Áudio e visibilidade da página
// -----------------------------------------------------

function pausarMidia() {
    videos.forEach((video) => {
        video.pause();
    });

    if (audio) {
        audio.pause();
    }
}

document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        pausarMidia();

    } else {
        tocarVideoAtual();
    }
});

// -----------------------------------------------------
// 15. Rodapé
// -----------------------------------------------------

if (anoAtual) {
    anoAtual.textContent = new Date().getFullYear();
}

// -----------------------------------------------------
// 16. Inicialização
// -----------------------------------------------------

function iniciarCatalogo() {
    iniciarVideos();

    carregarAvatarSalvo();

    prepararCarrossel();
}

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        iniciarCatalogo,
        { once: true }
    );

} else {
    iniciarCatalogo();
}