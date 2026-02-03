import React, { useState, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { Rarity, Item } from '../types';
import AdminGuard from '../components/AdminGuard';

const ItemRegistration: React.FC = () => {
    const { addItem, items, updateItem, deleteItem } = useGame();

    // Form State
    const [name, setName] = useState('');
    const [rarity, setRarity] = useState<Rarity>('Comum');
    const [limitToTop5, setLimitToTop5] = useState(false);
    const [stats, setStats] = useState('');
    const [chance, setChance] = useState('');
    const [cost, setCost] = useState<string>('');
    const [iconUrl, setIconUrl] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Default image if none provided
    const displayIcon = iconUrl || 'https://via.placeholder.com/150?text=No+Icon';

    const rarities: Rarity[] = ['Legendary', 'Epic', 'Rare', 'Uncommon', 'Common'];

    const getRarityColor = (r: Rarity) => {
        switch (r) {
            case 'Legendary': return 'bg-orange-500 border-orange-500 text-white';
            case 'Epic': return 'bg-purple-600 border-purple-600 text-white';
            case 'Rare': return 'bg-blue-500 border-blue-500 text-white';
            case 'Uncommon': return 'bg-green-500 border-green-500 text-white';
            default: return 'bg-gray-500 border-gray-500 text-white';
        }
    }

    const getRarityBadgeColor = (r: Rarity) => {
        switch (r) {
            case 'Legendary': return 'bg-orange-500/80';
            case 'Epic': return 'bg-purple-500/80';
            case 'Rare': return 'bg-blue-500/80';
            case 'Uncommon': return 'bg-green-500/80';
            default: return 'bg-gray-500/80';
        }
    }

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

                    // Resize if dimension is too large (max 400px width/height)
                    const MAX_DIMENSION = 400;
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

                    // Compress to JPEG with quality 0.6 to ensure small size
                    // Base64 string length ~ 4/3 * size_in_bytes.
                    // 1MB limit = ~750KB bytes.
                    // Quality 0.6 usually results in much smaller files than 750KB for 400px images.
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.6);

                    // Final safety check (approximate base64 length check)
                    // 1MB = 1048576 characters approx.
                    if (dataUrl.length > 1000 * 1024) {
                        alert("The image is still too large after compression. Try an image with fewer details or lower resolution.");
                        return;
                    }

                    setIconUrl(dataUrl);
                };
                img.src = readerEvent.target?.result as string;
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setIconUrl('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const resetForm = () => {
        setName('');
        setStats('');
        setChance('');
        setLimitToTop5(false);
        setCost('');
        setIconUrl('');
        setRarity('Comum');
        setEditingId(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (name && stats && chance && cost) {
                const itemData = {
                    name,
                    rarity,
                    stats,
                    chance,
                    cost: parseInt(cost),
                    limitToTop5,
                    iconUrl: displayIcon
                };

                if (editingId) {
                    await updateItem(editingId, itemData);
                    setEditingId(null);
                } else {
                    await addItem(itemData);
                }

                setSuccess(true);
                resetForm();
                setTimeout(() => setSuccess(false), 3000);
            } else {
                alert("Please fill in all required fields (Name, Attributes, Chance, Cost).");
            }
        } catch (error) {
            console.error("Error saving item:", error);
            alert("Error saving item. Check the console for more details.\n" + (error as any).message);
        }
    };

    const handleEdit = (item: Item) => {
        setName(item.name);
        setRarity(item.rarity);
        setStats(item.stats);
        setChance(item.chance);
        setCost(item.cost.toString());
        setLimitToTop5(item.limitToTop5 || false);
        setIconUrl(item.iconUrl);
        setEditingId(item.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleClone = (item: Item) => {
        setName(item.name);
        setRarity(item.rarity);
        setStats(item.stats);
        setChance(item.chance);
        setCost(item.cost.toString());
        setLimitToTop5(item.limitToTop5 || false);
        setIconUrl(item.iconUrl);
        setEditingId(null); // Create new
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            await deleteItem(id);
        }
    };

    return (
        <AdminGuard>
            <div className="w-full max-w-[1400px] mx-auto px-4 lg:px-8 py-8 space-y-12">
                <header className="flex flex-col gap-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider w-fit">
                        <span className="material-symbols-outlined text-sm">add_circle</span>
                        Database
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-[#1c130d] dark:text-white tracking-tight">
                        {editingId ? 'Edit' : 'Register'} <span className="text-primary">Items</span>
                    </h1>
                    <p className="text-text-muted dark:text-gray-400 max-w-2xl">
                        Add new items to the system. They will automatically appear on the Dashboard and be available for distribution.
                    </p>
                </header>

                <div className="flex flex-col xl:flex-row gap-8 items-start">

                    {/* Form Section */}
                    <div className="flex-1 w-full bg-surface-light dark:bg-surface-dark rounded-2xl shadow-card border border-border-light dark:border-border-dark p-6 md:p-8 relative overflow-hidden">
                        {success && (
                            <div className="absolute top-0 left-0 w-full bg-green-500 text-white text-center py-2 font-bold text-sm animate-fade-in-down">
                                {editingId ? 'Item updated successfully!' : 'Item registered successfully!'}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="flex flex-col gap-6 mt-2">

                            {/* Name & Cost Row */}
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1 space-y-2">
                                    <label className="text-sm font-bold text-text-main dark:text-gray-200 ml-1">Item Name</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary outline-none dark:text-white"
                                        placeholder="Ex: Sword of Doom"
                                        required
                                    />
                                </div>
                                <div className="w-full md:w-1/3 space-y-2">
                                    <label className="text-sm font-bold text-text-main dark:text-gray-200 ml-1">Cost (Garnet)</label>
                                    <input
                                        type="number"
                                        value={cost}
                                        onChange={(e) => setCost(e.target.value)}
                                        className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary outline-none dark:text-white"
                                        placeholder="Ex: 150"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Rarity Selection */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-text-main dark:text-gray-200 ml-1">Rarity</label>
                                <div className="flex flex-wrap gap-2">
                                    {rarities.map((r) => (
                                        <button
                                            key={r}
                                            type="button"
                                            onClick={() => setRarity(r)}
                                            className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all transform active:scale-95 ${rarity === r
                                                ? getRarityColor(r) + ' shadow-md scale-105'
                                                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-400'
                                                }`}
                                        >
                                            {r}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Stats & Chance */}
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1 space-y-2">
                                    <label className="text-sm font-bold text-text-main dark:text-gray-200 ml-1">Attributes (Summary)</label>
                                    <input
                                        type="text"
                                        value={stats}
                                        onChange={(e) => setStats(e.target.value)}
                                        className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary outline-none dark:text-white"
                                        placeholder="Ex: Str: +300, Vit: +50"
                                        required
                                    />
                                </div>
                                <div className="w-full md:w-1/3 space-y-2">
                                    <label className="text-sm font-bold text-text-main dark:text-gray-200 ml-1">Drop Chance</label>
                                    <input
                                        type="text"
                                        value={chance}
                                        onChange={(e) => setChance(e.target.value)}
                                        className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary outline-none dark:text-white"
                                        placeholder="Ex: 1.5%"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Image Upload */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-text-main dark:text-gray-200 ml-1">Item Image</label>

                                {!iconUrl ? (
                                    <div className="relative group w-full h-32 rounded-xl bg-gray-50 dark:bg-black/20 border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-primary dark:hover:border-primary transition-colors cursor-pointer flex flex-col items-center justify-center gap-2">
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        <div className="bg-white dark:bg-gray-800 p-3 rounded-full shadow-sm group-hover:scale-110 transition-transform">
                                            <span className="material-symbols-outlined text-primary text-2xl">cloud_upload</span>
                                        </div>
                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Click to select an image</span>
                                        <span className="text-[10px] text-gray-400">PNG, JPG, GIF (Max 2MB)</span>
                                    </div>
                                ) : (
                                    <div className="relative w-full h-32 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black/20 group">
                                        <img src={iconUrl} alt="Preview" className="w-full h-full object-contain p-2" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="p-2 bg-white rounded-lg text-gray-700 hover:text-primary transition-colors"
                                                title="Change Image"
                                            >
                                                <span className="material-symbols-outlined">edit</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={removeImage}
                                                className="p-2 bg-white rounded-lg text-gray-700 hover:text-red-500 transition-colors"
                                                title="Remover"
                                            >
                                                <span className="material-symbols-outlined">delete</span>
                                            </button>
                                        </div>
                                        {/* Hidden input remains to allow re-selection via the edit button logic if needed, though button click above handles it */}
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Limit to Top 5 Checkbox */}
                            <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700">
                                <div className="relative flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={limitToTop5}
                                        onChange={(e) => setLimitToTop5(e.target.checked)}
                                        className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-300 transition-all checked:border-primary checked:bg-primary hover:border-primary focus:ring-2 focus:ring-primary/20 dark:border-gray-600 dark:bg-gray-700"
                                    />
                                    <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100">
                                        <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                                    </span>
                                </div>
                                <label className="cursor-pointer select-none text-sm font-bold text-text-main dark:text-white" onClick={() => setLimitToTop5(!limitToTop5)}>
                                    Limit to Top 5 Priority Players
                                </label>
                                <div className="group relative ml-auto">
                                    <span className="material-symbols-outlined cursor-help text-gray-400 hover:text-primary">help</span>
                                    <div className="absolute bottom-full right-0 mb-2 w-64 rounded-lg bg-gray-900 p-3 text-xs text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100 pointer-events-none z-10">
                                        If enabled, this item will only appear for the top 5 players in the priority queue (based on CP/DKP).
                                    </div>
                                </div>
                            </div>

                            <div className="h-4"></div>
                            <div className="flex gap-4">
                                {editingId && (
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="h-14 px-6 rounded-full font-bold text-text-muted hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                )}
                                <button type="submit" className="flex-1 h-14 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-lg shadow-primary/30 transition-all hover:-translate-y-0.5 active:translate-y-0 text-lg flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined">save</span>
                                    {editingId ? 'Save Changes' : 'Save Item'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Preview Section */}
                    <div className="w-full xl:w-[400px] flex flex-col gap-4">
                        <h3 className="text-lg font-bold text-text-main dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">visibility</span>
                            Preview
                        </h3>

                        {/* Item Card Preview (Reused style from Dashboard) */}
                        <article className="flex flex-col gap-4 p-5 rounded-2xl bg-surface-light dark:bg-surface-dark border border-gray-100 dark:border-gray-800 shadow-xl transition-all duration-300">
                            <div className="relative h-64 w-full rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                                <div className="absolute inset-0 bg-contain bg-center bg-no-repeat" style={{ backgroundImage: `url('${displayIcon}')` }}></div>
                                <div className={`absolute top-3 right-3 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full border border-white/10 flex items-center gap-1 ${getRarityBadgeColor(rarity)}`}>
                                    <span className="material-symbols-outlined text-sm text-white fill-1">star</span> {rarity}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">{name || 'Nome do Item'}</h3>
                                <div className="flex flex-wrap items-center gap-3 mt-3">
                                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-gray-700">{stats || 'Atributos...'}</span>
                                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-gray-700">Chance: {chance || '0%'}</span>
                                </div>
                            </div>

                            <div className="h-px w-full bg-gray-100 dark:bg-gray-800 my-1"></div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-text-muted">Estimated Cost</span>
                                <span className="text-xl font-black text-primary">{cost || '0'} Garnet</span>
                            </div>
                        </article>

                        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-sm">
                            <div className="flex items-center gap-2 font-bold mb-1">
                                <span className="material-symbols-outlined text-base">info</span>
                                Tip
                            </div>
                            When saved, this item will be available in the global list and can be selected by the Admin for distribution in raids.
                        </div>
                    </div>
                </div>

                {/* Items List Section */}
                <div className="border-t border-gray-200 dark:border-gray-800 pt-12">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-text-main dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">inventory_2</span>
                            Registered Items
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {items.map(item => (
                            <div key={item.id} className="bg-white dark:bg-surface-dark p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow group relative flex flex-col gap-3">
                                <div className="relative h-40 w-full rounded-xl overflow-hidden bg-gray-50 dark:bg-black/20">
                                    <img src={item.iconUrl || 'https://via.placeholder.com/150?text=No+Icon'} alt={item.name} className="w-full h-full object-contain" />
                                    <div className={`absolute top-2 right-2 text-white text-[10px] font-bold px-2 py-0.5 rounded-full ${getRarityBadgeColor(item.rarity)}`}>
                                        {item.rarity}
                                    </div>

                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <button onClick={() => handleEdit(item)} className="p-2 bg-white rounded-lg text-primary hover:bg-primary hover:text-white transition-colors" title="Editar">
                                            <span className="material-symbols-outlined">edit</span>
                                        </button>
                                        <button onClick={() => handleClone(item)} className="p-2 bg-white rounded-lg text-green-600 hover:bg-green-600 hover:text-white transition-colors" title="Clonar">
                                            <span className="material-symbols-outlined">content_copy</span>
                                        </button>
                                        <button onClick={() => handleDelete(item.id)} className="p-2 bg-white rounded-lg text-red-500 hover:bg-red-500 hover:text-white transition-colors" title="Excluir">
                                            <span className="material-symbols-outlined">delete</span>
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-bold text-text-main dark:text-white leading-tight truncate">{item.name}</h3>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="text-xs text-text-muted dark:text-gray-400">{item.cost} Garnet</span>
                                        <span className="text-xs text-text-muted dark:text-gray-400">{item.chance}</span>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {items.length === 0 && (
                            <div className="col-span-full py-12 flex flex-col items-center justify-center text-center text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
                                <span className="material-symbols-outlined text-4xl mb-2 opacity-50">inventory_2</span>
                                <p>No items registered yet.</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </AdminGuard>
    );
};

export default ItemRegistration;