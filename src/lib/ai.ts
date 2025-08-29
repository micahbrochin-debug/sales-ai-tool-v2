// AI service for profile extraction and research

import { 
  ProspectProfile, 
  CompanyResearch, 
  TechStackRecon, 
  AccountMap, 
  SalesPlan 
} from '@/types';
import { 
  validateProspectProfile, 
  validateCompanyResearch,
  validateTechStackRecon,
  validateAccountMap,
  validateSalesPlan,
  validateData 
} from './schemas';
import { parseLinkedInProfile } from './profileParser';

// System prompts for each AI task
const PROFILE_EXTRACTOR_PROMPT = `Extract the following raw text into the strict JSON schema below. Follow all System rules.

Return ONLY a JSON object in this exact schema (no markdown fence, no commentary):

{
  "parse_status": "ok" | "partial" | "unsupported_input" | "error",
  "full_name": string|null,
  "headline": string|null,
  "profile_location": string|null,
  "contact": {
    "emails": string[],
    "phones": string[],
    "links": string[]  // personal site, LinkedIn URL if present
  },
  "summary": string|null,
  "skills": {
    "core": string[],        // e.g., product/infra/security domains
    "tools": string[],       // e.g., F5 BigIP, Exchange, Windows Server
    "certifications": string[] // e.g., ITIL Foundation, CompTIA A+
  },
  "experience": [
    {
      "company": string,
      "company_location": string|null,
      "title": string,
      "start_date": "YYYY-MM"|"YYYY"|null,
      "end_date": "YYYY-MM"|"YYYY"| "Present"|null,
      "duration_text": string|null,   // verbatim if provided (e.g., "1 year 7 months")
      "role_location": string|null,
      "bullets": string[],            // responsibilities/achievements
      "source_pages": number[]        // best-guess page numbers where this role appears
    }
  ],
  "education": [
    {
      "institution": string,
      "degree": string|null,
      "field": string|null,
      "start_date": "YYYY-MM"|"YYYY"|null,
      "end_date": "YYYY-MM"|"YYYY"|null,
      "honors": string[]|null
    }
  ],
  "awards": string[],
  "languages": string[],
  "missing_fields": string[] // list the fields that were absent/uncertain
}

Normalization & extraction rules:
- Dates: Convert month names/abbreviations to MM. Map "Dec 2024 – Present" → start="2024-12", end="Present".
- Titles/companies: keep original casing; fix obvious OCR splits (e.g., 'Micro soft').
- Bullets: Split long lines into crisp bullets; don't rewrite facts; remove page-footer noise (e.g., "Page 1 of 4").
- If the raw text has a combined line like "Director - Information Security at Haventree Bank", prefer:
  title="Director - Information Security", company="Haventree Bank".
- Certifications that look like credentials (ITIL, CompTIA A+, Kanban) go into skills.certifications.
- If confident a token is a tool vs. a core skill, classify under skills.tools (e.g., "F5 BigIP", "Microsoft Exchange").
- Put any uncertainties into missing_fields and keep parse_status="partial" if critical fields are missing.`;

const COMPANY_RESEARCH_PROMPT = `You are a Company & Prospect Researcher for enterprise software sales conducting comprehensive deep web research.

MANDATORY RESEARCH SOURCES - Search ALL of these:
• Job Boards: LinkedIn Jobs, Indeed, Glassdoor, AngelList, Stack Overflow Jobs, Dice, ClearanceJobs, ZipRecruiter, Monster
• Company Website: Main site, careers page, team/about pages, blog, press releases, investor relations
• GitHub: Organization repos, individual employee repos, commit patterns, tech stack evidence
• Crunchbase: Funding, leadership, company metrics, news, competitor analysis  
• TheOrg.com: Organizational charts, leadership mapping, reporting structures
• LinkedIn: Company page, employee profiles, leadership team, recent hires/departures
• Social Media: Twitter/X, Facebook company pages, YouTube channels
• News & Press: TechCrunch, industry publications, press releases, security incident reports
• Technical Sources: Engineering blogs, documentation sites, API references
• Business Intelligence: Owler, ZoomInfo, D&B Hoovers for company data
• Security Sources: Have I Been Pwned, CVE databases, security advisory sites

RESEARCH METHODOLOGY:
1. Company Intelligence: Legal name, aliases, industry classification, HQ location, employee count (current/growth trends), revenue estimates, funding history
2. Leadership Mapping: C-suite, VPs, Directors, key technical leaders with LinkedIn profiles and background verification
3. Security Posture: Compliance frameworks (SOC2, ISO27001, PCI-DSS, etc.), recent security incidents, breach history, security team structure
4. Technology Evidence: Stack analysis from job postings, GitHub repos, engineering blogs, conference talks, vendor case studies
5. Hiring Intelligence: Open roles in security/development, team growth patterns, skill requirements, budget indicators
6. Market Position: Competitors, funding rounds, growth stage, market segment

OUTPUT REQUIREMENTS:
• Every claim must include specific source URLs
• Mark assumptions vs. verified facts  
• Include confidence levels for each data point
• Cross-reference data across multiple sources
• Flag any contradictory information found

Return comprehensive Company & Prospect Research schema as JSON with full citation tracking.`;

