
import React, { useRef, useState } from 'react';
import { useLanguage } from '../LanguageContext';

interface DropzoneProps {
  onFilesAdded: (files: File[]) => void;
  disabled?: boolean;
}

export const Dropzone: React.FC<DropzoneProps> = ({ onFilesAdded, disabled }) => {
  const { t } = useLanguage();
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesAdded(Array.from(e.dataTransfer.files));
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesAdded(Array.from(e.target.files));
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative group cursor-pointer rounded-2xl p-12 transition-all duration-500 ease-out
        flex flex-col items-center justify-center text-center overflow-hidden border-2 border-dashed
        ${disabled 
          ? 'opacity-60 cursor-not-allowed border-slate-700 bg-slate-900/50' 
          : isDragOver 
            ? 'border-indigo-500 bg-indigo-500/10 scale-[1.02] shadow-[0_0_30px_rgba(99,102,241,0.2)]' 
            : 'border-slate-700 hover:border-indigo-400/50 hover:bg-slate-800/50'
        }
      `}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInput}
        className="hidden"
        accept="image/png, image/jpeg, image/webp, .heic, .heif"
        multiple
      />
      
      {/* Background Glow */}
      <div className={`absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

      <div className={`relative z-10 p-5 rounded-full bg-slate-800/80 mb-6 shadow-xl border border-white/5 group-hover:scale-110 transition-transform duration-300 ${isDragOver ? 'bg-indigo-600 text-white' : 'text-indigo-400'}`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      </div>

      <h3 className="relative z-10 text-2xl font-bold text-white mb-2 tracking-tight">
        {disabled ? t('drop_limit') : t('drop_title')}
      </h3>
      <p className="relative z-10 text-slate-400 text-sm max-w-sm mx-auto leading-relaxed">
        {disabled ? t('drop_limit_desc') : t('drop_desc')}
      </p>
      
      {!disabled && (
        <div className="relative z-10 mt-6 flex gap-3 opacity-60">
           <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300">HEIC</span>
           <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300">JPG</span>
           <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300">PNG</span>
        </div>
      )}
    </div>
  );
};
