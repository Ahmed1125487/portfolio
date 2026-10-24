export interface PersonalInfo {
  name: string;
  title: string;
  tagline: string;
  bio: string;
  university: string;
  degree: string;
  graduationYear: number;
  location: string;
  email: string;
  github: string;
  linkedin: string;
  cvUrl: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  tagline: string;
  description: string;
  role: string;
  techStack: string[];
  image: string | null;
  patternId: 'ecommerce' | 'banking' | 'graduation' | 'lab';
  githubUrl?: string;
  liveUrl?: string;
  featured: boolean;
}

export interface SkillCategory {
  category: string;
  description: string;
  skills: { name: string; level: number; iconName?: string }[];
}

export interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}
