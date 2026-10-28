import React, { useEffect, useRef, useState, useCallback } from 'react';

interface PreviewProps {
  html: string;
  duration: number;
}

export const Preview: React.FC<PreviewProps> = ({ html, duration }) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const blobUrlRef = useRef<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [speed, setSpeed] = useState(1);
  const animFrameRef = useRef<number | null>(null);
  const lastTsRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(true);
  const speedRef = useRef<number>(1);
  const durationRef = useRef<number>(duration);

  // Keep refs in sync for requestAnimationFrame loop
  durationRef.current = duration;
  speedRef.current = speed;
  isPlayingRef.current = isPlaying;

  const seekFrame = useCallback((t: number) => {
    try {
      const cw = iframeRef.current?.contentWindow as unknown as { seek?: (t: number) => void } | null;
      cw?.seek?.(t);
    } catch {
      // ignore cross-origin or loading errors
    }
  }, []);

  // Main animation loop
  const startLoop = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }

    lastTsRef.current = performance.now();

    const loop = (ts: number) => {
      if (!isPlayingRef.current) return;
      const dt = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;

      let nextTime = timeRef.current + dt * speedRef.current;
      const d = durationRef.current || 20;
      if (nextTime >= d) {
        nextTime = 0;
      }

      timeRef.current = nextTime;
      setCurrentTime(nextTime);
      seekFrame(nextTime);

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
  }, [seekFrame]);

  // Load new HTML whenever `html` changes
  useEffect(() => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
    }

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    blobUrlRef.current = url;

    const iframe = iframeRef.current;
    if (iframe) {
      iframe.src = url;
      iframe.onload = () => {
        seekFrame(timeRef.current);
        if (isPlayingRef.current) {
          startLoop();
        }
      };
    }

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
    };
  }, [html, seekFrame, startLoop]);

  // Handle play / pause toggle
  const togglePlay = () => {
    const nextState = !isPlaying;
    setIsPlaying(nextState);
    isPlayingRef.current = nextState;

    if (nextState) {
      startLoop();
    } else {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    }
  };

  // Handle scrubber change
  const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    const newTime = (value / 1000) * (duration || 20);
    timeRef.current = newTime;
    setCurrentTime(newTime);
    seekFrame(newTime);
  };

  // Speed multiplier toggle
  const toggleSpeed = () => {
    const speeds = [0.5, 1, 2];
    const currentIndex = speeds.indexOf(speed);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setSpeed(nextSpeed);
  };

  const scrubberVal = duration > 0 ? Math.round((currentTime / duration) * 1000) : 0;

  return (
    <div className="editor-preview" id="editor-preview-area">
      <div className="preview-wrapper" id="preview-frame">
        <iframe
          ref={iframeRef}
          id="preview-iframe"
          title="Motion Reel Live Preview"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>

      <div className="preview-controls" id="preview-controls">
        <button
          className="preview-btn"
          id="preview-play"
          title={isPlaying ? 'Pause' : 'Play'}
          onClick={togglePlay}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>

        <input
          type="range"
          className="preview-scrubber"
          id="preview-scrubber"
          min="0"
          max="1000"
          value={scrubberVal}
          onChange={handleScrubberChange}
        />

        <span className="preview-time" id="preview-time">
          {currentTime.toFixed(2)} / {(duration || 20).toFixed(1)}s
        </span>

        <button
          className="preview-btn"
          id="preview-speed"
          title="Playback speed"
          onClick={toggleSpeed}
        >
          {speed}×
        </button>
      </div>
    </div>
  );
};
