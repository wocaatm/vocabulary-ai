"use client";

import Image from "next/image";
import { useCallback, useRef, useState, useEffect } from "react";

export type VocabularyItem = {
  chinese_word: string;
  english_word: string;
  pinyin: string;
  top: string;
  left: string;
  cardTop: string;
  cardLeft: string;
  audio_filename: string;
  color?: string;
};

type SceneViewerProps = {
  sceneName: string;
  slug: string;
  backgroundImage: string | null;
  vocabulary: VocabularyItem[];
};

const buildAudioSrc = (slug: string, fileName: string) =>
  `/scene/${slug}/audio/${fileName}.wav`;

// 解析百分比字符串为数字
const parsePercent = (val: string) => parseFloat(val.replace("%", "")) / 100;

// 计算两点之间的连接线参数
const calculateLine = (
  x1Percent: string,
  y1Percent: string,
  x2Percent: string,
  y2Percent: string,
  containerWidth: number,
  containerHeight: number
) => {
  const x1 = parsePercent(x1Percent) * containerWidth;
  const y1 = parsePercent(y1Percent) * containerHeight;
  const x2 = parsePercent(x2Percent) * containerWidth;
  const y2 = parsePercent(y2Percent) * containerHeight;

  const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);

  return { length, angle };
};

export default function SceneViewer({
  sceneName,
  slug,
  backgroundImage,
  vocabulary,
}: SceneViewerProps) {
  const audioCache = useRef<Record<string, HTMLAudioElement>>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // 监听容器尺寸变化
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setContainerSize({ width, height });
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const handlePlay = useCallback((audioSrc: string) => {
    const cache = audioCache.current;

    Object.entries(cache).forEach(([key, audio]) => {
      if (key !== audioSrc && !audio.paused) {
        audio.pause();
        audio.currentTime = 0;
      }
    });

    if (!cache[audioSrc]) {
      cache[audioSrc] = new Audio(audioSrc);
    } else {
      cache[audioSrc].currentTime = 0;
    }

    cache[audioSrc].play().catch((error) => {
      console.error("音频播放失败", error);
    });
  }, []);

  return (
    <div className="min-h-screen w-full overflow-x-auto bg-neutral-950 text-white">
      <div ref={containerRef} className="relative inline-block w-full min-w-[900px]">
        {backgroundImage ? (
          <Image
            src={backgroundImage}
            alt={`${sceneName} 背景图`}
            width={1920}
            height={1080}
            className="h-auto w-full"
            priority
          />
        ) : (
          <div className="flex h-[480px] items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-900 text-white/50">
            暂无背景图
          </div>
        )}
        {/* 标注层 - 包含连接线、标记点、卡片 */}
        <div className="pointer-events-none absolute inset-0 z-10">
          {vocabulary.map((item) => {
            const audioSrc = buildAudioSrc(slug, item.audio_filename);
            const color = item.color || "#000000";

            // 计算连接线参数
            const lineParams =
              containerSize.width > 0
                ? calculateLine(
                    item.left,
                    item.top,
                    item.cardLeft,
                    item.cardTop,
                    containerSize.width,
                    containerSize.height
                  )
                : null;

            return (
              <div key={`${item.chinese_word}-${item.audio_filename}`}>
                {/* 连接线 */}
                {lineParams && (
                  <div
                    className="absolute origin-left"
                    style={{
                      left: item.left,
                      top: item.top,
                      width: lineParams.length,
                      height: 4,
                      transform: `translateY(-50%) rotate(${lineParams.angle}deg)`,
                      backgroundColor: "white",
                      borderRadius: 2,
                    }}
                  >
                    <div
                      className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full"
                      style={{
                        width: "100%",
                        height: 2,
                        backgroundColor: "#374151",
                      }}
                    />
                  </div>
                )}
                {/* 物体位置标记点 */}
                <div
                  className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
                  style={{ top: item.top, left: item.left }}
                >
                  <div
                    className="h-3 w-3 rounded-full border-2 border-white shadow-md"
                    style={{ backgroundColor: color }}
                  />
                </div>
                {/* 卡片位置 */}
                <div
                  className="pointer-events-auto absolute z-30 -translate-x-1/2 -translate-y-1/2"
                  style={{ top: item.cardTop, left: item.cardLeft }}
                >
                  <div
                    className="relative rounded-md border-2 bg-white/90 px-2 py-1 text-[12px] leading-tight text-neutral-900 shadow-md backdrop-blur-[2px]"
                    style={{ borderColor: color }}
                  >
                    <button
                      type="button"
                      aria-label={`${item.chinese_word} 播放音频`}
                      className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white text-white transition hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/30"
                      style={{ backgroundColor: color }}
                      onClick={() => handlePlay(audioSrc)}
                    >
                      <svg viewBox="0 0 24 24" className="h-2.5 w-2.5 fill-current" aria-hidden>
                        <path d="M5 4.5v15a1 1 0 0 0 1.52.85l12-7.5a1 1 0 0 0 0-1.7l-12-7.5A1 1 0 0 0 5 4.5Z" />
                      </svg>
                    </button>
                    <div className="flex flex-col items-center text-center">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-900 whitespace-nowrap">
                        {item.pinyin}
                      </p>
                      <p className="text-[12px] font-semibold text-neutral-900">
                        {item.chinese_word}
                      </p>
                      <p className="text-[12px] text-neutral-900">
                        {item.english_word}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
