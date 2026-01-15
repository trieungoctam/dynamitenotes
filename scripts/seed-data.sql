-- ============================================
-- DYNAMITE NOTES - SEED DATA
-- Triệu Ngọc Tâm (Dynamite) - Personal Portfolio
-- ============================================
-- This script populates the database with real content
-- for Triệu Tâm's blog & portfolio.
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
('out-004', 'outcome', 'optimized', 'Tối ưu', 'Optimized', 'Cải tiến hiệu suất', 'Performance improved', 'zap', '#a855f7', 4)
ON CONFLICT (id) DO UPDATE SET
  type = EXCLUDED.type,
  slug = EXCLUDED.slug,
  name_vi = EXCLUDED.name_vi,
  name_en = EXCLUDED.name_en,
  description_vi = EXCLUDED.description_vi,
  description_en = EXCLUDED.description_en,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  sort_order = EXCLUDED.sort_order;

-- ============================================
-- ABOUT PAGE - Triệu Ngọc Tâm
-- ============================================

INSERT INTO about (id, bio_vi, bio_en, principles_vi, principles_en, social_links, updated_at) VALUES
('about-001',
'Xin chào! Mình là Triệu Ngọc Tâm - Agentic Application Developer chuyên về kiến trúc AI Agent, đánh giá hệ thống và thiết kế production-grade systems.

Mình đam mê xây dựng các AI agents phức tạp hoạt động đáng tin cậy trong môi trường production. Với expertise sâu về:
- AI Agent Development & Architecture
- Multi-agent Orchestration
- Evaluation & Benchmarking
- Tracing & Debugging AI Systems

Hiện tại mình đang làm AI Software Engineer tại Minh Phuc Transformation JSC.',
'Hi! I''m Triệu Ngọc Tâm (Dynamite) - Agentic Application Developer specializing in AI Agent architecture, evaluation, and production-grade system design.

I''m passionate about building sophisticated AI agents that operate reliably in production environments. With deep expertise in:
- AI Agent Development & Architecture
- Multi-agent Orchestration
- Evaluation & Benchmarking
- Tracing & Debugging AI Systems

Currently working as AI Software Engineer at Minh Phuc Transformation JSC.',
'• Ship it, then iterate
• Đơn giản hơn là phức tạp
• Agent reliability > Agent capability
• Evaluate everything, assume nothing
• Build for production, not demos',
'• Ship it, then iterate
• Simpler is better than complex
• Agent reliability > Agent capability
• Evaluate everything, assume nothing
• Build for production, not demos',
'{"github": "https://github.com/trieungoctam", "linkedin": "https://www.linkedin.com/in/trieungoctam", "email": "ss.optimus2003@gmail.com"}'::jsonb,
NOW())
ON CONFLICT (id) DO UPDATE SET
  bio_vi = EXCLUDED.bio_vi,
  bio_en = EXCLUDED.bio_en,
  principles_vi = EXCLUDED.principles_vi,
  principles_en = EXCLUDED.principles_en,
  social_links = EXCLUDED.social_links,
  updated_at = EXCLUDED.updated_at;

-- ============================================
-- RESUME SECTIONS
-- ============================================

-- Highlights
INSERT INTO resume_sections (id, type, title_vi, title_en, content, sort_order, created_at, updated_at) VALUES
('res-001', 'highlight', 'Điểm nổi bật', 'Highlights',
'{"items": [
  "AI Software Engineer với expertise về Agentic Systems",
  "ACM/ICPC PTIT 2023 - Giải Ba, Top 10 năm 2022",
  "Contributor của CNCF Cloud Native Glossary",
  "Xây dựng production AI agents với OpenAI, Gemini, Claude",
  "Multi-agent orchestration & evaluation frameworks"
]}',
1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  type = EXCLUDED.type,
  title_vi = EXCLUDED.title_vi,
  title_en = EXCLUDED.title_en,
  content = EXCLUDED.content,
  sort_order = EXCLUDED.sort_order,
  updated_at = EXCLUDED.updated_at;

