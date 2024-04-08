"use client";

import { useState, useEffect, useRef } from "react";

const GoogleBoundaryFailed: React.FC = () => (
  <div>
    <h1>Google Maps could not be loaded</h1>
    <p>Please check your internet connection or try refreshing the page.</p>
  </div>
);

type GoogleBoundaryProps = {
  children: React.ReactNode;
};

type State = "loading" | "failed" | "ready";

export const GoogleBoundary: React.FC<GoogleBoundaryProps> = ({ children }) => {
  const [ready, setReady] = useState<State>("loading");
  const counter = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      counter.current += 1;

      if (counter.current > 20) {
        clearInterval(interval);
        setReady("failed");
        return;
      }

      if (typeof google !== "undefined") {
        setReady("ready");
        clearInterval(interval);
      }
    }, 200);

    return () => clearInterval(interval);
  }, []);

  if (ready === "loading") {
    return <div>Loading...</div>;
  }

  if (ready === "failed") {
    return <GoogleBoundaryFailed />;
  }

  return children;
};
