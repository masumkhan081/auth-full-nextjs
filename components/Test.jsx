"use client";

import { useEffect, useState } from "react";

export default function Test() {

  const recipientOptions = [
    { value: "masumkhan.technext@gmail.com", label: "masumkhan.technext@gmail.com" },
    { value: "masum498673@gmail.com", label: "masum498673@gmail.com" },
    { value: "study.contents.of.masumkhan@gmail.com", label: "study.contents.of.masumkhan@gmail.com" },
  ];
  const providerOptions = [
    { value: "brevo", label: "Brevo" },
    { value: "resend", label: "Resend" },
  ];

  const [to, setTo] = useState("test@example.com");
  const [provider, setProvider] = useState("brevo");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [subject, setSubject] = useState("");

  useEffect(() => {
    const updateSubject = () => {
      const time = new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(new Date());

      setSubject(`AUTH-FULL-NEXTJS-${time}`);
    };

    updateSubject();
    const interval = setInterval(updateSubject, 60000);

    return () => clearInterval(interval);
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setSending(true);

    try {
      await fetch("/api/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, message, provider }),
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-2xl flex-col gap-3 rounded-lg border border-zinc-700 bg-zinc-900 p-4 shadow-lg sm:p-6"
    >
      <label className="flex flex-col gap-1 text-sm text-zinc-300">
        To email
        <select
          value={to}
          onChange={(event) => setTo(event.target.value)}
          className="w-full rounded-md border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
        >
          {recipientOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm text-zinc-300">
        Provider
        <select
          value={provider}
          onChange={(event) => setProvider(event.target.value)}
          className="w-full rounded-md border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
        >
          {providerOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm text-zinc-300">
        Subject
        <input
          type="text"
          value={subject}
          readOnly
          className="w-full rounded-md border border-zinc-700 bg-zinc-800/60 px-3 py-2 text-sm text-zinc-400 outline-none"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm text-zinc-300">
        Message
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Message"
          required
          className="min-h-32 w-full resize-y rounded-md border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
        />
      </label>
      <button
        type="submit"
        disabled={sending}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400/60 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:self-end"
      >
        {sending ? "sending..." : "send email"}
      </button>
    </form>
  );
}