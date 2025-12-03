"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import * as d3 from "d3";
import { motion } from "framer-motion";

export default function IndiaMapSection() {
  const router = useRouter();
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [hoveredCount, setHoveredCount] = useState<number | null>(null);
  const [geoData, setGeoData] = useState<any>(null);
  const [propertyData, setPropertyData] = useState<Record<string, number>>({});

  // Normalize state names
  const normalizeStateName = (name: string) => {
    if (name === "NCT of Delhi") return "Delhi";
    return name;
  };

  // Fetch GeoJSON data
  useEffect(() => {
    fetch(
      "https://raw.githubusercontent.com/HindustanTimesLabs/shapefiles/master/india/state_ut/india_state.json"
    )
      .then((res) => res.json())
      .then((data) => setGeoData(data))
      .catch((err) => console.error("GeoJSON load error:", err));
  }, []);

  // Fetch property counts by state
  useEffect(() => {
    const fetchPropertyCounts = async () => {
      try {
        const response = await fetch("/api/properties/stats");
        const data = await response.json();
        setPropertyData(data.counts || {});
      } catch (err) {
        console.error("Failed to fetch property counts:", err);
      }
    };
    fetchPropertyCounts();
  }, []);

  useEffect(() => {
    if (!geoData || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const projection = d3
      .geoMercator()
      .center([80, 22])
      .scale(1250)
      .translate([400, 400]);

    const path = d3.geoPath().projection(projection);

    svg
      .selectAll("path")
      .data(geoData.features)
      .enter()
      .append("path")
      .attr("d", path as any)
      .attr("fill", (d: any) => {
        const rawName = d.properties.st_nm || d.properties.ST_NM || "Unknown";
        const name = normalizeStateName(rawName);
        const count = propertyData[name] || 0;
        if (count > 120) return "#166534"; // dark green
        if (count > 80) return "#22c55e"; // mid green
        if (count > 0) return "#bbf7d0"; // light green
        return "#e5e7eb"; // gray
      })
      .attr("stroke", "#d1d5db")
      .attr("stroke-width", 0.6)
      .style("cursor", "pointer")
      .on("mouseenter", function (event: any, d: any) {
        const rawName = d.properties.st_nm || d.properties.ST_NM || "Unknown";
        const name = normalizeStateName(rawName);
        const count = propertyData[name] || 0;
        setHoveredState(name);
        setHoveredCount(count);
        d3.select(this).attr("fill", "#16a34a");
      })
      .on("mouseleave", function (event: any, d: any) {
        setHoveredState(null);
        setHoveredCount(null);
        const rawName = d.properties.st_nm || d.properties.ST_NM || "Unknown";
        const name = normalizeStateName(rawName);
        const count = propertyData[name] || 0;
        d3.select(this).attr("fill", () => {
          if (count > 120) return "#166534";
          if (count > 80) return "#22c55e";
          if (count > 0) return "#bbf7d0";
          return "#e5e7eb";
        });
      })
      .on("click", (event: any, d: any) => {
        const rawName = d.properties.st_nm || d.properties.ST_NM || "Unknown";
        const name = normalizeStateName(rawName);
        const count = propertyData[name] || 0;
        if (count > 0) {
          router.push(`/properties?state=${encodeURIComponent(name)}`);
        }
      });
  }, [geoData, propertyData, router]);

  return (
    <section className="bg-white border-t border-gray-200 py-20">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold text-gray-800 mb-3"
        >
          Explore Properties Across India
        </motion.h2>
        <p className="text-gray-600 mb-10">
          Hover over a state to see how many active property listings and auctions are available.
        </p>

        <div className="relative flex justify-center">
          <svg
            ref={svgRef}
            viewBox="0 0 800 800"
            className="max-w-full h-auto rounded-lg"
          />
          {hoveredState && (
            <div className="absolute bottom-8 bg-gray-900/90 text-white text-sm px-4 py-2 rounded-full">
              {hoveredState} —{" "}
              {hoveredCount ? `${hoveredCount} properties` : "No data"}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
