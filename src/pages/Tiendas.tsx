
import { useState, useEffect, useCallback, useMemo } from "react";
import type { PremioEdit } from "../components/ui/EditStoreModal";
import TableWithActions from "../components/ui/TableWithActions";
import NewStoreModal from "../components/ui/NewStoreModal";
import EditStoreModal from "../components/ui/EditStoreModal";
// Importamos los tipos necesarios (asumiendo que los tienes en tu proyecto)


// ==========================================================
// NUEVAS INTERFACES PARA MANEJAR DATOS DE EDICIÓN
// ==========================================================

// Interfaz que devuelve el backend para un premio
interface Prize {
    id: string;
    name: string;
    description: string;
    initial_stock: number;
    available_stock: number;
    created_at: string;
}

// Definición de Tipos para consistencia (Basado en la respuesta de la API MySQL)
interface Store {
    id: string; // MySQL UUID (Clave primaria)
    name: string; // Nombre de la tienda
    campaign: string; // Nombre de la campaña
    is_active: boolean;
    created_at: string;
    updated_at: string;
    available_prizes_count: number;
    // Campo temporal para pasar los premios al modal de edición
    prizes?: PremioEdit[]; 
}

const CAMPAIGN_NAME = import.meta.env.VITE_CAMPAIGN;
const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function Tienda() {
    
    // --- ESTADOS ---
    const [data, setData] = useState<Store[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [newModalOpen, setNewModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    // ... otros estados (loading, error, etc)
    const [sortBy, setSortBy] = useState<'recent' | 'alpha'>('recent'); // Por defecto 'recent'
    const [editingLoading, setEditingLoading] = useState(false);
    // Usamos el tipo Store para el estado
    const [selectedStore, setSelectedStore] = useState<Store | null>(null); 
    const prizeOptions = ["Abanico", "Pelota Inflable", "Frisbee", "Premio Sodimac"];

    // --- FUNCIONES CORE ---
    
    // Función para cargar los datos de la API (usa paginación y filtro de campaña)
    const fetchData = useCallback(async () => {
    setLoading(true);
    try {
        // --- 1. Fetch de tiendas ---
        const storesUrl = `${API_BASE_URL}/api/v1/admin/stores?page=1&limit=150&campaign=${CAMPAIGN_NAME}`; 
        const [resStores, resCounts] = await Promise.all([ // Hacemos las dos peticiones en paralelo
            fetch(storesUrl),
            fetch(`${API_BASE_URL}/api/v1/admin/prizes/counts?campaign=${CAMPAIGN_NAME}`), // Nuevo endpoint
        ]);

        const [resultStores, resultCounts] = await Promise.all([resStores.json(), resCounts.json()]);

        // VALIDACIÓN de tiendas
        if (!resStores.ok || !resultStores.data || !Array.isArray(resultStores.data.stores)) {
            throw new Error(resultStores.message || "La respuesta de la API no contiene el listado de tiendas.");
        }
        
        // VALIDACIÓN de conteos
        if (!resCounts.ok || !resultCounts.data || !resultCounts.data.counts) {
             console.warn("Advertencia: No se pudo obtener el conteo de premios. Mostrando 0.");
             // Si falla el conteo, usamos un mapa vacío.
        }
        
        const storesArray = resultStores.data.stores as Store[];
        const countsMap: Record<string, number> = resultCounts.data?.counts || {};

        // --- 2. Mapear y Fusionar los datos ---
        const mappedData = storesArray.map(store => ({
            ...store,
            // 💡 SOLUCIÓN: Usamos el mapa de conteos, por defecto 0 si no existe la tienda en el mapa.
            available_prizes_count: countsMap[store.id] || 0,
        }));

        setData(mappedData); 
    } catch (err: any) {
        console.error("Error al obtener tiendas:", err);
        setError(`Error al cargar datos: ${err.message}`);
    } finally {
        setLoading(false);
    }
}, [CAMPAIGN_NAME, API_BASE_URL]); 

    
    // ** CREATE **: tienda + premios
    const handleCreate = async (
        name: string,
        prizes: { nombre: string; stock: number }[]
    ) => {
        // ... (Lógica de handleCreate, que ya está correcta) ...
        try {
            const storePayload = { name: name, campaign: CAMPAIGN_NAME };
            const resStore = await fetch(`${API_BASE_URL}/api/v1/admin/stores`, { 
                method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(storePayload),
            });
            
            const storeJson = await resStore.json();
            
            if (!resStore.ok || !storeJson.data || !storeJson.data.storeId) {
                throw new Error(storeJson.message || "Fallo al crear la tienda.");
            }

            const newStoreId = storeJson.data.storeId;
            
            const prizePromises = prizes.map(pr => {
                const prizePayload = {
                    storeId: newStoreId, name: pr.nombre, description: `Premio de ${pr.nombre} para ${CAMPAIGN_NAME}`,
                    initialStock: pr.stock, 
                };
                
                return fetch(`${API_BASE_URL}/api/v1/admin/prizes`, { 
                    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(prizePayload),
                }).then(async resPrize => {
                    if (!resPrize.ok) {
                        const prizeJson = await resPrize.json();
                        return Promise.reject(new Error(prizeJson.message || `Fallo al crear el premio: ${pr.nombre}`)); 
                    }
                    return resPrize.json();
                });
            });
            
            await Promise.all(prizePromises);

            setMessage("Tienda y premios creados exitosamente");
setNewModalOpen(false);

// Obtenemos los datos que necesitamos para la nueva tienda
const newStore: Store = { 
    id: newStoreId, 
    name: name, 
    campaign: CAMPAIGN_NAME,
    is_active: true, // Asumimos que se crea activo
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    available_prizes_count: prizes.reduce((sum, p) => sum + p.stock, 0),
};

// ==========================================================
// CORRECCIÓN UX: Añadir la nueva tienda al estado local
// ==========================================================
setData(prevData => [newStore, ...prevData]); // Añadimos al inicio
            
        } catch (err: any) {
            console.error("Error en handleCreate:", err);
            throw err; 
        }
    };
    
    // ** DELETE **: tienda
    const handleDelete = async (id: string) => {
    try {
        const res = await fetch(`${API_BASE_URL}/api/v1/admin/stores/${id}/deactivate`, { 
            method: "PATCH", 
        });
        
        if (res.status === 404) throw new Error("Tienda no encontrada o ya estaba inactiva.");
        if (!res.ok) {
            const errorJson = await res.json();
            throw new Error(errorJson.message || "Error al desactivar la tienda.");
        }
        
        setMessage("Tienda desactivada exitosamente.");
        
        // ==========================================================
        // CORRECCIÓN UX: Actualización Local de la Tabla
        // ==========================================================
        setData(prevData =>
            prevData.map(store =>
                store.id === id ? { ...store, is_active: false } : store
            ).filter(store => store.is_active) // Opcional: Si la tabla SOLO muestra activos, filtra aquí
        );

        // Ya no necesitamos fetchData() aquí, a menos que necesitemos paginación o filtros complejos.
        // await fetchData(); // <-- COMENTADO O ELIMINADO
        
    } catch (err: any) {
        setError(err.message);
    }
};

    // ** UPDATE **: tienda + premios 
    const handleUpdate = async (name: string, prizes: PremioEdit[]) => {
    // 1. Validar si hay tienda seleccionada
    if (!selectedStore) {
        setError("No hay tienda seleccionada para actualizar.");
        setEditModalOpen(false);
        return;
    }

    const storeId = selectedStore.id;
    setLoading(true); // O un estado de loading específico para la edición
    setError(null);

    try {
        const updatePromises: Promise<any>[] = [];

        // 2. Tarea 1: Actualizar el nombre de la tienda (si ha cambiado)
        if (name !== selectedStore.name) {
            const storeUpdatePayload = { name: name };
            const storeUpdatePromise = fetch(`${API_BASE_URL}/api/v1/admin/stores/${storeId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(storeUpdatePayload),
            }).then(async res => {
                const result = await res.json();
                if (!res.ok || !result.success) {
                    return Promise.reject(new Error(result.message || `Fallo al actualizar el nombre de la tienda.`));
                }
                return result;
            });
            updatePromises.push(storeUpdatePromise);
        }

        // 3. Tarea 2: Actualizar stock de cada premio
        prizes.forEach(prize => {
            // Usamos el endpoint PUT /prizes/:id para actualizar stock y/o nombre/descripción
            const prizeUpdatePayload = {
                // Solo enviamos los stocks, ya que 'name' y 'description' se cargan desde el modal
                // y deben ser actualizados si cambiaron.
                name: prize.nombre, 
                // El backend solo necesita 'availableStock' para el stock disponible
                availableStock: prize.stock_disponible, 
                // Nota: El stock_inicial generalmente no se cambia después de la creación.
            };

            const prizeUpdatePromise = fetch(`${API_BASE_URL}/api/v1/admin/prizes/${prize.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(prizeUpdatePayload),
            }).then(async res => {
                const result = await res.json();
                if (!res.ok || !result.success) {
                    return Promise.reject(new Error(result.message || `Fallo al actualizar el premio ${prize.nombre}.`));
                }
                return result;
            });
            updatePromises.push(prizeUpdatePromise);
        });

        // 4. Ejecutar todas las actualizaciones concurrentemente
        await Promise.all(updatePromises);

        setMessage(`Tienda y ${prizes.length} premios actualizados exitosamente.`);
setEditModalOpen(false);

// ==========================================================
// CORRECCIÓN UX: Actualizar la tienda modificada en el estado local
// ==========================================================
setData(prevData =>
    prevData.map(store =>
        store.id === storeId
            ? { 
                ...store, 
                name: name, 
                updated_at: new Date().toISOString(),
                prizes: prizes, // Actualizamos la lista de premios en el objeto
                available_prizes_count: prizes.reduce((sum, p) => sum + p.stock_disponible, 0), // Recalculamos
              }
            : store
    )
);

    } catch (err: any) {
        console.error("Error en handleUpdate:", err);
        setError(`Fallo al guardar cambios: ${err.message}`);
    } finally {
        setLoading(false);
    }
};

    // ==========================================================
    // LÓGICA DE EDICIÓN: CARGAR PREMIOS ANTES DE ABRIR EL MODAL
    // ==========================================================
    const handleEdit = async (item: any) => { 
        const fullStore = data.find(store => store.id === item.id);
        if (!fullStore) return;

        setError(null);
        // 💡 CAMBIO CLAVE: Usamos el nuevo estado 'editingLoading'
        setEditingLoading(true); 

        try {
            // 1. Obtener premios de la tienda
            const prizesUrl = `${API_BASE_URL}/api/v1/admin/prizes/store/${fullStore.id}`;
            const resPrizes = await fetch(prizesUrl);
            const resultPrizes = await resPrizes.json();

            if (!resPrizes.ok || !resultPrizes.success || !Array.isArray(resultPrizes.data?.prizes)) {
                throw new Error(resultPrizes.message || "Fallo al obtener la lista de premios.");
            }

            const prizesData = resultPrizes.data.prizes as Prize[];

            // 2. Mapear datos al formato PremioEdit
            const prizesForEdit: PremioEdit[] = prizesData.map(p => ({
                id: p.id, nombre: p.name, stock_inicial: p.initial_stock, stock_disponible: p.available_stock,
            }));

            // 3. Abrir el modal
            setSelectedStore({ ...fullStore, prizes: prizesForEdit }); 
            setEditModalOpen(true);
            
        } catch (err: any) {
            console.error("Error al cargar detalles de la tienda:", err);
            setError(`Error al editar: ${err.message}`);
            setSelectedStore(null);
        } finally {
            // 💡 CAMBIO CLAVE: Apagamos el nuevo estado
            setEditingLoading(false); 
        }
    };
    const handleEditWrapper = (item: any) => {
        handleEdit(item).catch(error => {
            // Captura cualquier error que handleEdit lance para evitar que rompa el hilo síncrono
            console.error("Error en handleEditWrapper:", error);
            setError(`Fallo al cargar datos de edición: ${error.message}`);
        });
    };
    const BRAND_ORANGE = "#1b5eac"; 
    const containerStyle = { backgroundColor: BRAND_ORANGE };
    // --- EFECTOS ---
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Efecto para limpiar el mensaje después de unos segundos
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(null), 2000);
            return () => clearTimeout(timer);
        }
    }, [message]);

        // Lógica de Ordenamiento
