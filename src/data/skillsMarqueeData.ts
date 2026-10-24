import {
  SiReact,
  SiTypescript,
  SiJavascript,
  SiTailwindcss,
  SiNodedotjs,
  SiExpress,
  SiMongodb,
  SiVite,
  SiThreedotjs,
  SiGreensock,
  SiFramer,
  SiFigma,
  SiGit,
  SiGithub,
  SiHtml5,
  SiCss,
} from 'react-icons/si';
import { IconType } from 'react-icons';

export interface TechLogo {
  name: string;
  color: string;
  icon: IconType;
}

export const row1Techs: TechLogo[] = [
  { name: 'React', color: '#61DAFB', icon: SiReact },
  { name: 'TypeScript', color: '#3178C6', icon: SiTypescript },
  { name: 'JavaScript', color: '#F7DF1E', icon: SiJavascript },
  { name: 'Tailwind CSS', color: '#06B6D4', icon: SiTailwindcss },
  { name: 'Vite', color: '#646CFF', icon: SiVite },
  { name: 'Three.js', color: '#34D399', icon: SiThreedotjs },
  { name: 'GSAP', color: '#88CE02', icon: SiGreensock },
  { name: 'Framer Motion', color: '#0055FF', icon: SiFramer },
];

export const row2Techs: TechLogo[] = [
  { name: 'HTML5', color: '#E34F26', icon: SiHtml5 },
  { name: 'CSS3', color: '#1572B6', icon: SiCss },
  { name: 'Node.js', color: '#5FA04E', icon: SiNodedotjs },
  { name: 'Express', color: '#FFFFFF', icon: SiExpress },
  { name: 'MongoDB', color: '#47A248', icon: SiMongodb },
  { name: 'Git', color: '#F05032', icon: SiGit },
  { name: 'GitHub', color: '#F3F4F6', icon: SiGithub },
  { name: 'Figma', color: '#F24E1E', icon: SiFigma },
];
