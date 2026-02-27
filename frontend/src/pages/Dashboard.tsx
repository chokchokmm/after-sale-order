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
import type { EChartsOption } from "echarts/core";

// Neon color palette for charts
const NEON_COLORS = {
  cyan: "#00d4ff",
  magenta: "#ff006e",
  green: "#00ff88",
  amber: "#ffb703",
  purple: "#7b2cbf",
};

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
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<TicketStatistics | null>(null);
  const [error, setError] = useState<string | null>(null);

  const categoryChartRef = useRef<any>(null);
  const trendChartRef = useRef<any>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ticketsApi.getStats();
      setStats(data);
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
  const getCategoryChartOption = (): EChartsOption => {
    const data = Object.entries(stats?.byCategory || {}).map(([category, count]) => ({
      name: category === "TICKET_PROCESS" ? "工单处理" : category === "SYSTEM_FAILURE" ? "系统故障" : "系统提升",
      value: count,
    }));

    return {
      tooltip: {
        trigger: "item",
        formatter: "{b}: {c} ({d}%)",
        backgroundColor: "rgba(26, 26, 46, 0.95)",
        borderColor: "rgba(255, 255, 255, 0.1)",
        textStyle: { color: "#fff" },
      },
      legend: {
        bottom: 0,
        left: "center",
        textStyle: { color: "var(--text-secondary)" },
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
            borderColor: "rgba(10, 14, 39, 0.8)",
            borderWidth: 2,
          },
        },
      ],
    };
  };

  const getTrendChartOption = (): EChartsOption => {
    const trendData = stats?.trend || [];

    return {
      tooltip: {
        trigger: "axis",
        backgroundColor: "rgba(26, 26, 46, 0.95)",
        borderColor: "rgba(255, 255, 255, 0.1)",
        textStyle: { color: "#fff" },
      },
      grid: { left: "3%", right: "4%", bottom: "3%", top: "10%", containLabel: true },
      xAxis: {
        type: "category",
        data: trendData.map((d) => d.date),
        axisLine: { lineStyle: { color: "rgba(255, 255, 255, 0.1)" } },
        axisLabel: { color: "var(--text-secondary)" },
      },
      yAxis: {
        type: "value",
        axisLine: { lineStyle: { color: "rgba(255, 255, 255, 0.1)" } },
        axisLabel: { color: "var(--text-secondary)" },
        splitLine: { lineStyle: { color: "rgba(255, 255, 255, 0.05)" } },
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
            borderColor: "#fff",
            borderWidth: 2,
          },
          emphasis: {
            itemStyle: {
              color: NEON_COLORS.cyan,
              borderColor: "#fff",
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
    background: "rgba(255, 255, 255, 0.03)",
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
              borderRadius: "20px",
              overflow: "hidden",
              background: "rgba(26, 26, 46, 0.4)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
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
              <div style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 4, letterSpacing: 1 }}>待处理</div>
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
              <ArrowRightOutlined style={{ fontSize: 18, color: "var(--text-muted)" }} />
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
              <div style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 4, letterSpacing: 1 }}>处理中</div>
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
              <ArrowRightOutlined style={{ fontSize: 18, color: "var(--text-muted)" }} />
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
              <div style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 4, letterSpacing: 1 }}>已完成</div>
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

      {/* 工单类型分布 - Glass Card */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <span style={{ color: "var(--accent-cyan)", fontSize: 14, fontWeight: 600, letterSpacing: 1 }}>
                工单类型分布
              </span>
            }
            bordered={false}
            style={{
              borderRadius: "16px",
              background: "rgba(26, 26, 46, 0.4)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              boxShadow: "0 4px 24px rgba(0, 0, 0, 0.2)",
            }}
            headStyle={{
              borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
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
                  color: "var(--text-muted)",
                }}
              >
                暂无数据
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* 工单趋势 - Glass Card with Neon Chart */}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card
            title={
              <span style={{ color: "var(--accent-cyan)", fontSize: 14, fontWeight: 600, letterSpacing: 1 }}>
                工单创建趋势（近30天）
              </span>
            }
            bordered={false}
            style={{
              borderRadius: "16px",
              background: "rgba(26, 26, 46, 0.4)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              boxShadow: "0 4px 24px rgba(0, 0, 0, 0.2)",
            }}
            headStyle={{
              borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
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
