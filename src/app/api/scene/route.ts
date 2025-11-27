import { NextRequest, NextResponse } from "next/server";
import type { SceneRequest, SceneResponse } from "@/types/todo";

// 模拟 API 接口，返回基于场景词的 todo 列表
export async function POST(request: NextRequest) {
  try {
    const body: SceneRequest = await request.json();
    const { sceneWord } = body;

    if (!sceneWord || sceneWord.trim() === "") {
      return NextResponse.json(
        { error: "场景词不能为空" },
        { status: 400 }
      );
    }

    // 模拟根据场景词生成 todo 列表
    // 实际使用时，这里应该调用真实的 AI 服务或业务逻辑
    const todos = generateTodosFromScene(sceneWord);

    const response: SceneResponse = {
      todos,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("API 错误:", error);
    return NextResponse.json(
      { error: "服务器内部错误" },
      { status: 500 }
    );
  }
}

// 模拟生成 todo 的函数
function generateTodosFromScene(sceneWord: string) {
  // 这里可以根据场景词生成不同的 todo
  // 实际应用中应该调用 AI 模型或其他服务
  const baseTodos = [
    {
      id: `1-${Date.now()}`,
      title: `分析"${sceneWord}"场景需求`,
      description: `深入了解${sceneWord}场景的具体要求和目标`,
      completed: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: `2-${Date.now()}`,
      title: `设计${sceneWord}场景的解决方案`,
      description: `为${sceneWord}场景设计合适的解决方案`,
      completed: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: `3-${Date.now()}`,
      title: `实现${sceneWord}场景的核心功能`,
      description: `开发${sceneWord}场景所需的核心功能模块`,
      completed: false,
      createdAt: new Date().toISOString(),
    },
  ];

  return baseTodos;
}
