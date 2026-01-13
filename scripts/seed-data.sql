-- ============================================
-- DYNAMITE NOTES - SEED DATA
-- ============================================
-- This script populates the database with fake content
-- for MVP testing and preview purposes.
--
-- Usage: Run this in Supabase SQL Editor
-- ============================================

-- Clear existing data (optional - comment out if you want to keep existing data)
-- TRUNCATE TABLE posts CASCADE;
-- TRUNCATE TABLE insights CASCADE;
-- TRUNCATE TABLE photos CASCADE;
-- TRUNCATE TABLE series CASCADE;
-- TRUNCATE TABLE resume_sections CASCADE;
-- TRUNCATE TABLE about CASCADE;
-- TRUNCATE TABLE taxonomy CASCADE;

-- ============================================
-- TAXONOMY (Goals & Outcomes)
-- ============================================

INSERT INTO taxonomy (id, type, slug, name_vi, name_en, description_vi, description_en, icon, color, sort_order) VALUES
-- Goals
('goal-001', 'goal', 'decide', 'Quyết định', 'Decide', 'Chọn hướng đi cho sản phẩm', 'Choose direction for products', 'compass', '#3b82f6', 1),
('goal-002', 'goal', 'spec', 'Đặc tả', 'Spec', 'Định nghĩa yêu cầu', 'Define requirements', 'file-text', '#a855f7', 2),
('goal-003', 'goal', 'build', 'Xây dựng', 'Build', 'Tạo giải pháp', 'Create solutions', 'hammer', '#f97316', 3),
('goal-004', 'goal', 'ship', 'Phát hành', 'Ship', 'Triển khai và phát hành', 'Deploy & release', 'rocket', '#22c55e', 4),
('goal-005', 'goal', 'measure', 'Đo lường', 'Measure', 'Phân tích kết quả', 'Analyze results', 'bar-chart', '#06b6d4', 5),
('goal-006', 'goal', 'operate', 'Vận hành', 'Operate', 'Chạy và bảo trì', 'Run & maintain', 'settings', '#6b7280', 6),

-- Outcomes
('out-001', 'outcome', 'launched', 'Ra mắt', 'Launched', 'Sản phẩm đã ra mắt', 'Product launched', 'rocket', '#22c55e', 1),
('out-002', 'outcome', 'learned', 'Học hỏi', 'Learned', 'Kiến thức mới', 'New knowledge', 'lightbulb', '#eab308', 2),
('out-003', 'outcome', 'failed', 'Thất bại', 'Failed', 'Bài học từ thất bại', 'Lessons from failure', 'x-circle', '#ef4444', 3),
('out-004', 'outcome', 'optimized', 'Tối ưu', 'Optimized', 'Cải tiến hiệu suất', 'Performance improved', 'zap', '#a855f7', 4);

-- ============================================
-- ABOUT PAGE
-- ============================================

INSERT INTO about (id, bio_vi, bio_en, principles_vi, principles_en, social_links, updated_at) VALUES
('about-001',
'Xin chào! Mình là một lập trình viên full-stack đến từ Việt Nam. Mình đam mê xây dựng sản phẩm đẹp, functional và mang lại giá trị cho người dùng.

Mình viết blog để chia sẻ kiến thức, ghi lại bài học và kết nối với cộng đồng developer.',
'Hi! I''m a full-stack developer from Vietnam. I love building beautiful, functional products that deliver value to users.

I write to share knowledge, document lessons learned, and connect with the developer community.',
'• Đơn giản hơn là phức tạp hơn
• Hành động tốt hơn là hoàn hảo
• Chia sẻ kiến thức tự do do
• Code sạch, document rõ ràng',
'• Simpler is better than complex
• Done is better than perfect
• Share knowledge freely
• Clean code, clear documentation',
'{"github": "https://github.com/dynamite", "twitter": "https://twitter.com/dynamite", "linkedin": "https://linkedin.com/in/dynamite"}'::jsonb,
NOW());

-- ============================================
-- RESUME SECTIONS
-- ============================================

-- Highlights
INSERT INTO resume_sections (id, type, title_vi, title_en, content, sort_order, created_at, updated_at) VALUES
('res-001', 'highlight', 'Điểm nổi bật', 'Highlights',
'{"items": [
  "5+ năm kinh nghiệm lập trình web",
  "Xây dựng 10+ sản phẩm từ ý tưởng đến ra mắt",
  "Author của technical blog với 50k+ readers/tháng",
  "Open source contributor với 1k+ GitHub stars"
]}',
1, NOW(), NOW());

