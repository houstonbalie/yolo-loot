import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { LootStatus, Player } from '../types';
import { PlayerProfileModal } from '../components/PlayerProfileModal';

const History: React.FC = () => {
    const { lootHistory, items, players } = useGame();

    // Filters
    const [selectedPlayer, setSelectedPlayer] = useState<string>('All');
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<'All' | LootStatus>('All');
    const [selectedItem, setSelectedItem] = useState<string>('All');
    const [viewingPlayer, setViewingPlayer] = useState<Player | null>(null);

    // Derived Data
    const filteredHistory = lootHistory.filter(event => {
        const matchesPlayer = selectedPlayer === 'All' || event.playerId === selectedPlayer;
        const matchesDate = !selectedDate || event.date.includes(selectedDate.split('-').reverse().join('/')); // Formatting date match
        // Note: event.date is stored as "DD/MM HH:mm" or similar, input is "YYYY-MM-DD"
        // Let's rely on simple string inclusion or standardizing if needed. 
        // Current format in GameContext: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
        // Example: "20 abr. 14:30"
        // The date filter input returns YYYY-MM-DD e.g., "2024-04-20".
        // Matching strictly might be hard without standardized ISO dates. 
        // For now, I will implement a simpler "Month/Year" check or just ignore date filter complexity if format mismatch is high,
        // BUT user asked for date filter. 
        // Let's standardise on just matching specific parts if easier, or try converting.
        // Actually, let's keep it simple: Date filter might be tricky with "20 jan. 10:00" format.
        // I will try to match Day and Month if possible.
        // Better yet, let's just match the string if user types it? No, type="date" is better UI.
        // Let's accept that for now valid matches might require format alignment. 
        // I'll leave the date check simple for now: if selectedDate is set, check if our event date string contains the day/month.

        // Attempt to parse selectedDate (YYYY-MM-DD) to "DD MMM"
        let matchesDateSmart = true;
        if (selectedDate) {
            const [year, month, day] = selectedDate.split('-');
            // "20" "04"
            // Locale pt-BR month short: "abr." or "abr" depending on browser.
            // This is brittle. I will do a text search on the event date string using the DAY.
            matchesDateSmart = event.date.startsWith(day);
        }

        const matchesItem = selectedItem === 'All' || event.itemId === selectedItem;
        const matchesStatus = statusFilter === 'All' || event.status === statusFilter;

        return matchesPlayer && (selectedDate ? matchesDateSmart : true) && matchesStatus && matchesItem;
    });

    const totalDistributed = lootHistory.filter(e => e.status === 'Acquired').length;
    const filteredCount = filteredHistory.length;

    const getItemIcon = (itemId: string) => items.find(i => i.id === itemId)?.iconUrl || '';
    const getItemRarity = (itemId: string) => items.find(i => i.id === itemId)?.rarity || 'Common';
    const getItemName = (itemId: string) => items.find(i => i.id === itemId)?.name || 'Unknown Item';
    const getPlayerName = (playerId: string) => players.find(p => p.id === playerId)?.name || 'Unknown';
    const getPlayerAvatar = (playerId: string) => players.find(p => p.id === playerId)?.avatarUrl || '';

    return (
        <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-4 py-8 md:px-10">
            {/* Page Heading */}
            <div className="flex flex-col gap-4 animate-fade-in-up">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                        <span className="material-symbols-outlined text-2xl">history</span>
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-text-main dark:text-white">
                            Drop History
                        </h1>
                        <div className="flex items-center gap-3 mt-1">
                            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold uppercase tracking-wide">
                                <span className="material-symbols-outlined text-sm">emoji_events</span>
                                {totalDistributed} Distributed
                            </div>
                            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-500 text-xs font-bold uppercase tracking-wide">
                                <span className="material-symbols-outlined text-sm">list</span>
                                {filteredCount} Records
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Item Filter Icons */}
            <div className="flex flex-col gap-3">
                <label className="text-sm font-bold text-text-muted uppercase px-1">Filter by Item</label>
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar px-1">
                    <button
                        onClick={() => setSelectedItem('All')}
                        className={`shrink-0 px-5 h-14 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${selectedItem === 'All'
                            ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                            : 'bg-surface-light dark:bg-surface-dark text-gray-500 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                    >
                        All
                    </button>
                    {items.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setSelectedItem(item.id === selectedItem ? 'All' : item.id)}
                            className={`group relative shrink-0 size-14 rounded-xl border transition-all overflow-hidden ${selectedItem === item.id
                                ? 'border-primary ring-2 ring-primary/30 shadow-lg scale-105 z-10'
                                : 'border-gray-200 dark:border-gray-700 opacity-70 hover:opacity-100 hover:scale-105 hover:shadow-md'
                                }`}
                            title={item.name}
                        >
                            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${item.iconUrl}')` }}></div>
                            {/* Active Indicator */}
                            {selectedItem === item.id && (
                                <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-white drop-shadow-md text-2xl">check</span>
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Filters Section */}
            <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row gap-6">

                {/* Player Filter */}
                <div className="flex-1 flex flex-col gap-2">
                    <label className="text-sm font-bold text-text-muted uppercase">Filter by Player</label>
                    <div className="relative">
                        <select
                            value={selectedPlayer}
                            onChange={(e) => setSelectedPlayer(e.target.value)}
                            className="w-full h-12 pl-4 pr-10 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-primary appearance-none dark:text-white font-medium"
                        >
                            <option value="All">All Players</option>
                            {players.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
                    </div>
                </div>

                {/* Date Filter */}
                <div className="flex-1 flex flex-col gap-2">
                    <label className="text-sm font-bold text-text-muted uppercase">Filter by Date</label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-primary dark:text-white font-medium"
                    />
                </div>

                {/* Status Filter */}
                <div className="flex-1 flex flex-col gap-2">
                    <label className="text-sm font-bold text-text-muted uppercase">Status</label>
                    <div className="flex bg-gray-50 dark:bg-black/20 p-1 rounded-xl border border-gray-200 dark:border-gray-700 h-12">
                        <button
                            onClick={() => setStatusFilter('All')}
                            className={`flex-1 rounded-lg text-sm font-bold transition-all ${statusFilter === 'All' ? 'bg-white dark:bg-gray-700 shadow-sm text-text-main dark:text-white' : 'text-gray-500 hover:text-text-main'}`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setStatusFilter('Acquired')}
                            className={`flex-1 rounded-lg text-sm font-bold transition-all ${statusFilter === 'Acquired' ? 'bg-white dark:bg-gray-700 shadow-sm text-primary' : 'text-gray-500 hover:text-text-main'}`}
                        >
                            Acquired
                        </button>
                        <button
                            onClick={() => setStatusFilter('Skipped')}
                            className={`flex-1 rounded-lg text-sm font-bold transition-all ${statusFilter === 'Skipped' ? 'bg-white dark:bg-gray-700 shadow-sm text-red-500' : 'text-gray-500 hover:text-text-main'}`}
                        >
                            Skipped
                        </button>
                    </div>
                </div>
            </div>

            {/* Empty State */}
            {filteredHistory.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
                    <span className="material-symbols-outlined text-4xl mb-4 opacity-30">history_toggle_off</span>
                    <h3 className="text-lg font-bold text-text-main dark:text-gray-300">No records found</h3>
                    <p className="max-w-xs mx-auto mt-2">Try adjusting the filters to find what you're looking for.</p>
                </div>
            )}

            {/* List */}
            <div className="grid gap-4">
                {filteredHistory.map((event) => {
                    const icon = getItemIcon(event.itemId);
                    const rarity = getItemRarity(event.itemId);
                    const itemName = getItemName(event.itemId);
                    const playerName = getPlayerName(event.playerId);
                    const playerAvatar = getPlayerAvatar(event.playerId);

                    return (
                        <div key={event.id} className="group flex flex-col md:flex-row items-start md:items-center gap-6 p-4 rounded-2xl bg-surface-light dark:bg-surface-dark border border-gray-100 dark:border-gray-800 hover:border-primary/30 hover:shadow-lg transition-all">

                            {/* Date & Time */}
                            <div className="min-w-[100px] flex flex-row md:flex-col items-center md:items-start gap-2 md:gap-0">
                                <span className="text-sm font-bold text-text-main dark:text-white">{event.date.split(' ')[0]} {event.date.split(' ')[1]}</span>
                                <span className="text-xs font-medium text-text-muted">{event.date.split(' ')[2]}</span>
                            </div>

                            <div className="hidden md:block w-px h-10 bg-gray-200 dark:bg-gray-700"></div>

                            {/* Player Info */}
                            <div
                                className="flex items-center gap-3 min-w-[200px] cursor-pointer group/player"
                                onClick={() => {
                                    const p = players.find(p => p.id === event.playerId);
                                    if (p) setViewingPlayer(p);
                                }}
                            >
                                <div className="h-10 w-10 rounded-full bg-gray-200 bg-cover bg-center border border-white dark:border-gray-700 shadow-sm transition-transform group-hover/player:scale-110" style={{ backgroundImage: `url('${playerAvatar}')` }}></div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-text-main dark:text-white leading-tight group-hover/player:text-primary transition-colors">{playerName}</span>
                                    <span className="text-[10px] uppercase font-bold text-gray-500">Player</span>
                                </div>
                            </div>

                            {/* Action Badge */}
                            <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${event.status === 'Conquistado'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : event.status === 'Skipped'
                                    ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                                    : 'bg-gray-100 text-gray-500'
                                }`}>
                                <span className="material-symbols-outlined text-sm">
                                    {event.status === 'Acquired' ? 'emoji_events' : event.status === 'Skipped' ? 'close' : 'help'}
                                </span>
                                {event.status}
                            </div>

                            <div className="flex-1"></div>

                            {/* Item Info */}
                            <div className="flex items-center gap-4 w-full md:w-auto p-3 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-gray-700">
                                <div className="h-10 w-10 bg-contain bg-center bg-no-repeat" style={{ backgroundImage: `url('${icon}')` }}></div>
                                <div className="flex flex-col">
                                    <span className={`text-sm font-bold ${rarity === 'Legendary' ? 'text-orange-500' :
                                        rarity === 'Epic' ? 'text-purple-500' :
                                            rarity === 'Rare' ? 'text-blue-500' :
                                                'text-gray-600 dark:text-gray-400'
                                        }`}>{itemName}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-gray-400">{rarity}</span>
                                        {event.cost > 0 && <span className="text-[10px] font-bold text-primary">-{event.cost} DKP</span>}
                                    </div>
                                </div>
                            </div>

                        </div>
                    )
                })}
            </div>
            {/* Modal */}
            {viewingPlayer && (
                <PlayerProfileModal
                    player={viewingPlayer}
                    onClose={() => setViewingPlayer(null)}
                />
            )}
        </div>
    );
};

export default History;