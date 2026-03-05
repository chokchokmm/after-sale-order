import { useEffect, useState, useRef } from "react";
import { Card, Row, Col, Alert } from "antd";
import {
  ClockCircleOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";
import { ticketsApi } from "../api";
import type { TicketStatistics } from "../types";
import type { EChartsCoreOption } from "echarts/core";
import { useTheme } from "../contexts/ThemeContext";

// Neon color palette - will be set based on theme
const getNeonColors = (isDark: boolean) => ({
  cyan: isDark ? "#00d4ff" : "#1890ff",
  magenta: isDark ? "#ff006e" : "#eb2f96",
  green: isDark ? "#00ff88" : "#52c41a",
  amber: isDark ? "#ffb703" : "#faad14",
  purple: isDark ? "#7b2cbf" : "#722ed1",
});

// Tech-themed loading spinner
const TechSpinner = () => (
  <div className="tech-spinner-container" style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "400px",
    gap: 16,
  }}>
    <div className="tech-spinner tech-spinner-large"></div>
    <span style={{ color: "var(--text-secondary)", fontSize: 14 }}>加载中...</span>
  </div>
);

const Dashboard = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<TicketStatistics | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get colors based on current theme
  const isDark = theme === 'dark';
  const NEON_COLORS = getNeonColors(isDark);

  const categoryChartRef = useRef<any>(null);
  const priorityChartRef = useRef<any>(null);
  const trendChartRef = useRef<any>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const ticketData = await ticketsApi.getStats();
      setStats(ticketData);
    } catch (err) {
      setError("加载统计数据失败");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 点击状态卡片跳转到工单列表
  const handleStatusClick = (status: string | string[]) => {
    if (Array.isArray(status)) {
      navigate(`/tickets?status=${status.join(",")}`);
    } else {
      navigate(`/tickets?status=${status}`);
    }
  };

  // 图表配置 - 霓虹色彩
  const getCategoryChartOption = (): EChartsCoreOption => {
    const data = Object.entries(stats?.byCategory || {}).map(([category, count]) => ({
      name: category === "TICKET_PROCESS" ? "工单处理" : category === "SYSTEM_FAILURE" ? "系统故障" : "系统提升",
      value: count,
    }));

    return {
      tooltip: {
        trigger: "item",
        formatter: "{b}: {c} ({d}%)",
        backgroundColor: theme === 'dark' ? "rgba(31, 31, 31, 0.95)" : "rgba(255, 255, 255, 0.95)",
        borderColor: theme === 'dark' ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
        textStyle: { color: theme === 'dark' ? "#fff" : "#000" },
      },
      legend: {
        bottom: 0,
        left: "center",
        textStyle: { color: theme === 'dark' ? "rgba(255, 255, 255, 0.65)" : "rgba(0, 0, 0, 0.65)" },
      },
      color: [NEON_COLORS.cyan, NEON_COLORS.magenta, NEON_COLORS.amber],
      series: [
        {
          name: "工单类型",
          type: "pie",
          radius: ["40%", "70%"],
          data,
          emphasis: {
            itemStyle: {
              shadowBlur: 20,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 212, 255, 0.5)",
            },
          },
          itemStyle: {
            borderColor: theme === 'dark' ? "rgba(10, 14, 39, 0.8)" : "rgba(255, 255, 255, 0.8)",
            borderWidth: 2,
          },
        },
      ],
    };
  };

  // 优先级分布图表配置
  const getPriorityChartOption = (): EChartsCoreOption => {
    const priorityLabels: Record<string, string> = {
      P0: "P0 紧急",
      P1: "P1 高",
      P2: "P2 中",
      P3: "P3 低",
    };
    const priorityColors: Record<string, string> = {
      P0: "#ff006e",  // magenta - 最紧急
      P1: "#ffb703",  // amber - 高
      P2: "#00d4ff",  // cyan - 中
      P3: "#00ff88",  // green - 低
    };

    const data = Object.entries(stats?.byPriority || {}).map(([priority, count]) => ({
      name: priorityLabels[priority] || priority,
      value: count,
      itemStyle: { color: priorityColors[priority] || NEON_COLORS.cyan },
    }));

    return {
      tooltip: {
        trigger: "item",
        formatter: "{b}: {c} ({d}%)",
        backgroundColor: theme === 'dark' ? "rgba(31, 31, 31, 0.95)" : "rgba(255, 255, 255, 0.95)",
        borderColor: theme === 'dark' ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
        textStyle: { color: theme === 'dark' ? "#fff" : "#000" },
      },
      legend: {
        bottom: 0,
        left: "center",
        textStyle: { color: theme === 'dark' ? "rgba(255, 255, 255, 0.65)" : "rgba(0, 0, 0, 0.65)" },
      },
      series: [
        {
          name: "优先级",
          type: "pie",
          radius: ["40%", "70%"],
          data,
          emphasis: {
            itemStyle: {
              shadowBlur: 20,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 212, 255, 0.5)",
            },
          },
          itemStyle: {
            borderColor: theme === 'dark' ? "rgba(10, 14, 39, 0.8)" : "rgba(255, 255, 255, 0.8)",
            borderWidth: 2,
          },
        },
      ],
    };
  };

  const getTrendChartOption = (): EChartsCoreOption => {
    const trendData = stats?.trend || [];
    const textColor = theme === 'dark' ? "rgba(255, 255, 255, 0.65)" : "rgba(0, 0, 0, 0.65)";
    const lineColor = theme === 'dark' ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)";
    const gridColor = theme === 'dark' ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)";

    return {
      tooltip: {
        trigger: "axis",
        backgroundColor: theme === 'dark' ? "rgba(31, 31, 31, 0.95)" : "rgba(255, 255, 255, 0.95)",
        borderColor: theme === 'dark' ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
        textStyle: { color: theme === 'dark' ? "#fff" : "#000" },
      },
      grid: { left: "3%", right: "4%", bottom: "3%", top: "10%", containLabel: true },
      xAxis: {
        type: "category",
        data: trendData.map((d) => d.date),
        axisLine: { lineStyle: { color: lineColor } },
        axisLabel: { color: textColor },
      },
      yAxis: {
        type: "value",
        axisLine: { lineStyle: { color: lineColor } },
        axisLabel: { color: textColor },
        splitLine: { lineStyle: { color: gridColor } },
      },
      series: [
        {
          data: trendData.map((d) => d.value),
          type: "line",
          smooth: true,
          symbol: "circle",
          symbolSize: 8,
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "rgba(0, 212, 255, 0.4)" },
              { offset: 1, color: "rgba(0, 212, 255, 0.05)" },
            ]),
          },
          lineStyle: {
            color: NEON_COLORS.cyan,
            width: 3,
            shadowColor: "rgba(0, 212, 255, 0.5)",
            shadowBlur: 10,
          },
          itemStyle: {
            color: NEON_COLORS.cyan,
            borderColor: theme === 'dark' ? "#fff" : "#000",
            borderWidth: 2,
          },
          emphasis: {
            itemStyle: {
              color: NEON_COLORS.cyan,
              borderColor: theme === 'dark' ? "#fff" : "#000",
              borderWidth: 2,
              shadowColor: "rgba(0, 212, 255, 0.8)",
              shadowBlur: 20,
            },
          },
        },
      ],
    };
  };

  const overview = stats?.overview || {
    total: 0,
    open: 0,
    processing: 0,
    completed: 0,
  };

  // Theme-aware card styles
  const getCardStyle = () => ({
    borderRadius: "16px",
    background: theme === 'dark' ? "rgba(31, 31, 31, 0.8)" : "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(10px)",
    border: theme === 'dark' ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.08)",
    boxShadow: "0 4px 24px rgba(0, 0, 0, 0.2)",
  });

  if (loading) {
    return <TechSpinner />;
  }

  if (error) {
    return (
      <Alert
        message={error}
        type="error"
        showIcon
        style={{
          background: "rgba(255, 0, 110, 0.15)",
          border: "1px solid rgba(255, 0, 110, 0.3)",
          borderRadius: 12,
        }}
      />
    );
  }

  // Status card styles with glowing effects
  const statusCardBaseStyle: React.CSSProperties = {
    flex: 1,
    padding: "28px 24px",
    textAlign: "center",
    cursor: "pointer",
    transition: "all 0.3s ease",
    position: "relative",
    overflow: "hidden",
  };

  const arrowStyle: React.CSSProperties = {
    width: "48px",
    background: theme === 'dark' ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.03)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  return (
    <div style={{ padding: "0" }}>
      {/* 流程状态卡片 - Futuristic Workflow */}
      <Row style={{ marginBottom: 24 }}>
        <Col span={24}>
          <div
            style={{
              display: "flex",
              alignItems: "stretch",
              gap: 0,
              overflow: "hidden",
              ...getCardStyle(),
            }}
          >
            {/* 待处理 - Amber Glow */}
            <div
              onClick={() => handleStatusClick("OPEN")}
              style={{
                ...statusCardBaseStyle,
                background: "linear-gradient(135deg, rgba(255, 183, 3, 0.2) 0%, rgba(255, 183, 3, 0.05) 100%)",
                borderRight: "1px solid rgba(255, 183, 3, 0.2)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 0 30px rgba(255, 183, 3, 0.3), inset 0 0 20px rgba(255, 183, 3, 0.1)";
                e.currentTarget.style.transform = "scale(1.02)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <div
                className="pulse-dot pulse-dot-amber"
                style={{ margin: "0 auto 12px", width: 12, height: 12 }}
              />
              <ClockCircleOutlined
                style={{ fontSize: 36, color: NEON_COLORS.amber, marginBottom: 12, filter: "drop-shadow(0 0 8px rgba(255, 183, 3, 0.5))" }}
              />
              <div style={{ color: theme === 'dark' ? "var(--text-secondary)" : "rgba(0, 0, 0, 0.65)", fontSize: 13, marginBottom: 4, letterSpacing: 1 }}>待处理</div>
              <div
                style={{
                  color: NEON_COLORS.amber,
                  fontSize: 48,
                  fontWeight: 700,
                  textShadow: "0 0 20px rgba(255, 183, 3, 0.5)",
                }}
              >
                {overview.open}
              </div>
            </div>

            {/* 箭头 */}
            <div style={arrowStyle}>
              <ArrowRightOutlined style={{ fontSize: 18, color: theme === 'dark' ? "var(--text-muted)" : "rgba(0, 0, 0, 0.45)" }} />
            </div>

            {/* 处理中 - Cyan Glow */}
            <div
              onClick={() => handleStatusClick("PROCESSING")}
              style={{
                ...statusCardBaseStyle,
                background: "linear-gradient(135deg, rgba(0, 212, 255, 0.2) 0%, rgba(0, 212, 255, 0.05) 100%)",
                borderRight: "1px solid rgba(0, 212, 255, 0.2)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 0 30px rgba(0, 212, 255, 0.3), inset 0 0 20px rgba(0, 212, 255, 0.1)";
                e.currentTarget.style.transform = "scale(1.02)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <div
                className="pulse-dot pulse-dot-cyan"
                style={{ margin: "0 auto 12px", width: 12, height: 12 }}
              />
              <SyncOutlined
                spin
                style={{ fontSize: 36, color: NEON_COLORS.cyan, marginBottom: 12, filter: "drop-shadow(0 0 8px rgba(0, 212, 255, 0.5))" }}
              />
              <div style={{ color: theme === 'dark' ? "var(--text-secondary)" : "rgba(0, 0, 0, 0.65)", fontSize: 13, marginBottom: 4, letterSpacing: 1 }}>处理中</div>
              <div
                style={{
                  color: NEON_COLORS.cyan,
                  fontSize: 48,
                  fontWeight: 700,
                  textShadow: "0 0 20px rgba(0, 212, 255, 0.5)",
                }}
              >
                {overview.processing}
              </div>
            </div>

            {/* 箭头 */}
            <div style={arrowStyle}>
              <ArrowRightOutlined style={{ fontSize: 18, color: theme === 'dark' ? "var(--text-muted)" : "rgba(0, 0, 0, 0.45)" }} />
            </div>

            {/* 已完成 - Green Glow */}
            <div
              onClick={() => handleStatusClick("COMPLETED")}
              style={{
                ...statusCardBaseStyle,
                background: "linear-gradient(135deg, rgba(0, 255, 136, 0.2) 0%, rgba(0, 255, 136, 0.05) 100%)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 0 30px rgba(0, 255, 136, 0.3), inset 0 0 20px rgba(0, 255, 136, 0.1)";
                e.currentTarget.style.transform = "scale(1.02)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <div
                className="pulse-dot pulse-dot-green"
                style={{ margin: "0 auto 12px", width: 12, height: 12 }}
              />
              <CheckCircleOutlined
                style={{ fontSize: 36, color: NEON_COLORS.green, marginBottom: 12, filter: "drop-shadow(0 0 8px rgba(0, 255, 136, 0.5))" }}
              />
              <div style={{ color: theme === 'dark' ? "var(--text-secondary)" : "rgba(0, 0, 0, 0.65)", fontSize: 13, marginBottom: 4, letterSpacing: 1 }}>已完成</div>
              <div
                style={{
                  color: NEON_COLORS.green,
                  fontSize: 48,
                  fontWeight: 700,
                  textShadow: "0 0 20px rgba(0, 255, 136, 0.5)",
                }}
              >
                {overview.completed}
              </div>
            </div>
          </div>
        </Col>
      </Row>

      {/* 工单类型分布 & 优先级分布 - Bento Card */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <span style={{ color: NEON_COLORS.cyan, fontSize: 14, fontWeight: 600, letterSpacing: 1 }}>
                工单类型分布
              </span>
            }
            bordered={false}
            style={getCardStyle()}
            headStyle={{
              borderBottom: theme === 'dark' ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.08)",
            }}
            bodyStyle={{
              background: "transparent",
            }}
          >
            {Object.keys(stats?.byCategory || {}).length > 0 ? (
              <ReactECharts
                ref={categoryChartRef}
                option={getCategoryChartOption()}
                style={{ height: 280 }}
              />
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "80px 0",
                  color: theme === 'dark' ? "var(--text-muted)" : "rgba(0, 0, 0, 0.45)",
                }}
              >
                暂无数据
              </div>
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title={
              <span style={{ color: NEON_COLORS.magenta, fontSize: 14, fontWeight: 600, letterSpacing: 1 }}>
                优先级分布
              </span>
            }
            bordered={false}
            style={getCardStyle()}
            headStyle={{
              borderBottom: theme === 'dark' ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.08)",
            }}
            bodyStyle={{
              background: "transparent",
            }}
          >
            {Object.keys(stats?.byPriority || {}).length > 0 ? (
              <ReactECharts
                ref={priorityChartRef}
                option={getPriorityChartOption()}
                style={{ height: 280 }}
              />
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "80px 0",
                  color: theme === 'dark' ? "var(--text-muted)" : "rgba(0, 0, 0, 0.45)",
                }}
              >
                暂无数据
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* 工单趋势 - Bento Card with Neon Chart */}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card
            title={
              <span style={{ color: NEON_COLORS.cyan, fontSize: 14, fontWeight: 600, letterSpacing: 1 }}>
                工单创建趋势（近30天）
              </span>
            }
            bordered={false}
            style={getCardStyle()}
            headStyle={{
              borderBottom: theme === 'dark' ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.08)",
            }}
            bodyStyle={{
              background: "transparent",
            }}
          >
            <ReactECharts
              ref={trendChartRef}
              option={getTrendChartOption()}
              style={{ height: 320 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
