-- Insert new agent abilities across multiple categories

INSERT INTO abilities (name, description, category, prompt_template, icon) VALUES
-- Creativity (5 new)
('Story Generator', 'Generate creative stories and narratives based on prompts', 'creativity', 'You are a creative storyteller. Generate an engaging story based on: {prompt}', 'BookOpen'),
('Art Prompt Creator', 'Create detailed prompts for AI art generation', 'creativity', 'You are an AI art prompt expert. Create detailed art generation prompts for: {prompt}', 'Palette'),
('Poetry Writer', 'Compose poems in various styles and forms', 'creativity', 'You are a skilled poet. Write a poem about: {prompt}', 'Feather'),
('Music Composer', 'Suggest melodies, chord progressions, and musical ideas', 'creativity', 'You are a music composition assistant. Suggest musical ideas for: {prompt}', 'Music'),
('Creative Brainstorming', 'Generate unique ideas and innovative concepts', 'creativity', 'You are a creative brainstorming partner. Generate innovative ideas for: {prompt}', 'Lightbulb'),

-- Writing (5 new category)
('Essay Writer', 'Help draft academic and professional essays', 'writing', 'You are an essay writing assistant. Help write an essay about: {prompt}', 'FileText'),
('Email Composer', 'Write professional and personal emails', 'writing', 'You are a professional email writer. Compose an email for: {prompt}', 'Mail'),
('Content Editor', 'Review and improve written content', 'writing', 'You are a content editor. Review and improve this text: {prompt}', 'PenTool'),
('Blog Post Creator', 'Generate blog post ideas and drafts', 'writing', 'You are a blog writing expert. Create a blog post about: {prompt}', 'Edit3'),
('Grammar Checker', 'Check grammar, punctuation, and style', 'writing', 'You are a grammar expert. Check and improve this text: {prompt}', 'CheckCircle'),

-- Health (3 new)
('Nutrition Advisor', 'Provide healthy meal suggestions and nutrition tips', 'health', 'You are a nutrition advisor. Provide advice about: {prompt}', 'Apple'),
('Mental Health Support', 'Offer mindfulness and stress relief techniques', 'health', 'You are a mental wellness coach. Provide support for: {prompt}', 'Heart'),
('Sleep Optimizer', 'Suggest sleep improvement strategies', 'health', 'You are a sleep optimization expert. Help improve sleep for: {prompt}', 'Moon'),

-- Research (4 new category)
('Data Analyzer', 'Help analyze and interpret data patterns', 'research', 'You are a data analysis expert. Analyze this data: {prompt}', 'BarChart'),
('Citation Generator', 'Create proper citations in various formats', 'research', 'You are a citation expert. Generate citations for: {prompt}', 'Quote'),
('Literature Reviewer', 'Summarize and analyze research papers', 'research', 'You are a literature review expert. Review this paper: {prompt}', 'BookMarked'),
('Fact Checker', 'Verify information accuracy and sources', 'research', 'You are a fact-checking expert. Verify this information: {prompt}', 'Search'),

-- Study (4 new category)
('Study Guide Creator', 'Create comprehensive study materials', 'study', 'You are a study guide creator. Create study materials for: {prompt}', 'GraduationCap'),
('Quiz Generator', 'Generate practice questions and quizzes', 'study', 'You are a quiz generator. Create quiz questions about: {prompt}', 'HelpCircle'),
('Concept Explainer', 'Explain complex concepts in simple terms', 'study', 'You are a concept explainer. Explain this topic simply: {prompt}', 'Lightbulb'),
('Memory Techniques', 'Suggest mnemonic devices and memory aids', 'study', 'You are a memory technique expert. Create memory aids for: {prompt}', 'Brain'),

-- Code (4 new category)
('Code Debugger', 'Help identify and fix code issues', 'code', 'You are a debugging expert. Help debug this code: {prompt}', 'Bug'),
('Code Reviewer', 'Review code quality and best practices', 'code', 'You are a code reviewer. Review this code: {prompt}', 'Code'),
('Algorithm Designer', 'Suggest algorithmic approaches and solutions', 'code', 'You are an algorithm expert. Design an algorithm for: {prompt}', 'GitBranch'),
('Documentation Writer', 'Write clear technical documentation', 'code', 'You are a documentation expert. Document this code: {prompt}', 'FileCode'),

-- Personal Life (4 new category)
('Budget Planner', 'Help manage personal finances and budgets', 'personal', 'You are a budget planning assistant. Help plan finances for: {prompt}', 'DollarSign'),
('Travel Planner', 'Create detailed travel itineraries', 'personal', 'You are a travel planning expert. Create an itinerary for: {prompt}', 'Plane'),
('Recipe Finder', 'Suggest recipes based on ingredients', 'personal', 'You are a recipe expert. Suggest recipes using: {prompt}', 'ChefHat'),
('Gift Suggester', 'Recommend personalized gift ideas', 'personal', 'You are a gift suggestion expert. Suggest gifts for: {prompt}', 'Gift'),

-- Motivation (4 new)
('Daily Affirmations', 'Provide motivational affirmations and encouragement', 'motivation', 'You are a motivational coach. Provide daily affirmations for: {prompt}', 'Sparkles'),
('Success Story Sharer', 'Share inspiring success stories', 'motivation', 'You are an inspiration expert. Share success stories about: {prompt}', 'Trophy'),
('Habit Builder', 'Help build and maintain positive habits', 'motivation', 'You are a habit formation coach. Help build habits for: {prompt}', 'Target'),
('Confidence Booster', 'Provide encouragement and confidence building', 'motivation', 'You are a confidence coach. Provide encouragement for: {prompt}', 'Zap'),

-- Productivity (3 new)
('Meeting Summarizer', 'Summarize meetings and extract action items', 'productivity', 'You are a meeting summarizer. Summarize this meeting: {prompt}', 'Users'),
('Goal Tracker', 'Track and break down long-term goals', 'productivity', 'You are a goal tracking expert. Help track goals for: {prompt}', 'Target'),
('Focus Timer', 'Suggest focus techniques and time management', 'productivity', 'You are a focus and time management expert. Help with: {prompt}', 'Clock')
ON CONFLICT DO NOTHING;