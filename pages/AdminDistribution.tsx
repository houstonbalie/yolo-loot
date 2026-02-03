import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Item, Player } from '../types';
import { parseCP } from '../utils/formatters';
import AdminGuard from '../components/AdminGuard';

import { getPlayerQueue } from '../utils/priority';

const AdminDistribution: React.FC = () => {
    const { players, items, distributeItem, addToDistributionQueue, distributionQueue, removeFromDistributionQueue, clearPlayers, clearItems, clearHistory } = useGame();

    // Local state for adding items to queue
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);
    const [newItemQuantity, setNewItemQuantity] = useState(1);

    const currentItem = distributionQueue[0];

    // Sorting logic using shared utility
    let sortedPlayers: Player[] = [];

    if (currentItem) {
        const fullItem = items.find(i => i.name === currentItem.name);
        if (fullItem) {
            sortedPlayers = getPlayerQueue(fullItem, players);
        } else {
            // Fallback: Just sort by CP
            sortedPlayers = [...players].sort((a, b) => parseCP(b.cp) - parseCP(a.cp));
        }
    } else {
        // Default: Sort by CP
        sortedPlayers = [...players].sort((a, b) => parseCP(b.cp) - parseCP(a.cp));
    }

    const handleAddItem = () => {
        if (selectedItem) {
            addToDistributionQueue(selectedItem.name, newItemQuantity);
            setSelectedItem(null);
            setNewItemQuantity(1);
        }
    };

    const handleDistribute = (player: Player, action: 'Acquired' | 'Skipped') => {
        if (!currentItem) return;

        if (action === 'Acquired') {
            // If player wins, everyone ABOVE them in priority gets a "Skipped" automatically
            // NOTE: In a rotated queue, "ABOVE" means "Before in the list"
            const winnerIndex = sortedPlayers.findIndex(p => p.id === player.id);

            if (winnerIndex > 0) {
                const skippedPlayers = sortedPlayers.slice(0, winnerIndex);
                skippedPlayers.forEach(skippedPlayer => {
                    // Mark as passed but DO NOT consume item
                    distributeItem(skippedPlayer.id, currentItem, 'Skipped', false);
                });
            }
            // Mark winner and CONSUME item
            distributeItem(player.id, currentItem, 'Acquired', true);
        } else {
            // If manually clicking Pass, just mark this player as passed and DO NOT consume item
            distributeItem(player.id, currentItem, 'Skipped', false);
        }
    };

    const getRarityColor = (rarity: string) => {
        switch (rarity) {
            case 'Lendário': return 'text-orange-500 border-orange-500/30 bg-orange-500/10';
            case 'Épico': return 'text-purple-500 border-purple-500/30 bg-purple-500/10';
            case 'Raro': return 'text-blue-500 border-blue-500/30 bg-blue-500/10';
            default: return 'text-gray-500 border-gray-500/30 bg-gray-500/10';
        }
    };

    return (
        <AdminGuard>
            <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="max-w-2xl">
                        <div className="flex items-center gap-2 text-primary font-medium mb-2">
                            <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
                            <span className="text-sm uppercase tracking-wider">Admin</span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3">Manage Loot</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-lg">Select an item below to start distribution.</p>
                    </div>

                    <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg border border-blue-100 dark:border-blue-800">
                        <span className="material-symbols-outlined">database</span>
                        <span className="text-sm font-bold">{items.length} Registered Items</span>
                    </div>
                </div>

                {/* Input Area */}
                <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-xl p-6 sm:p-8 border border-slate-100 dark:border-stone-800">
                    <div className="flex flex-col gap-6">

                        {/* Item Selection Grid */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">1. Choose the Item</label>
                                <div className="flex items-center gap-2">
                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Quantity:</label>
                                    <input
                                        className="w-16 h-8 text-center bg-slate-50 dark:bg-[#2d241e] border border-slate-200 dark:border-stone-700 rounded-lg font-bold text-sm outline-none focus:ring-2 focus:ring-primary dark:text-white"
                                        type="number"
                                        min="1"
                                        value={newItemQuantity}
                                        onChange={(e) => setNewItemQuantity(parseInt(e.target.value))}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {items.map((item) => {
                                    const isSelected = selectedItem?.id === item.id;
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => setSelectedItem(item)}
                                            className={`group relative flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 text-left ${isSelected
                                                ? 'border-primary bg-primary/5 shadow-md scale-[1.02]'
                                                : 'border-slate-100 dark:border-stone-800 bg-white dark:bg-[#1f1611] hover:border-primary/50'
                                                }`}
                                        >
                                            {isSelected && (
                                                <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-0.5 shadow-sm">
                                                    <span className="material-symbols-outlined text-sm font-bold block">check</span>
                                                </div>
                                            )}
                                            <div className="size-16 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 shadow-sm shrink-0">
                                                <img src={item.iconUrl} alt={item.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="w-full flex flex-col items-center">
                                                <h4 className={`text-sm font-bold text-center leading-tight mb-1 ${isSelected ? 'text-primary' : 'text-slate-700 dark:text-slate-200'}`}>
                                                    {item.name}
                                                </h4>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getRarityColor(item.rarity)}`}>
                                                    {item.cost} Garnet
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="h-px bg-slate-100 dark:bg-stone-800"></div>

                        {/* Queue Control */}
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">inventory_2</span>
                                    Distribution Queue
                                </h3>
                                <p className="text-xs text-slate-500">Added items waiting to be distributed</p>
                            </div>

                            <button
                                onClick={handleAddItem}
                                disabled={!selectedItem}
                                className="h-10 px-6 bg-slate-800 dark:bg-slate-700 text-white font-bold rounded-xl hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10"
                            >
                                <span className="material-symbols-outlined text-sm">add</span>
                                Add to Queue
                            </button>
                        </div>

                        {/* Queue List */}
                        {distributionQueue.length > 0 && (
                            <div className="space-y-2">
                                {distributionQueue.map((item, index) => (
                                    <div key={item.id} className="flex items-center justify-between p-3 bg-white dark:bg-surface-dark border border-slate-100 dark:border-stone-800 rounded-xl animate-fade-in-up">
                                        <div className="flex items-center gap-3">
                                            <span className="bg-primary/10 text-primary size-8 flex items-center justify-center rounded-lg font-bold text-sm">{index + 1}</span>
                                            <span className="font-bold text-slate-800 dark:text-white">{item.name}</span>
                                            <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-500">x{item.quantity}</span>
                                        </div>
                                        <button onClick={() => removeFromDistributionQueue(item.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                                            <span className="material-symbols-outlined text-lg">delete</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Active Distribution */}
                {currentItem && (
                    <div className="space-y-6 animate-fade-in-up">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    Distributing Now:
                                    <span className="text-primary">{currentItem.name}</span>
                                </h3>
                            </div>
                        </div>

                        <div className="grid gap-4">
                            {sortedPlayers.map((player) => (
                                <div key={player.id} className="group bg-surface-light dark:bg-surface-dark border border-slate-100 dark:border-stone-800 rounded-xl p-4 sm:p-5 shadow-sm hover:border-primary/50 transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                                    <div className="flex items-center gap-4 min-w-[280px]">
                                        <div className="relative">
                                            <div className="size-14 rounded-full bg-slate-200 bg-cover bg-center border border-slate-100 dark:border-stone-700" style={{ backgroundImage: `url('${player.avatarUrl}')` }}></div>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 dark:text-white text-lg leading-tight">{player.name}</h4>
                                            <div className="flex items-center gap-3 text-sm mt-1">
                                                <span className="text-slate-500 dark:text-slate-400 font-medium">{player.class} • {player.role}</span>
                                                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                                <span className="text-primary font-bold">{player.dkp} Garnet</span>
                                                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded font-bold">CP: {player.cp}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center w-full lg:w-auto gap-2">
                                        <button
                                            onClick={() => handleDistribute(player, 'Acquired')}
                                            className="flex-1 lg:flex-none px-6 py-2 bg-primary text-white text-sm font-bold rounded-full shadow-sm flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">check</span>
                                            Presentear
                                        </button>
                                        <button
                                            onClick={() => handleDistribute(player, 'Skipped')}
                                            className="flex-1 lg:flex-none px-6 py-2 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-bold rounded-full transition-colors flex items-center justify-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">close</span>
                                            Skipped
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {/* Danger Zone */}
                <div className="mt-12 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/30 p-6">
                    <h3 className="text-xl font-bold text-red-600 flex items-center gap-2 mb-4">
                        <span className="material-symbols-outlined">warning</span>
                        Danger Zone
                    </h3>
                    <p className="text-sm text-red-500 mb-6">The actions below are irreversible. Be sure before clicking.</p>

                    <div className="grid sm:grid-cols-3 gap-4">
                        <button
                            onClick={() => {
                                if (window.confirm("WARNING: This will delete ALL registered players. Are you sure?")) {
                                    clearPlayers();
                                }
                            }}
                            className="px-4 py-3 bg-white dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 font-bold rounded-xl hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined">person_remove</span>
                            Reset Players
                        </button>
                        <button
                            onClick={() => {
                                if (window.confirm("WARNING: This will delete ALL registered items. Are you sure?")) {
                                    clearItems();
                                }
                            }}
                            className="px-4 py-3 bg-white dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 font-bold rounded-xl hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined">remove_shopping_cart</span>
                            Reset Items
                        </button>
                        <button
                            onClick={() => {
                                if (window.confirm("WARNING: This will clear ALL loot history. Are you sure?")) {
                                    clearHistory();
                                }
                            }}
                            className="px-4 py-3 bg-white dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 font-bold rounded-xl hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined">history</span>
                            Reset History
                        </button>
                    </div>
                </div>
            </div>
        </AdminGuard>
    );
};

export default AdminDistribution;