-- Experience
INSERT INTO resume_sections (id, type, title_vi, title_en, content, sort_order, created_at, updated_at) VALUES
('res-002', 'experience', 'Kinh nghiệm làm việc', 'Work Experience',
'{"experiences": [
  {
    "title": "Senior Full-Stack Developer",
    "company": "Tech Startup",
    "period": "2022 - Present",
    "description": "Lead development of core product, built microservices architecture"
  },
  {
    "title": "Frontend Developer",
    "company": "Digital Agency",
    "period": "2020 - 2022",
    "description": "Built web apps for Fortune 500 clients using React and TypeScript"
  }
]}',
2, NOW(), NOW());

-- Projects
INSERT INTO resume_sections (id, type, title_vi, title_en, content, sort_order, created_at, updated_at) VALUES
('res-003', 'project', 'Dự án nổi bật', 'Featured Projects',
'{"projects": [
  {
    "name": "Dynamite Notes",
    "description": "Personal blog & portfolio with brutalist design",
    "tech": ["React", "TypeScript", "Supabase"],
    "url": "https://dynamite.notes"
  },
  {
    "name": "DevTools Pro",
    "description": "Browser extension for developers",
    "tech": ["JavaScript", "Chrome Extension API"],
    "url": "https://github.com/dynamite/devtools-pro"
  }
]}',
3, NOW(), NOW());

-- ============================================
-- POSTS (Blog Articles)
-- ============================================

INSERT INTO posts (id, slug, title_vi, title_en, excerpt_vi, excerpt_en, content_vi, content_en, goal_id, outcome_id, level, read_time, featured, published, published_at, created_at, updated_at) VALUES

-- Post 1: Decide
('post-001', 'how-to-choose-tech-stack',
'Chọn Tech Stack cho Startup: Cái nhìn thực tế',
'Choosing Tech Stack for Startups: A Practical Guide',
'Khi bắt đầu dự án mới, việc chọn tech stack có thể gây đau đầu. Bài viết này chia sẻ kinh nghiệm thực tế từ nhiều dự án.',
'Choosing a tech stack for a new project can be overwhelming. Here are practical lessons from multiple projects.',
'# Chọn Tech Stack cho Startup

## Tại sao quan trọng?

Tech stack quyết định:
- Tốc độ phát triển
- Khả năng масштаб
- Chi phí vận hành
- Độ dễ tuyển dụng

## Các yếu tố cần xem xét

### 1. Độ trưởng của team
Nếu team mới học, chọn tech có community lớn.

### 2. Loại sản phẩm
- Web app: React/Next.js
- Mobile: React Native/Flutter
- Backend: Node.js/Go

### 3. Performance requirement
- High traffic: Go, Rust
- Normal traffic: Node.js, Python

## Conclusion

Không có tech stack hoàn hảo. Chọn phù hợp với bài toán của bạn.',
'# Choosing Tech Stack for Startups

## Why it matters?

Tech stack determines:
- Development speed
- Scalability
- Operational costs
- Hiring ease

## Key factors

### 1. Team maturity
If learning, pick tech with large community.

### 2. Product type
- Web app: React/Next.js
- Mobile: React Native/Flutter
- Backend: Node.js/Go

### 3. Performance needs
- High traffic: Go, Rust
- Normal traffic: Node.js, Python

## Conclusion

No perfect stack exists. Choose what fits your problem.',
'goal-001', 'out-002', 'builder', 8, true, true, '2024-01-10 10:00:00', NOW(), NOW()),

-- Post 2: Build
('post-002', 'building-rest-api-with-nodejs',
'Xây dựng REST API với Node.js: Từ A-Z',
'Building REST API with Node.js: From Zero to Hero',
'Hướng dẫn chi tiết xây dựng REST API production-ready với Node.js, Express và TypeScript.',
'A comprehensive guide to building production-ready REST APIs with Node.js, Express, and TypeScript.',
'# Xây dựng REST API

## Setup project

```bash
npm init -y
npm install express typescript @types/express
```

## Structure

```
src/
  routes/
  controllers/
  services/
  models/
  middleware/
```

## Best practices

1. Use TypeScript for type safety
2. Implement validation with Zod
3. Add rate limiting
4. Log everything
5. Write tests',
'# Building REST API

## Setup project

```bash
npm init -y
npm install express typescript @types/express
```

## Structure

```
src/
  routes/
  controllers/
  services/
  models/
  middleware/
```

## Best practices

1. Use TypeScript for type safety
2. Implement validation with Zod
3. Add rate limiting
4. Log everything
5. Write tests',
'goal-003', 'out-001', 'advanced', 12, true, true, '2024-01-08 14:30:00', NOW(), NOW()),

