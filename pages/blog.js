import Link from 'next/link';

export default function Blog() {
  return (
    <>
      <nav>
        <Link href="/">Home</Link>
        <Link href="/projects">Projects</Link>
        <Link href="/blog">Blog</Link>
        <Link href="/contact">Contact</Link>
      </nav>
      <div className="container">
        <h2>Blog</h2>
        <p>
          Coming soon! Stay tuned for my latest articles and tutorials.
        </p>
      </div>
    </>
  );
}
