
import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { ClassType, Player } from '../types';
import { CLASS_ICONS, CLASSES } from '../constants';
import AdminGuard from '../components/AdminGuard';
import { PlayerProfileModal } from '../components/PlayerProfileModal';

const PlayerRegistration: React.FC = () => {
    const { addPlayer, players, updatePlayer, deletePlayer } = useGame();

    // Form State
    const [name, setName] = useState('');
    const [selectedClass, setSelectedClass] = useState<ClassType | ''>('');
    const [cp, setCp] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [viewingPlayer, setViewingPlayer] = useState<Player | null>(null);

    const classAvatars: Record<ClassType, string> = {
        'Elf': 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elf&backgroundColor=c0aede',
        'Dark Wizard': 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mage&backgroundColor=b6e3f4',
        'Dark Lord': 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lord&backgroundColor=ffdfbf',
        'Dark Knight': 'https://api.dicebear.com/7.x/avataaars/svg?seed=Knight&backgroundColor=c0aede'
    };

    const handleSetClassAvatar = () => {
        if (selectedClass && classAvatars[selectedClass]) {
            setAvatarUrl(classAvatars[selectedClass]);
        }
    };

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert("The file is too large. The maximum allowed size is 2MB.");
                return;
            }

            const reader = new FileReader();
            reader.onload = (readerEvent) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Resize if dimension is too large (max 800px width/height)
                    const MAX_DIMENSION = 800;
                    if (width > height) {
                        if (width > MAX_DIMENSION) {
                            height *= MAX_DIMENSION / width;
                            width = MAX_DIMENSION;
                        }
                    } else {
                        if (height > MAX_DIMENSION) {
                            width *= MAX_DIMENSION / height;
                            height = MAX_DIMENSION;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);

                    if (dataUrl.length > 1000 * 1024) {
                        alert("The image is still too large after compression.");
                        return;
                    }

                    setAvatarUrl(dataUrl);
                };
                img.src = readerEvent.target?.result as string;
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setAvatarUrl('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (name && selectedClass && cp) {
                const playerData = {
                    name,
                    class: selectedClass,
                    cp,
                    role: (selectedClass === 'Cavaleiro' || selectedClass === 'Lorde') ? 'Tank' : 'DPS' as 'DPS' | 'Tank' | 'Healer',
                    avatarUrl
                };

                if (editingId) {
                    await updatePlayer(editingId, playerData);
                    setEditingId(null);
                } else {
                    await addPlayer(playerData);
                }

                setSuccess(true);
                resetForm();
                setTimeout(() => setSuccess(false), 3000);
            } else {
                alert("Please fill in all required fields.");
            }
        } catch (error) {
            console.error("Error saving player:", error);
            alert("Error saving player. Check the console for more details.\n" + (error as any).message);
        }
    };

    const resetForm = () => {
        setName('');
        setSelectedClass('');
        setCp('');
        setAvatarUrl('');
        if (fileInputRef.current) fileInputRef.current.value = '';
        setEditingId(null);
    };

    const handleEdit = (player: Player) => {
        setName(player.name);
        setSelectedClass(player.class);
        setCp(player.cp);
        setAvatarUrl(player.avatarUrl || '');
        setEditingId(player.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleClone = (player: Player) => {
        setName(player.name);
        setSelectedClass(player.class);
        setCp(player.cp);
        setAvatarUrl(player.avatarUrl || '');
        setEditingId(null); // Ensure it creates a new one
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this player?')) {
            await deletePlayer(id);
        }
    };

    const parseCP = (cpStr: string): number => {
        const cleanStr = cpStr.toUpperCase().replace(/[^0-9.KMB]/g, '');
        let multiplier = 1;
        if (cleanStr.endsWith('K')) multiplier = 1000;
        else if (cleanStr.endsWith('M')) multiplier = 1000000;
        else if (cleanStr.endsWith('B')) multiplier = 1000000000;

        const numValue = parseFloat(cleanStr.replace(/[KMB]/g, ''));
        return isNaN(numValue) ? 0 : numValue * multiplier;
    };


    return (
        <AdminGuard>
            <div className="w-full max-w-[1200px] mx-auto p-4 md:p-8 space-y-8 pb-24">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 text-primary font-medium mb-2">
                            <span className="material-symbols-outlined text-sm">groups</span>
                            <span className="text-sm uppercase tracking-wider">Management</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-[#1c130d] dark:text-white tracking-tight">Player Registration</h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">Manage guild members, their CPs, and classes.</p>
                    </div>
                </div>

                <div className="flex flex-col xl:flex-row gap-8 items-start">
                    {/* Left Column: Form */}
                    <div className="w-full xl:w-[500px] shrink-0 space-y-6">
                        <div className="bg-surface-light dark:bg-surface-dark p-6 md:p-8 rounded-3xl shadow-xl shadow-black/5 border border-white/20 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none"></div>

                            <form onSubmit={handleSubmit} className="relative space-y-6">
                                {/* Name Input */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-bold text-text-main dark:text-gray-200">
                                        <span className="material-symbols-outlined text-primary text-[18px]">badge</span>
                                        Player Name
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-white dark:bg-black/20 border border-border-light dark:border-border-dark rounded-xl h-12 px-4 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-gray-400 dark:text-white font-medium"
                                        placeholder="Ex: ThunderGod"
                                        required
                                    />
                                </div>

                                {/* Class Selection */}
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-sm font-bold text-text-main dark:text-gray-200">
                                        <span className="material-symbols-outlined text-primary text-[18px]">swords</span>
                                        Classe
                                    </label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                        {CLASSES.map((cls) => (
                                            <div
                                                key={cls}
                                                onClick={() => setSelectedClass(cls)}
                                                className={`cursor-pointer rounded-xl p-3 border-2 transition-all duration-300 flex flex-col items-center gap-2 relative overflow-hidden group ${selectedClass === cls
                                                    ? 'border-primary bg-primary/5 shadow-md'
                                                    : 'border-transparent bg-gray-50 dark:bg-black/20 hover:bg-gray-100 dark:hover:bg-white/5'
                                                    }`}
                                            >
                                                <div className={`text-2xl transition-transform duration-300 ${selectedClass === cls ? 'scale-110' : 'group-hover:scale-110'}`}>
                                                    {CLASS_ICONS[cls]}
                                                </div>
                                                <span className={`text-[10px] font-bold uppercase tracking-wide ${selectedClass === cls ? 'text-primary' : 'text-gray-500'}`}>
                                                    {cls}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* CP & Avatar Row */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-bold text-text-main dark:text-gray-200">
                                            <span className="material-symbols-outlined text-primary text-[18px]">bolt</span>
                                            Combat Power (CP)
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={cp}
                                                onChange={(e) => setCp(e.target.value)}
                                                className="w-full bg-white dark:bg-black/20 border border-border-light dark:border-border-dark rounded-xl h-14 pl-4 pr-12 text-lg font-bold outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-gray-300 dark:text-white tracking-widest"
                                                placeholder="0"
                                                required
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-gray-400 uppercase">CP</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-bold text-text-main dark:text-gray-200">
                                            <span className="material-symbols-outlined text-primary text-[18px]">account_circle</span>
                                            Avatar
                                        </label>
                                        <div className="flex gap-4 items-start">
                                            {!avatarUrl ? (
                                                <div className="relative group w-24 h-24 shrink-0 rounded-2xl bg-gray-50 dark:bg-black/20 border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-primary dark:hover:border-primary transition-colors cursor-pointer flex flex-col items-center justify-center gap-1">
                                                    <input
                                                        type="file"
                                                        ref={fileInputRef}
                                                        accept="image/*"
                                                        onChange={handleImageUpload}
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                    />
                                                    <span className="material-symbols-outlined text-gray-400 group-hover:text-primary transition-colors">cloud_upload</span>
                                                    <span className="text-[9px] text-gray-400 text-center leading-tight">Max 2MB</span>
                                                </div>
                                            ) : (
                                                <div className="relative w-24 h-24 shrink-0 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black/20 group">
                                                    <img src={avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={removeImage}
                                                            className="p-1.5 bg-white rounded-lg text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                                                        >
                                                            <span className="material-symbols-outlined text-sm">delete</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex flex-col gap-2 pt-1">
                                                <button
                                                    type="button"
                                                    onClick={handleSetClassAvatar}
                                                    disabled={!selectedClass}
                                                    className="w-full px-4 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                                                >
                                                    <span className="material-symbols-outlined text-base">smart_toy</span>
                                                    Classe
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                                                >
                                                    <span className="material-symbols-outlined text-base">upload</span>
                                                    Enviar
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 pt-4">
                                    {editingId && (
                                        <button
                                            type="button"
                                            onClick={resetForm}
                                            className="h-12 px-6 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 font-bold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                    )}
                                    <button
                                        type="submit"
                                        className="h-12 flex-1 bg-primary text-white text-sm font-bold uppercase tracking-wider rounded-xl hover:bg-primary-dark transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/25 flex items-center justify-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-lg">{editingId ? 'save' : 'add_circle'}</span>
                                        {editingId ? 'Save Changes' : 'Register Player'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Right Column: List */}
                    <div className="flex-1 min-w-0 space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-xs">
                                {players.length} Players Registered
                            </h3>
                            <div className="flex gap-2">
                                <button className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-primary">
                                    <span className="material-symbols-outlined">filter_list</span>
                                </button>
                                <button className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-primary">
                                    <span className="material-symbols-outlined">search</span>
                                </button>
                            </div>
                        </div>

                        <div className="grid gap-3">
                            {players.length > 0 ? (
                                players.map((player) => (
                                    <div
                                        key={player.id}
                                        onClick={(e) => {
                                            // Handle click to open modal, but prevent if clicking action buttons
                                            setViewingPlayer(player);
                                        }}
                                        className="bg-surface-light dark:bg-surface-dark p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-between group hover:border-primary/30 transition-all shadow-sm cursor-pointer hover:shadow-md"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-black/20 overflow-hidden">
                                                    <img src={player.avatarUrl} alt={player.name} className="w-full h-full object-cover" />
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 dark:text-white leading-tight">{player.name}</h4>
                                                <div className="flex items-center gap-2 text-xs mt-1">
                                                    <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-white/5 text-gray-500 font-medium">
                                                        {player.class}
                                                    </span>
                                                    <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-white/5 text-gray-500 font-medium">
                                                        {player.role}
                                                    </span>
                                                    <span className="font-mono text-primary font-bold">
                                                        {player.cp} CP
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                                            <button
                                                onClick={() => handleClone(player)}
                                                className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                title="Clonar (Novo ID)"
                                            >
                                                <span className="material-symbols-outlined text-xl">content_copy</span>
                                            </button>
                                            <button
                                                onClick={() => handleEdit(player)}
                                                className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                title="Editar"
                                            >
                                                <span className="material-symbols-outlined text-xl">edit</span>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(player.id)}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                title="Excluir"
                                            >
                                                <span className="material-symbols-outlined text-xl">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 text-gray-400">
                                    <span className="material-symbols-outlined text-4xl mb-2 opacity-50">person_off</span>
                                    <p>No Players Registered</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Profile Modal */}
                {viewingPlayer && (
                    <PlayerProfileModal
                        player={viewingPlayer}
                        onClose={() => setViewingPlayer(null)}
                    />
                )}
            </div>
        </AdminGuard>
    );
};

export default PlayerRegistration;