-- Post 3: Spec
('post-003', 'writing-technical-specifications',
'Viết Technical Specification hiệu quả',
'Writing Effective Technical Specifications',
'Kinh nghiệm viết tech spec rõ ràng, giúp team đồng thuận và tránh misunderstandings.',
'How to write clear technical specifications that align teams and prevent misunderstandings.',
'# Technical Specification

## Components

### 1. Problem statement
What are we solving and why?

### 2. Requirements
Functional and non-functional requirements.

### 3. Architecture
System design, data models, API contracts.

### 4. Success criteria
How do we measure success?

## Tips

- Be specific but flexible
- Include diagrams
- Version control your specs',
'# Technical Specification

## Components

### 1. Problem statement
What are we solving and why?

### 2. Requirements
Functional and non-functional requirements.

### 3. Architecture
System design, data models, API contracts.

### 4. Success criteria
How do we measure success?

## Tips

- Be specific but flexible
- Include diagrams
- Version control your specs',
'goal-002', 'out-002', 'starter', 6, false, true, '2024-01-05 09:00:00', NOW(), NOW()),

-- Post 4: Ship
('post-004', 'deployment-checklist',
'Checklist Deploy sản phẩm ra Production',
'Production Deployment Checklist',
'Những thứ cần kiểm tra trước khi deploy để tránh catastrophe.',
'Things to check before deploying to avoid catastrophes.',
'# Deployment Checklist

## Pre-deploy

- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] Monitoring setup
- [ ] Rollback plan prepared

## Post-deploy

- [ ] Verify key features
- [ ] Check error logs
- [ ] Monitor performance
- [ ] Notify team

## Pro tip

Always deploy on Friday morning, not Friday afternoon!',
'# Deployment Checklist

## Pre-deploy

- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] Monitoring setup
- [ ] Rollback plan prepared

## Post-deploy

- [ ] Verify key features
- [ ] Check error logs
- [ ] Monitor performance
- [ ] Notify team

## Pro tip

Always deploy on Friday morning, not Friday afternoon!',
'goal-004', 'out-001', 'builder', 5, false, true, '2024-01-03 16:00:00', NOW(), NOW()),

-- Post 5: Measure
('post-005', 'analytics-for-developers',
'Analytics cho Developers: Measure what matters',
'Analytics for Developers: Measure What Matters',
'Don''t measure everything. Measure what drives decisions.',
'Don''t measure everything. Measure what drives decisions.',
'# Developer Analytics

## What to track

### 1. User metrics
- DAU/MAU
- Retention rate
- Conversion funnel

### 2. Technical metrics
- Error rate
- Response time
- Uptime

## Tools

- Google Analytics (free)
- PostHog (open source)
- Mixpanel (paid)

## Remember

Data without action is useless.',
'# Developer Analytics

## What to track

### 1. User metrics
- DAU/MAU
- Retention rate
- Conversion funnel

### 2. Technical metrics
- Error rate
- Response time
- Uptime

## Tools

- Google Analytics (free)
- PostHog (open source)
- Mixpanel (paid)

## Remember

Data without action is useless.',
'goal-005', 'out-004', 'advanced', 7, false, true, '2024-01-01 11:00:00', NOW(), NOW()),

-- Post 6: Operate
('post-006', 'incident-response-playbook',
'Incident Response: Khi mọi thứ gặp sự cố',
'Incident Response: When Everything Breaks',
'Playbook xử lý sự cố production.',
'Production incident handling playbook.',
'# Incident Response

## Phase 1: Detection
- Monitoring alerts trigger
- Verify it''s a real issue

## Phase 2: Response
- Assemble war room
- Communicate to stakeholders
- Work on fix

## Phase 3: Recovery
- Deploy fix
- Verify service restored

## Phase 4: Postmortem
- Write postmortem
- Create action items
- Update processes

Remember: Blameless postmortem!',
'# Incident Response

## Phase 1: Detection
- Monitoring alerts trigger
- Verify it''s a real issue

## Phase 2: Response
- Assemble war room
- Communicate to stakeholders
- Work on fix

## Phase 3: Recovery
- Deploy fix
- Verify service restored

## Phase 4: Postmortem
- Write postmortem
- Create action items
- Update processes

Remember: Blameless postmortem!',
'goal-006', 'out-003', 'advanced', 10, false, true, '2023-12-28 10:00:00', NOW(), NOW());

-- ============================================
-- INSIGHTS (Quick Thoughts)
-- ============================================

