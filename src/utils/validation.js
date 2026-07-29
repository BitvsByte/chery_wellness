// Validación defensiva del formulario.
//
// Hoy no hay base de datos: el formulario solo abre WhatsApp o el cliente de
// correo. Aun así, cada campo se valida contra una LISTA BLANCA estricta
// (pattern HTML + revalidación en JS) para que, cuando exista un backend,
// ningún intento de inyección SQL/HTML llegue a salir del cliente. La defensa
// definitiva serán las consultas parametrizadas del servidor; esto es la
// primera capa.

import { TRAINING, POSING } from '../data/plans.js'

/**
 * Etiquetas de plan aceptadas. Se derivan de plans.js, así que un precio
 * nuevo aparece en el formulario sin tocar este fichero.
 */
export const PLAN_OPTIONS = [
  ...TRAINING.tiers.flatMap((tier) =>
    tier.prices.map((price) => `${tier.name} · ${price.label}`),
  ),
  ...POSING.packs.flatMap((pack) =>
    pack.prices.map((price) => `Posing · ${price.label}`),
  ),
]

export const OBJETIVOS = [
  'Primera competición',
  'Mejorar posing',
  'Prep completa (dieta + entreno + posing)',
  'Mejora física sin competir',
]

export const COMPETIDO = [
  'No, sería mi primera vez',
  'Sí, a nivel regional/nacional',
  'Sí, a nivel internacional',
]

export const EXPERIENCIA = ['Menos de 1 año', '1–3 años', '3–5 años', 'Más de 5 años']

export const COMPROMISO = ['4–6 horas', '6–10 horas', 'Más de 10 horas']

export const PRESUPUESTO = ['100–200 €', '200–350 €', 'Más de 350 €']

// Patrones de lista blanca por campo. Se usan tal cual en el atributo
// `pattern` (anclado implícitamente a la cadena completa por el navegador)
// y se recompilan en JS para la revalidación.
export const PATTERNS = {
  nombre: "[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?:[ '\\-][A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)*",
  email: '[A-Za-z0-9._%+\\-]+@[A-Za-z0-9.\\-]+\\.[A-Za-z]{2,}',
  telefono: '\\+?[0-9](?:[ .\\-]?[0-9]){7,14}',
  fecha: '[A-Za-z0-9ÁÉÍÓÚÜÑáéíóúüñ][A-Za-z0-9ÁÉÍÓÚÜÑáéíóúüñ ,.\\/\\-]{1,39}',
}

export const MAX_LENGTH = {
  nombre: 60,
  email: 80,
  telefono: 18,
  fecha: 40,
  mensaje: 600,
}

// Caracteres que nunca tienen sentido en un mensaje de contacto y sí en un
// payload de inyección (HTML/SQL/plantillas).
const FORBIDDEN_CHARS = /[<>{}[\]`\\|~^]/

// Secuencias típicas de inyección SQL en texto libre.
const SQL_META =
  /(--|\/\*|\*\/|;\s*(select|insert|update|delete|drop|alter|create|exec)\b|\b(union\s+(all\s+)?select|or\s+1\s*=\s*1|drop\s+table|xp_cmdshell|information_schema)\b)/i

function compile(pattern) {
  // Mismo comportamiento que el atributo pattern: anclado a la cadena completa.
  return new RegExp(`^(?:${pattern})$`, 'v')
}

// Rango de caracteres de control C0 + DEL, construido desde escapes para
// mantener el fichero en ASCII imprimible.
const CTRL_ALL = new RegExp('[\\u0000-\\u001F\\u007F]', 'g')
const CTRL_KEEP_NEWLINE = new RegExp('[\\u0000-\\u0008\\u000B-\\u001F\\u007F]', 'g')

/** Normaliza sin alterar el significado: recorta y elimina caracteres de control. */
export function sanitize(value, { multiline = false } = {}) {
  let s = String(value ?? '')
  s = s.replace(multiline ? CTRL_KEEP_NEWLINE : CTRL_ALL, ' ')
  return s.replace(/[ \t]{2,}/g, ' ').trim()
}

function checkFreeText(value, field) {
  if (FORBIDDEN_CHARS.test(value)) {
    return 'Hay caracteres no permitidos (< > { } [ ] ` \\ | ~ ^).'
  }
  if (SQL_META.test(value)) {
    return 'El texto contiene secuencias no permitidas.'
  }
  if (value.length > MAX_LENGTH[field]) {
    return `Máximo ${MAX_LENGTH[field]} caracteres.`
  }
  return null
}

