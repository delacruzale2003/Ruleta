import { useEffect } from 'react';




const ExitPage = () => {
    
    // Aunque el state no trae datos, lo mantenemos por si acaso.
    

    // --- ESTADO LOCAL SIMPLE ---
    // Ya no necesitamos prizeName ni prizeImageUrl ya que el contenido es estático
    
    // Función para volver al inicio
    

    // 💡 EFECTO DE LIMPIEZA: Asegura que si alguien llega por URL, tenga un mensaje claro.
    useEffect(() => {
        // Podrías añadir lógica aquí si quisieras mostrar un mensaje específico basado en el URL.
        // Por ahora, solo nos aseguramos de que el navegador no intente navegar de nuevo.
    }, []); 

    return (
        // 💡 CORRECCIÓN 2: Deshabilita pull-to-refresh en el móvil.
        <div className="min-h-screen flex items-center text-center justify-center bg-black p-4 overscroll-y-none">
            
            <div className="bg-transparent rounded-2xl p-8 w-full max-w-md space-y-1 text-center mx-auto">
                
                {/* 💡 CORRECCIÓN 1: Centrar logo de arriba */}
                <img
                        src="/logomonster.png"
                        alt="logomonster"
                        className="w-60 h-auto z-10 mx-auto mt-4" 
                    />
                
                {/* 💡 MENSAJE DE REGISTRO EXITOSO */}
                <h1 className="text-5xl text-white font-semibold font-teko tracking-normal leading-none">
                    <span className="block">¡GRACIAS!</span>
                    <span className="block text-xl font-mont-bold">YA ESTÁS PARTICIPANDO</span>
                </h1>

                {/* Bloque de Contenido */}
                <div className="p-2 bg-transparent space-y-3">
                    
                    {/* 💡 IMAGEN FIJA: premios.gif */}
                    <img 
                        src="/premios.gif" 
                        alt="Premios de la Campaña" 
                        className="mt-1 mx-auto rounded-lg max-w-70 object-contain w-70" 
                    />
                    
                    
                    
                    {/* 💡 CORRECCIÓN 1: Centrar logo de abajo */}
                    
                </div>
            </div>
        </div>
    );
};


export default ExitPage;