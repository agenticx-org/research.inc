export interface Document {
  id: string;
  title: string;
  content?: string;
  createdAt: Date;
  updatedAt: Date;
  editedAt?: Date;
}

// Mock data for documents
export const mockDocuments: Document[] = [
  {
    id: "1",
    title: "Competitive Automotive Analysis: Electric Vehicle Market 2023",
    content:
      "This comprehensive analysis examines the current competitive landscape of the electric vehicle market, focusing on key players, technological innovations, market share distribution, and growth projections. The report highlights emerging trends in battery technology, autonomous driving capabilities, and consumer adoption patterns across different regions.",
    createdAt: new Date("2023-05-15"),
    updatedAt: new Date("2023-05-15"),
    editedAt: new Date("2023-06-20"),
  },
  {
    id: "2",
    title:
      "Private Equity Investment Opportunity: Healthcare Technology Sector",
    content:
      "This investment memorandum evaluates potential acquisition targets in the healthcare technology sector, with a focus on telemedicine platforms, AI-driven diagnostic tools, and patient management systems. The analysis includes market sizing, competitive positioning, financial projections, and potential exit strategies for a 5-year investment horizon.",
    createdAt: new Date("2023-03-10"),
    updatedAt: new Date("2023-03-10"),
    editedAt: new Date("2023-04-25"),
  },
  {
    id: "3",
    title: "Private Equity Case Study: Manufacturing Consolidation Strategy",
    content:
      "This case study examines a successful roll-up strategy in the precision manufacturing industry, detailing the acquisition and integration of five regional players into a national market leader. The document covers valuation methodologies, synergy realization, operational improvements, and the resulting EBITDA expansion that led to a 3.8x return on invested capital.",
    createdAt: new Date("2023-01-18"),
    updatedAt: new Date("2023-01-18"),
    editedAt: new Date("2023-02-19"),
  },
  {
    id: "4",
    title: "Welcome to Research.inc!",
    content:
      "Welcome to Research.inc, your new document editor! This platform provides powerful tools for creating, editing, and organizing your research documents.",
    createdAt: new Date("2021-02-18"),
    updatedAt: new Date("2021-02-18"),
    editedAt: new Date("2022-02-19"),
  },
  {
    id: "5",
    title: "Automotive Industry Disruption: Autonomous Driving Technology",
    content:
      "This market intelligence report analyzes the disruptive impact of autonomous driving technology on traditional automotive manufacturers, tier-1 suppliers, and new market entrants. The analysis covers regulatory developments, technical challenges, consumer acceptance factors, and projected timeline for widespread Level 4 and Level 5 autonomy adoption across commercial and consumer applications.",
    createdAt: new Date("2023-02-15"),
    updatedAt: new Date("2023-02-15"),
    editedAt: new Date("2023-03-16"),
  },
  {
    id: "6",
    title:
      "Private Equity Opportunity: SaaS Consolidation in Financial Services",
    content:
      "This investment thesis explores the fragmented landscape of financial services SaaS providers and identifies strategic acquisition opportunities to create an integrated platform solution. The analysis includes target company profiles, valuation multiples, integration roadmap, and potential synergies that could drive significant value creation through cross-selling and operational efficiencies.",
    createdAt: new Date("2023-04-05"),
    updatedAt: new Date("2023-04-05"),
    editedAt: new Date("2023-05-12"),
  },
];
