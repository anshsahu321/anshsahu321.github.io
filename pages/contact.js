import Link from 'next/link';

export default function Contact() {
  return (
    <>
      <nav>
        <Link href="/">Home</Link>
        <Link href="/projects">Projects</Link>
        <Link href="/blog">Blog</Link>
        <Link href="/contact">Contact</Link>
      </nav>
      <div className="container">
        <h2>Contact Me</h2>
        <p>
          Email: <a href="mailto:your.email@example.com">your.email@example.com</a>
        </p>
        <p>
          LinkedIn: <a href="https://linkedin.com/in/yourprofile" target="_blank">Your LinkedIn</a>
        </p>
        <p>
          GitHub: <a href="https://github.com/anshsahu321" target="_blank">anshsahu321</a>
        </p>
      </div>
    </>
  );
}
