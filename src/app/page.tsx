import fs from "fs";
import path from "path";

import Image from "next/image";
import Link from "next/link";

type SceneCard = {
  slug: string;
  title: string;
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
      if (fs.existsSync(configPath)) {
        try {
          const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
          title =
            config.scene_name ||
            config.display_name ||
            config.title ||
            title;
        } catch (error) {
          console.warn(`无法解析 ${configPath}:`, error);
        }
      }

      return {
        slug,
        title,
        imagePath: fs.existsSync(bgPath) ? `/scene/${slug}/bg.jpeg` : null,
      };
    })
    .sort((a, b) =>
      a.title.localeCompare(b.title, "zh-CN", { sensitivity: "base" }),
    );
};

export default function Home() {
  const scenes = loadScenes();

  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-10 text-white">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="space-y-3 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-white/60">
            Scene Explorer
          </p>
          <h1 className="text-4xl font-semibold tracking-tight">
            场景语境库
          </h1>
          <p className="text-base text-white/70">
            浏览所有可用场景，点击任意卡片进入详情页并开始互动学习。
          </p>
        </header>

        {scenes.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-12 text-center text-white/70">
            暂无场景，请在
            <code className="mx-1 rounded bg-black/30 px-2 py-1 text-sm">
              public/scene
            </code>
            目录下添加场景资源。
          </div>
        ) : (
          <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {scenes.map((scene, index) => (
              <Link
                key={scene.slug}
                href={`/scene/${scene.slug}`}
                className="group rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:-translate-y-1 hover:border-white/30 hover:bg-white/10"
              >
                <div className="relative mb-4 h-48 overflow-hidden rounded-xl bg-gradient-to-br from-neutral-800 to-neutral-900">
                  {scene.imagePath ? (
                    <Image
                      src={scene.imagePath}
                      alt={`${scene.title} 场景封面`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 30vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                      priority={index < 3}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-white/50">
                      暂无预览
                    </div>
                  )}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                </div>
                <div>
                  <p className="text-lg font-semibold">{scene.title}</p>
                  <p className="text-sm text-white/60">@{scene.slug}</p>
                </div>
              </Link>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
