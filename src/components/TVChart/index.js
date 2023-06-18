import React, { useEffect, useRef } from 'react';

let tvScriptLoadingPromise;

export function TradingViewWidget(props) {
  const onLoadScriptRef = useRef();
  const { data } = props;
  console.log(data);
  // console.log(props{data});
  useEffect(
    () => {
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
        if (document.getElementById('tradingview_b9dc5') && 'TradingView' in window) {
          new window.TradingView.widget({
            autosize: true,
            symbol: data,
            interval: "D",
            timezone: "Etc/UTC",
            theme: "dark",
            style: "1",
            locale: "en",
            toolbar_bg: "#f1f3f6",
            enable_publishing: false,
            allow_symbol_change: true,
            container_id: "tradingview_b9dc5"
          });
        }
      }
    },
    []
  );

  return (
    <div className='tradingview-widget-container' style={{height:'100%'}}>
      <div id='tradingview_b9dc5' style={{height:'100%'}}/>
      
    </div>
  );
}