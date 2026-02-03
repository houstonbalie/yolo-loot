import React, { useState, useEffect } from 'react';
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";

const ADMIN_PASSWORD = 'yololoot123';

interface AdminGuardProps {
    children: React.ReactNode;
}

const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const auth = getAuth();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setIsAuthenticated(true);
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [auth]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (password === ADMIN_PASSWORD) {
            setIsLoading(true);
            try {
                await signInAnonymously(auth);
                setIsAuthenticated(true);
                setError(false);
            } catch (err) {
                console.error("Erro na autenticação:", err);
                setError(true);
            } finally {
                setIsLoading(false);
            }
        } else {
            setError(true);
            setPassword('');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (isAuthenticated) {
        return <>{children}</>;
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 animate-fade-in">
            <div className="bg-surface-light dark:bg-surface-dark p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 max-w-sm w-full text-center">
                <h2 className="text-2xl font-bold mb-6">Restricted Access</h2>
                <form onSubmit={handleLogin} className="space-y-4">
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(false); }}
                        placeholder="Admin password"
                        className={`w-full h-12 px-4 rounded-xl border outline-none transition-all ${
                            error ? 'border-red-500 ring-2 ring-red-500/10' : 'border-gray-200 focus:border-primary'
                        }`}
                        autoFocus
                    />
                    <button
                        type="submit"
                        disabled={!password || isLoading}
                        className="w-full h-12 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all disabled:opacity-50"
                    >
                        Log In
                    </button>
                    {error && <p className="text-red-500 text-sm">Incorrect password</p>}
                </form>
            </div>
        </div>
    );
};

export default AdminGuard;