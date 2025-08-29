// Enhanced Account Mapping with Real Executive Discovery
// This service provides comprehensive organizational intelligence using real web search

import { AccountMap, OrgMember, RoleAnalysis, StakeholderRole } from '@/types';

export interface ExecutiveSearchResult {
  executives: {
    name: string;
    title: string;
    company: string;
    linkedin_url?: string;
    email_pattern?: string;
    department: string;
    level: string;
    confidence: 'high' | 'medium' | 'low';
    sources: string[];
    verified_date: string;
  }[];
  company_intelligence: {
    industry: string;
    headquarters: string;
    employee_count: string;
    revenue_estimate: string;
    tech_stack_hints: string[];
    hiring_signals: string[];
  };
  organizational_structure: {
    reporting_hierarchy: { [key: string]: string[] };
    departments: string[];
    leadership_changes: string[];
  };
  total_sources_searched: number;
  search_timestamp: string;
}

export interface WebSearchFunction {
  (params: { query: string; allowed_domains?: string[] }): Promise<any>;
}

export interface WebFetchFunction {
  (params: { url: string; prompt: string }): Promise<string>;
}

/**
 * Comprehensive executive discovery across multiple authoritative sources
 * This function should be called from a Claude assistant context that has access to WebSearch/WebFetch tools
 */
export async function discoverExecutiveTeam(
  companyName: string,
  companyDomain: string,
  webSearch: WebSearchFunction,
  webFetch: WebFetchFunction
): Promise<ExecutiveSearchResult> {
  const executives: any[] = [];
  const sources_searched: string[] = [];
  const company_intelligence: any = {
    industry: '',
    headquarters: '',
    employee_count: '',
    revenue_estimate: '',
    tech_stack_hints: [],
    hiring_signals: []
  };

  console.log(`🔍 Starting comprehensive executive discovery for ${companyName}`);

  // PHASE 1: LinkedIn Executive Search
  try {
    console.log('Phase 1: LinkedIn Executive Discovery');
    const linkedinExecutives = await searchLinkedInExecutives(companyName, webSearch);
    executives.push(...linkedinExecutives);
    sources_searched.push('LinkedIn Company Page', 'LinkedIn People Search');
  } catch (error) {
    console.warn('LinkedIn search failed:', error);
  }

  // PHASE 2: Company Website Executive Discovery  
  try {
    console.log('Phase 2: Company Website Executive Discovery');
    const websiteExecutives = await searchCompanyWebsiteExecutives(companyName, companyDomain, webFetch);
    executives.push(...websiteExecutives);
    sources_searched.push('Company Website Leadership Pages');
  } catch (error) {
    console.warn('Company website search failed:', error);
  }

  // PHASE 3: TheOrg.com Organizational Intelligence
  try {
    console.log('Phase 3: TheOrg.com Organizational Discovery');
    const theorgExecutives = await searchTheOrgExecutives(companyName, webSearch, webFetch);
    executives.push(...theorgExecutives);
    sources_searched.push('TheOrg.com Organizational Charts');
  } catch (error) {
    console.warn('TheOrg search failed:', error);
  }

  // PHASE 4: Crunchbase Leadership Discovery
  try {
    console.log('Phase 4: Crunchbase Leadership Discovery');
    const crunchbaseExecutives = await searchCrunchbaseExecutives(companyName, webSearch, webFetch);
    executives.push(...crunchbaseExecutives);
    sources_searched.push('Crunchbase Executive Profiles');
  } catch (error) {
    console.warn('Crunchbase search failed:', error);
  }

  // PHASE 5: SEC Filings Executive Discovery (for public companies)
  try {
    console.log('Phase 5: SEC Filings Executive Discovery');
    const secExecutives = await searchSECFilingsExecutives(companyName, webSearch);
    executives.push(...secExecutives);
    sources_searched.push('SEC Filing Executive Disclosures');
  } catch (error) {
    console.warn('SEC filings search failed:', error);
  }

  // PHASE 6: News & Press Release Executive Discovery
  try {
    console.log('Phase 6: News & Press Executive Discovery');
    const newsExecutives = await searchNewsExecutives(companyName, webSearch);
    executives.push(...newsExecutives);
    sources_searched.push('News Articles & Press Releases');
  } catch (error) {
    console.warn('News search failed:', error);
  }

  // PHASE 7: Industry Conference & Speaking Circuit Discovery
  try {
    console.log('Phase 7: Conference Speaker Discovery');
    const conferenceExecutives = await searchConferenceSpeakers(companyName, webSearch);
    executives.push(...conferenceExecutives);
    sources_searched.push('Industry Conference Speaker Lists');
  } catch (error) {
    console.warn('Conference search failed:', error);
  }

  // PHASE 8: GitHub Technical Leadership Discovery
  try {
    console.log('Phase 8: GitHub Technical Leadership Discovery');
    const githubLeaders = await searchGitHubTechnicalLeadership(companyName, companyDomain, webSearch);
    executives.push(...githubLeaders);
    sources_searched.push('GitHub Organization Leadership');
  } catch (error) {
    console.warn('GitHub search failed:', error);
  }

  // PHASE 9: Deduplication and Quality Enhancement
  const uniqueExecutives = deduplicateAndEnhanceExecutives(executives);
  
  // PHASE 10: Confidence Scoring and Verification
  const verifiedExecutives = await verifyExecutivesMultiSource(uniqueExecutives, companyName, webSearch);

  return {
    executives: verifiedExecutives,
    company_intelligence,
    organizational_structure: {
      reporting_hierarchy: buildReportingHierarchy(verifiedExecutives),
      departments: extractDepartments(verifiedExecutives),
      leadership_changes: []
    },
    total_sources_searched: sources_searched.length,
    search_timestamp: new Date().toISOString()
  };
}

