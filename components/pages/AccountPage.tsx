// src/pages/AccountPage.tsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/authContext";
import {
  fetchConnectedAccounts,
  disconnectAccount,
  startOAuthFlow,
} from "../../services/oauthService";

export const AccountPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [connected, setConnected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);
  const [connecting, setConnecting] = useState<string | null>(null);

  const PROVIDERS = ["linkedin", "youtube", "spotify", "x"];

  useEffect(() => {
    if (!authLoading && user) loadConnections();
  }, [authLoading, user]);

  const loadConnections = async () => {
    setLoading(true);
    const providers = await fetchConnectedAccounts();
    setConnected(providers);
    setLoading(false);
  };

  const handleConnect = async (provider: string) => {
    setConnecting(provider);
    const ok = await startOAuthFlow(provider);
    setConnecting(null);

    if (ok) {
      await loadConnections();
    }
  };

  const handleDisconnect = async (provider: string) => {
    setDisconnecting(provider);
    const ok = await disconnectAccount(provider);
    setDisconnecting(null);

    if (ok) {
      await loadConnections();
    }
  };

  if (authLoading || loading) {
    return (
      <div className="text-white text-center py-10 text-lg">Loading account…</div>
    );
  }

  if (!user) {
    return (
      <div className="text-white text-center py-10">
        <p className="text-xl font-semibold">You must be logged in</p>
        <p className="text-gray-400 mt-2">Please log in to see your account.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10">
      <div className="max-w-3xl mx-auto bg-gray-900/70 p-8 rounded-2xl shadow-xl border border-gray-800">
        <h1 className="text-3xl font-bold mb-6 text-blue-400">My Account</h1>

        {/* Profile block */}
        <div className="mb-10 border-b border-gray-700 pb-6">
          <p className="text-xl font-semibold">Profile</p>
          <p className="text-gray-300 mt-2">
            <span className="font-medium">Username:</span> {user.username}
          </p>
          {user.email && (
            <p className="text-gray-300 mt-1">
              <span className="font-medium">Email:</span> {user.email}
            </p>
          )}
        </div>

        {/* Connected providers */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Connected Accounts</h2>

          <div className="space-y-4">
            {PROVIDERS.map((provider) => {
              const isConnected = connected.includes(provider);

              return (
                <div
                  key={provider}
                  className="flex justify-between items-center bg-gray-800/60 p-4 rounded-xl shadow border border-gray-700"
                >
                  <div className="flex items-center gap-4">
                    <ProviderIcon provider={provider} />
                    <span className="capitalize text-lg">{provider}</span>
                  </div>

                  {/* Buttons */}
                  <div>
                    {isConnected ? (
                      <button
                        onClick={() => handleDisconnect(provider)}
                        disabled={disconnecting === provider}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm disabled:opacity-50"
                      >
                        {disconnecting === provider
                          ? "Disconnecting…"
                          : "Disconnect"}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleConnect(provider)}
                        disabled={connecting === provider}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm disabled:opacity-50"
                      >
                        {connecting === provider
                          ? "Connecting…"
                          : "Connect"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Logout */}
        <div className="mt-12 text-center">
          <a
            href="/"
            className="text-blue-400 hover:text-blue-300 underline text-sm"
          >
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
};

// Small icons for providers
const ProviderIcon: React.FC<{ provider: string }> = ({ provider }) => {
  const icons: Record<string, string> = {
    linkedin:
      "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286z",
    youtube:
      "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z",
    spotify:
      "M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02z",
    x: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231z",
  };

  return (
    <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
      <path d={icons[provider]} />
    </svg>
  );
};
