import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook for streaming/typewriter text effect
 * @param {string} text - The full text to stream
 * @param {number} speed - Characters per interval (default: 2)
 * @param {boolean} enabled - Whether streaming is enabled
 * @returns {Object} - { displayedText, isStreaming, skipStreaming }
 */
export function useStreamingText(text, speed = 2, enabled = true) {
  const [displayedText, setDisplayedText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [shouldSkip, setShouldSkip] = useState(false);
  const intervalRef = useRef(null);
  const currentIndexRef = useRef(0);

  useEffect(() => {
    if (!text || !enabled) {
      setDisplayedText(text || '');
      setIsStreaming(false);
      return;
    }

    // Reset state
    setDisplayedText('');
    setIsStreaming(true);
    setShouldSkip(false);
    currentIndexRef.current = 0;

    // If user skipped, show full text immediately
    if (shouldSkip) {
      setDisplayedText(text);
      setIsStreaming(false);
      return;
    }

    // Stream text character by character
    intervalRef.current = setInterval(() => {
      if (shouldSkip) {
        setDisplayedText(text);
        setIsStreaming(false);
        clearInterval(intervalRef.current);
        return;
      }

      currentIndexRef.current += speed;

      if (currentIndexRef.current >= text.length) {
        setDisplayedText(text);
        setIsStreaming(false);
        clearInterval(intervalRef.current);
      } else {
        setDisplayedText(text.slice(0, currentIndexRef.current));
      }
    }, 30); // Update every 30ms

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [text, speed, enabled, shouldSkip]);

  const skipStreaming = () => {
    setShouldSkip(true);
    setDisplayedText(text);
    setIsStreaming(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  return {
    displayedText,
    isStreaming,
    skipStreaming,
  };
}

export default useStreamingText;

