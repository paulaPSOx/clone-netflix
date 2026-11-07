// =====================================================
// PAULAPSOXPLAYFLIX — INTERAÇÕES DA PÁGINA INICIAL
// FAQ acessível, animação de entrada e ano automático.
// =====================================================

"use strict";

const perguntasFAQ = [...document.querySelectorAll(".faq-question")];
const respostasFAQ = [...document.querySelectorAll(".faq-answer")];
const anoAtual = document.querySelector("#ano-atual");

// Fecha todas as respostas do FAQ.
function fecharFAQs() {
    perguntasFAQ.forEach((pergunta) => {
        pergunta.setAttribute("aria-expanded", "false");

        const icone = pergunta.querySelector("span");

        if (icone) {
            icone.textContent = "+";
        }
    });

    respostasFAQ.forEach((resposta) => {
        resposta.classList.remove("ativo");
        resposta.style.maxHeight = "0px";

        window.setTimeout(() => {
            if (!resposta.classList.contains("ativo")) {
                resposta.hidden = true;
            }
        }, 350);
    });
}

// Abre uma resposta por vez.
perguntasFAQ.forEach((pergunta) => {
    pergunta.addEventListener("click", () => {
        const idResposta = pergunta.getAttribute("aria-controls");
        const resposta = idResposta
            ? document.getElementById(idResposta)
            : pergunta.nextElementSibling;

        if (!resposta) {
            return;
        }

        const estavaAberta = pergunta.getAttribute("aria-expanded") === "true";

        fecharFAQs();

        if (!estavaAberta) {
            resposta.hidden = false;

            // Aguarda o navegador recalcular a altura para a transição funcionar.
            requestAnimationFrame(() => {
                resposta.classList.add("ativo");
                resposta.style.maxHeight = `${resposta.scrollHeight + 36}px`;
            });

            pergunta.setAttribute("aria-expanded", "true");

            // O ícone "+" é girado em 45° pelo CSS e vira "×".
            // (Antes o JS trocava para "×" e o CSS girava de novo,
            // então o ícone aberto voltava a parecer um "+".)
            const icone = pergunta.querySelector("span");

            if (icone) {
                icone.textContent = "+";
            }
        }
    });
});

// Escape fecha o FAQ aberto.
document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        fecharFAQs();
    }
});

// Anima os itens quando entram na área visível.
const itensFAQ = document.querySelectorAll(".faq-item");

if ("IntersectionObserver" in window) {
    const observadorFAQ = new IntersectionObserver((entradas, observador) => {
        entradas.forEach((entrada) => {
            if (entrada.isIntersecting) {
                entrada.target.classList.add("fade-in");
                observador.unobserve(entrada.target);
            }
        });
    }, {
        threshold: 0.15
    });

    itensFAQ.forEach((item) => observadorFAQ.observe(item));
} else {
    itensFAQ.forEach((item) => item.classList.add("fade-in"));
}

// Mantém o ano do rodapé atualizado.
if (anoAtual) {
    anoAtual.textContent = new Date().getFullYear();
}