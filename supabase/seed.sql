-- ============================================================
-- seed.sql — Initial data for Exam League
-- Run AFTER all migrations are applied.
-- ============================================================

-- ============================================================
-- SUBJECTS — 2nd Year (Semester 3 & 4, CSE/IT/ECE)
-- ============================================================

INSERT INTO public.subjects (name, code, year, semester, branch, description, icon_emoji, sort_order) VALUES
  -- Semester 4 Core
  ('Operating Systems',        'JCS-403', 2, 4, 'CSE', 'Process management, memory management, file systems, deadlock, scheduling algorithms.', '💻', 1),
  ('Computer Networks',        'JCS-405', 2, 4, 'CSE', 'OSI model, TCP/IP, routing protocols, subnetting, network security basics.', '📡', 2),
  ('Database Management Systems','JCS-401', 2, 4, 'CSE', 'SQL, normalization, transactions, ER diagrams, indexing, ACID properties.', '🗃️', 3),
  ('Software Engineering',     'JCS-407', 2, 4, 'CSE', 'SDLC models, agile, requirement engineering, software testing, UML diagrams.', '⚙️', 4),
  ('Theory of Automata',       'JCS-409', 2, 4, 'CSE', 'Finite automata, pushdown automata, Turing machines, regular and context-free grammars.', '🔬', 5),
  ('Microprocessors',          'JCS-411', 2, 4, 'CSE', '8085/8086 architecture, instruction set, interfacing, memory organisation.', '🔧', 6),

  -- Semester 3 Core
  ('Object Oriented Programming in Java', 'JCS-301', 2, 3, 'CSE', 'OOP concepts, inheritance, polymorphism, interfaces, collections, exception handling.', '☕', 7),
  ('Computer Organization & Architecture', 'JCS-303', 2, 3, 'CSE', 'ALU design, instruction formats, pipelining, memory hierarchy, I/O organisation.', '🖥️', 8),
  ('Discrete Mathematics',     'JMA-301', 2, 3, 'ALL', 'Sets, relations, graph theory, combinatorics, logic, number theory, proof techniques.', '🔢', 9),
  ('Data Structures & Algorithms', 'JCS-305', 2, 3, 'CSE', 'Arrays, linked lists, trees, graphs, sorting, searching, dynamic programming.', '📊', 10),

  -- ECE / IT variants
  ('Digital Electronics',      'JEC-301', 2, 3, 'ECE', 'Logic gates, Boolean algebra, combinational and sequential circuits, flip-flops.', '⚡', 11),
  ('Signals & Systems',        'JEC-303', 2, 3, 'ECE', 'Continuous and discrete signals, Fourier and Laplace transforms, Z-transforms.', '〰️', 12)

ON CONFLICT DO NOTHING;


-- ============================================================
-- SUBJECTS — 1st Year (placeholder, content added in Phase 1.5)
-- ============================================================

INSERT INTO public.subjects (name, code, year, semester, branch, description, icon_emoji, sort_order) VALUES
  ('Engineering Mathematics I',   'JMA-101', 1, 1, 'ALL', 'Calculus, matrices, differential equations, sequences and series.', '📐', 1),
  ('Engineering Chemistry',       'JCH-101', 1, 1, 'ALL', 'Atomic structure, electrochemistry, polymers, nanomaterials.', '⚗️', 2),
  ('Basic Electronics Engineering','JEC-101',1, 2, 'ALL', 'Semiconductor devices, diodes, transistors, basic amplifiers.', '🔌', 3),
  ('Engineering Physics',         'JPH-101', 1, 1, 'ALL', 'Mechanics, optics, quantum physics, thermodynamics.', '🔭', 4),
  ('Programming Fundamentals (C)','JCS-101', 1, 2, 'ALL', 'C language basics, control flow, functions, pointers, arrays.', '💾', 5),
  ('Engineering Mathematics II',  'JMA-201', 1, 2, 'ALL', 'Vector calculus, complex analysis, probability and statistics.', '📏', 6)

ON CONFLICT DO NOTHING;


-- ============================================================
-- SAMPLE QUIZZES (for seeding before launch)
-- Run these AFTER you have created your admin profile
-- and know your admin UUID. Replace <ADMIN_UUID> below.
-- ============================================================

-- Uncomment and replace <ADMIN_UUID> after first login:
/*
INSERT INTO public.quizzes
  (subject_id, title, description, year, total_questions, time_limit_min, max_attempts, retake_threshold, created_by, published)
SELECT
  s.id,
  'OS — Process Scheduling Basics',
  'Test your understanding of CPU scheduling algorithms: FCFS, SJF, Round Robin, Priority.',
  2, 10, 15, 2, 30,
  '<ADMIN_UUID>',
  true
FROM public.subjects s WHERE s.code = 'JCS-403';

INSERT INTO public.quizzes
  (subject_id, title, description, year, total_questions, time_limit_min, max_attempts, retake_threshold, created_by, published)
SELECT
  s.id,
  'DBMS — SQL Fundamentals',
  'SELECT, JOIN, GROUP BY, subqueries, normalization — everything for your end-sem.',
  2, 15, 20, 2, 30,
  '<ADMIN_UUID>',
  true
FROM public.subjects s WHERE s.code = 'JCS-401';
*/


-- ============================================================
-- VERIFICATION QUERIES
-- Run these to confirm everything is working:
-- ============================================================

-- Check subjects loaded:
-- SELECT year, COUNT(*) as count FROM public.subjects GROUP BY year;

-- Check RLS is on:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- Check triggers:
-- SELECT trigger_name, event_object_table FROM information_schema.triggers WHERE trigger_schema = 'public';

-- Set yourself as admin (run after first login):
-- UPDATE public.profiles SET role = 'admin'
--   WHERE id = (SELECT id FROM auth.users WHERE email = 'kartikkartikgupta04@gmail.com');
