import { useState, useEffect, useCallback, useMemo } from "react";
import type { PremioEdit } from "../components/ui/EditStoreModal";
import TableWithActions from "../components/ui/TableWithActions";
import NewStoreModal from "../components/ui/NewStoreModal";
import EditStoreModal from "../components/ui/EditStoreModal";
import { Gamepad2, Settings } from "lucide-react";
// 1. CAMBIO: Añadimos useSearchParams y useLocation
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";

// ==========================================================
// INTERFACES
// ==========================================================
interface Prize {
    id: string;
    name: string;
    description: string;
    initial_stock: number;
    available_stock: number;
    created_at: string;
}

interface Store {
    id: string;
    name: string;
    campaign: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    available_prizes_count: number;
    prizes?: PremioEdit[];
}
const CAMPAIGN_NAME = import.meta.env.VITE_CAMPAIGN;
const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function Tienda() {
    // 2. CAMBIO: Inicializamos los hooks
    const navigate = useNavigate();
    const [searchParams] = useSearchParams(); // Para leer ?store=...
    const location = useLocation(); // Para saber la ruta actual (para el estilo del botón)

    // 3. CAMBIO: Capturamos el ID si existe en la URL
    const currentStoreId = searchParams.get("store");

    // --- ESTADOS ---
    const [data, setData] = useState<Store[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [newModalOpen, setNewModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [sortBy, setSortBy] = useState<'recent' | 'alpha'>('recent');
    const [editingLoading, setEditingLoading] = useState(false);
    const [selectedStore, setSelectedStore] = useState<Store | null>(null);
    
    const prizeOptions = ["Abanico", "Pelota Inflable", "Frisbee", "Premio Sodimac"];

    // --- FUNCIONES CORE ---

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const storesUrl = `${API_BASE_URL}/api/v1/admin/stores?page=1&limit=150&campaign=${CAMPAIGN_NAME}`;
            const [resStores, resCounts] = await Promise.all([
                fetch(storesUrl),
                fetch(`${API_BASE_URL}/api/v1/admin/prizes/counts?campaign=${CAMPAIGN_NAME}`),
            ]);

            const [resultStores, resultCounts] = await Promise.all([resStores.json(), resCounts.json()]);

            if (!resStores.ok || !resultStores.data || !Array.isArray(resultStores.data.stores)) {
                throw new Error(resultStores.message || "La respuesta de la API no contiene el listado de tiendas.");
            }

            if (!resCounts.ok || !resultCounts.data || !resultCounts.data.counts) {
                console.warn("Advertencia: No se pudo obtener el conteo de premios. Mostrando 0.");
            }

            const storesArray = resultStores.data.stores as Store[];
            const countsMap: Record<string, number> = resultCounts.data?.counts || {};

            const mappedData = storesArray.map(store => ({
                ...store,
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

    // ** CREATE **
    const handleCreate = async (name: string, prizes: { nombre: string; stock: number }[]) => {
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

            const newStore: Store = {
                id: newStoreId,
                name: name,
                campaign: CAMPAIGN_NAME,
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                available_prizes_count: prizes.reduce((sum, p) => sum + p.stock, 0),
            };

            setData(prevData => [newStore, ...prevData]);

        } catch (err: any) {
            console.error("Error en handleCreate:", err);
            throw err;
        }
    };

    // ** DELETE **
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

            setData(prevData =>
                prevData.map(store =>
                    store.id === id ? { ...store, is_active: false } : store
                ).filter(store => store.is_active)
            );

        } catch (err: any) {
            setError(err.message);
        }
    };

    // ** UPDATE **
    const handleUpdate = async (name: string, prizes: PremioEdit[]) => {
        if (!selectedStore) {
            setError("No hay tienda seleccionada para actualizar.");
            setEditModalOpen(false);
            return;
        }

        const storeId = selectedStore.id;
        setLoading(true);
        setError(null);

        try {
            const updatePromises: Promise<any>[] = [];

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

            prizes.forEach(prize => {
                const prizeUpdatePayload = {
                    name: prize.nombre,
                    availableStock: prize.stock_disponible,
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

            await Promise.all(updatePromises);

            setMessage(`Tienda y ${prizes.length} premios actualizados exitosamente.`);
            setEditModalOpen(false);

            setData(prevData =>
                prevData.map(store =>
                    store.id === storeId
                        ? {
                            ...store,
                            name: name,
                            updated_at: new Date().toISOString(),
                            prizes: prizes,
                            available_prizes_count: prizes.reduce((sum, p) => sum + p.stock_disponible, 0),
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

    // LÓGICA DE EDICIÓN
    const handleEdit = async (item: any) => {
        const fullStore = data.find(store => store.id === item.id);
        if (!fullStore) return;

        setError(null);
        setEditingLoading(true);

        try {
            const prizesUrl = `${API_BASE_URL}/api/v1/admin/prizes/store/${fullStore.id}`;
            const resPrizes = await fetch(prizesUrl);
            const resultPrizes = await resPrizes.json();

            if (!resPrizes.ok || !resultPrizes.success || !Array.isArray(resultPrizes.data?.prizes)) {
                throw new Error(resultPrizes.message || "Fallo al obtener la lista de premios.");
            }

            const prizesData = resultPrizes.data.prizes as Prize[];

            const prizesForEdit: PremioEdit[] = prizesData.map(p => ({
                id: p.id, nombre: p.name, stock_inicial: p.initial_stock, stock_disponible: p.available_stock,
            }));

            setSelectedStore({ ...fullStore, prizes: prizesForEdit });
            setEditModalOpen(true);

        } catch (err: any) {
            console.error("Error al cargar detalles de la tienda:", err);
            setError(`Error al editar: ${err.message}`);
            setSelectedStore(null);
        } finally {
            setEditingLoading(false);
        }
    };

    const handleEditWrapper = (item: any) => {
        handleEdit(item).catch(error => {
            console.error("Error en handleEditWrapper:", error);
            setError(`Fallo al cargar datos de edición: ${error.message}`);
        });
    };
    const handleGoHome = () => {
        if (currentStoreId) {
            // Si hay un ID en la URL, volvemos a la ruta dinámica (ej: /105)
            navigate(`/${currentStoreId}`);
        } else {
            // Si no hay ID, vamos a la raíz
            navigate('/');
        }
    };
    const BRAND_ORANGE = "#1b5eac";
    const containerStyle = { backgroundColor: BRAND_ORANGE };

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(null), 2000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const sortedData = useMemo(() => {
        const items = [...data];
        if (sortBy === 'recent') {
            return items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        } else {
            return items.sort((a, b) => a.name.localeCompare(b.name));
        }
    }, [data, sortBy]);

    // --- RENDERIZADO ---
    if (loading) return <div style={containerStyle} className="p-6 text-center text-gray-500 text-white">Cargando tiendas...</div>;
    // Quitamos el return de error aquí para que el navbar siga visible incluso si hay error, 
    // pero si prefieres bloquear todo, descomenta la siguiente línea:
    // if (error) return <div style={containerStyle} className="p-6 text-center text-red-700 bg-red-100 rounded-lg text-white">Error: {error}</div>;

    const displayMessage = message || error;
    const isSuccess = !!message;

    return (
        <div style={containerStyle} className="min-h-screen flex flex-col items-center justify-start p-6 pb-32">
            <div className="w-full block justify-between items-center mb-6 max-w-4xl">
                <h1 className="text-3xl font-mont-bold text-white">Tiendas y Premios</h1>
                <div className="flex gap-4">
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setSortBy('recent')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${sortBy === 'recent'
                                    ? 'bg-white text-gray-800 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Más Recientes
                        </button>
                        <button
                            onClick={() => setSortBy('alpha')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${sortBy === 'alpha'
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

            <TableWithActions
                data={sortedData}
                onEdit={handleEditWrapper}
                onDelete={handleDelete}
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
                data={selectedStore ? { id: selectedStore.id, name: selectedStore.name, prizes: selectedStore.prizes } : null}
            />

            {/* NOTIFICACIÓN TOAST */}
            {displayMessage && (
                <div className="fixed bottom-24 right-6 z-50 p-4 rounded-xl shadow-2xl transition-all duration-300 transform">
                    <div className={`flex items-center space-x-3 p-3 rounded-xl border ${isSuccess ? 'bg-white border-green-200 text-gray-800' : 'bg-white border-red-200 text-gray-800'} max-w-xs`}>
                        <div className={`text-xl font-bold ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
                            {isSuccess ? '✓' : 'X'}
                        </div>
                        <div className="font-medium text-sm">
                            {displayMessage}
                        </div>
                    </div>
                </div>
            )}

            {/* NAVBAR INFERIOR CORREGIDO */}
            <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 flex items-center gap-2">

                {/* Botón JUGAR */}
                <button
                    // 5. CAMBIO: Usamos la función que verifica si hay storeId
                    onClick={handleGoHome} 
                    className="flex items-center gap-1 px-4 py-1 rounded-full bg-red-600 text-white font-black shadow-lg transform transition-transform active:scale-95 border-2 border-white/20 hover:bg-red-500"
                >
                    <Gamepad2 size={24} />
                    <span>VOLVER</span>
                </button>

                {/* Botón SETTINGS */}
                <button
                    onClick={() => navigate('/tiendas')}
                    className={`flex items-center justify-center w-12 h-12 rounded-full backdrop-blur-md border-2 border-white/30 transform transition-transform active:scale-95 hover:bg-white/30 shadow-lg ${
                         // 6. CAMBIO: Ahora location está definido
                         location.pathname === '/tiendas' ? 'bg-yellow-500 text-black' : 'bg-black/40 text-white'
                    }`}
                >
                    <Settings size={24} />
                </button>

            </div>
        </div>
    );
}