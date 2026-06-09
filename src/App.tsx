import { Footer } from './components/layout/Footer';
import { Navbar } from './components/layout/Navbar';
import { Contacto } from './sections/Contacto';
import { Galeria } from './sections/Galeria';
import { Herramientas } from './sections/Herramientas';
import { Hero } from './sections/Hero';
import { Nosotros } from './sections/Nosotros';
import { Proyecto } from './sections/Proyecto';

function App() {
  return (
    <div className="min-h-screen bg-brand-soft">
      <Navbar />
      <Hero />
      <Nosotros />
      <Galeria />
      <Herramientas />
      <Proyecto />
      <Contacto />
      <Footer />
    </div>
  );
}

export default App;
