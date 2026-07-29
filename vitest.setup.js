import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

// Testing Library solo auto-registra su cleanup si `globals: true` está
// activo. Aquí los tests importan describe/it/expect de forma explícita, así
// que registramos la limpieza a mano en lugar de activar los globales.
afterEach(cleanup)
