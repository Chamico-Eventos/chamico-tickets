// ═══════════════════════════════════════════════════════════════
//  El Chamico · Catálogo de eventos
//  ─────────────────────────────────────────────────────────────
//  ESTE ES EL ÚNICO ARCHIVO QUE HAY QUE TOCAR PARA AGREGAR UN EVENTO.
//
//  Para agregar uno nuevo:
//    1. Subí las 2 imágenes a  assets/events/
//    2. Copiá un bloque de EVENTS de abajo y editá los valores
//    3. Listo — el venue, el alias, el WhatsApp y la URL del sheet
//       se completan solos desde VENUES / DEFAULTS.
// ═══════════════════════════════════════════════════════════════


// ── VENUES ─────────────────────────────────────────────────────
// Agregar un venue nuevo = agregar una entrada acá.
const VENUES = {
  'Galpón Chamico': {
    city:       'San Antonio de Areco',
    mapsLink:   'https://maps.app.goo.gl/H5viHN4ZsEAJGFtv9',
    logo:       'assets/venue-chamico.png',
    maxTickets: 350,                       // capacidad del venue
  },
};


// ── VALORES POR DEFECTO ────────────────────────────────────────
// Se aplican a todos los eventos salvo que el evento los pise.
const DEFAULTS = {
  mpAlias:  'tomyaraguz.mp',
  whatsapp: '542326421909',
  sheetUrl: 'https://script.google.com/macros/s/AKfycbxVWEywmYVj59mvdUYhkxhZJOwNxvj5rWZUOtqbi8uCLj3kQiVFRiG5BqunH0zSnO4/exec',
};


// ── EVENTOS ────────────────────────────────────────────────────
const EVENTS = withDefaults([

  {
    id:          'gato-abuela-031026',
    name:        'El Gato de la Abuela & José Luis Arriola',
    venue:       'Galpón Chamico',
    date:        '2026-10-03',                        // YYYY-MM-DD
    dateDisplay: 'Viernes 3 de Octubre · 23:00 hs',
    price:       15000,                               // por entrada
    images: [
      'assets/events/gato-abuela-031026-a.jpg',
      'assets/events/gato-abuela-031026-b.jpg',
    ],
    imageLeftContain: true,   // la imagen izquierda se muestra entera, sin recortar
  },

  {
    id:          'alambre-mental-311026',
    name:        'Alambre Gonzáles & Mental Delta',
    venue:       'Galpón Chamico',
    date:        '2026-10-31',
    dateDisplay: 'Sábado 31 de Octubre · 20:30 hs (Puntual)',
    price:       25000,
    images: [
      'assets/events/alambre-mental-311026-a.jpg',
      'assets/events/alambre-mental-311026-b.jpg',
    ],
  },

]);


// ── PLOMERÍA ───────────────────────────────────────────────────
// Mezcla cada evento con su venue y con DEFAULTS, y deriva las
// dos representaciones de la fecha desde el campo `date`, así no
// pueden quedar desincronizadas.
function withDefaults(list) {
  return list.map(function(ev) {
    var v = VENUES[ev.venue] || {};

    // 'YYYY-MM-DD' parseado a mano: new Date('2026-10-03') es UTC y en
    // Argentina (UTC-3) se corre un día para atrás.
    var p  = ev.date.split('-');
    var d  = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));

    return Object.assign({}, DEFAULTS, {
      city:       v.city,
      mapsLink:   v.mapsLink,
      venueLogo:  v.logo,
      maxTickets: v.maxTickets,
    }, ev, {
      dateSort:      d,
      dateFormatted: p[1] + '/' + p[2] + '/' + p[0],   // mm/dd/yyyy para el sheet
    });
  });
}
