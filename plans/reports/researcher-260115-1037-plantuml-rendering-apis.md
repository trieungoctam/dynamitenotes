# Research Report: PlantUML Rendering APIs

**Date:** 2026-01-15
**Researcher:** AI Agent

---

## Executive Summary

PlantUML offers multiple rendering approaches: public online servers, self-hosted solutions, and client-side options. Official public server (`plantuml.com`) provides free API access with no documented rate limits. Encoding uses custom deflate+base64 variant for URL-safe diagrams. SVG & PNG supported. Self-hosting via Docker recommended for production. Caching & fallback strategies critical for reliability.

**Key Recommendations:**
- Use public server for prototyping, self-host for production
- Implement aggressive caching (hash-based keys, long TTL)
- Add fallback to plantuml.js or cached images
- Set 10-30s timeouts with exponential backoff retries

---

## Research Methodology

- **Sources:** 6 web searches, 2 official docs
- **Date Range:** 2024-2025 (current)
- **Search Terms:** PlantUML API, encoding, Docker, caching, error handling, rate limiting

---

## Key Findings

### 1. Available PlantUML Servers/APIs

**Official Public Server**
- Base URL: `https://www.plantuml.com/plantuml/`
- Endpoints: `/png/ENCODED`, `/svg/ENCODED`, `/txt/ENCODED`, `/map/ENCODED`
- No authentication required
- No documented rate limits
- Encodes source in PNG metadata for recovery

**Third-Party APIs**
- Various wrappers exist (MCP market, PythonAnywhere)
- Often add AI/natural language features
- May have rate limits or costs
- Less reliable than official

**Self-Hosted Options**
- Docker image: `plantuml/plantuml-server:jetty`
- Deployment via `docker run` or docker-compose
- Port 8080 default
- Security profile: `PLANTUML_SECURITY_PROFILE=INTERNET`
- Requires Tomcat 10+ (javax→jakarta migration)
- Source: https://github.com/plantuml/plantuml-server

**Quick Start Docker:**
```bash
docker pull plantuml/plantuml-server:jetty
docker run -d -p 8080:8080 plantuml/plantuml-server:jetty
```

**docker-compose.yml:**
```yaml
version: '3.8'
services:
  plantuml:
    image: plantuml/plantuml-server:jetty
    container_name: plantuml-server
    ports:
      - "8080:8080"
    restart: unless-stopped
    environment:
      - PLANTUML_SECURITY_PROFILE=INTERNET
```

---

### 2. URL Encoding for PlantUML Syntax

**Three-Step Process:**

1. **UTF-8 Encoding:** Convert diagram text to UTF-8 bytes
2. **Deflate Compression:** Apply deflate compression
3. **Custom Base64-like Encoding:** Encode using custom alphabet

**Custom Alphabet:**
```
0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_
```
(Differs from standard Base64 which uses `+/`)

**Alternative Encodings:**
- **HEX** (prefix `~h`): Uncompressed, longer URLs
- **Brotli:** Supported but usage varies

**Example:**
```
Source:  @startuml Bob -> Alice : hello @enduml
Encoded: SyfFKj2rKt3CoKnELR1Io4ZDoSa70000
URL:     https://www.plantuml.com/plantuml/png/SyfFKj2rKt3CoKnELR1Io4ZDoSa70000
```

**Encoding Libraries:**
- Official PlantUML JAR includes encoder
- Various npm packages available
- Python libraries implement same algorithm

---

### 3. Output Formats

**PNG**
- Endpoint: `/png/ENCODED`
- Raster format, widely supported
- Embeds encoded source in metadata
- All diagram types supported

**SVG**
- Endpoint: `/svg/ENCODED`
- Vector format, scalable
- **Limitation:** Not all diagrams supported (ditaa = PNG only)
- Smaller file size for simple diagrams
- Better for web/ printing

**ASCII Art**
- Endpoint: `/txt/ENCODED`
- Sequence diagrams only
- UTF-8 encoded

