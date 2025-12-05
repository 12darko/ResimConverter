import React, { useState, useRef, useEffect } from 'react';

interface CompareSliderProps {
    originalUrl: string;
    convertedUrl: string;
    onClose: () => void;
}

export const CompareSlider: React.FC<CompareSliderProps> = ({ originalUrl, convertedUrl, onClose }) => {
    const [sliderPosition, setSliderPosition] = useState(50);
    const containerRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);

    const handleMove = (x: number) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const pos = ((x - rect.left) / rect.width) * 100;
        setSliderPosition(Math.min(100, Math.max(0, pos)));
    };

    const onMouseDown = () => (isDragging.current = true);
    const onMouseUp = () => (isDragging.current = false);
    const onMouseMove = (e: React.MouseEvent) => {
        if (isDragging.current) handleMove(e.clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        handleMove(e.touches[0].clientX);
    };

    useEffect(() => {
        const handleGlobalUp = () => (isDragging.current = false);
        window.addEventListener('mouseup', handleGlobalUp);
        return () => window.removeEventListener('mouseup', handleGlobalUp);
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-4xl bg-[#0B0F19] rounded-2xl border border-slate-700 overflow-hidden flex flex-col">

                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-slate-800">
                    <h3 className="text-white font-bold text-lg">Before / After Comparison</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        ✕
                    </button>
                </div>

                {/* Viewport */}
                <div
                    ref={containerRef}
                    className="relative w-full h-[60vh] cursor-ew-resize select-none overflow-hidden"
                    onMouseMove={onMouseMove}
                    onMouseDown={onMouseDown}
                    onTouchMove={onTouchMove}
                >
                    {/* After Image (Background) */}
                    <img
                        src={convertedUrl}
                        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                        alt="After"
                    />

                    {/* Before Image (Foreground - Clipped) */}
                    <div
                        className="absolute inset-0 overflow-hidden border-r-2 border-white/50"
                        style={{ width: `${sliderPosition}%` }}
                    >
                        <img
                            src={originalUrl}
                            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                            style={{ width: '100vw', maxWidth: '56rem' }} // Hack to keep aspect ratio matching container
                            alt="Before"
                        />
                        {/* Note: In a real aspect-fit scenario, precise overlay is tricky. 
                 For this demo, we assume both images are standard fit. 
                 A more robust approach uses background-image: cover/contain with precise positioning. */}
                    </div>

                    {/* Slider Handle */}
                    <div
                        className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                        style={{ left: `${sliderPosition}%` }}
                    >
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg text-indigo-900 font-bold text-xs">
                            ↔
                        </div>
                    </div>

                    <div className="absolute top-4 left-4 bg-black/50 text-white px-2 py-1 rounded text-xs pointer-events-none">Original</div>
                    <div className="absolute top-4 right-4 bg-indigo-600/50 text-white px-2 py-1 rounded text-xs pointer-events-none">Converted</div>
                </div>

            </div>
        </div>
    );
};
