import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

// 火山引擎豆包语音合成API
// 参考文档: https://www.volcengine.com/docs/6561/1257584?lang=zh
export async function generateAudio(text: string) {
  try {
    if (!text) {
      throw new Error("文本内容不能为空");
    }

    // 从环境变量获取配置
    const APPID = process.env.VOLCENGINE_APPID || '3798743428'
    const ACCESS_TOKEN = process.env.VOLCENGINE_ACCESS_TOKEN || 'c1aqghJjXRmArXlGG1gKbz3Ui8wQdSYH'

    if (!APPID || !ACCESS_TOKEN) {
      throw new Error("语音合成服务配置缺失，请配置 VOLCENGINE_APPID 和 VOLCENGINE_ACCESS_TOKEN");
    }

    // 火山引擎语音合成API端点
    const apiUrl = "https://openspeech.bytedance.com/api/v1/tts";

    // 调用语音合成API
    const response = await axios.post(
      apiUrl,
      {
        app: {
          appid: APPID,
          token: ACCESS_TOKEN,
          cluster: "volcano_tts",
        },
        user: {
          uid: "uid123"
        },
        audio: {
          voice_type: "zh_female_shuangkuaisisi_emo_v2_mars_bigtts",
          encoding: "mp3",
          speed_ratio: 1.0,
        },
        request: {
          reqid: Date.now().toString() + Math.random().toString(36).substring(2, 15),
          text: text,
          operation: "submit",
        }
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer;${ACCESS_TOKEN}`,
        },
        responseType: "arraybuffer", // 接收二进制数据
      }
    );

    console.log('response', response);

    // 获取音频数据（返回的是二进制音频流）
    const audioBuffer = response.data;
    const audioBase64 = Buffer.from(audioBuffer).toString("base64");

    return {
      success: true,
      audio: `data:audio/mp3;base64,${audioBase64}`,
    };
  } catch (error) {
    console.error("语音合成错误:", error);
    if (axios.isAxiosError(error)) {
      const errorText = error.response?.data 
        ? Buffer.from(error.response.data).toString('utf-8')
        : error.message;
      console.error("语音合成API错误:", errorText);
      throw new Error(`语音合成失败: ${errorText}`);
    }
    throw error instanceof Error ? error : new Error("语音合成失败");
  }
}

// API 路由处理函数
export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: "文本内容不能为空" },
        { status: 400 }
      );
    }

    const result = await generateAudio(text);
    return NextResponse.json(result);
  } catch (error) {
    console.error("API路由错误:", error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : "语音合成失败" 
      },
      { status: 500 }
    );
  }
}

