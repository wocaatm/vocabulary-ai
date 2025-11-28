"use client";

import Image from "next/image";
import Link from "next/link";
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

// 计算贝塞尔曲线路径
const calculateBezierPath = (
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

  // 计算中点
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  
  // 计算垂直于连线的偏移量，用于控制曲线弯曲程度
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.sqrt(dx * dx + dy * dy);
  
  // 曲线弯曲程度（正值向一侧弯曲，可以根据位置关系调整）
  // 弯曲量与距离成正比，但有上限
  const curvature = Math.min(length * 0.15, 40);
  
  // 计算垂直方向的单位向量（顺时针旋转90度）
  const perpX = dy / length;
  const perpY = -dx / length;
  
  // 根据起点和终点的相对位置决定弯曲方向
  // 如果卡片在物体右边，向上弯曲；在左边，向下弯曲
  const bendDirection = x2 > x1 ? -1 : 1;
  
  // 控制点
  const ctrlX = midX + perpX * curvature * bendDirection;
  const ctrlY = midY + perpY * curvature * bendDirection;

  return {
    x1, y1, x2, y2,
    ctrlX, ctrlY,
    // SVG 二次贝塞尔曲线路径
    path: `M ${x1} ${y1} Q ${ctrlX} ${ctrlY} ${x2} ${y2}`,
  };
};

// 图片原始设计尺寸（标注是在这个尺寸下制作的，1120px时比例为1）
const DESIGN_WIDTH = 1120;

// 卡片在设计稿下的基础尺寸系数（可调整卡片整体大小）
const CARD_BASE_SCALE = 1.0;

// PC 判断阈值（大于此值视为 PC）
const PC_BREAKPOINT = 1024;

