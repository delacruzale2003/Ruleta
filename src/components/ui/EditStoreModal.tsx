import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo } from "react";

// NOTA: Se asume que este archivo se encuentra en la carpeta del frontend
const API_BASE_URL = import.meta.env.VITE_API_URL ;

// Tipado para los datos de premio que se editan (Formato de Frontend)
export interface PremioEdit { // Exportado para usar en Tienda.tsx
    id: string; // ID del premio, crucial para la edición
    nombre: string;
    stock_inicial: number;
    stock_disponible: number;
}

// Tipado para los datos de la tienda que llegan
interface StoreData {
    id: string; // Clave primaria de la tienda
    name: string; // Nombre
    prizes?: PremioEdit[];
}

interface EditStoreModalProps {
    show: boolean;
    onClose: () => void;
    onSubmit: (
        name: string,
        prizes: PremioEdit[]
    ) => void;
    data: StoreData | null;
}

const EditStoreModal: React.FC<EditStoreModalProps> = ({
    show,
    onClose,
    onSubmit,
    data,
}) => {
    const [name, setName] = useState("");
    const [prizes, setPrizes] = useState<PremioEdit[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);

    // LÓGICA: Calcular el total de stock disponible dinámicamente
    const totalCalculado = useMemo(() => {
        // Aseguramos que solo sumamos si es un número válido
        return prizes.reduce((acc, curr) => acc + (curr.stock_disponible || 0), 0);
    }, [prizes]);

    // Efecto para inicializar campos y cargar premios
    useEffect(() => {
        if (!data || !show) { // Aseguramos que solo cargue si es visible
            setPrizes([]);
            setFetchError(null);
            return;
        }

        setName(data.name);
        setLoading(true);
        setFetchError(null);

        // Función para cargar los premios asociados a esta tienda
        const fetchPrizes = async () => {
            try {
                // CORRECCIÓN DE URL: Usamos el endpoint definido en el backend: /api/v1/admin/prizes/store/:storeId
                const url = `${API_BASE_URL}/api/v1/admin/prizes/store/${data.id}`;
                const res = await fetch(url);
                
                const payload = await res.json();
                
                if (!res.ok || !payload.success) {
                    throw new Error(payload.message || "Fallo al obtener premios de la tienda.");
                }
                
                // Asumimos que payload.data es { prizes: array }
                const lista = Array.isArray(payload.data.prizes) ? payload.data.prizes : [];

                // Mapeo de la respuesta del backend (snake_case) a la interfaz PremioEdit (camelCase/snake_case)
                const mapped: PremioEdit[] = lista.map((p: any) => ({
                    id: p.id, 
                    nombre: p.name, // Backend devuelve 'name'
                    stock_inicial: p.initial_stock, // Coincide con la DB
                    stock_disponible: p.available_stock, // Coincide con la DB
                }));

                setPrizes(mapped);
            } catch (err: any) {
                console.error("Error al cargar premios:", err);
                setFetchError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPrizes();
    }, [data, show]); // Dependencia 'show' para reiniciar al abrir

    
    const handlePrizeChange = (
        id: string,
        field: "stock_inicial" | "stock_disponible",
        value: string
    ) => {
        // Convertimos el valor a número, asegurando que sea no negativo
        const qty = Math.max(0, Number(value) || 0); // Convertir "" a 0
        
        setPrizes((prev) =>
            prev.map((p) =>
                p.id === id ? { ...p, [field]: qty } : p
            )
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data) return;
        
        // Llama a onSubmit SOLAMENTE con 2 argumentos (name, prizes)
        onSubmit(name, prizes); 
        // No cerramos onClose aquí si onSubmit falla, el componente padre debe manejarlo
        // onClose(); 
    };

    return (
        <AnimatePresence>
            {show && data && (
                <motion.div
                    // BACKGROUND (Backdrop)
                    // Aseguramos superposición con fixed, inset-0, y z-index alto.
                    className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-70 z-[9999] backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        // CONTENIDO DEL MODAL (Cuerpo blanco, redondeado y con sombra simple)
                        className="bg-white p-6 rounded-2xl shadow-xl w-96 max-h-[85vh] overflow-y-auto border border-gray-100"
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <h2 className="text-xl mb-4 font-bold text-gray-800 text-center">
                            Editar Tienda: {data.name}
                        </h2>

                        {fetchError && (
                            <div className="p-3 mb-4 text-sm text-red-800 bg-red-100 rounded-lg">
                                Error al cargar premios: {fetchError}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5 text-sm">
                            {/* Nombre de la tienda */}
                            <div className="text-start flex">
                                <label className="font-semibold text-gray-700 block mb-1 ml-1">
                                    Nombre de la tienda
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full ml-2 p-2.5 px-4 border border-gray-300 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all"
                                    required
                                />
                            </div>

                            {/* --- SECCIÓN SUPERIOR: RESUMEN --- */}
<div className="flex justify-between items-center mb-6 p-2 bg-blue-50/50 rounded-xl border border-blue-100">
    <div>
        <h3 className="text-sm font-bold text-gray-800">Gestionar Premios</h3>
        
    </div>
    
    {/* Total calculado (Estilo Badge/Stat) */}
    <div className="text-right">
        <span className="block text-xs font-medium text-gray-500">Total Premios</span>
        <span className="text-xl font-black text-blue-600">{totalCalculado}</span>
    </div>
</div>

{/* --- LISTA DE PREMIOS (Expandida) --- */}
<div className="flex-1 overflow-hidden flex flex-col min-h-[300px]"> 
    
    {loading ? (
        <div className="flex-1 flex items-center justify-center text-gray-500">
            Cargando premios...
        </div>
    ) : prizes.length === 0 ? (
        <div className="p-6 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-500">
            No hay premios asignados a esta tienda.
        </div>
    ) : (
        <div className="flex-1 overflow-y-auto pr-2 space-y-3">
            {prizes.map((pr) => (
                <div 
                    key={pr.id} 
                    className="group p-2 border border-gray-200 rounded-xl bg-white hover:border-blue-300 hover:shadow-sm transition-all"
                >
                    {/* Layout GRID: Nombre a la izq, Inputs a la derecha */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        
                        {/* Columna 1: Nombre (Ocupa 4 espacios) */}
                        <div className="md:col-span-4">
                            <p className="text-gray-800 font-bold text-base">{pr.nombre}</p>
                            
                        </div>

                        {/* Columna 2: Inputs (Ocupa 8 espacios) */}
                        <div className="md:col-span-8 grid grid-cols-2 gap-3">
                            
                            {/* Input Stock Inicial */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5 ml-1">
                                    Stock Inicial
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="0"
                                        value={pr.stock_inicial}
                                        onChange={(e) => handlePrizeChange(pr.id, "stock_inicial", e.target.value)}
                                        className="w-full pl-3 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 font-medium focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-center"
                                    />
                                </div>
                            </div>

                            {/* Input Stock Disponible */}
                            <div>
                                <label className="block text-xs font-semibold text-blue-600 mb-1.5 ml-1">
                                    Disponible
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="0"
                                        value={pr.stock_disponible}
                                        onChange={(e) => handlePrizeChange(pr.id, "stock_disponible", e.target.value)}
                                        className="w-full pl-3 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 font-bold focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-center"
                                    />
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            ))}
        </div>
    )}
</div>

{/* --- FOOTER: BOTONES --- */}
<div className="mt-6 pt-4 border-t border-gray-100 flex justify-end gap-3 bg-white sticky bottom-0 z-10">
    <button
        type="button"
        onClick={onClose}
        className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 hover:text-gray-900 transition-colors"
    >
        Cancelar
    </button>
    <button
        type="submit"
        className="px-8 py-2.5 rounded-xl font-bold text-white shadow-lg shadow-blue-500/30 bg-black hover:bg-gray-800 transform active:scale-95 transition-all"
    >
        Guardar Cambios
    </button>
</div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};


export default EditStoreModal;