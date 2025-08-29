// Enhanced LinkedIn profile parser that extracts structured data from PDF text

import { ProspectProfile, Experience, Education, LicenseCertification } from '@/types';

// Normalizes bullets like "•", "·", "-", "–", "*" to a unified symbol.
function normalizeBullets(s: string) {
  return s.replace(/[•·\-–\*]\s+/g, '• ');
}

// Extract a block under a heading (case-insens, allows optional colons/whitespace)
function extractSection(text: string, label: string): string {
  const rx = new RegExp(
    `(^|\\n)\\s*${label}\\s*:?[\\s\\n]+([\\s\\S]*?)(?=\\n\\s*[A-Z][A-Za-z ]{2,}\\s*:?[\\s\\n]+|$)`,
    'i'
  );
  const m = text.match(rx);
  return m ? m[2].trim() : '';
}

function parseContact(text: string) {
  const emailMatch = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  const phoneMatch = text.match(/(\+?\d[\d\s\-().]{7,}\d)/);
  const liMatch = text.match(/https?:\/\/(www\.)?linkedin\.com\/in\/[^\s)]+/i);
  return {
    email: emailMatch?.[0],
    phone: phoneMatch?.[0],
    linkedin_url: liMatch?.[0],
  };
}

function parseExperience(block: string): Experience[] {
  if (!block) return [];
  const entries = block.split(/\n{2,}/).map(s => s.trim()).filter(Boolean);

  // Heuristic: Title — Company — Dates — Location (+ bullets)
  return entries.map<Experience>(e => {
    const lines = normalizeBullets(e).split('\n').map(l => l.trim()).filter(Boolean);

    const first = lines[0] ?? '';
    // Try to split "Title at Company" or "Company — Title" variants
    let title = first, company = '';
    const at = first.split(/\s+at\s+/i);
    if (at.length === 2) { title = at[0]; company = at[1]; }
    else {
      const dash = first.split(/\s+[–-]\s+/);
      if (dash.length === 2) { title = dash[0]; company = dash[1]; }
    }

    const dateLine = lines.find(l => /\b(20\d{2}|19\d{2})\b.*\b(20\d{2}|Present|Current)\b/i)?.trim() ?? '';
    const locationLine = lines.find(l => /(Remote|United|Canada|USA|UK|Europe|City|County|State)/i) ?? '';

    // Bullets: lines that start with a bullet after normalization
    const bullets = lines.filter(l => l.startsWith('• ')).map(b => b.replace(/^•\s*/, ''));

    // Try to split dateLine like "Jan 2022 – Present" or "2021 - 2023"
    let start_date = '', end_date = '';
    const dm = dateLine.match(/([A-Za-z]{3,}\s*)?\b(19|20)\d{2}\b.*?(Present|Current|\b(19|20)\d{2}\b)/i);
    if (dm) {
      const parts = dateLine.split(/[–-]/);
      start_date = parts[0]?.trim() ?? '';
      end_date = parts[1]?.trim() ?? '';
    }

    return {
      title: title || '',
      company: company || '',
      start_date,
      end_date,
      location: locationLine.replace(/^Location:\s*/i, '').trim(),
      summary_bullets: bullets,
    };
  });
}

function parseEducation(block: string): Education[] {
  if (!block) return [];
  return block
    .split(/\n{2,}/)
    .map(s => s.trim())
    .filter(Boolean)
    .map<Education>(e => {
      const lines = e.split('\n').map(x => x.trim()).filter(Boolean);
      const school = lines[0] ?? '';
      const degree = (lines.find(l => /(B\.?Sc\.?|M\.?Sc\.?|MBA|BA|BS|MS|PhD|Diploma|Certificate)/i) ?? '').trim();
      const field = (lines.find(l => /(Computer|Engineering|Business|Finance|Science|Arts|Studies)/i) ?? '').trim();
      const years = (lines.find(l => /\b(19|20)\d{2}\b.*\b(19|20)\d{2}\b/) ?? '').trim();
      const y = years.match(/\b(19|20)\d{2}\b/g) || [];
      return {
        school,
        degree,
        field,
        start_year: y[0] ?? '',
        end_year: y[1] ?? '',
      };
    });
}

function parseCerts(block: string): LicenseCertification[] {
  if (!block) return [];
  return block
    .split(/\n{2,}/)
    .map(s => s.trim())
    .filter(Boolean)
    .map<LicenseCertification>(line => {
      const name = line.split('\n')[0] ?? line;
      const issuer = (line.match(/(Issued by|Issuer):\s*([^\n]+)/i)?.[2] ?? '').trim();
      const issue_date = (line.match(/(Issued|Issue Date):\s*([^\n]+)/i)?.[2] ?? '').trim();
      const expiry_date = (line.match(/(Expires|Expiry):\s*([^\n]+)/i)?.[2] ?? '').trim();
      const credential_id = (line.match(/(ID|Credential):\s*([^\n]+)/i)?.[2] ?? '').trim();
      return { name, issuer, issue_date, expiry_date, credential_id };
    });
}

export function parseLinkedInProfileText(text: string): ProspectProfile {
  const normalized = normalizeBullets(text).replace(/\r/g, '');

  // Common LinkedIn headings
  const sections = {
    summary: extractSection(normalized, '(About|Summary|Profile Summary)'),
    experience: extractSection(normalized, 'Experience'),
    education: extractSection(normalized, 'Education'),
    certs: extractSection(normalized, '(Licenses? & Certifications?|Certifications?)'),
    contact: extractSection(normalized, '(Contact|Contact Info|Details)'),
    headline: extractSection(normalized, '(Headline|Title)'),
  };

  const contact = parseContact(sections.contact || normalized);

  // Try to infer full name: first non-empty line before Summary/About/Experience
  const name =
    (normalized.match(/^[^\n]{3,}$/m)?.[0] ?? '').trim() ||
    (normalized.split('\n')[0] ?? '').trim();

  return {
    full_name: name,
    headline: sections.headline?.split('\n')[0]?.trim() || undefined,
    location: (normalized.match(/Location:\s*([^\n]+)/i)?.[1] ?? '').trim() || undefined,
    contact,
    experience: parseExperience(sections.experience),
    education: parseEducation(sections.education),
    licenses_certifications: parseCerts(sections.certs),
    notes: sections.summary ? sections.summary.split('\n').filter(Boolean) : [],
  };
}

// Legacy export for backward compatibility
export function parseLinkedInProfile(text: string): ProspectProfile {
  return parseLinkedInProfileText(text);
}