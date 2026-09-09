"use client";

import { useEffect, useRef } from "react";

const EMPTY_FRAME_RATIO = 0.3125;
const ASSEMBLED_FRAME_RATIO = 0.975;
const SMOOTHING_FACTOR = 0.16;
const PROGRESS_EPSILON = 0.0005;
const SEEK_EPSILON_SECONDS = 1 / 120;

type ScrollHeroVideoProps = {
  source: string;
  fallbackEyebrow: string;
  fallbackTitle: string;
  fallbackDescription: string;
};

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

export function ScrollHeroVideo({
  source,
  fallbackEyebrow,
  fallbackTitle,
  fallbackDescription,
}: ScrollHeroVideoProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const targetProgressRef = useRef(0);
  const renderedProgressRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const sticky = stickyRef.current;
    const video = videoRef.current;

    if (!section || !sticky || !video) {
      return;
    }

    const sectionElement = section;
    const stickyElement = sticky;
    const videoElement = video;
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let prefersReducedMotion = reducedMotionQuery.matches;

    function getScrollProgress() {
      const availableScrollDistance = sectionElement.offsetHeight - stickyElement.offsetHeight;

      if (availableScrollDistance <= 0) {
        return 0;
      }

      const stickyTop = Number.parseFloat(window.getComputedStyle(stickyElement).top) || 0;
      const scrolledDistance = stickyTop - sectionElement.getBoundingClientRect().top;

      return clamp(scrolledDistance / availableScrollDistance, 0, 1);
    }

    function seekToProgress(progress: number) {
      const duration = videoElement.duration;

      if (!Number.isFinite(duration) || duration <= 0) {
        return;
      }

      // Follow the supplied source forward as ingredients drop into place.
      // Scrolling upward lowers progress and naturally reverses those same frames.
      const emptyFrameTime = duration * EMPTY_FRAME_RATIO;
      const assembledFrameTime = duration * ASSEMBLED_FRAME_RATIO;
      const targetTime = clamp(
        emptyFrameTime + (assembledFrameTime - emptyFrameTime) * clamp(progress, 0, 1),
        0,
        Math.max(0, duration - SEEK_EPSILON_SECONDS),
      );

      if (Math.abs(videoElement.currentTime - targetTime) > SEEK_EPSILON_SECONDS) {
        videoElement.currentTime = targetTime;
      }
    }

    function stopAnimation() {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    }

    function renderFrame() {
      const difference = targetProgressRef.current - renderedProgressRef.current;

      if (Math.abs(difference) <= PROGRESS_EPSILON) {
        renderedProgressRef.current = targetProgressRef.current;
        seekToProgress(renderedProgressRef.current);
        animationFrameRef.current = null;
        return;
      }

      renderedProgressRef.current += difference * SMOOTHING_FACTOR;
      seekToProgress(renderedProgressRef.current);
      animationFrameRef.current = window.requestAnimationFrame(renderFrame);
    }

    function startAnimation() {
      if (animationFrameRef.current === null) {
        animationFrameRef.current = window.requestAnimationFrame(renderFrame);
      }
    }

    function updateTargetProgress() {
      if (prefersReducedMotion) {
        return;
      }

      targetProgressRef.current = getScrollProgress();
      startAnimation();
    }

    function syncVideoToPage() {
      const progress = prefersReducedMotion ? 0 : getScrollProgress();
      targetProgressRef.current = progress;
      renderedProgressRef.current = progress;
      videoElement.pause();
      seekToProgress(progress);
    }

    function handleMetadata() {
      syncVideoToPage();
    }

    function handleSeeked() {
      videoElement.dataset.ready = "true";
    }

    function handleError() {
      delete videoElement.dataset.ready;
    }

    function handlePlay() {
      videoElement.pause();
    }

    function handleReducedMotionChange(event: MediaQueryListEvent) {
      prefersReducedMotion = event.matches;
      sectionElement.dataset.reducedMotion = String(prefersReducedMotion);
      stopAnimation();
      syncVideoToPage();
    }

    sectionElement.dataset.reducedMotion = String(prefersReducedMotion);
    videoElement.addEventListener("loadedmetadata", handleMetadata);
    videoElement.addEventListener("seeked", handleSeeked);
    videoElement.addEventListener("error", handleError);
    videoElement.addEventListener("play", handlePlay);
    window.addEventListener("scroll", updateTargetProgress, { passive: true });
    window.addEventListener("resize", updateTargetProgress, { passive: true });
    window.visualViewport?.addEventListener("resize", updateTargetProgress, { passive: true });
    reducedMotionQuery.addEventListener("change", handleReducedMotionChange);

    if (videoElement.readyState >= HTMLMediaElement.HAVE_METADATA) {
      handleMetadata();
    } else {
      updateTargetProgress();
    }

    return () => {
      stopAnimation();
      videoElement.removeEventListener("loadedmetadata", handleMetadata);
      videoElement.removeEventListener("seeked", handleSeeked);
      videoElement.removeEventListener("error", handleError);
      videoElement.removeEventListener("play", handlePlay);
      window.removeEventListener("scroll", updateTargetProgress);
      window.removeEventListener("resize", updateTargetProgress);
      window.visualViewport?.removeEventListener("resize", updateTargetProgress);
      reducedMotionQuery.removeEventListener("change", handleReducedMotionChange);
    };
  }, []);

  return (
    <div
      ref={sectionRef}
      data-scroll-hero-section
      className="relative h-[220svh] sm:h-[260svh] lg:h-[300svh] motion-reduce:h-auto"
    >
      <div
        ref={stickyRef}
        data-scroll-hero-sticky
        className="sticky top-20 flex h-[calc(100svh-5rem)] min-h-[22rem] items-center py-6 sm:py-8 motion-reduce:static motion-reduce:h-auto motion-reduce:min-h-0 motion-reduce:py-10"
      >
        <div
          data-phase-13-media-slot="true"
          className="relative isolate aspect-video w-full overflow-hidden bg-charcoal-950 shadow-2xl shadow-brown-900/20"
          aria-hidden="true"
        >
          <div className="absolute inset-0 [background:radial-gradient(circle_at_50%_42%,rgba(201,133,69,0.36),transparent_42%),linear-gradient(145deg,#39271f_0%,#211e1b_70%)]" />
          <div className="absolute inset-4 border border-cream-100/15 sm:inset-6" />
          <div className="absolute inset-0 flex flex-col justify-between p-7 text-cream-50 sm:p-10">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-caramel-400">
              {fallbackEyebrow}
            </p>
            <div>
              <p className="font-display text-5xl font-black leading-none sm:text-7xl" dir="ltr">
                CD
              </p>
              <p className="mt-4 max-w-sm text-2xl font-black leading-tight sm:text-3xl">
                {fallbackTitle}
              </p>
              <p className="mt-2 max-w-sm text-sm leading-6 text-cream-100/70 sm:text-base sm:leading-7">
                {fallbackDescription}
              </p>
            </div>
          </div>

          <video
            ref={videoRef}
            data-scroll-hero-video
            src={source}
            muted
            playsInline
            preload="auto"
            tabIndex={-1}
            aria-hidden="true"
            className="absolute inset-0 size-full bg-charcoal-950 object-contain opacity-0 transition-opacity duration-500 data-[ready=true]:opacity-100 motion-reduce:transition-none"
          />
        </div>
      </div>
    </div>
  );
}
