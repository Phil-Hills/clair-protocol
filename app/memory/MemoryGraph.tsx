"use client"

import { useRef, useEffect, useState } from "react"
import type { MemoryNode } from "@/lib/memory"
import * as d3 from "d3"

interface MemoryGraphProps {
  nodes: MemoryNode[]
  onNodeSelect: (node: MemoryNode) => void
  selectedNodeId?: string
}

interface D3Node extends d3.SimulationNodeDatum {
  id: string
  type: string
  content: string
  timestamp: number
  radius: number
  color: string
}

interface D3Link extends d3.SimulationLinkDatum<D3Node> {
  source: string | D3Node
  target: string | D3Node
}

export function MemoryGraph({ nodes, onNodeSelect, selectedNodeId }: MemoryGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })

  // Convert memory nodes to D3 format
  const getNodeColor = (type: string) => {
    switch (type) {
      case "prompt":
        return "#3b82f6" // blue
      case "response":
        return "#8b5cf6" // purple
      case "decision":
        return "#ec4899" // pink
      case "agent":
        return "#f59e0b" // amber
      case "memory":
      default:
        return "#10b981" // emerald
    }
  }

  const getNodeRadius = (type: string) => {
    switch (type) {
      case "prompt":
      case "response":
        return 8
      case "decision":
        return 6
      case "agent":
        return 10
      case "memory":
      default:
        return 7
    }
  }

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return

    // Get container dimensions
    const container = svgRef.current.parentElement
    if (container) {
      const { width, height } = container.getBoundingClientRect()
      // Only update dimensions if they've actually changed
      if (width !== dimensions.width || height !== dimensions.height) {
        setDimensions({ width, height })
        return // Exit early to avoid creating graph with outdated dimensions
      }
    }

    // Clear previous graph
    d3.select(svgRef.current).selectAll("*").remove()

    // Create D3 nodes and links
    const d3Nodes: D3Node[] = nodes.map((node) => ({
      id: node.id,
      type: node.type,
      content: node.content,
      timestamp: node.timestamp,
      radius: getNodeRadius(node.type),
      color: getNodeColor(node.type),
    }))

    const d3Links: D3Link[] = []
    nodes.forEach((node) => {
      node.connections.forEach((targetId) => {
        if (nodes.some((n) => n.id === targetId)) {
          d3Links.push({
            source: node.id,
            target: targetId,
          })
        }
      })
    })

    // Create SVG
    const svg = d3
      .select(svgRef.current)
      .attr("width", dimensions.width)
      .attr("height", dimensions.height)
      .attr("viewBox", [0, 0, dimensions.width, dimensions.height])

    // Create tooltip
    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "absolute hidden p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-50 max-w-xs")
      .style("pointer-events", "none")

    // Create simulation
    const simulation = d3
      .forceSimulation(d3Nodes)
      .force(
        "link",
        d3
          .forceLink(d3Links)
          .id((d: any) => d.id)
          .distance(70),
      )
      .force("charge", d3.forceManyBody().strength(-100))
      .force("center", d3.forceCenter(dimensions.width / 2, dimensions.height / 2))
      .force(
        "collision",
        d3.forceCollide().radius((d: any) => d.radius + 5),
      )

    // Create links
    const link = svg
      .append("g")
      .selectAll("line")
      .data(d3Links)
      .join("line")
      .attr("stroke", "#4b5563")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", 1)

    // Create nodes
    const node = svg
      .append("g")
      .selectAll("circle")
      .data(d3Nodes)
      .join("circle")
      .attr("r", (d) => d.radius)
      .attr("fill", (d) => d.color)
      .attr("stroke", (d) => (d.id === selectedNodeId ? "#ffffff" : "none"))
      .attr("stroke-width", (d) => (d.id === selectedNodeId ? 2 : 0))
      .call(
        d3.drag<SVGCircleElement, D3Node>().on("start", dragstarted).on("drag", dragged).on("end", dragended) as any,
      )
      .on("mouseover", (event, d) => {
        tooltip
          .html(
            `<div>
              <div class="font-bold">${d.type}</div>
              <div class="truncate">${d.content.substring(0, 100)}${d.content.length > 100 ? "..." : ""}</div>
              <div class="text-gray-400 mt-1">${new Date(d.timestamp).toLocaleString()}</div>
            </div>`,
          )
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY + 10}px`)
          .classed("hidden", false)
      })
      .on("mouseout", () => {
        tooltip.classed("hidden", true)
      })
      .on("click", (event, d) => {
        const originalNode = nodes.find((n) => n.id === d.id)
        if (originalNode) {
          onNodeSelect(originalNode)
        }
      })

    // Add node labels
    const labels = svg
      .append("g")
      .selectAll("text")
      .data(d3Nodes)
      .join("text")
      .attr("font-size", "8px")
      .attr("fill", "#ffffff")
      .attr("text-anchor", "middle")
      .attr("dy", (d) => d.radius + 10)
      .text((d) => d.type.substring(0, 3))

    // Update positions on simulation tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y)

      node
        .attr("cx", (d) => Math.max(d.radius, Math.min(dimensions.width - d.radius, d.x || 0)))
        .attr("cy", (d) => Math.max(d.radius, Math.min(dimensions.height - d.radius, d.y || 0)))

      labels
        .attr("x", (d) => Math.max(d.radius, Math.min(dimensions.width - d.radius, d.x || 0)))
        .attr("y", (d) => Math.max(d.radius, Math.min(dimensions.height - d.radius, d.y || 0)))
    })

    // Drag functions
    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart()
      d.fx = d.x
      d.fy = d.y
    }

    function dragged(event: any, d: any) {
      d.fx = event.x
      d.fy = event.y
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0)
      d.fx = null
      d.fy = null
    }

    // Cleanup
    return () => {
      simulation.stop()
      tooltip.remove()
    }
  }, [nodes, dimensions.width, dimensions.height, selectedNodeId, onNodeSelect])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const container = svgRef.current?.parentElement
      if (container) {
        const { width, height } = container.getBoundingClientRect()
        if (width !== dimensions.width || height !== dimensions.height) {
          setDimensions({ width, height })
        }
      }
    }

    window.addEventListener("resize", handleResize)
    // Initial size calculation
    handleResize()

    return () => window.removeEventListener("resize", handleResize)
  }, [dimensions.width, dimensions.height])

  return (
    <div className="w-full h-full">
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  )
}
