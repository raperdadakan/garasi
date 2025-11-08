
import React from 'react';
import { CarIcon, LayoutGridIcon, UsersIcon } from './icons';

type View = 'dashboard' | 'customers' | 'rooms';

interface HeaderProps {
    currentView: View;
    setCurrentView: (view: View) => void;
}

const NavButton: React.FC<{
    isActive: boolean;
    onClick: () => void;
    children: React.ReactNode;
}> = ({ isActive, onClick, children }) => {
    const baseClasses = "flex items-center gap-2 px-4 py-2 rounded-md transition-colors duration-200";
    const activeClasses = "bg-slate-700 text-white";
    const inactiveClasses = "text-slate-400 hover:bg-slate-700 hover:text-white";
    return (
        <button onClick={onClick} className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}>
            {children}
        </button>
    );
};


export const Header: React.FC<HeaderProps> = ({ currentView, setCurrentView }) => {
    return (
        <header className="bg-slate-900 p-4 shadow-lg sticky top-0 z-40">
            <div className="container mx-auto flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <CarIcon className="w-8 h-8 text-red-600"/>
                    <div>
                        <h1 className="text-2xl font-bold text-white">
                            GARASI SUMBER JAYA
                        </h1>
                        <p className="text-xs text-slate-400 -mt-1">Developed by IRVANtools</p>
                    </div>
                </div>
                <nav className="flex items-center gap-2">
                    <NavButton isActive={currentView === 'dashboard'} onClick={() => setCurrentView('dashboard')}>
                        <LayoutGridIcon className="w-5 h-5"/>
                        <span className="hidden sm:inline">Dashboard</span>
                    </NavButton>
                    <NavButton isActive={currentView === 'customers'} onClick={() => setCurrentView('customers')}>
                        <UsersIcon className="w-5 h-5"/>
                        <span className="hidden sm:inline">Customers</span>
                    </NavButton>
                    <NavButton isActive={currentView === 'rooms'} onClick={() => setCurrentView('rooms')}>
                        <CarIcon className="w-5 h-5"/>
                        <span className="hidden sm:inline">Rooms</span>
                    </NavButton>
                </nav>
            </div>
        </header>
    );
};
