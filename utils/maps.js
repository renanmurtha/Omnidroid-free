// utils/maps.js
async function getLatLng(city) {
    if (!city) return null;

    const nominatim = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`;
    const res = await fetch(nominatim, {
        headers: { 'User-Agent': 'SeuApp/1.0 (seuemail@exemplo.com)' }
    });
    if (!res.ok) return null;

    const data = await res.json();
    if (!data || !data[0]) return null;

    let lat = Number(data[0].lat);
    let lon = Number(data[0].lon);
    if (Number.isNaN(lat) || Number.isNaN(lon)) return null;

    // mantém sinal vindo do Nominatim e evita "--"
    const latStr = lat.toFixed(6);
    const lonStr = lon.toFixed(6);
    const zoom = 11;

    const rawParams = `${latStr},${lonStr},${zoom},i:pressure`;
    const encodedParams = encodeURIComponent(rawParams);
    const clickableUrl = `https://www.windy.com/?${encodedParams}`;
    return clickableUrl;
}

module.exports = { getLatLng };