-- Experience
INSERT INTO resume_sections (id, type, title_vi, title_en, content, sort_order, created_at, updated_at) VALUES
('res-002', 'experience', 'Kinh nghiệm làm việc', 'Work Experience',
'{"experiences": [
  {
    "title": "AI Software Engineer",
    "company": "Minh Phuc Transformation JSC (MPT)",
    "period": "Jul 2025 - Present",
    "description": "Developing agentic applications and AI-powered automation systems. Building production-grade AI agents with evaluation frameworks.",
    "location": "Vietnam"
  },
  {
    "title": "AI Software Developer",
    "company": "Icetea Labs",
    "period": "Dec 2023 - Jul 2025",
    "description": "Built AI agents and chatbot systems. Implemented multi-agent orchestration, LLM integration with OpenAI/Gemini/Claude APIs, and tracing systems for debugging complex agent behaviors.",
    "location": "Hanoi, Vietnam"
  },
  {
    "title": "Member",
    "company": "Programming PTIT Club",
    "period": "Dec 2021 - Aug 2024",
    "description": "Competitive programming, algorithm training, and mentoring. Achieved ACM/ICPC PTIT 2023 3rd Prize and multiple Top 10 placements.",
    "location": "PTIT"
  }
]}',
2, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  type = EXCLUDED.type,
  title_vi = EXCLUDED.title_vi,
  title_en = EXCLUDED.title_en,
  content = EXCLUDED.content,
  sort_order = EXCLUDED.sort_order,
  updated_at = EXCLUDED.updated_at;

-- Education
INSERT INTO resume_sections (id, type, title_vi, title_en, content, sort_order, created_at, updated_at) VALUES
('res-004', 'education', 'Học vấn', 'Education',
'{"education": [
  {
    "degree": "Information Technology",
    "school": "Posts and Telecommunications Institute of Technology (PTIT)",
    "period": "2021 - 2025",
    "description": "Specialized in software engineering and AI development",
    "location": "Hanoi, Vietnam"
  }
]}',
3, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  type = EXCLUDED.type,
  title_vi = EXCLUDED.title_vi,
  title_en = EXCLUDED.title_en,
  content = EXCLUDED.content,
  sort_order = EXCLUDED.sort_order,
  updated_at = EXCLUDED.updated_at;

-- Skills
INSERT INTO resume_sections (id, type, title_vi, title_en, content, sort_order, created_at, updated_at) VALUES
('res-005', 'skill', 'Kỹ năng', 'Skills',
'{"categories": [
  {
    "name": "Languages",
    "skills": ["Python", "JavaScript", "TypeScript", "C++", "C#"]
  },
  {
    "name": "LLM Platforms",
    "skills": ["OpenAI API", "Google Gemini", "Anthropic Claude", "AWS Bedrock"]
  },
  {
    "name": "AI/ML Frameworks",
    "skills": ["LangChain", "LlamaIndex", "FastAPI", "Pydantic"]
  },
  {
    "name": "Frontend",
    "skills": ["React", "TypeScript", "HTML/CSS", "Tailwind CSS"]
  },
  {
    "name": "Backend",
    "skills": ["NestJS", "FastAPI", "Node.js", "Supabase"]
  },
  {
    "name": "Specialties",
    "skills": ["Agent Architecture", "Multi-agent Systems", "Evaluation Frameworks", "Production Deployment", "Tracing & Debugging"]
  }
]}',
4, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  type = EXCLUDED.type,
  title_vi = EXCLUDED.title_vi,
  title_en = EXCLUDED.title_en,
  content = EXCLUDED.content,
  sort_order = EXCLUDED.sort_order,
  updated_at = EXCLUDED.updated_at;

-- Certifications
INSERT INTO resume_sections (id, type, title_vi, title_en, content, sort_order, created_at, updated_at) VALUES
('res-006', 'certification', 'Chứng chỉ & Giải thưởng', 'Certifications & Awards',
'{"certifications": [
  {
    "name": "ACM/ICPC PTIT 2023 - 3rd Prize",
    "issuer": "PTIT",
    "year": "2023"
  },
  {
    "name": "ACM/ICPC PTIT 2022 - Top 10",
    "issuer": "PTIT",
    "year": "2022"
  },
  {
    "name": "ACM/ICPC PTIT 2022 - 3rd Prize",
    "issuer": "PTIT",
    "year": "2022"
  },
  {
    "name": "CNCF Cloud Native Glossary Contributor",
    "issuer": "CNCF",
    "year": "2024"
  }
]}',
5, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  type = EXCLUDED.type,
  title_vi = EXCLUDED.title_vi,
  title_en = EXCLUDED.title_en,
  content = EXCLUDED.content,
  sort_order = EXCLUDED.sort_order,
  updated_at = EXCLUDED.updated_at;

