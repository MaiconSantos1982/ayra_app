import { useState, useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronRight, TrendingUp, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getDailyNutrition } from '../lib/localStorage';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';

import { getLocalDateKey } from '../lib/dateUtils';

type Period = 'this_week' | 'this_month' | '7_days' | '15_days' | '30_days' | 'custom';

export default function NutritionHistoryPage() {
    const navigate = useNavigate();
    const [period, setPeriod] = useState<Period>('this_week');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // Helper para formatar data (YYYY-MM-DD -> DD/MM)
    const formatDate = (dateStr: string) => {
        const [, month, day] = dateStr.split('-');
        return `${day}/${month}`;
    };

    // Helper para gerar intervalo de datas (Strings YYYY-MM-DD local)
    const getDatesInRange = (startDate: Date, endDate: Date) => {
        const dates = [];
        // Clona datas e itera usando data local para garantir que o loop cubra todos os dias
        let current = new Date(startDate);
        current.setHours(0, 0, 0, 0);

        // Define fim do loop com margem de segurança
        const end = new Date(endDate);
        end.setHours(0, 0, 0, 0);

        while (current <= end) {
            dates.push(getLocalDateKey(current));
            current.setDate(current.getDate() + 1);
        }
        return dates;
    };

    // Calcula intervalo de datas com base no período selecionado
    const dateRange = useMemo(() => {
        const today = new Date(); // Data local atual

        // Inicializa start e end como hoje
        let start = new Date(today);
        let end = new Date(today);

        switch (period) {
            case 'this_week': {
                // Segunda a Domingo desta semana
                const day = today.getDay(); // 0 = Domingo, 1 = Segunda...
                const diff = today.getDate() - day + (day === 0 ? -6 : 1); // ajusta p/ segunda
                start.setDate(diff);
                // End = Domingo (start + 6 dias)
                end = new Date(start);
                end.setDate(start.getDate() + 6);
                break;
            }
            case 'this_month': {
                start.setDate(1); // Dia 1 do mês atual
                // End = hoje
                break;
            }
            case '7_days': {
                start.setDate(today.getDate() - 6);
                // End = hoje
                break;
            }
            case '15_days': {
                start.setDate(today.getDate() - 14);
                // End = hoje
                break;
            }
            case '30_days': {
                start.setDate(today.getDate() - 29);
                // End = hoje
                break;
            }
            case 'custom': {
                if (customStartDate && customEndDate) {
                    // split YYYY-MM-DD local
                    const [sY, sM, sD] = customStartDate.split('-').map(Number);
                    start = new Date(sY, sM - 1, sD);

                    const [eY, eM, eD] = customEndDate.split('-').map(Number);
                    end = new Date(eY, eM - 1, eD);
                } else {
                    return [];
                }
                break;
            }
        }

        return getDatesInRange(start, end);
    }, [period, customStartDate, customEndDate]);

    // Busca dados nutricionais para o intervalo
    const chartData = useMemo(() => {
        return dateRange.map(date => {
            const nutrition = getDailyNutrition(date);
            return {
                date: formatDate(date),
                fullDate: date,
                calorias: nutrition.calorias,
                proteina: nutrition.proteina,
                carboidratos: nutrition.carboidratos,
                gorduras: nutrition.gorduras
            };
        });
    }, [dateRange]);

    // Totais e Médias do Período
    const stats = useMemo(() => {
        const total = chartData.reduce((acc, curr) => ({
            calorias: acc.calorias + curr.calorias,
            proteina: acc.proteina + curr.proteina,
            carboidratos: acc.carboidratos + curr.carboidratos,
            gorduras: acc.gorduras + curr.gorduras
        }), { calorias: 0, proteina: 0, carboidratos: 0, gorduras: 0 });

        const daysWithData = chartData.filter(d => d.calorias > 0).length || 1;

        return {
            total,
            avg: {
                calorias: Math.round(total.calorias / daysWithData),
                proteina: Math.round(total.proteina / daysWithData),
                carboidratos: Math.round(total.carboidratos / daysWithData),
                gorduras: Math.round(total.gorduras / daysWithData)
            }
        };
    }, [chartData]);

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <div className="bg-background border-b border-white/10 sticky top-0 z-10">
                <div className="flex items-center justify-between p-4"> {/* Ajustado: justify-between para colocar botão à direita */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/inicio')}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <ChevronRight className="text-white rotate-180" size={20} />
                        </button>
                        <div>
                            <h1 className="text-lg font-bold text-white flex items-center gap-2">
                                <TrendingUp className="text-primary" size={20} />
                                Histórico Nutricional
                            </h1>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-6">

                {/* Controles de Período */}
                <div className="bg-card rounded-2xl p-4 border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white font-bold flex items-center gap-2">
                            <CalendarIcon size={18} className="text-primary" />
                            Período
                        </h3>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="text-text-muted hover:text-white transition-colors"
                        >
                            <Filter size={18} />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => setPeriod('this_week')}
                            className={`p-2 rounded-lg text-sm font-medium transition-all ${period === 'this_week' ? 'bg-primary text-black' : 'bg-white/5 text-text-muted hover:bg-white/10'}`}
                        >
                            Esta Semana
                        </button>
                        <button
                            onClick={() => setPeriod('this_month')}
                            className={`p-2 rounded-lg text-sm font-medium transition-all ${period === 'this_month' ? 'bg-primary text-black' : 'bg-white/5 text-text-muted hover:bg-white/10'}`}
                        >
                            Este Mês
                        </button>
                        {showFilters && (
                            <>
                                <button
                                    onClick={() => setPeriod('7_days')}
                                    className={`p-2 rounded-lg text-sm font-medium transition-all ${period === '7_days' ? 'bg-primary text-black' : 'bg-white/5 text-text-muted hover:bg-white/10'}`}
                                >
                                    Últimos 7 dias
                                </button>
                                <button
                                    onClick={() => setPeriod('15_days')}
                                    className={`p-2 rounded-lg text-sm font-medium transition-all ${period === '15_days' ? 'bg-primary text-black' : 'bg-white/5 text-text-muted hover:bg-white/10'}`}
                                >
                                    Últimos 15 dias
                                </button>
                                <button
                                    onClick={() => setPeriod('30_days')}
                                    className={`p-2 rounded-lg text-sm font-medium transition-all ${period === '30_days' ? 'bg-primary text-black' : 'bg-white/5 text-text-muted hover:bg-white/10'}`}
                                >
                                    Últimos 30 dias
                                </button>
                                <button
                                    onClick={() => setPeriod('custom')}
                                    className={`p-2 rounded-lg text-sm font-medium transition-all ${period === 'custom' ? 'bg-primary text-black' : 'bg-white/5 text-text-muted hover:bg-white/10'}`}
                                >
                                    Personalizado
                                </button>
                            </>
                        )}
                    </div>

                    {period === 'custom' && (
                        <div className="mt-4 grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                            <div>
                                <label className="block text-xs text-text-muted mb-1">Início</label>
                                <input
                                    type="date"
                                    value={customStartDate}
                                    onChange={(e) => setCustomStartDate(e.target.value)}
                                    className="w-full bg-background border border-white/10 rounded-lg px-2 py-2 text-sm text-white focus:border-primary focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-text-muted mb-1">Fim</label>
                                <input
                                    type="date"
                                    value={customEndDate}
                                    onChange={(e) => setCustomEndDate(e.target.value)}
                                    className="w-full bg-background border border-white/10 rounded-lg px-2 py-2 text-sm text-white focus:border-primary focus:outline-none"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Resumo do Período */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-card p-3 rounded-xl border border-white/5">
                        <p className="text-xs text-text-muted mb-1">Média Calorias</p>
                        <p className="text-xl font-bold text-white">{stats.avg.calorias}</p>
                        <p className="text-[10px] text-text-muted">kcal/dia</p>
                    </div>
                    <div className="bg-card p-3 rounded-xl border border-white/5">
                        <p className="text-xs text-text-muted mb-1">Média Proteína</p>
                        <p className="text-xl font-bold text-blue-400">{stats.avg.proteina}g</p>
                    </div>
                    <div className="bg-card p-3 rounded-xl border border-white/5">
                        <p className="text-xs text-text-muted mb-1">Média Carbo</p>
                        <p className="text-xl font-bold text-yellow-400">{stats.avg.carboidratos}g</p>
                    </div>
                    <div className="bg-card p-3 rounded-xl border border-white/5">
                        <p className="text-xs text-text-muted mb-1">Média Gorduras</p>
                        <p className="text-xl font-bold text-orange-400">{stats.avg.gorduras}g</p>
                    </div>
                </div>

                {/* Gráfico de Calorias */}
                <div className="bg-card rounded-2xl p-4 border border-white/10 h-80">
                    <h3 className="text-white font-bold mb-4">Evolução de Calorias</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                            <XAxis
                                dataKey="date"
                                stroke="#666"
                                tick={{ fontSize: 12 }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#666"
                                tick={{ fontSize: 12 }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                                itemStyle={{ color: '#fff' }}
                                labelStyle={{ color: '#888' }}
                            />
                            <Bar dataKey="calorias" fill="#a855f7" radius={[4, 4, 0, 0]} name="Calorias" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Gráfico de Macronutrientes */}
                <div className="bg-card rounded-2xl p-4 border border-white/10 h-80">
                    <h3 className="text-white font-bold mb-4">Divisão de Macros</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                            <XAxis
                                dataKey="date"
                                stroke="#666"
                                tick={{ fontSize: 12 }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#666"
                                tick={{ fontSize: 12 }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                            />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            <Bar dataKey="proteina" stackId="a" fill="#60a5fa" name="Prot (g)" radius={[0, 0, 4, 4]} />
                            <Bar dataKey="carboidratos" stackId="a" fill="#facc15" name="Carb (g)" />
                            <Bar dataKey="gorduras" stackId="a" fill="#fb923c" name="Gord (g)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

            </div>
        </div>
    );
}
