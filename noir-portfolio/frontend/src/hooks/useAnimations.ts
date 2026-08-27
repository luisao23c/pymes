import { useEffect, useRef, useState, useCallback } from 'react';

export function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setIsInView(true); obs.unobserve(el); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, isInView };
}

export function useTypewriter(text: string, speed = 50, delay = 0) {
  const [display, setDisplay] = useState('');
  const [done, setDone] = useState(false);
  useEffect(() => {
    setDisplay(''); setDone(false);
    const timeout = setTimeout(() => {
      let i = 0;
      const timer = setInterval(() => {
        if (i < text.length) { setDisplay(text.slice(0, i + 1)); i++; }
        else { setDone(true); clearInterval(timer); }
      }, speed);
      return () => clearInterval(timer);
    }, delay);
    return () => clearTimeout(timeout);
  }, [text, speed, delay]);
  return { display, done };
}

export function useScramble(text: string, trigger = true) {
  const [display, setDisplay] = useState('');
  const chars = '!<>-_\\/[]{}—=+*^?#_abcdef0123456789';
  useEffect(() => {
    if (!trigger) return;
    let frame = 0;
    const totalFrames = text.length * 3;
    const interval = setInterval(() => {
      setDisplay(text.split('').map((c, i) => {
        if (c === ' ') return ' ';
        if (frame > i * 3) return c;
        return chars[Math.floor(Math.random() * chars.length)];
      }).join(''));
      frame++;
      if (frame > totalFrames) { setDisplay(text); clearInterval(interval); }
    }, 30);
    return () => clearInterval(interval);
  }, [text, trigger]);
  return display;
}

export function useCountUp(end: number, duration = 2000, trigger = true) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let start = 0;
    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * end));
      if (progress >= 1) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration, trigger]);
  return value;
}
