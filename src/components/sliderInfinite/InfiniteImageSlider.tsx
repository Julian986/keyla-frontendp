"use client";
import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";
import './infiniteSlider.css'

export const InfiniteSlider = ({
  items,
  direction = "left",
  speed = "slow",
  pauseOnHover = true,
  className,
}: {
  items: {
    imageUrl: string;
    altText: string;
  }[];
  direction?: "left" | "right";
  speed?: "fast" | "normal" | "slow";
  pauseOnHover?: boolean;
  className?: string;
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const scrollerRef = React.useRef<HTMLUListElement>(null);

  useEffect(() => {
    addAnimation();
  }, []);

  const [start, setStart] = useState(false);

  function addAnimation() {
    if (containerRef.current && scrollerRef.current) {
      const scrollerContent = Array.from(scrollerRef.current.children);
      
      // Duplica 3 veces para mejor efecto
      const clones = [
        ...scrollerContent, 
        ...scrollerContent.map(item => item.cloneNode(true)),
        ...scrollerContent.map(item => item.cloneNode(true))
      ];
      
      scrollerRef.current.innerHTML = '';
      clones.forEach(clone => scrollerRef.current?.appendChild(clone));
  
      getDirection();
      getSpeed();
      setStart(true);
    }
  }

  const getDirection = () => {
    if (containerRef.current) {
      containerRef.current.style.setProperty(
        "--animation-direction",
        direction === "left" ? "forwards" : "reverse"
      );
    }
  };

  const getSpeed = () => {
    if (containerRef.current) {
      const duration = speed === "slow" ? "120s" : speed === "normal" ? "240s" : "480s";
      containerRef.current.style.setProperty("--animation-duration", duration);
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "scroller relative z-20 w-full overflow-hidden",
        "before:absolute before:left-0 before:top-0 before:z-50 before:h-full before:w-20 before:bg-gradient-to-r before:from-background before:to-transparent",
        "after:absolute after:right-0 after:top-0 after:z-50 after:h-full after:w-20 after:bg-gradient-to-l after:from-background after:to-transparent",
        className
      )}
    >
      <ul
        ref={scrollerRef}
        className={cn(
          "flex min-w-full shrink-0 gap-4 py-4 w-max flex-nowrap",
          start && "animate-scroll",
          pauseOnHover && "hover:[animation-play-state:paused]"
        )}
      >
        {items.map((item, idx) => (
          <li
            className="sliderLi w-[350px] max-w-full relative rounded-2xl border border-b-0 shrink-0 border-slate-700 px-8 py-6 md:w-[450px]"
            key={idx}
          >
            <img
              src={item.imageUrl}
              alt={item.altText}
              className="w-full h-auto rounded-2xl object-cover"
            />
          </li>
        ))}
      </ul>
    </div>
  );
};
