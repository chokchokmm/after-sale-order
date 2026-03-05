import React from 'react';
import { Button } from 'antd';
import type { ButtonProps } from 'antd';
import { useTheme } from '../contexts/ThemeContext';

interface GlowButtonProps extends ButtonProps {
  glowColor?: 'cyan' | 'magenta' | 'green' | 'amber' | 'purple';
  gradient?: boolean;
}

const GlowButton: React.FC<GlowButtonProps> = ({
  children,
  glowColor = 'cyan',
  gradient = false,
  type = 'primary',
  style,
  className = '',
  ...restProps
}) => {
  const { theme } = useTheme();

  const getGlowStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.3s ease',
      fontWeight: 500,
    };

    if (gradient) {
      const gradients: Record<string, string> = {
        cyan: 'linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-purple) 100%)',
        magenta: 'linear-gradient(135deg, var(--accent-magenta) 0%, var(--accent-purple) 100%)',
        green: 'linear-gradient(135deg, var(--accent-green) 0%, var(--accent-cyan) 100%)',
        amber: 'linear-gradient(135deg, var(--accent-amber) 0%, var(--accent-magenta) 100%)',
        purple: 'linear-gradient(135deg, var(--accent-purple) 0%, var(--accent-cyan) 100%)',
      };

      return {
        ...baseStyles,
        background: gradients[glowColor] || gradients.cyan,
        border: 'none',
        boxShadow: '0 0 10px var(--border-glow-cyan)',
      };
    }

    const glowColors: Record<string, { glow: string; hoverGlow: string }> = {
      cyan: {
        glow: 'var(--glow-cyan)',
        hoverGlow: 'var(--glow-cyan-intense)',
      },
      magenta: {
        glow: 'var(--glow-magenta)',
        hoverGlow: 'var(--glow-magenta-intense)',
      },
      green: {
        glow: 'var(--glow-green)',
        hoverGlow: 'var(--glow-green)',
      },
      amber: {
        glow: 'var(--glow-amber)',
        hoverGlow: 'var(--glow-amber)',
      },
      purple: {
        glow: 'var(--glow-purple)',
        hoverGlow: 'var(--glow-purple)',
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