-- Projects
INSERT INTO resume_sections (id, type, title_vi, title_en, content, sort_order, created_at, updated_at) VALUES
('res-003', 'project', 'Dự án nổi bật', 'Featured Projects',
'{"projects": [
  {
    "name": "Dynamite Notes",
    "description": "Personal blog & portfolio with brutalist design, bilingual support (VI/EN)",
    "tech": ["React", "TypeScript", "Supabase", "Tailwind CSS"],
    "url": "https://github.com/trieungoctam"
  },
  {
    "name": "AWS GenAI Journey",
    "description": "Learning journey with AWS GenAI services and Jupyter notebooks",
    "tech": ["Python", "Jupyter", "AWS", "GenAI"],
    "url": "https://github.com/trieungoctam/AWS-First-GenAI-Journey"
  },
  {
    "name": "CNCF Glossary Contribution",
    "description": "Contributing to Cloud Native Computing Foundation''s glossary project",
    "tech": ["HTML", "Cloud Native", "Documentation"],
    "url": "https://github.com/cncf/glossary"
  }
]}',
6, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  type = EXCLUDED.type,
  title_vi = EXCLUDED.title_vi,
  title_en = EXCLUDED.title_en,
  content = EXCLUDED.content,
  sort_order = EXCLUDED.sort_order,
  updated_at = EXCLUDED.updated_at;

-- ============================================
-- POSTS (Blog Articles)
-- ============================================

INSERT INTO posts (id, slug, title_vi, title_en, excerpt_vi, excerpt_en, content_vi, content_en, goal_id, outcome_id, level, read_time, featured, published, published_at, created_at, updated_at) VALUES

-- Post 1: AI Agent Architecture
('post-001', 'building-production-ai-agents',
'Xây dựng AI Agents cho Production: Kinh nghiệm thực chiến',
'Building Production AI Agents: Lessons from the Trenches',
'Kinh nghiệm xây dựng AI agents đáng tin cậy cho môi trường production từ thực tế làm việc.',
'Real-world lessons on building reliable AI agents for production environments.',
'# Xây dựng AI Agents cho Production

## Tại sao Production khác với Demo?

Khi demo, agent chỉ cần work 80% cases. Khi production, cần 99%+ reliability.

## Các thách thức chính

### 1. Context Window Management
- Token limit là real constraint
- Cần compression và summarization strategies
- Memory management cho long conversations

### 2. Error Handling
- LLM có thể fail bất cứ lúc nào
- Rate limiting từ providers
- Retry với exponential backoff

### 3. Evaluation
- Đánh giá agent behavior không đơn giản
- Cần comprehensive test suites
- Monitor production behavior

## Tech Stack khuyên dùng

```python
# Core stack
from langchain import Agent
from pydantic import BaseModel
import openai
```

## Kết luận

Build for production, not for demos. Reliability > Capability.',
'# Building Production AI Agents

## Why Production is Different from Demo?

In demos, agents only need to work 80% of cases. In production, you need 99%+ reliability.

## Key Challenges

### 1. Context Window Management
- Token limits are real constraints
- Need compression and summarization strategies
- Memory management for long conversations

### 2. Error Handling
- LLMs can fail anytime
- Rate limiting from providers
- Retry with exponential backoff

### 3. Evaluation
- Evaluating agent behavior is not simple
- Need comprehensive test suites
- Monitor production behavior

## Recommended Tech Stack

```python
# Core stack
from langchain import Agent
from pydantic import BaseModel
import openai
```

## Conclusion

Build for production, not for demos. Reliability > Capability.',
'goal-003', 'out-002', 'advanced', 10, true, true, '2025-12-15 10:00:00', NOW(), NOW()),

