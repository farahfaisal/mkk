import React, { useEffect, useState } from 'react';

interface IframeEmbedProps {
  url?: string;
  height?: string | number;
  width?: string | number;
  title?: string;
  className?: string;
  allowFullscreen?: boolean;
  style?: React.CSSProperties;
}

export function IframeEmbed({
  url = 'https://mk-powerhouse.netlify.app',
  height = '100%',
  width = '100%',
  title = 'MK Fitness App',
  className = '',
  allowFullscreen = true,
  style
}: IframeEmbedProps) {
  const [iframeHeight, setIframeHeight] = useState(height);
  const [iframeWidth, setIframeWidth] = useState(width);

  useEffect(() => {
    // Update dimensions if props change
    setIframeHeight(height);
    setIframeWidth(width);
  }, [height, width]);

  return (
    <div className={`iframe-container ${className}`} style={{ overflow: 'hidden', borderRadius: '12px', ...(style || {}) }}>
      <iframe
        src={url}
        height={iframeHeight}
        width={iframeWidth}
        title={title}
        frameBorder="0"
        allow="accelerometer; autoplay; camera; encrypted-media; geolocation; gyroscope; microphone; picture-in-picture"
        allowFullScreen={allowFullscreen}
        style={{ border: 'none', overflow: 'hidden' }}
      />
    </div>
  );
}