**Image Map**
- Endpoint: `/map/ENCODED`
- Returns `<area>` tags for clickable links
- Used with PNG for interactive diagrams

**Proxy Service**
- Endpoint: `/proxy?src=URL&idx=INDEX&fmt=FORMAT`
- Fetches source from remote URL
- Formats: png, svg, eps, epstext, txt
- Useful for external doc hosting

---

### 4. Caching Strategies

**Cache Keys**
- Use hash of PlantUML source code (SHA-256 recommended)
- Example key: `plantuml:sha256:abc123...`

**Cache Mechanisms**

1. **In-Memory (Redis/Memcached)**
   - Fast access
   - Short-term caching (minutes to hours)
   - Good for rate limiting counters too

2. **File System**
   - Store rendered PNG/SVG files
   - Persistent across restarts
   - Use directory structure: `/cache/hash[0:2]/hash`

3. **CDN (CloudFlare, AWS CloudFront)**
   - For public diagrams
   - Global distribution
   - Long cache times (days to weeks)

**Caching Patterns**

**Cache-Aside (Lazy Loading):**
```javascript
// Pseudocode
function renderDiagram(source) {
  const hash = sha256(source);
  let cached = await cache.get(hash);
  if (cached) return cached;

  const encoded = encodePlantUML(source);
  const image = await fetch(`https://plantuml.com/plantuml/png/${encoded}`);
  await cache.set(hash, image, { ttl: 86400 }); // 24h
  return image;
}
```

**TTL Recommendations:**
- Static diagrams: 7-30 days
- Frequently changing: 1-24 hours
- Development: 5-15 minutes

**Cache Invalidation:**
- Manual invalidation API endpoint
- Version-based cache keys (add source hash to key)
- Time-based expiration with background refresh

---

### 5. Error Handling

**Common Errors**
- Server unavailable (503, 504)
- Timeout (complex diagrams)
- Malformed PlantUML syntax
- Encoding errors
- Rate limiting (429)

**Timeout Configuration**
```javascript
// Recommended timeouts
const TIMEOUTS = {
  simple: 10000,    // 10s for simple diagrams
  complex: 30000,   // 30s for complex diagrams
  retry: 5000,      // 5s initial retry delay
};
```

**Retry Strategy**
```javascript
async function fetchWithRetry(url, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(30000)
      });
      if (response.ok) return response;
      if (response.status === 429) {
        // Rate limited - wait and retry
        await delay(Math.pow(2, i) * 1000);
        continue;
      }
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await delay(Math.pow(2, i) * 1000);
    }
  }
}
```

**Fallback Strategies**

1. **Client-Side Rendering (plantuml.js)**
   - Works in browser
   - No network dependency
   - Limited feature support

2. **Local PlantUML JAR**
   - For CLI/desktop apps
   - Full feature support
   - Requires Java runtime

3. **Cached Images**
   - Show stale version if available
   - Clear indicator of outdated status

4. **Fallback Content**
   - Display raw PlantUML code
   - Show error message
   - Provide "retry" button

5. **Alternative Tools**
   - Mermaid (client-side rendering)
   - Kroki (multi-diagram support)

---

### 6. Rate Limiting Considerations

**Official Server**
- No documented rate limits
- Best effort service
- May be throttled under heavy load
- Use responsibly

**Self-Hosted Control**

**Rate Limiting Algorithms:**
1. **Fixed Window:** N requests per minute
2. **Sliding Window:** More accurate, complex
3. **Token Bucket:** Burst capacity
4. **Leaky Bucket:** Smooth rate

**Implementation Points:**
- API key based limits
- IP-based limits (prevent abuse)
- Per-endpoint limits (stricter on expensive operations)
- Dynamic limits based on server load

**Recommended Limits (Self-Hosted):**
- Free tier: 60 req/min (1 per sec)
- Paid tier: 600 req/min (10 per sec)
- Enterprise: Custom

**Tools:**
- NGINX rate limiting
- AWS API Gateway
- Redis + token bucket algorithm

**Response Headers:**
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1641234567
Retry-After: 30
```