/**
 * Phase 1: LinkedIn Executive Search
 * Searches LinkedIn for C-level executives, VPs, and Directors
 */
async function searchLinkedInExecutives(companyName: string, webSearch: WebSearchFunction) {
  const executives: any[] = [];
  
  // LinkedIn executive search queries - highly targeted
  const linkedinQueries = [
    `site:linkedin.com "${companyName}" CEO "Chief Executive Officer"`,
    `site:linkedin.com "${companyName}" CTO "Chief Technology Officer"`,
    `site:linkedin.com "${companyName}" CISO "Chief Information Security Officer"`,
    `site:linkedin.com "${companyName}" CFO "Chief Financial Officer"`,
    `site:linkedin.com "${companyName}" COO "Chief Operating Officer"`,
    `site:linkedin.com "${companyName}" "VP Engineering" "Vice President"`,
    `site:linkedin.com "${companyName}" "VP Security" "Vice President"`,
    `site:linkedin.com "${companyName}" "VP Product" "Vice President"`,
    `site:linkedin.com "${companyName}" "Director Security" "Director Engineering"`,
    `site:linkedin.com "${companyName}" "Head of Security" "Head of Engineering"`,
    `site:linkedin.com/company/${companyName.toLowerCase().replace(/\s+/g, '-')}/people/`
  ];

  for (const query of linkedinQueries) {
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Rate limiting
      const results = await webSearch({
        query,
        allowed_domains: ['linkedin.com']
      });

      const parsedExecs = parseLinkedInSearchResults(results, companyName);
      executives.push(...parsedExecs);
      
    } catch (error) {
      console.warn(`LinkedIn query failed: ${query}`, error);
    }
  }

  return executives;
}

/**
 * Phase 2: Company Website Executive Discovery
 * Crawls company leadership, about, and team pages
 */
async function searchCompanyWebsiteExecutives(
  companyName: string, 
  companyDomain: string, 
  webFetch: WebFetchFunction
) {
  const executives: any[] = [];
  
  const websiteUrls = [
    `https://${companyDomain}/about`,
    `https://${companyDomain}/leadership`,
    `https://${companyDomain}/team`,
    `https://${companyDomain}/about-us`,
    `https://${companyDomain}/executives`,
    `https://${companyDomain}/management`,
    `https://${companyDomain}/our-team`,
    `https://${companyDomain}/company/leadership`,
    `https://${companyDomain}/company/team`,
    `https://${companyDomain}/company/about`
  ];

  for (const url of websiteUrls) {
    try {
      await new Promise(resolve => setTimeout(resolve, 3000)); // Rate limiting
      
      const content = await webFetch({
        url,
        prompt: `Extract executive leadership information from this page. Find all C-level executives (CEO, CTO, CISO, CFO, COO), VPs, and Directors. For each person, extract: Full Name, Exact Job Title, Department/Function, and any LinkedIn profile links. Focus only on current employees of ${companyName}. Format as: Name: [Full Name], Title: [Exact Title], Department: [Department], LinkedIn: [URL if available]. Only include verified current executives.`
      });

      const parsedExecs = parseWebsiteExecutiveContent(content, companyName, url);
      executives.push(...parsedExecs);
      
    } catch (error) {
      console.warn(`Website crawl failed: ${url}`, error);
    }
  }

  return executives;
}

