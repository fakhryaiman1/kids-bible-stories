export type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
  sort_order: number;
  created_at?: string;
};

export type Story = {
  id: string;
  title: string;
  slug: string;
  description: string;
  cover_image?: string;
  category_id?: string;
  age_group: string;
  testament: string;
  reading_time: number;
  difficulty: string;
  featured: boolean;
  published: boolean;
  created_at?: string;
  updated_at?: string;
  categories?: Category;
};

export type StoryPage = {
  id: string;
  story_id: string;
  page_number: number;
  title?: string;
  content: string;
  image?: string;
  audio?: string;
  animation?: string;
  created_at?: string;
};

export type QuizOption = {
  id: string;
  quiz_id: string;
  option_text: string;
  option_image?: string;
  is_correct: boolean;
  created_at?: string;
};

export type Quiz = {
  id: string;
  story_id: string;
  question: string;
  type: 'multiple_choice' | 'true_false';
  correct_answer?: string;
  explanation?: string;
  sort_order: number;
  created_at?: string;
  quiz_options?: QuizOption[];
};

export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  required_points: number;
  required_stories: number;
  created_at?: string;
};

export type Profile = {
  id: string;
  name?: string;
  avatar?: string;
  email?: string;
  stars: number;
  completed_stories: number;
  reading_streak: number;
  role: 'admin' | 'editor' | 'user';
  created_at?: string;
};

export type UserProgress = {
  id?: string;
  user_id: string;
  story_id: string;
  current_page: number;
  completed: boolean;
  quiz_score: number;
  stars: number;
  last_read?: string;
  created_at?: string;
};

export type Favorite = {
  id?: string;
  user_id: string;
  story_id: string;
  created_at?: string;
};

export type Announcement = {
  id: string;
  title: string;
  body: string;
  created_at?: string;
};
