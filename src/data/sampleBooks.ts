// Helper to create crisp SVG book cover data URLs for instant testing
function createCoverDataUrl(
  title: string,
  author: string,
  editorial: string,
  year: string,
  isbn: string,
  bgColor: string,
  accentColor: string,
  spineStyle = false
): string {
  const width = spineStyle ? 260 : 400;
  const height = spineStyle ? 600 : 580;

  const svg = spineStyle
    ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
        <defs>
          <linearGradient id="spineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#111" stop-opacity="0.6"/>
            <stop offset="15%" stop-color="#fff" stop-opacity="0.1"/>
            <stop offset="85%" stop-color="#000" stop-opacity="0.1"/>
            <stop offset="100%" stop-color="#000" stop-opacity="0.7"/>
          </linearGradient>
        </defs>
        <rect width="${width}" height="${height}" fill="${bgColor}"/>
        <rect width="${width}" height="${height}" fill="url(#spineGrad)"/>
        
        <!-- Top Editorial Logo / Text -->
        <text x="130" y="60" font-family="sans-serif" font-weight="700" font-size="14" fill="${accentColor}" text-anchor="middle" letter-spacing="3">${editorial.toUpperCase()}</text>
        <line x1="40" y1="80" x2="220" y2="80" stroke="${accentColor}" stroke-opacity="0.4" stroke-width="1.5" />

        <!-- Vertical Spine Content -->
        <g transform="translate(130, 290) rotate(90)">
          <text x="0" y="-14" font-family="Georgia, serif" font-weight="bold" font-size="24" fill="#ffffff" text-anchor="middle" letter-spacing="1">${title}</text>
          <text x="0" y="16" font-family="sans-serif" font-weight="600" font-size="15" fill="${accentColor}" text-anchor="middle" letter-spacing="2">${author}</text>
        </g>

        <!-- Bottom barcode & year -->
        <line x1="40" y1="480" x2="220" y2="480" stroke="${accentColor}" stroke-opacity="0.4" stroke-width="1.5" />
        <text x="130" y="510" font-family="sans-serif" font-size="12" fill="#aaa" text-anchor="middle">AÑO ${year}</text>
        <text x="130" y="535" font-family="monospace" font-size="13" font-weight="bold" fill="#ffffff" text-anchor="middle">ISBN ${isbn}</text>
      </svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
        <defs>
          <linearGradient id="coverShade" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.08"/>
            <stop offset="100%" stop-color="#000000" stop-opacity="0.4"/>
          </linearGradient>
        </defs>
        <rect width="${width}" height="${height}" fill="${bgColor}" rx="6"/>
        <rect width="${width}" height="${height}" fill="url(#coverShade)" rx="6"/>
        
        <!-- Book spine illusion line -->
        <line x1="28" y1="0" x2="28" y2="${height}" stroke="#000000" stroke-opacity="0.35" stroke-width="6"/>
        <line x1="31" y1="0" x2="31" y2="${height}" stroke="#ffffff" stroke-opacity="0.15" stroke-width="2"/>

        <!-- Header / Editorial banner -->
        <g transform="translate(48, 55)">
          <text x="0" y="0" font-family="sans-serif" font-size="13" font-weight="700" letter-spacing="4" fill="${accentColor}">${editorial.toUpperCase()}</text>
          <line x1="0" y1="12" x2="300" y2="12" stroke="${accentColor}" stroke-opacity="0.5" stroke-width="1.5" />
        </g>

        <!-- Main Title and Author -->
        <g transform="translate(48, 170)">
          <text x="0" y="0" font-family="Georgia, serif" font-size="34" font-weight="700" fill="#f8fafc" letter-spacing="-0.5">
            ${title}
          </text>
          <text x="0" y="44" font-family="sans-serif" font-size="20" font-weight="500" fill="${accentColor}" letter-spacing="1">
            ${author}
          </text>
        </g>

        <!-- Decorative graphic elements -->
        <circle cx="200" cy="340" r="44" stroke="${accentColor}" stroke-opacity="0.35" stroke-width="2" fill="none"/>
        <circle cx="200" cy="340" r="30" stroke="${accentColor}" stroke-opacity="0.5" stroke-width="1.5" fill="none"/>
        <polygon points="200,320 215,350 185,350" fill="${accentColor}" fill-opacity="0.25"/>

        <!-- Footer / ISBN Barcode zone -->
        <g transform="translate(48, 470)">
          <rect x="0" y="0" width="304" height="60" fill="#ffffff" rx="4"/>
          <!-- Simulated barcode bars -->
          <g fill="#111" transform="translate(18, 8)">
            <rect x="0" y="0" width="3" height="32"/>
            <rect x="6" y="0" width="1.5" height="32"/>
            <rect x="10" y="0" width="4.5" height="32"/>
            <rect x="18" y="0" width="1.5" height="32"/>
            <rect x="23" y="0" width="3" height="32"/>
            <rect x="29" y="0" width="6" height="32"/>
            <rect x="38" y="0" width="2" height="32"/>
            <rect x="44" y="0" width="4" height="32"/>
            <rect x="52" y="0" width="2" height="32"/>
            <rect x="58" y="0" width="5" height="32"/>
            <rect x="68" y="0" width="2" height="32"/>
            <rect x="73" y="0" width="3" height="32"/>
            <rect x="80" y="0" width="6" height="32"/>
            <rect x="90" y="0" width="2" height="32"/>
            <rect x="96" y="0" width="4" height="32"/>
            <rect x="104" y="0" width="1.5" height="32"/>
            <rect x="110" y="0" width="5" height="32"/>
            <rect x="120" y="0" width="3" height="32"/>
            <rect x="127" y="0" width="2" height="32"/>
            <rect x="133" y="0" width="6" height="32"/>
            <rect x="144" y="0" width="1.5" height="32"/>
            <rect x="150" y="0" width="4" height="32"/>
            <rect x="160" y="0" width="3" height="32"/>
            <rect x="168" y="0" width="5" height="32"/>
            <rect x="178" y="0" width="2" height="32"/>
            <rect x="185" y="0" width="4" height="32"/>
            <rect x="195" y="0" width="1.5" height="32"/>
            <rect x="202" y="0" width="4.5" height="32"/>
            <rect x="212" y="0" width="3" height="32"/>
            <rect x="220" y="0" width="5" height="32"/>
            <rect x="230" y="0" width="2" height="32"/>
            <rect x="238" y="0" width="4" height="32"/>
            <rect x="248" y="0" width="1.5" height="32"/>
            <rect x="254" y="0" width="6" height="32"/>
            <rect x="264" y="0" width="2" height="32"/>
          </g>
          <text x="152" y="52" font-family="monospace" font-size="12" font-weight="700" fill="#111827" text-anchor="middle">ISBN ${isbn}</text>
        </g>
      </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.trim())}`;
}

export interface SampleBook {
  id: string;
  name: string;
  typeLabel: string;
  authorHint: string;
  previewUrl: string;
  description: string;
}

export const SAMPLE_BOOKS: SampleBook[] = [
  {
    id: 'ficciones',
    name: 'Ficciones',
    typeLabel: 'Tapa Completa',
    authorHint: 'Jorge Luis Borges',
    previewUrl: createCoverDataUrl(
      'Ficciones',
      'Jorge Luis Borges',
      'Editorial Sur',
      '1944',
      '9789875666474',
      '#1e293b',
      '#38bdf8'
    ),
    description: 'Edición con título, autor, editorial Sur y código ISBN visible.',
  },
  {
    id: 'cien-anios',
    name: 'Cien años de soledad',
    typeLabel: 'Lomo de Libro',
    authorHint: 'G. García Márquez',
    previewUrl: createCoverDataUrl(
      'Cien Años de Soledad',
      'Gabriel García Márquez',
      'Sudamericana',
      '1967',
      '9788437604947',
      '#78350f',
      '#f59e0b',
      true
    ),
    description: 'Vista vertical de lomo de biblioteca con editorial y autor abreviado.',
  },
  {
    id: 'rayuela',
    name: 'Rayuela',
    typeLabel: 'Tapa Clásica',
    authorHint: 'Julio Cortázar',
    previewUrl: createCoverDataUrl(
      'Rayuela',
      'Julio Cortázar',
      'Editorial Sudamericana',
      '1963',
      '9788466331906',
      '#3f1225',
      '#f43f5e'
    ),
    description: 'Portada clásica de la obra cumbre del boom latinoamericano.',
  },
  {
    id: 'dune',
    name: 'Dune',
    typeLabel: 'Lomo de Ciencia Ficción',
    authorHint: 'Frank Herbert',
    previewUrl: createCoverDataUrl(
      'Dune',
      'Frank Herbert',
      'Debolsillo',
      '1965',
      '9788497596824',
      '#431407',
      '#fb923c',
      true
    ),
    description: 'Lomo de edición de bolsillo en idioma español con ISBN.',
  },
  {
    id: 'principito',
    name: 'El Principito',
    typeLabel: 'Tapa Ilustrada',
    authorHint: 'Antoine de Saint-Exupéry',
    previewUrl: createCoverDataUrl(
      'El Principito',
      'Antoine de Saint-Exupéry',
      'Salamandra',
      '1943',
      '9788498381498',
      '#0f2942',
      '#eab308'
    ),
    description: 'Portada clásica con sello editorial Salamandra y código de barras.',
  },
];
