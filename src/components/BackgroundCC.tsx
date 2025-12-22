import React from 'react';

const BackgroundCC: React.FC = () => {
  // Color de fondo solicitado
  const mainBackgroundColor = '#e30613'; 

  // Usamos la clase CSS pura definida en index.css
  const animationClass = "float-animation-slow";

  return (
    // Contenedor principal del fondo que ocupa toda la pantalla
    <div 
      className="fixed inset-0 w-full h-full -z-10" // -z-10 asegura que esté detrás del contenido
      style={{ backgroundColor: mainBackgroundColor }}
    >
      {/* IMAGEN TOP-LEFT: Ahora la ruta /top-left.png es servida directamente desde /public */}
      <img
        src="/top-left.png" 
        alt="Decoración superior izquierda"
        // CLASES DE RESPONSIVENESS Y ANIMACIÓN: hidden sm:block para ocultar en móvil
        className={`absolute top-0 left-0 w-1/4 max-w-[150px] h-auto ${animationClass} hidden sm:block`}
        style={{ animationDelay: '0s' }} // Empieza inmediatamente
      />

      {/* IMAGEN TOP-RIGHT */}
      <img
        src="/top-right.png"
        alt="Decoración superior derecha"
        className={`absolute top-0 right-0 w-1/4 max-w-[150px] h-auto ${animationClass} hidden sm:block`}
        style={{ animationDelay: '1.5s' }}
      />

      {/* IMAGEN BOTTOM-LEFT */}
      <img
        src="/bottom-left.png"
        alt="Decoración inferior izquierda"
        className={`absolute bottom-0 left-0 w-1/4 max-w-[150px] h-auto ${animationClass} hidden sm:block`}
        style={{ animationDelay: '3s' }}
      />

      {/* IMAGEN BOTTOM-RIGHT */}
      <img
        src="/bottom-right.png"
        alt="Decoración inferior derecha"
        className={`absolute bottom-0 right-0 w-1/4 max-w-[150px] h-auto ${animationClass} hidden sm:block`}
        style={{ animationDelay: '4.5s' }}
      />
    </div>
  );
}

export default BackgroundCC;