import React, { useRef } from "react";
import {
  IconTrash,
  IconPencil,
  IconExternalLink, // <--- CAMBIO: Importamos este icono en lugar de IconCopy
  IconDownload
} from "@tabler/icons-react"; 
import { Play } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeCanvas } from 'qrcode.react';

interface TableItem {
  id: string; 
  name: string; 
  available_prizes_count: number; 
}

interface TableWithActionsProps {
  data: TableItem[]; 
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
  const baseUrl = import.meta.env.VITE_BASE_URL || "https://cocacolanavidadpromo.ptm.pe"; 

  const notify = (msg: string) => {
    console.log(msg); 
    alert(msg); 
  };

  // <--- CAMBIO: Se eliminó la función 'handleCopy' completa ya que no se usará.

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
                      disabled={isActionLoading} 
                      className={`text-white p-2 rounded-md transition ${
                        isActionLoading 
                          ? "bg-gray-400 cursor-not-allowed" 
                          : "bg-blue-500 hover:bg-blue-600"
                      }`}
                      title={isActionLoading ? "Cargando..." : "Editar"}
                    >
                      <IconPencil size={20} />
                    </button>
                    
                    {/* Botón ELIMINAR */}
                    <button
                      onClick={() => onDelete(item.id)}
                      disabled={isActionLoading} 
                      className={`text-white p-2 rounded-md transition ${
                        isActionLoading 
                          ? "bg-gray-400 cursor-not-allowed" 
                          : "bg-red-500 hover:bg-red-600"
                      }`}
                      title={isActionLoading ? "Cargando..." : "Eliminar/Desactivar"}
                    >
                      <IconTrash size={20} />
                    </button>
                    
                    {/* <--- CAMBIO PRINCIPAL AQUÍ (Botón IR A LINK) */}
                    <button
    onClick={() => window.open(url, '_blank')}
    disabled={isActionLoading}
    className={`text-white p-2 rounded-md transition shadow-sm ${
        isActionLoading 
            ? "bg-gray-400 cursor-not-allowed" 
            : "bg-green-500 hover:bg-green-600 hover:shadow-md" // Verde Play
    }`}
    title={isActionLoading ? "Cargando..." : "Jugar / Ir a tienda"}
>
    {/* fill="currentColor" hace que el triángulo quede relleno */}
    <Play size={20} fill="currentColor" /> 
</button>
                    
                    

                    {/* QR oculto */}
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