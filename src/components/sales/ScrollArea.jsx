import React, { useRef, useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

export default function ScrollArea({ className, children }) {
  const ref = useRef(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => setShow(el.scrollTop > 200);
    el.addEventListener("scroll", onScroll);
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="relative">
      <div ref={ref} className={className}>
        {children}
      </div>
      {show && (
        <button
          type="button"
          onClick={() => ref.current?.scrollTo({ top: 0, behavior: "smooth" })}
          className="hidden sm:flex absolute top-2 right-2 w-8 h-8 rounded-full bg-neutral-900 text-white items-center justify-center shadow-lg z-10"
          aria-label="Subir"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
