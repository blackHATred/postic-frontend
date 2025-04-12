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
          headers: {
            "Content-Type": "text/event-stream",
          },
          onmessage(ev) {
            props.onMessage(ev);
          },
          async onopen(response) {
            console.log(response);
            if (response.ok) {
              console.log(response.headers.get("content-type"));
              return; // everything's good
            } else if (
              response.status >= 400 &&
              response.status < 500 &&
              response.status !== 429
            ) {
              // client-side errors are usually non-retriable:
              //throw new Error(await response.text());
            } else {
              //throw new Error(await response.text());
            }
          },
          onerror(err) {
            //throw err; // rethrow to stop the operation
          },
          onclose() {
            if (eventSourceRef.current) {
              console.log("closed");
              eventSourceRef.current.close();
              eventSourceRef.current = null;
              setIsConnected(false);
            }
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

  return <>{props.children}</>;
};

export default AuthenticatedSSE;
