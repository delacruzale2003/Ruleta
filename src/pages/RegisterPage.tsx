import React, { useState, useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom"; 
import { useRegistration } from "../hooks/useRegistration";
import { X, Fan, LifeBuoy, Disc, Gift, Settings, Gamepad2 } from 'lucide-react'; 

const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const { storeId: paramStoreId } = useParams<{ storeId: string }>(); 
    const [searchParams] = useSearchParams();
    
    const activeStoreId = paramStoreId || searchParams.get("store");

    const [showTermsModal, setShowTermsModal] = useState(true);
    const [rotation, setRotation] = useState(0);
    const [isSpinning, setIsSpinning] = useState(false);
    const [winningId, setWinningId] = useState<number | null>(null);

    const { loading, message, handleSpin } = useRegistration(); 

    const goToStores = () => {
        if (activeStoreId) {
            navigate(`/tiendas?store=${activeStoreId}`);
        } else {
            navigate('/tiendas');
        }
    };

    const ALL_PRIZES = [
        { id: 1, label: "Abanico", icon: <Fan size={32} />, color: "bg-blue-500 text-white" },
        { id: 2, label: "Pelota Inflable", icon: <LifeBuoy size={32} />, color: "bg-red-500 text-white" },
        { id: 3, label: "Frisbee", icon: <Disc size={32} />, color: "bg-yellow-300 text-white" },
        { id: 4, label: "Premio Sodimac", icon: <Gift size={32} />, color: "bg-red-500 text-white" },
    ];

    const mockInventory: Record<number, number> = { 1: 10, 2: 5, 3: 5, 4: 5 }; 

    const activePrizes = useMemo(() => {
        if (!activeStoreId) return ALL_PRIZES; 
        return ALL_PRIZES.filter(prize => (mockInventory[prize.id] ?? 0) > 0);
    }, [activeStoreId]);

    const onSpinClick = async () => {
        if (isSpinning || loading || !activeStoreId) return;

        setIsSpinning(true);
        setWinningId(null); 

        const result = await handleSpin();

        if (result.success && result.prizeName) {
            const winningIndex = activePrizes.findIndex(p => 
                result.prizeName!.toLowerCase().includes(p.label.toLowerCase().split('/')[0].toLowerCase())
            );
            
            const targetIndex = winningIndex !== -1 ? winningIndex : 0;
            const targetPrizeId = activePrizes[targetIndex].id;

            const totalSegments = activePrizes.length;
            const segmentAngle = 360 / totalSegments;
            const centerOffset = segmentAngle / 2; 

            const spins = 5 * 360; 
            const targetRotation = spins + (360 - (targetIndex * segmentAngle) - centerOffset);

            setRotation(targetRotation);

            setTimeout(() => {
                setWinningId(targetPrizeId);
                setTimeout(() => {
                    navigate('/exit', {
                        state: { 
                            prizeName: result.prizeName, 
                            registerId: result.registerId,
                            isAnonymous: true,
                            storeId: activeStoreId 
                        },
                    });
                }, 1500); 
            }, 5000); 
        } else {
            setIsSpinning(false);
        }
    };

    const BRAND_ORANGE = "#1b5eac"; 
    const containerStyle = { backgroundColor: BRAND_ORANGE };
    
    const wheelStyle = {
        transform: `rotate(${rotation}deg)`,
        transition: isSpinning ? "transform 5s cubic-bezier(0.25, 0.1, 0.25, 1)" : "none",
    };

    return (
    <div style={containerStyle} className="min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden relative font-sans">
        
        <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-10 pointer-events-none"></div>

        <img src="/logosodimac.png" alt="logo" className="w-40 h-auto mb-4 z-10 drop-shadow-md" />

        <div className="z-10 text-center mb-3">
            <h3 className="text-3xl text-white font-medium tracking-tighter drop-shadow-md leading-none pb-2 z-20 relative">
                Dueños del
            </h3>
            {activeStoreId && (
                <h1 className="text-white font-bold text-8xl font-amigos leading-none -mt-8">
                    verano
                </h1>
            )}
        </div>

        <div className="relative z-10 w-80 h-80 sm:w-96 sm:h-96">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-30">
                <div className="w-0 h-0 border-l-[20px]  border-white border-l-transparent border-r-[20px] border-r-transparent border-t-[40px] border-t-black drop-shadow-2xl"></div>
            </div>

            <div className="w-full h-full rounded-full bg-black p-2 shadow-2xl">
                <div className="w-full h-full rounded-full relative overflow-hidden border-2 border-black" style={wheelStyle}>
                    <div className="absolute inset-0 w-full h-full">
                        {activePrizes.map((prize, index) => {
                            const totalSegments = activePrizes.length;
                            const segmentAngle = 360 / totalSegments;
                            const rotateSegment = index * segmentAngle;
                            const isWinner = winningId === prize.id;

                            return (
                                <div
                                    key={prize.id}
                                    className={`absolute w-1/2 h-1/2 top-0 right-0 origin-bottom-left flex items-center justify-center border-l-2 border-b-2 border-black transition-colors duration-300
                                        ${isWinner ? 'bg-yellow-400 !border-yellow-600 z-50' : prize.color}
                                    `}
                                    style={{ transform: `rotate(${rotateSegment}deg) skewY(${totalSegments === 4 ? 0 : 0}deg)` }}
                                >
                                    <div 
                                        className={`flex flex-col items-center justify-center transform translate-x-1 translate-y-1 transition-transform duration-500
                                            ${isWinner ? 'scale-125' : 'scale-100'}
                                        `}
                                        style={{ transform: `rotate(45deg)`, width: '100px' }}
                                    >
                                        
                                        <span className={`text-xl font-bold uppercase mt-1 text-center leading-none ${isWinner ? 'text-black text-sm' : ''}`}>
                                            {prize.label}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* BOTÓN CENTRAL (Logo) - Se mantiene igual */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                <button
                    onClick={onSpinClick}
                    disabled={isSpinning || loading || !activeStoreId}
                    className={`
                        w-33 h-33 rounded-full bg-gray-200 border-4 border-white shadow-lg
                        flex items-center justify-center transition-transform hover:scale-105 active:scale-95
                        ${isSpinning ? 'opacity-95 cursor-default' : 'animate-pulse cursor-pointer'}
                    `}
                >
                    {loading ? (
                        <span className="text-xs text-white">...</span>
                    ) : (
                        <img 
                            src="/sdlogo.png" 
                            alt="GO" 
                            className="w-21 h-21 object-contain" 
                        />
                    )}
                </button>
            </div>
        </div>
        
        
        
        {/* === NAVBAR INFERIOR MODIFICADO === */}
        <div className="z-20 mt-5 flex items-center gap-4">
            
            {/* BOTÓN JUEGA AQUI - Ahora también gira la ruleta */}
            <button 
                onClick={onSpinClick} // <--- AHORA EJECUTA EL GIRO
                disabled={isSpinning || loading || !activeStoreId} // <--- SE DESHABILITA SI YA GIRA
                className={`
                    flex items-center gap-1 px-4 py-1 rounded-full text-white font-black shadow-lg transform transition-all border-2 border-transparent
                    ${isSpinning || loading || !activeStoreId 
                        ? 'bg-gray-400 cursor-not-allowed opacity-70' // Estilo deshabilitado
                        : 'bg-red-500 hover:bg-red-600 active:scale-95' // Estilo normal
                    }
                `}
            >
                <Gamepad2 size={24} />
                <span className="text-2xl">JUEGA AQUI</span>
            </button>

            <button 
                onClick={goToStores}
                disabled={isSpinning} // Opcional: Bloquear configuración mientras gira
                className="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-300 backdrop-blur-md text-blue-500 text-black border-2 border-white/30 transform transition-transform active:scale-95 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Settings size={30} />
            </button>

        </div>

        {message && (
            <div className="mt-4 z-20 bg-white/90 text-red-600 px-4 py-2 rounded-lg font-bold shadow-lg text-center mx-4">
                {message}
            </div>
        )}

        {showTermsModal && (
            <div className="fixed inset-0 bg-gray-900/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl">
                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <h2 className="text-2xl font-black text-gray-800 uppercase italic">Términos y Condiciones</h2>
                        <button onClick={() => setShowTermsModal(false)} className="text-gray-500 hover:text-red-500">
                            <X size={28} />
                        </button>
                    </div>
                    <div className="flex-grow overflow-y-auto text-gray-600 text-sm space-y-3 pr-2 scrollbar-thin scrollbar-thumb-orange-500">
                        <p><strong>Vigencia:</strong> Hasta el 31 de enero del 2026.</p>
                        </div>
                    <button
                        onClick={() => setShowTermsModal(false)}
                        className="mt-4 w-full py-3 rounded-xl text-white font-bold text-xl shadow-md transition-transform active:scale-95"
                        style={{ backgroundColor: BRAND_ORANGE }}
                    >
                        ACEPTAR
                    </button>
                </div>
            </div>
        )}
    </div>
);
};

export default RegisterPage;