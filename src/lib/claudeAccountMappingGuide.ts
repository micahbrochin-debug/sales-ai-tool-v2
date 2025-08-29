// Claude Assistant Integration Guide for Enhanced Account Mapping
// Instructions for implementing real executive discovery using WebSearch/WebFetch tools

export const CLAUDE_ACCOUNT_MAPPING_PROMPT = `
🤖 CLAUDE ASSISTANT - COMPREHENSIVE EXECUTIVE DISCOVERY

You are performing enhanced account mapping to find real executives like CEO Fern Glowinsky, COO John Bourassa, and CFO Sarim Farooqi (as found for Haventree Bank).

COMPANY: {companyName}
DOMAIN: {companyDomain}
TARGET: Find 15+ verified executives across C-Suite, VP, and Director levels

## PHASE 1: C-SUITE EXECUTIVE DISCOVERY

Execute these WebSearch queries in parallel:

\`\`\`
WebSearch: site:linkedin.com "{companyName}" CEO "Chief Executive Officer"
WebSearch: site:linkedin.com "{companyName}" CTO "Chief Technology Officer" 
WebSearch: site:linkedin.com "{companyName}" CISO "Chief Information Security Officer"
WebSearch: site:linkedin.com "{companyName}" CFO "Chief Financial Officer"
WebSearch: site:linkedin.com "{companyName}" COO "Chief Operating Officer"
\`\`\`

## PHASE 2: VP-LEVEL LEADERSHIP DISCOVERY

Execute these WebSearch queries:

\`\`\`
WebSearch: site:linkedin.com "{companyName}" "VP Engineering" "Vice President Engineering"
WebSearch: site:linkedin.com "{companyName}" "VP Security" "Vice President Security"
WebSearch: site:linkedin.com "{companyName}" "VP Product" "Vice President Product"
WebSearch: site:linkedin.com "{companyName}" "VP Sales" "Vice President Sales"
WebSearch: site:linkedin.com "{companyName}" "VP Marketing" "Vice President Marketing"
\`\`\`

## PHASE 3: DIRECTOR & SENIOR STAFF DISCOVERY

Execute these WebSearch queries:

\`\`\`
WebSearch: site:linkedin.com "{companyName}" "Director Security" "Director Engineering"
WebSearch: site:linkedin.com "{companyName}" "Head of Security" "Head of Engineering"
WebSearch: site:linkedin.com "{companyName}" "Principal Engineer" "Staff Engineer"
WebSearch: site:linkedin.com "{companyName}" "Security Architect" "Platform Engineer"
\`\`\`

## PHASE 4: ORGANIZATIONAL INTELLIGENCE

Execute these searches for comprehensive org data:

\`\`\`
WebSearch: site:theorg.com "{companyName}" organizational chart leadership
WebSearch: site:crunchbase.com "{companyName}" executives leadership team board
WebSearch: "{companyName}" "announces" "new CEO" OR "promotes" OR "appoints"
WebSearch: "{companyName}" executive team leadership site:*.com -job -career
\`\`\`

## PHASE 5: COMPANY WEBSITE CRAWLING

Use WebFetch to extract executive data from these URLs:

\`\`\`
WebFetch: https://{companyDomain}/leadership
WebFetch: https://{companyDomain}/about-us  
WebFetch: https://{companyDomain}/team
WebFetch: https://{companyDomain}/executives
WebFetch: https://{companyDomain}/management
WebFetch: https://{companyDomain}/company/leadership
\`\`\`

For each WebFetch, use this prompt:
"Extract all current executive leadership information from this page. Find C-level executives (CEO, CTO, CISO, CFO, COO), VPs, Directors, and senior staff. For each person, extract: Full Name, Exact Job Title, Department/Function, and any LinkedIn profile links. Focus only on current employees of {companyName}. Format as: Name: [Full Name], Title: [Exact Title], Department: [Department], LinkedIn: [URL if available]. Only include verified current executives."

## PHASE 6: DATA PROCESSING & EXTRACTION

For each search result, extract:

### Executive Information:
- Full Name (exact spelling, e.g., "Fern Glowinsky")
- Complete Job Title (e.g., "Chief Executive Officer")  
- Company (verify it matches {companyName})
- Department/Function (Technology, Security, Finance, etc.)
- LinkedIn Profile URL (if available)
- Source URL for verification

### Verification Requirements:
- Verify current employment (not former employees)
- Cross-reference across multiple sources
- Confirm name spelling and title accuracy
- Validate company association

## PHASE 7: ORGANIZATIONAL HIERARCHY BUILDING

Build reporting structure:
- C-Suite executives report to "Board of Directors"
- VPs typically report to relevant C-Suite (e.g., VP Engineering → CTO)
- Directors report to VPs in same department
- Use logical inference for reporting relationships

## PHASE 8: STAKEHOLDER ROLE CLASSIFICATION

Assign roles based on titles:
- **Economic Buyer**: CEO, CFO (budget authority)
- **Champion**: CTO, CISO, VP Engineering, VP Security (technology advocates)
- **Evaluator**: Director Security, Director Engineering (technical assessment)
- **Influencer**: Principal Engineers, Architects (technical opinion leaders)
- **Blocker**: Legal, Compliance, Procurement (potential resistance)

## PHASE 9: OUTPUT FORMATTING

Structure as AccountMap JSON:

\`\`\`json
{
  "company_snapshot": {
    "industry": "Financial Services", 
    "hq": "Location based on research",
    "size": "X verified executives identified",
    "revenue": "Revenue estimate if found",
    "structure_summary": "Comprehensive executive discovery identified X key decision-makers...",
    "confidence_score": 90,
    "total_sources": 8
  },
  "org_tree": [
    {
      "name": "Fern Glowinsky",
      "title": "Chief Executive Officer", 
      "reports_to": "Board of Directors",
      "level": "C-Suite",
      "region_function": "Executive Leadership",
      "sources": ["LinkedIn", "Company Website", "Press Release"]
    }
    // ... more executives
  ],
  "role_analysis": [
    {
      "name": "Fern Glowinsky",
      "title": "Chief Executive Officer",
      "role": "economic buyer",
      "notes": "CEO with final authority on technology investments. Focus on business value and ROI.",
      "sources": ["LinkedIn", "Company Website", "Press Release"]
    }
    // ... more role analyses  
  ],
  "gaps": [
    "Mid-level management visibility limited in public sources",
    "Some departments may be underrepresented"
  ],
  "citations": [
    "https://{companyDomain}",
    "https://linkedin.com/company/{company-slug}",
    // ... all sources used
  ]
}
\`\`\`

## SUCCESS CRITERIA:

✅ **Target Metrics:**
- 15+ executives identified
- 4+ C-Suite executives (CEO, CTO, CFO, etc.)
- 5+ VP-level executives  
- 6+ Director/Senior-level executives
- 2+ sources per executive for verification
- 90%+ confidence score

✅ **Quality Standards:**
- Exact name spelling (e.g., "CEO Fern Glowinsky")
- Current employment verified (not former employees)
- Accurate titles and reporting relationships
- Multi-source verification for each executive
- Proper stakeholder role classification

✅ **Output Quality:**
Match the thoroughness of finding "CEO Fern Glowinsky, COO John Bourassa, CFO Sarim Farooqi" as demonstrated in the Haventree Bank example.

🚀 **EXECUTE ALL PHASES** and return comprehensive AccountMap JSON with verified executive team.
`;

