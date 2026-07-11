"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

export interface VideoPlayerHandle {
  seekTo: (seconds: number) => void;
}

interface VideoPlayerProps {
  videoId: string;
  title?: string | null;
  onTimeUpdate?: (seconds: number) => void;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: (() => void) | undefined;
  }
}

let apiLoadPromise: Promise<void> | null = null;

function loadYouTubeApi(): Promise<void> {
  if (apiLoadPromise) return apiLoadPromise;
  apiLoadPromise = new Promise((resolve) => {
    if (window.YT && window.YT.Player) {
      resolve();
      return;
    }
    const prevCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prevCallback?.();
      resolve();
    };
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);
  });
  return apiLoadPromise;
}

const VideoPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(
  ({ videoId, title, onTimeUpdate }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<any>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useImperativeHandle(ref, () => ({
      seekTo(seconds: number) {
        playerRef.current?.seekTo(seconds, true);
        playerRef.current?.playVideo();
      },
    }));

    useEffect(() => {
      let cancelled = false;

      loadYouTubeApi().then(() => {
        if (cancelled || !containerRef.current) return;
        playerRef.current = new window.YT.Player(containerRef.current, {
          videoId,
          playerVars: { enablejsapi: 1 },
          events: {
            onReady: () => {
              intervalRef.current = setInterval(() => {
                const time = playerRef.current?.getCurrentTime?.();
                if (typeof time === "number") onTimeUpdate?.(time);
              }, 500);
            },
          },
        });
      });

      return () => {
        cancelled = true;
        if (intervalRef.current) clearInterval(intervalRef.current);
        playerRef.current?.destroy?.();
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [videoId]);

    return (
      <div className="rounded-2xl overflow-hidden shadow-card bg-black aspect-video w-full">
        <div ref={containerRef} className="w-full h-full" title={title || "YouTube video player"} />
      </div>
    );
  }
);

VideoPlayer.displayName = "VideoPlayer";
export default VideoPlayer;
