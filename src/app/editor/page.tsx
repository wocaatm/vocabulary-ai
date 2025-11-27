"use client";

import { useState } from "react";
import { generatePlan } from "../api/models";
import type { GeminiPlanResponse } from "../api/models/types";
import ImageEditor from "../component/imageEditor";

type Step = 1 | 2;
type InputMode = "generate" | "manual";

export default function EditorPage() {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [inputMode, setInputMode] = useState<InputMode>("generate");
  const [sceneWord, setSceneWord] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePrompt, setImagePrompt] = useState<string>("");
  const [manualImagePrompt, setManualImagePrompt] = useState<string>("");
  const [manualJsonData, setManualJsonData] = useState<string>("");
  const [planResponse, setPlanResponse] = useState<GeminiPlanResponse | null>(null);

  const handleSubmit = async () => {
    if (!sceneWord.trim()) {
      setError("请输入场景词");
      return;
    }

    setLoading(true);
    setError(null);
    setImagePrompt("");
    setPlanResponse(null);

    try {
      const plan = await generatePlan(sceneWord.trim());
      console.log('Plan generated:', plan);
      setImagePrompt(plan.image_prompt);
      setPlanResponse(plan);
    } catch (err) {
      setError(err instanceof Error ? err.message : "请求失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert(`${label}已复制到剪贴板`);
    }).catch(() => {
      alert("复制失败，请手动复制");
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !loading) {
      handleSubmit();
    }
  };

  const handleManualSubmit = () => {
    setError(null);
    
    if (!manualImagePrompt.trim()) {
      setError("请输入 Image Prompt");
      return;
    }

    if (!manualJsonData.trim()) {
      setError("请输入 JSON 数据");
      return;
    }

    try {
      const parsedJson = JSON.parse(manualJsonData) as GeminiPlanResponse;
      
      // 验证JSON结构
      if (!parsedJson.image_prompt || !parsedJson.vocabulary_list) {
        setError("JSON 数据格式不正确，必须包含 image_prompt 和 vocabulary_list");
        return;
      }

      setImagePrompt(manualImagePrompt);
      setPlanResponse(parsedJson);
      setError(null);
    } catch (err) {
      setError("JSON 数据格式错误，请检查后重试");
    }
  };

  const canProceedToNext = () => {
    if (inputMode === "generate") {
      return planResponse !== null;
    } else {
      return manualImagePrompt.trim() && manualJsonData.trim();
    }
  };

  const handleNextStep = () => {
    if (inputMode === "manual" && !planResponse) {
      // 如果手动模式下还没有解析JSON，先解析
      try {
        const parsedJson = JSON.parse(manualJsonData) as GeminiPlanResponse;
        if (!parsedJson.image_prompt || !parsedJson.vocabulary_list) {
          setError("JSON 数据格式不正确，必须包含 image_prompt 和 vocabulary_list");
          return;
        }
        setImagePrompt(manualImagePrompt);
        setPlanResponse(parsedJson);
      } catch (err) {
        setError("JSON 数据格式错误，请检查后重试");
        return;
      }
    }
    setCurrentStep(2);
  };

  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-8 text-white">
      <div className="mx-auto w-full max-w-4xl">
        {/* 步骤指示器 */}
        <div className="mb-8 flex items-center justify-center gap-4">
          {[1, 2].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                  currentStep >= step
                    ? "border-blue-500 bg-blue-500 text-white"
                    : "border-gray-600 text-gray-400"
                }`}
              >
                {step}
              </div>
              {step < 2 && (
                <div
                  className={`h-0.5 w-16 transition-colors ${
                    currentStep > step ? "bg-blue-500" : "bg-gray-600"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* 步骤内容 */}
        <div className="rounded-2xl bg-neutral-900 p-8 shadow-lg">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="mb-2 text-2xl font-semibold">第一步：输入场景词或手动填写</h2>
                <p className="text-sm text-gray-400">
                  您可以通过场景词自动生成，或手动填写 prompt 和 JSON 数据。
                </p>
              </div>

              {/* 模式切换 */}
              <div className="flex gap-2 p-1 rounded-lg bg-neutral-800 border border-gray-700">
                <button
                  onClick={() => {
                    setInputMode("generate");
                    setError(null);
                    setImagePrompt("");
                    setPlanResponse(null);
                  }}
                  className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                    inputMode === "generate"
                      ? "bg-blue-600 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  自动生成
                </button>
                <button
                  onClick={() => {
                    setInputMode("manual");
                    setError(null);
                    setImagePrompt("");
                    setPlanResponse(null);
                  }}
                  className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                    inputMode === "manual"
                      ? "bg-blue-600 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  手动填写
                </button>
              </div>

              {inputMode === "generate" ? (
                <>
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="scene-word"
                        className="mb-2 block text-sm font-medium text-gray-300"
                      >
                        场景词
                      </label>
                      <input
                        id="scene-word"
                        type="text"
                        value={sceneWord}
                        onChange={(e) => {
                          setSceneWord(e.target.value);
                          setError(null);
                        }}
                        onKeyPress={handleKeyPress}
                        placeholder="例如：海底世界、消防局、超市、恐龙公园..."
                        className="w-full rounded-lg border border-gray-700 bg-neutral-800 px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        disabled={loading}
                      />
                      {error && (
                        <p className="mt-2 text-sm text-red-400">{error}</p>
                      )}
                    </div>

                    <button
                      onClick={handleSubmit}
                      disabled={loading || !sceneWord.trim()}
                      className="w-full rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {loading ? "生成中..." : "生成"}
                    </button>
                  </div>

                  {/* 显示生成的image_prompt */}
                  {imagePrompt && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-gray-300">
                          Image Prompt
                        </label>
                        <button
                          onClick={() => copyToClipboard(imagePrompt, "Image Prompt")}
                          className="rounded-md border border-gray-600 bg-neutral-700 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        >
                          复制
                        </button>
                      </div>
                      <textarea
                        value={imagePrompt}
                        readOnly
                        className="w-full rounded-lg border border-gray-700 bg-neutral-800 px-4 py-3 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        rows={10}
                      />
                    </div>
                  )}

                  {/* 显示完整的JSON响应 */}
                  {planResponse && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-gray-300">
                          JSON Response
                        </label>
                        <button
                          onClick={() => copyToClipboard(JSON.stringify(planResponse, null, 2), "JSON Response")}
                          className="rounded-md border border-gray-600 bg-neutral-700 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        >
                          复制
                        </button>
                      </div>
                      <textarea
                        value={JSON.stringify(planResponse, null, 2)}
                        readOnly
                        className="w-full rounded-lg border border-gray-700 bg-neutral-800 px-4 py-3 font-mono text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        rows={15}
                      />
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="manual-image-prompt"
                        className="mb-2 block text-sm font-medium text-gray-300"
                      >
                        Image Prompt
                      </label>
                      <textarea
                        id="manual-image-prompt"
                        value={manualImagePrompt}
                        onChange={(e) => {
                          setManualImagePrompt(e.target.value);
                          setError(null);
                        }}
                        placeholder="请输入 Image Prompt..."
                        className="w-full rounded-lg border border-gray-700 bg-neutral-800 px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        rows={10}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="manual-json-data"
                        className="mb-2 block text-sm font-medium text-gray-300"
                      >
                        JSON Response
                      </label>
                      <textarea
                        id="manual-json-data"
                        value={manualJsonData}
                        onChange={(e) => {
                          setManualJsonData(e.target.value);
                          setError(null);
                        }}
                        placeholder='请输入 JSON 数据，格式：{"image_prompt": "...", "vocabulary_list": [...]}'
                        className="w-full rounded-lg border border-gray-700 bg-neutral-800 px-4 py-3 font-mono text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        rows={15}
                      />
                    </div>

                    {error && (
                      <p className="text-sm text-red-400">{error}</p>
                    )}

                    <button
                      onClick={handleManualSubmit}
                      disabled={!manualImagePrompt.trim() || !manualJsonData.trim()}
                      className="w-full rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      验证并保存
                    </button>
                  </div>

                  {/* 如果手动填写后验证成功，显示预览 */}
                  {planResponse && inputMode === "manual" && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-gray-300">
                          预览 JSON Response
                        </label>
                        <button
                          onClick={() => copyToClipboard(JSON.stringify(planResponse, null, 2), "JSON Response")}
                          className="rounded-md border border-gray-600 bg-neutral-700 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        >
                          复制
                        </button>
                      </div>
                      <textarea
                        value={JSON.stringify(planResponse, null, 2)}
                        readOnly
                        className="w-full rounded-lg border border-gray-700 bg-neutral-800 px-4 py-3 font-mono text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        rows={10}
                      />
                    </div>
                  )}
                </>
              )}

              {/* 下一步按钮 */}
              {canProceedToNext() && (
                <div className="flex justify-end">
                  <button
                    onClick={handleNextStep}
                    className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    下一步
                  </button>
                </div>
              )}
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
              <div>
                  <h2 className="mb-2 text-2xl font-semibold">第二步：图片编辑</h2>
                <p className="text-sm text-gray-400">
                    上传图片并标注单词位置
                  </p>
                </div>
                <button
                  onClick={() => setCurrentStep(1)}
                  className="rounded-lg border border-gray-700 bg-neutral-800 px-6 py-3 font-medium text-white transition-colors hover:bg-neutral-700"
                >
                  返回
                </button>
              </div>

              <div className="rounded-lg border border-gray-700 bg-neutral-800 overflow-hidden">
                <ImageEditor
                  vocabularyList={planResponse?.vocabulary_list || []}
                  planResponse={planResponse}
                  onPlanResponseChange={(data) => setPlanResponse(data)}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