function sanitizeAll(values) {
  return Object.fromEntries(
    Object.entries(values).map(([k, val]) => [
      k,
      sanitize(val, { multiline: k === 'mensaje' }),
    ]),
  )
}

/**
 * Valida el estado completo del formulario.
 * Devuelve un objeto { campo: mensajeDeError } — vacío si todo es válido.
 */
export function validateForm(values) {
  const errors = {}
  const v = sanitizeAll(values)

  // Honeypot: si un bot lo rellena, invalidamos en silencio.
  if (v.empresa) {
    errors.empresa = 'invalid'
    return errors
  }

  if (!v.nombre) {
    errors.nombre = 'Escribe tu nombre.'
  } else if (!compile(PATTERNS.nombre).test(v.nombre) || v.nombre.length > MAX_LENGTH.nombre) {
    errors.nombre = 'Usa solo letras, espacios, apóstrofos o guiones (máx. 60).'
  }

  if (!v.email) {
    errors.email = 'Escribe tu email.'
  } else if (!compile(PATTERNS.email).test(v.email) || v.email.length > MAX_LENGTH.email) {
    errors.email = 'Escribe un email válido, por ejemplo nombre@dominio.com.'
  }

  if (v.telefono && !compile(PATTERNS.telefono).test(v.telefono)) {
    errors.telefono = 'Usa solo dígitos, espacios y un prefijo + opcional (8–15 dígitos).'
  }

  if (v.plan && !PLAN_OPTIONS.includes(v.plan)) {
    errors.plan = 'Elige una opción de la lista.'
  }

  if (!v.objetivo) {
    errors.objetivo = 'Elige tu objetivo.'
  } else if (!OBJETIVOS.includes(v.objetivo)) {
    errors.objetivo = 'Elige una opción de la lista.'
  }

  if (v.competido && !COMPETIDO.includes(v.competido)) {
    errors.competido = 'Elige una opción de la lista.'
  }
  if (v.experiencia && !EXPERIENCIA.includes(v.experiencia)) {
    errors.experiencia = 'Elige una opción de la lista.'
  }
  if (v.compromiso && !COMPROMISO.includes(v.compromiso)) {
    errors.compromiso = 'Elige una opción de la lista.'
  }
  if (v.presupuesto && !PRESUPUESTO.includes(v.presupuesto)) {
    errors.presupuesto = 'Elige una opción de la lista.'
  }

  if (v.fecha && !compile(PATTERNS.fecha).test(v.fecha)) {
    errors.fecha = 'Usa letras, números y signos , . / - (máx. 40).'
  }

  if (v.mensaje) {
    const err = checkFreeText(v.mensaje, 'mensaje')
    if (err) errors.mensaje = err
  }

  return errors
}

/** Construye el mensaje de solicitud con los valores ya saneados. */
export function buildMessage(values) {
  const v = sanitizeAll(values)
  return [
    'Hola Chery, quiero solicitar una consulta:',
    `Plan: ${v.plan || '-'}`,
    `Nombre: ${v.nombre || '-'}`,
    `Email: ${v.email || '-'}`,
    `Teléfono: ${v.telefono || '-'}`,
    `Objetivo: ${v.objetivo || '-'}`,
    `¿Ha competido?: ${v.competido || '-'}`,
    `Experiencia: ${v.experiencia || '-'}`,
    `Fecha objetivo: ${v.fecha || '-'}`,
    `Compromiso: ${v.compromiso || '-'}`,
    `Presupuesto: ${v.presupuesto || '-'}`,
    `Mensaje: ${v.mensaje || '-'}`,
  ].join('\n')
}
