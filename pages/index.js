import Link from 'next/link';

export default function Home() {
  return (
    <>
      <nav>
        <Link href="/">Home</Link>
        <Link href="/projects">Projects</Link>
        <Link href="/blog">Blog</Link>
        <Link href="/contact">Contact</Link>
      </nav>
      <div className="container">
        <h1>Hi, I'm Ansh Sahu</h1>
        <p>
          Welcome to my portfolio! I'm a passionate developer specializing in web and AI projects. Explore my work, blog, and get in touch!
        </p>
      </div>
    </>
  );
}
