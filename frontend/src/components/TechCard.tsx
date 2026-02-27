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
        border: 'rgba(0, 212, 255, 0.3)',
        shadow: '0 0 5px rgba(0, 212, 255, 0.3), 0 0 20px rgba(0, 212, 255, 0.2), 0 4px 30px rgba(0, 0, 0, 0.3)',
      },
      magenta: {
        border: 'rgba(255, 0, 110, 0.3)',
        shadow: '0 0 5px rgba(255, 0, 110, 0.3), 0 0 20px rgba(255, 0, 110, 0.2), 0 4px 30px rgba(0, 0, 0, 0.3)',
      },
      green: {
        border: 'rgba(0, 255, 136, 0.3)',
        shadow: '0 0 5px rgba(0, 255, 136, 0.3), 0 0 20px rgba(0, 255, 136, 0.2), 0 4px 30px rgba(0, 0, 0, 0.3)',
      },
      amber: {
        border: 'rgba(255, 183, 3, 0.3)',
        shadow: '0 0 5px rgba(255, 183, 3, 0.3), 0 0 20px rgba(255, 183, 3, 0.2), 0 4px 30px rgba(0, 0, 0, 0.3)',
      },
      purple: {
        border: 'rgba(123, 44, 191, 0.3)',
        shadow: '0 0 5px rgba(123, 44, 191, 0.3), 0 0 20px rgba(123, 44, 191, 0.2), 0 4px 30px rgba(0, 0, 0, 0.3)',
      },
    };

    const colors = glowColors[glowColor] || glowColors.cyan;

    return {
      border: `1px solid ${colors.border}`,
      boxShadow: colors.shadow,
    };
  };

  const cardStyle: React.CSSProperties = {
    background: glassEffect ? 'rgba(26, 26, 46, 0.6)' : 'var(--bg-secondary)',
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