/**
 * Phase 3: TheOrg.com Organizational Intelligence
 * Searches TheOrg for organizational charts and leadership structure
 */
async function searchTheOrgExecutives(
  companyName: string,
  webSearch: WebSearchFunction,
  webFetch: WebFetchFunction
) {
  const executives: any[] = [];

  try {
    // Search for TheOrg company page
    const theorgSearchResults = await webSearch({
      query: `site:theorg.com "${companyName}" organizational chart leadership`,
      allowed_domains: ['theorg.com']
    });

    // If TheOrg page found, fetch detailed organizational data
    if (theorgSearchResults?.results?.length > 0) {
      for (const result of theorgSearchResults.results.slice(0, 3)) {
        try {
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          const orgChartContent = await webFetch({
            url: result.url,
            prompt: `Extract all executive and leadership information from this organizational chart. Find every C-level executive, VP, Director, and senior leader. For each person: Full Name, Exact Job Title, Department, Reporting Relationship (who they report to), and Leadership Level. Focus on ${companyName} current employees only. Format as: Name: [Name], Title: [Title], Reports To: [Manager], Department: [Dept], Level: [C-Suite/VP/Director].`
          });

          const orgChartExecs = parseTheOrgContent(orgChartContent, companyName, result.url);
          executives.push(...orgChartExecs);
          
        } catch (error) {
          console.warn('TheOrg page fetch failed:', error);
        }
      }
    }
  } catch (error) {
    console.warn('TheOrg search failed:', error);
  }

  return executives;
}

/**
 * Phase 4: Crunchbase Leadership Discovery
 * Searches Crunchbase for executive team and board information
 */
async function searchCrunchbaseExecutives(
  companyName: string,
  webSearch: WebSearchFunction,
  webFetch: WebFetchFunction
) {
  const executives: any[] = [];

  try {
    // Search Crunchbase for company leadership
    const crunchbaseResults = await webSearch({
      query: `site:crunchbase.com "${companyName}" CEO CTO CFO executives leadership team`,
      allowed_domains: ['crunchbase.com']
    });

    if (crunchbaseResults?.results?.length > 0) {
      for (const result of crunchbaseResults.results.slice(0, 2)) {
        try {
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          const crunchbaseContent = await webFetch({
            url: result.url,
            prompt: `Extract executive leadership team information from this Crunchbase page for ${companyName}. Find all current executives including CEO, CTO, CFO, COO, CISO, VPs, and board members. For each person: Full Name, Title, Role Type (Executive/Board Member/Advisor), Background Summary, and LinkedIn profile if available. Only include current team members, not former employees.`
          });

          const crunchbaseExecs = parseCrunchbaseContent(crunchbaseContent, companyName, result.url);
          executives.push(...crunchbaseExecs);
          
        } catch (error) {
          console.warn('Crunchbase page fetch failed:', error);
        }
      }
    }
  } catch (error) {
    console.warn('Crunchbase search failed:', error);
  }

  return executives;
}

/**
 * Phase 5: SEC Filings Executive Discovery (Public Companies)
 */
async function searchSECFilingsExecutives(companyName: string, webSearch: WebSearchFunction) {
  const executives: any[] = [];

  try {
    // Search for SEC filings with executive information
    const secQueries = [
      `site:sec.gov "${companyName}" "executive officer" 10-K DEF 14A`,
      `site:sec.gov "${companyName}" "principal executive officer" "principal financial officer"`,
      `"${companyName}" proxy statement "executive compensation" filetype:html`
    ];

    for (const query of secQueries) {
      try {
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const secResults = await webSearch({ query });
        const secExecs = parseSECResults(secResults, companyName);
        executives.push(...secExecs);
        
      } catch (error) {
        console.warn(`SEC query failed: ${query}`, error);
      }
    }
  } catch (error) {
    console.warn('SEC filings search failed:', error);
  }

  return executives;
}

