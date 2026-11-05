"use client";

import { FormEvent, useEffect, useState } from "react";

type DriveSettings = {
  enabled: boolean;
  apiKey: string;
  clientId: string;
};

export function SettingsForm() {
  const [enabled, setEnabled] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [clientId, setClientId] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          setError(data.error ?? "Could not load settings.");
          return;
        }
        const drive = data.drive as DriveSettings;
        setEnabled(drive.enabled);
        setApiKey(drive.apiKey);
        setClientId(drive.clientId);
      })
      .catch(() => setError("Could not load settings."))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled, apiKey, clientId }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Could not save settings.");
        return;
      }
      const drive = data.drive as DriveSettings;
      setEnabled(drive.enabled);
      setApiKey(drive.apiKey);
      setClientId(drive.clientId);
      setSaved(true);
    } catch {
      setError("Could not save settings.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-zinc-400">Loading settings...</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-violet-300">
          Imports
        </p>
        <h2 className="mt-2 text-xl font-semibold text-white">Google Drive</h2>
        <p className="mt-2 text-sm text-zinc-400">
          Turn on Drive imports for the upload page. The API key is a Google Cloud browser key. The OAuth client ID lets people sign in to pick a file. Both are sent to the browser when imports are on.
        </p>

        <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(event) => {
              setEnabled(event.target.checked);
              setSaved(false);
            }}
            className="mt-1 h-4 w-4 rounded border-white/20 bg-black/40 text-violet-500"
          />
          <span>
            <span className="text-sm font-medium text-zinc-100">
              Enable Google Drive imports
            </span>
            <span className="mt-1 block text-xs text-zinc-500">
              Off until you save a key. Upload from computer keeps working either way.
            </span>
          </span>
        </label>

        <div className="mt-5 space-y-2">
          <label htmlFor="google-api-key" className="text-sm font-medium text-zinc-200">
            Google API key
          </label>
          <div className="flex gap-2">
            <input
              id="google-api-key"
              type={showKey ? "text" : "password"}
              autoComplete="off"
              value={apiKey}
              onChange={(event) => {
                setApiKey(event.target.value);
                setSaved(false);
              }}
              placeholder="AIza..."
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-violet-400/50"
            />
            <button
              type="button"
              onClick={() => setShowKey((current) => !current)}
              className="rounded-xl border border-white/10 px-4 text-sm text-zinc-200"
            >
              {showKey ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <div className="mt-5 space-y-2">
          <label htmlFor="google-client-id" className="text-sm font-medium text-zinc-200">
            Google OAuth client ID
          </label>
          <input
            id="google-client-id"
            type="text"
            autoComplete="off"
            value={clientId}
            onChange={(event) => {
              setClientId(event.target.value);
              setSaved(false);
            }}
            placeholder="....apps.googleusercontent.com"
            className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-violet-400/50"
          />
          <p className="text-xs text-zinc-500">
            Create these in Google Cloud: an API key with the Drive API and Picker API, plus an OAuth client for this site.
          </p>
        </div>
      </section>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}
      {saved && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          {enabled
            ? "Google Drive imports are on."
            : "Settings saved. Google Drive imports are off."}
        </div>
      )}

      <button
        type="submit"
        disabled={saving}
        className="rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
      >
        {saving ? "Saving..." : "Save settings"}
      </button>
    </form>
  );
}
