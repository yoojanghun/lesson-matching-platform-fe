export interface Tutor {
  id: number;
  name: string;
  subject: string;
  rating: number;
  reviewCount: number;
  price: number;
  image: string;
  bio: string;
  education: string;
  experience: string;
  fullBio: string;
  studentsCount: number;
  availability: string[];
}

export interface Review {
  id: number;
  tutorId: number;
  studentName: string;
  rating: number;
  content: string;
  date: string;
}

export interface Matching {
  id: number;
  tutorId: number;
  tutorName: string;
  studentName: string;
  subject: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  message: string;
  schedule: string;
  date: string;
}

export const MOCK_CATEGORIES = ['English', 'Math', 'Science', 'Programming', 'Music', 'Art'];

export const MOCK_TUTORS: Tutor[] = [
  {
    id: 1,
    name: 'Alice Smith',
    subject: 'English',
    rating: 4.8,
    reviewCount: 124,
    price: 30,
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&q=80',
    bio: 'Passionate English educator with 5+ years of experience helping students master conversational fluency and prepare for official tests.',
    education: 'M.A. in Applied Linguistics, Boston University',
    experience: '5+ years in teaching, former IELTS examiner',
    fullBio: 'Hello! I am Alice, a dedicated English educator. I specialize in customized lesson plans focusing on conversational practice, pronunciation correction, and business English. My class environment is highly interactive, supportive, and structured to help you gain confidence rapidly. I look forward to working with you!',
    studentsCount: 24,
    availability: ['Mon Morning', 'Wed Evening', 'Fri Afternoon']
  },
  {
    id: 2,
    name: 'Bob Johnson',
    subject: 'Math',
    rating: 4.9,
    reviewCount: 89,
    price: 40,
    image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=300&h=300&fit=crop&q=80',
    bio: 'Calculus and Algebra specialist. I simplify complex formulas and help build a solid mathematical foundation.',
    education: 'B.S. in Mathematics, UCLA',
    experience: '4 years of high school tutoring',
    fullBio: 'Hey there! I am Bob, and I love math. I know math can be intimidating, but my goal is to break down complex concepts into bite-sized, logical steps. Whether you are struggling with basic algebra or advanced calculus, I will help you master the material and excel in your exams. Let\'s conquer math together!',
    studentsCount: 18,
    availability: ['Tue Evening', 'Thu Evening', 'Sat Morning']
  },
  {
    id: 3,
    name: 'Charlie Lee',
    subject: 'Programming',
    rating: 5.0,
    reviewCount: 200,
    price: 50,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&q=80',
    bio: 'Senior Software Engineer tutoring Full Stack Web Development (React, Node.js, Python). Practical project-based learning.',
    education: 'M.S. in Computer Science, Stanford University',
    experience: '8 years in tech industry, 3 years online mentor',
    fullBio: 'Hi! I am Charlie, a software engineer and mentor. I believe the best way to learn programming is by building real-world projects. I tutor JavaScript, React, Node.js, Python, and data structures. My lessons are tailored to your pace, whether you are a complete beginner or looking to advance your career in tech.',
    studentsCount: 32,
    availability: ['Mon Evening', 'Thu Evening', 'Sat Afternoon', 'Sun Morning']
  },
  {
    id: 4,
    name: 'Diana Prince',
    subject: 'Science',
    rating: 4.7,
    reviewCount: 56,
    price: 35,
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&q=80',
    bio: 'Biology and Chemistry enthusiast. Creating visual and interactive models for memorable science learning.',
    education: 'Ph.D. in Biochemistry, University of Toronto',
    experience: '6 years of college teaching assistantship',
    fullBio: 'Welcome! I am Diana. I teach Chemistry and Biology with a strong focus on conceptual clarity. I make use of 3D diagrams, simulations, and real-life analogies to make science fascinating and easy to remember. I also help prepare for SAT/AP Subject Tests in Science.',
    studentsCount: 15,
    availability: ['Tue Afternoon', 'Wed Afternoon', 'Fri Evening']
  }
];

export const MOCK_REVIEWS: Review[] = [
  { id: 1, tutorId: 1, studentName: 'John D.', rating: 5, content: 'Excellent tutor! Explains complex topics simply.', date: '2023-10-01' },
  { id: 2, tutorId: 1, studentName: 'Sarah M.', rating: 4, content: 'Very helpful, highly recommended. Pronunciation practice was outstanding.', date: '2023-09-28' },
  { id: 3, tutorId: 1, studentName: 'Mike R.', rating: 5, content: 'Improved my grades significantly. Alice is very patient.', date: '2023-09-15' },
  { id: 4, tutorId: 2, studentName: 'David K.', rating: 5, content: 'Bob made calculus actually fun. Highly recommended!', date: '2023-10-05' },
  { id: 5, tutorId: 3, studentName: 'Anna W.', rating: 5, content: 'Charlie is the absolute best. Landing my frontend developer internship because of him!', date: '2023-10-12' },
];

export const INITIAL_MATCHINGS: Matching[] = [
  { id: 101, tutorId: 1, tutorName: 'Alice Smith', studentName: 'You', subject: 'English', status: 'PENDING', message: 'I need help preparing for the IELTS speaking test next month.', schedule: 'Wed Evening', date: 'Oct 24, 2023' },
  { id: 102, tutorId: 3, tutorName: 'Charlie Lee', studentName: 'You', subject: 'Programming', status: 'ACCEPTED', message: 'I want to build a Next.js portfolio website.', schedule: 'Mon Evening', date: 'Oct 20, 2023' },
  { id: 103, tutorId: 4, tutorName: 'Diana Prince', studentName: 'You', subject: 'Science', status: 'REJECTED', message: 'Struggling with AP Chemistry chemistry equations.', schedule: 'Tue Afternoon', date: 'Oct 15, 2023' }
];

export const INITIAL_TUTOR_MATCHINGS: Matching[] = [
  { id: 201, tutorId: 1, tutorName: 'Alice Smith', studentName: 'John Doe', subject: 'English', status: 'PENDING', message: 'I need help preparing for IELTS.', schedule: 'Mon Morning', date: 'Oct 25, 2023' },
  { id: 202, tutorId: 1, tutorName: 'Alice Smith', studentName: 'Sarah M.', subject: 'English', status: 'ACCEPTED', message: 'Looking for conversational practice.', schedule: 'Wed Evening', date: 'Oct 22, 2023' }
];
