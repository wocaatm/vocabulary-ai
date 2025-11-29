import fs from "fs";
import path from "path";

import Image from "next/image";
import Link from "next/link";
import Logo from "./component/Logo";

type SceneCard = {
  slug: string;
  title: string;
  icon: string;
  description: string;
  imagePath: string | null;
};

const SCENE_ROOT = path.join(process.cwd(), "public", "scene");

const formatSceneTitle = (slug: string) =>
  slug
    .replace(/[-_]/g, " ")
    .replace(/^\w|\s\w/g, (char) => char.toUpperCase());

const loadScenes = (): SceneCard[] => {
  if (!fs.existsSync(SCENE_ROOT)) {
    return [];
  }

  const entries = fs.readdirSync(SCENE_ROOT, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const slug = entry.name;
      const configPath = path.join(SCENE_ROOT, slug, "config.json");
      const bgPath = path.join(SCENE_ROOT, slug, "bg.jpeg");

      let title = formatSceneTitle(slug);
      let icon = "🎪";
      let description = "";
      if (fs.existsSync(configPath)) {
        try {
          const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
          title =
            config.scene_name ||
            config.display_name ||
            config.title ||
            title;
          icon = config.scene_icon || "🎪";
          description = config.scene_description || "";
        } catch (error) {
          console.warn(`无法解析 ${configPath}:`, error);
        }
      }

      return {
        slug,
        title,
        icon,
        description,
        imagePath: fs.existsSync(bgPath) ? `/scene/${slug}/bg.jpeg` : null,
      };
    })
    .sort((a, b) =>
      a.title.localeCompare(b.title, "zh-CN", { sensitivity: "base" }),
    );
};

// 为每个卡片定义一组缤纷的颜色
const cardColors = [
  { bg: "from-pink-400 to-rose-300", border: "border-pink-300", shadow: "shadow-pink-200" },
  { bg: "from-amber-400 to-yellow-300", border: "border-amber-300", shadow: "shadow-amber-200" },
  { bg: "from-emerald-400 to-green-300", border: "border-emerald-300", shadow: "shadow-emerald-200" },
  { bg: "from-sky-400 to-blue-300", border: "border-sky-300", shadow: "shadow-sky-200" },
  { bg: "from-violet-400 to-purple-300", border: "border-violet-300", shadow: "shadow-violet-200" },
  { bg: "from-orange-400 to-amber-300", border: "border-orange-300", shadow: "shadow-orange-200" },
];


export default function Home() {
  const scenes = loadScenes();

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-100 via-pink-50 to-amber-50 px-4 py-10">
      {/* 装饰性背景元素 */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-yellow-200/40 blur-3xl" />
        <div className="absolute -right-20 top-1/4 h-72 w-72 rounded-full bg-pink-200/40 blur-3xl" />
        <div className="absolute bottom-20 left-1/4 h-56 w-56 rounded-full bg-green-200/40 blur-3xl" />
        <div className="absolute -bottom-10 right-1/3 h-48 w-48 rounded-full bg-blue-200/40 blur-3xl" />
      </div>

      <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="space-y-4 text-center">
          <div className="flex items-center justify-center">
            <Logo size={140} className="drop-shadow-lg animate-float" />
          </div>
          <h1 className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-5xl font-bold tracking-tight text-transparent drop-shadow-sm">
            快乐识字乐园
          </h1>
          <p className="mx-auto max-w-md text-lg text-gray-600">
            👋 小朋友们好！点击下面的卡片，一起去探索有趣的场景，学习新词汇吧！
          </p>
        </header>

        {scenes.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-pink-300 bg-white/70 px-6 py-12 text-center text-gray-500 backdrop-blur-sm">
            😢 暂无场景，请在
            <code className="mx-1 rounded-lg bg-pink-100 px-2 py-1 text-sm text-pink-600">
              public/scene
            </code>
            目录下添加场景资源。
          </div>
        ) : (
          <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {scenes.map((scene, index) => {
              const colorScheme = cardColors[index % cardColors.length];
              return (
                <Link
                  key={scene.slug}
                  href={`/scene/${scene.slug}`}
                  className={`group relative overflow-hidden rounded-3xl border-2 ${colorScheme.border} bg-white/80 p-4 shadow-lg ${colorScheme.shadow} backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* 装饰角标 */}
                  <div className={`absolute -right-8 -top-8 h-16 w-16 rotate-45 bg-gradient-to-br ${colorScheme.bg} opacity-60`} />
                  
                  <div className={`relative mb-4 h-48 overflow-hidden rounded-2xl bg-gradient-to-br ${colorScheme.bg}`}>
                    {scene.imagePath ? (
                      <Image
                        src={scene.imagePath}
                        alt={`${scene.title} 场景封面`}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 30vw"
                        className="object-cover transition duration-500 group-hover:scale-110"
                        priority={index < 3}
                        loading={index < 6 ? "eager" : "lazy"}
                        placeholder="empty"
                      />
                    ) : (
                      <div className={`flex h-full items-center justify-center bg-gradient-to-br ${colorScheme.bg} text-white`}>
                        <span className="text-4xl">🖼️</span>
                      </div>
                    )}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white/40 via-transparent to-transparent" />
                  </div>
                  
                  <div className="space-y-1">
                    <p className="flex items-center gap-2 text-xl font-bold text-gray-700">
                      <span className="text-2xl">{scene.icon}</span>
                      {scene.title}
                    </p>
                    {scene.description && (
                      <p className="text-sm text-gray-500 line-clamp-2">{scene.description}</p>
                    )}
                    <p className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-pink-100 to-purple-100 px-3 py-1 text-xs font-medium text-purple-600">
                      点击进入探索 →
                    </p>
                  </div>
                </Link>
              );
            })}
          </section>
        )}

        <footer className="mt-8 text-center">
          <p className="text-gray-500">
            🎉 快来选择一个场景开始学习吧！
          </p>
        </footer>
      </div>
    </main>
  );
}
