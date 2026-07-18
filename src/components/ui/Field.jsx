/**
 * Campos de formulario accesibles: label visible, error enlazado con
 * aria-describedby y aria-invalid, y validación por lista blanca
 * (pattern + maxLength) contra intentos de inyección.
 */

function FieldError({ id, error }) {
  if (!error) return null
  return (
    <p id={id} className="mt-1.5 text-[13px] font-semibold text-[#f87171]">
      {error}
    </p>
  )
}

function labelFor(id, label, required) {
  return (
    <label htmlFor={id} className="field-label">
      {label}
      {required && (
        <>
          {' '}
          <span aria-hidden="true" className="text-silver">
            *
          </span>
          <span className="sr-only">(obligatorio)</span>
        </>
      )}
    </label>
  )
}

export function TextField({
  id,
  label,
  error,
  required = false,
  type = 'text',
  pattern,
  maxLength,
  autoComplete,
  inputMode,
  placeholder,
  value,
  onChange,
}) {
  const errorId = `${id}-error`
  return (
    <div>
      {labelFor(id, label, required)}
      <input
        id={id}
        name={id}
        type={type}
        required={required}
        pattern={pattern}
        maxLength={maxLength}
        autoComplete={autoComplete}
        inputMode={inputMode}
        spellCheck={type === 'email' || type === 'tel' ? false : undefined}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(id, e.target.value)}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? errorId : undefined}
        className="input-base"
      />
      <FieldError id={errorId} error={error} />
    </div>
  )
}

export function SelectField({
  id,
  label,
  error,
  required = false,
  options,
  placeholder,
  value,
  onChange,
}) {
  const errorId = `${id}-error`
  return (
    <div>
      {labelFor(id, label, required)}
      <select
        id={id}
        name={id}
        required={required}
        value={value}
        onChange={(e) => onChange(id, e.target.value)}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`input-base appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239ca3af%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:18px] bg-[right_0.75rem_center] bg-no-repeat pr-10 ${value ? '' : 'text-[#7c828c]'}`}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option} className="text-bright">
            {option}
          </option>
        ))}
      </select>
      <FieldError id={errorId} error={error} />
    </div>
  )
}

export function TextAreaField({
  id,
  label,
  error,
  required = false,
  maxLength,
  rows = 4,
  placeholder,
  value,
  onChange,
}) {
  const errorId = `${id}-error`
  return (
    <div>
      {labelFor(id, label, required)}
      <textarea
        id={id}
        name={id}
        required={required}
        maxLength={maxLength}
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(id, e.target.value)}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? errorId : undefined}
        className="input-base resize-y"
      />
      <FieldError id={errorId} error={error} />
    </div>
  )
}
