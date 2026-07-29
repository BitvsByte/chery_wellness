import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ScrollToHash from './ScrollToHash.jsx'

const renderAt = (entry) =>
  render(
    <MemoryRouter initialEntries={[entry]}>
      <ScrollToHash />
    </MemoryRouter>,
  )

describe('ScrollToHash', () => {
  let originalMatchMedia
  let originalScrollIntoView
  let scrollIntoViewMock
  let scrollToSpy

  beforeEach(() => {
    originalMatchMedia = window.matchMedia
    window.matchMedia = vi.fn().mockReturnValue({ matches: false })

    originalScrollIntoView = Element.prototype.scrollIntoView
    scrollIntoViewMock = vi.fn()
    Element.prototype.scrollIntoView = scrollIntoViewMock

    scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  })

  afterEach(() => {
    window.matchMedia = originalMatchMedia
    Element.prototype.scrollIntoView = originalScrollIntoView
    scrollToSpy.mockRestore()
  })

  it('hace scroll al elemento del hash cuando existe', () => {
    const target = document.createElement('div')
    target.id = 'nosotras'
    document.body.appendChild(target)

    renderAt('/#nosotras')

    expect(scrollIntoViewMock).toHaveBeenCalledTimes(1)
    expect(scrollIntoViewMock.mock.instances[0]).toBe(target)
    expect(scrollToSpy).not.toHaveBeenCalled()

    document.body.removeChild(target)
  })

  it('vuelve arriba con window.scrollTo cuando la ruta no tiene hash', () => {
    renderAt('/')

    expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
    expect(scrollIntoViewMock).not.toHaveBeenCalled()
  })

  it('no revienta si el elemento del hash no existe en el DOM', () => {
    expect(() => renderAt('/#no-existe')).not.toThrow()
    expect(scrollIntoViewMock).not.toHaveBeenCalled()
    expect(scrollToSpy).not.toHaveBeenCalled()
  })
})
