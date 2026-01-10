// utils/time.js

function minutesToMs(minutes) {
    return minutes * 60000;
}

function formatRemainingTime(remainingMs) {
    const days = Math.floor(remainingMs / (24 * 60 * 60 * 1000));
    const hours = Math.floor((remainingMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000));

    const timeParts = [];
    if (days > 0) timeParts.push(`${days} dia${days > 1 ? 's' : ''}`);
    if (hours > 0) timeParts.push(`${hours}h`);
    if (minutes > 0) timeParts.push(`${minutes}m`);

    return timeParts.length > 0 ? timeParts.join(' ') : 'menos de 1 minuto';
}

function formatDateTime(value) {
    const date = value instanceof Date ? value : new Date(value);

    return date.toLocaleString('pt-BR', {
        hour12: false,
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

 const formatDuration = (seconds) => {
        const totalMinutes = Math.floor(seconds / 60);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return `${hours}h ${minutes}min`;
    };

module.exports = { minutesToMs, formatRemainingTime, formatDateTime, formatDuration };