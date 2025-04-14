// hooks/useAuthenticatedSSE.ts
import React from 'react';
import { useState, useEffect } from 'react';
import { fetchEventSource } from '@microsoft/fetch-event-source';

interface SSEOptions {
  url: string;
  onMessage: (data: any) => void;
  onError?: (error: Event) => void;
  withCredentials?: boolean;
}

const AuthenticatedSSE: React.FC<SSEOptions> = (props: SSEOptions) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const ctrl = new AbortController();

  useEffect(() => {
    console.log('loading');
    const setupSSE = async () => {
      try {
        fetchEventSource(`${props.url}`, {
          method: 'get',
          credentials: 'include',
          signal: ctrl.signal,
          headers: {
            'Content-Type': 'text/event-stream',
          },
          onmessage(ev) {
            console.log('message');
            props.onMessage(ev);
          },
          async onopen(response) {
            setIsConnected(true);
            if (response.ok) {
              console.log(response.headers.get('content-type'));
              return; // everything's good
            } else if (response.status >= 400 && response.status < 500 && response.status !== 429) {
              ctrl.abort();
              // client-side errors are usually non-retriable:
              //throw new Error(await response.text());
            } else {
              ctrl.abort();
              setTimeout(() => setupSSE(), 1000);
              throw new Error(await response.text());
            }
          },
          onerror(err) {
            ctrl.abort();
            setTimeout(() => setupSSE(), 1000);
            throw err;
          },
          onclose() {
            ctrl.abort();
            setIsConnected(false);
          },
        });
      } catch (err) {
        ctrl.abort();
        console.error('Failed to establish SSE connection:', err);
        setTimeout(setupSSE, 1000);
      }
    };

    if (!isConnected) setupSSE();

    return () => {
      ctrl.abort();
      setIsConnected(false);
    };
  }, [props.url, props.onMessage, props.onError, props.withCredentials]);

  return <></>;
};

export default AuthenticatedSSE;
