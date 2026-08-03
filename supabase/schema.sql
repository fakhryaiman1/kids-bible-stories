create extension if not exists pgcrypto;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  icon text not null default '📖',
  color text not null default '#38bdf8',
  sort_order integer not null default 0,
  created_at timestamptz default now()
);

create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text not null,
  cover_image text,
  category_id uuid references public.categories(id) on delete set null,
  age_group text not null default 'أطفال',
  testament text not null default 'العهد القديم',
  reading_time integer not null default 5,
  difficulty text not null default 'مبتدئ',
  featured boolean not null default false,
  published boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.story_pages (
  id uuid primary key default gen_random_uuid(),
  story_id uuid references public.stories(id) on delete cascade,
  page_number integer not null,
  title text,
  content text not null,
  image text,
  audio text,
  animation text default 'fade',
  created_at timestamptz default now()
);

create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  story_id uuid references public.stories(id) on delete cascade,
  question text not null,
  type text not null default 'multiple_choice',
  correct_answer text,
  explanation text,
  sort_order integer not null default 0,
  created_at timestamptz default now()
);

create table if not exists public.quiz_options (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid references public.quizzes(id) on delete cascade,
  option_text text not null,
  option_image text,
  is_correct boolean not null default false,
  created_at timestamptz default now()
);

create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  icon text not null default '🏅',
  required_points integer default 0,
  required_stories integer default 0,
  created_at timestamptz default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  avatar text,
  email text,
  stars integer default 0,
  completed_stories integer default 0,
  reading_streak integer default 0,
  created_at timestamptz default now()
);

create table if not exists public.user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  story_id uuid references public.stories(id) on delete cascade,
  current_page integer default 1,
  completed boolean default false,
  quiz_score integer default 0,
  stars integer default 0,
  last_read timestamptz default now(),
  created_at timestamptz default now()
);

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  story_id uuid references public.stories(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, story_id)
);

create table if not exists public.admin_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  role text not null default 'editor',
  created_at timestamptz default now()
);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  created_at timestamptz default now()
);

create index if not exists stories_slug_idx on public.stories(slug);
create index if not exists stories_featured_idx on public.stories(featured);
create index if not exists story_pages_story_id_idx on public.story_pages(story_id);
create index if not exists quizz_story_id_idx on public.quizzes(story_id);
create index if not exists user_progress_user_id_idx on public.user_progress(user_id);

alter table public.categories enable row level security;
alter table public.stories enable row level security;
alter table public.story_pages enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_options enable row level security;
alter table public.achievements enable row level security;
alter table public.profiles enable row level security;
alter table public.user_progress enable row level security;
alter table public.favorites enable row level security;
alter table public.admin_roles enable row level security;
alter table public.announcements enable row level security;

