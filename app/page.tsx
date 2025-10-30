"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  LiveKitRoom,
  useVoiceAssistant,
  AgentState,
  RoomAudioRenderer,
} from "@livekit/components-react";
import { MediaDeviceFailure } from "livekit-client";
import { Headphones, Loader2 } from "lucide-react";
import type { ConnectionDetails } from "@/app/api/connection-details/route";
// Error boundary to prevent UI crashes
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: false };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("UI Error caught:", error, errorInfo);
  }

  render() {
    return this.props.children;
  }
}

export default function Home() {
  const [connectionDetails, updateConnectionDetails] = useState<
    ConnectionDetails | undefined
  >(undefined);
  const [agentState, setAgentState] = useState<AgentState>("disconnected");
  const [hasError, setHasError] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      event.preventDefault();
      console.error("Unhandled promise rejection:", event.reason);
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    return () => {
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection,
      );
    };
  }, []);

  const handleEndCall = useCallback(() => {
    updateConnectionDetails(undefined);
    setAgentState("disconnected");
  }, [updateConnectionDetails, setAgentState]);

  const initiateConnection = useCallback(async () => {
    if (isConnecting || connectionDetails) {
      return;
    }

    const url = new URL(
      process.env.NEXT_PUBLIC_CONN_DETAILS_ENDPOINT ??
        "/api/connection-details",
      window.location.origin,
    );

    const agentId = "LdUbIQiJKEUic5sLD2ZhN";

    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      setIsConnecting(true);
      setHasError(false);

      const response = await fetch(url.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userName: "",
          agentId,
          userId,
          dynamic_variables: {},
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const connectionDetailsData = await response.json();
      updateConnectionDetails(connectionDetailsData);
    } catch (error) {
      console.error("Failed to connect:", error);
      setHasError(true);
    } finally {
      setIsConnecting(false);
    }
  }, [connectionDetails, isConnecting, updateConnectionDetails]);

  return (
    <ErrorBoundary>
      <main className="relative min-h-screen bg-gradient-to-b from-[#f6f7fb] via-[#f2f4fb] to-[#e9ecf9] text-slate-900">
        <div className="relative overflow-hidden">
          <div className="pointer-events-none absolute -top-48 -right-40 h-96 w-96 rounded-full bg-[#ffe1f1] opacity-60 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-[40rem] w-[40rem] -translate-x-1/3 translate-y-1/3 rounded-full bg-gradient-to-br from-[#cde0ff] via-[#f7f8fc] to-[#ffe1f1] opacity-70 blur-[140px]" />

          <header className="relative z-30 bg-white/80 backdrop-blur">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-center px-6 py-6">
              <div className="flex items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://www.calldash.ai/clients/everise-logo.png"
                  alt="Everise"
                  className="h-12 w-auto"
                />
              </div>
            </div>
          </header>

          <div className="relative z-10 mx-auto flex min-h-[calc(100vh-160px)] w-full max-w-4xl flex-col items-center justify-center px-6 pb-16">
            <section className="relative flex flex-col items-center gap-12 text-center">
              <div className="pointer-events-none absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-white/20 blur-3xl" />
              <span className="relative inline-flex items-center justify-center rounded-full border border-white/40 bg-white/10 px-6 py-2 text-sm font-semibold uppercase tracking-[0.4em] text-[#ff2d86]">
                Debt Relief AI Agent
              </span>

              <LiveKitRoom
                token={connectionDetails?.participantToken}
                serverUrl={connectionDetails?.serverUrl}
                connect={connectionDetails !== undefined}
                audio={true}
                video={false}
                onMediaDeviceFailure={onDeviceFailure}
                onError={(error) => {
                  console.error("LiveKit error:", error);
                }}
                onDisconnected={handleEndCall}
              >
                <div className="w-full">
                  {connectionDetails ? (
                    <ActiveState
                      state={agentState}
                      setAgentState={setAgentState}
                      onDisconnect={handleEndCall}
                      onError={(error) => {
                        console.error("Active state error:", error);
                      }}
                    />
                  ) : (
                    <InactiveState
                      onConnect={initiateConnection}
                      hasError={hasError}
                      isConnecting={isConnecting}
                    />
                  )}
                </div>

                <RoomAudioRenderer />
              </LiveKitRoom>
            </section>
          </div>
        </div>
      </main>
    </ErrorBoundary>
  );
}

function InactiveState({
  onConnect,
  hasError = false,
  isConnecting = false,
}: {
  onConnect: () => void;
  hasError?: boolean;
  isConnecting?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-6 text-center">

      <button
        onClick={onConnect}
        disabled={isConnecting}
        className="group relative flex h-56 w-56 items-center justify-center rounded-full bg-gradient-to-br from-[#34d399] via-[#10b981] to-[#047857] text-white shadow-[0_45px_85px_-30px_rgba(15,118,110,0.6)] transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-80"
      >
        <span className="absolute inset-0 rounded-full bg-white/10 opacity-0 transition-opacity group-hover:opacity-100" />
        {isConnecting ? (
          <Loader2 className="h-14 w-14 animate-spin" />
        ) : (
          <Headphones className="h-14 w-14" />
        )}
      </button>

      {hasError && (
        <p className="text-sm font-semibold text-red-500">
          We couldn&apos;t start the call. Please try again.
        </p>
      )}
    </div>
  );
}

function ActiveState({
  state,
  setAgentState,
  onDisconnect,
  onError,
}: {
  state: AgentState;
  setAgentState: (state: AgentState) => void;
  onDisconnect: () => void;
  onError?: (error: unknown) => void;
}) {
  const { state: liveKitState } = useVoiceAssistant();

  useEffect(() => {
    try {
      if (liveKitState) {
        setAgentState(liveKitState);
      }
    } catch (error) {
      console.error("Error updating agent state:", error);
      if (onError) onError(error);
    }
  }, [liveKitState, setAgentState, onError]);

  const gradient = getOrbGradient(state);

  return (
    <div className="flex flex-col items-center gap-6 text-center">

      <button
        onClick={onDisconnect}
        className={`relative flex h-56 w-56 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-white shadow-[0_45px_85px_-30px_rgba(15,23,42,0.4)] transition-transform hover:scale-105`}
      >
        <span className="absolute h-40 w-40 rounded-full border border-white/35 animate-ping" />
        <Headphones className="relative h-14 w-14" />
        <span className="sr-only">End Conversation</span>
      </button>
    </div>
  );
}

function getOrbGradient(state: AgentState) {
  switch (state) {
    case "connecting":
      return "from-[#fbbf24] via-[#f97316] to-[#ef4444]";
    case "listening":
    case "speaking":
    case "thinking":
      return "from-[#ef4444] via-[#dc2626] to-[#7f1d1d]";
    default:
      return "from-[#ef4444] via-[#dc2626] to-[#7f1d1d]";
  }
}

function onDeviceFailure(error?: MediaDeviceFailure) {
  console.error("Media device failure:", error);
  return false;
}
