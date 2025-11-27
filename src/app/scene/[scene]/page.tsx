import fs from "fs";
import path from "path";

import { notFound } from "next/navigation";

import SceneViewer, {
  type VocabularyItem,
} from "@/app/scene/[scene]/SceneViewer";

type SceneConfig = {
  scene_name?: string;
  display_name?: string;
  title?: string;
  vocabulary_list?: VocabularyItem[];
};

const SCENE_ROOT = path.join(process.cwd(), "public", "scene");

const formatSceneTitle = (slug: string) =>
  slug
    .replace(/[-_]/g, " ")
    .replace(/^\w|\s\w/g, (char) => char.toUpperCase());

const normalizeSceneSlug = (value: string) =>
  value ? decodeURIComponent(value).trim().replace(/^\/|\/$/g, "") : "";

const loadSceneConfig = (slug?: string) => {
  if (!slug || typeof slug !== "string") {
    return null;
  }

  const normalizedSlug = normalizeSceneSlug(slug);
  if (!normalizedSlug) {
    return null;
  }

  const sceneDir = path.join(SCENE_ROOT, normalizedSlug);
  if (!fs.existsSync(sceneDir)) {
    return null;
  }

  const configPath = path.join(sceneDir, "config.json");
  if (!fs.existsSync(configPath)) {
    return null;
  }

  try {
    const data = JSON.parse(
      fs.readFileSync(configPath, { encoding: "utf-8" }),
    ) as SceneConfig;

    const backgroundPath = path.join(sceneDir, "bg.jpeg");

    return {
      slug: normalizedSlug,
      sceneName:
        data.scene_name ||
        data.display_name ||
        data.title ||
        formatSceneTitle(normalizedSlug),
      backgroundImage: fs.existsSync(backgroundPath)
        ? `/scene/${normalizedSlug}/bg.jpeg`
        : null,
      vocabulary: Array.isArray(data.vocabulary_list)
        ? data.vocabulary_list
        : [],
    };
  } catch (error) {
    console.error(`读取 ${configPath} 时出现问题:`, error);
    return null;
  }
};

type ScenePageParams = {
  scene?: string;
};

type ScenePageProps =
  | {
      params: ScenePageParams;
    }
  | {
      params: Promise<ScenePageParams>;
    };

const isPromise = (
  value: ScenePageProps["params"],
): value is Promise<ScenePageParams> =>
  typeof value === "object" &&
  value !== null &&
  "then" in value &&
  typeof (value as Promise<ScenePageParams>).then === "function";

export const dynamic = "force-static";

export const revalidate = 60;

export const dynamicParams = true;

export const generateStaticParams = () => {
  if (!fs.existsSync(SCENE_ROOT)) {
    return [];
  }

  return fs
    .readdirSync(SCENE_ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => ({
      scene: entry.name,
    }));
};

export default async function ScenePage({ params }: ScenePageProps) {
  const resolvedParams = isPromise(params) ? await params : params;
  const sceneData = loadSceneConfig(resolvedParams?.scene);

  if (!sceneData) {
    notFound();
  }

  return (
    <SceneViewer
      sceneName={sceneData.sceneName}
      slug={sceneData.slug}
      backgroundImage={sceneData.backgroundImage}
      vocabulary={sceneData.vocabulary}
    />
  );
}

