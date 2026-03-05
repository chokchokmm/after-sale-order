import React from 'react';
import { Card } from 'antd';
import type { CardProps } from 'antd';

interface TechCardProps extends CardProps {
  glowColor?: 'cyan' | 'magenta' | 'green' | 'amber' | 'purple' | 'none';
  glassEffect?: boolean;
  hoverLift?: boolean;
}

/**
 * TechCard - A futuristic card component with glass-morphism and glow effects
 * 科技感卡片组件 - 带有玻璃态和发光效果
 */
const TechCard: React.FC<TechCardProps> = ({
  children,
  glowColor = 'cyan',
  glassEffect = true,
  hoverLift = true,
  style,
  className = '',
  ...restProps
}) => {
  const getGlowStyles = (): React.CSSProperties => {
    if (glowColor === 'none') {
      return {};
    }

    const glowColors: Record<string, { border: string; shadow: string }> = {
      cyan: {
        border: 'var(--border-glow-cyan)',
        shadow: 'var(--glow-cyan)',
      },
      magenta: {
        border: 'var(--border-glow-magenta)',
        shadow: 'var(--glow-magenta)',
      },
      green: {
        border: 'var(--border-glow-green)',
        shadow: 'var(--glow-green)',
      },
      amber: {
        border: 'var(--border-glow-amber)',
        shadow: 'var(--glow-amber)',
      },
      purple: {
        border: 'var(--border-glow-purple)',
        shadow: 'var(--glow-purple)',
      },
    };

    const colors = glowColors[glowColor] || glowColors.cyan;

    return {
      border: `1px solid ${colors.border}`,
      boxShadow: colors.shadow,
    };
  };

  const cardStyle: React.CSSProperties = {
    background: glassEffect ? 'var(--bg-surface)' : 'var(--bg-secondary)',
    backdropFilter: glassEffect ? 'blur(10px)' : 'none',
    WebkitBackdropFilter: glassEffect ? 'blur(10px)' : 'none',
    borderRadius: 'var(--radius-lg)',
    transition: hoverLift ? 'all 0.3s ease' : 'none',
    ...getGlowStyles(),
    ...style,
  };

  const cardClassName = `tech-card ${hoverLift ? 'hover-lift' : ''} ${className}`.trim();

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

export default TechCard;
