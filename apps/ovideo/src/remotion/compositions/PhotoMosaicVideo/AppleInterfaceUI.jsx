import { interpolate } from 'remotion';
import { useMemo } from 'react';

// iOS 状态栏图标 - 信号强度
const SignalIcon = () => (
  <svg viewBox="0 0 17 10.7" width="17" height="11">
    <rect x="0" y="6.5" width="3" height="4.2" rx="0.8" fill="currentColor"/>
    <rect x="4.7" y="4.3" width="3" height="6.4" rx="0.8" fill="currentColor"/>
    <rect x="9.3" y="2.1" width="3" height="8.6" rx="0.8" fill="currentColor"/>
    <rect x="14" y="0" width="3" height="10.7" rx="0.8" fill="currentColor"/>
  </svg>
);

// WiFi 图标
const WifiIcon = () => (
  <svg viewBox="0 0 15.4 11" width="15" height="11">
    <path 
      d="M7.7 11a1.4 1.4 0 100-2.8 1.4 1.4 0 000 2.8zM12.7 6.3a7.1 7.1 0 00-10 0l1.2 1.2a5.4 5.4 0 017.6 0l1.2-1.2zM15.4 3.5a10.8 10.8 0 00-15.4 0l1.2 1.2a9.1 9.1 0 0113 0l1.2-1.2z" 
      fill="currentColor"
    />
  </svg>
);

// 电池图标
const BatteryIcon = ({ level = 100 }) => (
  <svg viewBox="0 0 25 12" width="25" height="12">
    <rect x="0" y="0.5" width="22" height="11" rx="2.5" stroke="currentColor" strokeWidth="1" fill="none"/>
    <rect 
      x="1.5" 
      y="2" 
      width={Math.max(0, (level / 100) * 18.5)} 
      height="8" 
      rx="1" 
      fill="currentColor"
    />
    <path d="M23 4v4a2 2 0 000-4z" fill="currentColor" opacity="0.4"/>
  </svg>
);

// 返回箭头
const BackArrow = () => (
  <svg viewBox="0 0 12 20" width="12" height="20">
    <path 
      d="M10 1L1 10l9 9" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      fill="none"
    />
  </svg>
);

// 分享图标
const ShareIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22">
    <path 
      d="M12 2v12M12 2l4 4M12 2L8 6M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

// 心形图标
const HeartIcon = ({ filled = false }) => (
  <svg viewBox="0 0 24 24" width="22" height="22">
    <path 
      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.5"
    />
  </svg>
);

// 删除图标
const TrashIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22">
    <path 
      d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

// 编辑图标
const EditIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22">
    <path 
      d="M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

// 更多图标
const MoreIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22">
    <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
    <circle cx="12" cy="5" r="1.5" fill="currentColor"/>
    <circle cx="12" cy="19" r="1.5" fill="currentColor"/>
  </svg>
);

export const AppleInterfaceUI = ({
  coreImage,
  width,
  height,
  progress
}) => {
  // 当前时间
  const currentTime = useMemo(() => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  }, []);

  // 照片日期信息
  const photoDate = '2024年12月25日 14:32';
  const photoLocation = '云南·丽江';

  // 界面尺寸（模拟 iPhone 15 Pro）
  const interfaceWidth = Math.min(390, width * 0.85);
  const interfaceHeight = Math.min(844, height * 0.9);
  const scale = Math.min(width / 430, height / 932) * 0.92;

  // 进入动画
  const entryScale = interpolate(progress, [0, 0.3, 1], [0.85, 1.02, 1], {
    extrapolateRight: 'clamp'
  });
  const entryOpacity = interpolate(progress, [0, 0.2], [0, 1], {
    extrapolateRight: 'clamp'
  });

  return (
    <div
      className="ios-interface"
      style={{
        width: interfaceWidth,
        height: interfaceHeight,
        transform: `scale(${scale * entryScale})`,
        opacity: entryOpacity
      }}
    >
      {/* 动态岛 */}
      <div className="ios-dynamic-island" />

      {/* 状态栏 */}
      <div className="ios-status-bar">
        <span className="ios-status-time">{currentTime}</span>
        <div className="ios-status-icons">
          <SignalIcon />
          <WifiIcon />
          <BatteryIcon level={85} />
        </div>
      </div>

      {/* 导航栏 */}
      <div className="ios-nav-bar">
        <div className="ios-nav-back">
          <BackArrow />
          <span>相册</span>
        </div>
        <span className="ios-nav-action">编辑</span>
      </div>

      {/* 照片查看器 */}
      <div className="ios-photo-viewer">
        <div className="ios-photo-content">
          <img
            src={coreImage}
            alt="Core Subject"
            className="ios-photo-main"
            style={{
              transform: `scale(${interpolate(progress, [0.2, 0.5], [0.95, 1], { extrapolateRight: 'clamp' })})`,
            }}
          />
        </div>

        {/* 照片信息 */}
        <div className="ios-photo-info">
          <div style={{ marginBottom: 4, color: '#fff', fontWeight: 500 }}>
            {photoDate}
          </div>
          <div>{photoLocation}</div>
        </div>

        {/* 底部工具栏 */}
        <div className="ios-photo-toolbar">
          <div className="ios-toolbar-icon">
            <ShareIcon />
          </div>
          <div className="ios-toolbar-icon">
            <HeartIcon />
          </div>
          <div className="ios-toolbar-icon">
            <EditIcon />
          </div>
          <div className="ios-toolbar-icon">
            <TrashIcon />
          </div>
          <div className="ios-toolbar-icon">
            <MoreIcon />
          </div>
        </div>
      </div>

      {/* Home Indicator */}
      <div className="ios-home-indicator" />
    </div>
  );
};
