function sanitizeCity(city) {
  if (!city) return city;
  const s = city.toLowerCase();
  return s
    .split(/([\s\-'])/)          // mantém separadores no array
    .map(part => part.length === 0 ? part : part[0].toUpperCase() + part.slice(1))
    .join('');
}

function sanitizeUsername(name) {
  return name?.replace(/^@/, '');
}

module.exports = { sanitizeCity, sanitizeUsername };