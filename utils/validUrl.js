function normalizeAndValidateUrl(anotacao) {
    if (typeof anotacao !== 'string' || !anotacao.trim()) return null;

    try {
        const value = anotacao.trim();

        const url = value.match(/^https?:\/\//i)
            ? value
            : `https://${value}`;

        const parsed = new URL(url);

        // Apenas http ou https
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
            return null;
        }

        // Hostname precisa parecer um domínio real
        if (
            !parsed.hostname.includes('.') ||
            parsed.hostname.startsWith('.') ||
            parsed.hostname.endsWith('.')
        ) {
            return null;
        }

        return parsed.href;
    } catch {
        return null;
    }
}

module.exports = { normalizeAndValidateUrl };