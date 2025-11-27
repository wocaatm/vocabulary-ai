import type { LabelPosition } from "@/app/api/models/types";

export interface PointData {
  id: string;
  top: number; // percentage 0-100
  left: number; // percentage 0-100
  pinyin: string;
  hanzi: string;
  english: string;
  audioFilename: string;
  position?: LabelPosition; // 标注位置角度
  vocabularyIndex?: number; // 记录选中的词条索引，方便回填
}

export interface ImageDimensions {
  width: number;
  height: number;
}
