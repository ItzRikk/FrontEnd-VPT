-- Database schema for Experience Questionnaire

-- Users table
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Questions table
CREATE TABLE questions (
    question_id VARCHAR(50) PRIMARY KEY,
    question_text TEXT NOT NULL,
    question_description TEXT,
    question_order INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Options table
CREATE TABLE options (
    option_id VARCHAR(50) PRIMARY KEY,
    question_id VARCHAR(50) REFERENCES questions(question_id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    points INT NOT NULL,
    option_icon VARCHAR(20),
    option_order INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Experience levels table
CREATE TABLE experience_levels (
    level_id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(50) NOT NULL,
    min_points INT NOT NULL,
    max_points INT NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User questionnaire sessions
CREATE TABLE questionnaire_sessions (
    session_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    total_score INT NOT NULL,
    experience_level_id VARCHAR(50) REFERENCES experience_levels(level_id),
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User responses to individual questions
CREATE TABLE user_responses (
    response_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES questionnaire_sessions(session_id) ON DELETE CASCADE,
    question_id VARCHAR(50) REFERENCES questions(question_id),
    selected_option_id VARCHAR(50) REFERENCES options(option_id),
    points_awarded INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial questions data
INSERT INTO questions (question_id, question_text, question_description, question_order)
VALUES 
('q_formal_coaching', 'Have you ever received formal coaching or instruction on lifting weights?', '(Examples: PE class, personal trainer, sports coach)', 1),
('q_experience_level', 'How would you describe your current experience with weight lifting?', '', 2);

-- Insert options for the first question
INSERT INTO options (option_id, question_id, option_text, points, option_icon, option_order)
VALUES 
('q1_opt1', 'q_formal_coaching', 'Yes', 1, '✓', 1),
('q1_opt2', 'q_formal_coaching', 'No', 0, '✕', 2);

-- Insert options for the second question
INSERT INTO options (option_id, question_id, option_text, points, option_icon, option_order)
VALUES 
('q2_opt1', 'q_experience_level', 'I''m new and need help learning how to lift correctly.', 1, '🔰', 1),
('q2_opt2', 'q_experience_level', 'I can use machines or do bodyweight exercises, but I''m unsure about dumbbells and barbells.', 2, '⚙️', 2),
('q2_opt3', 'q_experience_level', 'I''m confident with some basic movements like squats, lunges, push-ups, or bench press, but I need help with barbell exercises like back squats or deadlifts.', 3, '💪', 3),
('q2_opt4', 'q_experience_level', 'I''m confident doing advanced exercises like barbell squats, deadlifts, and bent-over rows with proper technique.', 4, '🏆', 4);

-- Insert experience levels
INSERT INTO experience_levels (level_id, title, min_points, max_points, description, icon)
VALUES 
('NOVICE', 'Novice', 0, 3, 'You''re new to weight training or have limited experience. You''ll benefit from learning proper techniques.', '🔰'),
('INTERMEDIATE', 'Intermediate', 4, 4, 'You have some experience but could use guidance with more complex lifts.', '💪'),
('ADVANCED', 'Advanced', 5, 10, 'You''re experienced with proper form on complex lifts and ready for advanced training.', '🏆');

-- Example query: Get a user's most recent experience level
-- SELECT u.name, el.title AS experience_level, qs.total_score, qs.completed_at
-- FROM users u
-- JOIN questionnaire_sessions qs ON u.user_id = qs.user_id
-- JOIN experience_levels el ON qs.experience_level_id = el.level_id
-- WHERE u.user_id = 'some-user-id'
-- ORDER BY qs.completed_at DESC
-- LIMIT 1;

-- Example query: Get all responses from a session
-- SELECT q.question_text, o.option_text, ur.points_awarded
-- FROM user_responses ur
-- JOIN questions q ON ur.question_id = q.question_id
-- JOIN options o ON ur.selected_option_id = o.option_id
-- WHERE ur.session_id = 'some-session-id'
-- ORDER BY q.question_order; 