const sortedData = useMemo(() => {
    // Creamos una copia para no mutar el estado original
    const items = [...data];

    if (sortBy === 'recent') {
        // Ordenar por fecha (más nuevo primero)
        return items.sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    } else {
        // Ordenar alfabéticamente (A-Z)
        return items.sort((a, b) => 
            a.name.localeCompare(b.name)
        );
    }
}, [data, sortBy]);
    // --- RENDERIZADO ---
    if (loading) return <div style={containerStyle} className="p-6 text-center text-gray-500 text-white">Cargando tiendas...</div>;
    if (error) return <div style={containerStyle} className="p-6 text-center text-red-700 bg-red-100 rounded-lg text-white">Error: {error}</div>;
    const displayMessage = message || error;
    const isSuccess = !!message; // Si hay 'message', es éxito. Si hay 'error', es fallo.
 // Se recalcula si cambia la data o el criterio
    return (
    <div style={containerStyle} className="h-full flex flex-col items-center justify-start p-6">
        <div className="w-full block justify-between items-center mb-6 max-w-4xl">
            <h1 className="text-3xl font-mont-bold text-white">Tiendas y Premios</h1>
            <div className="flex gap-4">
                {/* --- NUEVOS BOTONES DE ORDENAMIENTO --- */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                        onClick={() => setSortBy('recent')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                            sortBy === 'recent' 
                            ? 'bg-white text-gray-800 shadow-sm' 
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Más Recientes
                    </button>
                    <button
                        onClick={() => setSortBy('alpha')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                            sortBy === 'alpha' 
                            ? 'bg-white text-gray-800 shadow-sm' 
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        A - Z
                    </button>
                </div>

                <button
                    onClick={() => setNewModalOpen(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-mont-medium transition"
                >
                    + Nueva Tienda
                </button>
            </div>
        </div>
        
        {/* Contenedor principal de la tabla y modales */}
        <TableWithActions 
            data={sortedData} 
            onEdit={handleEditWrapper} 
            onDelete={handleDelete}
            // Puedes añadir una prop `isActionLoading` al TableWithActions 
            // si quieres deshabilitar los botones mientras carga la edición
            isActionLoading={editingLoading} 
        />

        <NewStoreModal
            show={newModalOpen}
            onClose={() => setNewModalOpen(false)}
            onCreate={handleCreate}
            prizeOptions={prizeOptions}
        />
        
        <EditStoreModal
            show={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            onSubmit={handleUpdate}
            data={
                selectedStore
                    ? {
                        id: selectedStore.id, 
                        name: selectedStore.name,
                        prizes: selectedStore.prizes, 
                    }
                    : null
            }
        />
        
        {/* ========================================================== */}
        {/* NOTIFICACIÓN TOAST (Posición Fija Inferior Derecha) */}
        {/* ========================================================== */}
        {displayMessage && (
            <div
                // Posición fija: bottom-6, right-6, z-index alto
                className="fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-2xl transition-all duration-300 transform"
            >
                <div
                    // Diseño minimalista (Apple-like)
                    className={`flex items-center space-x-3 p-3 rounded-xl border ${
                        isSuccess
                            ? 'bg-white border-green-200 text-gray-800'
                            : 'bg-white border-red-200 text-gray-800'
                    } max-w-xs`}
                >
                    {/* Icono (Success or Error) */}
                    <div className={`text-xl font-bold ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
                        {isSuccess ? '✓' : 'X'}
                    </div>

                    {/* Mensaje */}
                    <div className="font-medium text-sm">
                        {displayMessage}
                    </div>
                </div>
            </div>
        )}
    </div>
);
}