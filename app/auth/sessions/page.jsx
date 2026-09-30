"use client";
import { useState, useEffect } from "react";
import Button from "@/components/Button";
import { requestHandler } from "@/util/requestHandler";

export default function SessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchSessions = async () => {
    try {
      const result = await requestHandler("/api/auth/sessions");
      setSessions(result.data.sessions);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleRevoke = async (sessionId) => {
    setMessage("");
    try {
      await requestHandler(`/api/auth/sessions/${sessionId}`, {
        method: "DELETE",
      });
      // Remove revoked session from the list
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      setMessage("Session revoked.");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogoutAll = async () => {
    setMessage("");
    try {
      const result = await requestHandler("/api/auth/logout-all", {
        method: "POST",
      });
      setMessage(result.message);
      // Refresh the session list
      fetchSessions();
    } catch (err) {
      setError(err.message);
    }
  };

  // Parse user-agent into a simple readable string
  const parseDevice = (ua) => {
    if (!ua) return "Unknown device";
    if (ua.includes("Firefox")) return "Firefox";
    if (ua.includes("Edg")) return "Edge";
    if (ua.includes("Chrome")) return "Chrome";
    if (ua.includes("Safari")) return "Safari";
    return ua.substring(0, 50);
  };

  if (loading) return <p className="p-8 text-zinc-500">Loading sessions...</p>;

  return (
    <div className="flex justify-center h-full w-full p-4">
      <div className="w-full lg:w-2/3 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Active Sessions</h1>
          <Button txt="Log out all other devices" onClick={handleLogoutAll} />
        </div>

        {message && <p className="text-sm text-green-600">{message}</p>}
        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex flex-col gap-3">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={`flex justify-between items-center p-4 rounded-md border ${
                session.isCurrent
                  ? "border-blue-500 bg-blue-950/20"
                  : "border-zinc-700"
              }`}
            >
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium">
                  {parseDevice(session.userAgent)}
                  {session.isCurrent && (
                    <span className="ml-2 text-xs text-blue-400 font-semibold">
                      (This device)
                    </span>
                  )}
                </span>
                <span className="text-xs text-zinc-500">
                  IP: {session.ipAddress || "Unknown"}
                </span>
                <span className="text-xs text-zinc-500">
                  Created: {new Date(session.createdAt).toLocaleString()}
                </span>
              </div>

              {!session.isCurrent && (
                <Button
                  txt="Revoke"
                  onClick={() => handleRevoke(session.id)}
                />
              )}
            </div>
          ))}

          {sessions.length === 0 && (
            <p className="text-zinc-500">No active sessions found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
