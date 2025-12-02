import { useAuth } from '../contexts/AuthContext';
import { User, Settings, LogOut, Crown, ChevronRight, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
    const { profile, signOut } = useAuth();
    const navigate = useNavigate();
    const isPremium = profile?.plano === 'premium';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col items-center pt-4">
                <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center border-4 border-primary mb-3 shadow-neon">
                    <span className="text-4xl font-bold text-white">
                        {profile?.nome?.charAt(0).toUpperCase() || 'A'}
                    </span>
                </div>
                <h1 className="text-2xl font-bold text-white">{profile?.nome || 'Atleta Ayra'}</h1>
                <span className="text-sm text-text-muted bg-white/5 px-3 py-1 rounded-full mt-2 border border-white/10">
                    {isPremium ? 'Membro Premium 🌟' : 'Plano Grátis'}
                </span>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-background-light p-4 rounded-xl border border-white/5">
                    <span className="text-xs text-text-muted block mb-1">Objetivo</span>
                    <span className="font-bold text-white">Hipertrofia</span>
                </div>
                <div className="bg-background-light p-4 rounded-xl border border-white/5">
                    <span className="text-xs text-text-muted block mb-1">Peso Atual</span>
                    <span className="font-bold text-white">75.5 kg</span>
                </div>
            </div>

            {/* Premium Banner */}
            {!isPremium && (
                <div className="bg-gradient-to-r from-secondary to-primary p-5 rounded-xl shadow-neon relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="font-bold text-white text-lg flex items-center gap-2">
                            <Crown size={20} /> Seja Premium
                        </h3>
                        <p className="text-black/80 text-sm mt-1 mb-3 font-medium">
                            Desbloqueie gráficos avançados, chat ilimitado e muito mais.
                        </p>
                        <button
                            onClick={() => navigate('/premium')}
                            className="bg-black text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-black/80 transition-colors"
                        >
                            Começar Teste Grátis
                        </button>
                    </div>
                    <div className="absolute -right-4 -bottom-4 opacity-20">
                        <Crown size={100} />
                    </div>
                </div>
            )}

            {/* Settings List */}
            <div className="bg-background-light rounded-xl border border-white/5 overflow-hidden">
                <button
                    onClick={() => navigate('/perfil/metas')}
                    className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors border-b border-white/5"
                >
                    <div className="flex items-center gap-3">
                        <div className="bg-white/10 p-2 rounded-lg">
                            <Settings size={18} className="text-primary" />
                        </div>
                        <span className="text-white font-medium">Editar Metas</span>
                    </div>
                    <ChevronRight size={18} className="text-text-muted" />
                </button>

                <button
                    onClick={() => navigate('/perfil/dados-pessoais')}
                    className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors border-b border-white/5"
                >
                    <div className="flex items-center gap-3">
                        <div className="bg-white/10 p-2 rounded-lg">
                            <User size={18} className="text-primary" />
                        </div>
                        <span className="text-white font-medium">Dados Pessoais</span>
                    </div>
                    <ChevronRight size={18} className="text-text-muted" />
                </button>

                <button
                    onClick={() => navigate('/configuracoes')}
                    className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors border-b border-white/5"
                >
                    <div className="flex items-center gap-3">
                        <div className="bg-white/10 p-2 rounded-lg">
                            <Settings size={18} className="text-primary" />
                        </div>
                        <span className="text-white font-medium">Configurações</span>
                    </div>
                    <ChevronRight size={18} className="text-text-muted" />
                </button>

                {/* Admin Panel Button - Only for admins */}
                {profile?.id_usuario && (
                    <button
                        onClick={() => navigate('/admin')}
                        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors border-b border-white/5"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-2 rounded-lg">
                                <Shield size={18} className="text-purple-400" />
                            </div>
                            <span className="text-white font-medium">Painel Admin</span>
                        </div>
                        <ChevronRight size={18} className="text-text-muted" />
                    </button>
                )}

                <button
                    onClick={signOut}
                    className="w-full flex items-center justify-between p-4 hover:bg-danger/10 transition-colors group"
                >
                    <div className="flex items-center gap-3">
                        <div className="bg-danger/10 p-2 rounded-lg group-hover:bg-danger/20">
                            <LogOut size={18} className="text-danger" />
                        </div>
                        <span className="text-danger font-medium">Sair da Conta</span>
                    </div>
                </button>
            </div>
        </div>
    );
}
