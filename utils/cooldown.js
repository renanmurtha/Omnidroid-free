
const COOLDOWN_MARCAR = 60 * 1000;
const COOLDOWN_ANOTAR = 60 * 1000;
const COOLDOWN_REACT = 60 * 1000;
let ultimoUsoAnotar = 0;
let ultimoUsoMarcar = 0;
let ultimoUsoReact = 0;

function cooldownMarcar() {
    const agora = Date.now();
    if (agora - ultimoUsoMarcar < COOLDOWN_MARCAR) {
        return false;
    }
    ultimoUsoMarcar = agora;
    return true;
}


function cooldownAnotar() {
    const agora = Date.now();
    if (agora - ultimoUsoAnotar < COOLDOWN_ANOTAR) {
        return false;

    } ultimoUsoAnotar = agora;
    return true;
}


function cooldownReact() {
    const agora = Date.now();
    if (agora - ultimoUsoReact < COOLDOWN_REACT) {
        return false; // ainda em cooldown
    }
    ultimoUsoReact = agora;
    return true; // liberado
}

module.exports = { cooldownMarcar, cooldownAnotar, cooldownReact };