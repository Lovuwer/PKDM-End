import {
  Calculator, LineChart, Landmark, BookOpen, Beaker, Globe2,
  Laptop2, Music, Palette, Dumbbell, Scale, Languages, Atom,
  PenTool, Binary, Microscope
} from 'lucide-react';

// Maps subject names (lowercase) to their specific lucide icon component
const SUBJECT_ICON_MAP: Record<string, React.ComponentType<any>> = {
  'mathematics': Calculator,
  'maths': Calculator,
  'economics': LineChart,
  'commerce': Landmark,
  'history': BookOpen,
  'chemistry': Beaker,
  'geography': Globe2,
  'computer science': Laptop2,
  'computers': Laptop2,
  'music': Music,
  'art': Palette,
  'physical education': Dumbbell,
  'political science': Scale,
  'english': Languages,
  'hindi': Languages,
  'malayalam': Languages,
  'physics': Atom,
  'literature': PenTool,
  'information technology': Binary,
  'biology': Microscope,
};

export function getSubjectIcon(subjectName: string) {
  const key = subjectName.toLowerCase().trim();
  return SUBJECT_ICON_MAP[key] || BookOpen;
}
