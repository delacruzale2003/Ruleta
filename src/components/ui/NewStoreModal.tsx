// components/ui/NewStoreModal.tsx (CORREGIDO)
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface PrizeInput {
    nombre: string;
    // Solo necesitamos un campo de stock en el formulario
    stock: number; 
}

interface NewStoreModalProps {
    show: boolean;
    onClose: () => void;
    // La función onCreate ahora recibirá solo un valor de stock por premio
    onCreate: (
        name: string,
        prizes: PrizeInput[] 
    ) => Promise<void>;
    prizeOptions: string[];
}

const NewStoreModal: React.FC<NewStoreModalProps> = ({
    show,
    onClose,
    onCreate,
    prizeOptions,
}) => {
    const [name, setName] = useState("");
    // Solo un estado para el stock (usaremos 'stock' en lugar de 'availables')
    const [stockValues, setStockValues] = useState<Record<string, number>>({}); 
    const [submitting, setSubmitting] = useState(false);

    // Inicializar valores en 0
    useEffect(() => {
        if (show) { 
            const s: Record<string, number> = {};
            prizeOptions.forEach((p) => {
                s[p] = 0;
            });
            setStockValues(s);
            setName("");
        }
    }, [prizeOptions, show]);

    // --- CÁLCULO AUTOMÁTICO ---
    const totalCalculado = Object.values(stockValues).reduce((acc, curr) => acc + (curr || 0), 0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (submitting) return;
        setSubmitting(true);

        // Mapeamos a PrizeInput con un solo campo 'stock'
        const selected: PrizeInput[] = prizeOptions
            .map((p) => ({
                nombre: p,
                stock: stockValues[p] || 0, // Solo un valor de stock
            }))
            .filter((pr) => pr.stock > 0); // Filtramos si el stock es > 0

        if (selected.length === 0) {
            alert("Debes asignar al menos un premio con stock.");
            setSubmitting(false);
            return;
        }

        try {
            await onCreate(
                name,
                selected
            );
            onClose();
        } catch (err: any) {
            alert(`Error: ${err.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-60 z-50 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="bg-white p-6 rounded-2xl shadow-xl w-86 max-h-[78vh] overflow-y-auto border border-gray-100"
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <h2 className="text-2xl mb-6 font-bold text-gray-800 text-center">Nueva Tienda</h2>
                        <form onSubmit={handleSubmit} className="space-y-5 text-sm">
                            
                            {/* Nombre de la tienda (igual) */}
                            <div className="text-start">
                                <label className="font-semibold text-gray-700 block mb-1 ml-1">
                                    Nombre de la tienda
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full p-2.5 px-4 border border-gray-300 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="Ej. Tienda Central"
                                    required
                                />
                            </div>

                            {/* Total de premios (Automático, usa stockValues) */}
                            <div className="text-start">
                                <label className="font-semibold text-gray-700 block mb-1 ml-1">
                                    Total de premios (Automático)
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={totalCalculado}
                                        readOnly
                                        className="w-full p-2.5 px-4 border border-gray-200 bg-gray-100 rounded-xl text-gray-600 font-bold cursor-not-allowed focus:outline-none"
                                    />
                                    <span className="absolute right-4 top-2.5 text-xs text-gray-400 font-medium">
                                        Calculado
                                    </span>
                                </div>
                                <p className="text-[10px] text-gray-400 mt-1 ml-1">
                                    Se suma automáticamente según el stock asignado abajo.
                                </p>
                            </div>

                            {/* Lista de Premios - AHORA CON UN SOLO CAMPO DE STOCK */}
                            <div className="bg-white p-4 rounded-xl border border-gray-100">
                                <p className="font-bold text-lg text-gray-800 mb-3 border-b pb-2">Asignar Stock</p>
                                {prizeOptions.map((pr) => (
                                    <div key={pr} className="mb-4 last:mb-0">
                                        <p className="font-semibold text-gray-700 text-start mb-1 text-sm">{pr}</p>
                                        <div className="flex space-x-3">
                                            {/* ÚNICO CAMPO DE STOCK */}
                                            <div className="flex-1 text-start">
                                                <label className="text-[10px] uppercase tracking-wide font-bold text-gray-400 mb-1 block">
                                                    Stock Inicial/Disponible
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    placeholder="0"
                                                    value={stockValues[pr] || ''} // Usamos stockValues
                                                    onChange={(e) =>
                                                        setStockValues((prev) => ({
                                                            ...prev,
                                                            // Al ser un nuevo registro, inicial y disponible son iguales.
                                                            [pr]: Math.max(0, parseInt(e.target.value) || 0), 
                                                        }))
                                                    }
                                                    className="w-full p-2 border border-gray-200 bg-gray-100 rounded-lg text-gray-800 font-medium text-center focus:ring-2 focus:ring-gray-500 outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Botones de acción (igual) */}
                            <div className="flex justify-end space-x-3 pt-2">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-5 py-2.5 bg-white border border-gray-300 rounded-full text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className={`px-6 py-2.5 rounded-full font-bold text-white shadow-md transition-all transform hover:scale-105 active:scale-95 ${
                                        submitting ? "bg-gray-400 cursor-not-allowed" : "bg-black hover:bg-gray-800"
                                    }`}
                                >
                                    {submitting ? "Creando..." : "Crear Tienda"}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default NewStoreModal;