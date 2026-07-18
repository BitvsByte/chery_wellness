// Contenido de marca centralizado — un solo lugar para editar textos y datos.

export const CONTACT = {
  phone: '+34 600 000 000',
  email: 'cheryfigueroa.pro@gmail.com',
  instagram: '@cheryfigueroa_wellnesspro',
  tiktok: '@cheryfigueroa_pro',
}

export const CONTACT_LINKS = {
  whatsapp: `https://wa.me/${CONTACT.phone.replace(/[^0-9]/g, '')}`,
  mailto: `mailto:${CONTACT.email}`,
  instagram: `https://instagram.com/${CONTACT.instagram.replace('@', '')}`,
  tiktok: `https://tiktok.com/@${CONTACT.tiktok.replace('@', '')}`,
}

export const NAV_LINKS = [
  { href: '#inicio', label: 'Inicio' },
  { href: '#nosotras', label: 'Nosotras' },
  { href: '#servicios', label: 'Servicios' },
  { href: '#testimonios', label: 'Testimonios' },
  { href: '#galeria', label: 'Galería' },
  { href: '#contacto', label: 'Contacto' },
]

export const SERVICES = [
  {
    id: 'servicio-posing',
    img: '/uploads/chery_2.jpeg',
    imgAlt:
      'Chery Figueroa posando en la tarima del Miami Pro con bikini de competición azul',
    imgWidth: 1080,
    imgHeight: 1672,
    imgPos: '50% 12%',
    tag: 'Domina el escenario',
    title: 'Posing de Competición (Bikini Wellness)',
    desc: 'Técnica de pose frontal, transiciones y poses reglamentarias Wellness. Posing para Bikini y Wellness con Chery Figueroa, Atleta Internacional.',
    cta: 'Ver detalles',
  },
  {
    id: 'servicio-dietas',
    img: '/uploads/chery_4.jpeg',
    imgAlt:
      'Chery Figueroa en condición de competición durante el IFBB Pro League de Pittsburgh',
    imgWidth: 1080,
    imgHeight: 1718,
    imgPos: '50% 10%',
    tag: 'Nutrición de élite',
    title: 'Dietas & Puesta a Punto (Prep)',
    desc: 'Planes nutricionales específicos para cada etapa, definición extrema y puesta a punto de competición. Maximiza tus resultados.',
    cta: 'Aplicar',
  },
  {
    id: 'servicio-entrenos',
    img: '/uploads/chery_1.jpeg',
    imgAlt:
      'Pose de espalda de Chery Figueroa mostrando el desarrollo de glúteo y pierna de la línea Wellness',
    imgWidth: 1080,
    imgHeight: 1592,
    imgPos: '50% 40%',
    tag: 'Entreno de campeona',
    title: 'Entrenamientos de Altas Mejoras',
    desc: 'Planes de entrenamiento específicos para altas mejoras físicas, de principiante a atleta Wellness Pro. Transformación total.',
    cta: 'Ver detalles',
  },
]

export const EVENTS = [
  { date: 'SEP 2026', name: 'Campeonato de España IFBB' },
  { date: 'OCT 2026', name: 'Arnold Classic Europe · Sevilla' },
  { date: 'NOV 2026', name: 'IFBB Optimum Classic Pro' },
  { date: 'DIC 2026', name: 'Olympia Qualifier · Miami Pro' },
]

export const ABOUT = {
  heading: 'Nosotras',
  title: 'Nuestro Equipo / Filosofía',
  paragraphs: [
    'Chery Figueroa es atleta profesional de culturismo en la categoría Women’s Wellness y entrenadora personal. Originaria de Honduras y afincada en España, ha logrado múltiples títulos, incluyendo el campeonato absoluto de España y participaciones destacadas en eventos como el IFBB Optimum Classic Pro.',
    'Dedicación personalizada: asesorías de nutrición, planes de entrenamiento específicos y clases de posing para llevar a cada atleta de cero a la tarima, con el seguimiento cercano de un equipo de verdad — no una cuota mensual.',
  ],
  mainImg: '/uploads/chery_4.jpeg',
  mainImgAlt: 'Chery Figueroa, entrenadora y atleta profesional Wellness',
  teamImg: '/uploads/equipo_1.jpeg',
  teamImgAlt: 'Dos atletas del equipo CW practicando posing en el estudio',
}

