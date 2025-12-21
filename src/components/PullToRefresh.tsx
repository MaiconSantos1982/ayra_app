import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, ArrowDown } from 'lucide-react';
import { syncUserDataFromSupabase } from '../lib/supabaseAuth';

interface PullToRefreshProps {
    children: React.ReactNode;
}

export default function PullToRefresh({ children }: PullToRefreshProps) {
    const [startY, setStartY] = useState(0);
    const [pulling, setPulling] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [pullDistance, setPullDistance] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const LIMIT = 100; // Distância mínima para refresh em px

    const handleTouchStart = (e: React.TouchEvent) => {
        const scrollTop = containerRef.current?.scrollTop || 0;
        if (scrollTop === 0) {
            setStartY(e.touches[0].clientY);
            setPulling(true);
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!pulling || refreshing) return;

        const currentY = e.touches[0].clientY;
        const diff = currentY - startY;

        // Só permite puxar se estiver no topo e puxando para baixo
        if (diff > 0 && (containerRef.current?.scrollTop || 0) <= 0) {
            // Resistência (logarítmica para ficar mais difícil quanto mais puxa)
            const dampedDiff = diff * 0.5;
            setPullDistance(dampedDiff);

            // Impede scroll nativo enquanto puxa para refresh
            if (e.cancelable) {
                // e.preventDefault(); // Comentado pois pode bloquear scroll normal em alguns casos
            }
        } else {
            setPullDistance(0);
        }
    };

    const handleTouchEnd = async () => {
        if (!pulling || refreshing) return;
        setPulling(false);

        if (pullDistance > LIMIT) {
            setRefreshing(true);
            setPullDistance(LIMIT); // Mantém no lugar do loading

            // Inicia Refresh
            try {
                // Sincroniza dados
                if (localStorage.getItem('ayra_user_id')) {
                    await syncUserDataFromSupabase(Number(localStorage.getItem('ayra_user_id')));
                }

                // Aguarda um pouco para visualização
                await new Promise(resolve => setTimeout(resolve, 800));

                // Recarrega app
                window.location.reload();
            } catch (error) {
                console.error("Refresh error", error);
                setRefreshing(false);
                setPullDistance(0);
            }
        } else {
            setPullDistance(0); // Volta pro topo
        }
    };

    return (
        <div
            ref={containerRef}
            className="h-full w-full overflow-y-auto relative"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Indicador de Refresh */}
            <div
                className="absolute top-0 left-0 w-full flex justify-center pointer-events-none z-10"
                style={{
                    height: pullDistance,
                    opacity: Math.min(pullDistance / LIMIT, 1) // Aparece gradualmente
                }}
            >
                <div className="flex items-center justify-center mt-4">
                    {refreshing ? (
                        <div className="bg-primary/20 backdrop-blur-md p-2 rounded-full border border-primary/50 text-primary shadow-neon">
                            <RefreshCw className="animate-spin w-6 h-6" />
                        </div>
                    ) : (
                        <div
                            className={`p-2 rounded-full backdrop-blur-md border transition-all duration-300 ${pullDistance > LIMIT
                                ? 'bg-primary/20 border-primary text-primary scale-110 shadow-neon'
                                : 'bg-black/20 border-white/10 text-gray-400'
                                }`}
                            style={{ transform: `rotate(${pullDistance * 2}deg)` }}
                        >
                            <ArrowDown className="w-6 h-6" />
                        </div>
                    )}
                </div>
            </div>

            {/* Conteúdo com Transform */}
            <motion.div
                animate={{ y: refreshing ? LIMIT : pullDistance }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                className="min-h-full"
            >
                {children}
            </motion.div>
        </div>
    );
}
