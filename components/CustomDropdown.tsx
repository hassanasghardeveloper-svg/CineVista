'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

interface Option {
    value: string | number;
    label: string;
}

interface CustomDropdownProps {
    label?: string;
    value: string | number;
    options: Option[];
    onChange: (value: any) => void;
    className?: string;
}

export default function CustomDropdown({
    label,
    value,
    options,
    onChange,
    className = '',
}: CustomDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Find the currently selected option to show its label
    const selectedOption = options.find((opt) => String(opt.value) === String(value));

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleOptionSelect = (optValue: string | number) => {
        onChange(optValue);
        setIsOpen(false);
    };

    return (
        <div ref={dropdownRef} className={`relative flex flex-col ${className}`}>
            {label && (
                <span className="block text-[10px] uppercase tracking-widest font-black text-white/40 mb-2">
                    {label}
                </span>
            )}
            
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2.5 rounded-xl font-bold text-sm focus:outline-none transition-all active:scale-[0.98] text-left"
            >
                <span className="truncate">
                    {selectedOption ? selectedOption.label : 'Select option'}
                </span>
                <ChevronDown
                    className={`w-4 h-4 text-white/40 ml-2 transition-transform duration-300 ${
                        isOpen ? 'rotate-180 text-white' : ''
                    }`}
                />
            </button>

            {/* Options Dropdown Overlay */}
            {isOpen && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-dark-900/95 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden shadow-2xl z-40 max-h-60 overflow-y-auto" style={{scrollbarWidth:'none', msOverflowStyle:'none'}}>
                    <div className="p-1.5 flex flex-col gap-0.5">
                        {options.map((option) => {
                            const isSelected = String(option.value) === String(value);
                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => handleOptionSelect(option.value)}
                                    className={`w-full text-left px-4 py-2.5 rounded-xl text-xs transition-colors font-bold ${
                                        isSelected
                                            ? 'bg-accent-orange/15 text-accent-orange'
                                            : 'text-white/60 hover:bg-white/5 hover:text-white'
                                    }`}
                                >
                                    {option.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
