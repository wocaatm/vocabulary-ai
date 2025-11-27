const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

function sanitizeFileName(text, { lowercase = false } = {}) {
  if (!text) {
    return 'audio';
  }
  const normalized = lowercase ? text.toLowerCase() : text;
  return normalized
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/\s+/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_+|_+$/g, '')
    .trim() || 'audio';
}

async function generateAudio(text, options = {}) {
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
          uid: uuidv4()
        },
        audio: {
          voice_type: "zh_female_qinqienvsheng_moon_bigtts",
          encoding: "wav",
          speed_ratio: 1,
        },
        request: {
          reqid: uuidv4(),
          text: text,
          operation: "query",
        }
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer;${ACCESS_TOKEN}`,
        },
      }
    );
    console.log('response', response);
    
    // 获取 base64 编码的音频数据
    // 如果 response.data 是对象，可能需要从特定字段获取（如 data.audio 或 data.data）
    let base64Audio = response.data;
    
    // 如果 response.data 是对象，尝试从常见字段获取 base64 数据
    if (typeof base64Audio === 'object' && base64Audio !== null) {
      base64Audio = base64Audio.data || base64Audio.audio || base64Audio.base64 || base64Audio;
    }
    
    // 如果是字符串且包含 data URI 前缀，提取 base64 部分
    if (typeof base64Audio === 'string' && base64Audio.startsWith('data:')) {
      base64Audio = base64Audio.split(',')[1];
    }
    
    if (!base64Audio) {
      throw new Error('无法从响应中获取音频数据');
    }
    
    // 解码 base64 为二进制数据
    const audioBuffer = Buffer.from(base64Audio, 'base64');
    
    const safeFileName = options.fileName || sanitizeFileName(text);
    
    // 构建保存路径（默认保存到 public/audio 目录）
    const audioDir = options.outputDir || path.join(__dirname, '..', 'public', 'audio');
    
    // 确保目录存在
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true });
    }
    
    // 保存文件路径
    const filePath = path.join(audioDir, `${safeFileName}.wav`);
    
    // 将二进制数据写入文件
    fs.writeFileSync(filePath, audioBuffer);
    
    console.log(`音频文件已保存到: ${filePath}`);
    console.log(`文件大小: ${audioBuffer.length} 字节`);
    
    return filePath;
  } catch (error) {
    console.error('error', error);
    throw error;
  }
}

async function processSceneConfigs() {
  const sceneRoot = path.join(__dirname, '..', 'public', 'scene');
  if (!fs.existsSync(sceneRoot)) {
    console.warn(`目录 ${sceneRoot} 不存在，跳过处理`);
    return;
  }

  const entries = fs.readdirSync(sceneRoot, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const scenePath = path.join(sceneRoot, entry.name);
    const configPath = path.join(scenePath, 'config.json');
    if (!fs.existsSync(configPath)) {
      console.warn(`目录 ${scenePath} 缺少 config.json，跳过`);
      continue;
    }

    let config;
    try {
      const raw = fs.readFileSync(configPath, 'utf8');
      config = JSON.parse(raw);
    } catch (error) {
      console.error(`解析 ${configPath} 失败:`, error);
      continue;
    }

    if (config.generateAudio === true) {
      console.log(`目录 ${scenePath} 已标记 generateAudio=true，跳过`);
      continue;
    }

    if (!Array.isArray(config.vocabulary_list) || config.vocabulary_list.length === 0) {
      console.warn(`目录 ${scenePath} 的 vocabulary_list 无有效数据，跳过`);
      continue;
    }

    const sceneAudioDir = path.join(scenePath, 'audio');
    if (!fs.existsSync(sceneAudioDir)) {
      fs.mkdirSync(sceneAudioDir, { recursive: true });
    }

    for (const item of config.vocabulary_list) {
      const english = item?.english_word?.trim();
      const chinese = item?.chinese_word?.trim();
      if (!english || !chinese) {
        console.warn(`目录 ${scenePath} 存在缺少 english_word 或 chinese_word 的条目，跳过该条目`);
        continue;
      }

      const fileName = sanitizeFileName(english, { lowercase: true });
      const text = `${english}，${chinese}`;

      try {
        await generateAudio(text, {
          outputDir: sceneAudioDir,
          fileName,
        });
      } catch (error) {
        console.error(`为 ${scenePath} 生成 ${english} 音频失败:`, error);
      }
    }

    // 标记该场景已生成音频，防止下次重复生成
    try {
      config.generateAudio = true;
      const updatedConfig = JSON.stringify(config, null, 2);
      fs.writeFileSync(configPath, updatedConfig, 'utf8');
      console.log(`已更新 ${configPath}，标记 generateAudio=true`);
    } catch (error) {
      console.error(`更新 ${configPath} 失败:`, error);
    }
  }
}

processSceneConfigs().catch((error) => {
  console.error('处理场景配置时发生错误:', error);
  process.exit(1);
});