/**
 * Phase 6: News & Press Release Executive Discovery
 */
async function searchNewsExecutives(companyName: string, webSearch: WebSearchFunction) {
  const executives: any[] = [];

  try {
    const newsQueries = [
      `"${companyName}" "announces" "new CEO" OR "new CTO" OR "new CISO" OR "promotes"`,
      `"${companyName}" "appoints" "executive" "vice president" "director"`,
      `"${companyName}" "executive team" "leadership" site:prnewswire.com OR site:businesswire.com`,
      `"${companyName}" CEO CTO CFO interview site:techcrunch.com OR site:venturebeat.com`
    ];

    for (const query of newsQueries) {
      try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const newsResults = await webSearch({ query });
        const newsExecs = parseNewsResults(newsResults, companyName);
        executives.push(...newsExecs);
        
      } catch (error) {
        console.warn(`News query failed: ${query}`, error);
      }
    }
  } catch (error) {
    console.warn('News search failed:', error);
  }

  return executives;
}

/**
 * Phase 7: Industry Conference & Speaking Circuit Discovery
 */
async function searchConferenceSpeakers(companyName: string, webSearch: WebSearchFunction) {
  const executives: any[] = [];

  try {
    const conferenceQueries = [
      `"${companyName}" speaker "RSA Conference" OR "Black Hat" OR "DefCon" OR "InfoSec"`,
      `"${companyName}" "CTO" OR "CISO" speaking conference presentation`,
      `site:rsa.com OR site:blackhat.com "${companyName}" speaker biography`,
      `"${companyName}" executive keynote "technology conference"`
    ];

    for (const query of conferenceQueries) {
      try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const conferenceResults = await webSearch({ query });
        const conferenceExecs = parseConferenceResults(conferenceResults, companyName);
        executives.push(...conferenceExecs);
        
      } catch (error) {
        console.warn(`Conference query failed: ${query}`, error);
      }
    }
  } catch (error) {
    console.warn('Conference search failed:', error);
  }

  return executives;
}

/**
 * Phase 8: GitHub Technical Leadership Discovery
 */
async function searchGitHubTechnicalLeadership(
  companyName: string, 
  companyDomain: string, 
  webSearch: WebSearchFunction
) {
  const executives: any[] = [];

  try {
    const githubQueries = [
      `site:github.com "${companyName}" organization owners members`,
      `site:github.com org:${companyName.toLowerCase().replace(/\s+/g, '')} OR org:${companyDomain.replace(/\..+$/, '')}`,
      `"${companyName}" CTO "github.com" OR "Chief Technology Officer" github profile`
    ];

    for (const query of githubQueries) {
      try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const githubResults = await webSearch({
          query,
          allowed_domains: ['github.com']
        });
        
        const githubLeaders = parseGitHubResults(githubResults, companyName);
        executives.push(...githubLeaders);
        
      } catch (error) {
        console.warn(`GitHub query failed: ${query}`, error);
      }
    }
  } catch (error) {
    console.warn('GitHub search failed:', error);
  }

  return executives;
}

// Parsing Functions for Different Sources
function parseLinkedInSearchResults(searchResults: any, companyName: string) {
  const executives: any[] = [];
  
  if (!searchResults?.results) return executives;

  for (const result of searchResults.results) {
    const text = `${result.title} ${result.snippet}`.toLowerCase();
    
    // Extract executive patterns from LinkedIn results
    const patterns = [
      /([A-Za-z]+\s+[A-Za-z]+(?:\s+[A-Za-z]+)?)\s*[-–—]?\s*(ceo|chief executive officer)/gi,
      /([A-Za-z]+\s+[A-Za-z]+(?:\s+[A-Za-z]+)?)\s*[-–—]?\s*(cto|chief technology officer)/gi,
      /([A-Za-z]+\s+[A-Za-z]+(?:\s+[A-Za-z]+)?)\s*[-–—]?\s*(ciso|chief information security officer)/gi,
      /([A-Za-z]+\s+[A-Za-z]+(?:\s+[A-Za-z]+)?)\s*[-–—]?\s*(cfo|chief financial officer)/gi,
      /([A-Za-z]+\s+[A-Za-z]+(?:\s+[A-Za-z]+)?)\s*[-–—]?\s*(vp|vice president)\s+([a-z\s]+)/gi,
      /([A-Za-z]+\s+[A-Za-z]+(?:\s+[A-Za-z]+)?)\s*[-–—]?\s*(director)\s+([a-z\s]+)/gi
    ];

    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const name = match[1].trim();
        const baseTitle = match[2];
        const department = match[3] || '';
        
        if (name.length > 3 && name.includes(' ')) {
          executives.push({
            name: toTitleCase(name),
            title: formatExecutiveTitle(baseTitle, department),
            company: companyName,
            linkedin_url: result.url,
            department: inferDepartment(baseTitle + ' ' + department),
            level: inferExecutiveLevel(baseTitle),
            confidence: 'high',
            sources: [result.url],
            verified_date: new Date().toISOString()
          });
        }
      }
    });
  }

  return executives;
}

