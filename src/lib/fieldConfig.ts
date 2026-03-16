// Dynamic field label configuration per subject
// Math teachers see "Problem Solving Focus", English teachers see "Reading Comprehension Strategy", etc.

interface FieldLabels {
  learningObjective: string;
  teachingMethod: string;
  field1: string;
  field2: string;
  field3: string;
  field4: string;
}

const SUBJECT_FIELD_CONFIG: Record<string, FieldLabels> = {
  'Mathematics': {
    learningObjective: 'Learning Objective',
    teachingMethod: 'Teaching Method',
    field1: 'Problem Solving Focus',
    field2: 'Worked Examples',
    field3: 'Practice Set / Worksheet',
    field4: 'Common Misconceptions to Address',
  },
  'Math': {
    learningObjective: 'Learning Objective',
    teachingMethod: 'Teaching Method',
    field1: 'Problem Solving Focus',
    field2: 'Worked Examples',
    field3: 'Practice Set / Worksheet',
    field4: 'Common Misconceptions to Address',
  },
  'English': {
    learningObjective: 'Learning Outcome',
    teachingMethod: 'Pedagogical Approach',
    field1: 'Reading Comprehension Strategy',
    field2: 'Writing Activity',
    field3: 'Vocabulary & Grammar Focus',
    field4: 'Speaking / Listening Task',
  },
  'English Literature': {
    learningObjective: 'Learning Outcome',
    teachingMethod: 'Pedagogical Approach',
    field1: 'Text / Chapter Analysis',
    field2: 'Writing Activity',
    field3: 'Vocabulary & Grammar Focus',
    field4: 'Creative Response Task',
  },
  'Physics': {
    learningObjective: 'Conceptual Objective',
    teachingMethod: 'Teaching Method',
    field1: 'Key Formulae / Laws',
    field2: 'Lab / Experiment Plan',
    field3: 'Numerical Problem Set',
    field4: 'Real-World Application',
  },
  'Chemistry': {
    learningObjective: 'Conceptual Objective',
    teachingMethod: 'Teaching Method',
    field1: 'Reactions / Equations Focus',
    field2: 'Lab / Experiment Plan',
    field3: 'Problem Set',
    field4: 'Safety Notes & Applications',
  },
  'Biology': {
    learningObjective: 'Conceptual Objective',
    teachingMethod: 'Teaching Method',
    field1: 'Diagram / Visual Aid',
    field2: 'Lab / Observation Activity',
    field3: 'Key Terminology',
    field4: 'Health / Environmental Link',
  },
  'History': {
    learningObjective: 'Learning Objective',
    teachingMethod: 'Teaching Method',
    field1: 'Primary Source / Document',
    field2: 'Timeline Activity',
    field3: 'Discussion Prompt',
    field4: 'Assessment / Map Work',
  },
  'Geography': {
    learningObjective: 'Learning Objective',
    teachingMethod: 'Teaching Method',
    field1: 'Map Work / Diagram',
    field2: 'Case Study',
    field3: 'Field Data Activity',
    field4: 'Environmental Awareness Link',
  },
  'Economics': {
    learningObjective: 'Learning Objective',
    teachingMethod: 'Teaching Method',
    field1: 'Graph / Data Analysis',
    field2: 'Case Study / Current Event',
    field3: 'Problem Set',
    field4: 'Discussion / Debate Topic',
  },
  'Commerce': {
    learningObjective: 'Learning Objective',
    teachingMethod: 'Teaching Method',
    field1: 'Practical Application',
    field2: 'Case Study',
    field3: 'Accounting Exercise',
    field4: 'Assessment Method',
  },
};

const DEFAULT_LABELS: FieldLabels = {
  learningObjective: 'Learning Objective',
  teachingMethod: 'Teaching Method',
  field1: 'Resources / Materials',
  field2: 'Assessment Method',
  field3: 'Homework Assigned',
  field4: 'Differentiation Strategy',
};

export function getFieldLabels(subject: string): FieldLabels {
  if (!subject) return DEFAULT_LABELS;
  if (SUBJECT_FIELD_CONFIG[subject]) return SUBJECT_FIELD_CONFIG[subject];
  const lower = subject.toLowerCase();
  for (const [key, labels] of Object.entries(SUBJECT_FIELD_CONFIG)) {
    if (key.toLowerCase() === lower) return labels;
  }
  for (const [key, labels] of Object.entries(SUBJECT_FIELD_CONFIG)) {
    if (lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower)) {
      return labels;
    }
  }
  return DEFAULT_LABELS;
}
