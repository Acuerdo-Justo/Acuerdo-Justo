# Imágenes del carrusel

Coloca aquí las imágenes que se usarán en el carrusel institucional.

El carrusel está ubicado después de la sección Nosotros.

Para conectar las imágenes:

1. Coloca cinco archivos en esta carpeta.
2. Importa cada archivo en `src/data/carousel.ts`.
3. Asigna el import a la propiedad `image` de cada diapositiva.

Ejemplo:

```ts
import slideOne from '../assets/carousel/slide-1.jpg';

{
  title: 'Orientación jurídica cercana',
  description: 'Acompañamiento claro para tomar decisiones informadas.',
  image: slideOne,
}
```

Recomendaciones:

- Usa imágenes horizontales.
- Mantén una proporción similar entre todas las fotografías.
- Resolución recomendada: 1600 x 900 px.
- Formatos recomendados: JPG o WebP.
