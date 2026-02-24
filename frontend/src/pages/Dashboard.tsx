import { useEffect, useState, useRef } from "react";
import { Card, Row, Col, Statistic, Spin, Alert } from "antd";
import {
  FileTextOutlined,
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

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<TicketStatistics | null>(null);
  const [error, setError] = useState<string | null>(null);

  const statusChartRef = useRef<any>(null);
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

  // 图表配置
  const getStatusChartOption = (): EChartsOption => {
    const data = Object.entries(stats?.byStatus || {}).map(([status, count]) => ({
      name: status === "OPEN" ? "待处理" : status === "PROCESSING" ? "处理中" : status === "CLOSED" ? "已关闭" : "已验证",
      value: count,
    }));

    return {
      tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
      legend: { bottom: 0, left: "center" },
      color: ["#faad14", "#1890ff", "#52c41a", "#722ed1"],
      series: [
        {
          name: "工单状态",
          type: "pie",
          radius: ["40%", "70%"],
          data,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.5)",
            },
          },
        },
      ],
    };
  };

  const getCategoryChartOption = (): EChartsOption => {
    const data = Object.entries(stats?.byCategory || {}).map(([category, count]) => ({
      name: category === "TICKET_PROCESS" ? "票据处理" : category === "SYSTEM_FAILURE" ? "系统故障" : "成本优化",
      value: count,
    }));

    return {
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
      grid: { left: "3%", right: "4%", bottom: "3%", top: "15%", containLabel: true },
      xAxis: { type: "category", data: data.map((d) => d.name) },
      yAxis: { type: "value" },
      series: [
        {
          data: data.map((d) => d.value),
          type: "bar",
          itemStyle: { color: "#722ed1" },
          emphasis: { itemStyle: { color: "#9254de" } },
        },
      ],
    };
  };

  const getTrendChartOption = (): EChartsOption => {
    // 使用真实的7天趋势数据
    const trendData = stats?.trend || [];

    return {
      tooltip: { trigger: "axis" },
      grid: { left: "3%", right: "4%", bottom: "3%", top: "10%", containLabel: true },
      xAxis: { type: "category", data: trendData.map((d) => d.date) },
      yAxis: { type: "value" },
      series: [
        {
          data: trendData.map((d) => d.value),
          type: "line",
          smooth: true,
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "rgba(24, 144, 255, 0.3)" },
              { offset: 1, color: "rgba(24, 144, 255, 0.05)" },
            ]),
          },
          lineStyle: { color: "#1890ff", width: 3 },
          itemStyle: { color: "#1890ff" },
          emphasis: { itemStyle: { color: "#40a9ff" } },
        },
      ],
    };
  };

  const overview = stats?.overview || {
    total: 0,
    open: 0,
    processing: 0,
    closed: 0,
    verified: 0,
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "100px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return <Alert message={error} type="error" showIcon />;
  }

  return (
    <div style={{ padding: "24px" }}>
      {/* 流程状态卡片 */}
      <Row style={{ marginBottom: 24 }}>
        <Col span={24}>
          <div style={{
            display: "flex",
            alignItems: "stretch",
            gap: 0,
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
          }}>
            {/* 待处理 */}
            <div
              onClick={() => handleStatusClick("OPEN")}
              style={{
                flex: 1,
                background: "linear-gradient(135deg, #ff9800 0%, #f57c00 100%)",
                padding: "24px 20px",
                textAlign: "center",
                position: "relative",
                cursor: "pointer",
                transition: "transform 0.2s, opacity 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.85"; e.currentTarget.style.transform = "scale(1.02)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "scale(1)"; }}
            >
              <ClockCircleOutlined style={{ fontSize: 32, color: "rgba(255,255,255,0.9)", marginBottom: 8 }} />
              <div style={{ color: "rgba(255,255,255,0.9)", fontSize: 14, marginBottom: 4 }}>待处理</div>
              <div style={{ color: "#fff", fontSize: 40, fontWeight: 700 }}>{overview.open}</div>
            </div>

            {/* 箭头 */}
            <div style={{
              width: "48px",
              background: "#f5f5f5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <ArrowRightOutlined style={{ fontSize: 20, color: "#999" }} />
            </div>

            {/* 处理中 */}
            <div
              onClick={() => handleStatusClick("PROCESSING")}
              style={{
                flex: 1,
                background: "linear-gradient(135deg, #2196f3 0%, #1976d2 100%)",
                padding: "24px 20px",
                textAlign: "center",
                cursor: "pointer",
                transition: "transform 0.2s, opacity 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.85"; e.currentTarget.style.transform = "scale(1.02)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "scale(1)"; }}
            >
              <SyncOutlined spin style={{ fontSize: 32, color: "rgba(255,255,255,0.9)", marginBottom: 8 }} />
              <div style={{ color: "rgba(255,255,255,0.9)", fontSize: 14, marginBottom: 4 }}>处理中</div>
              <div style={{ color: "#fff", fontSize: 40, fontWeight: 700 }}>{overview.processing}</div>
            </div>

            {/* 箭头 */}
            <div style={{
              width: "48px",
              background: "#f5f5f5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <ArrowRightOutlined style={{ fontSize: 20, color: "#999" }} />
            </div>

            {/* 已完成 */}
            <div
              onClick={() => handleStatusClick(["CLOSED", "VERIFIED"])}
              style={{
                flex: 1,
                background: "linear-gradient(135deg, #52c41a 0%, #389e0d 100%)",
                padding: "24px 20px",
                textAlign: "center",
                cursor: "pointer",
                transition: "transform 0.2s, opacity 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.85"; e.currentTarget.style.transform = "scale(1.02)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "scale(1)"; }}
            >
              <CheckCircleOutlined style={{ fontSize: 32, color: "rgba(255,255,255,0.9)", marginBottom: 8 }} />
              <div style={{ color: "rgba(255,255,255,0.9)", fontSize: 14, marginBottom: 4 }}>已完成</div>
              <div style={{ color: "#fff", fontSize: 40, fontWeight: 700 }}>{overview.closed + overview.verified}</div>
            </div>
          </div>
        </Col>
      </Row>

      {/* 状态分布和类型分布 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {/* 状态分布饼图 */}
        <Col xs={24} lg={12}>
          <Card title="工单状态分布" bordered={false} style={{ borderRadius: "12px" }}>
            {Object.keys(stats?.byStatus || {}).length > 0 ? (
              <ReactECharts
                ref={statusChartRef}
                option={getStatusChartOption()}
                style={{ height: 280 }}
              />
            ) : (
              <div style={{ textAlign: "center", padding: "80px 0", color: "#999" }}>
                暂无数据
              </div>
            )}
          </Card>
        </Col>

        {/* 工单类型 */}
        <Col xs={24} lg={12}>
          <Card title="工单类型分布" bordered={false} style={{ borderRadius: "12px" }}>
            {Object.keys(stats?.byCategory || {}).length > 0 ? (
              <ReactECharts
                ref={categoryChartRef}
                option={getCategoryChartOption()}
                style={{ height: 280 }}
              />
            ) : (
              <div style={{ textAlign: "center", padding: "80px 0", color: "#999" }}>
                暂无数据
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* 工单趋势 */}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="工单创建趋势（近30天）" bordered={false} style={{ borderRadius: "12px" }}>
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
