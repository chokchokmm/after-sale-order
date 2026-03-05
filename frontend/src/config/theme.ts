import type { Theme } from '../contexts/ThemeContext';
import { theme } from 'antd';

// Light theme configuration
// 浅色主题配置
export const lightTheme = {
  algorithm: theme.defaultAlgorithm,
  token: {
    // Primary color
    // 主色
    colorPrimary: '#1677ff',
    // Background colors
    // 背景色
    colorBgBase: '#ffffff',
    colorBgContainer: '#ffffff',
    colorBgElevated: '#ffffff',
    // Text colors
    // 文本色
    colorText: 'rgba(0, 0, 0, 0.85)',
    colorTextSecondary: 'rgba(0, 0, 0, 0.65)',
    colorTextTertiary: 'rgba(0, 0, 0, 0.45)',
    // Border colors
    // 边框色
    colorBorder: '#d9d9d9',
    colorBorderSecondary: '#f0f0f0',
    // Card styles
    // 卡片样式
    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 6,
    // Spacing
    // 间距
    padding: 16,
    paddingLG: 24,
    paddingSM: 12,
  },
};

// Dark theme configuration
// 深色主题配置
export const darkTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    // Primary color
    // 主色
    colorPrimary: '#177ddc',
    // Background colors
    // 背景色
    colorBgBase: '#141414',
    colorBgContainer: '#1f1f1f',
    colorBgElevated: '#262626',
    // Text colors
    // 文本色
    colorText: 'rgba(255, 255, 255, 0.85)',
    colorTextSecondary: 'rgba(255, 255, 255, 0.65)',
    colorTextTertiary: 'rgba(255, 255, 255, 0.45)',
    // Border colors
    // 边框色
    colorBorder: '#434343',
    colorBorderSecondary: '#303030',
    // Card styles
    // 卡片样式
    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 6,
    // Spacing
    // 间距
    padding: 16,
    paddingLG: 24,
    paddingSM: 12,
  },
};

// Get theme configuration based on theme type
// 根据主题类型获取主题配置
export const getThemeConfig = (theme: Theme) => {
  return theme === 'dark' ? darkTheme : lightTheme;
};

// Priority badge colors
// 优先级徽章颜色
export const priorityColors = {
  P0: { color: '#ff4d4f', bgColor: 'rgba(255, 77, 79, 0.1)' }, // Red - 系统崩溃
  P1: { color: '#fa8c16', bgColor: 'rgba(250, 140, 22, 0.1)' }, // Orange - 阻塞型BUG
  P2: { color: '#1677ff', bgColor: 'rgba(22, 119, 255, 0.1)' }, // Blue - 非主流程BUG
  P3: { color: '#52c41a', bgColor: 'rgba(82, 196, 26, 0.1)' }, // Green - 优化问题
};

// Status badge colors
// 状态徽章颜色
export const statusColors = {
  OPEN: { color: '#fa8c16', bgColor: 'rgba(250, 140, 22, 0.1)' }, // Orange - 待处理
  PROCESSING: { color: '#1677ff', bgColor: 'rgba(22, 119, 255, 0.1)' }, // Blue - 处理中
  COMPLETED: { color: '#52c41a', bgColor: 'rgba(82, 196, 26, 0.1)' }, // Green - 已完成
};
