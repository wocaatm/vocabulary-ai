/**
 * 图标生成脚本
 * 使用此脚本从 SVG logo 生成各种尺寸的 PNG 图标
 * 
 * 运行方式：
 * 1. 安装依赖：npm install sharp --save-dev
 * 2. 运行脚本：node scripts/generate-icons.mjs
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, '..', 'public');
const svgPath = path.join(publicDir, 'icon.svg');

// 检查 SVG 文件是否存在
if (!fs.existsSync(svgPath)) {
  console.error('❌ 错误：找不到 icon.svg 文件');
  process.exit(1);
}

const svgBuffer = fs.readFileSync(svgPath);

// 定义需要生成的图标尺寸
const icons = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'icon-maskable-192.png', size: 192, padding: 0.1 },
  { name: 'icon-maskable-512.png', size: 512, padding: 0.1 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'og-image.png', size: 1200, height: 630, isOG: true },
];

async function generateIcons() {
  console.log('🎨 开始生成图标...\n');

  for (const icon of icons) {
    try {
      const outputPath = path.join(publicDir, icon.name);
      
      if (icon.isOG) {
        // 生成 OG 图片（1200x630）
        // 创建渐变背景 + 居中 logo
        const logoSize = 400;
        const logoBuffer = await sharp(svgBuffer)
          .resize(logoSize, logoSize)
          .png()
          .toBuffer();

        // 创建带背景的 OG 图片
        await sharp({
          create: {
            width: 1200,
            height: 630,
            channels: 4,
            background: { r: 255, g: 247, b: 237, alpha: 1 } // 暖黄色背景
          }
        })
          .composite([
            {
              input: logoBuffer,
              left: Math.floor((1200 - logoSize) / 2),
              top: Math.floor((630 - logoSize) / 2),
            }
          ])
          .png()
          .toFile(outputPath);
      } else if (icon.padding) {
        // 生成带 padding 的 maskable 图标（确保安全区域）
        const innerSize = Math.floor(icon.size * (1 - icon.padding * 2));
        const padding = Math.floor(icon.size * icon.padding);
        
        const innerBuffer = await sharp(svgBuffer)
          .resize(innerSize, innerSize)
          .png()
          .toBuffer();

        await sharp({
          create: {
            width: icon.size,
            height: icon.size,
            channels: 4,
            background: { r: 255, g: 184, b: 0, alpha: 1 } // 金黄色背景
          }
        })
          .composite([
            {
              input: innerBuffer,
              left: padding,
              top: padding,
            }
          ])
          .png()
          .toFile(outputPath);
      } else {
        // 普通图标
        await sharp(svgBuffer)
          .resize(icon.size, icon.height || icon.size)
          .png()
          .toFile(outputPath);
      }
      
      console.log(`✅ 已生成: ${icon.name} (${icon.size}x${icon.height || icon.size})`);
    } catch (error) {
      console.error(`❌ 生成 ${icon.name} 失败:`, error.message);
    }
  }

  // 生成 favicon.ico（包含多个尺寸）
  try {
    // 注意：sharp 不直接支持 .ico 格式
    // 这里生成一个 32x32 的 PNG 作为 favicon
    // 如需真正的 .ico 文件，可以使用在线工具如 favicon.io
    const favicon32 = await sharp(svgBuffer)
      .resize(32, 32)
      .png()
      .toBuffer();
    
    fs.writeFileSync(path.join(publicDir, 'favicon.png'), favicon32);
    console.log('✅ 已生成: favicon.png (32x32)');
    console.log('\n💡 提示: 如需生成真正的 .ico 文件，可以使用 https://favicon.io/favicon-converter/');
  } catch (error) {
    console.error('❌ 生成 favicon 失败:', error.message);
  }

  console.log('\n🎉 图标生成完成！');
}

generateIcons().catch(console.error);

