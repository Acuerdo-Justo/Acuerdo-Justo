import { Footer } from './components/layout/Footer';
import { Navbar } from './components/layout/Navbar';
import { LandingBackground } from './components/ui/LandingBackground';
import { Contacto } from './sections/Contacto';
import { Galeria } from './sections/Galeria';
import { Herramientas } from './sections/Herramientas';
import { Hero } from './sections/Hero';
import { Nosotros } from './sections/Nosotros';
import { Proyecto } from './sections/Proyecto';

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <div className="relative isolate overflow-hidden bg-white">
        <LandingBackground />
        <div className="relative">
          <Nosotros />
          <Galeria />
          <Herramientas />
          <Proyecto />
          <Contacto />
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default App;
