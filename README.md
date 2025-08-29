# AI Sales Tool

A comprehensive AI-powered sales intelligence tool for enterprise software sales. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

### 🔍 **Prospect Intelligence**
- **PDF Upload & OCR**: Upload LinkedIn PDFs and extract structured prospect profiles
- **Profile Analysis**: Parse experience, education, certifications, and contact information
- **Smart Data Extraction**: AI-powered normalization of prospect data

### 🏢 **Company Research**
- **Market Intelligence**: Industry analysis, company size, and revenue estimates
- **Security Posture**: Compliance frameworks, recent incidents, and security signals
- **Hiring Signals**: Development and security role tracking
- **MEDDPICC + BANT**: Comprehensive sales methodology analysis

### ⚙️ **Tech Stack Reconnaissance**
- **Development Stack**: CI/CD, SCM, cloud platforms, and frameworks
- **Security Tools**: SAST/DAST, vulnerability management, and monitoring
- **Evidence-Based**: All findings backed by sources and citations
- **Gap Analysis**: Identify unknown areas for follow-up research

### 👥 **Account Mapping**
- **Org Chart Visualization**: Leadership hierarchy with reporting structure
- **Stakeholder Analysis**: Economic buyers, champions, evaluators, and blockers
- **Decision Tree**: Visual org structure with role identification
- **Influence Mapping**: Contact strategy and engagement planning

### 🎯 **Sales Plan Generation**
- **Value Proposition**: Problem-solution mapping with proof points
- **Stakeholder Strategy**: Personalized talk tracks for each contact
- **MEDDPICC Summary**: Complete sales methodology assessment
- **Mutual Action Plan**: Timeline-driven next steps with owners
- **Risk Assessment**: Identify and mitigate sales obstacles

### 💬 **AI Sales Copilot**
- **Context-Aware Chat**: Query any research data or sales strategy
- **Smart Suggestions**: Get recommendations based on your data
- **Natural Language**: Ask questions in plain English
- **Real-Time Help**: Instant answers about your sales opportunity

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