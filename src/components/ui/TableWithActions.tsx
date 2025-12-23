import React, { useRef } from "react";
import {
  IconTrash,
  IconPencil,
  IconCopy,
  IconDownload
} from "@tabler/icons-react"; 
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeCanvas } from 'qrcode.react';

// Tipado actualizado para coincidir con la interfaz Store de Tienda.tsx
interface TableItem {
  id: string; // Corregido: de _id a id
  name: string; // Corregido: de nombre a name
  available_prizes_count: number; // Campo que muestra el total de premios disponibles
}

interface TableWithActionsProps {
  // Usamos la nueva interfaz TableItem
  data: TableItem[]; 
  // onEdit y onDelete deben usar la nueva clave 'id' y 'name'
  onEdit: (item: TableItem) => void;
  onDelete: (id: string) => void;
    isActionLoading?: boolean;
}

const TableWithActions: React.FC<TableWithActionsProps> = ({
  data,
  onEdit,
  onDelete,
isActionLoading = false,
}) => {
  const qrRefs = useRef<Record<string, HTMLCanvasElement | null>>({});
  // Asumimos que esta variable existe en tu .env o Vite config
  const baseUrl = import.meta.env.VITE_BASE_URL || "https://cocacolanavidadpromo.ptm.pe"; 

  // Reemplazamos alert() por una función que simule una notificación
  const notify = (msg: string) => {
    // En un entorno de producción de React, usarías un hook de notificaciones o un componente modal
    console.log(msg); 
    alert(msg); // Usamos alert() temporalmente para la prueba rápida
  };

  const handleCopy = (id: string) => {
    // La URL apunta al dominio y la ruta con el ID de la tienda
    const url = `${baseUrl}/${id}`; 
    // Usamos document.execCommand('copy') como fallback seguro en entornos restringidos
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url)
        .then(() => notify(`🔗 Link copiado:\n${url}`))
        .catch(() => notify("❌ Error al copiar (Intente usar el botón de descarga)"));
    } else {
      // Fallback para entornos antiguos/restringidos (ej. algunos iFrames)
      const textarea = document.createElement('textarea');
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        notify(`🔗 Link copiado:\n${url}`);
      } catch (err) {
        notify("❌ Error al copiar el link. No se pudo usar execCommand.");
      }
      document.body.removeChild(textarea);
    }
  };

  const handleDownloadQR = (id: string, name: string) => {
    const canvas = qrRefs.current[id];
    if (!canvas) {
        notify("❌ Error: QR no generado en el canvas.");
        return;
    }

    const pngUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = pngUrl;
    const safeName = name.replace(/\s+/g, "_").toLowerCase();
    link.download = `qr-${safeName}.png`;
    link.click();
  };

  return (
    <div className="overflow-x-auto bg-gray-100 shadow-lg rounded-lg m-4 p-2 w-full max-w-4xl">
      <table className="min-w-full table-auto">
        <thead>
          <tr className="bg-gray-200 text-center">
            <th className="py-2 px-4 border-b text-gray-800 font-bold">Nombre Tienda</th>
            <th className="py-2 px-4 border-b text-gray-800 font-bold">Premios Disponibles</th>
            <th className="py-2 px-4 border-b text-gray-800 font-bold">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence>
            {data.map((item) => {
              const url = `${baseUrl}/${item.id}`; 
              return (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="hover:bg-gray-200"
                >
                  <td className="py-2 px-4 border-b text-gray-800 font-bold">{item.name}</td> 
                  <td className="py-2 px-4 border-b text-gray-800 font-bold">{item.available_prizes_count}</td>
                  <td className="py-2 px-4 border-b flex justify-center gap-2">
                    
                    {/* Botón EDITAR */}
                    <button
                      onClick={() => onEdit(item)}
                      disabled={isActionLoading} // <--- USO DE LA VARIABLE
                      className={`text-white p-2 rounded-md transition ${
                        isActionLoading 
                          ? "bg-gray-400 cursor-not-allowed" 
                          : "bg-blue-500 hover:bg-blue-600"
                      }`}
                      title={isActionLoading ? "Cargando..." : "Editar"}
                    >
                      <IconPencil size={20} />
                    </button>
                    
                    {/* Botón ELIMINAR/DESACTIVAR */}
                    <button
                      onClick={() => onDelete(item.id)}
                      disabled={isActionLoading} // <--- USO DE LA VARIABLE
                      className={`text-white p-2 rounded-md transition ${
                        isActionLoading 
                          ? "bg-gray-400 cursor-not-allowed" 
                          : "bg-red-500 hover:bg-red-600"
                      }`}
                      title={isActionLoading ? "Cargando..." : "Eliminar/Desactivar"}
                    >
                      <IconTrash size={20} />
                    </button>
                    
                    {/* Botón COPIAR */}
                    <button
                      onClick={() => handleCopy(item.id)}
                      disabled={isActionLoading} // <--- USO DE LA VARIABLE
                      className={`text-gray-800 p-2 rounded-md transition ${
                        isActionLoading 
                          ? "bg-gray-400 cursor-not-allowed" 
                          : "bg-yellow-400 hover:bg-yellow-500"
                      }`}
                      title={isActionLoading ? "Cargando..." : "Copiar link de tienda"}
                    >
                      <IconCopy size={20} />
                    </button>
                    
                    {/* Botón DESCARGAR QR */}
                    <button
                      onClick={() => handleDownloadQR(item.id, item.name)}
                      disabled={isActionLoading} // <--- USO DE LA VARIABLE
                      className={`text-white p-2 rounded-md transition ${
                        isActionLoading 
                          ? "bg-gray-400 cursor-not-allowed" 
                          : "bg-purple-400 hover:bg-purple-500"
                      }`}
                      title={isActionLoading ? "Cargando..." : "Descargar QR"}
                    >
                      <IconDownload size={20} />
                    </button>

                    {/* QR oculto para descarga */}
                    <div className="hidden">
                      <QRCodeCanvas
                        value={url}
                        size={600}
                        level="H"
                        includeMargin={true}
                        ref={(ref) => {
                          qrRefs.current[item.id] = ref;
                        }}
                      />
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
};

export default TableWithActions;