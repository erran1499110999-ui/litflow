"use client";

import { useEffect, useRef, useState } from "react";
import * as d3Force from "d3-force";
import type { Relationship } from "@/types";

interface PaperNode {
  id: string;
  name: string;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface RelationLink {
  source: string;
  target: string;
  type: string;
  description: string;
}

interface KnowledgeGraphProps {
  relationships: Relationship[];
  className?: string;
}

const EDGE_COLORS: Record<string, string> = {
  support: "#16a34a",     // 绿色 - 支持
  contradict: "#dc2626",  // 红色 - 矛盾
  extend: "#2563eb",      // 蓝色 - 延伸
  complement: "#d97706",  // 琥珀 - 补充
};

const EDGE_DASH: Record<string, string> = {
  support: "",
  contradict: "6,4",
  extend: "2,2",
  complement: "4,2",
};

const TYPE_LABELS: Record<string, string> = {
  support: "支持",
  contradict: "矛盾",
  extend: "延伸",
  complement: "补充",
};

export default function KnowledgeGraph({
  relationships,
  className = "",
}: KnowledgeGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<RelationLink | null>(null);

  // 提取所有不重复的论文
  const paperNames = Array.from(
    new Set(
      relationships.flatMap((r) => [r.paper1, r.paper2])
    )
  );

  const nodes: PaperNode[] = paperNames.map((name, i) => ({
    id: `paper-${i}`,
    name,
  }));

  const links: RelationLink[] = relationships.map((r, i) => ({
    source: `paper-${paperNames.indexOf(r.paper1)}`,
    target: `paper-${paperNames.indexOf(r.paper2)}`,
    type: r.type,
    description: r.description,
  }));

  // 响应式尺寸
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: rect.width || 800,
          height: Math.max(400, Math.min(600, rect.width * 0.6)),
        });
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // D3 力导向布局
  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    const svg = svgRef.current;
    const width = dimensions.width;
    const height = dimensions.height;

    // 清空
    svg.innerHTML = "";

    // 创建箭头标记定义
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    Object.entries(EDGE_COLORS).forEach(([type, color]) => {
      const marker = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "marker"
      );
      marker.setAttribute("id", `arrow-${type}`);
      marker.setAttribute("viewBox", "0 -5 10 10");
      marker.setAttribute("refX", "28");
      marker.setAttribute("refY", "0");
      marker.setAttribute("markerWidth", "8");
      marker.setAttribute("markerHeight", "8");
      marker.setAttribute("orient", "auto");

      const path = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );
      path.setAttribute("d", "M0,-5L10,0L0,5");
      path.setAttribute("fill", color);
      path.setAttribute("opacity", "0.6");
      marker.appendChild(path);
      defs.appendChild(marker);
    });

    // 阴影定义
    const filter = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "filter"
    );
    filter.setAttribute("id", "node-shadow");
    filter.setAttribute("x", "-20%");
    filter.setAttribute("y", "-20%");
    filter.setAttribute("width", "140%");
    filter.setAttribute("height", "140%");

    const feDropShadow = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "feDropShadow"
    );
    feDropShadow.setAttribute("dx", "0");
    feDropShadow.setAttribute("dy", "2");
    feDropShadow.setAttribute("stdDeviation", "4");
    feDropShadow.setAttribute("flood-color", "rgba(0,0,0,0.1)");
    filter.appendChild(feDropShadow);
    defs.appendChild(filter);

    svg.appendChild(defs);

    // 创建连线组
    const linksGroup = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "g"
    );
    linksGroup.setAttribute("class", "links");

    const linkElements: SVGLineElement[] = links.map((link) => {
      const line = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
      );
      const color = EDGE_COLORS[link.type] || "#999";
      line.setAttribute("stroke", color);
      line.setAttribute("stroke-width", "2");
      line.setAttribute("stroke-opacity", "0.5");
      line.setAttribute("stroke-dasharray", EDGE_DASH[link.type] || "");
      line.setAttribute("marker-end", `url(#arrow-${link.type})`);
      line.dataset.type = link.type;
      line.dataset.desc = link.description;
      line.style.cursor = "pointer";

      // hover 事件
      line.addEventListener("mouseenter", () => {
        setHoveredEdge({
          source: link.source as string,
          target: link.target as string,
          type: link.type,
          description: link.description,
        });
        line.setAttribute("stroke-opacity", "1");
        line.setAttribute("stroke-width", "3");
      });
      line.addEventListener("mouseleave", () => {
        setHoveredEdge(null);
        line.setAttribute("stroke-opacity", "0.5");
        line.setAttribute("stroke-width", "2");
      });

      linksGroup.appendChild(line);
      return line;
    });

    svg.appendChild(linksGroup);

    // 创建节点组
    const nodesGroup = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "g"
    );
    nodesGroup.setAttribute("class", "nodes");

    const nodeElements: SVGGElement[] = nodes.map((node) => {
      const group = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "g"
      );
      group.style.cursor = "pointer";

      // 圆
      const circle = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
      );
      circle.setAttribute("r", "12");
      circle.setAttribute("fill", "#f97316");
      circle.setAttribute("stroke", "#fff");
      circle.setAttribute("stroke-width", "2");
      circle.setAttribute("filter", "url(#node-shadow)");
      group.appendChild(circle);

      // 标签（论文名）
      const text = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      text.setAttribute("dy", "28");
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("fill", "var(--color-text, #1a1a2e)");
      text.setAttribute("font-size", "12");
      text.setAttribute("font-weight", "500");
      text.textContent =
        node.name.length > 20 ? node.name.slice(0, 18) + ".." : node.name;
      group.appendChild(text);

      // hover 效果
      group.addEventListener("mouseenter", () => {
        setHoveredNode(node.id);
        circle.setAttribute("r", "16");
        circle.setAttribute("fill", "#ea580c");
        text.setAttribute("font-weight", "600");
      });
      group.addEventListener("mouseleave", () => {
        setHoveredNode(null);
        circle.setAttribute("r", "12");
        circle.setAttribute("fill", "#f97316");
        text.setAttribute("font-weight", "500");
      });

      // 拖拽
      let dragging = false;
      const dragStart = (e: MouseEvent | TouchEvent) => {
        dragging = true;
        const point = getPoint(e);
        node.fx = point.x;
        node.fy = point.y;
      };
      const dragMove = (e: MouseEvent | TouchEvent) => {
        if (!dragging) return;
        const point = getPoint(e);
        node.fx = point.x;
        node.fy = point.y;
      };
      const dragEnd = () => {
        dragging = false;
        node.fx = null;
        node.fy = null;
      };

      const getPoint = (e: MouseEvent | TouchEvent) => {
        const rect = svg.getBoundingClientRect();
        const clientX =
          "touches" in e ? e.touches[0].clientX : e.clientX;
        const clientY =
          "touches" in e ? e.touches[0].clientY : e.clientY;
        return {
          x: clientX - rect.left,
          y: clientY - rect.top,
        };
      };

      group.addEventListener("mousedown", dragStart as any);
      window.addEventListener("mousemove", dragMove as any);
      window.addEventListener("mouseup", dragEnd);
      group.addEventListener("touchstart", dragStart as any, { passive: true });
      window.addEventListener("touchmove", dragMove as any, { passive: true });
      window.addEventListener("touchend", dragEnd);

      nodesGroup.appendChild(group);
      return group;
    });

    svg.appendChild(nodesGroup);

    // 图例
    const legendGroup = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "g"
    );
    legendGroup.setAttribute(
      "transform",
      `translate(${width - 120}, 20)`
    );

    const legendBg = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "rect"
    );
    legendBg.setAttribute("width", "110");
    legendBg.setAttribute("height", `${Object.keys(EDGE_COLORS).length * 22 + 16}`);
    legendBg.setAttribute("rx", "8");
    legendBg.setAttribute("fill", "var(--color-surface, white)");
    legendBg.setAttribute("opacity", "0.9");
    legendBg.setAttribute("stroke", "var(--color-border, #e5e7eb)");
    legendBg.setAttribute("stroke-width", "1");
    legendGroup.appendChild(legendBg);

    Object.entries(EDGE_COLORS).forEach(([type, color], i) => {
      const y = 24 + i * 22;

      const line = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
      );
      line.setAttribute("x1", "12");
      line.setAttribute("y1", `${y}`);
      line.setAttribute("x2", "30");
      line.setAttribute("y2", `${y}`);
      line.setAttribute("stroke", color);
      line.setAttribute("stroke-width", "2");
      line.setAttribute(
        "stroke-dasharray",
        EDGE_DASH[type] || ""
      );
      legendGroup.appendChild(line);

      const text = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      text.setAttribute("x", "38");
      text.setAttribute("y", `${y + 4}`);
      text.setAttribute("font-size", "11");
      text.setAttribute("fill", "var(--color-text-secondary, #666)");
      text.textContent = TYPE_LABELS[type] || type;
      legendGroup.appendChild(text);
    });

    svg.appendChild(legendGroup);

    // 力引导布局
    const simulation = d3Force
      .forceSimulation(nodes)
      .force(
        "link",
        d3Force
          .forceLink(links)
          .id((d: any) => d.id)
          .distance(120)
      )
      .force("charge", d3Force.forceManyBody().strength(-300))
      .force("center", d3Force.forceCenter(width / 2, height / 2))
      .force(
        "collision",
        d3Force.forceCollide().radius(40)
      );

    simulation.on("tick", () => {
      linkElements.forEach((line, i) => {
        const link = links[i];
        const source =
          typeof link.source === "object" ? link.source : link.source;
        const target =
          typeof link.target === "object" ? link.target : link.target;
        line.setAttribute("x1", `${(source as any).x}`);
        line.setAttribute("y1", `${(source as any).y}`);
        line.setAttribute("x2", `${(target as any).x}`);
        line.setAttribute("y2", `${(target as any).y}`);
      });

      nodeElements.forEach((group, i) => {
        const node = nodes[i];
        group.setAttribute(
          "transform",
          `translate(${node.x}, ${node.y})`
        );
      });
    });

    return () => {
      simulation.stop();
    };
  }, [nodes, links, dimensions]);

  if (relationships.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--color-border)] py-16 text-center">
        <svg
          className="mb-4 h-12 w-12 text-[var(--color-text-muted)]"
          strokeWidth={1.5}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path
            d="M18 10A6 6 0 116 10a6 6 0 0112 0z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 14v4m-4 2h8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p className="text-sm text-[var(--color-text-secondary)]">
          暂无论文关系数据
        </p>
        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
          先生成综述提纲后，这里将展示论文之间的关系图谱
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 统计信息 */}
      <div className="flex flex-wrap gap-3">
        <div className="rounded-xl bg-[var(--color-bg)] px-4 py-2 text-xs text-[var(--color-text-secondary)]">
          <span className="font-medium text-[var(--color-text)]">
            {paperNames.length}
          </span>{" "}
          篇论文
        </div>
        <div className="rounded-xl bg-[var(--color-bg)] px-4 py-2 text-xs text-[var(--color-text-secondary)]">
          <span className="font-medium text-[var(--color-text)]">
            {relationships.length}
          </span>{" "}
          条关系
        </div>
        {(() => {
          const counts: Record<string, number> = {};
          relationships.forEach((r) => {
            counts[r.type] = (counts[r.type] || 0) + 1;
          });
          return Object.entries(counts).map(([type, count]) => (
            <div
              key={type}
              className="rounded-xl bg-[var(--color-bg)] px-4 py-2 text-xs"
            >
              <span
                className="inline-block h-2 w-2 rounded-full mr-1.5"
                style={{ backgroundColor: EDGE_COLORS[type] || "#999" }}
              />
              {TYPE_LABELS[type] || type}: {count}
            </div>
          ));
        })()}
      </div>

      {/* SVG 画布 */}
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm"
      >
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          className="w-full"
          style={{ minHeight: "400px" }}
        />

        {/* 提示 */}
        <div className="absolute bottom-4 left-4 rounded-lg bg-[var(--color-surface)]/80 px-3 py-1.5 text-xs text-[var(--color-text-muted)] backdrop-blur-sm">
          拖拽节点探索 · 悬停查看关系
        </div>

        {/* Hover 关系提示 */}
        {hoveredEdge && (
          <div
            className="absolute left-1/2 top-4 -translate-x-1/2 animate-fade-in-up rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm shadow-lg backdrop-blur-sm"
            style={{
              borderLeftColor: EDGE_COLORS[hoveredEdge.type],
              borderLeftWidth: "3px",
            }}
          >
            <div className="flex items-center gap-2">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{
                  backgroundColor: EDGE_COLORS[hoveredEdge.type],
                }}
              />
              <span className="font-medium text-[var(--color-text)]">
                {TYPE_LABELS[hoveredEdge.type]}
              </span>
            </div>
            <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
              {hoveredEdge.description}
            </p>
          </div>
        )}
      </div>

      {/* 关系列表 */}
      <details className="group rounded-xl border border-[var(--color-border)]">
        <summary className="flex cursor-pointer items-center justify-between px-5 py-3 text-sm font-medium text-[var(--color-text)]">
          <span>所有关系列表</span>
          <svg
            className="h-4 w-4 text-[var(--color-text-muted)] transition-transform group-open:rotate-90"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </summary>
        <div className="space-y-2 border-t border-[var(--color-border)] px-5 py-3">
          {relationships.map((rel, i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-xl bg-[var(--color-bg)] p-3 text-sm"
            >
              <span
                className="mt-0.5 inline-block h-3 w-3 flex-shrink-0 rounded-full"
                style={{
                  backgroundColor: EDGE_COLORS[rel.type] || "#999",
                }}
              />
              <div>
                <p className="font-medium text-[var(--color-text)]">
                  {rel.paper1}
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {TYPE_LABELS[rel.type]} → {rel.paper2}
                </p>
                <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                  {rel.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}
