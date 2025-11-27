import React from 'react';
import { Trash2, Disc, Type, Globe, Mic, MapPin, Compass } from 'lucide-react';
import { PointData } from '../types';
import { formatAudioFilename } from '../utils';
import type { LabelPosition } from '@/app/api/models/types';

interface VocabularyItem {
  chinese_word: string;
  pinyin: string;
  english_word: string;
  english_sentence?: string;
  chinese_translation?: string;
}

interface SidebarProps {
  selectedPoint: PointData | null;
  onUpdate: (id: string, data: Partial<PointData>) => void;
  onDelete: (id: string) => void;
  vocabularyList?: VocabularyItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ selectedPoint, onUpdate, onDelete, vocabularyList = [] }) => {
  if (!selectedPoint) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-slate-400 text-center">
        <MapPin className="w-12 h-12 mb-3 opacity-20" />
        <p className="font-medium">No Point Selected</p>
        <p className="text-sm mt-1">Click on the image to add a point, or select an existing marker to edit.</p>
      </div>
    );
  }

  const handleChange =
    (field: keyof PointData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const nextValue =
        field === "audioFilename"
          ? formatAudioFilename(e.target.value)
          : e.target.value;
      onUpdate(selectedPoint.id, { [field]: nextValue });
    };

  const handleVocabularySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedIndex = e.target.value;
    if (selectedIndex === "") {
      return;
    }
    const index = Number(selectedIndex);
    const vocab = vocabularyList[index];
    if (!vocab) return;
    console.log('vocab', vocab);
    onUpdate(selectedPoint.id, {
      hanzi: vocab.chinese_word,
      pinyin: vocab.pinyin,
      english: vocab.english_word,
      audioFilename: formatAudioFilename(vocab.english_word),
      vocabularyIndex: index,
    });
  };

  const handlePositionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdate(selectedPoint.id, { position: e.target.value as LabelPosition });
  };

  const positions: LabelPosition[] = ["左上", "左", "左下", "上", "下", "右上", "右", "右下"];

  // 找到当前选中的单词索引
  const selectedVocabIndex =
    typeof selectedPoint.vocabularyIndex === "number"
      ? selectedPoint.vocabularyIndex
      : vocabularyList.findIndex(
          (vocab) =>
            vocab.chinese_word === selectedPoint.hanzi &&
            vocab.pinyin === selectedPoint.pinyin &&
            vocab.english_word === selectedPoint.english
        );

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
           Edit Point
        </h2>
        <div className="mt-2 flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span>ID: {selectedPoint.id.slice(0, 8)}...</span>
        </div>
      </div>

      <div className="flex-1 p-6 space-y-6">
        
        {/* Coordinates Display */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-center">
            <span className="block text-xs text-slate-400 mb-1">Top (%)</span>
            <span className="font-mono font-bold text-slate-700">{selectedPoint.top}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-center">
            <span className="block text-xs text-slate-400 mb-1">Left (%)</span>
            <span className="font-mono font-bold text-slate-700">{selectedPoint.left}</span>
          </div>
        </div>

        <div className="space-y-4">
          {/* 单词选择下拉框 */}
          {vocabularyList.length > 0 && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5" />
                选择单词
              </label>
              <select
                value={selectedVocabIndex >= 0 ? selectedVocabIndex.toString() : ""}
                onChange={handleVocabularySelect}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700"
              >
                <option value="">-- 请选择单词 --</option>
                {vocabularyList.map((vocab, index) => (
                  <option key={index} value={index.toString()}>
                    {vocab.chinese_word} ({vocab.pinyin}) - {vocab.english_word}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 显示选中的单词信息（只读） */}
          <div className="space-y-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5" />
                Hanzi (Character)
              </label>
              <input
                type="text"
                value={selectedPoint.hanzi}
                onChange={handleChange('hanzi')}
                placeholder="e.g. 苹果"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-300"
                readOnly
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                <Disc className="w-3.5 h-3.5" />
                Pinyin
              </label>
              <input
                type="text"
                value={selectedPoint.pinyin}
                onChange={handleChange('pinyin')}
                placeholder="e.g. píng guǒ"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-300"
                readOnly
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                English
              </label>
              <input
                type="text"
                value={selectedPoint.english}
                onChange={handleChange('english')}
                placeholder="e.g. Apple"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-300"
                readOnly
              />
            </div>
          </div>

          {/* 角度选择 */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" />
              标注位置
            </label>
            <select
              value={selectedPoint.position || ""}
              onChange={handlePositionChange}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700"
            >
              <option value="">-- 请选择位置 --</option>
              {positions.map((pos) => (
                <option key={pos} value={pos}>
                  {pos}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
             <label className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
               <Mic className="w-3.5 h-3.5" />
               Audio Filename
            </label>
            <input
              type="text"
              value={selectedPoint.audioFilename}
              onChange={handleChange('audioFilename')}
              placeholder="e.g. apple_01.mp3"
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-300"
            />
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-slate-200 bg-slate-50/50">
        <button
          onClick={() => onDelete(selectedPoint.id)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-lg transition-colors font-medium text-sm shadow-sm"
        >
          <Trash2 className="w-4 h-4" />
          Remove Point
        </button>
      </div>
    </div>
  );
};
