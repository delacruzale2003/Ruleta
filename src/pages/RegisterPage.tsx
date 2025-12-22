import React, { useState } from "react"; // 💡 Importamos useState
import { useRegistration } from "../hooks/useRegistration";
import { User, Phone, Scan, Loader2, X } from 'lucide-react'; // 💡 Importamos X para el botón de cerrar

const RegisterPage: React.FC = () => {
    // 1. 💡 NUEVO ESTADO: Controla si el modal de términos está visible
    const [showTermsModal, setShowTermsModal] = useState(true);

    // Usamos el hook personalizado para acceder a toda la lógica y estados
    const {
        loading,
        compressing,
        preview,
        compressedFile,
        message,
        name,
        dni,
        phoneNumber,
        voucherNumber,
        storeId,
        setName,
        setDni,
        setPhoneNumber,
        setVoucherNumber,
        handleFileChange,
        handleSubmit,
    } = useRegistration();

    // 💡 NUEVA FUNCIÓN: Para cerrar el modal
    const handleCloseModal = () => {
        setShowTermsModal(false);
    };

    // Colores y sombras personalizados (para uso INLINE)
    const neonGreen = "#a2e71a";
    const neonGlowStyle = {
        boxShadow: `0 0 10px ${neonGreen}, 0 0 20px ${neonGreen}`,
        borderColor: neonGreen,
    };
    const inputBorderStyle = {
        borderColor: neonGreen,
    };

    // 💡 Lógica de validación centralizada
    const isFormValid = name.trim() !== ''
        && phoneNumber.trim() !== ''
        && dni.trim() !== ''
        && voucherNumber.trim() !== ''
        && compressedFile;

    // 💡 CAMBIO: El formulario se deshabilita si el modal está abierto
    const isDisabled = loading || compressing || !isFormValid || showTermsModal;

    const backgroundStyle = {
        // Asegura que la imagen de fondo esté disponible en la carpeta 'public'
        backgroundImage: `url('/bg.png')`,
        backgroundSize: 'cover', // Cubre todo el contenedor
        backgroundPosition: 'center', // Centra la imagen
        backgroundRepeat: 'no-repeat', // No repite la imagen
    };

    return (
        // 💡 CAMBIO DE TEMA: Fondo principal negro/gris oscuro.
        <div style={backgroundStyle} className="min-h-screen flex flex-col items-center justify-start p-4 pb-28 relative bg-black">

            {/* Logo de la Campaña */}
            <img
                src="/logomonster.png"
                alt="logomonsteroxxo"
                className="w-40 h-auto mb-4 z-10"
            />

            {/* Contenedor del Formulario (Transparente) */}
            <form
                id="registrationForm"
                onSubmit={async (e) => {
                    e.preventDefault();

                    // --- REVALIDACIÓN Y MANEJO DE FORMATOS AQUÍ (Frontend) ---
                    const trimmedName = name.trim();
                    const trimmedPhone = phoneNumber.trim();
                    const trimmedDni = dni.trim();
                    const trimmedVoucher = voucherNumber.trim();
                    let validationError = '';

                    // 💡 PASO 1: VERIFICACIÓN RÁPIDA DE CAMPOS VACÍOS (Obligatoriedad)
                    if (!trimmedName || !trimmedPhone || !trimmedDni || !trimmedVoucher || !compressedFile) {
                        validationError = "❌ Todos los campos son obligatorios.";
                    }
                    // 2. Validar Nombre
                    else if (trimmedName.length > 45) {
                        validationError = "❌ Nombre inválido error de formato";
                    }
                    // 3. Validar Teléfono (9 dígitos)
                    else if (trimmedPhone.length !== 9 || !/^\d+$/.test(trimmedPhone)) {
                        validationError = "❌ Teléfono debe tener  9 dígitos numéricos.";
                    }
                    // 4. Validar DNI (8-11 dígitos)
                    else if (trimmedDni.length < 8 || trimmedDni.length > 11 || !/^\d+$/.test(trimmedDni)) {
                        validationError = "❌ DNI inválido error de formato";
                    }
                    // 5. Validar Comprobante (6-20 caracteres)
                    else if (trimmedVoucher.length < 6 || trimmedVoucher.length > 20) {
                        validationError = "❌ Comprobante inválido error de formato .";
                    }

                    if (validationError) {
                        alert(validationError); // Usamos alert temporalmente para mensajes de error de formato
                        return;
                    }

                    // Si pasa el frontend, se llama al handleSubmit del hook
                    handleSubmit(e);
                }}
                // 💡 ESTILO NEÓN DEL CONTENEDOR
                className="bg-transparent border border-3 rounded-4xl p-6 pt-4 w-full max-w-md space-y-1 mb-6 z-10"
                style={{ ...neonGlowStyle, ...inputBorderStyle }}
            >
                <h1 className="text-4xl text-start text-white font-teko ">
                    1.REGISTRATE PARA PARTICIPAR
                </h1>
                <h2 className="text-start font-mont-bold text-white text-lg mb-4">Llena tus datos y participa por fabulosos premios</h2>

                {/* ID de Tienda Oculto */}
                {storeId && (
                    <p className="text-sm text-center font-mont-bold text-white/80">Tienda ID: {storeId.substring(0, 8)}...</p>
                )}

                {/* Mensaje de Error/Éxito */}
                {message && (
                    <p className="text-center text-sm font-medium mt-2 p-3 bg-red-100 text-red-700 rounded-lg">{message}</p>
                )}


                {/* Campo Nombre */}
                <div className="">
                    <label className="block text-white text-md font-medium font-mont-bold mt-2">Nombre completo</label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                        <input
                            type="text"
                            name="name"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            maxLength={45}
                            style={inputBorderStyle}
                            className="bg-transparent border-3 p-3 w-full rounded-full text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all pl-10 shadow-inner"
                        />
                    </div>
                </div>

                {/* Campo DNI (OBLIGATORIO) */}
                <div className="">
                    <label className="block text-white text-md font-medium font-mont-bold mt-2">DNI</label>
                    <div className="relative">
                        <Scan className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                        <input
                            type="text"
                            name="dni"
                            value={dni}
                            onChange={(e) => setDni(e.target.value)}
                            maxLength={11}
                            required
                            style={inputBorderStyle}
                            className="bg-transparent border-3 p-3 w-full rounded-full text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all pl-10 shadow-inner"
                        />
                    </div>
                </div>

                {/* Campo VOUCHER ID (AHORA OBLIGATORIO) */}
                <div className="">
                    <label className="block text-white text-md font-medium font-mont-bold mt-2">Número de Comprobante</label>
                    <div className="relative">
                        <Scan className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                        <input
                            type="text"
                            name="voucher_number"
                            value={voucherNumber}
                            onChange={(e) => setVoucherNumber(e.target.value)}
                            maxLength={20}
                            required
                            style={inputBorderStyle}
                            className="bg-transparent border-3 p-3 w-full rounded-full text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all pl-10 shadow-inner"
                        />
                    </div>
                </div>

                {/* Campo Teléfono */}
                <div className="">
                    <label className="block text-white text-md font-medium font-mont-bold mt-2">Número de teléfono</label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                        <input
                            type="tel"
                            name="phone_number"
                            required
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            maxLength={9}
                            style={inputBorderStyle}
                            className="bg-transparent border-3 p-3 w-full rounded-full text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all pl-10 shadow-inner"
                        />
                    </div>
                </div>

                {/* Campo Foto */}
                <div className="space-y-1">
                    <label className="block text-white text-md font-medium font-mont-bold mt-2">Comprobante / Foto</label>
                    <input
                        type="file"
                        name="photo_url"
                        accept="image/*"
                        required
                        onChange={handleFileChange}
                        // 💡 ESTILO FILE INPUT: Botón con fondo verde predefinido
                        className="w-full text-white/90 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-green-500 file:text-black hover:file:bg-green-600"
                    />

                    {/* Preview cuadrado con loader */}
                    {preview && (
                        <div className="relative w-32 h-32 border rounded-xl overflow-hidden mx-auto mt-4 shadow-md border-green-500">
                            <img src={preview} alt="preview" className="object-cover w-full h-full" />
                            {compressing && (
                                <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
                                    <Loader2 className="animate-spin w-8 h-8 text-white" />
                                </div>
                            )}
                            {compressedFile && !compressing && (
                                <p className="absolute bottom-0 right-0 text-xs bg-gray-800 text-white p-1 rounded-tl-lg">
                                    {`${(compressedFile.size / 1024).toFixed(1)} KB`}
                                </p>
                            )}
                        </div>
                    )}
                </div>

            </form>

            {/* BARRA FIJA INFERIOR PARA EL BOTÓN EN MÓVIL */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-transparent border-none z-20">
                <button
                    type="submit"
                    form="registrationForm" // <-- Vincula el botón al formulario por ID
                    disabled={isDisabled}
                    style={{ ...neonGlowStyle, ...inputBorderStyle }}
                    // 💡 ESTILO BOTÓN: Usamos los estilos NEON y la clase para el texto y tamaño
                    className={`bg-transparent font-teko rounded-full text-5xl sm:text-2xl text-white p-3 w-50 max-w-md font-semibold transition-opacity duration-200 shadow-xl mx-auto block
                border-2 hover:opacity-80 disabled:opacity-50`}
                >
                    {loading ? "ENVIANDO..." : "ENVIAR"}
                </button>
            </div>

            {/* 2. 💡 COMPONENTE MODAL DE TÉRMINOS Y CONDICIONES */}
            {showTermsModal && (
                // Overlay: Usa el fondo negro con blur para mantener el estilo oscuro.
                <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">

                    {/* Contenido del Modal */}
                    <div
                        className="bg-black border border-3 rounded-4xl p-6 pt-4 w-full max-w-md max-h-[90vh] flex flex-col relative shadow-2xl"
                        style={neonGlowStyle} // Aplicamos el glow neón al modal
                    >

                        {/* Botón de Cerrar (X) en la esquina */}
                        <button
                            onClick={handleCloseModal}
                            className="absolute top-3 right-3 text-white hover:text-green-500 transition-colors"
                            aria-label="Cerrar términos y condiciones"
                        >
                            <X size={24} />
                        </button>

                        {/* Título */}


                        {/* Contenido Desplazable */}
                        <div className="flex-grow overflow-y-auto text-white text-sm space-y-1 pb-4 pr-2">

                            <p className="font-mont-medium text-white p-1">
                                Promoción válida del 04 de diciembre al 31 de enero del 2026.
                                Mecánica: Participan personas naturales mayores de 18 años,
                                con residencia legal y domicilio en el territorio nacional del
                                Perú, que realice la compra de Coca-Cola, en las tiendas seleccionadas ; para participar de la promoción MONSTER
                                CAMPAÑA OXXO, deberás comprar 2 latas de monster y
                                podrás escanear el código QR ubicado en las tiendas autorizadas, llenar los datos de tu boucher, subir su foto y entras al
                                sorteo por diferentes premios. El horario para ingresar a la
                                landing page será en los horarios de atención de las tiendas
                                OXXO .
                            </p>
                            <p className="font-mont-medium text-white p-1">
                                Los premios son Gaming keyboard/mouse, Mon Turtle beach
                                Gaming Headset y Sillas gamer .
                                Modalidad de entrega de premios: Se entregarán los premios
                                previo sorteo entre los registrados ; y se coordinará con el
                                cliente el recojo de su premio en las oficinas de Coca-Cola en
                                Av. República de Panamá 4050, Surquillo.
                            </p>


                            
                        </div>

                        {/* Botón de Continuar */}
                        <button
                            onClick={handleCloseModal}
                            style={neonGlowStyle}
                            className="mt-4 bg-transparent border-2 rounded-full text-2xl text-white p-3 font-teko hover:opacity-80 transition-opacity shadow-lg"
                        >
                            CONTINUAR
                        </button>

                    </div>
                </div>
            )}
        </div>
    );
};

export default RegisterPage;