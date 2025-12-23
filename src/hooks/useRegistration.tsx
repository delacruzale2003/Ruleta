import { useState } from "react";
import { useParams } from "react-router-dom";
import { API_URL, CAMPAIGN_ID } from "../constants/RegistrationConstants";
import type { RouteParams } from "../constants/RegistrationConstants";

// 1. Definimos el tipo de respuesta para que sea más ordenado
export interface SpinResult {
    success: boolean;
    prizeName?: string;
    registerId?: string;
}

// 2. Actualizamos la interfaz del Hook
interface RouletteHook {
    loading: boolean;
    message: string;
    storeId: string | undefined;
    // 💡 CORRECCIÓN: Ahora indicamos que devuelve una promesa con SpinResult, no void
    handleSpin: () => Promise<SpinResult>; 
}

export const useRegistration = (): RouletteHook => {
    // === ESTADOS ===
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    // === HOOKS DE ROUTER ===
    const { storeId } = useParams<RouteParams>();
    // Nota: Ya no necesitamos useNavigate aquí dentro, porque la navegación la hace la UI

    // === ACCIÓN DE GIRAR ===
    const handleSpin = async (): Promise<SpinResult> => {
        setMessage("");
        
        // Validación inicial
        if (!storeId) return { success: false };

        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/api/v1/spin-roulette`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ storeId, campaign: CAMPAIGN_ID }),
            });
            const resJson = await res.json();

            if (res.ok) {
                // Éxito: Devolvemos los datos a la vista
                return { 
                    success: true, 
                    prizeName: resJson.prize, 
                    registerId: resJson.registerId 
                };
            } else {
                // Error de lógica (ej: stock agotado)
                setMessage(`⚠️ ${resJson.message || "Error"}`);
                return { success: false };
            }
        } catch (err) {
            // Error de red
            setMessage("❌ Error de conexión");
            return { success: false };
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        message,
        storeId,
        handleSpin,
    };
};