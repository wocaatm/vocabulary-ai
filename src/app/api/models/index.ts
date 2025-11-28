import { GoogleGenAI, Type, Modality } from "@google/genai";
import { GeminiPlanResponse } from "./types";

const getAIClient = () => {
  console.log('process.env.GEMINI_API_KEY', process.env.NEXT_PUBLIC_GEMINI_API_KEY);
  if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
    throw new Error("NEXT_PUBLIC_GEMINI_API_KEY is not set");
  }
  
  return new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
};

export const generatePlan = async (scene: string): Promise<GeminiPlanResponse> => {
  const ai = getAIClient();
  
  const prompt = `
    # 核心配置 (Configuration)

    [SCENE_THEME] = {在此处填入场景，例如：海底世界 / 消防局 / 超市 / 恐龙公园}
    [TARGET_AGE] = 5-9 岁 (识字敏感期)

    # 绘图提示词 (Prompt Structure)

    一张儿童识字小报《[SCENE_THEME]》，竖版 A4，学习小报版式，**整体加入柔和 3D 立体质感与适度景深，让画面更具沉浸性与空间层次**。

    ---

    ## 一、小报标题区（顶部）

    1. **大标题**：顶部居中展示标题：《[SCENE_THEME] 识字小报》。
    2. **字体风格**：大字、醒目、卡通手写体、彩色描边。

      * **附加要求**：标题文字呈现轻微 3D 浮雕质感，边缘有柔和光影，让标题在页面顶部更突出。
    3. **装饰元素**：在标题周围添加与 [SCENE_THEME] 强相关的贴纸风装饰，颜色鲜艳。

      * **附加要求**：装饰元素带轻微体积感，视觉上更像“贴在纸上的立体贴纸”。

    ---

    ## 二、小报主体（中间主画面）

    画面中心是一幅卡通插画风的完整「[SCENE_THEME]」场景，**整体构图采用接近 2.5D–3D 效果的绘本风格**。

    ### **整体气氛**

    明亮、温暖、积极、色彩高饱和，同时加入柔光、景深、体积感，让画面具有空间深度与沉浸感。

    ### **构图要求**

    物体边界清晰，彼此之间留有贴标签的空白，避免拥挤。

    * **附加要求**：前景—中景—后景分层明显，使标注对象更清晰，场景更立体。

    ### **场景分区**

    * **核心区 A (活动)**：表现 [SCENE_THEME] 里的核心活动（孩子们或角色正在做什么），动作自然，带轻微 3D 立体造型感。
    * **核心区 B (工具)**：展示场景特有物品或工具，物体具备简单的 3D 形体光影（非写实，而是绘本级别的立体感）。
    * **核心区 C (环境)**：体现环境特征（建筑、植被、路标等），背景采用更低对比度与轻微景深，突出前景主体。

    ### **引导角色**

    1 位可爱的卡通人物（[SCENE_THEME] 的向导/工作人员），带轻微立体与阴影，使其具有温和的空间存在感，正在做欢迎或指引手势。

    ---

    ## 三、必画物体 (Generated Content)

    请务必在画面中清晰绘制以下物体，所有物体采用 **清晰轮廓 + 色块分明 + 轻度 3D 塑形**：

    1. **核心角色/设施 (Big Objects)**:
      {在此填入 4-5 个核心大物体，如：消防车、云梯、消防员}

    2. **常见物品/工具 (Small Items)**:
      {在此填入 5-8 个具体小物品，如：水枪、灭火器、头盔、手套}

    3. **环境/装饰 (Environment)**:
      {在此填入 3-5 个环境词，如：警报铃、消防栓、大门}

    ---

    ## 四、画风参数 (Style Parameters)

    * **风格**：Children's picture book style + Literacy tabloid aesthetic（儿童绘本风 + 识字小报风）
    * **附加风格要求**：Soft 3D shading, gentle depth-of-field, subtle volumetric lighting（柔和 3D、适度景深、轻体积光）
    * **色彩**：High Saturation, Warm Tone, Bright（高饱和、暖色、明亮）
    * **质量**：8k resolution, high detail, clean vector-like lines
    * **整体技术特征**：flat + soft 3D hybrid illustration（平面插画结合轻 3D 塑形）
    
    ## 五、最重要的要求

    * **图中不要出现关于必画物体的描述**：包括汉字，英文，拼音的标注，不要有任何文字！！
    
    本次制定的SCENE_THEME是：${scene}，结果需要保持跟元提示词格式一致，只需要替换[SCENE_THEME]，已经其他要求填充的内容即可

    同时这对所有生成的识字清单需要给出汉字，拼音，英文，通过JSON数据返回

    Output JSON format only.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          image_prompt: { type: Type.STRING },
          vocabulary_list: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                chinese_word: { type: Type.STRING },
                pinyin: { type: Type.STRING },
                english_word: { type: Type.STRING },
              }
            }
          }
        }
      }
    }
  });

  if (response.text) {
    return JSON.parse(response.text) as GeminiPlanResponse;
  }
  throw new Error("Failed to generate plan");
};