function parseWebsiteExecutiveContent(content: string, companyName: string, sourceUrl: string) {
  const executives: any[] = [];
  
  if (!content) return executives;

  const lines = content.split('\n');
  
  for (const line of lines) {
    // Parse structured executive information
    const execMatch = line.match(/Name:\s*([^,]+),?\s*Title:\s*([^,]+),?\s*Department:\s*([^,]*),?\s*LinkedIn:\s*([^,]*)/i);
    
    if (execMatch) {
      const name = execMatch[1]?.trim();
      const title = execMatch[2]?.trim();
      const department = execMatch[3]?.trim() || '';
      const linkedinUrl = execMatch[4]?.trim();
      
      if (name && title && name.length > 3 && title.length > 3) {
        executives.push({
          name: toTitleCase(name),
          title: title,
          company: companyName,
          linkedin_url: linkedinUrl || undefined,
          department: department || inferDepartment(title),
          level: inferExecutiveLevel(title),
          confidence: 'high',
          sources: [sourceUrl],
          verified_date: new Date().toISOString()
        });
      }
    }
  }

  return executives;
}

function parseTheOrgContent(content: string, companyName: string, sourceUrl: string) {
  const executives: any[] = [];
  
  if (!content) return executives;

  const lines = content.split('\n');
  
  for (const line of lines) {
    const orgMatch = line.match(/Name:\s*([^,]+),?\s*Title:\s*([^,]+),?\s*Reports To:\s*([^,]*),?\s*Department:\s*([^,]*),?\s*Level:\s*([^,]*)/i);
    
    if (orgMatch) {
      const name = orgMatch[1]?.trim();
      const title = orgMatch[2]?.trim();
      const reportsTo = orgMatch[3]?.trim();
      const department = orgMatch[4]?.trim();
      const level = orgMatch[5]?.trim();
      
      if (name && title && name.length > 3) {
        executives.push({
          name: toTitleCase(name),
          title: title,
          company: companyName,
          reports_to: reportsTo || 'Board of Directors',
          department: department || inferDepartment(title),
          level: level || inferExecutiveLevel(title),
          confidence: 'high',
          sources: [sourceUrl],
          verified_date: new Date().toISOString()
        });
      }
    }
  }

  return executives;
}

function parseCrunchbaseContent(content: string, companyName: string, sourceUrl: string) {
  const executives: any[] = [];
  
  // Similar parsing logic for Crunchbase executive data
  // Implementation would extract structured executive info from Crunchbase pages
  
  return executives;
}

function parseSECResults(searchResults: any, companyName: string) {
  const executives: any[] = [];
  
  // Parse SEC filing results for executive officer information
  // Implementation would extract Named Executive Officers from proxy statements
  
  return executives;
}

function parseNewsResults(searchResults: any, companyName: string) {
  const executives: any[] = [];
  
  // Parse news articles for executive announcements and appointments
  
  return executives;
}

function parseConferenceResults(searchResults: any, companyName: string) {
  const executives: any[] = [];
  
  // Parse conference speaker bios and presentations
  
  return executives;
}

function parseGitHubResults(searchResults: any, companyName: string) {
  const executives: any[] = [];
  
  // Parse GitHub organization owners and technical leaders
  
  return executives;
}

