"use client";
import { useState } from "react";
import Button from "@/components/Button";

export default function ClientPublicPage() {
  const [count, setCount] = useState(0);

  return (
    <div className="p-8 max-w-2xl mx-auto text-center">
      <h1 className="text-3xl font-bold mb-2">Public Client Page</h1>
      <p className="text-zinc-600 mb-8">
        This is a public client component. Anyone can interact with it. No authentication required.
      </p>

      <div className="flex flex-col items-center gap-4">
        <div className="text-4xl font-bold">{count}</div>
        <div className="flex gap-2">
          <Button txt="Decrease" onClick={() => setCount(c => c - 1)} />
          <Button txt="Increase" onClick={() => setCount(c => c + 1)} />
        </div>
      </div>

      <div className="mt-12">
        <Button type="link" txt="Go Home" onClick={() => window.location.href = "/"} />
      </div>
    </div>
  );
}
