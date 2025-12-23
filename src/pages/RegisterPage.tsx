import React, { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom"; 
import { useRegistration } from "../hooks/useRegistration";
import { X, Fan, LifeBuoy, Disc, Gift, Settings, Gamepad2 } from 'lucide-react'; 

const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    
    // 1. Recuperamos el storeId desde la URL (Ej: /105)
    const { storeId } = useParams<{ storeId: string }>(); 

    const [showTermsModal, setShowTermsModal] = useState(true);
    const [rotation, setRotation] = useState(0);
    const [isSpinning, setIsSpinning] = useState(false);
    const [winningId, setWinningId] = useState<number | null>(null);

    // 2. CORRECCIÓN: Llamamos al hook SIN argumentos para evitar el error TS(2554)
    // Nota: Como 'storeId' ahora viene de useParams, no necesitamos sacarlo del hook.
    const { loading, message, handleSpin } = useRegistration(); 

    // === PREMIOS ===
    const ALL_PRIZES = [
        { id: 1, label: "Abanico", icon: <Fan size={32} />, color: "bg-white text-gray-800" },
        { id: 2, label: "Pelota Inflable", icon: <LifeBuoy size={32} />, color: "bg-gray-200 text-gray-800" },
        { id: 3, label: "Frisbee", icon: <Disc size={32} />, color: "bg-white text-gray-800" },
        { id: 4, label: "Premio Sodimac", icon: <Gift size={32} />, color: "bg-gray-200 text-gray-800" },
    ];

    const mockInventory: Record<number, number> = { 1: 10, 2: 5, 3: 5, 4: 5 }; 

    const activePrizes = useMemo(() => {
        if (!storeId) return ALL_PRIZES; 
        return ALL_PRIZES.filter(prize => (mockInventory[prize.id] ?? 0) > 0);
    }, [storeId]);

    const onSpinClick = async () => {
        // Usamos el 'storeId' que viene del useParams
        if (isSpinning || loading || !storeId) return;

        setIsSpinning(true);
        setWinningId(null); 

        // 3. Importante: Dependiendo de cómo esté hecho tu hook, 
        // tal vez necesites pasarle el storeId aquí: handleSpin(storeId).
        // Si te da error, déjalo vacío como está ahora.
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
                            storeId: storeId 
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

            {/* Título */}
            <div className="z-10 text-center mb-3">
                <h3 className="text-3xl text-white font-medium tracking-tighter drop-shadow-md leading-none pb-2 z-20 relative">
                    Dueños del
                </h3>
                {storeId && (
                    <h1 className="text-white font-bold text-8xl font-amigos leading-none -mt-8">
                        verano
                    </h1>
                )}
            </div>

            {/* === RULETA === */}
            <div className="relative z-10 w-80 h-80 sm:w-96 sm:h-96">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-30">
                    <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[40px] border-t-gray-800 drop-shadow-lg"></div>
                </div>

                <div className="w-full h-full rounded-full bg-white p-2 shadow-2xl">
                    <div className="w-full h-full rounded-full relative overflow-hidden border-4 border-gray-800" style={wheelStyle}>
                        <div className="absolute inset-0 w-full h-full">
                            {activePrizes.map((prize, index) => {
                                const totalSegments = activePrizes.length;
                                const segmentAngle = 360 / totalSegments;
                                const rotateSegment = index * segmentAngle;
                                const isWinner = winningId === prize.id;

                                return (
                                    <div
                                        key={prize.id}
                                        className={`absolute w-1/2 h-1/2 top-0 right-0 origin-bottom-left flex items-center justify-center border-l-2 border-b-2 border-gray-300 transition-colors duration-300
                                            ${isWinner ? 'bg-yellow-400 !border-yellow-600 z-50' : prize.color}
                                        `}
                                        style={{ transform: `rotate(${rotateSegment}deg) skewY(${totalSegments === 4 ? 0 : 0}deg)` }}
                                    >
                                        <div 
                                            className={`flex flex-col items-center justify-center transform translate-x-4 translate-y-4 transition-transform duration-500
                                                ${isWinner ? 'scale-125' : 'scale-100'}
                                            `}
                                            style={{ transform: `rotate(45deg)`, width: '100px' }}
                                        >
                                            {prize.icon}
                                            <span className={`text-xs font-bold uppercase mt-1 text-center leading-none ${isWinner ? 'text-black text-sm' : ''}`}>
                                                {prize.label}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                    <button
                        onClick={onSpinClick}
                        disabled={isSpinning || loading || !storeId}
                        className={`
                            w-20 h-20 rounded-full bg-gray-800 border-4 border-white text-white font-black text-xl shadow-lg
                            flex items-center justify-center transition-transform hover:scale-105 active:scale-95
                            ${isSpinning ? 'opacity-90 cursor-default' : 'animate-pulse cursor-pointer'}
                        `}
                    >
                        {loading ? <span className="text-xs">...</span> : "GO!"}
                    </button>
                </div>
            </div>

            {/* === NAVBAR INFERIOR === */}
            <div className="z-20 mt-8 flex items-center gap-4">
                
                {/* Botón JUGAR (Activo) */}
                <button 
                    className="flex items-center gap-2 px-6 py-3 rounded-full bg-white text-blue-900 font-black shadow-lg transform transition-transform active:scale-95 border-2 border-transparent"
                >
                    <Gamepad2 size={24} />
                    <span>JUGAR</span>
                </button>

                {/* Botón SETTINGS (Secundario) */}
                <button 
                    onClick={() => navigate('/tiendas')}
                    className="flex items-center justify-center w-12 h-12 rounded-full bg-white/20 backdrop-blur-md text-white border-2 border-white/30 shadow-lg transform transition-transform active:scale-95 hover:bg-white/30"
                >
                    <Settings size={24} />
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