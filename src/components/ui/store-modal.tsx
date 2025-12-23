// components/ui/NewStoreModal.tsx
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface NewStoreModalProps {
  show: boolean;
  onClose: () => void;
  onCreate: (name: string, prizes: { nombre: string; cantidad: number }[]) => void;
  prizeOptions: string[];
}

const NewStoreModal: React.FC<NewStoreModalProps> = ({
  show,
  onClose,
  onCreate,
  prizeOptions,
}) => {
  const [name, setName] = useState("");
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  // Inicializa las cantidades en 0
  useEffect(() => {
    const init: Record<string, number> = {};
    prizeOptions.forEach((p) => (init[p] = 0));
    setQuantities(init);
  }, [prizeOptions]);

  const handleQtyChange = (prize: string, value: string) => {
    setQuantities((prev) => ({
      ...prev,
      [prize]: Math.max(0, Number(value)),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedPrizes = prizeOptions
      .map((p) => ({ nombre: p, cantidad: quantities[p] }))
      .filter((pr) => pr.cantidad > 0);

    onCreate(name, selectedPrizes);
    onClose();
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white p-6 rounded-md shadow-md w-96 max-h-[80vh] overflow-y-auto"
          >
            <h2 className="text-xl mb-4 text-black">Nueva Tienda + Premios</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700">
                  Nombre de la tienda
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <p className="font-semibold mb-2">Premios a asignar</p>
                {prizeOptions.map((prize) => (
                  <div key={prize} className="flex items-center mb-2">
                    <span className="flex-1">{prize}</span>
                    <input
                      type="number"
                      min="0"
                      value={quantities[prize]}
                      onChange={(e) => handleQtyChange(prize, e.target.value)}
                      className="w-20 p-1 border border-gray-300 rounded-md"
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-300 rounded-md"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md"
                >
                  Crear
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
