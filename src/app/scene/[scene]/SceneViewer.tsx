"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useRef, useState, useEffect } from "react";
import {
  TransformWrapper,
  TransformComponent,
  useControls,
  ReactZoomPanPinchRef,
} from "react-zoom-pan-pinch";

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
  sceneIcon: string;
  sceneDescription: string;
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

// 缩放范围
const MIN_SCALE = 0.5;
const MAX_SCALE = 3;

// 卡片缩放基准宽度（宽度为900px时，卡片缩放比例为1）
const CARD_BASE_WIDTH = 900;
const CARD_MIN_SCALE = 0.5;  // 卡片最小缩放比例
const CARD_MAX_SCALE = 1.2;  // 卡片最大缩放比例

// 缩放控制按钮组件
function ZoomControls({ scale }: { scale: number }) {
  const { zoomIn, zoomOut, resetTransform } = useControls();
  
  return (
    <div className="flex items-center gap-1 rounded-full bg-white/90 p-1 shadow-md">
      <button
        onClick={() => zoomOut()}
        className="flex h-8 w-8 items-center justify-center rounded-full text-gray-600 transition hover:bg-pink-100 active:scale-95"
        title="缩小"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      </button>
      <button
        onClick={() => resetTransform()}
        className="flex h-8 min-w-[3rem] items-center justify-center rounded-full px-2 text-sm font-medium text-gray-700 transition hover:bg-pink-100 active:scale-95"
        title="重置缩放"
      >
        {Math.round(scale * 100)}%
      </button>
      <button
        onClick={() => zoomIn()}
        className="flex h-8 w-8 items-center justify-center rounded-full text-gray-600 transition hover:bg-pink-100 active:scale-95"
        title="放大"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
}

// 移动端判断阈值（小于此宽度视为手机）
const MOBILE_BREAKPOINT = 768;

export default function SceneViewer({
  sceneName,
  sceneIcon,
  sceneDescription,
  slug,
  backgroundImage,
  vocabulary,
}: SceneViewerProps) {
  const audioCache = useRef<Record<string, HTMLAudioElement>>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const transformRef = useRef<ReactZoomPanPinchRef>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [scale, setScale] = useState(1);
  const [isMobile, setIsMobile] = useState(false);

  // 检测是否为移动端
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  // 计算卡片缩放比例（基于容器宽度）
  const cardScale = Math.min(
    CARD_MAX_SCALE,
    Math.max(CARD_MIN_SCALE, containerSize.width / CARD_BASE_WIDTH)
  );

  // 处理缩放变化事件
  const handleTransformChange = useCallback((ref: ReactZoomPanPinchRef) => {
    setScale(ref.state.scale);
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
    <TransformWrapper
      ref={transformRef}
      initialScale={1}
      minScale={MIN_SCALE}
      maxScale={MAX_SCALE}
      centerOnInit={false}
      onTransformed={handleTransformChange}
      disabled={!isMobile}
      panning={{ disabled: !isMobile, velocityDisabled: true }}
      doubleClick={{ disabled: !isMobile, mode: "reset" }}
      wheel={{ disabled: !isMobile, step: 0.1 }}
      pinch={{ disabled: !isMobile, step: 5 }}
    >
      <div className="min-h-screen w-full bg-gradient-to-b from-amber-100 via-pink-50 to-sky-100">
        {/* 装饰性背景元素 */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -left-20 top-20 h-64 w-64 rounded-full bg-yellow-200/30 blur-3xl" />
          <div className="absolute -right-20 top-1/3 h-72 w-72 rounded-full bg-pink-200/30 blur-3xl" />
          <div className="absolute bottom-40 left-1/4 h-56 w-56 rounded-full bg-green-200/30 blur-3xl" />
          <div className="absolute -bottom-10 right-1/4 h-48 w-48 rounded-full bg-blue-200/30 blur-3xl" />
        </div>

        {/* 顶部导航栏 */}
        <header className="sticky top-0 z-50 border-b border-white/50 bg-white/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-pink-400 to-orange-400 p-2 text-sm font-medium text-white shadow-md transition hover:shadow-lg active:scale-95 sm:px-4 sm:py-2"
            >
              <svg className="h-5 w-5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="hidden sm:inline">返回首页</span>
            </Link>
            
            <div className="flex items-center gap-2 text-center">
              <span className="text-2xl">{sceneIcon}</span>
              <h1 className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-xl font-bold text-transparent">
                {sceneName}
              </h1>
            </div>

            {/* 缩放控制按钮 - 仅移动端显示 */}
            {isMobile && <ZoomControls scale={scale} />}
          </div>
        </header>

        {/* 场景描述 */}
        {sceneDescription && (
          <div className="relative z-10 mx-auto max-w-4xl px-4 py-4">
            <div className="rounded-2xl bg-white/70 px-4 py-3 text-center text-gray-600 shadow-sm backdrop-blur-sm">
              {sceneDescription}
            </div>
          </div>
        )}

        {/* 主要内容区域 */}
        <div className="relative z-10 mx-auto max-w-6xl px-4 pb-8">
          <div className="rounded-3xl bg-white/50 p-2 shadow-xl backdrop-blur-sm sm:p-4" style={{ overflow: isMobile ? 'hidden' : 'visible' }}>
            <TransformComponent
              wrapperStyle={{
                width: "100%",
                ...(isMobile ? { maxHeight: "calc(100vh - 200px)", overflow: "hidden" } : {}),
                borderRadius: "1rem",
              }}
              contentStyle={{
                width: "100%",
              }}
            >
              <div
                ref={containerRef}
                className="relative w-full"
              >
                {backgroundImage ? (
                  <Image
                    src={backgroundImage}
                    alt={`${sceneName} 背景图`}
                    width={1920}
                    height={1080}
                    className="h-auto w-full rounded-2xl"
                    style={{ maxWidth: '100%' }}
                    priority
                    draggable={false}
                  />
                ) : (
                  <div className="flex aspect-video items-center justify-center rounded-2xl bg-gradient-to-br from-pink-200 to-purple-200 text-gray-500">
                    <span className="text-4xl">🖼️</span>
                    <span className="ml-2">暂无背景图</span>
                  </div>
                )}

                {/* 标注层 - 包含连接线、标记点、卡片 */}
                <div className="pointer-events-none absolute inset-0 z-10">
                  {vocabulary.map((item) => {
                    const audioSrc = buildAudioSrc(slug, item.audio_filename);
                    const color = item.color || "#FF6B6B";

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
                              height: 4 * cardScale,
                              transform: `translateY(-50%) rotate(${lineParams.angle}deg)`,
                              backgroundColor: "white",
                              borderRadius: 2 * cardScale,
                              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                            }}
                          >
                            <div
                              className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full"
                              style={{
                                width: "100%",
                                height: 2 * cardScale,
                                backgroundColor: color,
                                opacity: 0.7,
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
                            className="rounded-full border-white shadow-lg"
                            style={{ 
                              backgroundColor: color,
                              width: 16 * cardScale,
                              height: 16 * cardScale,
                              borderWidth: 3 * cardScale,
                            }}
                          />
                        </div>
                        {/* 卡片位置 */}
                        <div
                          className="pointer-events-auto absolute z-30"
                          style={{ 
                            top: item.cardTop, 
                            left: item.cardLeft,
                            transform: `translate(-50%, -50%) scale(${cardScale})`,
                          }}
                        >
                          <div
                            className="relative rounded-xl border-2 bg-white/95 px-3 py-2 text-[12px] leading-tight shadow-lg backdrop-blur-sm transition-transform hover:scale-105"
                            style={{ borderColor: color }}
                          >
                            <button
                              type="button"
                              aria-label={`${item.chinese_word} 播放音频`}
                              className="play-button absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white text-white shadow-md transition hover:scale-125 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                              style={{ backgroundColor: color }}
                              onClick={() => handlePlay(audioSrc)}
                            >
                              <svg viewBox="0 0 24 24" className="h-3 w-3 fill-current" aria-hidden>
                                <path d="M5 4.5v15a1 1 0 0 0 1.52.85l12-7.5a1 1 0 0 0 0-1.7l-12-7.5A1 1 0 0 0 5 4.5Z" />
                              </svg>
                            </button>
                            <div className="flex flex-col items-center text-center">
                              <p className="text-[10px] uppercase tracking-[0.15em] text-gray-500 whitespace-nowrap">
                                {item.pinyin}
                              </p>
                              <p className="text-[14px] font-bold text-gray-800">
                                {item.chinese_word}
                              </p>
                              <p className="text-[11px] text-gray-600">
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
            </TransformComponent>
          </div>

          {/* 底部操作提示 */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <span className="text-lg">👆</span> 点击播放按钮听发音
            </span>
            {isMobile && (
              <>
                <span className="flex items-center gap-1">
                  <span className="text-lg">🔍</span> 双指缩放，双击重置
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-lg">✋</span> 拖动平移查看
                </span>
              </>
            )}
          </div>

          {/* 词汇统计 */}
          <div className="mt-4 text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-2 text-sm font-medium text-purple-700">
              <span className="text-lg">📚</span>
              本场景共有 <strong>{vocabulary.length}</strong> 个词汇等你来学习！
            </span>
          </div>
        </div>
      </div>
    </TransformWrapper>
  );
}
