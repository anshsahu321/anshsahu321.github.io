# Ansh Sahu's Terminal Portfolio

A highly interactive, terminal-inspired portfolio website built with Next.js, TypeScript, and Tailwind CSS. This portfolio mimics the experience of using a terminal/shell environment while showcasing professional information, projects, and skills.

## Features

- 🖥️ **Terminal Interface**: Authentic terminal experience with command input and output
- 🤖 **AI-Powered Interactions**: Smart responses to user queries
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- 🎨 **Neon Hacker Theme**: Green-on-black terminal styling with glowing effects
- ⚡ **Fast Performance**: Built with Next.js 14 and optimized for speed
- 🔧 **TypeScript**: Full type safety and better development experience
- 🎭 **Animations**: Smooth transitions and hover effects using Framer Motion

## Available Commands

- `help` - Show available commands
- `about` - Display personal information and bio
- `projects` - List all projects (use `--detailed` for more info)
- `skills` - Show technical skills by category
- `experience` - Display work experience
- `education` - Show educational background
- `certifications` - List professional certifications
- `contact` - Get contact information
- `whoami` - Display current user information
- `date` - Show current date and time
- `ai <question>` - AI-powered assistance
- `clear` - Clear the terminal
- `ls` - List directory contents
- `pwd` - Show current directory
- `echo <text>` - Echo text

## Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS with custom terminal theme
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Deployment**: Vercel/Netlify ready

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd terminal-portfolio
```

2. Install dependencies:
```bash
npm install
```

3. Customize your information:
   - Edit `lib/data.ts` to update personal information, projects, skills, etc.
   - Replace the avatar placeholder with your actual photo
   - Update social media links

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Customization

### Personal Information
Edit the `personalInfo` object in `lib/data.ts`:
```typescript
export const personalInfo = {
  name: "Your Name",
  title: "Your Title",
  email: "your.email@example.com",
  location: "Your City, Country",
  bio: "Your bio here...",
  // ... other fields
};
```

### Projects
Add your projects to the `projects` array in `lib/data.ts`:
```typescript
export const projects: Project[] = [
  {
    id: "project-1",
    name: "Your Project",
    description: "Project description...",
    technologies: ["React", "Node.js", "TypeScript"],
    githubUrl: "https://github.com/yourusername/project",
    liveUrl: "https://your-project.vercel.app"
  },
  // ... more projects
];
```

### Skills
Update the `skills` array to reflect your technical skills:
```typescript
export const skills: Skill[] = [
  {
    category: "Frontend",
    skills: ["React", "Next.js", "TypeScript", "Tailwind CSS"]
  },
  // ... more categories
];
```

### Styling
The terminal theme can be customized in `tailwind.config.js`:
```javascript
colors: {
  terminal: {
    bg: '#0a0a0a',        // Background color
    green: '#00ff41',     // Terminal green
    darkGreen: '#00cc33', // Darker green
    // ... other colors
  }
}
```

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically

### Netlify
1. Build the project: `npm run build`
2. Deploy the `.next` folder to Netlify
3. Configure redirects in `netlify.toml`

### Other Platforms
The project can be deployed to any platform that supports Next.js applications.

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- Inspired by [gateremark.me](https://gateremark.me)
- Built with modern web technologies
- Terminal UI patterns from various open-source projects

## Support

If you have any questions or need help customizing the portfolio, please open an issue on GitHub.

---

**Happy coding! 🚀**
