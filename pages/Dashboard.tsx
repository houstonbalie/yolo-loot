import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Item, Player } from '../types';
import { parseCP } from '../utils/formatters';
import { getPlayerQueue as getPlayerQueueUtil } from '../utils/priority';

const Dashboard: React.FC = () => {
  const { items, players } = useGame();

  // Simulated Logged User ID (Matches 'ThunderGod' in mockData)
  const currentUserId = '1';



  // Sort players by CP (Highest to Lowest) and Rotate based on Last Recipient
  const getPlayerQueue = (item: Item): Player[] => {
    return getPlayerQueueUtil(item, players);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Legendary': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'Epic': return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
      case 'Rare': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'Uncommon': return 'text-green-500 bg-green-500/10 border-green-500/20';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto p-4 md:p-8 lg:p-12 flex flex-col gap-8 pb-24">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 animate-fade-in">
        <div>
          <p className="text-primary font-bold tracking-wider text-sm uppercase mb-1">Overview</p>
          <h2 className="text-3xl md:text-4xl font-black text-[#1c130d] dark:text-white tracking-tight">Loot Dashboard</h2>
        </div>
        <div className="flex items-center gap-3 bg-white dark:bg-surface-dark px-4 py-2 rounded-full shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-1.5">
            <span className="block size-2.5 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Registered Players</span>
          </div>
          <span className="text-gray-300 dark:text-gray-700">|</span>
          <span className="text-sm font-bold text-[#1c130d] dark:text-white">{items.length} Active Items</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {items.map((item) => {
          let queue = getPlayerQueue(item);

          // Apply Limited Distribution logic
          if (item.limitToTop5) {
            queue = queue.slice(0, 5);
          }

          // Calculate user position
          const userRankIndex = queue.findIndex(p => p.id === currentUserId);
          const userRank = userRankIndex !== -1 ? userRankIndex + 1 : null;



          return (
            <article key={item.id} className="flex flex-col gap-6 p-6 rounded-2xl bg-surface-light dark:bg-surface-dark border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-lg transition-all duration-300">

              {/* Item Info Section (Top) */}
              <div className="flex flex-col items-center text-center gap-4 w-full">
                <div className="relative shrink-0 size-32 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 hover:scale-110" style={{ backgroundImage: `url('${item.iconUrl}')` }}></div>
                </div>

                <div className="flex flex-col gap-2 w-full">
                  <div className="flex items-center justify-center gap-2">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border ${getRarityColor(item.rarity)}`}>
                      {item.rarity}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight truncate">{item.name}</h3>

                  <div className="flex items-center justify-center gap-2">
                    <span className="text-xs font-bold text-gray-400 uppercase">Cost:</span>
                    <span className="text-lg font-black text-primary">{item.cost} Garnet</span>
                  </div>

                  {/* Stats tooltip or small text */}
                  <div className="text-xs text-gray-500 truncate max-w-full px-4">
                    {item.stats}
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="w-full h-px bg-gray-100 dark:bg-gray-800"></div>

              {/* Queue Section (Bottom) */}
              <div className="w-full flex flex-col gap-4 bg-gray-50/50 dark:bg-white/5 rounded-2xl p-4 border border-gray-100 dark:border-gray-800/50 flex-1">
                <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-gray-400 text-lg">group</span>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Priority</span>
                  </div>
                  {userRank && (
                    <div className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-bold">
                      <span>#{userRank}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  {queue.length > 0 ? queue.map((player, index) => {
                    const isMe = player.id === currentUserId;
                    return (
                      <div
                        key={player.id}
                        className={`flex items-center justify-between p-2 rounded-xl transition-all ${isMe
                          ? 'bg-white dark:bg-surface-dark border-2 border-primary shadow-md z-10'
                          : 'bg-white dark:bg-surface-dark border border-transparent hover:border-gray-200 dark:hover:border-gray-700'
                          }`}
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <div className={`flex items-center justify-center size-6 rounded-lg text-xs font-bold shrink-0 ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                            index === 1 ? 'bg-gray-200 text-gray-600' :
                              index === 2 ? 'bg-orange-100 text-orange-700' :
                                'bg-gray-100 dark:bg-gray-800 text-gray-400'
                            }`}>
                            {index + 1}
                          </div>

                          <div className="size-7 rounded-lg bg-cover bg-center border border-gray-200 dark:border-gray-700 shrink-0" style={{ backgroundImage: `url('${player.avatarUrl}')` }}></div>

                          <div className="flex flex-col min-w-0">
                            <span className={`text-xs font-bold leading-none truncate max-w-[100px] ${isMe ? 'text-primary' : 'text-gray-900 dark:text-white'}`}>
                              {player.name}
                            </span>
                            <span className="text-[9px] text-gray-500 truncate">{player.class}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-gray-500 bg-gray-100 dark:bg-black/20 px-1.5 py-1 rounded shrink-0">
                          <span className="material-symbols-outlined text-[12px] text-primary">bolt</span>
                          {player.cp}
                        </div>
                      </div>
                    );
                  }) : (
                    <div className="text-center py-4 text-xs text-gray-400">No one in queue</div>
                  )}
                </div>
              </div>

            </article>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;