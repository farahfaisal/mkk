import React, { useEffect, useState, useRef } from 'react';

interface LoginEmbedProps {
  url?: string;
  width?: string | number;
  height?: string | number;
  showDeviceFrame?: boolean;
  className?: string;
}

export function LoginEmbed({
  url = 'https://mk-powerhouse.netlify.app',
  width = '100%',
  height = '100%',
  showDeviceFrame = true,
  className = ''
}: LoginEmbedProps) {
  const [loading, setLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handleIframeLoad = () => {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    };

    const iframe = iframeRef.current;
    if (iframe) {
      iframe.addEventListener('load', handleIframeLoad);
    }

    return () => {
      if (iframe) {
        iframe.removeEventListener('load', handleIframeLoad);
      }
    };
  }, []);

  if (showDeviceFrame) {
    return (
      <div 
        className={`device-frame ${className}`}
        style={{
          maxWidth: '375px',
          margin: '0 auto',
          height: typeof height === 'string' ? height : `${height}px`,
          background: '#111',
          borderRadius: '40px',
          padding: '10px',
          boxShadow: '0 0 30px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        <div 
          className="device-screen"
          style={{
            flex: 1,
            background: '#0A0F1C',
            borderRadius: '30px',
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          <div 
            className="device-notch"
            style={{
              position: 'absolute',
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '150px',
              height: '30px',
              background: '#111',
              borderBottomLeftRadius: '15px',
              borderBottomRightRadius: '15px',
              zIndex: 10
            }}
          ></div>
          
          {loading && (
            <div 
              className="loading"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#0A0F1C',
                color: 'white',
                zIndex: 5
              }}
            >
              <img 
                src="https://souqpale.com/wp-content/uploads/2025/03/تصميم-بدون-عنوان-9.png" 
                alt="Logo" 
                style={{
                  width: '80px',
                  height: 'auto',
                  marginBottom: '20px'
                }}
              />
              <div 
                className="spinner"
                style={{
                  width: '30px',
                  height: '30px',
                  border: '3px solid rgba(10, 231, 242, 0.3)',
                  borderRadius: '50%',
                  borderTopColor: '#0AE7F2',
                  animation: 'spin 1s ease-in-out infinite'
                }}
              ></div>
            </div>
          )}
          
          <iframe 
            ref={iframeRef}
            src={url} 
            style={{
              width: '100%',
              height: '100%',
              border: 'none'
            }}
            allow="accelerometer; autoplay; camera; encrypted-media; geolocation; gyroscope; microphone; picture-in-picture" 
            allowFullScreen
          ></iframe>
        </div>
        <div 
          className="device-home"
          style={{
            width: '100px',
            height: '5px',
            background: '#333',
            borderRadius: '3px',
            margin: '10px auto 0'
          }}
        ></div>
      </div>
    );
  }

  return (
    <div 
      className={`responsive-container ${className}`}
      style={{
        position: 'relative',
        paddingBottom: '177.78%', /* 16:9 aspect ratio for portrait mobile */
        height: 0,
        overflow: 'hidden',
        maxWidth: '100%'
      }}
    >
      {loading && (
        <div 
          className="loading"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0A0F1C',
            color: 'white',
            zIndex: 5
          }}
        >
          <img 
            src="https://souqpale.com/wp-content/uploads/2025/03/تصميم-بدون-عنوان-9.png" 
            alt="Logo" 
            style={{
              width: '80px',
              height: 'auto',
              marginBottom: '20px'
            }}
          />
          <div 
            className="spinner"
            style={{
              width: '30px',
              height: '30px',
              border: '3px solid rgba(10, 231, 242, 0.3)',
              borderRadius: '50%',
              borderTopColor: '#0AE7F2',
              animation: 'spin 1s ease-in-out infinite'
            }}
          ></div>
        </div>
      )}
      
      <iframe 
        ref={iframeRef}
        src={url} 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          border: 'none'
        }}
        allow="accelerometer; autoplay; camera; encrypted-media; geolocation; gyroscope; microphone; picture-in-picture" 
        allowFullScreen
      ></iframe>
    </div>
  );
}