// 可爱的 Loading 组件
function CuteLoading({ sceneName, sceneIcon }: { sceneName: string; sceneIcon: string }) {
  const animals = ['🐼', '🦁', '🐘', '🦒', '🐵', '🦋', '🐠', '🐢'];
  
  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-gradient-to-b from-amber-100 via-pink-50 to-sky-100">
      {/* 背景装饰 */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 top-20 h-64 w-64 rounded-full bg-yellow-200/40 blur-3xl animate-pulse" />
        <div className="absolute -right-20 top-1/3 h-72 w-72 rounded-full bg-pink-200/40 blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-40 left-1/4 h-56 w-56 rounded-full bg-green-200/40 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
      
      {/* 主要内容 */}
      <div className="relative z-10 flex flex-col items-center">
        {/* 跳动的动物表情 */}
        <div className="mb-8 flex gap-2">
          {animals.map((animal, index) => (
            <span
              key={index}
              className="text-3xl sm:text-4xl animate-bounce"
              style={{ 
                animationDelay: `${index * 0.1}s`,
                animationDuration: '0.8s',
              }}
            >
              {animal}
            </span>
          ))}
        </div>
        
        {/* 场景图标和名称 */}
        <div className="mb-6 flex items-center gap-3">
          <span className="text-5xl animate-pulse">{sceneIcon}</span>
        </div>
        
        {/* 加载文字 */}
        <div className="mb-4 text-center">
          <h2 className="mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-2xl font-bold text-transparent">
            {sceneName}
          </h2>
          <p className="text-gray-600">正在准备精彩内容...</p>
        </div>
        
        {/* 可爱的进度条 */}
        <div className="relative h-3 w-48 overflow-hidden rounded-full bg-white/50 shadow-inner">
          <div 
            className="absolute h-full rounded-full bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400"
            style={{
              animation: 'loading-progress 1.5s ease-in-out infinite',
              width: '40%',
            }}
          />
        </div>
        
        {/* 提示文字 */}
        <p className="mt-6 text-sm text-gray-500">
          <span className="inline-block animate-bounce" style={{ animationDelay: '0s' }}>🎨</span>
          {' '}小朋友稍等一下哦{' '}
          <span className="inline-block animate-bounce" style={{ animationDelay: '0.2s' }}>✨</span>
        </p>
      </div>
      
      {/* CSS 动画 */}
      <style jsx>{`
        @keyframes loading-progress {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(150%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
}

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
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [shouldRotate, setShouldRotate] = useState(false);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // 处理图片加载完成
  const handleImageLoad = useCallback(() => {
    // 添加小延迟让动画更流畅
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, []);

  // 检测设备类型和是否需要旋转
  // 逻辑：非 PC + 横屏（宽 > 高）时旋转页面，让 A4 纵向图片更好展示
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isPC = Math.max(width, height) >= PC_BREAKPOINT && !('ontouchstart' in window);
      const isLandscape = width > height;
      
      setViewportSize({ width, height });
      
      // 非 PC + 横屏时需要旋转（如 iPad 横握）
      // 手机竖屏（高 > 宽）保持原样
      setShouldRotate(!isPC && isLandscape);
    };
    
    checkDevice();
    window.addEventListener('resize', checkDevice);
    window.addEventListener('orientationchange', checkDevice);
    return () => {
      window.removeEventListener('resize', checkDevice);
      window.removeEventListener('orientationchange', checkDevice);
    };
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

  // 预加载所有音频文件
  useEffect(() => {
    const cache = audioCache.current;
    
    // 遍历所有词汇，预加载对应的音频
    vocabulary.forEach((item) => {
      const audioSrc = buildAudioSrc(slug, item.audio_filename);
      
      // 如果还没有缓存，创建 Audio 对象并预加载
      if (!cache[audioSrc]) {
        const audio = new Audio();
        audio.preload = 'auto'; // 自动预加载
        audio.src = audioSrc;
        cache[audioSrc] = audio;
      }
    });

    // 组件卸载时清理音频资源
    return () => {
      Object.values(cache).forEach((audio) => {
        audio.pause();
        audio.src = '';
      });
    };
  }, [vocabulary, slug]);

  // 计算卡片缩放比例（与图片缩放保持同步）
  const cardScale = containerSize.width > 0 
    ? (containerSize.width / DESIGN_WIDTH) * CARD_BASE_SCALE
    : CARD_BASE_SCALE;

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

  // 旋转容器样式：将横屏旋转为竖屏显示
  const rotatedContainerStyle = shouldRotate ? {
    transform: 'rotate(-90deg)',
    transformOrigin: 'center center',
    width: viewportSize.height,
    height: viewportSize.width,
    position: 'fixed' as const,
    top: '50%',
    left: '50%',
    marginTop: -(viewportSize.width / 2),
    marginLeft: -(viewportSize.height / 2),
  } : {};

  // PC 下使用正常布局，可滚动；旋转模式下使用 fixed 布局
  if (shouldRotate) {
    return (
      <>
        {isLoading && <CuteLoading sceneName={sceneName} sceneIcon={sceneIcon} />}
        <div className="fixed inset-0 overflow-hidden bg-gradient-to-b from-amber-100 via-pink-50 to-sky-100">
          <div style={rotatedContainerStyle} className="overflow-auto">
            <SceneContent
              sceneName={sceneName}
              sceneIcon={sceneIcon}
              sceneDescription={sceneDescription}
              slug={slug}
              backgroundImage={backgroundImage}
              vocabulary={vocabulary}
              containerRef={containerRef}
              containerSize={containerSize}
              cardScale={cardScale}
              handlePlay={handlePlay}
              onImageLoad={handleImageLoad}
              minHeight={viewportSize.width}
            />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {isLoading && <CuteLoading sceneName={sceneName} sceneIcon={sceneIcon} />}
      <SceneContent
        sceneName={sceneName}
        sceneIcon={sceneIcon}
        sceneDescription={sceneDescription}
        slug={slug}
        backgroundImage={backgroundImage}
        vocabulary={vocabulary}
        containerRef={containerRef}
        containerSize={containerSize}
        cardScale={cardScale}
        handlePlay={handlePlay}
        onImageLoad={handleImageLoad}
      />
    </>
  );
}

// 提取场景内容为独立组件，避免代码重复
type SceneContentProps = {
  sceneName: string;
  sceneIcon: string;
  sceneDescription: string;
  slug: string;
  backgroundImage: string | null;
  vocabulary: VocabularyItem[];
  containerRef: React.RefObject<HTMLDivElement | null>;
  containerSize: { width: number; height: number };
  cardScale: number;
  handlePlay: (audioSrc: string) => void;
  onImageLoad: () => void;
  minHeight?: number;
};

function SceneContent({
  sceneName,
  sceneIcon,
  sceneDescription,
  slug,
  backgroundImage,
  vocabulary,
  containerRef,
  containerSize,
  cardScale,
  handlePlay,
  onImageLoad,
  minHeight,
}: SceneContentProps) {
  // 如果没有背景图片，直接触发加载完成
  useEffect(() => {
    if (!backgroundImage) {
      onImageLoad();
    }
  }, [backgroundImage, onImageLoad]);

  return (
    <div 
      className="w-full min-h-screen bg-gradient-to-b from-amber-100 via-pink-50 to-sky-100"
      style={minHeight ? { minHeight } : {}}
    >
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

              {/* 占位，保持布局平衡 */}
              <div className="w-10 sm:w-24" />
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
            <div className="rounded-3xl bg-white/50 p-2 shadow-xl backdrop-blur-sm sm:p-4">
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
                    onLoad={onImageLoad}
                  />
                ) : (
                  <div className="flex aspect-video items-center justify-center rounded-2xl bg-gradient-to-br from-pink-200 to-purple-200 text-gray-500">
                    <span className="text-4xl">🖼️</span>
                    <span className="ml-2">暂无背景图</span>
                  </div>
                )}

                {/* 标注层 - 包含连接线、标记点、卡片 */}
                <div className="pointer-events-none absolute inset-0 z-10">
                  {/* SVG 层用于绘制所有贝塞尔曲线连接线 */}
                  {containerSize.width > 0 && (
                    <svg 
                      className="absolute inset-0 w-full h-full" 
                      style={{ overflow: 'visible' }}
                    >
                      <defs>
                        {/* 为每个连接线定义阴影滤镜 */}
                        <filter id="line-shadow" x="-20%" y="-20%" width="140%" height="140%">
                          <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodOpacity="0.2" />
                        </filter>
                      </defs>
                      {vocabulary.map((item) => {
                        const color = item.color || "#FF6B6B";
                        const bezier = calculateBezierPath(
                          item.left,
                          item.top,
                          item.cardLeft,
                          item.cardTop,
                          containerSize.width,
                          containerSize.height
                        );
                        
                        return (
                          <g key={`line-${item.chinese_word}-${item.audio_filename}`}>
                            {/* 白色描边背景 */}
                            <path
                              d={bezier.path}
                              fill="none"
                              stroke="white"
                              strokeWidth={4 * cardScale}
                              strokeLinecap="round"
                              filter="url(#line-shadow)"
                            />
                            {/* 彩色主线 */}
                            <path
                              d={bezier.path}
                              fill="none"
                              stroke={color}
                              strokeWidth={2 * cardScale}
                              strokeLinecap="round"
                              opacity={0.7}
                            />
                          </g>
                        );
                      })}
                    </svg>
                  )}
                  
                  {vocabulary.map((item) => {
                    const audioSrc = buildAudioSrc(slug, item.audio_filename);
                    const color = item.color || "#FF6B6B";

                    return (
                      <div key={`${item.chinese_word}-${item.audio_filename}`}>
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
                              <p className="text-[10px] tracking-[0.1em] text-gray-500 whitespace-nowrap">
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
            </div>

            {/* 底部操作提示 */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <span className="text-lg">👆</span> 点击播放按钮听发音
              </span>
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
  );
}
