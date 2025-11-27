import React, { useState, useCallback } from 'react';
import { Upload, Layout, Image as ImageIcon } from 'lucide-react';
import { ImageWorkspace } from './components/ImageWorkspace';
import { Sidebar } from './components/Sidebar';
import { JsonViewer } from './components/JsonViewer';
import { PointData } from './types';
import type { GeminiVocabularyItem } from '@/app/api/models/types';
import { formatPercentString, formatAudioFilename } from './utils';
import type { GeminiPlanResponse } from '@/app/api/models/types';

interface VocabularyItem {
  chinese_word: string;
  pinyin: string;
  english_word: string;
  english_sentence?: string;
  chinese_translation?: string;
}

interface EditorProps {
  vocabularyList?: VocabularyItem[];
  planResponse?: GeminiPlanResponse | null;
  onPlanResponseChange?: (data: GeminiPlanResponse) => void;
}

const Editor: React.FC<EditorProps> = ({
  vocabularyList = [],
  planResponse,
  onPlanResponseChange,
}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [points, setPoints] = useState<PointData[]>([]);
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageSrc(e.target?.result as string);
        setPoints([]); // Reset points on new image
        setSelectedPointId(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const syncPointToPlan = useCallback(
    (point: PointData) => {
      if (!planResponse || !onPlanResponseChange) return;

      const resolveIndex = () => {
        if (
          typeof point.vocabularyIndex === "number" &&
          planResponse.vocabulary_list[point.vocabularyIndex]
        ) {
          return point.vocabularyIndex;
        }
        const normalize = (value?: string) =>
          (value || "").trim().toLowerCase();
        return planResponse.vocabulary_list.findIndex((item) => {
          return (
            normalize(item.chinese_word) === normalize(point.hanzi) ||
            normalize(item.english_word) === normalize(point.english) ||
            normalize(item.pinyin) === normalize(point.pinyin)
          );
        });
      };

      const matchIndex = resolveIndex();
      if (matchIndex < 0) {
        return;
      }

      const updatedList = planResponse.vocabulary_list.map((item, index) => {
        if (index !== matchIndex) {
          return item;
        }
        const fallbackEnglish =
          point.english || item.english_word || item.chinese_word;
        const updatedVocabulary: GeminiVocabularyItem = {
          ...item,
          top: formatPercentString(point.top),
          left: formatPercentString(point.left),
          position: point.position,
          audio_filename:
            formatAudioFilename(point.audioFilename || fallbackEnglish) ||
            item.audio_filename,
        };
        return updatedVocabulary;
      });

      onPlanResponseChange({
        ...planResponse,
        vocabulary_list: updatedList,
      });
    },
    [planResponse, onPlanResponseChange]
  );

  const handleAddPoint = useCallback(
    (xPercent: number, yPercent: number) => {
      const newPoint: PointData = {
        id: crypto.randomUUID(),
        left: Number(xPercent.toFixed(2)),
        top: Number(yPercent.toFixed(2)),
        pinyin: '',
        hanzi: '',
        english: '',
        audioFilename: '',
        position: undefined,
        vocabularyIndex: undefined,
      };
      setPoints((prev) => [...prev, newPoint]);
      setSelectedPointId(newPoint.id);
    },
    []
  );

  const handleUpdatePoint = (id: string, data: Partial<PointData>) => {
    const targetPoint = points.find((p) => p.id === id);
    if (!targetPoint) return;

    const nextPoint = { ...targetPoint, ...data };
    setPoints((prev) =>
      prev.map((p) => (p.id === id ? nextPoint : p))
    );
    syncPointToPlan(nextPoint);
  };

  const handleDeletePoint = (id: string) => {
    setPoints((prev) => prev.filter((p) => p.id !== id));
    if (selectedPointId === id) {
      setSelectedPointId(null);
    }
  };

  const selectedPoint = points.find((p) => p.id === selectedPointId) || null;

  return (
    <div className="min-h-screen flex flex-col h-screen overflow-hidden font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 h-16 flex items-center px-6 justify-between flex-shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-2 text-indigo-600">
          <Layout className="w-6 h-6" />
          <h1 className="text-xl font-bold tracking-tight text-slate-800">Point Mapper</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg cursor-pointer transition-colors text-sm font-medium">
            <Upload className="w-4 h-4" />
            <span>Upload Image</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* Left: Image Canvas */}
        <div className="flex-1 bg-slate-100 overflow-auto relative flex flex-col">
          <div className="flex-1 p-8 flex items-center justify-center min-h-[500px]">
             {imageSrc ? (
               <ImageWorkspace
                 imageSrc={imageSrc}
                 points={points}
                 selectedPointId={selectedPointId}
                 onAddPoint={handleAddPoint}
                 onSelectPoint={setSelectedPointId}
                 onDeletePoint={handleDeletePoint}
               />
             ) : (
               <div className="flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-300 rounded-2xl p-12 w-full max-w-lg bg-slate-50/50">
                 <ImageIcon className="w-16 h-16 mb-4 opacity-50" />
                 <p className="text-lg font-medium">No Image Uploaded</p>
                 <p className="text-sm mt-2 text-center max-w-xs">Upload an image to start mapping interactive points.</p>
               </div>
             )}
          </div>

          {/* Bottom: JSON Viewer */}
          <div className="h-48 border-t border-slate-200 bg-white flex-shrink-0 z-10">
            <JsonViewer
              data={planResponse}
              title="Plan JSON"
              badgeText={
                planResponse?.vocabulary_list
                  ? `${planResponse.vocabulary_list.length} vocab`
                  : undefined
              }
            />
          </div>
        </div>

        {/* Right: Editor Sidebar */}
        <div className="w-80 bg-white border-l border-slate-200 flex-shrink-0 overflow-y-auto">
          <Sidebar
            selectedPoint={selectedPoint}
            onUpdate={handleUpdatePoint}
            onDelete={handleDeletePoint}
            vocabularyList={vocabularyList}
          />
        </div>
      </main>
    </div>
  );
};

export default Editor;
