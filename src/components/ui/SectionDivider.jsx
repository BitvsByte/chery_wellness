/** Flecha descendente decorativa entre secciones, como en los mockups. */
export default function SectionDivider() {
  return (
    <div aria-hidden="true" className="flex justify-center py-9">
      <div className="h-5 w-5 rotate-45 border-b-[3px] border-r-[3px] border-[#6b7280] drop-shadow-[0_2px_2px_rgba(0,0,0,0.6)]" />
    </div>
  )
}
