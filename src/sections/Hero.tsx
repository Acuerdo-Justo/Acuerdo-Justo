import { ArrowRight, ChevronDown, MessageCircle } from 'lucide-react';

export function Hero() {
  return (
    <section id="hero" className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-brand via-[#214D94] to-ink" />
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-light/5 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />
      <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-brand via-accent to-white" />

      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 py-32 text-center lg:px-8">
        <div className="mx-auto mb-8 h-px w-20 bg-accent animate-fade-in-up opacity-0" />
        <h1 className="font-serif text-6xl sm:text-7xl lg:text-8xl font-bold uppercase tracking-[0.04em] text-white leading-none mb-8 animate-fade-in-up opacity-0 delay-100">
          Acuerdo <span className="text-accent-light">Justo</span>
        </h1>
        <p className="text-lg sm:text-xl text-white/75 max-w-2xl mx-auto mb-11 leading-relaxed animate-fade-in-up opacity-0 delay-200">
          Centro de asesoría jurídica sobre conciliación en procesos de alimentos
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up opacity-0 delay-300">
          <a href="https://wa.link/tx2p34" target="_blank" rel="noopener noreferrer" className="group inline-flex items-center justify-center gap-3 px-7 py-4 bg-accent hover:bg-white text-white hover:text-brand font-semibold rounded-md transition-all duration-300 shadow-professional">
            <MessageCircle className="w-5 h-5" />
            Solicitar orientación
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
          <a href="#nosotros" className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-transparent hover:bg-white/10 text-white border border-white/30 hover:border-white/60 font-medium rounded-md transition-all duration-300">
            Conocer el proyecto
            <ChevronDown className="w-4 h-4" />
          </a>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ChevronDown className="w-6 h-6 text-white/30" />
      </div>
    </section>
  );
}