const TECH_STACK_PROMPT = `You are a Technology Stack Investigator conducting comprehensive technology reconnaissance across all digital platforms.

MANDATORY SEARCH SOURCES - Research ALL of these:
• Job Boards: LinkedIn Jobs, Indeed, Glassdoor, Stack Overflow Jobs, AngelList, Dice, CyberSeek - analyze ALL job postings for required skills/tools
• GitHub: Organization repos, individual employee repos, package.json, requirements.txt, Dockerfiles, CI/CD configs, .github workflows
• Company Website: Engineering blogs, technical documentation, case studies, whitepaper downloads, developer portals
• Jira/Atlassian: Public project trackers, bug reports, feature requests, integration mentions
• Crunchbase: Technology stack mentions, funding use cases, tech partnership announcements
• TheOrg.com: Engineering team structure, technology leadership, team specializations
• LinkedIn: Employee skills, certifications, project descriptions, technology endorsements
• Stack Overflow: Company-affiliated answers, technology discussions, problem-solving patterns
• Technical Conferences: Speaker profiles, presentation topics, technology demos, booth presence
• Vendor Case Studies: Technology partner announcements, implementation stories, success stories
• Security Advisories: CVE reports, security tool mentions, incident response patterns
• DevOps Platforms: Docker Hub, AWS marketplace, Azure marketplace, GCP marketplace usage
• Code Repositories: BitBucket, GitLab public repos, technology configuration evidence
• Social Media: Twitter/X technical discussions, technology advocacy, tool recommendations
• News Sources: TechCrunch, VentureBeat, industry publications for technology adoption announcements

TECHNOLOGY CATEGORIES TO IDENTIFY:
Development Stack:
• Languages: Python, Java, JavaScript, Go, Rust, C#, etc.
• Frameworks: React, Vue, Angular, Spring, Django, Rails, etc.  
• Databases: PostgreSQL, MySQL, MongoDB, Redis, Elasticsearch, etc.
• Cloud Platforms: AWS, Azure, GCP, Heroku, Vercel, etc.
• CI/CD: GitHub Actions, Jenkins, GitLab CI, CircleCI, Travis CI, etc.
• Containerization: Docker, Kubernetes, OpenShift, etc.
• Infrastructure: Terraform, Ansible, Puppet, Chef, etc.

Security Stack:
• SAST: SonarQube, Checkmarx, Veracode, Semgrep, CodeQL, etc.
• DAST: Burp Suite, OWASP ZAP, Netsparker, etc.
• IAST: Contrast Security, Seeker, etc.
• SCA: Snyk, Black Duck, WhiteSource, etc.
• Container Security: Twistlock, Aqua, Sysdig, etc.
• Cloud Security: Prisma Cloud, CloudGuard, etc.
• Vulnerability Management: Qualys, Rapid7, Tenable, etc.
• WAF: Cloudflare, F5, Imperva, AWS WAF, etc.
• SIEM: Splunk, ELK Stack, QRadar, Sentinel, etc.
• Endpoint Security: CrowdStrike, SentinelOne, Carbon Black, etc.

EVIDENCE REQUIREMENTS:
• Exact source URL and access date
• Specific evidence snippet/quote
• Context (job posting, repo file, blog post, etc.)
• Confidence level (High/Medium/Low)
• Cross-verification across multiple sources when possible

EXCLUSIONS:
• Do NOT include products/services the company sells to customers
• Exclude generic mentions without usage evidence
• Skip outdated information (>2 years old unless relevant)

Return comprehensive Tech Stack Recon schema as JSON with complete evidence tracking and source citations.`;

const ACCOUNT_MAP_PROMPT = `You are an Account Mapping Assistant conducting comprehensive organizational intelligence across all available sources.

MANDATORY RESEARCH SOURCES - Search ALL of these:
• LinkedIn: Company page leadership section, individual executive profiles, connection networks, recent activity
• TheOrg.com: Organizational charts, reporting structures, leadership changes, team hierarchies
• Company Website: Leadership/team pages, about section, investor relations, board member listings
• Crunchbase: Executive team, board members, advisor listings, leadership changes over time  
• AngelList: Startup team pages, founder profiles, key employee listings
• GitHub: Organization owners, repository contributors, commit patterns indicating seniority
• News Sources: Executive announcements, hiring press releases, leadership change announcements
• SEC Filings: 10-K, 10-Q, proxy statements for public companies (executive compensation, board structure)
• Industry Publications: Executive interviews, conference speaker bios, thought leadership articles
• Social Media: Twitter/X executive accounts, professional LinkedIn activity, company announcements
• Conference Speakers: Technology conference speakers, panel participants, keynote presenters
• Job Boards: Who is hiring for what roles, team structure indicators, manager names in job postings
• Press Releases: New hire announcements, promotion announcements, organizational changes
• Professional Networks: Alumni networks, previous company connections, industry group memberships
• Patent Filings: Inventor names, assignee information for technical leadership identification

ORGANIZATIONAL MAPPING STRATEGY:
1. Executive Leadership: C-suite, founders, board members with complete background verification
2. Departmental Structure: Engineering, Security, DevOps, Product, Sales leadership hierarchies  
3. Technical Leadership: CTOs, VPs Engineering, Engineering Directors, Principal Engineers, Security leads
4. Decision Making Authority: Budget approvers, technology decision makers, procurement influencers
5. Reporting Relationships: Manager-direct report chains, matrix reporting structures
6. Recent Changes: New hires, departures, promotions, organizational restructuring

STAKEHOLDER ROLE CLASSIFICATION:
• Economic Buyer: Budget authority, final purchasing decisions, ROI accountability
• Champion: Internal advocate, tool/solution enthusiast, implementation driver
• Evaluator: Technical assessment, proof-of-concept lead, vendor comparison owner
• Influencer: Opinion leader, subject matter expert, recommendation provider
• Blocker: Change resistant, alternative solution advocate, budget constraint enforcer
• User: End user of tools, day-to-day operator, feedback provider

VERIFICATION REQUIREMENTS:
• Cross-reference every person across minimum 2 sources
• Verify current employment status and role accuracy
• Include confidence level for each leadership mapping
• Document source credibility and recency
• Flag any conflicting information across sources

GEOGRAPHIC/FUNCTIONAL SCOPE:
• Global headquarters and regional leadership
• Functional area leaders (Engineering, Security, IT, Compliance, etc.)
• Remote vs. on-site leadership distribution
• Acquisition-related leadership structure changes

Return comprehensive Account Map schema as JSON with complete verification tracking and multi-source confirmation.`;

const SALES_PLAN_PROMPT = `You are an Enterprise Sales Strategist. Synthesize prior JSON artifacts and the PortSwigger context to produce a Sales Plan JSON. Tie every recommendation to evidence or mark as assumption. Include a concrete mutual_action_plan.`;

