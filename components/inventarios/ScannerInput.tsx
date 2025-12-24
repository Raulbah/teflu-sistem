'use client';

import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, ScanBarcode, Search } from 'lucide-react';
import { toast } from 'sonner';
import { registrarEscaneoAction } from '@/server/actions/herramental-actions';

export function ScannerInput() {
    const [code, setCode] = useState('');
    const [isProcessing, setIsProcessing] = useState(false); // Usamos esto en lugar de isPending para no bloquear el UI
    const inputRef = useRef<HTMLInputElement>(null);

    // 1. Foco inicial al cargar
    useEffect(() => {
        const timer = setTimeout(() => {
            inputRef.current?.focus();
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    // 2. Función para asegurar el foco siempre
    const refocus = () => {
        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.focus();
            }
        }, 50); // Pequeño delay para asegurar que el DOM esté listo
    };

    const handleScan = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Evitar envíos dobles si ya estamos procesando uno
        if (!code || isProcessing) return;

        setIsProcessing(true);
        
        // Guardamos el código actual para enviarlo y limpiamos el input INMEDIATAMENTE
        // Esto permite que el operario sienta que el sistema está listo para el siguiente,
        // aunque estemos procesando el anterior en background.
        const codeToSend = code;
        setCode(''); 

        try {
            const res = await registrarEscaneoAction(codeToSend);

            if (res.error) {
                toast.error(res.error, { duration: 3000 });
                // Si hubo error, quizás quieras devolver el código al input para corregirlo, 
                // o dejarlo vacío para seguir. Aquí lo dejamos vacío para flujo continuo.
            } else {
                toast.success(`Entrada: ${res.toolName}`, {
                    description: `Turno: ${res.turno}`,
                    duration: 2000, // Duración corta para no estorbar visualmente
                });
            }
        } catch (error) {
            toast.error("Error de conexión");
        } finally {
            setIsProcessing(false);
            refocus(); // 3. IMPORTANTE: Recuperar foco al terminar
        }
    };

    // 4. Recuperar foco si el usuario da clic fuera del input (Opcional, estilo Kiosco)
    const handleBlur = () => {
        // Solo recuperamos el foco si NO estamos procesando, para evitar conflictos
        if (!isProcessing) {
           // refocus(); // Descomenta esta línea si quieres ser MUY agresivo (modo kiosco total)
        }
    };

    // 5. Detectar clic en cualquier parte del componente para enfocar
    const handleContainerClick = () => {
        inputRef.current?.focus();
    };

    return (
        <div 
            className="bg-white p-6 rounded-xl border shadow-sm space-y-4 cursor-text"
            onClick={handleContainerClick} // Clic en la tarjeta enfoca el input
        >
            <div className="text-center space-y-2 select-none"> {/* select-none evita que seleccionen texto al dar clic rápido */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto transition-colors duration-300 ${isProcessing ? 'bg-yellow-100 text-yellow-600' : 'bg-blue-50 text-blue-600'}`}>
                    {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <ScanBarcode className="w-6 h-6" />}
                </div>
                <h3 className="text-lg font-bold">Registro de Inventario</h3>
                <p className="text-slate-500 text-sm">
                    {isProcessing ? 'Procesando...' : 'Escáner listo para lectura'}
                </p>
            </div>

            <form onSubmit={handleScan} className="flex gap-2">
                <Input 
                    ref={inputRef}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    onBlur={handleBlur}
                    placeholder="Escanear código..."
                    className="text-lg h-12 border-2 focus-visible:ring-offset-2"
                    autoComplete="off"
                    autoFocus
                    // IMPORTANTE: NO usamos disabled={isProcessing} aquí
                    // Si lo deshabilitas, el navegador quita el foco automáticamente.
                    readOnly={isProcessing} // Opcional: evita que escriban mientras procesa, pero mantiene el foco
                />
                <Button 
                    type="submit" 
                    size="icon" 
                    className="h-12 w-12 shrink-0" 
                    disabled={isProcessing} // El botón sí se puede deshabilitar
                >
                    {isProcessing ? <Loader2 className="animate-spin" /> : <Search />}
                </Button>
            </form>
            
            <div className="text-xs text-center text-slate-400 select-none">
                Modo de escaneo continuo activo
            </div>
        </div>
    );
}