-- Post 2: Multi-Agent Systems
('post-002', 'multi-agent-orchestration-patterns',
'Multi-Agent Orchestration: Các Pattern thực tế',
'Multi-Agent Orchestration: Practical Patterns',
'Các pattern để orchestrate nhiều AI agents làm việc cùng nhau hiệu quả.',
'Patterns for orchestrating multiple AI agents to work together effectively.',
'# Multi-Agent Orchestration

## Tại sao cần Multi-Agent?

Single agent có limitations:
- Context window constraints
- Specialization issues
- Single point of failure

## Các Pattern phổ biến

### 1. Supervisor Pattern
Một agent điều phối các agent khác.

```python
class SupervisorAgent:
    def __init__(self, workers: List[Agent]):
        self.workers = workers

    def delegate(self, task):
        # Choose appropriate worker
        worker = self.select_worker(task)
        return worker.execute(task)
```

### 2. Collaborative Pattern
Agents làm việc song song và merge results.

### 3. Pipeline Pattern
Output của agent này là input của agent kế tiếp.

## Inter-Agent Communication

- Shared memory
- Message passing
- Event-driven

## Best Practices

1. Clear agent boundaries
2. Well-defined interfaces
3. Comprehensive logging
4. Graceful degradation',
'# Multi-Agent Orchestration

## Why Multi-Agent?

Single agents have limitations:
- Context window constraints
- Specialization issues
- Single point of failure

## Common Patterns

### 1. Supervisor Pattern
One agent orchestrates other agents.

```python
class SupervisorAgent:
    def __init__(self, workers: List[Agent]):
        self.workers = workers

    def delegate(self, task):
        # Choose appropriate worker
        worker = self.select_worker(task)
        return worker.execute(task)
```

### 2. Collaborative Pattern
Agents work in parallel and merge results.

### 3. Pipeline Pattern
Output of one agent is input to the next.

## Inter-Agent Communication

- Shared memory
- Message passing
- Event-driven

## Best Practices

1. Clear agent boundaries
2. Well-defined interfaces
3. Comprehensive logging
4. Graceful degradation',
'goal-003', 'out-001', 'advanced', 12, true, true, '2025-12-10 14:30:00', NOW(), NOW()),

-- Post 3: Agent Evaluation
('post-003', 'evaluating-ai-agents',
'Đánh giá AI Agents: Framework và Metrics',
'Evaluating AI Agents: Framework and Metrics',
'Làm sao để biết agent của bạn hoạt động tốt? Framework đánh giá toàn diện.',
'How do you know if your agent is performing well? A comprehensive evaluation framework.',
'# Đánh giá AI Agents

## Tại sao Evaluation quan trọng?

"You can''t improve what you don''t measure."

Agent không có evaluation = Flying blind.

## Metrics cần track

### 1. Task Completion Rate
- Tỷ lệ hoàn thành task thành công
- Cần define rõ "success"

### 2. Accuracy
- Output có đúng không?
- So sánh với ground truth

### 3. Latency
- Time to first token
- Total completion time

### 4. Cost
- Token usage
- API costs

## Evaluation Framework

```python
class AgentEvaluator:
    def evaluate(self, agent, test_cases):
        results = []
        for case in test_cases:
            output = agent.run(case.input)
            score = self.score(output, case.expected)
            results.append(score)
        return aggregate(results)
```

## Edge Cases

Đừng quên test:
- Adversarial inputs
- Out-of-domain queries
- Long conversations
- Concurrent requests',
'# Evaluating AI Agents

## Why Evaluation Matters?

"You can''t improve what you don''t measure."

Agents without evaluation = Flying blind.

## Metrics to Track

### 1. Task Completion Rate
- Rate of successful task completion
- Need to clearly define "success"

### 2. Accuracy
- Is the output correct?
- Compare with ground truth

### 3. Latency
- Time to first token
- Total completion time

### 4. Cost
- Token usage
- API costs

## Evaluation Framework

```python
class AgentEvaluator:
    def evaluate(self, agent, test_cases):
        results = []
        for case in test_cases:
            output = agent.run(case.input)
            score = self.score(output, case.expected)
            results.append(score)
        return aggregate(results)
```

## Edge Cases

Don''t forget to test:
- Adversarial inputs
- Out-of-domain queries
- Long conversations
- Concurrent requests',
'goal-005', 'out-002', 'builder', 8, true, true, '2025-12-05 09:00:00', NOW(), NOW()),

