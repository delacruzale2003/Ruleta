// src/constants/RegistrationConstants.ts

// Tipo para los parámetros de la ruta
export interface RouteParams extends Record<string, string | undefined> {
    storeId: string;
}

// Variables de Configuración (simulando que vienen de .env o Vite)
export const CAMPAIGN_ID = import.meta.env.VITE_CAMPAIGN;
export const API_URL = import.meta.env.VITE_API_URL;
