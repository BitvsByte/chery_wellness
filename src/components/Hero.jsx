export default function Hero() {
  return (
    <section id="inicio" aria-labelledby="titulo-inicio" className="scroll-mt-24">
      <div className="mx-auto flex max-w-6xl flex-col items-center px-4 pt-10 sm:px-6 sm:pt-14">
        <h1 id="titulo-inicio" className="sr-only">
          Chery Figueroa Wellness PRO — Elite coaching, bodybuilding y wellness aesthetics
        </h1>
        <img
          src="/uploads/logo.jpeg"
          alt="Escudo metálico CW coronado de Chery Figueroa Wellness PRO: elite coaching, bodybuilding, wellness aesthetics"
          width="1408"
          height="768"
          fetchpriority="high"
          className="w-full max-w-3xl rounded-[20px] shadow-[0_40px_100px_rgba(0,0,0,0.65)]"
        />
      </div>
    </section>
  )
}