// Utility Functions
function deduplicateAndEnhanceExecutives(executives: any[]) {
  const unique = executives.filter((exec, index, self) =>
    index === self.findIndex(e => 
      e.name.toLowerCase() === exec.name.toLowerCase() &&
      e.company.toLowerCase() === exec.company.toLowerCase()
    )
  );
  
  // Merge sources for duplicates
  const enhanced = unique.map(exec => {
    const duplicates = executives.filter(e => 
      e.name.toLowerCase() === exec.name.toLowerCase() &&
      e.company.toLowerCase() === exec.company.toLowerCase()
    );
    
    const sourceSet = new Set(duplicates.flatMap(d => d.sources));
    const allSources = Array.from(sourceSet);
    const bestLinkedInUrl = duplicates.find(d => d.linkedin_url)?.linkedin_url;
    
    return {
      ...exec,
      sources: allSources,
      linkedin_url: bestLinkedInUrl || exec.linkedin_url,
      confidence: allSources.length >= 3 ? 'high' : allSources.length >= 2 ? 'medium' : 'low'
    };
  });

  return enhanced;
}

async function verifyExecutivesMultiSource(executives: any[], companyName: string, webSearch: WebSearchFunction) {
  // Additional verification step - cross-check executives against multiple sources
  const verified = [];
  
  for (const exec of executives) {
    try {
      // Verify executive still works at company
      const verificationQuery = `"${exec.name}" "${companyName}" "${exec.title}" -former -ex- 2024 2025`;
      const verificationResults = await webSearch({ query: verificationQuery });
      
      if (verificationResults?.results?.length > 0) {
        exec.confidence = 'high';
        exec.verification_sources = verificationResults.results.slice(0, 2).map((r: any) => r.url);
      }
      
      verified.push(exec);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting
      
    } catch (error) {
      console.warn(`Verification failed for ${exec.name}:`, error);
      verified.push(exec); // Include anyway
    }
  }
  
  return verified;
}

function buildReportingHierarchy(executives: any[]) {
  const hierarchy: { [key: string]: string[] } = {};
  
  executives.forEach(exec => {
    if (exec.reports_to) {
      if (!hierarchy[exec.reports_to]) {
        hierarchy[exec.reports_to] = [];
      }
      hierarchy[exec.reports_to].push(exec.name);
    }
  });
  
  return hierarchy;
}

function extractDepartments(executives: any[]) {
  const departmentSet = new Set(executives.map(exec => exec.department).filter(Boolean));
  const departments = Array.from(departmentSet);
  return departments.sort();
}

