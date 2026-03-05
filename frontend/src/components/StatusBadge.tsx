import React from 'react';
import { Tag } from 'antd';
import type { TagProps } from 'antd';
import { priorityColors, statusColors } from '../config/theme';
import { useTheme } from '../contexts/ThemeContext';

type StatusType = 'OPEN' | 'PROCESSING' | 'COMPLETED';
type PriorityType = 'P0' | 'P1' | 'P2' | 'P3';

interface StatusBadgeProps extends Omit<TagProps, 'color'> {
  status?: StatusType;
  priority?: PriorityType;
  animated?: boolean;
  label?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  priority,
  animated = false,
  label,
  style,
  className = '',
  ...restProps
}) => {
  const { theme } = useTheme();

  const getStatusConfig = (s: StatusType) => {
    const configs: Record<StatusType, { color: string; bg: string; border: string; label: string }> = {
      OPEN: {
        color: statusColors.OPEN.color,
        bg: statusColors.OPEN.bgColor,
        border: statusColors.OPEN.color + '40',
        label: '待处理',
      },
      PROCESSING: {
        color: statusColors.PROCESSING.color,
        bg: statusColors.PROCESSING.bgColor,
        border: statusColors.PROCESSING.color + '40',
        label: '处理中',
      },
      COMPLETED: {
        color: statusColors.COMPLETED.color,
        bg: statusColors.COMPLETED.bgColor,
        border: statusColors.COMPLETED.color + '40',
        label: '已完成',
      },
    };
    return configs[s];
  };

  const getPriorityConfig = (p: PriorityType) => {
    const configs: Record<PriorityType, { color: string; bg: string; border: string; label: string }> = {
      P0: {
        color: priorityColors.P0.color,
        bg: priorityColors.P0.bgColor,
        border: priorityColors.P0.color + '40',
        label: 'P0 - 系统崩溃',
      },
      P1: {
        color: priorityColors.P1.color,
        bg: priorityColors.P1.bgColor,
        border: priorityColors.P1.color + '40',
        label: 'P1 - 阻塞型BUG',
      },
      P2: {
        color: priorityColors.P2.color,
        bg: priorityColors.P2.bgColor,
        border: priorityColors.P2.color + '40',
        label: 'P2 - 非主流程BUG',
      },
      P3: {
        color: priorityColors.P3.color,
        bg: priorityColors.P3.bgColor,
        border: priorityColors.P3.color + '40',
        label: 'P3 - 优化问题',
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
    whiteSpace: 'nowrap',
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
