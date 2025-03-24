function subscribe(eventName: string, listener: EventListener) {
  document.addEventListener(eventName, listener);
}

function unsubscribe(eventName: string, listener: EventListener) {
  document.removeEventListener(eventName, listener);
}

function publish(eventName: string, data?: any) {
  const event = new CustomEvent(eventName, { detail: data });
  document.dispatchEvent(event);
}

export { publish, subscribe, unsubscribe };
