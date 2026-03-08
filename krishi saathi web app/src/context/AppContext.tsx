import React, { createContext, useContext, useState } from 'react';

interface AppContextType {
    isOnline: boolean;
    toggleOnlineMode: () => void;
}

const AppContext = createContext<AppContextType>({ isOnline: true, toggleOnlineMode: () => { } });

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
    const [isOnline, setIsOnline] = useState(() => {
        const saved = localStorage.getItem('krishi_ai_mode');
        return saved === null ? true : saved === 'true';
    });

    const toggleOnlineMode = () => {
        setIsOnline(prev => {
            localStorage.setItem('krishi_ai_mode', String(!prev));
            return !prev;
        });
    };

    return (
        <AppContext.Provider value={{ isOnline, toggleOnlineMode }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppMode = () => useContext(AppContext);
