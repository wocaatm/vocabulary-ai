/**
 * 快乐识字乐园 Logo 组件
 * 一个可爱的 SVG Logo，展示带有汉字、拼音和彩虹元素的书本图案
 */

type LogoProps = {
  size?: number;
  className?: string;
};

export default function Logo({ size = 120, className = "" }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="快乐识字乐园 Logo"
    >
      <defs>
        {/* 渐变定义 */}
        <linearGradient id="logo-bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "#FFE066" }} />
          <stop offset="50%" style={{ stopColor: "#FFCC33" }} />
          <stop offset="100%" style={{ stopColor: "#FFB800" }} />
        </linearGradient>
        <linearGradient id="logo-bookGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "#FF6B9D" }} />
          <stop offset="100%" style={{ stopColor: "#FF4F7A" }} />
        </linearGradient>
        <linearGradient id="logo-pageGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: "#FFFFFF" }} />
          <stop offset="100%" style={{ stopColor: "#FFF5E6" }} />
        </linearGradient>
        <linearGradient id="logo-rainbowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: "#FF6B6B" }} />
          <stop offset="25%" style={{ stopColor: "#FFE66D" }} />
          <stop offset="50%" style={{ stopColor: "#4ECDC4" }} />
          <stop offset="75%" style={{ stopColor: "#45B7D1" }} />
          <stop offset="100%" style={{ stopColor: "#A855F7" }} />
        </linearGradient>
        {/* 阴影 */}
        <filter id="logo-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#00000030" />
        </filter>
        <filter id="logo-smallShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#00000025" />
        </filter>
      </defs>

      {/* 背景圆形 */}
      <circle cx="256" cy="256" r="240" fill="url(#logo-bgGradient)" filter="url(#logo-shadow)" />

      {/* 装饰星星 */}
      <g fill="#FFFFFF" opacity="0.9">
        <polygon
          points="100,100 105,115 120,115 108,125 113,140 100,130 87,140 92,125 80,115 95,115"
          filter="url(#logo-smallShadow)"
        />
        <polygon
          points="420,140 423,150 433,150 425,157 428,167 420,160 412,167 415,157 407,150 417,150"
          transform="scale(0.8)"
          style={{ transformOrigin: "420px 153px" }}
          filter="url(#logo-smallShadow)"
        />
        <polygon
          points="380,380 384,392 396,392 386,400 390,412 380,404 370,412 374,400 364,392 376,392"
          transform="scale(0.7)"
          style={{ transformOrigin: "380px 396px" }}
          filter="url(#logo-smallShadow)"
        />
      </g>

      {/* 书本主体 */}
      <g filter="url(#logo-shadow)">
        {/* 书本封面 */}
        <path
          d="M140 150 Q140 130 160 130 L352 130 Q372 130 372 150 L372 380 Q372 400 352 400 L160 400 Q140 400 140 380 Z"
          fill="url(#logo-bookGradient)"
        />

        {/* 书本侧边（厚度） */}
        <path
          d="M140 150 L140 380 Q140 400 160 400 L160 170 Q160 150 140 150"
          fill="#E5527A"
        />

        {/* 书页 */}
        <rect x="155" y="145" width="200" height="240" rx="5" fill="url(#logo-pageGradient)" />

        {/* 书脊 */}
        <rect x="150" y="130" width="8" height="270" rx="4" fill="#D14571" />
      </g>

      {/* 汉字「字」*/}
      <g filter="url(#logo-smallShadow)">
        <text
          x="255"
          y="245"
          fontFamily="Arial, sans-serif"
          fontSize="90"
          fontWeight="bold"
          fill="#FF4F7A"
          textAnchor="middle"
        >
          字
        </text>
      </g>

      {/* 彩虹 ABC */}
      <g fontFamily="Arial Rounded MT Bold, Arial, sans-serif" fontWeight="bold" fontSize="36">
        <text x="185" y="320" fill="#FF6B6B" filter="url(#logo-smallShadow)">
          A
        </text>
        <text x="230" y="320" fill="#4ECDC4" filter="url(#logo-smallShadow)">
          B
        </text>
        <text x="275" y="320" fill="#45B7D1" filter="url(#logo-smallShadow)">
          C
        </text>
      </g>

      {/* 拼音装饰 */}
      <text
        x="255"
        y="360"
        fontFamily="Arial, sans-serif"
        fontSize="22"
        fill="#FF8FAB"
        textAnchor="middle"
        letterSpacing="4"
      >
        zì
      </text>

      {/* 彩虹弧线 */}
      <path
        d="M120 420 Q256 350 392 420"
        fill="none"
        stroke="url(#logo-rainbowGradient)"
        strokeWidth="12"
        strokeLinecap="round"
        opacity="0.8"
      />

      {/* 可爱表情铅笔 */}
      <g transform="translate(340, 80) rotate(30)">
        {/* 铅笔身体 */}
        <rect x="0" y="0" width="25" height="80" rx="3" fill="#FFD93D" filter="url(#logo-smallShadow)" />
        <rect x="5" y="0" width="15" height="80" fill="#FFE066" />
        {/* 铅笔头 */}
        <polygon points="0,80 12.5,110 25,80" fill="#FFB800" />
        <polygon points="8,80 12.5,95 17,80" fill="#2D2D2D" />
        {/* 铅笔顶部 */}
        <rect x="0" y="0" width="25" height="12" rx="3" fill="#FF6B9D" />
        {/* 可爱眼睛 */}
        <circle cx="8" cy="40" r="4" fill="#2D2D2D" />
        <circle cx="17" cy="40" r="4" fill="#2D2D2D" />
        <circle cx="9" cy="38" r="1.5" fill="#FFFFFF" />
        <circle cx="18" cy="38" r="1.5" fill="#FFFFFF" />
        {/* 微笑 */}
        <path
          d="M8 52 Q12.5 58 17 52"
          fill="none"
          stroke="#2D2D2D"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* 腮红 */}
        <ellipse cx="5" cy="48" rx="3" ry="2" fill="#FFB6C1" opacity="0.6" />
        <ellipse cx="20" cy="48" rx="3" ry="2" fill="#FFB6C1" opacity="0.6" />
      </g>

      {/* 装饰小圆点 */}
      <circle cx="90" cy="200" r="8" fill="#4ECDC4" opacity="0.8" />
      <circle cx="422" cy="250" r="10" fill="#FF6B6B" opacity="0.8" />
      <circle cx="110" cy="350" r="6" fill="#A855F7" opacity="0.8" />
      <circle cx="400" cy="320" r="7" fill="#FFE66D" opacity="0.8" />
    </svg>
  );
}

