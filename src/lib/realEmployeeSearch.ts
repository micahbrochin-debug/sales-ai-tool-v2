// Real Employee Search - Service for conducting actual web research
// This service is designed to be called from components that have access to WebSearch/WebFetch tools

export interface EmployeeSearchResult {
  employees: Array<{
    name: string;
    title: string;
    department?: string;
    reportsTo?: string;
    sources: string[];
  }>;
  companyInfo: {
    industry?: string;
    headquarters?: string;
    size?: string;
    revenue?: string;
  };
  sources: string[];
  searchQueries: string[];
}

export interface WebSearchFunction {
  (params: { query: string; allowed_domains?: string[] }): Promise<any>;
}

export interface WebFetchFunction {
  (params: { url: string; prompt: string }): Promise<string>;
}

export async function searchForRealEmployees(
  companyName: string,
  companyDomain: string,
  webSearchFn: WebSearchFunction
): Promise<EmployeeSearchResult> {
  console.log(`🔍 Conducting real employee search for ${companyName}...`);

  const result: EmployeeSearchResult = {
    employees: [],
    companyInfo: {},
    sources: [],
    searchQueries: []
  };

  // Define search queries for finding real employees
  const searchQueries = [
    {
      query: `"${companyName}" CEO "Chief Executive Officer" leadership`,
      domains: ['linkedin.com', 'theorg.com', 'crunchbase.com']
    },
    {
      query: `"${companyName}" CTO "Chief Technology Officer"`,
      domains: ['linkedin.com', 'theorg.com']
    },
    {
      query: `"${companyName}" CFO "Chief Financial Officer"`,
      domains: ['linkedin.com', 'crunchbase.com']
    },
    {
      query: `"${companyName}" "VP Engineering" "Vice President"`,
      domains: ['linkedin.com', 'theorg.com']
    },
    {
      query: `"${companyName}" CISO "Chief Information Security Officer" "Head of Security"`,
      domains: ['linkedin.com', 'theorg.com']
    },
    {
      query: `site:linkedin.com "${companyName}" employees "works at"`,
      domains: ['linkedin.com']
    },
    {
      query: `site:theorg.com "${companyName}" leadership organization`,
      domains: ['theorg.com']
    },
    {
      query: `site:${companyDomain} team leadership executives about`,
      domains: [companyDomain]
    }
  ];

  // Execute searches with delays to be respectful
  for (let i = 0; i < searchQueries.length; i++) {
    const { query, domains } = searchQueries[i];
    
    try {
      console.log(`🔎 Executing search ${i + 1}/${searchQueries.length}: ${query}`);
      
      const searchResults = await webSearchFn({ 
        query, 
        allowed_domains: domains 
      });
      
      // Parse results for employee information
      const employees = parseSearchResultsForEmployees(searchResults, companyName);
      result.employees.push(...employees);
      
      // Track the query and sources
      result.searchQueries.push(query);
      result.sources.push(`Web search: ${query}`);
      
      // Extract company information from first few searches
      if (i < 3) {
        const companyInfo = parseSearchResultsForCompanyInfo(searchResults, companyName);
        Object.assign(result.companyInfo, companyInfo);
      }
      
      // Add delay between searches to avoid rate limiting
      if (i < searchQueries.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
    } catch (error) {
      console.error(`❌ Search failed for query: ${query}`, error);
      result.sources.push(`Failed search: ${query} (${error})`);
    }
  }

  // Deduplicate employees
  result.employees = deduplicateEmployees(result.employees);
  
  console.log(`✅ Employee search completed. Found ${result.employees.length} employees.`);
  return result;
}

export async function crawlCompanyWebsiteForEmployees(
  companyName: string,
  companyDomain: string,
  webFetchFn: WebFetchFunction
): Promise<Array<{ name: string; title: string; department?: string; sources: string[] }>> {
  console.log(`🕷️ Crawling ${companyDomain} for employee information...`);

  const employees: Array<{ name: string; title: string; department?: string; sources: string[] }> = [];
  
  // Pages to crawl for employee information
  const urlsToCheck = [
    `https://${companyDomain}/about`,
    `https://${companyDomain}/team`,
    `https://${companyDomain}/leadership`,
    `https://${companyDomain}/about-us`,
    `https://${companyDomain}/people`,
    `https://${companyDomain}/executives`,
    `https://${companyDomain}/management`,
    `https://${companyDomain}/our-team`,
    `https://${companyDomain}/company/team`
  ];

  for (let i = 0; i < urlsToCheck.length; i++) {
    const url = urlsToCheck[i];
    
    try {
      console.log(`🌐 Crawling ${i + 1}/${urlsToCheck.length}: ${url}`);
      
      const content = await webFetchFn({
        url,
        prompt: `Extract all employee names, job titles, and roles from this page. Focus on current employees, leadership, and team members. Return information in this format:
        
Name: [Full Name]
Title: [Job Title]
Department: [Department if available]

Only include people who currently work at ${companyName}. Do not include advisors, board members unless they are employees. Focus on:
- C-suite executives (CEO, CTO, CFO, etc.)
- VPs and Directors
- Department heads
- Key technical leaders
- Security/IT staff

If no clear employee information is found, respond with "No employee information found on this page."`
      });

      // Parse the extracted content for employee information
      const extractedEmployees = parseWebContentForEmployees(content, companyName, url);
      employees.push(...extractedEmployees);
      
      // Add delay between crawls to be respectful
      if (i < urlsToCheck.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
      
    } catch (error) {
      console.warn(`⚠️ Failed to crawl ${url}:`, error);
    }
  }

  console.log(`✅ Website crawling completed. Found ${employees.length} employees from website.`);
  return deduplicateEmployees(employees);
}

function parseSearchResultsForEmployees(searchResults: any, companyName: string) {
  const employees: any[] = [];
  
  if (!searchResults || !searchResults.results) {
    return employees;
  }

  // Extract employee information from search result snippets and titles
  for (const result of searchResults.results) {
    const text = `${result.title || ''} ${result.snippet || ''}`.toLowerCase();
    const url = result.url || 'Web Search';

    // Look for common patterns indicating employees
    const patterns = [
      // CEO patterns
      new RegExp(`([\\w\\s]+?)(?:,\\s*)?(?:is\\s+)?(?:the\\s+)?(?:ceo|chief executive officer|founder)\\s+(?:of\\s+|at\\s+)?${escapeRegex(companyName.toLowerCase())}`, 'gi'),
      // CTO patterns  
      new RegExp(`([\\w\\s]+?)(?:,\\s*)?(?:is\\s+)?(?:the\\s+)?(?:cto|chief technology officer)\\s+(?:of\\s+|at\\s+)?${escapeRegex(companyName.toLowerCase())}`, 'gi'),
      // CFO patterns
      new RegExp(`([\\w\\s]+?)(?:,\\s*)?(?:is\\s+)?(?:the\\s+)?(?:cfo|chief financial officer)\\s+(?:of\\s+|at\\s+)?${escapeRegex(companyName.toLowerCase())}`, 'gi'),
      // VP patterns
      new RegExp(`([\\w\\s]+?)(?:,\\s*)?(?:is\\s+)?(?:the\\s+)?(?:vp|vice president)\\s+(?:of\\s+)?([\\w\\s]+?)\\s+(?:at\\s+)?${escapeRegex(companyName.toLowerCase())}`, 'gi'),
      // Director patterns
      new RegExp(`([\\w\\s]+?)(?:,\\s*)?(?:is\\s+)?(?:the\\s+)?(?:director|head|manager)\\s+(?:of\\s+)?([\\w\\s]+?)\\s+(?:at\\s+)?${escapeRegex(companyName.toLowerCase())}`, 'gi'),
      // General "works at" patterns
      new RegExp(`([\\w\\s]+?)\\s+(?:works\\s+at|employed\\s+at|joins?)\\s+${escapeRegex(companyName.toLowerCase())}\\s+as\\s+([\\w\\s]+?)`, 'gi')
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        let name = match[1]?.trim();
        let title = match[2] || extractTitleFromContext(text, name);
        
        // Clean up the name and title
        name = cleanName(name);
        title = cleanTitle(title || '');
        
        // Basic validation - ensure it looks like a real name
        if (isValidEmployeeName(name) && title) {
          employees.push({
            name: toTitleCase(name),
            title: toTitleCase(title),
            department: extractDepartment(title),
            sources: [url]
          });
        }
      }
    }
  }

  return employees;
}

function parseSearchResultsForCompanyInfo(searchResults: any, companyName: string) {
  const companyInfo: any = {};

  if (!searchResults || !searchResults.results) {
    return companyInfo;
  }

  // Extract company information from search results
  for (const result of searchResults.results) {
    const text = `${result.title || ''} ${result.snippet || ''}`.toLowerCase();

    // Look for industry information
    if (!companyInfo.industry) {
      const industryPatterns = [
        /(?:industry|sector|field)[\s:]+([^.,]+)/i,
        /(?:specializes in|focuses on|operates in)[\s:]+([^.,]+)/i,
        /(?:is a|is an)[\s:]+([^.,]+?)(?:company|corporation|firm)/i
      ];
      
      for (const pattern of industryPatterns) {
        const match = text.match(pattern);
        if (match) {
          companyInfo.industry = match[1].trim();
          break;
        }
      }
    }

    // Look for headquarters information
    if (!companyInfo.headquarters) {
      const hqPatterns = [
        /(?:headquarters|headquartered|based in|located in)[\s:]+([^.,]+)/i,
        /(?:founded in|established in)[\s:]+([^.,]+)/i
      ];
      
      for (const pattern of hqPatterns) {
        const match = text.match(pattern);
        if (match) {
          companyInfo.headquarters = match[1].trim();
          break;
        }
      }
    }

    // Look for company size
    if (!companyInfo.size) {
      const sizeMatch = text.match(/(\d+[\+\-\s]*(?:employees|staff|people|team members))/i);
      if (sizeMatch) {
        companyInfo.size = sizeMatch[1].trim();
      }
    }
  }

  return companyInfo;
}

function parseWebContentForEmployees(webContent: string, companyName: string, sourceUrl: string) {
  const employees: any[] = [];

  if (!webContent || typeof webContent !== 'string') {
    return employees;
  }

  const lines = webContent.split('\n');

  for (const line of lines) {
    // Look for structured patterns like "Name: John Doe, Title: CEO"
    const nameMatch = line.match(/Name:\s*([^,\n]+),?\s*Title:\s*([^,\n]+)/i);
    if (nameMatch) {
      const name = cleanName(nameMatch[1].trim());
      const title = cleanTitle(nameMatch[2].trim());

      if (isValidEmployeeName(name) && title) {
        employees.push({
          name: toTitleCase(name),
          title: toTitleCase(title),
          department: extractDepartment(title),
          sources: [sourceUrl]
        });
      }
    }

    // Look for bullet point or dash patterns
    const bulletMatch = line.match(/[-•]\s*([^-•\n]+?)\s*[-–—]\s*(.+)/);
    if (bulletMatch) {
      const name = cleanName(bulletMatch[1].trim());
      const title = cleanTitle(bulletMatch[2].trim());

      if (isValidEmployeeName(name) && title) {
        employees.push({
          name: toTitleCase(name),
          title: toTitleCase(title),
          department: extractDepartment(title),
          sources: [sourceUrl]
        });
      }
    }
  }

  return employees;
}

// Helper functions
function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function cleanName(name: string): string {
  return name
    .replace(/[^\w\s'-]/g, '') // Remove special chars except apostrophes and hyphens
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanTitle(title: string): string {
  return title
    .replace(/[^\w\s&,.-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function isValidEmployeeName(name: string): boolean {
  if (!name || name.length < 3) return false;
  if (!name.includes(' ')) return false; // Must have at least first and last name
  if (name.includes('@') || name.includes('http')) return false;
  if (/^\d+/.test(name)) return false; // Doesn't start with numbers
  
  // Must contain only letters, spaces, apostrophes, and hyphens
  return /^[a-zA-Z\s'-]+$/.test(name);
}

function extractTitleFromContext(text: string, name: string): string {
  // Try to extract title from context around the name
  const nameIndex = text.toLowerCase().indexOf(name.toLowerCase());
  if (nameIndex === -1) return '';
  
  const before = text.substring(Math.max(0, nameIndex - 100), nameIndex);
  const after = text.substring(nameIndex + name.length, nameIndex + name.length + 100);
  
  // Look for title patterns
  const titlePatterns = [
    /(?:is|as|the)?\s*(ceo|cto|cfo|president|director|manager|head|vp|vice president)(?:\s+of\s+[\w\s]+)?/i,
    /(chief\s+[\w\s]+officer)/i,
    /(senior\s+[\w\s]+)/i
  ];
  
  for (const pattern of titlePatterns) {
    let match = after.match(pattern);
    if (!match) match = before.match(pattern);
    if (match) return match[1];
  }
  
  return '';
}

function toTitleCase(str: string): string {
  return str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

function extractDepartment(title: string): string {
  if (/engineering|technical|technology|software|development|devops/i.test(title)) return 'Engineering';
  if (/marketing|growth|brand|communications/i.test(title)) return 'Marketing';
  if (/sales|business development|revenue|customer success/i.test(title)) return 'Sales';
  if (/finance|accounting|financial|treasurer/i.test(title)) return 'Finance';
  if (/security|compliance|risk|information security|cybersecurity/i.test(title)) return 'Security';
  if (/hr|human resources|people|talent|recruiting/i.test(title)) return 'Human Resources';
  if (/operations|ops|operational|supply chain/i.test(title)) return 'Operations';
  if (/product|pm|product management/i.test(title)) return 'Product';
  if (/legal|counsel|attorney|lawyer/i.test(title)) return 'Legal';
  if (/design|user experience|ux|ui/i.test(title)) return 'Design';
  return 'Executive';
}

function deduplicateEmployees(employees: any[]): any[] {
  const unique = employees.filter((emp, index, self) => {
    const currentName = emp.name.toLowerCase().replace(/[^\w]/g, '');
    return index === self.findIndex(e => {
      const otherName = e.name.toLowerCase().replace(/[^\w]/g, '');
      return currentName === otherName;
    });
  });
  
  return unique;
}