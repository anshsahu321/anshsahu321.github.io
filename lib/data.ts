export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  image?: string;
}

export interface Skill {
  category: string;
  skills: string[];
}

export interface Experience {
  company: string;
  position: string;
  duration: string;
  description: string;
  technologies: string[];
}

export interface Education {
  institution: string;
  degree: string;
  duration: string;
  description?: string;
}

export interface Certification {
  name: string;
  issuer: string;
  date: string;
  credentialId?: string;
}

export const personalInfo = {
  name: "Ansh Sahu",
  title: "Software & AI Engineer",
  email: "as.shawansh@gmail.com",
  location: "Assam, India",
  bio: "Passionate Computer Science student and software developer from Assam, India. Specializing in full-stack web development with modern technologies like React, Next.js, and Node.js. Love building innovative solutions and continuously learning new technologies.",
  avatar: "/avatar.jpg", // You can replace this with your actual avatar
  social: {
    github: "https://github.com/anshsahu321",
    linkedin: "https://www.linkedin.com/in/ansh-sahu-995803357?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
    twitter: "https://twitter.com/anshsahu321",
  }
};

export const projects: Project[] = [
  {
    id: "terminal-portfolio",
    name: "Interactive Terminal Portfolio",
    description: "A modern, interactive portfolio built with Next.js and TypeScript, featuring a terminal interface with AI-powered interactions and smooth animations.",
    technologies: ["Next.js", "TypeScript", "Tailwind CSS", "Framer Motion", "React"],
    githubUrl: "https://github.com/anshsahu321/my-portfolio",
    liveUrl: "https://ansh-sahu-portfolio.vercel.app"
  },
  {
    id: "project-2",
    name: "E-Commerce Platform",
    description: "Full-stack e-commerce application with user authentication, payment integration, and admin dashboard.",
    technologies: ["React", "Node.js", "Express.js", "MongoDB", "Stripe API"],
    githubUrl: "https://github.com/anshsahu321/ecommerce-platform",
    liveUrl: "https://ecommerce-demo.vercel.app"
  },
  {
    id: "project-3",
    name: "Task Management System",
    description: "Collaborative task management tool with real-time updates, drag-and-drop functionality, and team collaboration features.",
    technologies: ["Vue.js", "Socket.io", "PostgreSQL", "Redis", "Docker"],
    githubUrl: "https://github.com/anshsahu321/task-manager",
    liveUrl: "https://taskmanager-demo.netlify.app"
  },
  {
    id: "project-4",
    name: "Weather Forecast App",
    description: "Responsive weather application with location-based forecasts, interactive maps, and detailed weather analytics.",
    technologies: ["React", "OpenWeather API", "Chart.js", "Geolocation API"],
    githubUrl: "https://github.com/anshsahu321/weather-app",
    liveUrl: "https://weather-forecast-app.vercel.app"
  }
];

export const skills: Skill[] = [
  {
    category: "Frontend Development",
    skills: ["React", "Next.js", "TypeScript", "JavaScript", "Tailwind CSS", "HTML5", "CSS3", "Vue.js"]
  },
  {
    category: "Backend Development",
    skills: ["Node.js", "Express.js", "Python", "FastAPI", "RESTful APIs", "GraphQL", "Serverless"]
  },
  {
    category: "Database & Storage",
    skills: ["MongoDB", "PostgreSQL", "MySQL", "Redis", "Firebase", "Supabase", "Prisma ORM"]
  },
  {
    category: "Cloud & DevOps",
    skills: ["AWS", "Vercel", "Netlify", "Docker", "GitHub Actions", "CI/CD", "Linux"]
  },
  {
    category: "Mobile Development",
    skills: ["React Native", "Flutter", "Progressive Web Apps", "Responsive Design"]
  },
  {
    category: "Development Tools",
    skills: ["Git", "VS Code", "Figma", "Postman", "Jest", "Cypress", "Webpack", "Babel"]
  }
];

export const experience: Experience[] = [
  {
    company: "Freelance Software Developer",
    position: "Full Stack Developer",
    duration: "2023 - Present",
    description: "Developing custom web applications and mobile solutions for clients across various industries. Specializing in modern JavaScript frameworks and cloud deployment strategies.",
    technologies: ["React", "Next.js", "Node.js", "MongoDB", "Vercel", "TypeScript"]
  },
  {
    company: "Personal Projects & Learning",
    position: "Software Developer",
    duration: "2022 - Present",
    description: "Building innovative projects and continuously learning new technologies. Focus on full-stack development, modern web technologies, and best practices.",
    technologies: ["React", "Vue.js", "Python", "PostgreSQL", "Docker", "AWS"]
  },
  {
    company: "Academic Projects",
    position: "Student Developer",
    duration: "2020 - 2023",
    description: "Developed various academic projects including web applications, mobile apps, and system designs. Gained hands-on experience with modern development practices.",
    technologies: ["JavaScript", "HTML5", "CSS3", "Java", "MySQL", "Git"]
  }
];

export const education: Education[] = [
  {
    institution: "Computer Science Engineering",
    degree: "Bachelor of Technology (B.Tech)",
    duration: "2020 - 2024",
    description: "Pursuing degree in Computer Science with focus on software engineering, algorithms, data structures, and modern web technologies."
  },
  {
    institution: "Online Learning & Certifications",
    degree: "Full Stack Development",
    duration: "2022 - Present",
    description: "Self-directed learning in modern web development, including React, Node.js, cloud technologies, and best practices through online platforms."
  },
  {
    institution: "Coding Bootcamps & Workshops",
    degree: "Advanced Web Development",
    duration: "2023",
    description: "Participated in intensive coding bootcamps and workshops focusing on full-stack development, modern frameworks, and industry best practices."
  }
];

export const certifications: Certification[] = [
  {
    name: "React Developer Certification",
    issuer: "Meta (Facebook)",
    date: "2023",
    credentialId: "META-REACT-2023"
  },
  {
    name: "JavaScript Algorithms and Data Structures",
    issuer: "freeCodeCamp",
    date: "2023",
    credentialId: "FCC-JS-ALGORITHMS"
  },
  {
    name: "Responsive Web Design",
    issuer: "freeCodeCamp",
    date: "2022",
    credentialId: "FCC-RESPONSIVE-DESIGN"
  },
  {
    name: "Python Programming",
    issuer: "Coursera",
    date: "2022",
    credentialId: "COURSERA-PYTHON-101"
  }
];

export const commands = {
  help: {
    description: "Show available commands",
    usage: "help"
  },
  about: {
    description: "Display personal information and bio",
    usage: "about"
  },
  projects: {
    description: "List all projects with details",
    usage: "projects [--detailed]"
  },
  skills: {
    description: "Show technical skills by category",
    usage: "skills [category]"
  },
  experience: {
    description: "Display work experience",
    usage: "experience"
  },
  education: {
    description: "Show educational background",
    usage: "education"
  },
  certifications: {
    description: "List professional certifications",
    usage: "certifications"
  },
  contact: {
    description: "Get contact information",
    usage: "contact"
  },
  clear: {
    description: "Clear the terminal",
    usage: "clear"
  },
  whoami: {
    description: "Display current user information",
    usage: "whoami"
  },
  date: {
    description: "Show current date and time",
    usage: "date"
  },
  ai: {
    description: "AI-powered assistance (experimental)",
    usage: "ai <question>"
  }
};
