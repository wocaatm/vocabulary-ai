import React, { useRef, useState, useEffect } from 'react';
import { X, MapPin } from 'lucide-react';
import { PointData } from '../types';

interface ImageWorkspaceProps {
  imageSrc: string;
  points: PointData[];
  selectedPointId: string | null;
  onAddPoint: (x: number, y: number) => void;
  onSelectPoint: (id: string) => void;
  onDeletePoint: (id: string) => void;
}

export const ImageWorkspace: React.FC<ImageWorkspaceProps> = ({
  imageSrc,
  points,
  selectedPointId,
  onAddPoint,
  onSelectPoint,
  onDeletePoint,
}) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Prevent adding point when clicking a marker
    if ((e.target as HTMLElement).closest('.marker-point')) return;

    if (imgRef.current) {
      const rect = imgRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Calculate percentages
      const xPercent = (x / rect.width) * 100;
      const yPercent = (y / rect.height) * 100;

      // Ensure click is within bounds
      if (xPercent >= 0 && xPercent <= 100 && yPercent >= 0 && yPercent <= 100) {
        onAddPoint(xPercent, yPercent);
      }
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative shadow-xl rounded-lg overflow-hidden inline-block bg-white group select-none"
    >
      <img
        ref={imgRef}
        src={imageSrc}
        alt="Workspace"
        className="max-w-full h-auto max-h-[70vh] block cursor-crosshair object-contain"
        onClick={handleImageClick}
        draggable={false}
      />

      {points.map((point) => (
        <div
          key={point.id}
          className={`marker-point absolute w-8 h-8 -ml-4 -mt-4 flex items-center justify-center rounded-full border-2 cursor-pointer transition-transform hover:scale-110 shadow-md ${
            selectedPointId === point.id
              ? 'bg-indigo-600 border-white text-white z-20 scale-110'
              : 'bg-white/90 border-indigo-600 text-indigo-600 z-10 hover:bg-indigo-50'
          }`}
          style={{
            left: `${point.left}%`,
            top: `${point.top}%`,
          }}
          onClick={(e) => {
            e.stopPropagation();
            onSelectPoint(point.id);
          }}
        >
          <MapPin className="w-4 h-4" />
          
          {/* Delete Mini Button - Only visible on hover or selection */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeletePoint(point.id);
            }}
            className={`absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity ${selectedPointId === point.id ? 'opacity-100' : ''}`}
            title="Delete point"
          >
            <X className="w-3 h-3" />
          </button>
          
          {/* Label tooltip */}
          <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-30">
             {point.hanzi || point.pinyin || `Point`}
          </div>
        </div>
      ))}
    </div>
  );
};
