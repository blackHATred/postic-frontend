// hooks/useAuthenticatedSSE.ts
import React, { PropsWithChildren } from "react";
import { useState, useEffect, useRef } from "react";
import { fetchEventSource } from "@microsoft/fetch-event-source";

interface SSEOptions {
  url: string;
  onMessage: (data: any) => void;
  onError?: (error: Event) => void;
  withCredentials?: boolean;
}

const AuthenticatedSSE: React.FC<PropsWithChildren<SSEOptions>> = (
  props: PropsWithChildren<SSEOptions>
) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const setupSSE = async () => {
      try {
        const ctrl = new AbortController();

        fetchEventSource(`${props.url}`, {
          method: "get",
          credentials: "include",
          signal: ctrl.signal,
          onerror(err) {
            throw err; // rethrow to stop the operation
          },
        });
      } catch (err) {
        console.error("Failed to establish SSE connection:", err);
        setTimeout(setupSSE, 5000);
      }
    };

    setupSSE();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
        setIsConnected(false);
      }
    };
  }, [props.url, props.onMessage, props.onError, props.withCredentials]);

  const close = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsConnected(false);
    }
  };

  return <div>{props.children}</div>;
};

export default AuthenticatedSSE;
