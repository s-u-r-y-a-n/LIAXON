import { useEffect, useRef } from "react";
import socket from "../services/socket.js";

/**
 * Custom React hook for subscribing to a Socket.io event with automatic cleanup on unmount.
 * 
 * @param {string} eventName - The socket event name to listen to.
 * @param {Function} handler - The callback function to execute when event is received.
 */
export const useSocketEvent = (eventName, handler) => {
    const handlerRef = useRef(handler);

    // Keep handler ref updated without re-attaching listeners
    useEffect(() => {
        handlerRef.current = handler;
    }, [handler]);

    useEffect(() => {
        if (!socket || !eventName) return;

        const eventListener = (...args) => {
            if (typeof handlerRef.current === "function") {
                handlerRef.current(...args);
            }
        };

        socket.on(eventName, eventListener);

        return () => {
            socket.off(eventName, eventListener);
        };
    }, [eventName]);
};

export default useSocketEvent;
