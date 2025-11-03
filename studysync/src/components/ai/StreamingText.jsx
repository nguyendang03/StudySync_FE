import React from 'react';
import { motion } from 'framer-motion';
import useStreamingText from '../../hooks/useStreamingText';

/**
 * Component that displays text with a streaming/typewriter effect
 * @param {string} text - Full text to display
 * @param {number} speed - Speed of streaming (chars per interval)
 * @param {boolean} enabled - Whether streaming is enabled
 * @param {Function} onComplete - Callback when streaming completes
 */
export default function StreamingText({ text, speed = 2, enabled = true, onComplete, className = '' }) {
  const { displayedText, isStreaming, skipStreaming } = useStreamingText(text, speed, enabled);

  React.useEffect(() => {
    if (!isStreaming && onComplete) {
      onComplete();
    }
  }, [isStreaming, onComplete]);

  return (
    <div 
      className={`streaming-text ${className}`}
      onClick={isStreaming ? skipStreaming : undefined}
      style={{ cursor: isStreaming ? 'pointer' : 'default' }}
    >
      {/* Parse bold markdown **text** */}
      {displayedText.split('**').map((part, i) => 
        i % 2 === 0 ? part : <strong key={i} className="font-bold">{part}</strong>
      )}
      
      {/* Blinking cursor while streaming */}
      {isStreaming && (
        <motion.span
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          className="inline-block w-1 h-4 bg-current ml-1 align-middle"
        />
      )}
    </div>
  );
}

