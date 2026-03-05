import React from 'react';
import { Card } from 'antd';
import type { CardProps } from 'antd';
import { useTheme } from '../contexts/ThemeContext';

interface BentoCardProps extends CardProps {
  /** Whether to show hover lift effect */
  hoverLift?: boolean;
  /** Whether to show glass morphism effect */
  glassEffect?: boolean;
  /** Custom border color */
  borderColor?: string;
  /** Custom hover shadow */
  hoverShadow?: boolean;
}

/**
 * BentoCard - A clean, theme-aware card component
 * BentoCard - 干净、主题感知的卡片组件
 *
 * Features:
 * - Automatically adapts to light/dark theme
 * - Optional glass morphism effect
 * - Smooth hover animations
 * - Consistent spacing and border radius
 *
 * 特性：
 * - 自动适配浅色/深色主题
 * -   可选的玻璃态效果
 * - 平滑的悬停动画
 * -   统一的间距和圆角
 */
const BentoCard: React.FC<BentoCardProps> = ({
  children,
  hoverLift = true,
  glassEffect = true,
  borderColor,
  hoverShadow = true,
  style,
  className = '',
  ...restProps
}) => {
  const { theme } = useTheme();

  // Theme-specific styling
  const getThemeStyles = (): React.CSSProperties => {
    if (theme === 'dark') {
      return {
        background: glassEffect ? 'rgba(31, 31, 31, 0.8)' : '#1f1f1f',
        border: borderColor
          ? `1px solid ${borderColor}`
          : '1px solid rgba(255, 255, 255, 0.1)',
        color: 'rgba(255, 255, 255, 0.85)',
      };
    } else {
      return {
        background: glassEffect ? 'rgba(255, 255, 255, 0.9)' : '#ffffff',
        border: borderColor
          ? `1px solid ${borderColor}`
          : '1px solid rgba(0, 0, 0, 0.08)',
        color: 'rgba(0, 0, 0, 0.85)',
      };
    }
  };

  const cardStyle: React.CSSProperties = {
    borderRadius: 12,
    padding: 16,
    transition: hoverLift || hoverShadow
      ? 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      : 'none',
    backdropFilter: glassEffect ? 'blur(10px)' : 'none',
    WebkitBackdropFilter: glassEffect ? 'blur(10px)' : 'none',
    ...getThemeStyles(),
    ...style,
  };

  const cardClassName = `bento-card ${hoverLift ? 'hover-lift' : ''} ${hoverShadow ? 'hover-shadow' : ''} ${className}`.trim();

  return (
    <Card
      className={cardClassName}
      style={cardStyle}
      bordered={false}
      {...restProps}
    >
      {children}
    </Card>
  );
};

export default BentoCard;
