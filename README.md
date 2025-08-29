# AI Sales Tool

A comprehensive AI-powered sales intelligence tool with **enterprise-grade deep web research capabilities** for professional sales teams. Built with Next.js, TypeScript, and Tailwind CSS.

## 🚀 Key Features

### 🔍 **Enhanced Prospect Intelligence**
- **Advanced PDF Processing**: Upload LinkedIn PDFs with enhanced name extraction (supports Irish/Celtic names like "Conal Curran")
- **Multi-Pattern Recognition**: Sophisticated regex patterns for accurate name detection with fallback strategies
- **Profile Analysis**: Parse experience, education, certifications, and contact information
- **Smart Data Extraction**: AI-powered normalization with validation and error handling

### 🏢 **Comprehensive Company Research**
**DEEP WEB RESEARCH across 15+ sources:**
- ✅ **Job Boards**: LinkedIn Jobs, Indeed, Glassdoor, AngelList, Stack Overflow Jobs, Dice, ClearanceJobs, ZipRecruiter, Monster
- ✅ **Business Intelligence**: Crunchbase (funding, leadership), TheOrg.com (organizational charts), ZoomInfo, D&B Hoovers
- ✅ **Company Intelligence**: Websites, careers pages, blogs, press releases, investor relations
- ✅ **Security Sources**: Have I Been Pwned, CVE databases, security advisory sites
- ✅ **News & Press**: TechCrunch, industry publications, security incident reporting
- **Market Intelligence**: Industry analysis, growth metrics, compliance frameworks
- **MEDDPICC + BANT**: Advanced sales methodology with specific budget/timeline intelligence

### ⚙️ **Advanced Tech Stack Reconnaissance**
**COMPREHENSIVE SOURCE COVERAGE:**
- ✅ **GitHub Intelligence**: Repository analysis, package.json, Dockerfiles, CI/CD configs
- ✅ **Developer Platforms**: Docker Hub, npm, PyPI, Maven, NuGet package analysis  
- ✅ **Cloud Marketplaces**: AWS, Azure, GCP usage indicators
- ✅ **Engineering Content**: Company blogs, Medium, Dev.to technical articles
- ✅ **Conference Circuit**: Technical speaker analysis, presentation topics
- ✅ **Social Technical Discussions**: Twitter/X, Reddit, Stack Overflow patterns
- **Technology Categories**: 15+ tools across development and security stacks
- **Evidence Documentation**: Source URLs, exact quotes, confidence levels

### 👥 **Enhanced Account Mapping**
**COMPREHENSIVE ORGANIZATIONAL INTELLIGENCE:**
- ✅ **Multi-Source Verification**: LinkedIn, TheOrg.com, company websites, Crunchbase, SEC filings
- ✅ **Leadership Mapping**: C-suite, VPs, Directors with complete background verification
- ✅ **Decision Authority**: Budget approvers, technology decision makers, procurement influencers
- **Stakeholder Classification**: Economic buyers, champions, evaluators, influencers, blockers, users
- **Cross-Source Confirmation**: Every person verified across minimum 2 sources
- **Reporting Hierarchies**: Complete org structure with manager-direct report chains

### 🎯 **AI-Generated Sales Plans**
- **Executive Summary**: Comprehensive opportunity analysis with specific metrics
- **Value Proposition Mapping**: Problem-solution alignment with PortSwigger-specific proof points
- **Stakeholder Strategy**: Personalized talk tracks and next actions for each contact
- **Advanced MEDDPICC**: Complete sales methodology with budget ranges and decision processes
- **Mutual Action Plans**: Timeline-driven milestones with specific owners and due dates
- **Risk Mitigation**: Identified obstacles with recommended resolution strategies

### 💬 **Professional AI Sales Copilot**
- **Context-Aware Intelligence**: Query comprehensive research data and sales strategy
- **Evidence-Based Recommendations**: All suggestions backed by source citations
- **Natural Language Processing**: Ask complex questions about prospects and companies
- **Real-Time Insights**: Instant analysis of your sales opportunity with confidence scoring

### 🎨 **Enterprise-Grade UI/UX**
- **Professional Design**: Inter font family with enterprise color schemes
- **Production-Ready Components**: Card-elevated designs with shadows and animations
- **Loading States**: Professional progress indicators and backdrop blur effects
- **Status Management**: Color-coded badges (success, warning, error, info) with proper transitions
- **Responsive Design**: Mobile-first approach with proper breakpoints and accessibility

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Claude API key (recommended) or OpenAI API key
- SERP API key (optional for enhanced web search)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-sales-tool
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Configuration

1. **API Keys**: Click the settings icon (⚙️) in the header
2. **Add Claude API Key**: Get from [Anthropic Console](https://console.anthropic.com/)
3. **Optional - OpenAI Key**: For GPT-4 with web browsing
4. **Optional - SERP API**: For enhanced search capabilities

## Usage Guide

### 1. Create a Project
- Click "+" in the sidebar
- Enter project name, company name, and domain
- This creates your sales opportunity workspace

### 2. Upload Prospect Profile
- **Profile Tab**: Upload LinkedIn PDF or image
- The AI extracts structured data automatically
- Review and validate the extracted information

### 3. Run Research Pipeline
- **Research Tab**: Analyze company and market intelligence
- **Stack Tab**: Discover technology and security tools
- **Account Tab**: Map organizational structure and stakeholders
- Each step builds on previous data for comprehensive analysis

### 4. Generate Sales Plan
- **Plan Tab**: Creates enterprise sales strategy automatically
- Requires completion of all research phases
- Includes value mapping, stakeholder strategy, and action plans

### 5. Use Sales Copilot
- **Chat Tab**: Ask questions about your research
- Get instant insights and recommendations
- Chat is context-aware of all your data

## Data & Privacy

- **Local Storage**: All data stored in your browser
- **No External Servers**: Data only sent to AI APIs for processing
- **Encrypted Keys**: API keys encrypted in local storage
- **Full Control**: Export or delete your data anytime

## Export Options

- **Sales Plans**: Export as Markdown or PDF
- **Org Charts**: Export as CSV
- **Citations**: Export source lists as CSV
- **Complete Projects**: Full data export for backup

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS with custom design system
- **State Management**: Zustand with persistence
- **AI Integration**: Anthropic Claude, OpenAI GPT-4
- **Data Processing**: Tesseract.js for OCR, PDF.js for parsing
- **Validation**: AJV for JSON schema validation

## Development

### Scripts
- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run start` - Production server
- `npm run lint` - ESLint checks
- `npm run type-check` - TypeScript validation

### Project Structure
```
src/
├── app/                 # Next.js app directory
├── components/          # React components
│   ├── layout/         # Layout components
│   ├── tabs/           # Feature tab components
│   ├── chat/           # Chat interface
│   ├── settings/       # Settings panel
│   └── ui/             # Reusable UI components
├── lib/                # Utilities and services
│   ├── ai.ts           # AI service integration
│   ├── ocr.ts          # OCR processing
│   └── schemas.ts      # Data validation
├── stores/             # State management
├── types/              # TypeScript definitions
└── utils/              # Helper functions
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For questions or support:
- Check the documentation
- Review the code comments
- Open an issue on GitHub

---

**Built with ❤️ for enterprise sales teams**