---

## Comparative Analysis

| Approach | Pros | Cons | Use Case |
|----------|------|------|----------|
| **Public Server** | Zero setup, free, reliable | Privacy concerns, no SLA, potential rate limits | Prototyping, personal projects |
| **Self-Hosted** | Privacy, control, SLA, customization | Setup, maintenance, scaling | Production, enterprise |
| **plantuml.js** | Client-side, no server | Limited features, browser-only | Web apps, simple diagrams |
| **Local JAR** | Full features, offline | Java required, no API | CLI tools, automation |

---

## Implementation Recommendations

### Quick Start (Public Server)

**1. Encode PlantUML:**
```javascript
import { encode } from 'plantuml-encoder';

const source = `
@startuml
Alice -> Bob: Hello
Bob -> Alice: Hi!
@enduml
`;

const encoded = encode(source);
// Output: "SyfFKj2rKt3CoKnELR1Io4ZDoSa70000"
```

**2. Fetch PNG:**
```javascript
const url = `https://www.plantuml.com/plantuml/png/${encoded}`;
const response = await fetch(url);
const buffer = await response.arrayBuffer();
```

**3. Fetch SVG:**
```javascript
const url = `https://www.plantuml.com/plantuml/svg/${encoded}`;
const response = await fetch(url);
const svg = await response.text();
```

### Production Setup (Self-Hosted)

**1. Deploy Docker:**
```bash
docker-compose up -d
```

**2. Configure Endpoint:**
```javascript
const PLANTUML_SERVER = process.env.PLANTUML_URL || 'http://localhost:8080';
const url = `${PLANTUML_SERVER}/plantuml/png/${encoded}`;
```

**3. Add Caching:**
```javascript
import Redis from 'ioredis';

const redis = new Redis();
const cacheTTL = 86400; // 24h

async function renderDiagram(source) {
  const hash = createHash('sha256').update(source).digest('hex');

  // Check cache
  const cached = await redis.get(`plantuml:${hash}`);
  if (cached) return Buffer.from(cached, 'base64');

  // Fetch from server
  const encoded = encode(source);
  const url = `${PLANTUML_SERVER}/plantuml/png/${encoded}`;
  const response = await fetch(url, { timeout: 30000 });

  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const buffer = await response.arrayBuffer();

  // Cache result
  await redis.setex(`plantuml:${hash}`, cacheTTL, Buffer.from(buffer).toString('base64'));

  return buffer;
}
```

### Complete API Example

```javascript
class PlantUMLRenderer {
  constructor(options = {}) {
    this.serverUrl = options.serverUrl || 'https://www.plantuml.com/plantuml';
    this.cache = options.cache;
    this.timeout = options.timeout || 30000;
    this.maxRetries = options.maxRetries || 3;
  }

  async render(source, format = 'png') {
    const hash = this._hash(source);

    // Check cache
    if (this.cache) {
      const cached = await this.cache.get(hash);
      if (cached) return cached;
    }

    // Encode and fetch
    const encoded = this._encode(source);
    const url = `${this.serverUrl}/${format}/${encoded}`;

    let image;
    try {
      image = await this._fetchWithRetry(url);
    } catch (error) {
      // Fallback to cached version if available
      const stale = await this.cache?.get(`${hash}:stale`);
      if (stale) return stale;
      throw error;
    }

    // Cache result
    if (this.cache) {
      await this.cache.set(hash, image, { ttl: 86400 });
      await this.cache.set(`${hash}:stale`, image, { ttl: 604800 }); // 7d
    }

    return image;
  }

