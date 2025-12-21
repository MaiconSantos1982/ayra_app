import { useState, useEffect } from 'react';
import { X, Share, PlusSquare, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function InstallPWA() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showModal, setShowModal] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        // Verifica se já está instalado (modo standalone)
        const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as any).standalone;
        setIsStandalone(isStandaloneMode);

        if (isStandaloneMode) return;

        // Detecta iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(isIosDevice);

        // Verifica se já mostrou hoje
        const lastPrompt = localStorage.getItem('ayra_pwa_prompt_date');
        const today = new Date().toISOString().split('T')[0];

        if (lastPrompt === today) return;

        // Android: Captura evento de instalação
        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            // Delay para mostrar
            setTimeout(() => setShowModal(true), 3000);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // iOS: Mostra modal após delay se não estiver instalado
        if (isIosDevice) {
            setTimeout(() => setShowModal(true), 3000);
        }

        return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setDeferredPrompt(null);
            setShowModal(false);
        }
    };

    const handleDismiss = () => {
        setShowModal(false);
        // Salva que já mostrou hoje para não incomodar
        localStorage.setItem('ayra_pwa_prompt_date', new Date().toISOString().split('T')[0]);
    };

    if (isStandalone) return null;

    return (
        <AnimatePresence>
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative"
                    >
                        <button
                            onClick={handleDismiss}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl mb-4 shadow-lg shadow-primary/20 flex items-center justify-center">
                                <span className="text-3xl font-bold text-white">A</span>
                            </div>

                            <h3 className="text-xl font-bold text-white mb-2">Instalar App Ayra</h3>
                            <p className="text-text-muted text-sm mb-6">
                                Instale nosso aplicativo para uma experiência muito mais rápida e fluida!
                            </p>

                            {isIOS ? (
                                <div className="space-y-3 w-full bg-white/5 p-4 rounded-xl text-left text-sm text-text-muted">
                                    <p className="flex items-center gap-3">
                                        1. Toque no botão <Share size={18} className="text-primary" /> Compartilhar
                                    </p>
                                    <p className="flex items-center gap-3">
                                        2. Selecione <PlusSquare size={18} className="text-primary" /> Adicionar à Tela de Início
                                    </p>
                                </div>
                            ) : (
                                <button
                                    onClick={handleInstallClick}
                                    className="w-full py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
                                >
                                    <Download size={20} />
                                    Instalar Agora
                                </button>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
