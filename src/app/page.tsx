"use client";

import Image from "next/image";
import { useCallback, useRef } from "react";

import bgImage from "@/app/assets/imgs/bg.jpeg";

const hotspots = [
  {
    id: "binoculars",
    label: "望远镜导览",
    fileName: "binoculars",
    audioSrc: "/audio/binoculars.wav",
    top: "87%",
    left: "85%",
  },
  {
    id: "camera",
    label: "拍照点",
    fileName: "camera",
    audioSrc: "/audio/camera.wav",
    top: "93%",
    left: "13%",
  },
  {
    id: "giraffe",
    label: "长颈鹿",
    fileName: "giraffe",
    audioSrc: "/audio/giraffe.wav",
    top: "26%",
    left: "85%",
  },
  {
    id: "lion",
    label: "狮子",
    fileName: "lion",
    audioSrc: "/audio/lion.wav",
    top: "24%",
    left: "33%",
  },
  {
    id: "panda",
    label: "熊猫",
    fileName: "panda",
    audioSrc: "/audio/panda.wav",
    top: "53%",
    left: "56%",
  },
  {
    id: "zebra",
    label: "斑马",
    fileName: "zebra",
    audioSrc: "/audio/zebra.wav",
    top: "62%",
    left: "73%",
  },
  {
    id: "elephant",
    label: "大象",
    fileName: "elephant",
    audioSrc: "/audio/elephant.wav",
    top: "20%",
    left: "45%",
  },
  {
    id: "entrance",
    label: "入口指引",
    fileName: "entrance",
    audioSrc: "/audio/entrance.wav",
    top: "54%",
    left: "15%",
  },
  {
    id: "fence",
    label: "安全护栏",
    fileName: "fence",
    audioSrc: "/audio/fence.wav",
    top: "50%",
    left: "28%",
  },
  {
    id: "map",
    label: "地图简介",
    fileName: "map",
    audioSrc: "/audio/map.wav",
    top: "93%",
    left: "27%",
  },
  {
    id: "monkey",
    label: "猴子",
    fileName: "monkey",
    audioSrc: "/audio/monkey.wav",
    top: "53%",
    left: "85%",
  },
  {
    id: "signpost",
    label: "指示牌",
    fileName: "signpost",
    audioSrc: "/audio/signpost.wav",
    top: "68%",
    left: "41%",
  },
  {
    id: "ticket_office",
    label: "售票处",
    fileName: "ticket_office",
    audioSrc: "/audio/ticket_office.wav",
    top: "59%",
    left: "30%",
  },
  {
    id: "tiger",
    label: "老虎",
    fileName: "tiger",
    audioSrc: "/audio/tiger.wav",
    top: "63%",
    left: "87%",
  },
  {
    id: "tour_bus",
    label: "观光巴士",
    fileName: "tour_bus",
    audioSrc: "/audio/tour_bus.wav",
    top: "76%",
    left: "35%",
  },
  {
    id: "tourist",
    label: "游客中心",
    fileName: "tourist",
    audioSrc: "/audio/tourist.wav",
    top: "76%",
    left: "12%",
  },
  {
    id: "tree",
    label: "林区",
    fileName: "tree",
    audioSrc: "/audio/tree.wav",
    top: "21%",
    left: "10%",
  },
  {
    id: "tree1",
    label: "林区",
    fileName: "tree1",
    audioSrc: "/audio/tree.wav",
    top: "46%",
    left: "8%",
  },
] as const;

export default function Home() {
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

    cache[audioSrc]
      .play()
      .catch((error) => {
        console.error("音频播放失败", error);
      });
  }, []);

  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-8 text-white">
      <div className="mx-auto flex w-full max-w-[480px] flex-col items-center gap-6">
        <h1 className="text-lg font-semibold tracking-tight">
          探索乐园互动导览
        </h1>
        <p className="text-sm text-white/70">
          点击地图中的播放键，聆听每个卡片的专属解说音频。
        </p>
        <div className="relative w-full overflow-hidden rounded-3xl shadow-lg shadow-black/40">
          <Image
            src={bgImage}
            alt="乐园互动地图"
            priority
            sizes="(max-width: 768px) 100vw, 480px"
            className="h-auto w-full select-none"
          />
          <div className="pointer-events-none absolute inset-0">
            {/* 透明覆盖层，与背景相同尺寸 */}
            <div className="h-full w-full bg-transparent" />
            {hotspots.map((spot) => (
              <div
                key={spot.id}
                role="button"
                tabIndex={0}
                aria-label={`${spot.label}（${spot.fileName}.wav）播放按钮`}
                className="pointer-events-auto absolute flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center"
                style={{ top: spot.top, left: spot.left }}
                onClick={() => handlePlay(spot.audioSrc)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handlePlay(spot.audioSrc);
                  }
                }}
              >
                <button
                  type="button"
                  tabIndex={-1}
                  aria-hidden
                  className="play-button flex h-4 w-4 items-center justify-center rounded-full border border-white/70 bg-white text-[8px] font-semibold text-neutral-900"
                >
                  ▶
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