INSERT INTO insights (id, content_vi, content_en, tags, published, published_at, created_at) VALUES
('ins-001',
'Diễn ra: TypeScript 5.4 vừa release với tính năng NoInfer. Game changer!',
'TypeScript 5.4 just released with NoInfer. Game changer!',
'["typescript", "release"]',
true, NOW(), NOW()),

('ins-002',
'Best practice: Luôn luôn implement error boundaries cho React apps. Sẽ cứu bạn nhiều lần.',
'Best practice: Always implement error boundaries in React apps. Will save you many times.',
'["react", "best-practice"]',
true, NOW(), NOW()),

('ins-003',
'Đọc: "The Pragmatic Programmer" là cuốn sách thay đổi cách mình tư duy về code.',
'Reading: "The Pragmatic Programmer" changed how I think about code.',
'["book", "learning"]',
true, NOW(), NOW()),

('ins-004',
'Tool discovery: Zod for runtime validation + TypeScript = match made in heaven.',
'Tool discovery: Zod for runtime validation + TypeScript = match made in heaven.',
'["typescript", "zod"]',
true, NOW(), NOW()),

('ins-005',
'Mindset: Done is better than perfect. Ship it, then iterate.',
'T mindset: Done is better than perfect. Ship it, then iterate.',
'["mindset", "shipping"]',
true, NOW(), NOW()),

('ins-006',
'CSS tip: gap property works with flexbox, not just grid. Mind blown!',
'CSS tip: gap property works with flexbox, not just grid. Mind blown!',
'["css", "tip"]',
true, NOW(), NOW()),

('ins-007',
'Việc debug production logs là như làm thám tử. Tìm manh mối, nối điểm lại, tìm ra thủ phạm.',
'Debugging production logs is like detective work. Find clues, connect dots, find culprit.',
'["debugging", "production"]',
true, NOW(), NOW()),

('ins-008',
'Architecture note: Microservices không phải giải pháp cho mọi bài toán. Đôi khi monolith tốt hơn.',
'Architecture note: Microservices aren''t the answer to everything. Sometimes monolith is better.',
'["architecture", "microservices"]',
true, NOW(), NOW());

-- ============================================
-- PHOTOS
-- ============================================

INSERT INTO photos (id, url, thumbnail_url, caption_vi, caption_en, album, sort_order, published, taken_at, created_at) VALUES
-- Using placeholder images from Unsplash
('photo-001', 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200', 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400',
'Workspace setup 2024', 'Workspace setup 2024', 'Workspace', 1, true, '2024-01-01', NOW()),

('photo-002', 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200', 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400',
'Late night coding session', 'Late night coding session', 'Workspace', 2, true, '2024-01-05', NOW()),

('photo-003', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400',
'React Conference 2024', 'React Conference 2024', 'Events', 1, true, '2024-02-15', NOW()),

('photo-004', 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200', 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400',
'My development setup', 'My development setup', 'Workspace', 3, true, '2024-01-10', NOW()),

('photo-005', 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200', 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400',
'Team dinner after launch', 'Team dinner after launch', 'Life', 1, true, '2024-01-20', NOW()),

('photo-006', 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200', 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400',
'Coding at coffee shop', 'Coding at coffee shop', 'Life', 2, true, '2024-01-25', NOW());

-- ============================================
-- SERIES
-- ============================================

INSERT INTO series (id, slug, title_vi, title_en, description_vi, description_en, post_ids, cover_image, featured, published, created_at, updated_at) VALUES
('series-001', 'nodejs-crash-course',
'Node.js Crash Course', 'Node.js Crash Course',
'Chuỗi bài viết về Node.js từ cơ bản đến nâng cao.',
'A series about Node.js from basics to advanced.',
'["post-002"]',
'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200',
true, true, NOW(), NOW()),

('series-002', 'startup-lessons',
'Bài học từ Startup', 'Startup Lessons',
'Thực trải từ việc xây dựng startup.',
'Lessons learned from building a startup.',
'["post-001", "post-003"]',
'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200',
false, true, NOW(), NOW());

-- ============================================
-- END OF SEED SCRIPT
-- ============================================

-- Verification query (run this to check data)
-- SELECT 'taxonomy' as table_name, COUNT(*) as count FROM taxonomy
-- UNION ALL
-- SELECT 'posts', COUNT(*) FROM posts
-- UNION ALL
-- SELECT 'insights', COUNT(*) FROM insights
-- UNION ALL
-- SELECT 'photos', COUNT(*) FROM photos
-- UNION ALL
-- SELECT 'series', COUNT(*) FROM series
-- UNION ALL
-- SELECT 'resume_sections', COUNT(*) FROM resume_sections
-- UNION ALL
-- SELECT 'about', COUNT(*) FROM about;
