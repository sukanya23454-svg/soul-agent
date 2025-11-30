-- Add agent_type column to agents table
ALTER TABLE public.agents
ADD COLUMN IF NOT EXISTS agent_type TEXT DEFAULT 'general';

-- Insert Study Agent abilities (only new ones)
INSERT INTO public.abilities (name, description, category, prompt_template)
SELECT * FROM (VALUES
  ('Flashcard Generator', 'Creates numbered flashcards in Q:/A: format from any content', 'study', 'Generate flashcards from this content. Format each as:\n\nCard 1:\nQ: [question]\nA: [answer]\n\nCreate clear, concise flashcards that test key concepts.'),
  ('ELI5 Explainer', 'Explains complex topics in simple terms (ELI5 style)', 'study', 'Explain this concept in very simple terms, as if explaining to a 5-year-old. Use short sentences, simple words, and everyday examples.')
) AS new_abilities(name, description, category, prompt_template)
WHERE NOT EXISTS (
  SELECT 1 FROM public.abilities WHERE abilities.name = new_abilities.name
);

-- Insert Analytics Agent abilities
INSERT INTO public.abilities (name, description, category, prompt_template)
SELECT * FROM (VALUES
  ('Chart Generator', 'Converts data into visualizations and chart suggestions', 'analytics', 'Analyze this data and suggest appropriate chart types. Provide the data structure needed for visualization. Specify chart type (line, bar, pie, etc.) and key insights.'),
  ('Trend Predictor', 'Analyzes patterns and provides trend predictions', 'analytics', 'Analyze the trends in this data. Provide:\n1. Current trend analysis\n2. Key patterns identified\n3. Prediction for future direction\n4. Confidence level\nKeep predictions realistic and data-driven.'),
  ('Data Summarizer', 'Creates executive summaries from complex datasets', 'analytics', 'Summarize this data in a clear, actionable format. Include key metrics, notable changes, and business insights.')
) AS new_abilities(name, description, category, prompt_template)
WHERE NOT EXISTS (
  SELECT 1 FROM public.abilities WHERE abilities.name = new_abilities.name
);

-- Insert Fitness Agent abilities
INSERT INTO public.abilities (name, description, category, prompt_template)
SELECT * FROM (VALUES
  ('Custom Workout Plans', 'Creates personalized workout plans based on goals', 'fitness', 'Create a workout plan based on the user''s goals, fitness level, and available equipment. Include:\n- Exercise names\n- Sets and reps\n- Rest periods\n- Weekly schedule\nKeep it achievable and progressive.'),
  ('Calorie Plan Generator', 'Generates meal and calorie planning suggestions', 'fitness', 'Create a calorie and nutrition plan based on the user''s goals. Include:\n- Daily calorie target\n- Macro breakdown (protein, carbs, fats)\n- Meal timing suggestions\n- Sample meal ideas\nBe realistic and sustainable.'),
  ('Fitness Habit Tracker', 'Suggests fitness habits and tracking methods', 'fitness', 'Suggest specific, measurable fitness habits to track. For each habit:\n- Clear action item\n- How to measure progress\n- Frequency (daily/weekly)\n- Why it matters\nFocus on consistency over intensity.')
) AS new_abilities(name, description, category, prompt_template)
WHERE NOT EXISTS (
  SELECT 1 FROM public.abilities WHERE abilities.name = new_abilities.name
);

-- Insert Finance Agent abilities
INSERT INTO public.abilities (name, description, category, prompt_template)
SELECT * FROM (VALUES
  ('Budget Breakdown', 'Analyzes spending and creates budget categories', 'finance', 'Analyze the financial information and create a budget breakdown. Include:\n- Category allocations\n- Recommended percentages\n- Priority areas\n- Savings goals\nUse the 50/30/20 rule as a baseline.'),
  ('Spending Insights', 'Provides analysis and insights on spending patterns', 'finance', 'Analyze spending patterns and provide insights:\n- Top spending categories\n- Unusual patterns\n- Potential savings opportunities\n- Month-over-month changes\nBe specific and actionable.'),
  ('Financial Table Generator', 'Creates organized tables for financial data', 'finance', 'Organize this financial data into clear tables. Include:\n- Column headers\n- Calculated totals\n- Key ratios or percentages\n- Summary row\nFormat for easy reading and decision-making.')
) AS new_abilities(name, description, category, prompt_template)
WHERE NOT EXISTS (
  SELECT 1 FROM public.abilities WHERE abilities.name = new_abilities.name
);

-- Insert Content Creator Agent abilities
INSERT INTO public.abilities (name, description, category, prompt_template)
SELECT * FROM (VALUES
  ('Instagram Caption Generator', 'Creates engaging Instagram captions with hashtags', 'content', 'Create an engaging Instagram caption for this content. Include:\n- Hook (first line)\n- Value/story (middle)\n- Call-to-action (end)\n- 10-15 relevant hashtags\nKeep it authentic and on-brand.'),
  ('TikTok Script Generator', 'Generates short-form video scripts for TikTok', 'content', 'Create a TikTok script (15-60 seconds). Format:\n[HOOK - 0:00-0:03]\n[VALUE - 0:03-0:45]\n[CTA - 0:45-0:60]\n\nInclude visual cues and text overlay suggestions. Keep it fast-paced and engaging.'),
  ('Hook & CTA Templates', 'Provides attention-grabbing hooks and calls-to-action', 'content', 'Generate 5 hook options and 3 CTA options for this content.\n\nHOOKS:\n1. [hook]\n2. [hook]\n...\n\nCTAs:\n1. [call to action]\n2. [call to action]\n...\n\nMake hooks curiosity-driven and CTAs specific.')
) AS new_abilities(name, description, category, prompt_template)
WHERE NOT EXISTS (
  SELECT 1 FROM public.abilities WHERE abilities.name = new_abilities.name
);