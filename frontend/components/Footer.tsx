export default function Footer() {
  return (
    <footer className="border-t border-default px-6 py-10">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted">
        <p>&copy; {new Date().getFullYear()} Free YouTube Transcript Generator. Built with open-source tools.</p>
        <p>Not affiliated with YouTube or Google.</p>
      </div>
    </footer>
  );
}