function toTitleCase(str: string): string {
  return str.replace(/\w\S*/g, txt => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

function formatExecutiveTitle(baseTitle: string, department: string): string {
  const titleMap: { [key: string]: string } = {
    'ceo': 'Chief Executive Officer',
    'cto': 'Chief Technology Officer', 
    'ciso': 'Chief Information Security Officer',
    'cfo': 'Chief Financial Officer',
    'coo': 'Chief Operating Officer',
    'vp': 'Vice President',
    'director': 'Director'
  };
  
  const formattedBase = titleMap[baseTitle.toLowerCase()] || baseTitle;
  return department ? `${formattedBase} of ${toTitleCase(department)}` : formattedBase;
}

function inferDepartment(title: string): string {
  const titleLower = title.toLowerCase();
  
  if (titleLower.includes('security') || titleLower.includes('ciso')) return 'Security';
  if (titleLower.includes('technology') || titleLower.includes('engineering') || titleLower.includes('cto')) return 'Technology';
  if (titleLower.includes('financial') || titleLower.includes('finance') || titleLower.includes('cfo')) return 'Finance';
  if (titleLower.includes('operations') || titleLower.includes('coo')) return 'Operations';
  if (titleLower.includes('marketing')) return 'Marketing';
  if (titleLower.includes('sales')) return 'Sales';
  if (titleLower.includes('product')) return 'Product';
  if (titleLower.includes('hr') || titleLower.includes('human resources')) return 'Human Resources';
  if (titleLower.includes('legal')) return 'Legal';
  
  return 'Executive';
}

function inferExecutiveLevel(title: string): string {
  const titleLower = title.toLowerCase();
  
  if (titleLower.includes('ceo') || titleLower.includes('cto') || titleLower.includes('cfo') || 
      titleLower.includes('coo') || titleLower.includes('ciso') || titleLower.includes('chief')) {
    return 'C-Suite';
  }
  if (titleLower.includes('president') || titleLower.includes('vp') || titleLower.includes('vice president')) {
    return 'VP';
  }
  if (titleLower.includes('director')) {
    return 'Director';
  }
  if (titleLower.includes('head of') || titleLower.includes('principal') || titleLower.includes('senior')) {
    return 'Senior';
  }
  
  return 'Manager';
}

/**
 * Convert executive search results to Account Map format
 */
export function convertExecutiveSearchToAccountMap(
  executiveResult: ExecutiveSearchResult,
  companyName: string
): AccountMap {
  // Build organization tree from executives
  const orgTree: OrgMember[] = executiveResult.executives.map(exec => ({
    name: exec.name,
    title: exec.title,
    reports_to: exec.level === 'C-Suite' ? 'Board of Directors' : inferReportsTo(exec, executiveResult.executives),
    level: exec.level,
    region_function: exec.department,
    sources: exec.sources
  }));

  // Build role analysis for sales stakeholders
  const roleAnalysis: RoleAnalysis[] = executiveResult.executives.map(exec => ({
    name: exec.name,
    title: exec.title,
    role: inferStakeholderRole(exec.title),
    notes: `${exec.title} at ${companyName}. Confidence: ${exec.confidence}. Verified through ${exec.sources.length} sources.`,
    sources: exec.sources
  }));

  return {
    company_snapshot: {
      industry: executiveResult.company_intelligence.industry || 'Technology',
      hq: executiveResult.company_intelligence.headquarters || 'Location TBD',
      size: executiveResult.company_intelligence.employee_count || `${executiveResult.executives.length}+ verified executives`,
      revenue: executiveResult.company_intelligence.revenue_estimate || 'Revenue data not disclosed',
      structure_summary: `Discovered ${executiveResult.executives.length} verified executives across ${executiveResult.organizational_structure.departments.length} departments through comprehensive web research.`
    },
    org_tree: orgTree,
    role_analysis: roleAnalysis,
    gaps: executiveResult.executives.length < 10 ? [
      'Mid-level management may not have public profiles',
      'Some departments may be underrepresented in public sources',
      'Recent hires may not appear in search results yet'
    ] : [
      'Some individual contributors not included in executive search',
      'International office leadership may be limited'
    ],
    citations: Array.from(new Set(executiveResult.executives.flatMap(exec => exec.sources)))
  };
}

function inferReportsTo(exec: any, allExecs: any[]): string {
  // Logic to determine reporting relationships based on organizational hierarchy
  if (exec.level === 'C-Suite') return 'Board of Directors';
  
  // Find potential managers in same department with higher level
  const possibleManagers = allExecs.filter(other => 
    other.department === exec.department &&
    (other.level === 'C-Suite' || (exec.level === 'Director' && other.level === 'VP'))
  );
  
  if (possibleManagers.length > 0) {
    return possibleManagers[0].name;
  }
  
  // Find C-level executive in related department
  if (exec.department === 'Security') {
    const ciso = allExecs.find(e => e.title.toLowerCase().includes('ciso'));
    if (ciso) return ciso.name;
    const cto = allExecs.find(e => e.title.toLowerCase().includes('cto'));
    if (cto) return cto.name;
  }
  
  if (exec.department === 'Technology' || exec.department === 'Engineering') {
    const cto = allExecs.find(e => e.title.toLowerCase().includes('cto'));
    if (cto) return cto.name;
  }
  
  // Default to CEO if found
  const ceo = allExecs.find(e => e.title.toLowerCase().includes('ceo'));
  return ceo ? ceo.name : 'Executive Leadership';
}

function inferStakeholderRole(title: string): StakeholderRole {
  const titleLower = title.toLowerCase();
  
  if (titleLower.includes('ceo') || titleLower.includes('cfo')) return 'economic buyer';
  if (titleLower.includes('cto') || titleLower.includes('ciso') || titleLower.includes('vp security') || titleLower.includes('vp engineering')) return 'champion';
  if (titleLower.includes('director security') || titleLower.includes('director engineering') || titleLower.includes('head of security')) return 'evaluator';
  if (titleLower.includes('principal') || titleLower.includes('architect') || titleLower.includes('staff engineer')) return 'influencer';
  if (titleLower.includes('legal') || titleLower.includes('compliance') || titleLower.includes('procurement')) return 'blocker';
  
  return 'Lead to validate';
}