import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { RotateCw } from 'lucide-react'; // Importamos un ícono para "repetir"

const ExitPage: React.FC = () => {
    
    const location = useLocation();
    const navigate = useNavigate();
    
    // Recuperamos prizeName y storeId del state
    const { prizeName, storeId } = location.state || {}; 

    const BRAND_ORANGE = "#1b5eac"; 

    // Función para volver al inicio manteniendo el storeId
    const handlePlayAgain = () => {
    if (storeId) {
        // CAMBIO: En vez de '?storeId=', usamos la barra '/'
        navigate(`/${storeId}`); 
    } else {
        navigate('/');
    }
};

    return (
        <div 
            style={{ backgroundColor: BRAND_ORANGE }} 
            className="min-h-screen flex flex-col items-center justify-center p-4 overscroll-y-none relative font-sans text-center"
        >
            <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-10 pointer-events-none"></div>

            <div className="z-10 w-full max-w-md flex flex-col items-center">
                
                <img
                    src="/logosodimac.png"
                    alt="logo sodimac"
                    className="w-48 h-auto mb-8 drop-shadow-md" 
                />
                
                <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 w-full border border-white/20 shadow-2xl">
                    
                    <h1 className="text-4xl text-white font-bold tracking-tight mb-2">
                        ¡FELICIDADES!
                    </h1>
                    
                    <p className="text-white text-lg font-light mb-6">
                        Has ganado:
                    </p>

                    <div className="bg-white rounded-xl p-6 shadow-inner mb-6 transform rotate-1">
                        {prizeName ? (
                            <h2 className="text-3xl sm:text-4xl font-black text-gray-800 uppercase break-words leading-tight">
                                {prizeName}
                            </h2>
                        ) : (
                            <h2 className="text-xl text-gray-400 font-bold">
                                PREMIO NO DETECTADO
                            </h2>
                        )}
                    </div>

                    <div className="space-y-2 text-white/90 text-sm mb-6">
                        <p className="font-medium">
                            Acércate al módulo de atención para reclamar tu premio.
                        </p>
                        <p className="opacity-75 text-xs">
                            *Recuerda mostrar tu DNI y el comprobante de compra.
                        </p>
                    </div>

                    {/* BOTÓN PARA VOLVER A PARTICIPAR */}
                    <button
                        onClick={handlePlayAgain}
                        className="w-full py-3 rounded-xl bg-gray-800 text-white font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 hover:bg-gray-700"
                    >
                        <RotateCw size={20} />
                        VOLVER A JUGAR
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExitPage;