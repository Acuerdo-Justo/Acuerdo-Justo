import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { carouselSlides } from '../data/carousel';
import { useInView } from '../hooks/useInView';

export function Galeria() {
  const { ref, isVisible } = useInView();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % carouselSlides.length);
    }, 6000);

    return () => window.clearInterval(interval);
  }, []);

  const showPrevious = () => {
    setActiveIndex((current) => (current - 1 + carouselSlides.length) % carouselSlides.length);
  };

  const showNext = () => {
    setActiveIndex((current) => (current + 1) % carouselSlides.length);
  };

  return (
    <section id="galeria" className="relative py-24 lg:py-28" ref={ref}>
      <div className={`relative max-w-7xl mx-auto px-6 lg:px-8 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-brand">Nuestro trabajo</p>
            <h2 className="font-serif text-3xl font-bold tracking-tight text-ink sm:text-4xl lg:text-5xl">
              Acompañamiento que construye confianza
            </h2>
          </div>
          <p className="max-w-md leading-relaxed text-ink-muted">
            Conoce algunas experiencias y acciones que representan nuestro compromiso con una orientación jurídica cercana.
          </p>
        </div>

        <div className="relative overflow-hidden border border-ink-line bg-white shadow-professional">
          <div
            className="flex transition-transform duration-700 ease-out"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {carouselSlides.map((slide, index) => (
              <article key={slide.title} className="relative min-w-full">
                <div className="relative aspect-[16/8] min-h-[390px] overflow-hidden">
                  <img src={slide.image} alt={slide.title} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-7 sm:p-10 lg:p-12">
                    <span className="mb-4 block text-xs font-semibold tracking-[0.2em] text-accent-light">
                      0{index + 1} / 0{carouselSlides.length}
                    </span>
                    <h3 className="mb-3 max-w-2xl font-serif text-3xl font-bold text-white sm:text-4xl">{slide.title}</h3>
                    <p className="max-w-xl text-white/65">{slide.description}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="absolute right-5 top-5 flex gap-2">
            <button type="button" onClick={showPrevious} aria-label="Imagen anterior" className="flex h-11 w-11 items-center justify-center border border-white/20 bg-ink/50 text-white backdrop-blur-sm transition-colors hover:bg-accent">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <button type="button" onClick={showNext} aria-label="Imagen siguiente" className="flex h-11 w-11 items-center justify-center border border-white/20 bg-ink/50 text-white backdrop-blur-sm transition-colors hover:bg-accent">
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="mt-6 flex justify-center gap-2">
          {carouselSlides.map((slide, index) => (
            <button
              key={slide.title}
              type="button"
              aria-label={`Mostrar imagen ${index + 1}`}
              onClick={() => setActiveIndex(index)}
              className={`h-1.5 transition-all duration-300 ${activeIndex === index ? 'w-10 bg-accent' : 'w-5 bg-brand/15 hover:bg-brand/35'}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
