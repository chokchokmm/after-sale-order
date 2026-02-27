import React from 'react';
import { Tag } from 'antd';
import type { TagProps } from 'antd';

type StatusType = 'OPEN' | 'PROCESSING' | 'COMPLETED';
type PriorityType = 'HIGH' | 'MEDIUM' | 'LOW';

interface StatusBadgeProps extends Omit<TagProps, 'color'> {
  status?: StatusType;
  priority?: PriorityType;
  animated?: boolean;
  label?: string;
}

/**
 * StatusBadge - A glowing badge component for status and priority indicators
 * 状态徽章 - 用于状态和优先级指示器的发光徽章组件
 */
const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  priority,
  animated = false,
  label,
  style,
  className = '',
  ...restProps
}) => {
  const getStatusConfig = (s: StatusType) => {
    const configs: Record<StatusType, { color: string; bg: string; border: string; label: string }> = {
      OPEN: {
        color: '#ffb703',
        bg: 'rgba(255, 183, 3, 0.15)',
        border: 'rgba(255, 183, 3, 0.4)',
        label: '待处理',
      },
      PROCESSING: {
        color: '#00d4ff',
        bg: 'rgba(0, 212, 255, 0.15)',
        border: 'rgba(0, 212, 255, 0.4)',
        label: '处理中',
      },
      COMPLETED: {
        color: '#00ff88',
        bg: 'rgba(0, 255, 136, 0.15)',
        border: 'rgba(0, 255, 136, 0.4)',
        label: '已完成',
      },
    };
    return configs[s];
  };

  const getPriorityConfig = (p: PriorityType) => {
    const configs: Record<PriorityType, { color: string; bg: string; border: string; label: string }> = {
      HIGH: {
        color: '#ff006e',
        bg: 'rgba(255, 0, 110, 0.15)',
        border: 'rgba(255, 0, 110, 0.4)',
        label: '高',
      },
      MEDIUM: {
        color: '#00d4ff',
        bg: 'rgba(0, 212, 255, 0.15)',
        border: 'rgba(0, 212, 255, 0.4)',
        label: '中',
      },
      LOW: {
        color: '#6b7280',
        bg: 'rgba(107, 114, 128, 0.15)',
        border: 'rgba(107, 114, 128, 0.4)',
        label: '低',
      },
    };
    return configs[p];
  };

  const config = status
    ? getStatusConfig(status)
    : priority
    ? getPriorityConfig(priority)
    : null;

  if (!config) {
    return null;
  }

  const displayLabel = label || config.label;

  const tagStyle: React.CSSProperties = {
    background: config.bg,
    border: `1px solid ${config.border}`,
    color: config.color,
    borderRadius: '16px',
    padding: '2px 12px',
    fontSize: '12px',
    fontWeight: 500,
    boxShadow: animated
      ? `0 0 8px ${config.color}40`
      : `0 0 4px ${config.color}30`,
    transition: 'all 0.3s ease',
    ...style,
  };

  const tagClassName = animated
    ? `status-badge status-badge-animated ${className}`.trim()
    : `status-badge ${className}`.trim();

  return (
    <Tag className={tagClassName} style={tagStyle} {...restProps}>
      {displayLabel}
    </Tag>
  );
};

export default StatusBadge;
