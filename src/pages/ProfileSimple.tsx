import { User, LogOut, /* Download, Upload, */ Settings, Crown, UtensilsCrossed, Target, RefreshCw, Smartphone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getUserData, getStats, /* exportData, importData */ } from '../lib/localStorage';
import { useState /* , useRef */ } from 'react';
import Toast from '../components/Toast';
import type { ToastType } from '../components/Toast';
import PushNotificationSettings from '../components/PushNotificationSettings';

export default function ProfileSimple() {
    const { user, signOut, refreshPremium } = useAuth();
    const navigate = useNavigate();
    const [userData] = useState(getUserData());
    const [stats] = useState(getStats());
    const [refreshing, setRefreshing] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
    // const fileInputRef = useRef<HTMLInputElement>(null);

    const handleLogout = () => {
        setShowLogoutModal(true);
    };

    const confirmLogout = () => {
        setShowLogoutModal(false);
        setToast({ message: 'Até logo! 👋', type: 'success' });
        setTimeout(() => {
            signOut();
        }, 1000);
    };

    const handleRefreshPremium = async () => {
        setRefreshing(true);
        await refreshPremium();
        setRefreshing(false);
        setToast({ message: 'Status atualizado!', type: 'success' });
    };

    /* Funções de Export/Import - OCULTAS (descomente para reativar)
    const handleExport = () => {
        const jsonData = exportData();
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ayra-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);

        alert('✅ Dados exportados com sucesso!');
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const jsonString = event.target?.result as string;
                const success = importData(jsonString);

                if (success) {
                    alert('✅ Dados importados com sucesso!');
                    window.location.reload();
                } else {
                    alert('❌ Erro ao importar dados. Verifique o arquivo.');
                }
            } catch (error) {
                alert('❌ Erro ao ler arquivo.');
            }
        };
        reader.readAsText(file);
    };
    */

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <div className="bg-gradient-to-br from-purple-900 to-purple-800 p-6 rounded-b-3xl shadow-lg mb-6">
                <div className="flex items-center gap-4">
                    <div className="bg-primary/20 p-4 rounded-full">
                        <User className="w-12 h-12 text-primary" />
                    </div>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-white">
                            {userData?.profile.nome || 'Usuário'}
                        </h1>
                        <p className="text-purple-200 text-sm">
                            {user?.email || 'Sem email'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="px-6 mb-6">
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-card rounded-2xl p-4 border border-white/5 text-center">
                        <p className="text-3xl font-bold text-primary">{stats?.streak || 0}</p>
                        <p className="text-xs text-gray-400 mt-1">Dias seguidos</p>
                    </div>
                    <div className="bg-card rounded-2xl p-4 border border-white/5 text-center">
                        <p className="text-3xl font-bold text-primary">{stats?.totalMeals || 0}</p>
                        <p className="text-xs text-gray-400 mt-1">Refeições</p>
                    </div>
                    <div className="bg-card rounded-2xl p-4 border border-white/5 text-center">
                        <p className="text-3xl font-bold text-primary">{stats?.totalDays || 0}</p>
                        <p className="text-xs text-gray-400 mt-1">Dias ativos</p>
                    </div>
                </div>
            </div>

            {/* Informações do Perfil */}
            <div className="px-6 mb-6">
                <h2 className="text-lg font-bold text-white mb-3">Informações</h2>

                <div className="bg-card rounded-2xl border border-white/5 divide-y divide-white/5">
                    {userData?.profile.objetivo && (
                        <div className="p-4">
                            <p className="text-gray-400 text-sm">Objetivo</p>
                            <p className="text-white font-semibold mt-1 capitalize">
                                {userData.profile.objetivo.replace('_', ' ')}
                            </p>
                        </div>
                    )}

                    {userData?.profile.peso && (
                        <div className="p-4">
                            <p className="text-gray-400 text-sm">Peso Atual</p>
                            <p className="text-white font-semibold mt-1">{userData.profile.peso} kg</p>
                        </div>
                    )}

                    {userData?.profile.altura && (
                        <div className="p-4">
                            <p className="text-gray-400 text-sm">Altura</p>
                            <p className="text-white font-semibold mt-1">{userData.profile.altura} cm</p>
                        </div>
                    )}

                    {userData?.profile.restricoes && (
                        <div className="p-4">
                            <p className="text-gray-400 text-sm">Restrições Alimentares</p>
                            <p className="text-white font-semibold mt-1">{userData.profile.restricoes}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Plano Premium/Free */}
            <div className="px-6 mb-6">
                <div className={`rounded-2xl p-4 border ${user?.premium
                    ? 'bg-gradient-to-br from-yellow-500/30 to-orange-500/30 border-yellow-500/50'
                    : 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/30'
                    }`}>
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-xl ${user?.premium ? 'bg-yellow-500/30' : 'bg-yellow-500/20'
                                }`}>
                                <Crown className="w-6 h-6 text-yellow-500" />
                            </div>
                            <div>
                                <p className="text-white font-bold">
                                    {user?.premium ? 'Plano Premium ⭐' : 'Plano Free'}
                                </p>
                                <p className="text-gray-300 text-sm">
                                    {user?.premium
                                        ? 'Você tem acesso a todos os recursos!'
                                        : 'Upgrade para Premium'
                                    }
                                </p>
                            </div>
                        </div>
                        {!user?.premium && (
                            <button
                                onClick={() => window.open('https://youtu.be/SLioH4rHjFc', '_blank')}
                                className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold px-4 py-2 rounded-xl text-sm hover:scale-105 transition-transform"
                            >
                                Upgrade
                            </button>
                        )}
                    </div>

                    {/* Botão Atualizar Status */}
                    <button
                        onClick={handleRefreshPremium}
                        disabled={refreshing}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 flex items-center justify-center gap-2 text-sm text-gray-300 hover:bg-white/10 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        {refreshing ? 'Atualizando...' : 'Atualizar Status do Plano'}
                    </button>
                </div>
            </div>

            {/* Ações */}
            <div className="px-6 mb-6">
                <h2 className="text-lg font-bold text-white mb-3">Meu Perfil</h2>

                <div className="space-y-3">
                    {/* Dados Pessoais e Dieta - DESTAQUE */}
                    <button
                        onClick={() => navigate('/anamnese')}
                        className="w-full bg-gradient-to-r from-primary/20 to-green-400/20 border-2 border-primary/50 rounded-2xl p-4 flex items-center justify-between hover:border-primary hover:scale-[1.02] transition-all"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-primary/30 p-2 rounded-xl">
                                <UtensilsCrossed className="w-5 h-5 text-primary" />
                            </div>
                            <div className="text-left">
                                <span className="text-white font-bold block">Dados Pessoais e Dieta</span>
                                <span className="text-sm text-gray-300">
                                    {userData?.profile.segueDieta ? '✓ Dieta configurada' : 'Configure sua dieta personalizada'}
                                </span>
                            </div>
                        </div>
                        <span className="text-primary text-xl">→</span>
                    </button>

                    {/* Minhas Metas - DESTAQUE */}
                    <button
                        onClick={() => navigate('/metas')}
                        className="w-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-2 border-blue-500/50 rounded-2xl p-4 flex items-center justify-between hover:border-blue-500 hover:scale-[1.02] transition-all"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-500/30 p-2 rounded-xl">
                                <Target className="w-5 h-5 text-blue-400" />
                            </div>
                            <div className="text-left">
                                <span className="text-white font-bold block">Minhas Metas</span>
                                <span className="text-sm text-gray-300">Calorias, macros e objetivos</span>
                            </div>
                        </div>
                        <span className="text-blue-400 text-xl">→</span>
                    </button>

                    {/* Editar Perfil Básico */}
                    <button
                        onClick={() => navigate('/onboarding?edit=true')}
                        className="w-full bg-card border border-white/10 rounded-2xl p-4 flex items-center justify-between hover:border-primary/30 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <Settings className="w-5 h-5 text-gray-400" />
                            <span className="text-white font-semibold">Editar Perfil Básico</span>
                        </div>
                        <span className="text-gray-400">→</span>
                    </button>
                </div>
            </div>

            {/* Dados e Backup - OCULTO (para reativar, descomente esta seção) */}
            {/* <div className="px-6 mb-6">
                <h2 className="text-lg font-bold text-white mb-3">Dados e Backup</h2>

                <div className="space-y-3">
                    <button
                        onClick={handleExport}
                        className="w-full bg-card border border-white/10 rounded-2xl p-4 flex items-center justify-between hover:border-primary/30 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <Download className="w-5 h-5 text-blue-400" />
                            <span className="text-white font-semibold">Exportar Dados</span>
                        </div>
                        <span className="text-gray-400">→</span>
                    </button>

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full bg-card border border-white/10 rounded-2xl p-4 flex items-center justify-between hover:border-primary/30 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <Upload className="w-5 h-5 text-green-400" />
                            <span className="text-white font-semibold">Importar Dados</span>
                        </div>
                        <span className="text-gray-400">→</span>
                    </button>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json"
                        onChange={handleImport}
                        className="hidden"
                    />
                </div>
            </div> */}

            {/* Configurações do App */}
            <div className="px-6 mb-6">
                <h2 className="text-lg font-bold text-white mb-3">Configurações do App</h2>
                <div className="space-y-3">
                    <button
                        onClick={() => {
                            localStorage.removeItem('ayra_pwa_prompt_date');
                            window.location.reload();
                        }}
                        className="w-full bg-card border border-white/10 rounded-2xl p-4 flex items-center justify-between hover:border-primary/30 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <Smartphone className="w-5 h-5 text-purple-400" />
                            <div className="text-left">
                                <span className="text-white font-semibold block">Instalar Aplicativo</span>
                                <span className="text-xs text-gray-400">Adicionar à tela inicial</span>
                            </div>
                        </div>
                        <span className="text-gray-400">→</span>
                    </button>
                </div>
            </div>

            {/* Push Notifications */}
            <div className="px-6 mb-6">
                <h2 className="text-lg font-bold text-white mb-3">Notificações Push</h2>
                <PushNotificationSettings />
            </div>

            {/* Sair */}
            <div className="px-6 mb-6">
                <button
                    onClick={handleLogout}
                    className="w-full bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-center justify-between hover:bg-red-500/20 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <LogOut className="w-5 h-5 text-red-400" />
                        <span className="text-red-400 font-semibold">Sair</span>
                    </div>
                    <span className="text-red-400">→</span>
                </button>
            </div>

            {/* Info */}
            <div className="px-6 mb-6">
                <div className="bg-card/50 rounded-2xl p-4 border border-white/5">
                    <p className="text-gray-400 text-xs text-center">
                        Ayra v1.0 - MVP Simplificado
                    </p>
                    <p className="text-gray-500 text-xs text-center mt-1">
                        Seus dados são armazenados localmente no seu dispositivo
                    </p>
                </div>
            </div>

            {/* Modal de Confirmação de Logout */}
            {showLogoutModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 px-6">
                    <div className="bg-card border border-white/10 rounded-2xl p-6 max-w-sm w-full">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-red-500/20 p-3 rounded-xl">
                                <LogOut className="w-6 h-6 text-red-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Sair da conta?</h3>
                        </div>

                        <p className="text-gray-300 mb-6">
                            Tem certeza que deseja sair? Você precisará fazer login novamente para acessar o app.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowLogoutModal(false)}
                                className="flex-1 bg-white/5 border border-white/10 text-white font-semibold py-3 rounded-xl hover:bg-white/10 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmLogout}
                                className="flex-1 bg-red-500 text-white font-semibold py-3 rounded-xl hover:bg-red-600 transition-colors"
                            >
                                Sair
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
}
