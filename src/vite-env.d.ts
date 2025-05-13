/// <reference types="vite/client" />

interface Window {
  StatusBar?: {
    overlaysWebView?: (overlay: boolean) => void;
    styleDefault?: () => void;
    styleLightContent?: () => void;
    backgroundColorByHexString?: (color: string) => void;
    hide?: () => void;
    show?: () => void;
  };
  Navigation?: {
    hideNavigationBar?: () => void;
  };
  Capacitor?: {
    Plugins: {
      StatusBar: {
        setStyle: (options: { style: string }) => void;
        setBackgroundColor: (options: { color: string }) => void;
        hide: () => void;
        show: () => void;
      };
      SplashScreen: {
        hide: () => void;
      };
    };
  };
}