-- Post 4: Tracing AI Systems
('post-004', 'tracing-debugging-ai-systems',
'Tracing & Debugging AI Systems: Observability cho Agents',
'Tracing & Debugging AI Systems: Observability for Agents',
'Cách implement tracing để debug complex agent behaviors trong production.',
'How to implement tracing to debug complex agent behaviors in production.',
'# Tracing AI Systems

## Vấn đề

AI agents là black boxes. Khi có bug, làm sao biết đâu là root cause?

## Solution: Comprehensive Tracing

### 1. Request Tracing
Track mỗi request từ đầu đến cuối.

```python
@trace("agent_request")
def handle_request(request):
    with span("parse_input"):
        parsed = parse(request)
    with span("agent_execution"):
        result = agent.run(parsed)
    with span("format_output"):
        return format(result)
```

### 2. LLM Call Tracing
- Input prompt
- Model used
- Token counts
- Response time
- Output

### 3. Tool Call Tracing
- Tool name
- Arguments
- Results
- Errors

## Tools

- LangSmith
- Weights & Biases
- Custom solutions với OpenTelemetry

## Best Practices

1. Trace everything by default
2. Use correlation IDs
3. Store traces for analysis
4. Set up alerts on anomalies',
'# Tracing AI Systems

## The Problem

AI agents are black boxes. When there''s a bug, how do you find the root cause?

## Solution: Comprehensive Tracing

### 1. Request Tracing
Track each request from start to finish.

```python
@trace("agent_request")
def handle_request(request):
    with span("parse_input"):
        parsed = parse(request)
    with span("agent_execution"):
        result = agent.run(parsed)
    with span("format_output"):
        return format(result)
```

### 2. LLM Call Tracing
- Input prompt
- Model used
- Token counts
- Response time
- Output

### 3. Tool Call Tracing
- Tool name
- Arguments
- Results
- Errors

## Tools

- LangSmith
- Weights & Biases
- Custom solutions with OpenTelemetry

## Best Practices

1. Trace everything by default
2. Use correlation IDs
3. Store traces for analysis
4. Set up alerts on anomalies',
'goal-006', 'out-004', 'advanced', 9, false, true, '2025-11-28 16:00:00', NOW(), NOW()),

-- Post 5: Prompt Engineering
('post-005', 'advanced-prompt-engineering-agents',
'Advanced Prompt Engineering cho AI Agents',
'Advanced Prompt Engineering for AI Agents',
'Techniques để viết prompts cho reliable agent behavior.',
'Techniques for writing prompts that ensure reliable agent behavior.',
'# Advanced Prompt Engineering

## Agent Prompts khác gì?

Agent prompts cần:
- Tool definitions rõ ràng
- Output format strict
- Error handling instructions
- Guardrails

## Techniques

### 1. Structured Output
```
You must respond in JSON format:
{
  "thought": "your reasoning",
  "action": "tool_name or final_answer",
  "action_input": "input to tool"
}
```

### 2. Few-shot Examples
Provide 2-3 examples của expected behavior.

### 3. Chain of Thought
Force agent to explain reasoning.

### 4. Guardrails
```
NEVER:
- Execute harmful code
- Access sensitive data
- Make external requests without approval
```

## Testing Prompts

- A/B testing different versions
- Measure success rate
- Track failure modes
- Iterate based on data',
'# Advanced Prompt Engineering

## How are Agent Prompts Different?

Agent prompts need:
- Clear tool definitions
- Strict output format
- Error handling instructions
- Guardrails

## Techniques

### 1. Structured Output
```
You must respond in JSON format:
{
  "thought": "your reasoning",
  "action": "tool_name or final_answer",
  "action_input": "input to tool"
}
```

### 2. Few-shot Examples
Provide 2-3 examples of expected behavior.

### 3. Chain of Thought
Force agent to explain reasoning.

### 4. Guardrails
```
NEVER:
- Execute harmful code
- Access sensitive data
- Make external requests without approval
```

## Testing Prompts

- A/B testing different versions
- Measure success rate
- Track failure modes
- Iterate based on data',
'goal-002', 'out-002', 'builder', 7, false, true, '2025-11-20 11:00:00', NOW(), NOW()),

