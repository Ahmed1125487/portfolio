import { PersonalInfo, ProjectItem, SkillCategory, SocialLink } from '../types/portfolio';

export const personalInfo: PersonalInfo = {
  name: 'Ahmed Atef Khairy Mahmoud',
  title: 'Frontend & Full-Stack Web Developer',
  tagline: 'I build fast, accessible React apps and keep the code clean enough for a team to pick up. I\'m looking for an internship or junior role where I can ship real features.',
  bio: 'I am a final-year Computer Science student at the Higher Technological Institute (HTI) in 10th of Ramadan City, Egypt, graduating in 2027. My work focuses on building clean, accessible web interfaces using React, TypeScript, and Tailwind CSS, backed by solid software engineering principles and human-computer interaction studies.',
  university: 'Higher Technological Institute (HTI)',
  degree: 'B.Sc. in Computer Science',
  graduationYear: 2027,
  location: '10th of Ramadan City, Egypt',
  email: 'ahmed.atef.dev@example.com',
  github: 'https://github.com/Ahmed1125487',
  linkedin: 'https://linkedin.com/in/ahmed-atef-a8461b402',
  cvUrl: `${import.meta.env.BASE_URL}cv.pdf`,
};

export const socialLinks: SocialLink[] = [
  {
    platform: 'GitHub',
    url: 'https://github.com/Ahmed1125487',
    icon: 'Github',
  },
  {
    platform: 'LinkedIn',
    url: 'https://linkedin.com/in/ahmed-atef-a8461b402',
    icon: 'Linkedin',
  },
  {
    platform: 'Email',
    url: 'mailto:ahmed.atef.dev@example.com',
    icon: 'Mail',
  },
];

export const projects: ProjectItem[] = [
  {
    id: 'ecommerce-frontend',
    title: 'E-Commerce Frontend',
    tagline: 'Modern shopping experience built with React and Tailwind CSS.',
    description: 'Shoppers filter the catalog, add items to a cart that keeps its state, and move through a short checkout. Built to practice component composition and React performance.',
    role: 'Frontend Developer',
    techStack: ['React', 'TypeScript', 'Tailwind CSS', 'Vite', 'Context API'],
    image: null,
    patternId: 'ecommerce',
    githubUrl: 'https://github.com/Ahmed1125487',
    liveUrl: 'https://github.com/Ahmed1125487',
    featured: true,
  },
  {
    id: 'banque-misr-redesign',
    title: 'Banque Misr Website Redesign',
    tagline: 'Human-Centered Design and interface overhaul for banking services.',
    description: 'A Human-Computer Interaction coursework project. Simplified the navigation and typography on core retail banking pages, with WCAG accessibility in mind.',
    role: 'UI/UX & Frontend Implementer',
    techStack: ['HTML5', 'CSS3', 'JavaScript', 'HCI Principles', 'Accessibility'],
    image: null,
    patternId: 'banking',
    githubUrl: 'https://github.com/Ahmed1125487',
    liveUrl: 'https://github.com/Ahmed1125487',
    featured: true,
  },
  {
    id: 'team-graduation-project',
    title: 'Team Graduation Project',
    tagline: 'Collaborative capstone system architecture and frontend lead.',
    description: 'Led the client side of our senior capstone at HTI: state handling, REST API integration, and reusable components the whole team could build on.',
    role: 'Frontend Lead',
    techStack: ['React', 'TypeScript', 'Tailwind CSS', 'REST APIs', 'Git Workflow'],
    image: null,
    patternId: 'graduation',
    githubUrl: 'https://github.com/Ahmed1125487',
    liveUrl: 'https://github.com/Ahmed1125487',
    featured: true,
  },
  {
    id: 'experimental-lab',
    title: 'Interactive Web Experiments',
    tagline: 'Explorations in WebGL graphics, micro-interactions, and motion.',
    description: 'Small experiments with Three.js, GSAP, and canvas. Each one tests how much motion a page can carry before it slows down.',
    role: 'Creator & Developer',
    techStack: ['Three.js', 'GSAP', 'HTML5 Canvas', 'Tailwind CSS'],
    image: null,
    patternId: 'lab',
    githubUrl: 'https://github.com/Ahmed1125487',
    liveUrl: 'https://github.com/Ahmed1125487',
    featured: false,
  },
];

export const skillCategories: SkillCategory[] = [
  {
    category: 'Frontend Development',
    description: 'Building responsive, reactive, and accessible user interfaces.',
    skills: [
      { name: 'React / React DOM', level: 90, iconName: 'Atom' },
      { name: 'TypeScript', level: 85, iconName: 'FileCode2' },
      { name: 'JavaScript (ES6+)', level: 90, iconName: 'Terminal' },
      { name: 'Tailwind CSS', level: 95, iconName: 'Palette' },
      { name: 'HTML5 & Semantic Markup', level: 95, iconName: 'Globe' },
      { name: 'CSS3 / Flexbox / Grid', level: 90, iconName: 'Layers' },
    ],
  },
  {
    category: 'Tools & Ecosystem',
    description: 'Version control, build tools, and modern developer workflows.',
    skills: [
      { name: 'Vite & Webpack', level: 85, iconName: 'Zap' },
      { name: 'Git & GitHub', level: 90, iconName: 'GitBranch' },
      { name: 'RESTful API Integration', level: 85, iconName: 'Network' },
      { name: 'Node.js & npm', level: 75, iconName: 'Server' },
      { name: 'Postman & Testing', level: 80, iconName: 'CheckCircle2' },
    ],
  },
  {
    category: 'Computer Science & HCI',
    description: 'Core academic foundations from HTI computer science curriculum.',
    skills: [
      { name: 'Data Structures & Algorithms', level: 85, iconName: 'Cpu' },
      { name: 'Human-Computer Interaction (HCI)', level: 90, iconName: 'Users' },
      { name: 'Software Engineering Principles', level: 85, iconName: 'BookOpen' },
      { name: 'Responsive UI/UX Design', level: 90, iconName: 'Smartphone' },
    ],
  },
];
