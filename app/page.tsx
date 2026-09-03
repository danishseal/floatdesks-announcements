export default function Home() {
  return (
    <main className="mirror-shell">
      <iframe
        className="mirror-frame"
        src="/dottxt/index.html"
        title=".txt announcements"
        allow="fullscreen"
      />
    </main>
  );
}
