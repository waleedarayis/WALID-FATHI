
import React, { useEffect, useState, useRef } from 'react';
import { Icons } from '../constants';
import * as d3 from 'd3';
import { RouteStop, TrafficSegment } from '../types';

interface MapViewProps {
  currentLocation: { lat: number, lng: number };
  stops: RouteStop[];
  trafficSegments?: TrafficSegment[];
  speed?: number;
}

const MapView: React.FC<MapViewProps> = ({ currentLocation, stops, trafficSegments = [], speed = 0 }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [zoom, setZoom] = useState(1);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.2, 0.5));
  };

  const getTrafficColor = (index: number) => {
    const segment = trafficSegments[index % trafficSegments.length];
    if (!segment) return "#064e3b";
    switch (segment.intensity) {
      case 'Heavy': return "#f43f5e"; // Rose
      case 'Moderate': return "#f59e0b"; // Amber
      case 'Low': return "#10b981"; // Emerald
      default: return "#064e3b";
    }
  };

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 800;
    const height = 600;

    // Main container group with zoom transform
    const g = svg.append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2}) scale(${zoom}) translate(${-width / 2}, ${-height / 2})`);

    // Simulated Italy geography roads
    const roads = [
      [[100, 100], [200, 250], [400, 300], [500, 500]],
      [[100, 100], [50, 400], [200, 550]],
      [[400, 300], [600, 150]]
    ];

    roads.forEach((path, i) => {
      // Background glow for traffic
      g.append("path")
        .datum(path)
        .attr("fill", "none")
        .attr("stroke", getTrafficColor(i))
        .attr("stroke-width", 6)
        .attr("stroke-opacity", 0.15)
        .attr("filter", "blur(4px)")
        .attr("d", d3.line() as any);

      // Main road line
      g.append("path")
        .datum(path)
        .attr("fill", "none")
        .attr("stroke", getTrafficColor(i))
        .attr("stroke-width", 3)
        .attr("stroke-opacity", 0.6)
        .attr("d", d3.line() as any);
        
      // Animated traffic dots if traffic is heavy/moderate
      const segment = trafficSegments[i % trafficSegments.length];
      if (segment && (segment.intensity === 'Heavy' || segment.intensity === 'Moderate')) {
        const pathNode = g.append("path")
          .datum(path)
          .attr("fill", "none")
          .attr("stroke", "transparent")
          .attr("d", d3.line() as any)
          .node() as SVGPathElement;

        const dot = g.append("circle")
          .attr("r", 2)
          .attr("fill", "white")
          .attr("opacity", 0.8);

        const repeat = () => {
          dot.transition()
            .duration(3000 + (segment.intensity === 'Heavy' ? 3000 : 0))
            .ease(d3.easeLinear)
            .attrTween("transform", () => {
              const length = pathNode.getTotalLength();
              return (t) => {
                const p = pathNode.getPointAtLength(t * length);
                return `translate(${p.x},${p.y})`;
              };
            })
            .on("end", repeat);
        };
        repeat();
      }
    });

    // Stops mapping from RouteStop data
    const stopPositions = [
      { x: 100, y: 100, name: "Milan", status: "Completed" },
      { x: 200, y: 250, name: "Bologna", status: "In Progress" },
      { x: 400, y: 300, name: "Florence", status: "Scheduled" },
      { x: 500, y: 500, name: "Rome", status: "Scheduled" },
    ];

    // Drawing Stops
    const stopMarkers = g.selectAll(".stop")
      .data(stopPositions)
      .enter()
      .append("g")
      .attr("class", "stop-marker");

    stopMarkers.append("circle")
      .attr("cx", d => d.x)
      .attr("cy", d => d.y)
      .attr("r", 8)
      .attr("fill", d => d.status === "Completed" ? "#10b981" : (d.status === "In Progress" ? "#84cc16" : "#065f46"))
      .attr("stroke", "#064e3b")
      .attr("stroke-width", 2)
      .attr("filter", "drop-shadow(0 0 5px rgba(0,0,0,0.5))");

    // Labels
    stopMarkers.append("text")
      .attr("x", d => d.x + 14)
      .attr("y", d => d.y + 4)
      .text(d => d.name)
      .attr("fill", "#10b981")
      .attr("font-size", "12px")
      .attr("font-weight", "900")
      .attr("class", "uppercase tracking-tighter");

    // Current Van Position
    const vanX = 200;
    const vanY = 250;

    // Van pulse effect
    const pulse = g.append("circle")
      .attr("cx", vanX)
      .attr("cy", vanY)
      .attr("r", 12)
      .attr("fill", "#84cc16")
      .attr("opacity", 0.4);

    const animatePulse = () => {
        pulse.transition()
            .duration(1500)
            .attr("r", 30)
            .attr("opacity", 0)
            .on("end", () => {
                pulse.attr("r", 12).attr("opacity", 0.4);
                animatePulse();
            });
    };
    animatePulse();

    // The Van itself
    g.append("circle")
      .attr("cx", vanX)
      .attr("cy", vanY)
      .attr("r", 8)
      .attr("fill", "#84cc16")
      .attr("stroke", "white")
      .attr("stroke-width", 3)
      .attr("filter", "drop-shadow(0 0 10px rgba(132, 204, 22, 0.6))");

  }, [currentLocation, stops, zoom, trafficSegments]);

  return (
    <div className="relative bg-emerald-950 rounded-[40px] overflow-hidden border border-emerald-800/40 h-[600px] w-full shadow-2xl group/map">
      {/* HUD Info */}
      <div className="absolute top-8 left-8 z-20 space-y-4">
        {/* Speedometer HUD */}
        <div className="bg-emerald-900/60 backdrop-blur-xl border border-emerald-400/20 p-5 rounded-[32px] shadow-2xl flex items-center gap-6 transition-transform group-hover/map:scale-[1.02]">
           <div className="flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-white font-mono tracking-tighter leading-none">{speed}</span>
              <span className="text-[10px] text-[#008B8B] font-black uppercase tracking-widest mt-1">KM/H</span>
           </div>
           <div className="w-px h-10 bg-emerald-800/50"></div>
           <div>
              <p className="text-[10px] text-emerald-600 font-black uppercase tracking-[0.2em]">Active Satellite Uplink</p>
              <p className="text-xl font-black text-white uppercase tracking-tighter">A1 Autostrada, Tuscany</p>
           </div>
        </div>

        {/* Real-time Clock and Date */}
        <div className="bg-emerald-900/60 backdrop-blur-xl border border-emerald-400/20 p-5 rounded-[32px] shadow-2xl flex flex-col items-center">
          <p className="text-3xl font-black text-white tracking-tighter font-mono">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
          <p className="text-[10px] text-emerald-500 font-black uppercase tracking-[0.3em] mt-1">
            {currentTime.toLocaleDateString([], { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
        </div>
        
        {/* Traffic Legend Overlay */}
        <div className="bg-emerald-900/80 backdrop-blur-xl border border-emerald-400/20 p-5 rounded-[32px] shadow-2xl space-y-3">
           <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-2 border-b border-emerald-800/40 pb-2">Traffic Intensity</p>
           <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"></span>
              <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Congestion</span>
           </div>
           <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></span>
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Moderate</span>
           </div>
           <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Fluid Flow</span>
           </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="absolute top-8 right-8 z-20 flex flex-col gap-3">
        <button 
          onClick={handleZoomIn}
          className="w-14 h-14 bg-emerald-900/60 backdrop-blur-xl border border-emerald-400/20 rounded-[20px] flex items-center justify-center hover:bg-emerald-800 hover:scale-105 transition-all shadow-xl active:scale-90"
        >
           <span className="text-2xl font-black text-emerald-400">+</span>
        </button>
        <button 
          onClick={handleZoomOut}
          className="w-14 h-14 bg-emerald-900/60 backdrop-blur-xl border border-emerald-400/20 rounded-[20px] flex items-center justify-center hover:bg-emerald-800 hover:scale-105 transition-all shadow-xl active:scale-90"
        >
           <span className="text-2xl font-black text-emerald-400">−</span>
        </button>
      </div>

      <div className="absolute bottom-8 right-8 z-20">
         <div className="bg-emerald-900/40 backdrop-blur-xl border border-emerald-400/20 px-4 py-2 rounded-full text-center">
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em]">Magnification: {(zoom * 100).toFixed(0)}%</span>
         </div>
      </div>

      <svg 
        ref={svgRef} 
        viewBox="0 0 800 600" 
        className="w-full h-full cursor-crosshair transition-all duration-500 ease-out"
        preserveAspectRatio="xMidYMid slice"
      />
    </div>
  );
};

export default MapView;
