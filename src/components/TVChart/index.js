import React, { useEffect, useRef } from 'react';

let tvScriptLoadingPromise;

export function TradingViewWidget(props) {
  const onLoadScriptRef = useRef();
  const { data } = props;
  useEffect(
    () => {
      // const { data } = props;
      onLoadScriptRef.current = createWidget;

      if (!tvScriptLoadingPromise) {
        tvScriptLoadingPromise = new Promise((resolve) => {
          const script = document.createElement('script');
          script.id = 'tradingview-widget-loading-script';
          script.src = 'https://s3.tradingview.com/tv.js';
          script.type = 'text/javascript';
          script.onload = resolve;

          document.head.appendChild(script);
        });
      }

      tvScriptLoadingPromise.then(() => onLoadScriptRef.current && onLoadScriptRef.current());

      return () => onLoadScriptRef.current = null;

      function createWidget() {
        if (document.getElementById('tradingview_5c450') && 'TradingView' in window) {
          new window.TradingView.widget({
            autosize: true,
            symbol: data,
            timezone: "Etc/UTC",
            theme: "light",
            style: "1",
            locale: "en",
            toolbar_bg: "#f1f3f6",
            enable_publishing: false,
            withdateranges: true,
            range: "1M",
            hide_side_toolbar: false,
            allow_symbol_change: true,
            studies: ["STD;SMA","STD;RSI"],
            container_id: "tradingview_5c450"
          });
        }
      }
    },
    []
  );

  return (
    <div className='tradingview-widget-container' style={{height:'100%'}}>
      <div id='tradingview_5c450' style={{height:'100%'}}/>
      
    </div>
  );
}