  async _fetchWithRetry(url, attempt = 0) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (!response.ok) {
        if (response.status === 429 && attempt < this.maxRetries) {
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise(r => setTimeout(r, delay));
          return this._fetchWithRetry(url, attempt + 1);
        }
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.arrayBuffer();
    } catch (error) {
      if (attempt < this.maxRetries && error.name !== 'AbortError') {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(r => setTimeout(r, delay));
        return this._fetchWithRetry(url, attempt + 1);
      }
      throw error;
    }
  }

  _hash(source) {
    return createHash('sha256').update(source).digest('hex');
  }

  _encode(source) {
    return encodePlantUML(source); // Use library
  }
}

// Usage
const renderer = new PlantUMLRenderer({
  serverUrl: 'http://localhost:8080/plantuml',
  cache: new RedisCache()
});

const image = await renderer.render(`
@startuml
User -> (Login)
@enduml
`, 'png');
```

---

## Common Pitfalls

1. **Forgetting Deflate Compression:** Direct base64 won't work
2. **Wrong Alphabet:** Standard Base64 fails (use custom alphabet)
3. **Timeout Too Short:** Complex diagrams need 30s+
4. **No Caching:** Unnecessary server load
5. **No Fallback:** Single point of failure
6. **SVG for Ditaa:** Ditaa diagrams only support PNG
7. **Encoding Issues:** Always use UTF-8 before deflate
8. **No Rate Limiting:** Self-hosted servers can be abused
9. **Blocking Main Thread:** Rendering is expensive, use workers/queues
10. **Ignoring Metadata:** Can recover source from PNG

---

## Resources & References

### Official Documentation
- **PlantUML Server:** https://plantuml.com/en/server
- **Encoding Reference:** https://plantuml.com/en/code-javascript
- **GitHub Server:** https://github.com/plantuml/plantuml-server
- **GitHub Core:** https://github.com/plantuml/plantuml

### Docker Deployment
- **Official Image:** `plantuml/plantuml-server:jetty`
- **Docker Hub:** https://hub.docker.com/r/plantuml/plantuml-server
- **Security Docs:** GitHub wiki

### Encoding Libraries
- **npm:** `plantuml-encoder`, `node-plantuml`
- **Python:** `plantuml` (PyPI)
- **Go:** `go-plantuml`
- **Rust:** `plantuml-encoder`

### Community
- **Forum:** https://forum.plantuml.net/
- **Stack Overflow:** Tag `plantuml`
- **Discord:** PlantUML community server

### Further Reading
- **plantuml.js:** Client-side rendering alternative
- **Kroki:** Multi-diagram server (includes PlantUML)
- **Mermaid.js:** Alternative with client-side focus

---

## Unresolved Questions

1. **Exact Rate Limits:** What are the undocumented rate limits on public server?
2. **SLA:** Is there any uptime guarantee for public server?
3. **Brotli Support:** How widely is Brotli encoding supported?
4. **SVG Limitations:** Complete list of diagrams not supporting SVG?
5. **Encoding Patents:** Any IP constraints on custom encoding?

---

## Appendices

### A. Glossary

- **Deflate:** Compression algorithm (RFC 1951)
- **Base64:** Binary-to-text encoding scheme
- **SVG:** Scalable Vector Graphics
- **PNG:** Portable Network Graphics
- **Ditaa:** Diagrams in ASCII art (PlantUML component)
- **WAR:** Web Application Archive (Java)

### B. Encoding Algorithm Details

```
Input: @startuml Bob -> Alice @enduml
Step 1 (UTF-8): Bytes [0x40, 0x73, ...]
Step 2 (Deflate): Compressed bytes [0x78, 0x9c, ...]
Step 3 (Custom Base64): "SyfFKj2rKt3CoKnELR1Io4ZDoSa70000"
```

### C. Raw Research Notes

- Official server supports: png, svg, txt, map, proxy endpoints
- Tomcat 10+ required for self-hosted (Jakarta EE)
- Graphviz included in official Docker image
- Security profile: INTERNET default (can restrict)
- Metadata extraction possible from PNG
- Proxy service fetches from external URLs
- Image maps for interactive diagrams

---

**End of Report**
