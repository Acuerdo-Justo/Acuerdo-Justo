import slideOne from '../assets/carousel/1.jpeg';
import slideTwo from '../assets/carousel/2.jpeg';
import slideThree from '../assets/carousel/3.jpeg';
import slideFour from '../assets/carousel/4.jpeg';
import slideFive from '../assets/carousel/5.jpeg';

export interface CarouselSlide {
  title: string;
  description: string;
  image: string;
}

export const carouselSlides: CarouselSlide[] = [
  {
    title: 'Orientación jurídica cercana',
    description: 'Acompañamiento claro para tomar decisiones informadas.',
    image: slideOne,
  },
  {
    title: 'Construcción de acuerdos',
    description: 'Promovemos soluciones responsables y sostenibles.',
    image: slideTwo,
  },
  {
    title: 'Protección familiar',
    description: 'El bienestar y el interés superior del menor son prioridad.',
    image: slideThree,
  },
  {
    title: 'Atención profesional',
    description: 'Cada consulta es atendida con seriedad y confidencialidad.',
    image: slideFour,
  },
  {
    title: 'Compromiso con la justicia',
    description: 'Trabajamos para acercar soluciones legales equitativas.',
    image: slideFive,
  },
];
