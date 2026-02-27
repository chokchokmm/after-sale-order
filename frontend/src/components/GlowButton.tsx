import React from 'react';
import { Button } from 'antd';
import type { ButtonProps } from 'antd';

interface GlowButtonProps extends ButtonProps {
  glowColor?: 'cyan' | 'magenta' | 'green' | 'amber' | 'purple';
  gradient?: boolean;
}

/**
 * GlowButton - A futuristic button with glow effects
 * 发光按钮 - 带有发光效果的未来感按钮
 */
const GlowButton: React.FC<GlowButtonProps> = ({
  children,
  glowColor = 'cyan',
  gradient = false,
  type = 'primary',
  style,
  className = '',
  ...restProps
}) => {
  const getGlowStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.3s ease',
      fontWeight: 500,
    };

    if (gradient) {
      const gradients: Record<string, string> = {
        cyan: 'linear-gradient(135deg, #00d4ff 0%, #7b2cbf 100%)',
        magenta: 'linear-gradient(135deg, #ff006e 0%, #7b2cbf 100%)',
        green: 'linear-gradient(135deg, #00ff88 0%, #00d4ff 100%)',
        amber: 'linear-gradient(135deg, #ffb703 0%, #ff006e 100%)',
        purple: 'linear-gradient(135deg, #7b2cbf 0%, #00d4ff 100%)',
      };

      return {
        ...baseStyles,
        background: gradients[glowColor] || gradients.cyan,
        border: 'none',
        boxShadow: `0 0 10px rgba(0, 212, 255, 0.3)`,
      };
    }

    const glowColors: Record<string, { glow: string; hoverGlow: string }> = {
      cyan: {
        glow: '0 0 5px rgba(0, 212, 255, 0.3), 0 0 20px rgba(0, 212, 255, 0.2)',
        hoverGlow: '0 0 10px rgba(0, 212, 255, 0.5), 0 0 30px rgba(0, 212, 255, 0.3)',
      },
      magenta: {
        glow: '0 0 5px rgba(255, 0, 110, 0.3), 0 0 20px rgba(255, 0, 110, 0.2)',
        hoverGlow: '0 0 10px rgba(255, 0, 110, 0.5), 0 0 30px rgba(255, 0, 110, 0.3)',
      },
      green: {
        glow: '0 0 5px rgba(0, 255, 136, 0.3), 0 0 20px rgba(0, 255, 136, 0.2)',
        hoverGlow: '0 0 10px rgba(0, 255, 136, 0.5), 0 0 30px rgba(0, 255, 136, 0.3)',
      },
      amber: {
        glow: '0 0 5px rgba(255, 183, 3, 0.3), 0 0 20px rgba(255, 183, 3, 0.2)',
        hoverGlow: '0 0 10px rgba(255, 183, 3, 0.5), 0 0 30px rgba(255, 183, 3, 0.3)',
      },
      purple: {
        glow: '0 0 5px rgba(123, 44, 191, 0.3), 0 0 20px rgba(123, 44, 191, 0.2)',
        hoverGlow: '0 0 10px rgba(123, 44, 191, 0.5), 0 0 30px rgba(123, 44, 191, 0.3)',
      },
    };

    const colors = glowColors[glowColor] || glowColors.cyan;

    return {
      ...baseStyles,
      boxShadow: colors.glow,
    };
  };

  const buttonClassName = `glow-button glow-button-${glowColor} ${className}`.trim();

  return (
    <Button
      type={type}
      className={buttonClassName}
      style={{ ...getGlowStyles(), ...style }}
      {...restProps}
    >
      {children}
    </Button>
  );
};

export default GlowButton;
