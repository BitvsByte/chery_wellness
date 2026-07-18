import { useState } from 'react'
import { CONTACT, CONTACT_LINKS } from '../data/content.js'
import {
  PATTERNS,
  MAX_LENGTH,
  OBJETIVOS,
  COMPETIDO,
  EXPERIENCIA,
  COMPROMISO,
  PRESUPUESTO,
  validateForm,
  buildMessage,
  sanitize,
} from '../utils/validation.js'
import { TextField, SelectField, TextAreaField } from './ui/Field.jsx'
import { IconWhatsApp, IconMail } from './ui/Icons.jsx'

const INITIAL = {
  nombre: '',
  email: '',
  telefono: '',
  objetivo: '',
  competido: '',
  experiencia: '',
  fecha: '',
  compromiso: '',
  presupuesto: '',
  mensaje: '',
  empresa: '', // honeypot anti-bots: los humanos nunca lo ven ni lo rellenan
}

export default function ContactForm() {
  const [values, setValues] = useState(INITIAL)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('')

  const setField = (id, value) => {
    setValues((v) => ({ ...v, [id]: value }))
    setErrors((e) => (e[id] ? { ...e, [id]: undefined } : e))
  }

  const submit = (channel) => {
    const nextErrors = validateForm(values)
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      setStatus('')
      // El foco se mueve tras el re-render, cuando aria-invalid ya está en el DOM.
      const firstInvalid = Object.keys(INITIAL).find((id) => nextErrors[id])
      requestAnimationFrame(() => document.getElementById(firstInvalid)?.focus())
      return
    }
    setErrors({})
    const message = buildMessage(values)
    if (channel === 'whatsapp') {
      setStatus('Abriendo WhatsApp con tu solicitud…')
      window.open(
        `${CONTACT_LINKS.whatsapp}?text=${encodeURIComponent(message)}`,
        '_blank',
        'noopener',
      )
    } else {
      setStatus('Abriendo tu aplicación de correo…')
      const subject = `Solicitud de consulta — ${sanitize(values.nombre)}`
      window.location.href = `${CONTACT_LINKS.mailto}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`
    }
  }

  const errorCount = Object.keys(errors).filter((k) => errors[k] && k !== 'empresa').length

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        submit('whatsapp')
      }}
      className="flex flex-col gap-4 rounded-2xl border border-line/80 bg-[rgba(13,13,14,0.5)] p-5 sm:p-7"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          id="nombre"
          label="Nombre"
          required
          pattern={PATTERNS.nombre}
          maxLength={MAX_LENGTH.nombre}
          autoComplete="name"
          placeholder="Tu nombre"
          value={values.nombre}
          onChange={setField}
          error={errors.nombre}
        />
        <TextField
          id="email"
          label="Email"
          required
          type="email"
          pattern={PATTERNS.email}
          maxLength={MAX_LENGTH.email}
          autoComplete="email"
          inputMode="email"
          placeholder="nombre@dominio.com"
          value={values.email}
          onChange={setField}
          error={errors.email}
        />
        <TextField
          id="telefono"
          label="Teléfono"
          type="tel"
          pattern={PATTERNS.telefono}
          maxLength={MAX_LENGTH.telefono}
          autoComplete="tel"
          inputMode="tel"
          placeholder="+34 600 000 000"
          value={values.telefono}
          onChange={setField}
          error={errors.telefono}
        />
        <SelectField
          id="objetivo"
          label="Objetivo"
          required
          options={OBJETIVOS}
          placeholder="Elige tu objetivo"
          value={values.objetivo}
          onChange={setField}
          error={errors.objetivo}
        />
        <SelectField
          id="competido"
          label="¿Has competido antes?"
          options={COMPETIDO}
          placeholder="Elige una opción"
          value={values.competido}
          onChange={setField}
          error={errors.competido}
        />
        <SelectField
          id="experiencia"
          label="Experiencia entrenando"
          options={EXPERIENCIA}
          placeholder="Elige una opción"
          value={values.experiencia}
          onChange={setField}
          error={errors.experiencia}
        />
        <TextField
          id="fecha"
          label="Fecha objetivo"
          pattern={PATTERNS.fecha}
          maxLength={MAX_LENGTH.fecha}
          autoComplete="off"
          placeholder="Ej.: primavera 2027"
          value={values.fecha}
          onChange={setField}
          error={errors.fecha}
        />
        <SelectField
          id="compromiso"
          label="Compromiso (h/semana)"
          options={COMPROMISO}
          placeholder="Elige una opción"
          value={values.compromiso}
          onChange={setField}
          error={errors.compromiso}
        />
      </div>

      <SelectField
        id="presupuesto"
        label="Presupuesto mensual"
        options={PRESUPUESTO}
        placeholder="Prefiero hablarlo en la consulta"
        value={values.presupuesto}
        onChange={setField}
        error={errors.presupuesto}
      />

      <TextAreaField
        id="mensaje"
        label="Mensaje"
        maxLength={MAX_LENGTH.mensaje}
        placeholder="Punto de partida, lesiones, disponibilidad…"
        value={values.mensaje}
        onChange={setField}
        error={errors.mensaje}
      />

      {/* Honeypot: invisible y fuera del orden de tabulación */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="empresa">Empresa</label>
        <input
          id="empresa"
          name="empresa"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.empresa}
          onChange={(e) => setField('empresa', e.target.value)}
        />
      </div>

      <div aria-live="assertive" role="alert">
        {errorCount > 0 && (
          <p className="text-[13px] font-semibold text-[#f87171]">
            Revisa el formulario: hay {errorCount === 1 ? '1 campo' : `${errorCount} campos`} por
            corregir.
          </p>
        )}
      </div>
      <div aria-live="polite" role="status">
        {status && <p className="text-[13px] font-semibold text-silver">{status}</p>}
      </div>

      <div className="mt-1 flex flex-col justify-center gap-3 sm:flex-row">
        <button type="submit" className="btn-chrome gap-2.5">
          <IconWhatsApp className="h-4 w-4" />
          Enviar por WhatsApp
        </button>
        <button type="button" onClick={() => submit('email')} className="btn-ghost gap-2.5">
          <IconMail className="h-4 w-4" />
          Enviar por email
        </button>
      </div>
      <p className="text-center text-xs leading-relaxed text-dim">
        Al enviar se abrirá WhatsApp o tu correo con la solicitud ya redactada. No guardamos tus
        datos en ninguna base de datos.
      </p>
    </form>
  )
}
