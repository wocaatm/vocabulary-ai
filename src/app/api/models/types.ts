export interface VocabularyItem {
  id: string;
  word_cn: string;
  pinyin: string;
  word_en: string;
  sentence_en: string;
  sentence_cn: string;
  audioUrl?: string;
  x: number; // Percentage (0-100)
  y: number; // Percentage (0-100)
  isPlaced: boolean;
}

export interface GeneratedData {
  prompt: string;
  items: Omit<VocabularyItem, 'id' | 'x' | 'y' | 'isPlaced' | 'audioUrl'>[];
}

export type AppState = 'initial' | 'generating_plan' | 'generating_media' | 'editing' | 'viewing';

export type LabelPosition = '左上' | '左' | '左下' | '上' | '下' | '右上' | '右' | '右下';

export interface GeminiVocabularyItem {
  chinese_word: string;
  pinyin: string;
  english_word: string;
  english_sentence?: string;
  chinese_translation?: string;
  top?: number | string;
  left?: number | string;
  position?: LabelPosition;
  audio_filename?: string;
}

// Type for the Gemini response schema
export interface GeminiPlanResponse {
  image_prompt: string;
  vocabulary_list: GeminiVocabularyItem[];
}