-- Post 6: LangChain vs LlamaIndex
('post-006', 'langchain-vs-llamaindex-comparison',
'LangChain vs LlamaIndex: Khi nào dùng gì?',
'LangChain vs LlamaIndex: When to Use Which?',
'So sánh hai framework phổ biến nhất cho AI applications.',
'Comparing the two most popular frameworks for AI applications.',
'# LangChain vs LlamaIndex

## Overview

Cả hai đều là frameworks để build AI applications, nhưng focus khác nhau.

## LangChain

### Strengths
- Agent development
- Tool integration
- Chain composition
- Flexible architecture

### Use Cases
- Chatbots
- Agent systems
- Workflow automation

```python
from langchain import Agent, Tool

agent = Agent(tools=[...], llm=llm)
result = agent.run("Do something")
```

## LlamaIndex

### Strengths
- Data indexing
- RAG applications
- Document QA
- Knowledge bases

### Use Cases
- Document search
- Knowledge retrieval
- Semantic search

```python
from llama_index import VectorStoreIndex

index = VectorStoreIndex.from_documents(docs)
query_engine = index.as_query_engine()
```

## Verdict

- **Agents & Automation** → LangChain
- **RAG & Document QA** → LlamaIndex
- **Both** → Use both together!',
'# LangChain vs LlamaIndex

## Overview

Both are frameworks for building AI applications, but with different focus areas.

## LangChain

### Strengths
- Agent development
- Tool integration
- Chain composition
- Flexible architecture

### Use Cases
- Chatbots
- Agent systems
- Workflow automation

```python
from langchain import Agent, Tool

agent = Agent(tools=[...], llm=llm)
result = agent.run("Do something")
```

## LlamaIndex

### Strengths
- Data indexing
- RAG applications
- Document QA
- Knowledge bases

### Use Cases
- Document search
- Knowledge retrieval
- Semantic search

```python
from llama_index import VectorStoreIndex

index = VectorStoreIndex.from_documents(docs)
query_engine = index.as_query_engine()
```

## Verdict

- **Agents & Automation** → LangChain
- **RAG & Document QA** → LlamaIndex
- **Both** → Use both together!',
'goal-001', 'out-002', 'starter', 6, false, true, '2025-11-15 10:00:00', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  title_vi = EXCLUDED.title_vi,
  title_en = EXCLUDED.title_en,
  excerpt_vi = EXCLUDED.excerpt_vi,
  excerpt_en = EXCLUDED.excerpt_en,
  content_vi = EXCLUDED.content_vi,
  content_en = EXCLUDED.content_en,
  goal_id = EXCLUDED.goal_id,
  outcome_id = EXCLUDED.outcome_id,
  level = EXCLUDED.level,
  read_time = EXCLUDED.read_time,
  featured = EXCLUDED.featured,
  published = EXCLUDED.published,
  published_at = EXCLUDED.published_at,
  updated_at = EXCLUDED.updated_at;

-- ============================================
-- INSIGHTS (Quick Thoughts)
-- ============================================

INSERT INTO insights (id, content_vi, content_en, tags, published, published_at, created_at) VALUES
('ins-001',
'Agent reliability > Agent capability. Production agents cần work 99% cases, không phải chỉ 80%.',
'Agent reliability > Agent capability. Production agents need to work 99% of cases, not just 80%.',
'{"agents", "production"}',
true, NOW(), NOW()),

('ins-002',
'LangChain cho agents, LlamaIndex cho RAG. Dùng cả hai khi cần cả hai.',
'LangChain for agents, LlamaIndex for RAG. Use both when you need both.',
'{"langchain", "llamaindex"}',
true, NOW(), NOW()),

('ins-003',
'Evaluation là phần khó nhất của AI development. You can''t improve what you don''t measure.',
'Evaluation is the hardest part of AI development. You can''t improve what you don''t measure.',
'{"evaluation", "ai"}',
true, NOW(), NOW()),

('ins-004',
'Context window management là real constraint. Cần compression strategies cho long conversations.',
'Context window management is a real constraint. Need compression strategies for long conversations.',
'{"llm", "context"}',
true, NOW(), NOW()),

('ins-005',
'ACM/ICPC dạy mình cách solve problems. AI dev dạy mình cách build systems.',
'ACM/ICPC taught me how to solve problems. AI dev taught me how to build systems.',
'{"competitive-programming", "career"}',
true, NOW(), NOW()),

('ins-006',
'Tracing là must-have cho production AI. Không có tracing = flying blind.',
'Tracing is must-have for production AI. No tracing = flying blind.',
'{"tracing", "observability"}',
true, NOW(), NOW()),

('ins-007',
'Multi-agent systems không phải silver bullet. Sometimes single agent với good prompts là đủ.',
'Multi-agent systems are not a silver bullet. Sometimes single agent with good prompts is enough.',
'{"multi-agent", "architecture"}',
true, NOW(), NOW()),

('ins-008',
'Claude Code changed how I work. Agentic coding là tương lai.',
'Claude Code changed how I work. Agentic coding is the future.',
'{"claude", "productivity"}',
true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  content_vi = EXCLUDED.content_vi,
  content_en = EXCLUDED.content_en,
  tags = EXCLUDED.tags,
  published = EXCLUDED.published,
  published_at = EXCLUDED.published_at;

-- ============================================
-- PHOTOS
-- ============================================

INSERT INTO photos (id, url, thumbnail_url, caption_vi, caption_en, album, sort_order, published, taken_at, created_at) VALUES
('photo-001', 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200', 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400',
'AI Development Setup', 'AI Development Setup', 'Workspace', 1, true, '2025-01-01', NOW()),

('photo-002', 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200', 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400',
'Late night coding session', 'Late night coding session', 'Workspace', 2, true, '2025-01-05', NOW()),

('photo-003', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400',
'PTIT Programming Club', 'PTIT Programming Club', 'Events', 1, true, '2024-05-15', NOW()),

('photo-004', 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200', 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400',
'ACM/ICPC Competition', 'ACM/ICPC Competition', 'Events', 2, true, '2023-10-20', NOW()),

('photo-005', 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200', 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400',
'Team at Icetea Labs', 'Team at Icetea Labs', 'Work', 1, true, '2024-06-20', NOW()),

('photo-006', 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200', 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400',
'Hanoi coffee shop coding', 'Hanoi coffee shop coding', 'Life', 1, true, '2025-01-10', NOW())
ON CONFLICT (id) DO UPDATE SET
  url = EXCLUDED.url,
  thumbnail_url = EXCLUDED.thumbnail_url,
  caption_vi = EXCLUDED.caption_vi,
  caption_en = EXCLUDED.caption_en,
  album = EXCLUDED.album,
  sort_order = EXCLUDED.sort_order,
  published = EXCLUDED.published,
  taken_at = EXCLUDED.taken_at;

-- ============================================
-- SERIES
-- ============================================

INSERT INTO series (id, slug, title_vi, title_en, description_vi, description_en, post_ids, cover_image, featured, published, created_at, updated_at) VALUES
('series-001', 'ai-agents-production',
'AI Agents Production Guide', 'AI Agents Production Guide',
'Chuỗi bài viết về xây dựng AI agents cho production.',
'A series on building AI agents for production environments.',
'{"post-001", "post-002", "post-003", "post-004"}',
'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200',
true, true, NOW(), NOW()),

('series-002', 'ai-frameworks-comparison',
'So sánh AI Frameworks', 'AI Frameworks Comparison',
'So sánh các frameworks phổ biến cho AI development.',
'Comparing popular frameworks for AI development.',
'{"post-005", "post-006"}',
'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200',
false, true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  title_vi = EXCLUDED.title_vi,
  title_en = EXCLUDED.title_en,
  description_vi = EXCLUDED.description_vi,
  description_en = EXCLUDED.description_en,
  post_ids = EXCLUDED.post_ids,
  cover_image = EXCLUDED.cover_image,
  featured = EXCLUDED.featured,
  published = EXCLUDED.published,
  updated_at = EXCLUDED.updated_at;

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
