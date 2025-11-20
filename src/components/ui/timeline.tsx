"use client";
import {
  useMotionValueEvent,
  useScroll,
  useTransform,
  motion,
} from "framer-motion";
import React, { useEffect, useRef, useState } from "react";

interface TimelineEntry {
  title: string;
  content: React.ReactNode;
}

export const Timeline = ({ data, endElementId, title, subtitle }: { 
  data: TimelineEntry[]; 
  endElementId?: string;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const computeHeight = () => {
      if (!ref.current) return;
      const containerRect = ref.current.getBoundingClientRect();
      if (endElementId) {
        const endEl = containerRef.current?.querySelector(`#${endElementId}`) as HTMLElement | null;
        if (endEl) {
          const endRect = endEl.getBoundingClientRect();
          const endHeight = Math.max(0, endRect.bottom - containerRect.top);
          setHeight(endHeight);
          return;
        }
      }
      setHeight(containerRect.height);
    };

    computeHeight();
    window.addEventListener("resize", computeHeight);
    return () => window.removeEventListener("resize", computeHeight);
  }, [ref, containerRef, endElementId]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 10%", "end 50%"],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <div
      className="w-full bg-background font-sans md:px-10"
      ref={containerRef}
    >
      <div className="max-w-7xl mx-auto py-10 px-4 md:px-8 lg:px-10">
        <h2 className="text-5xl md:text-6xl font-normal mb-6 text-center">
          {title || "Nossa Trajetória até o Sucesso"}
        </h2>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto text-center">
          {subtitle || "Desenvolvemos nossa Plataforma ao Longo dos Anos para Oferecer as Melhores Ferramentas e Integrações para Realizar uma Comunicação Inteligente."}
        </p>
      </div>

      <div ref={ref} className="relative max-w-7xl mx-auto pb-12 px-4">
        {/* Central vertical line */}
        <div
          style={{ height: height + "px" }}
          className="absolute left-[28px] md:left-1/2 top-0 -translate-x-0 md:-translate-x-1/2 w-[6px] md:w-[6px] bg-border"
        >
          <motion.div
                  style={{ height: heightTransform, opacity: opacityTransform }}
                  className="absolute inset-x-0 top-0 w-[6px] md:w-[6px] bg-gradient-to-t from-primary via-blue-500 to-transparent rounded-full"
                />
        </div>

        {data.map((item, index) => (
          <div key={index} className="relative grid grid-cols-[56px_1fr] md:grid md:grid-cols-2 gap-4 md:gap-8 pt-8 md:pt-20">
            {/* Year label near center line for desktop with glow */}
            <div className="hidden md:block absolute left-1/2 -translate-x-1/2 -top-2">
              <div className="relative flex items-center gap-3">
                {/* Glow behind marker */}
                <span className="absolute -left-2 -top-2 w-8 h-8 rounded-full bg-primary/25 blur-md" />
                <span className="relative w-4 h-4 rounded-full bg-primary ring-2 ring-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.6)]" />
                {/* Glow behind year */}
                <span className="relative px-1 text-xl md:text-2xl font-bold text-foreground">
                  <span className="absolute -inset-1 bg-primary/10 blur-sm rounded-md" />
                  <span className="relative">{item.title}</span>
                </span>
              </div>
            </div>

            {/* Mobile year heading on left with glow */}
            <h3 className="md:hidden col-start-1 row-start-1 relative text-2xl font-bold text-primary mb-0 text-center whitespace-nowrap drop-shadow-[0_0_14px_rgba(59,130,246,0.75)]">
              <span className="absolute -inset-1 bg-primary/20 blur-[4px] rounded" />
              <span className="relative">{item.title}</span>
            </h3>

            {/* Alternating content blocks with default spacing */}
            <div className={(index % 2 === 0 ? "md:col-start-1" : "md:col-start-2") + " col-start-2"}>
              {item.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};