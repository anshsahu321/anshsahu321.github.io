import Link from 'next/link';

export default function Projects() {
  return (
    <>
      <nav>
        <Link href="/">Home</Link>
        <Link href="/projects">Projects</Link>
        <Link href="/blog">Blog</Link>
        <Link href="/contact">Contact</Link>
      </nav>
      <div className="container">
        <h2>Projects</h2>
        <ul>
          <li>
            <strong>FinanceAI-Pro</strong> - AI-powered financial analysis tool.
          </li>
          <li>
            <strong>MeetingMind-AI</strong> - Smart meeting assistant.
          </li>
          <li>
            <strong>AI-Email-Summarizer</strong> - Email summary tool.
          </li>
        </ul>
      </div>
    </>
  );
}
