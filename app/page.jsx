import Test from "@/components/Test";

export default function Home() {
  return (
    <main className="min-h-full w-full flex flex-col items-center py-12 gap-8">
      <div className="bg-white p-6 rounded-md shadow-sm border w-full max-w-2xl flex flex-col gap-4">
        <h2 className="text-xl font-bold">Demo Pages</h2>
        <div className="grid grid-cols-2 gap-4">
          <a href="/demo/server-public" className="p-4 border rounded hover:bg-zinc-50 text-blue-600 font-medium">Public Server Page</a>
          <a href="/demo/server-protected" className="p-4 border rounded hover:bg-zinc-50 text-blue-600 font-medium">Protected Server Page</a>
          <a href="/demo/server-orders" className="p-4 border rounded hover:bg-zinc-50 text-purple-600 font-bold shadow-sm">Server Orders (Page + API Protection)</a>
          <a href="/demo/client-public" className="p-4 border rounded hover:bg-zinc-50 text-blue-600 font-medium">Public Client Page</a>
          <a href="/demo/client-protected" className="p-4 border rounded hover:bg-zinc-50 text-blue-600 font-medium">Protected Client Page</a>
        </div>
      </div>
      <Test />
    </main>
  );
}