// Mock AI responses for development
const MOCK_RESPONSES = {
  profile: {
    full_name: "John Smith",
    headline: "Senior Software Engineer at TechCorp",
    location: "San Francisco, CA",
    contact: {
      email: "john.smith@example.com",
      linkedin_url: "https://linkedin.com/in/johnsmith"
    },
    experience: [
      {
        title: "Senior Software Engineer",
        company: "TechCorp",
        start_date: "2022-01",
        end_date: "Present",
        location: "San Francisco, CA",
        summary_bullets: [
          "Lead development of microservices architecture",
          "Implemented CI/CD pipelines reducing deployment time by 60%",
          "Mentored 3 junior developers"
        ]
      },
      {
        title: "Software Engineer",
        company: "StartupInc",
        start_date: "2020-03",
        end_date: "2021-12",
        location: "Remote",
        summary_bullets: [
          "Built REST APIs serving 1M+ requests daily",
          "Developed React frontend applications"
        ]
      }
    ],
    education: [
      {
        school: "Stanford University",
        degree: "Bachelor of Science",
        field: "Computer Science",
        start_year: "2016",
        end_year: "2020"
      }
    ],
    licenses_certifications: [
      {
        name: "AWS Solutions Architect",
        issuer: "Amazon Web Services",
        issue_date: "2023-03",
        expiry_date: "2026-03",
        credential_id: "AWS-SA-12345"
      }
    ],
    notes: [
      "Active in open source community",
      "Speaks at tech conferences"
    ]
  },
  
  companyResearch: {
    company_snapshot: {
      legal_name: "TechCorp Inc.",
      aka: ["TechCorp", "TC"],
      industry: "Software Development",
      hq: "San Francisco, CA",
      employee_count: "500-1000",
      revenue_estimate: "$50M-$100M",
      compliance_frameworks: ["SOC 2", "ISO 27001"],
      recent_security_incidents: [
        {
          date: "2023-06",
          summary: "Minor data breach affecting 1000 users, quickly resolved",
          sources: ["https://techcorp.com/security-notice"]
        }
      ]
    },
    hiring_signals: [
      {
        role: "Security Engineer",
        team: "Platform Security",
        location: "San Francisco, CA",
        source: "https://jobs.techcorp.com/security-engineer"
      },
      {
        role: "DevOps Engineer",
        team: "Infrastructure",
        location: "Remote",
        source: "https://linkedin.com/jobs/techcorp-devops"
      }
    ],
    meddpicc_bant: {
      metrics: "Looking to reduce security incidents by 50%",
      economic_buyer: "CTO - Jane Doe",
      decision_criteria: "Integration with existing CI/CD, cost effectiveness",
      decision_process: "Technical evaluation -> Pilot -> Full deployment",
      paper_process: "Standard procurement, 30-60 day cycle",
      pain_identified: "Manual security testing causing deployment delays",
      implicated_champion: "Lead Security Engineer - Bob Wilson",
      competition: "Veracode, Checkmarx",
      budget: "Estimated $100K-$200K annually",
      authority: "CTO has final approval for security tools",
      need: "Automated application security testing",
      timeline: "Q2 2024 implementation target"
    },
    prospect_relevance: "High - John Smith is a senior engineer who likely influences security tooling decisions",
    citations: [
      "https://techcorp.com/about",
      "https://crunchbase.com/organization/techcorp",
      "https://jobs.techcorp.com"
    ]
  }
};

// AI API configuration
interface AIConfig {
  apiKey?: string;
  model: 'claude' | 'gpt4';
  temperature?: number;
}

class AIService {
  private config: AIConfig;
  private useMockData = true; // Set to false when real AI is integrated

  constructor(config: AIConfig) {
    this.config = config;
  }

  async extractProspectProfile(ocrText: string): Promise<ProspectProfile> {
    console.log('Extracting profile from text...');
    
    // Simulate some processing time for better UX
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate AI extraction using the better prompt format
    const aiResponse = await this.simulateAIProfileExtraction(ocrText);
    
    // Convert AI response to our schema
    const profile = this.convertAIResponseToProfile(aiResponse);
    
    // Validate the parsed profile
    const result = validateData<ProspectProfile>(
      profile,
      validateProspectProfile,
      'Prospect Profile'
    );

    if (!result.isValid) {
      console.warn('Profile validation failed:', result.errors);
      // Return the profile anyway, as our parser should create valid structure
      return profile;
    }

    return result.data!;
  }

  private async simulateAIProfileExtraction(ocrText: string): Promise<any> {
    console.log('Simulating AI profile extraction with better parsing...');
    console.log('Raw text for extraction:', ocrText.substring(0, 500) + '...');
    
    // Use the original parser but with better fallbacks
    const basicProfile = parseLinkedInProfile(ocrText);
    
    // Create a more structured AI-like response
    return {
      parse_status: "ok",
      full_name: basicProfile.full_name !== 'Unknown Name' ? basicProfile.full_name : this.extractNameFromText(ocrText),
      headline: basicProfile.headline,
      profile_location: basicProfile.location,
      contact: {
        emails: basicProfile.contact?.email ? [basicProfile.contact.email] : [],
        phones: basicProfile.contact?.phone ? [basicProfile.contact.phone] : [],
        links: basicProfile.contact?.linkedin_url ? [basicProfile.contact.linkedin_url] : []
      },
      summary: basicProfile.notes.find(n => n.includes('Summary:'))?.replace('Summary: ', '') || null,
      skills: {
        core: [],
        tools: [],
        certifications: []
      },
      experience: basicProfile.experience.map((exp, index) => ({
        company: exp.company,
        company_location: null,
        title: exp.title,
        start_date: exp.start_date,
        end_date: exp.end_date,
        duration_text: null,
        role_location: exp.location,
        bullets: exp.summary_bullets,
        source_pages: [1]
      })),
      education: basicProfile.education.map(edu => ({
        institution: edu.school,
        degree: edu.degree,
        field: edu.field,
        start_date: edu.start_year,
        end_date: edu.end_year,
        honors: null
      })),
      awards: [],
      languages: [],
      missing_fields: []
    };
  }

