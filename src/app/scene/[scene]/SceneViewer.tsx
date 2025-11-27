"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useRef } from "react";

export type VocabularyItem = {
  chinese_word: string;
  english_word: string;
  pinyin: string;
  top: string;
  left: string;
  audio_filename: string;
  position?: string;
};

type SceneViewerProps = {
  sceneName: string;
  slug: string;
  backgroundImage: string | null;
  vocabulary: VocabularyItem[];
};

const buildAudioSrc = (slug: string, fileName: string) =>
  `/scene/${slug}/audio/${fileName}.wav`;

export default function SceneViewer({
  sceneName,
  slug,
  backgroundImage,
  vocabulary,
}: SceneViewerProps) {
  const audioCache = useRef<Record<string, HTMLAudioElement>>({});

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
    <div className="min-h-screen bg-neutral-950 px-4 py-8 text-white">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm text-white/60">Scene Detail</p>
            <h1 className="text-3xl font-semibold tracking-tight">
              {sceneName}
            </h1>
            <p className="text-white/60">@{slug}</p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white transition hover:border-white hover:bg-white/10"
          >
            返回列表
          </Link>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-neutral-900 shadow-[0_30px_120px_-40px_rgba(0,0,0,0.8)]">
          <div className="relative h-full w-full">
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
            <div className="pointer-events-none absolute inset-0">
              {vocabulary.map((item) => {
                const audioSrc = buildAudioSrc(slug, item.audio_filename);

                return (
                  <div
                    key={`${item.chinese_word}-${item.audio_filename}`}
                    className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2"
                    style={{ top: item.top, left: item.left }}
                  >
                    <div className="relative rounded-md border border-black/10 bg-white/25 px-2 py-1 text-[12px] leading-tight text-neutral-900 shadow-md shadow-black/10 backdrop-blur-[2px]">
                      <button
                        type="button"
                        aria-label={`${item.chinese_word} 播放音频`}
                        className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full border border-black/10 bg-neutral-900 text-white transition hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/30"
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
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