export const TESTIMONIALS = [
  {
    initials: 'LM',
    name: 'Laura M.',
    role: 'De 0 a su primera tarima',
    quote:
      'Nunca había pisado un gimnasio en serio. Con Chery competí por primera vez y quedé top 5 regional.',
  },
  {
    initials: 'SR',
    name: 'Sara R.',
    role: 'Bikini → Wellness',
    quote:
      'Cambié de categoría con su prep y subí al podio en mi segundo campeonato.',
  },
  {
    initials: 'AG',
    name: 'Andrea G.',
    role: 'Campeonato de España',
    quote:
      'La puesta a punto fue milimétrica. Llegué al día D en mi mejor versión, sin ansiedad.',
  },
  {
    initials: 'CP',
    name: 'Carla P.',
    role: 'Clases de posing',
    quote:
      'En cuatro sesiones corrigió transiciones que llevaba un año haciendo mal. Subí tres puestos.',
  },
  {
    initials: 'MV',
    name: 'María V.',
    role: 'Mejora física sin competir',
    quote:
      'En 8 meses cambié mi composición corporal por completo entrenando 5 horas a la semana.',
  },
  {
    initials: 'NT',
    name: 'Nadia T.',
    role: 'De 0 a la tarima · 14 meses',
    quote:
      'Pasé de no saber posar a ganar mi debut en novatas. Equipo de verdad.',
  },
  {
    initials: 'PB',
    name: 'Paula B.',
    role: 'Prep completa',
    quote:
      'El seguimiento semanal con fotos y ajustes hizo que nunca me sintiera sola en la prep.',
  },
  {
    initials: 'IC',
    name: 'Inés C.',
    role: 'Primera competición',
    quote:
      'Chery cree en ti antes que tú misma. Mi debut fue exactamente como lo planificamos.',
  },
]

export const GALLERY = [
  {
    img: '/uploads/chery_2.jpeg',
    width: 1080,
    height: 1672,
    pos: '50% 15%',
    label: 'Miami Pro · Olympia Qualifier',
    alt: 'Chery Figueroa en pose frontal sobre la tarima del Miami Pro, Olympia Qualifier',
  },
  {
    img: '/uploads/chery_4.jpeg',
    width: 1080,
    height: 1718,
    pos: '50% 10%',
    label: 'Pittsburgh · IFBB Pro League',
    alt: 'Chery Figueroa compitiendo en el IFBB Pro League de Pittsburgh',
  },
  {
    img: '/uploads/chery_3.jpeg',
    width: 1080,
    height: 1714,
    pos: '50% 10%',
    label: 'Pittsburgh · Pose de espalda',
    alt: 'Pose de espalda de Chery Figueroa en competición, mostrando la línea Wellness',
  },
  {
    img: '/uploads/chery_1.jpeg',
    width: 1080,
    height: 1592,
    pos: '50% 35%',
    label: 'Línea Wellness · Glúteo-pierna',
    alt: 'Detalle del desarrollo de glúteo y pierna característico de la categoría Wellness',
  },
]

export const FAQS = [
  {
    q: '¿Necesito experiencia para empezar?',
    a: 'No. El método está pensado para llevarte de cero a competir. Empezamos con una evaluación de tu punto de partida y construimos base de entrenamiento, nutrición y posing por etapas.',
  },
  {
    q: '¿El coaching es online o presencial?',
    a: 'Ambos. Las asesorías de nutrición y entrenamiento funcionan 100% online con seguimiento semanal. Las clases de posing pueden ser presenciales en España u online por videollamada con corrección en directo.',
  },
  {
    q: '¿Cuánto dura una preparación completa?',
    a: 'Depende de tu punto de partida. Una primera competición suele requerir entre 8 y 14 meses: fase de mejora, fase de definición y puesta a punto. En la consulta inicial te damos una estimación honesta.',
  },
  {
    q: '¿Qué incluye el seguimiento?',
    a: 'Plan de entrenamiento y dieta personalizados, ajustes semanales con fotos y feedback, técnica de posing, planificación de temporada y acceso directo a Chery por WhatsApp.',
  },
  {
    q: '¿Y si no quiero competir?',
    a: 'También trabajamos mejora física sin tarima: recomposición corporal con el mismo nivel de exigencia y personalización que una prep de competición.',
  },
]

export const QUOTE = {
  img: '/uploads/chery_3.jpeg',
  alt: 'Chery Figueroa de espaldas en la tarima de competición',
  text: '“La tarima se gana meses antes, en cada detalle.”',
  author: 'Chery Figueroa',
}