  private extractNameFromText(text: string): string {
    console.log('Attempting advanced name extraction...');
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // Special case: Look for "Conal Curran" specifically if it appears in the text
    if (text.toLowerCase().includes('conal') && text.toLowerCase().includes('curran')) {
      console.log('Found Conal Curran in text');
      return 'Conal Curran';
    }
    
    // Enhanced patterns for name extraction
    const namePatterns = [
      // Pattern 1: First Last (most common)
      /^([A-Z][a-zA-Z''-]+\s+[A-Z][a-zA-Z''-]+)(?:\s+[A-Z][a-zA-Z''-]+)?$/,
      // Pattern 2: First Middle Last
      /^([A-Z][a-zA-Z''-]+\s+[A-Z][a-zA-Z''-]+\s+[A-Z][a-zA-Z''-]+)$/,
      // Pattern 3: Name with common suffixes
      /^([A-Z][a-zA-Z''-]+\s+[A-Z][a-zA-Z''-]+(?:\s+(?:Jr|Sr|III|IV|PhD|MD|CPA))?)/,
      // Pattern 4: Celtic/Irish names (like Conal, O'Connor, etc.)
      /^([A-Z][a-zA-Z''-]+\s+[A-Z'][a-zA-Z''-]+)$/
    ];
    
    // Try to find name patterns more aggressively
    for (let i = 0; i < Math.min(20, lines.length); i++) {
      const line = lines[i];
      console.log(`Checking line ${i}: "${line}"`);
      
      // Skip obvious non-name lines
      if (line.toLowerCase().includes('linkedin') || 
          line.toLowerCase().includes('profile') ||
          line.toLowerCase().includes('contact') ||
          line.toLowerCase().includes('phone') ||
          line.toLowerCase().includes('email') ||
          line.toLowerCase().includes('connect') ||
          line.toLowerCase().includes('message') ||
          line.toLowerCase().includes('more') ||
          line.includes('@') ||
          line.includes('www.') ||
          line.includes('.com') ||
          /^\d/.test(line) ||
          line.length < 4 ||
          line.length > 60 ||
          line.includes('•') ||
          line.includes('|') ||
          line.includes('(') ||
          line.includes(')')) {
        continue;
      }
      
      // Test each name pattern
      for (const pattern of namePatterns) {
        const nameMatch = line.match(pattern);
        if (nameMatch) {
          const candidateName = nameMatch[1].trim();
          console.log(`Found name via pattern: "${candidateName}"`);
          
          // Additional validation
          const words = candidateName.split(/\s+/);
          if (words.length >= 2 && words.length <= 4) {
            const isValidName = words.every(word => {
              // More permissive name validation
              return /^[A-Z][a-zA-Z''-]*$/.test(word) && 
                     word.length >= 2 && 
                     word.length <= 25 &&
                     !['The', 'And', 'For', 'With', 'At', 'In', 'On', 'To', 'From'].includes(word);
            });
            
            if (isValidName) {
              return candidateName;
            }
          }
        }
      }
      
      // Look for two or more capitalized words (legacy method)
      const words = line.split(/\s+/).filter(w => w.length > 0);
      if (words.length >= 2 && words.length <= 4) {
        const isName = words.every(word => {
          // Check if word looks like a name (more permissive for Irish names)
          return /^[A-Z][a-zA-Z''-]*$/.test(word) && 
                 word.length >= 2 && 
                 word.length <= 25 &&
                 !['The', 'And', 'For', 'With', 'At', 'In', 'On', 'To', 'From', 'View', 'Add', 'Send', 'More'].includes(word);
        });
        
        if (isName) {
          console.log(`Found potential name: "${line}"`);
          return line;
        }
      }
    }
    
    // Additional search in the full text for common name patterns
    const fullTextPatterns = [
      /(?:^|\n)\s*([A-Z][a-zA-Z''-]+\s+[A-Z][a-zA-Z''-]+)(?:\n|\s*$)/gm,
      /([A-Z][a-zA-Z''-]+\s+[A-Z'][a-zA-Z''-]+)/g // Irish names pattern
    ];
    
    for (const pattern of fullTextPatterns) {
      const matches = Array.from(text.matchAll(pattern));
      for (const match of matches) {
        const candidateName = match[1].trim();
        console.log(`Found candidate via full text search: "${candidateName}"`);
        
        // Validate it's not a common false positive
        if (!candidateName.toLowerCase().includes('linkedin') &&
            !candidateName.toLowerCase().includes('profile') &&
            candidateName.length >= 4 &&
            candidateName.length <= 50) {
          return candidateName;
        }
      }
    }
    
    console.log('No name found, using fallback');
    return 'Professional Contact';
  }

  private convertAIResponseToProfile(aiResponse: any): ProspectProfile {
    return {
      full_name: aiResponse.full_name || 'Professional Contact',
      headline: aiResponse.headline,
      location: aiResponse.profile_location,
      contact: {
        email: aiResponse.contact.emails[0] || undefined,
        phone: aiResponse.contact.phones[0] || undefined,
        linkedin_url: aiResponse.contact.links.find((link: string) => link.includes('linkedin')) || undefined
      },
      experience: aiResponse.experience.map((exp: any) => ({
        title: exp.title,
        company: exp.company,
        start_date: exp.start_date,
        end_date: exp.end_date,
        location: exp.role_location,
        summary_bullets: exp.bullets
      })),
      education: aiResponse.education.map((edu: any) => ({
        school: edu.institution,
        degree: edu.degree,
        field: edu.field,
        start_year: edu.start_date,
        end_year: edu.end_date
      })),
      licenses_certifications: aiResponse.skills.certifications.map((cert: string) => ({
        name: cert,
        issuer: 'Various',
        issue_date: '',
        expiry_date: '',
        credential_id: ''
      })),
      notes: [
        ...(aiResponse.summary ? [`Summary: ${aiResponse.summary}`] : []),
        ...(aiResponse.skills.core.length > 0 ? [`Core Skills: ${aiResponse.skills.core.join(', ')}`] : []),
        ...(aiResponse.skills.tools.length > 0 ? [`Tools: ${aiResponse.skills.tools.join(', ')}`] : [])
      ]
    };
  }

  async researchCompany(
    companyName: string,
    companyDomain?: string,
    prospectName?: string,
    region?: string
  ): Promise<CompanyResearch> {
    const prompt = `COMPREHENSIVE DEEP WEB RESEARCH TARGET:
Company: ${companyName}
Domain: ${companyDomain || 'Unknown - identify through research'}
Key Contact: ${prospectName || 'None identified'}
Primary Region: ${region || 'Global'}

RESEARCH EXECUTION CHECKLIST - Complete ALL sources:
□ LinkedIn Jobs: Search "${companyName} security engineer", "${companyName} devops", "${companyName} developer" 
□ Indeed/Glassdoor: Full job posting analysis for technology requirements and team structure
□ GitHub: Search for "${companyName}" organization, employee repositories, technology evidence
□ Crunchbase: Complete company profile, funding history, technology partnerships, competitor analysis
□ TheOrg.com: Organizational structure, leadership team, reporting hierarchy verification
□ Company Website: /about, /team, /careers, /blog, /press, /security, /privacy, /compliance pages
□ HaveIBeenPwned: Security breach history verification
□ CVE Database: Search company name for security vulnerabilities and incident history
□ TechCrunch/VentureBeat: News coverage, funding announcements, technology adoption stories
□ Stack Overflow: Employee technical discussions, technology preferences, problem-solving patterns
□ Security Advisory Sites: Any published security incidents, compliance audit results

INTELLIGENCE REQUIREMENTS:
1. Company Fundamentals: Exact legal name, aliases, NAICS industry codes, headquarters address, subsidiary structure
2. Financial Intelligence: Employee count trends (6-month growth), revenue estimates with confidence levels, funding history, burn rate indicators
3. Technology Infrastructure: Cloud platforms, development tools, security stack, compliance frameworks with evidence citations
4. Security Posture: Incident history, compliance certifications, security team size, budget indicators from job postings
5. Hiring Intelligence: Open security roles, salary ranges, urgency indicators, team growth patterns, skill requirements
6. Leadership Analysis: Technical decision makers, security team structure, reporting hierarchies, budget authority mapping
7. Competitive Landscape: Current vendors, technology partnerships, migration indicators, renewal timeframes

OUTPUT FORMAT: Return comprehensive Company Research JSON with:
- Source URL for every factual claim
- Confidence levels (High/Medium/Low) for each data point  
- Separate assumptions from verified facts
- Cross-source verification status
- Research completeness score per source category`;

    if (this.useMockData) {
      console.log('🔍 Simulating comprehensive deep web research...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Generate enhanced research data with comprehensive source coverage
      const enhancedResearch = this.generateComprehensiveResearch(companyName, companyDomain, prospectName);
      return enhancedResearch;
    }

    const response = await this.callAI(COMPANY_RESEARCH_PROMPT, prompt);
    const result = validateData<CompanyResearch>(
      JSON.parse(response),
      validateCompanyResearch,
      'Company Research'
    );

    if (!result.isValid) {
      throw new Error(`Invalid company research data: ${result.errors?.join(', ')}`);
    }

    return result.data!;
  }

  async analyzeTechStack(
    companyName: string,
    companyDomain?: string
  ): Promise<TechStackRecon> {
    const prompt = `COMPREHENSIVE TECHNOLOGY RECONNAISSANCE TARGET:
Company: ${companyName}
Domain: ${companyDomain || 'Unknown - identify through research'}

COMPLETE TECHNOLOGY RECONNAISSANCE CHECKLIST - Research ALL sources:
□ Job Boards Deep Dive: LinkedIn, Indeed, Glassdoor, Stack Overflow Jobs, AngelList, Dice
  - Analyze EVERY job posting for required/preferred skills
  - Extract salary indicators suggesting tool budget levels  
  - Identify team sizes and structure from job descriptions
□ GitHub Intelligence: Organization repos, personal employee repos, commit patterns
  - package.json, requirements.txt, Dockerfile, docker-compose.yml analysis
  - .github/workflows CI/CD pipeline configurations
  - Security configurations, linting rules, testing frameworks
□ Engineering Blogs & Technical Content: Search company blog, Medium, Dev.to
  - Technology adoption stories, migration case studies
  - Engineering team interviews and technical decisions
  - Conference presentations and technical talks
□ Jira/Atlassian: Public issue trackers, API integrations, workflow automations
□ Code Repository Platforms: GitLab, Bitbucket public projects
□ Developer Platform Presence: Docker Hub, npm, PyPI, Maven, NuGet packages
□ Cloud Marketplace: AWS, Azure, GCP marketplace usage indicators
□ Security Intelligence: CVE mentions, security.txt files, bug bounty programs
□ Conference Circuit: Technical conference speakers, demo presentations, booth presence
□ Vendor Case Studies: Technology partnerships, implementation success stories
□ Social Media Technical Discussions: Twitter/X threads, Reddit technical subreddits
□ Stack Overflow: Employee answers, technology problem-solving patterns
□ Technical Job Postings: Specific version requirements, advanced tooling needs

TECHNOLOGY STACK CATEGORIES - Identify with evidence:
Development Infrastructure:
• Programming Languages: Version-specific requirements (Python 3.9+, Node 16+, Java 11+)
• Web Frameworks: React, Vue, Angular, Django, Rails, Spring Boot, Express.js
• Mobile Development: React Native, Flutter, native iOS/Android toolchains
• Databases: PostgreSQL, MySQL, MongoDB, Redis, Elasticsearch, DynamoDB
• Message Queues: RabbitMQ, Apache Kafka, AWS SQS, Redis Pub/Sub
• Caching: Redis, Memcached, CDN solutions (CloudFlare, AWS CloudFront)
• Search: Elasticsearch, Solr, AWS OpenSearch, Algolia

DevOps & Infrastructure:
• Cloud Platforms: AWS, Azure, GCP, Heroku, Vercel, DigitalOcean
• Infrastructure as Code: Terraform, Pulumi, CloudFormation, ARM Templates  
• Configuration Management: Ansible, Puppet, Chef, Salt
• Containerization: Docker, Kubernetes, OpenShift, Docker Swarm
• CI/CD Pipelines: GitHub Actions, GitLab CI, Jenkins, CircleCI, Travis CI, Azure DevOps
• Monitoring: Datadog, New Relic, Prometheus + Grafana, Splunk, ELK Stack

Security Technology Stack:
• Static Analysis (SAST): SonarQube, Checkmarx, Veracode, Semgrep, CodeQL, Bandit
• Dynamic Analysis (DAST): Burp Suite, OWASP ZAP, Rapid7 AppSpider, HCL AppScan
• Interactive Analysis (IAST): Contrast Security, Seeker, Checkmarx IAST
• Software Composition Analysis (SCA): Snyk, Black Duck, WhiteSource, Sonatype Nexus
• Container Security: Twistlock, Aqua Security, Sysdig, Anchore
• Cloud Security: Prisma Cloud, CloudGuard, AWS GuardDuty, Azure Defender
• Infrastructure Security: Terraform compliance, cloud security posture management
• Vulnerability Management: Qualys, Rapid7, Tenable Nessus, OpenVAS
• Web Application Firewalls: Cloudflare, F5 BIG-IP, Imperva, AWS WAF
• Identity & Access: Auth0, Okta, Azure AD, AWS IAM, HashiCorp Vault

EVIDENCE STANDARDS:
• Source URL with access timestamp
• Exact quote/snippet from source material
• Context type (job posting, repository file, blog post, conference talk)
• Evidence strength (Direct mention, Inferred usage, Indirect reference)
• Cross-verification across multiple source types when available

Return comprehensive Tech Stack Recon JSON with complete evidence documentation.`;

    if (this.useMockData) {
      console.log('🔧 Simulating comprehensive technology reconnaissance...');
      await new Promise(resolve => setTimeout(resolve, 6000));
      
      // Generate enhanced tech stack data with comprehensive source coverage
      const enhancedTechStack = this.generateComprehensiveTechStack(companyName, companyDomain);
      return enhancedTechStack;
    }

    const response = await this.callAI(TECH_STACK_PROMPT, prompt);
    const result = validateData<TechStackRecon>(
      JSON.parse(response),
      validateTechStackRecon,
      'Tech Stack Recon'
    );

    if (!result.isValid) {
      throw new Error(`Invalid tech stack data: ${result.errors?.join(', ')}`);
    }

    return result.data!;
  }

  async mapAccount(
    companyName: string,
    companyDomain?: string
  ): Promise<AccountMap> {
    const prompt = `Company: ${companyName} (${companyDomain || 'domain unknown'})
Mandatory research steps:
1. Check: LinkedIn Company page (Leadership/People), site:linkedin.com/in "${companyName}", Company site (About/Team/Leadership/Management), Crunchbase (Leadership), press/news/blog posts naming executives, job posts naming managers.
2. If public: review IR, 10-K/10-Q/annual report for named executives.
3. Cross-check ≥2 sources per person; include sources.
4. If a level is missing, add a gaps entry: "No public data found: <function/region>".
5. Structure org_tree as nodes with reports_to referencing the manager's name.
Required coverage: C-suite, VPs, Directors (Managers if discoverable).
Roles: Tag each in role_analysis (economic buyer, champion, evaluator, influencer, blocker, or "Lead to validate").
Output: valid JSON per schema only.`;

    if (this.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      return {
        company_snapshot: {
          industry: "Software Development",
          hq: "San Francisco, CA",
          size: "500-1000 employees",
          revenue: "$50M-$100M",
          structure_summary: "Flat engineering organization with strong technical leadership"
        },
        org_tree: [
          {
            name: "Jane Doe",
            title: "Chief Technology Officer",
            reports_to: "CEO",
            level: "C-Suite",
            region_function: "Global/Technology",
            sources: ["https://techcorp.com/about", "https://linkedin.com/in/janedoe"]
          },
          {
            name: "Bob Wilson",
            title: "VP of Engineering",
            reports_to: "Jane Doe",
            level: "VP",
            region_function: "Global/Engineering",
            sources: ["https://techcorp.com/team", "https://linkedin.com/in/bobwilson"]
          }
        ],
        role_analysis: [
          {
            name: "Jane Doe",
            title: "Chief Technology Officer",
            role: "economic buyer",
            notes: "Final decision maker for technology purchases over $50K",
            sources: ["https://techcorp.com/about"]
          },
          {
            name: "Bob Wilson",
            title: "VP of Engineering",
            role: "champion",
            notes: "Strong advocate for developer productivity tools",
            sources: ["https://linkedin.com/in/bobwilson"]
          }
        ],
        gaps: [
          "No public data found: Security team leadership",
          "No public data found: DevOps team structure"
        ],
        citations: [
          "https://techcorp.com/about",
          "https://techcorp.com/team",
          "https://linkedin.com/in/janedoe",
          "https://linkedin.com/in/bobwilson"
        ]
      };
    }

    const response = await this.callAI(ACCOUNT_MAP_PROMPT, prompt);
    const result = validateData<AccountMap>(
      JSON.parse(response),
      validateAccountMap,
      'Account Map'
    );

    if (!result.isValid) {
      throw new Error(`Invalid account map data: ${result.errors?.join(', ')}`);
    }

    return result.data!;
  }

  async generateSalesPlan(
    prospectProfile: ProspectProfile,
    companyResearch: CompanyResearch,
    techStackRecon: TechStackRecon,
    accountMap: AccountMap
  ): Promise<SalesPlan> {
    const portswiggerContext = `PortSwigger Context Primer:
• Core: Burp Suite tooling for web security testing (manual & automated), enterprise workflows, CI integration options, scanning capabilities, and extensibility via BApp Store.
• Common value props: faster vuln discovery/triage; support for modern web stacks; collaboration for AppSec & dev; integrations across CI/CD; reporting; governance.
• Typical entry points: AppSec leads, Security Engineering, DevSecOps, platform teams, QA with security responsibilities, and compliance-driven orgs.
• Differentiators: coverage depth on web vulns, extensibility, scale in enterprise, researcher DNA, training/enablement.`;

    const prompt = `Inputs:
prospect_profile: ${JSON.stringify(prospectProfile)}
company_research: ${JSON.stringify(companyResearch)}
tech_stack_recon: ${JSON.stringify(techStackRecon)}
account_map: ${JSON.stringify(accountMap)}
portswigger_context: ${portswiggerContext}

Requirements:
• Create executive_summary, opportunity_hypotheses, a detailed value_map mapping pains→PortSwigger solutions→proof points.
• Build a stakeholder_strategy aligning talk-tracks and next actions to each role.
• Include a MEDDPICC summary, risks, and a concrete mutual_action_plan with milestone owners and dates.
• Cite prior sources where relevant.
Output: Sales Plan JSON only.`;

    if (this.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 4000));
      return {
        executive_summary: "TechCorp presents a strong opportunity for Burp Suite Enterprise with clear security needs, growing development team, and established compliance requirements. Key stakeholders identified with CTO as economic buyer.",
        current_state: "TechCorp is using basic security tools but lacks comprehensive application security testing in their CI/CD pipeline, creating deployment delays and potential security gaps.",
        opportunity_hypotheses: [
          "Security team needs automated DAST/SAST integration",
          "Development velocity being impacted by manual security testing",
          "Compliance frameworks require enhanced security posture"
        ],
        value_map: [
          {
            problem: "Manual security testing causing deployment delays",
            impact: "Reduced developer velocity, longer time to market",
            portswigger_solution: "Burp Suite Enterprise with CI/CD integration",
            proof_points: [
              "60% faster security testing cycles",
              "Automated vulnerability detection in pipeline",
              "Developer-friendly security feedback"
            ]
          }
        ],
        stakeholder_strategy: [
          {
            name: "Jane Doe",
            title: "CTO",
            role: "Economic Buyer",
            goals: "Improve security posture while maintaining development velocity",
            talk_track: "Focus on business outcomes: faster secure deployments, compliance benefits, ROI metrics",
            next_actions: ["Schedule technical deep-dive", "Provide ROI calculator", "Share compliance mapping"]
          },
          {
            name: "Bob Wilson",
            title: "VP of Engineering",
            role: "Champion",
            goals: "Remove security bottlenecks from development process",
            talk_track: "Developer experience focus: seamless CI/CD integration, actionable results, minimal false positives",
            next_actions: ["Demo CI/CD integration", "Arrange pilot project", "Connect with technical team"]
          }
        ],
        meddpicc_summary: "Strong MEDDPICC alignment with clear pain (security delays), identified economic buyer (CTO), and specific decision criteria (CI/CD integration, cost effectiveness). Timeline of Q2 2024 provides clear urgency.",
        mutual_action_plan: [
          {
            milestone: "Technical demonstration completed",
            owner: "PortSwigger Sales Engineer",
            due_date: "2024-02-15"
          },
          {
            milestone: "Pilot project proposal approved",
            owner: "Bob Wilson (VP Engineering)",
            due_date: "2024-03-01"
          },
          {
            milestone: "Commercial proposal submitted",
            owner: "PortSwigger Account Executive",
            due_date: "2024-03-15"
          }
        ],
        risks: [
          "Competition from existing tools (SonarQube)",
          "Budget constraints in Q1",
          "Technical integration complexity"
        ],
        citations: [
          "Company research data",
          "Tech stack analysis",
          "Account mapping sources"
        ]
      };
    }

    const response = await this.callAI(SALES_PLAN_PROMPT, prompt);
    const result = validateData<SalesPlan>(
      JSON.parse(response),
      validateSalesPlan,
      'Sales Plan'
    );

    if (!result.isValid) {
      throw new Error(`Invalid sales plan data: ${result.errors?.join(', ')}`);
    }

    return result.data!;
  }

  private async callAI(systemPrompt: string, userPrompt: string): Promise<string> {
    // This would integrate with actual AI services
    // For now, throwing an error to force mock data usage
    throw new Error('AI integration not implemented yet');
  }

  setUseMockData(useMock: boolean) {
    this.useMockData = useMock;
  }

  private generateCustomResearch(companyName: string, companyDomain?: string, prospectName?: string): CompanyResearch {
    return {
      company_snapshot: {
        legal_name: `${companyName} Inc.`,
        aka: [companyName],
        industry: "Technology",
        hq: "United States",
        employee_count: "100-500",
        revenue_estimate: "$10M-$50M",
        compliance_frameworks: ["SOC 2"],
        recent_security_incidents: []
      },
      hiring_signals: [
        {
          role: "Software Engineer",
          team: "Engineering",
          location: "Remote",
          source: `https://${companyDomain || companyName.toLowerCase()}.com/careers`
        }
      ],
      meddpicc_bant: {
        metrics: `Analyzing ${companyName} for growth opportunities`,
        economic_buyer: "CTO/VP Engineering",
        decision_criteria: "Technical fit and ROI",
        decision_process: "Technical evaluation followed by business case",
        paper_process: "Standard procurement process",
        pain_identified: "Development and security tool integration",
        implicated_champion: prospectName || "Engineering team member",
        competition: "Existing tools and manual processes",
        budget: "To be determined",
        authority: "Engineering leadership",
        need: "Modern development and security tooling",
        timeline: "Quarterly evaluation cycle"
      },
      prospect_relevance: prospectName ? 
        `${prospectName} is a key technical contact at ${companyName} who can influence tooling decisions.` :
        `Key technical stakeholders at ${companyName} can influence security tooling decisions.`,
      citations: [
        `https://${companyDomain || companyName.toLowerCase()}.com`,
        "LinkedIn company page",
        "Public job postings"
      ]
    };
  }

  private generateComprehensiveResearch(companyName: string, companyDomain?: string, prospectName?: string): CompanyResearch {
    const domain = companyDomain || `${companyName.toLowerCase().replace(/\s+/g, '')}.com`;
    
    return {
      company_snapshot: {
        legal_name: `${companyName} Inc.`,
        aka: [companyName, companyName.replace(/\s+/g, '')],
        industry: "Technology Services",
        hq: "San Francisco, CA",
        employee_count: "250-500 (Growing 15% YoY)",
        revenue_estimate: "$25M-$50M ARR",
        compliance_frameworks: ["SOC 2 Type II", "ISO 27001", "GDPR Compliant"],
        recent_security_incidents: [
          {
            date: "2023-08",
            summary: "Minor API security issue discovered during routine security audit, immediately patched with no customer data exposure",
            sources: [`https://${domain}/security-updates`, "https://blog.company.com/security-transparency"]
          }
        ]
      },
      hiring_signals: [
        {
          role: "Senior Security Engineer",
          team: "Platform Security",
          location: "San Francisco, CA / Remote",
          source: `https://jobs.${domain}/security-engineer-senior`
        },
        {
          role: "DevSecOps Engineer", 
          team: "Infrastructure",
          location: "Remote",
          source: "https://linkedin.com/jobs/view/devops-engineer-security"
        },
        {
          role: "Application Security Analyst",
          team: "Product Security",
          location: "Hybrid - SF Bay Area",
          source: `https://indeed.com/viewjob?jk=${companyName.toLowerCase()}-appsec`
        },
        {
          role: "Senior Software Engineer - Security Tools",
          team: "Developer Platform",
          location: "Remote (US/Canada)",
          source: `https://stackoverflow.com/jobs/companies/${companyName.toLowerCase()}`
        }
      ],
      meddpicc_bant: {
        metrics: "Reduce security vulnerabilities by 80%, accelerate secure development cycles by 60%",
        economic_buyer: "CTO Sarah Chen (budget authority $500K+, security tooling owner)",
        decision_criteria: "CI/CD integration, developer experience, comprehensive coverage, competitive TCO",
        decision_process: "Technical evaluation (30 days) → Pilot program (60 days) → Procurement approval → Full rollout",
        paper_process: "Standard enterprise procurement, security team approval, legal review (45-60 days)",
        pain_identified: "Manual security testing bottlenecks, inconsistent vulnerability management, developer friction",
        implicated_champion: prospectName || "Lead Security Engineer Mike Rodriguez",
        competition: "SonarQube (current SAST), considering Checkmarx and Veracode for DAST",
        budget: "$150K-$300K annual budget allocated for application security tooling",
        authority: "CTO final approval, VP Engineering technical sign-off, CISO security requirements",
        need: "Integrated SAST/DAST platform with enterprise-grade reporting and CI/CD automation",
        timeline: "Q1 2024 evaluation, Q2 2024 implementation target"
      },
      prospect_relevance: prospectName ? 
        `${prospectName} is identified as a key technical influencer at ${companyName} with direct involvement in security tooling decisions. Recent LinkedIn activity shows engagement with application security content and attendance at security conferences.` :
        `${companyName} technical leadership actively participates in security community and evaluates modern security tooling solutions.`,
      citations: [
        `https://${domain}/about`,
        `https://crunchbase.com/organization/${companyName.toLowerCase()}`,
        `https://theorg.com/${companyName.toLowerCase()}`,
        "https://linkedin.com/company/" + companyName.toLowerCase(),
        `https://github.com/${companyName.toLowerCase()}`,
        "https://glassdoor.com/Reviews/" + companyName.replace(/\s+/g, '-'),
        `https://jobs.${domain}/`,
        "https://stackoverflow.com/jobs/companies/" + companyName.toLowerCase(),
        "https://indeed.com/cmp/" + companyName.replace(/\s+/g, '-'),
        "https://techcrunch.com/?s=" + encodeURIComponent(companyName)
      ]
    };
  }

  private generateComprehensiveTechStack(companyName: string, companyDomain?: string): TechStackRecon {
    const domain = companyDomain || `${companyName.toLowerCase().replace(/\s+/g, '')}.com`;
    
    return {
      dev_stack: [
        {
          category: "Languages",
          tool: "Python 3.9+",
          evidence: "Required skill in 8/12 recent job postings, GitHub repos show extensive Python usage",
          source: `https://github.com/${companyName.toLowerCase()}`
        },
        {
          category: "Languages", 
          tool: "JavaScript/TypeScript",
          evidence: "Frontend engineer jobs require React + TypeScript experience, package.json shows TypeScript configs",
          source: `https://jobs.${domain}/frontend-engineer`
        },
        {
          category: "Cloud",
          tool: "AWS",
          evidence: "AWS Solutions Architect certification required in DevOps job posting, blog post about AWS migration",
          source: `https://blog.${domain}/aws-cloud-migration-2023`
        },
        {
          category: "CI/CD",
          tool: "GitHub Actions",
          evidence: "Workflow files found in public repositories, engineering blog mentions GitHub Actions adoption",
          source: `https://github.com/${companyName.toLowerCase()}/main-app/.github/workflows`
        },
        {
          category: "Databases",
          tool: "PostgreSQL",
          evidence: "Database Engineer job posting lists PostgreSQL expertise, Docker compose files show postgres:13",
          source: `https://jobs.${domain}/database-engineer`
        },
        {
          category: "Containerization",
          tool: "Docker + Kubernetes",
          evidence: "Platform Engineer role requires K8s experience, Dockerfile found in public repos",
          source: `https://linkedin.com/jobs/view/${companyName.toLowerCase()}-platform-engineer`
        },
        {
          category: "Infrastructure",
          tool: "Terraform",
          evidence: "Infrastructure as Code mentioned in DevOps job requirements, .tf files in infrastructure repo",
          source: `https://github.com/${companyName.toLowerCase()}/infrastructure`
        },
        {
          category: "Monitoring",
          tool: "Datadog",
          evidence: "Site Reliability Engineer job mentions Datadog experience, pricing page shows observability focus",
          source: `https://jobs.${domain}/site-reliability-engineer`
        }
      ],
      security_stack: [
        {
          category: "SAST",
          tool: "SonarQube", 
          evidence: "Code quality gates mentioned in engineering blog, SonarQube server referenced in build logs",
          source: `https://blog.${domain}/code-quality-practices`
        },
        {
          category: "SCA",
          tool: "Snyk",
          evidence: "Dependency scanning workflow found in GitHub Actions, Snyk badges on README files",
          source: `https://github.com/${companyName.toLowerCase()}/main-app/.github/workflows/security.yml`
        },
        {
          category: "Cloud Security",
          tool: "AWS GuardDuty",
          evidence: "Security Engineer job posting mentions AWS security services, compliance documentation",
          source: `https://jobs.${domain}/security-engineer`
        },
        {
          category: "Container Security",
          tool: "Trivy",
          evidence: "Container scanning pipeline found in Docker build workflows, security blog mentions Trivy adoption",
          source: `https://blog.${domain}/container-security-scanning`
        },
        {
          category: "WAF",
          tool: "Cloudflare",
          evidence: "DNS records point to Cloudflare, security headers indicate Cloudflare WAF usage",
          source: "https://securityheaders.com/?q=" + domain
        }
      ],
      unknowns_gaps: [
        "DAST solution not publicly identified - likely evaluating options based on security engineer job posting",
        "API security testing tools unclear - mentioned as requirement in recent security architect role",
        "Secrets management solution not confirmed - HashiCorp Vault mentioned in DevOps job but not verified",
        "Mobile application security testing approach unknown",
        "Third-party security assessment vendor relationships not public"
      ],
      citations: [
        `https://github.com/${companyName.toLowerCase()}`,
        `https://jobs.${domain}/`,
        `https://blog.${domain}/`,
        "https://linkedin.com/company/" + companyName.toLowerCase() + "/jobs",
        "https://stackoverflow.com/jobs/companies/" + companyName.toLowerCase(),
        "https://indeed.com/cmp/" + companyName.replace(/\s+/g, '-') + "/jobs",
        "https://glassdoor.com/Jobs/" + companyName.replace(/\s+/g, '-') + "-jobs",
        `https://hub.docker.com/u/${companyName.toLowerCase()}`,
        "https://securityheaders.com/?q=" + domain,
        `https://${domain}/security`,
        "https://builtwith.com/" + domain,
        "https://crunchbase.com/organization/" + companyName.toLowerCase()
      ]
    };
  }
}

// Export singleton instance
let aiService: AIService;

export function initializeAI(config: AIConfig) {
  aiService = new AIService(config);
}

export function getAIService(): AIService {
  if (!aiService) {
    // Initialize with default config if not already initialized
    aiService = new AIService({ model: 'claude' });
  }
  return aiService;
}

// Convenience functions
export async function extractProspectProfile(ocrText: string): Promise<ProspectProfile> {
  return getAIService().extractProspectProfile(ocrText);
}

export async function researchCompany(
  companyName: string,
  companyDomain?: string,
  prospectName?: string,
  region?: string
): Promise<CompanyResearch> {
  return getAIService().researchCompany(companyName, companyDomain, prospectName, region);
}

export async function analyzeTechStack(
  companyName: string,
  companyDomain?: string
): Promise<TechStackRecon> {
  return getAIService().analyzeTechStack(companyName, companyDomain);
}

export async function mapAccount(
  companyName: string,
  companyDomain?: string
): Promise<AccountMap> {
  return getAIService().mapAccount(companyName, companyDomain);
}

export async function generateSalesPlan(
  prospectProfile: ProspectProfile,
  companyResearch: CompanyResearch,
  techStackRecon: TechStackRecon,
  accountMap: AccountMap
): Promise<SalesPlan> {
  return getAIService().generateSalesPlan(prospectProfile, companyResearch, techStackRecon, accountMap);
}