create policy categories_read_all on public.categories for select using (true);
create policy stories_read_all on public.stories for select using (published = true or auth.uid() is not null);
create policy story_pages_read_all on public.story_pages for select using (true);
create policy quizzes_read_all on public.quizzes for select using (true);
create policy quiz_options_read_all on public.quiz_options for select using (true);
create policy achievements_read_all on public.achievements for select using (true);
create policy profiles_read_own on public.profiles for select using (auth.uid() = id);
create policy profiles_update_own on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy user_progress_manage_own on public.user_progress for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy favorites_manage_own on public.favorites for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy announcements_read_all on public.announcements for select using (true);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email)
  values (new.id, new.raw_user_meta_data->>'name', new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

insert into public.categories (name, icon, color, sort_order) values
  ('العهد القديم', '📜', '#38bdf8', 1),
  ('العهد الجديد', '✨', '#fb923c', 2),
  ('أنبياء', '🕊️', '#14b8a6', 3),
  ('ملوك', '👑', '#a78bfa', 4),
  ('معجزات', '⭐', '#f59e0b', 5),
  ('أمثال', '🌱', '#4ade80', 6),
  ('محبة', '💛', '#f472b6', 7),
  ('إيمان', '🕯️', '#94a3b8', 8),
  ('أطفال', '🧸', '#ef4444', 9);

insert into public.achievements (title, description, icon, required_points, required_stories) values
  ('أول قصة', 'أكملت أول قصة', '🌟', 1, 1),
  ('أول اختبار', 'أكملت أول اختبار', '🎯', 3, 0),
  ('5 قصص', 'أكملت 5 قصص', '📚', 5, 5),
  ('10 قصص', 'أكملت 10 قصص', '🏅', 10, 10),
  ('20 قصة', 'أكملت 20 قصة', '👑', 20, 20),
  ('قارئ صغير', 'قرأ 10 صفحات', '🧒', 10, 0),
  ('بطل الكتاب المقدس', 'جمع 100 نجمة', '🏆', 100, 0);

insert into public.stories (title, slug, description, category_id, age_group, testament, reading_time, difficulty, featured, published) values
  ('داود والعملاق', 'david-and-goliath', 'قصة شجاعة داود في مواجهة العملاق', (select id from public.categories where name='العهد القديم'), '7-12', 'العهد القديم', 6, 'متوسط', true, true),
  ('الطفل يسوع', 'baby-jesus', 'قصة ميلاد يسوع في بيت لحم', (select id from public.categories where name='العهد الجديد'), '3-6', 'العهد الجديد', 4, 'سهل', true, true),
  ('المسيح يطهر البحر', 'jesus-calms-the-sea', 'قصة سلام المسيح على العاصفة', (select id from public.categories where name='معجزات'), '7-12', 'العهد الجديد', 5, 'متوسط', false, true),
  ('الولد الضائع', 'prodigal-son', 'قصة الابن الضائع والعودة إلى البيت', (select id from public.categories where name='أمثال'), '7-12', 'العهد الجديد', 5, 'متوسط', false, true),
  ('إسحاق والبركة', 'isaac-and-blessing', 'قصة البركة التي وصلته من الله', (select id from public.categories where name='العهد القديم'), '7-12', 'العهد القديم', 6, 'متوسط', false, true),
  ('الرب يسوع يشفى', 'jesus-heals', 'قصة الشفاء والرحمة', (select id from public.categories where name='معجزات'), '7-12', 'العهد الجديد', 5, 'متوسط', false, true),
  ('سليمان والحكمة', 'solomon-and-wisdom', 'قصة سليمان والحكمة من الله', (select id from public.categories where name='ملوك'), '7-12', 'العهد القديم', 6, 'متوسط', false, true),
  ('نوح والسفينة', 'noah-and-the-ark', 'قصة نوح وسفينة السلام', (select id from public.categories where name='العهد القديم'), '3-6', 'العهد القديم', 4, 'سهل', true, true),
  ('موسى والقديمة', 'moses-and-the-red-sea', 'قصة معجزة البحر الأحمر', (select id from public.categories where name='معجزات'), '7-12', 'العهد القديم', 6, 'متوسط', false, true),
  ('يوحنا المعمدان', 'john-the-baptist', 'قصة يوحنا ونداء التوبة', (select id from public.categories where name='أنبياء'), '7-12', 'العهد الجديد', 5, 'متوسط', false, true),
  ('سامسون والقوة', 'samson-and-strength', 'قصة القائد القوي الذي سقط بالضعف', (select id from public.categories where name='العهد القديم'), '7-12', 'العهد القديم', 6, 'متوسط', false, true),
  ('الجمعة العظيمة', 'good-friday', 'قصة الحب الذي لا ينتهي', (select id from public.categories where name='محبة'), '7-12', 'العهد الجديد', 5, 'متوسط', false, true),
  ('النجاة في الصحراء', 'desert-survival', 'قصة العناية الإلهية في البرية', (select id from public.categories where name='إيمان'), '7-12', 'العهد القديم', 6, 'متوسط', false, true),
  ('أطفال يسوع', 'jesus-children', 'قصة حب يسوع للأطفال', (select id from public.categories where name='أطفال'), '3-6', 'العهد الجديد', 4, 'سهل', false, true),
  ('المرأة عند البئر', 'woman-at-the-well', 'قصة محبة يسوع للمرأة', (select id from public.categories where name='محبة'), '7-12', 'العهد الجديد', 5, 'متوسط', false, true),
  ('النجمة المضيئة', 'star-of-bethlehem', 'قصة النجم الذي أضاء الطريق', (select id from public.categories where name='معجزات'), '3-6', 'العهد الجديد', 4, 'سهل', false, true),
  ('إيليا على الجبل', 'elijah-on-mount', 'قصة إيليا والرب في العاصفة', (select id from public.categories where name='أنبياء'), '7-12', 'العهد القديم', 6, 'متوسط', false, true),
  ('الزيت والقدرة', 'oil-and-power', 'قصة الزيت الذي أضاء البيت', (select id from public.categories where name='إيمان'), '3-6', 'العهد القديم', 4, 'سهل', false, true),
  ('الخير في القلب', 'good-in-heart', 'قصة القلب الطيب والنعمة', (select id from public.categories where name='محبة'), '7-12', 'العهد الجديد', 5, 'متوسط', false, true),
  ('ياقوت وبيت السلام', 'joseph-and-peace', 'قصة يوسف وحلم السلام', (select id from public.categories where name='العهد القديم'), '7-12', 'العهد القديم', 6, 'متوسط', false, true);

insert into public.story_pages (story_id, page_number, title, content, image) values
  ((select id from public.stories where slug='david-and-goliath'), 1, 'أول لقاء', 'كان داود صغيرًا لكنه كان يثق بالله.', 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=900&q=80'),
  ((select id from public.stories where slug='david-and-goliath'), 2, 'الاختبار', 'برز داود في مواجهة العملاق بص courage.', 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=900&q=80'),
  ((select id from public.stories where slug='baby-jesus'), 1, 'ميلاد يسوع', 'وُلد يسوع في بيت لحم في ليلة هادئة.', 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80'),
  ((select id from public.stories where slug='baby-jesus'), 2, 'المجوس', 'جاء المجوس يحملون هدايا كبيرة.', 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80'),
  ((select id from public.stories where slug='noah-and-the-ark'), 1, 'نداء نوح', 'أمر الله نوحًا ببناء سفينة عظيمة.', 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=900&q=80');

insert into public.quizzes (story_id, question, type, correct_answer, explanation, sort_order) values
  ((select id from public.stories where slug='david-and-goliath'), 'من كان يجلس في قلب القصة؟', 'multiple_choice', 'داود', 'داود كان الشجاع الذي وثق بالله.', 1),
  ((select id from public.stories where slug='david-and-goliath'), 'هل كان داود صغيرًا؟', 'true_false', 'true', 'داود كان شابًا صغيرًا عندما واجه العملاق.', 2),
  ((select id from public.stories where slug='baby-jesus'), 'أين وُلد يسوع؟', 'multiple_choice', 'بيت لحم', 'ولد يسوع في بيت لحم.', 1);

insert into public.quiz_options (quiz_id, option_text, is_correct) values
  ((select id from public.quizzes where story_id=(select id from public.stories where slug='david-and-goliath') and question='من كان يجلس في قلب القصة؟'), 'داود', true),
  ((select id from public.quizzes where story_id=(select id from public.stories where slug='david-and-goliath') and question='من كان يجلس في قلب القصة؟'), 'غوليات', false),
  ((select id from public.quizzes where story_id=(select id from public.stories where slug='david-and-goliath') and question='من كان يجلس في قلب القصة؟'), 'سليمان', false),
  ((select id from public.quizzes where story_id=(select id from public.stories where slug='david-and-goliath') and question='هل كان داود صغيرًا؟'), 'صح', true),
  ((select id from public.quizzes where story_id=(select id from public.stories where slug='david-and-goliath') and question='هل كان داود صغيرًا؟'), 'خطأ', false),
  ((select id from public.quizzes where story_id=(select id from public.stories where slug='baby-jesus') and question='أين وُلد يسوع؟'), 'بيت لحم', true),
  ((select id from public.quizzes where story_id=(select id from public.stories where slug='baby-jesus') and question='أين وُلد يسوع؟'), 'نهر الأردن', false),
  ((select id from public.quizzes where story_id=(select id from public.stories where slug='baby-jesus') and question='أين وُلد يسوع؟'), 'القدس', false);
