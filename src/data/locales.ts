export interface LocalChiply {
  id: string;
  nombre: string;
  ciudad: string;
  direccion: string;
  telefono: string;
  /** Número para wa.me (formato internacional sin signos, ej: 5493755631664) */
  whatsapp: string;
  lat: number;
  lng: number;
  central?: boolean;
}

export const LOCALES_CHIPLY: LocalChiply[] = [
  {
    id: 'obera-central',
    nombre: 'Oberá - Casa Central',
    ciudad: 'Oberá',
    direccion: 'Apóstoles Sur 712',
    telefono: '3755-631664',
    whatsapp: '5493755631664',
    lat: -27.497335,
    lng: -55.1072754,
    central: true,
  },
  {
    id: 'obera-2',
    nombre: 'Oberá 2',
    ciudad: 'Oberá',
    direccion: 'Av. José Ingenieros 534',
    telefono: '3755-202286',
    whatsapp: '5493755202286',
    lat: -27.4797515,
    lng: -55.1228642,
  },
  {
    id: 'eldorado-1',
    nombre: 'Eldorado 1 (Km 5)',
    ciudad: 'Eldorado',
    direccion: 'Av. San Martín 111 (Km 5)',
    telefono: '3755-306448',
    whatsapp: '5493755306448',
    lat: -26.4038616,
    lng: -54.632007,
  },
  {
    id: 'eldorado-2',
    nombre: 'Eldorado 2 (Km 10)',
    ciudad: 'Eldorado',
    direccion: 'Av. San Martín 2685 (Km 10)',
    telefono: '3751-604349',
    whatsapp: '5493751604349',
    lat: -26.4041047,
    lng: -54.622918,
  },
  {
    id: 'puerto-rico',
    nombre: 'Puerto Rico',
    ciudad: 'Puerto Rico',
    direccion: 'Av. 9 de Julio 1215',
    telefono: '3751-221414',
    whatsapp: '5493751221414',
    lat: -26.8033716,
    lng: -55.0205471,
  },
  {
    id: 'montecarlo',
    nombre: 'Montecarlo',
    ciudad: 'Montecarlo',
    direccion: 'Av. Oscar Eugenio Darú y esq. Britzius',
    telefono: '3751-341957',
    whatsapp: '5493751341957',
    lat: -26.5674207,
    lng: -54.7590379,
  },
  {
    id: 'san-vicente',
    nombre: 'San Vicente',
    ciudad: 'San Vicente',
    direccion: 'Av. Tejeda 1081',
    telefono: '3755-412026',
    whatsapp: '5493755412026',
    lat: -26.993309,
    lng: -54.4837023,
  },
  {
    id: 'leandro-n-alem',
    nombre: 'Leandro N. Alem',
    ciudad: 'Leandro N. Alem',
    direccion: 'Av. Vélez Sarsfield 584',
    telefono: '3754-463800',
    whatsapp: '5493754463800',
    lat: -27.603636,
    lng: -55.3235338,
  },
  {
    id: 'bernardo-irigoyen',
    nombre: 'Bernardo de Irigoyen',
    ciudad: 'Bernardo de Irigoyen',
    direccion: 'Av. Soberanía Nacional 5',
    telefono: '3755-480446',
    whatsapp: '5493755480446',
    lat: -26.2528394,
    lng: -53.6486838,
  },
];

/** Lista única de ciudades ordenadas para los filtros */
export const CIUDADES_CON_LOCALES = [
  'Todas',
  'Oberá',
  'Eldorado',
  'Puerto Rico',
  'Montecarlo',
  'San Vicente',
  'Leandro N. Alem',
  'Bernardo de Irigoyen',
] as const;