/**
 * Function to generate personalized Claude prompt for specific company
 */
export function generateClaudeAccountMappingPrompt(companyName: string, companyDomain?: string): string {
  const domain = companyDomain || generateDomain(companyName);
  
  return CLAUDE_ACCOUNT_MAPPING_PROMPT
    .replace(/{companyName}/g, companyName)
    .replace(/{companyDomain}/g, domain);
}

/**
 * Generate company domain from name
 */
function generateDomain(companyName: string): string {
  return companyName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '')
    .replace(/(inc|llc|corp|ltd|co|company)$/g, '')
    + '.com';
}

/**
 * Validation criteria for Claude assistant results
 */
export const CLAUDE_RESULT_VALIDATION = {
  minimumExecutives: 15,
  minimumCSuite: 4,
  minimumVPs: 5,
  minimumDirectors: 6,
  minimumSourcesPerPerson: 2,
  requiredFields: ['name', 'title', 'reports_to', 'level', 'region_function', 'sources'],
  targetConfidenceScore: 90
};

/**
 * Instructions for Claude assistant implementation
 */
export const CLAUDE_IMPLEMENTATION_CHECKLIST = `
🔥 CLAUDE ASSISTANT IMPLEMENTATION CHECKLIST:

## PRE-EXECUTION:
□ Company name and domain identified
□ WebSearch and WebFetch tools available
□ Target: 15+ executives like "CEO Fern Glowinsky, COO John Bourassa, CFO Sarim Farooqi"

## EXECUTION PHASES:
□ Phase 1: C-Suite discovery (CEO, CTO, CISO, CFO, COO)
□ Phase 2: VP-level discovery (Engineering, Security, Product, Sales, Marketing)
□ Phase 3: Director/Senior staff discovery
□ Phase 4: Organizational intelligence (TheOrg, Crunchbase, news)
□ Phase 5: Company website crawling (leadership pages)
□ Phase 6: Data extraction and verification
□ Phase 7: Hierarchy building (reporting relationships)
□ Phase 8: Stakeholder role classification
□ Phase 9: AccountMap JSON formatting

## QUALITY ASSURANCE:
□ 15+ executives identified (target met)
□ Multi-source verification (2+ sources per person)
□ Current employment verified (not former employees)
□ Accurate name spelling and titles
□ Complete reporting hierarchy
□ Proper stakeholder role assignment
□ Comprehensive citations list

## OUTPUT VALIDATION:
□ AccountMap JSON structure correct
□ All required fields populated
□ Confidence score ≥ 90%
□ Quality matches Haventree Bank example

🎯 SUCCESS: Comprehensive executive discovery matching custom GPT quality!
`;

// Exports are already defined above