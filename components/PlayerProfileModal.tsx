import React, { useMemo } from 'react';
import { Player, Item, LootEvent } from '../types';
import { useGame } from '../context/GameContext';
import { getPlayerQueue } from '../utils/priority';
import { CLASS_ICONS } from '../constants';

interface PlayerProfileModalProps {
    player: Player;
    onClose: () => void;
}

export const PlayerProfileModal: React.FC<PlayerProfileModalProps> = ({ player, onClose }) => {
    const { items, lootHistory, players } = useGame();

    // 1. Calculate Next Eligible Items
    const nextItems = useMemo(() => {
        const eligibleItems: { item: Item; rank: number }[] = [];

        items.forEach(item => {
            const queue = getPlayerQueue(item, players);
            const rankIndex = queue.findIndex(p => p.id === player.id);

            // Only show if they are in top 3 or top 5 depending on rule, 
            // but let's just show their rank if they are in the top 5 to keep it relevant
            if (rankIndex !== -1 && rankIndex < 5) {
                eligibleItems.push({ item, rank: rankIndex + 1 });
            }
        });

        // Sort by rank (1st place first)
        return eligibleItems.sort((a, b) => a.rank - b.rank);
    }, [items, players, player.id]);

    // 2. Calculate History Stats using map
    const historyStats = useMemo(() => {
        const stats: Record<string, { count: number, item: Item }> = {};

        lootHistory
            .filter(e => e.playerId === player.id && e.status === 'Conquistado')
            .forEach(event => {
                if (!stats[event.itemId]) {
                    const item = items.find(i => i.id === event.itemId);
                    if (item) {
                        stats[event.itemId] = { count: 0, item };
                    }
                }

                if (stats[event.itemId]) {
                    stats[event.itemId].count++;
                }
            });

        return Object.values(stats).sort((a, b) => b.count - a.count);
    }, [lootHistory, player.id, items]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div className="bg-surface-light dark:bg-surface-dark w-full max-w-2xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="relative p-8 pb-16 bg-gradient-to-br from-primary to-orange-600">
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>

                    <div className="flex flex-col items-center">
                        <div className="w-24 h-24 rounded-2xl bg-white shadow-xl border-4 border-white/20 overflow-hidden mb-4">
                            <img src={player.avatarUrl} alt={player.name} className="w-full h-full object-cover" />
                        </div>
                        <h2 className="text-3xl font-black text-white drop-shadow-md">{player.name}</h2>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="px-3 py-1 rounded-lg bg-black/30 border border-white/10 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1 backdrop-blur-md">
                                {CLASS_ICONS[player.class]} {player.class}
                            </span>
                            <span className="px-3 py-1 rounded-lg bg-white/20 border border-white/10 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                                {player.role}
                            </span>
                            <span className="px-3 py-1 rounded-lg bg-yellow-400/20 border border-yellow-400/30 text-yellow-200 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                                {player.cp} CP
                            </span>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1 space-y-8 -mt-8 bg-surface-light dark:bg-surface-dark rounded-t-3xl relative">

                    {/* Section: Next Items */}
                    <div className="space-y-4">
                        <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
                            <span className="material-symbols-outlined text-primary">upcoming</span>
                            Próximos Itens (Top 5)
                        </h3>
                        {nextItems.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {nextItems.map(({ item, rank }) => (
                                    <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-gray-800">
                                        <div className="size-10 rounded-lg bg-cover bg-center shrink-0 border border-gray-200 dark:border-gray-700" style={{ backgroundImage: `url('${item.iconUrl}')` }}></div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-bold text-gray-900 dark:text-white truncate">{item.name}</div>
                                            <div className="text-xs text-gray-500">{item.rarity}</div>
                                        </div>
                                        <div className={`px-2.5 py-1 rounded-lg text-xs font-bold ${rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                                            rank === 2 ? 'bg-gray-200 text-gray-600' :
                                                rank === 3 ? 'bg-orange-100 text-orange-700' :
                                                    'bg-gray-100 text-gray-500'
                                            }`}>
                                            #{rank}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-sm italic">Este jogador não está no Top 5 de nenhum item no momento.</p>
                        )}
                    </div>

                    {/* Section: Loot History */}
                    <div className="space-y-4">
                        <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
                            <span className="material-symbols-outlined text-primary">history</span>
                            Histórico de Loot
                        </h3>
                        {historyStats.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {historyStats.map(({ item, count }) => (
                                    <div key={item.id} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-gray-800 text-center">
                                        <div className="relative">
                                            <div className="size-12 rounded-xl bg-cover bg-center border border-gray-200 dark:border-gray-700" style={{ backgroundImage: `url('${item.iconUrl}')` }}></div>
                                            <div className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-md">
                                                x{count}
                                            </div>
                                        </div>
                                        <div className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate w-full" title={item.name}>{item.name}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-sm italic">Nenhum item conquistado ainda.</p>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};
