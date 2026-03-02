import {
  TrendingUp, GraduationCap, Building2, Stethoscope, Landmark, Rocket,
  Scale, Leaf, ShoppingCart, Cpu
} from "lucide-react";

export interface UseCaseSection {
  title: string;
  description: string;
  bullets?: string[];
}

export interface UseCaseData {
  slug: string;
  icon: typeof TrendingUp;
  title: string;
  category: string;
  description: string;
  heroDescription: string;
  sections: UseCaseSection[];
}

export const USE_CASES_DATA: UseCaseData[] = [
  {
    slug: "finance-banking",
    icon: TrendingUp,
    title: "Finance & Banking",
    category: "Financial Services",
    description: "Risk reports, portfolio analysis, and compliance documents — generated in seconds from raw transaction data.",
    heroDescription: "Transform raw financial data into actionable intelligence. From risk assessment to regulatory compliance, DataAfro automates the heavy lifting so your analysts can focus on strategy.",
    sections: [
      { title: "Automated Risk Reporting", description: "Generate comprehensive risk reports from transaction logs, market data, and portfolio positions. DataAfro identifies anomalies, calculates VaR metrics, and produces board-ready summaries.", bullets: ["Real-time risk scoring across asset classes", "Automated stress testing scenario generation", "Historical trend analysis with predictive indicators"] },
      { title: "Regulatory Compliance", description: "Stay ahead of Basel III, MiFID II, and SOX requirements with automated compliance document generation. Upload your raw data and receive audit-ready reports.", bullets: ["Auto-formatted regulatory filings", "Cross-reference validation against compliance frameworks", "Audit trail documentation with timestamped evidence"] },
      { title: "Portfolio Analytics", description: "Deep-dive into portfolio performance with multi-dimensional analysis. Break down returns by sector, geography, strategy, and time horizon — all from a single data upload.", bullets: ["Attribution analysis across multiple factors", "Benchmark comparison with custom peer groups", "Drawdown analysis and recovery tracking"] },
      { title: "Transaction Monitoring", description: "Process millions of transactions to detect patterns, flag suspicious activity, and generate SAR reports. Machine learning-powered anomaly detection reduces false positives by 40%.", bullets: ["Pattern recognition across transaction networks", "Automated suspicious activity report generation", "Integration with existing AML/KYC workflows"] },
      { title: "Client Reporting", description: "Generate personalized client reports at scale. Each report is tailored to the client's holdings, risk profile, and investment objectives — delivered in their preferred format.", bullets: ["White-labeled report generation", "Multi-format output: PDF, Excel, interactive HTML", "Scheduled automated delivery"] },
      { title: "Market Intelligence", description: "Aggregate and analyze market data from multiple sources. DataAfro synthesizes news, pricing data, and economic indicators into actionable market briefs.", bullets: ["Cross-source data aggregation and normalization", "Sentiment analysis from news and social feeds", "Custom alert triggers based on market conditions"] },
    ],
  },
  {
    slug: "research-academia",
    icon: GraduationCap,
    title: "Research & Academia",
    category: "Academic Research",
    description: "Turn survey data into publication-ready summaries. Auto-generate lit reviews and statistical breakdowns.",
    heroDescription: "Accelerate your research pipeline from data collection to publication. DataAfro handles the tedious data processing so you can focus on breakthrough discoveries.",
    sections: [
      { title: "Literature Review Automation", description: "Upload hundreds of PDFs and DataAfro extracts key findings, methodologies, and citations. Generate structured literature reviews with proper academic formatting.", bullets: ["Automatic citation extraction and formatting", "Thematic clustering of research papers", "Gap analysis identifying underexplored areas"] },
      { title: "Survey Data Processing", description: "Transform raw survey responses into statistically rigorous analyses. Support for Likert scales, open-ended responses, and mixed-method data.", bullets: ["Automated coding of qualitative responses", "Cross-tabulation with demographic breakdowns", "Statistical significance testing built-in"] },
      { title: "Statistical Analysis Reports", description: "Run complex statistical analyses without writing code. Upload your dataset and specify your hypotheses — DataAfro handles regression, ANOVA, chi-square, and more.", bullets: ["Multi-variate regression with diagnostics", "Effect size calculations and confidence intervals", "Publication-ready tables and figures"] },
      { title: "Grant Reporting", description: "Compile research progress into grant-compliant reports. Automatically format outputs to match NSF, NIH, EU Horizon, and other funding body requirements.", bullets: ["Template matching for major funding bodies", "Milestone tracking with evidence compilation", "Budget reconciliation with research outputs"] },
      { title: "Data Visualization for Papers", description: "Generate publication-quality charts, graphs, and infographics. Every visualization follows journal guidelines and is export-ready in vector formats.", bullets: ["Journal-specific styling presets", "Interactive versions for supplementary materials", "Accessible color palettes for color-blind readers"] },
      { title: "Collaboration & Reproducibility", description: "Share processed datasets with collaborators while maintaining full provenance. Every transformation is logged for reproducibility.", bullets: ["Version-controlled data processing pipelines", "Shareable analysis notebooks", "DOI-ready dataset packaging"] },
    ],
  },
  {
    slug: "business-intelligence",
    icon: Building2,
    title: "Business Intelligence",
    category: "Enterprise Analytics",
    description: "Sales trends, customer segmentation, KPI dashboards — all from a single CSV drop.",
    heroDescription: "Turn raw business data into strategic insights in minutes. DataAfro makes enterprise-grade BI accessible to teams of any size.",
    sections: [
      { title: "Executive Dashboards", description: "Generate C-suite-ready dashboards from raw operational data. Track KPIs, monitor trends, and surface anomalies — all automated.", bullets: ["Real-time KPI tracking with threshold alerts", "Automated trend detection and commentary", "Mobile-optimized executive summaries"] },
      { title: "Customer Segmentation", description: "Discover hidden customer segments using behavioral, demographic, and transactional data. DataAfro applies clustering algorithms to reveal actionable personas.", bullets: ["RFM analysis with predictive scoring", "Behavioral cohort identification", "Churn risk scoring per segment"] },
      { title: "Sales Pipeline Analytics", description: "Visualize your entire pipeline with conversion rates, velocity metrics, and revenue forecasts. Identify bottlenecks and optimize your sales process.", bullets: ["Stage-by-stage conversion analysis", "Win/loss pattern recognition", "Revenue forecasting with confidence intervals"] },
      { title: "Competitive Intelligence", description: "Aggregate competitive data from multiple sources into structured intelligence reports. Track market share, pricing changes, and strategic moves.", bullets: ["Automated competitor monitoring", "Market positioning heat maps", "SWOT analysis generation"] },
      { title: "Operational Efficiency", description: "Analyze operational data to identify inefficiencies, optimize resource allocation, and reduce costs. Process supply chain, logistics, and workforce data.", bullets: ["Process mining from operational logs", "Resource utilization optimization", "Cost driver analysis with recommendations"] },
      { title: "Custom Report Builder", description: "Create templated reports that auto-refresh with new data. Set up scheduled generation and distribution to stakeholders.", bullets: ["Drag-and-drop report templates", "Scheduled auto-generation and email delivery", "Multi-format export: PDF, PPTX, Excel, HTML"] },
    ],
  },
  {
    slug: "healthcare",
    icon: Stethoscope,
    title: "Healthcare",
    category: "Health & Life Sciences",
    description: "Patient data analysis, clinical trial summaries, and compliance reporting with privacy-first architecture.",
    heroDescription: "Process sensitive health data with enterprise-grade security. From clinical trials to hospital operations, DataAfro delivers insights while maintaining HIPAA compliance.",
    sections: [
      { title: "Clinical Trial Analysis", description: "Process trial data to generate interim analyses, safety reports, and efficacy summaries. DataAfro handles complex endpoint calculations and produces regulatory-ready documents.", bullets: ["Endpoint analysis with Kaplan-Meier curves", "Safety signal detection and reporting", "ICH E3-compliant study report generation"] },
      { title: "Electronic Health Records", description: "Extract insights from EHR data without compromising patient privacy. De-identified analytics for population health management and quality improvement.", bullets: ["Automated de-identification pipelines", "Diagnosis pattern analysis across populations", "Readmission risk prediction models"] },
      { title: "Regulatory Submissions", description: "Compile and format data for FDA, EMA, and other regulatory submissions. DataAfro ensures your data meets eCTD and other format requirements.", bullets: ["eCTD-formatted document generation", "Cross-reference validation with regulatory guidelines", "Submission-ready dataset packaging"] },
      { title: "Hospital Operations", description: "Optimize hospital operations with data-driven insights. Analyze patient flow, resource utilization, and staffing patterns to improve efficiency.", bullets: ["Patient flow optimization modeling", "Bed management and capacity forecasting", "Staff scheduling optimization"] },
      { title: "Medical Imaging Reports", description: "Process DICOM metadata and imaging reports at scale. Generate structured summaries from radiology, pathology, and other imaging modalities.", bullets: ["DICOM metadata extraction and analysis", "Structured reporting from free-text findings", "Imaging volume and turnaround analytics"] },
      { title: "Compliance & Auditing", description: "Maintain continuous compliance with HIPAA, GDPR, and other healthcare regulations. Automated audit trails and compliance documentation.", bullets: ["Automated HIPAA compliance checking", "Access log analysis and anomaly detection", "Audit-ready documentation generation"] },
    ],
  },
  {
    slug: "government-ngos",
    icon: Landmark,
    title: "Government & NGOs",
    category: "Public Sector",
    description: "Census data processing, impact assessments, and grant reporting — at scale, with zero manual formatting.",
    heroDescription: "Modernize public sector data operations. DataAfro helps government agencies and NGOs process large-scale datasets efficiently while maintaining transparency and accountability.",
    sections: [
      { title: "Census & Survey Processing", description: "Process millions of census records and survey responses into structured analytical reports. Support for complex sampling designs and weighting schemes.", bullets: ["Large-scale data cleaning and validation", "Weighted statistical analysis", "Geographic breakdown with mapping support"] },
      { title: "Impact Assessment", description: "Measure program effectiveness with rigorous impact evaluation. DataAfro handles difference-in-differences, RCT analysis, and quasi-experimental designs.", bullets: ["Causal inference methodology support", "Counterfactual analysis", "Long-term outcome tracking"] },
      { title: "Grant Management", description: "Track grants from application through completion. Automated progress reporting, financial reconciliation, and outcome measurement.", bullets: ["Multi-funder reporting templates", "Budget vs. actual tracking", "Outcome indicator dashboards"] },
      { title: "Policy Analysis", description: "Model policy scenarios using historical data and projections. DataAfro helps policymakers understand trade-offs and forecast outcomes.", bullets: ["Scenario modeling with sensitivity analysis", "Cost-benefit analysis automation", "Stakeholder impact mapping"] },
      { title: "Open Data Publishing", description: "Transform internal datasets into publication-ready open data formats. Automatic metadata generation, quality checks, and accessibility compliance.", bullets: ["CKAN and DCAT-compliant packaging", "Data quality scoring and documentation", "Accessibility-first formatting"] },
      { title: "Transparency Reporting", description: "Generate public-facing transparency reports from operational data. Budget execution, procurement analytics, and performance metrics — all audit-ready.", bullets: ["Automated FOIA response preparation", "Budget execution visualization", "Performance metric dashboards"] },
    ],
  },
  {
    slug: "startups",
    icon: Rocket,
    title: "Startups",
    category: "Growth & Venture",
    description: "Pitch deck data, market sizing, investor reports — look like a Fortune 500 with a 3-person team.",
    heroDescription: "Punch above your weight with data-driven storytelling. DataAfro gives lean teams the analytical firepower of a Fortune 500 data department.",
    sections: [
      { title: "Investor Reporting", description: "Generate professional investor updates from your operational data. Monthly reports, board decks, and fundraising materials — all polished and data-backed.", bullets: ["Automated monthly investor update generation", "KPI tracking with trend visualization", "Cap table and dilution modeling"] },
      { title: "Market Sizing", description: "Build defensible TAM/SAM/SOM analyses from public and proprietary data. DataAfro helps you tell a compelling market story backed by real numbers.", bullets: ["Bottom-up and top-down market sizing", "Competitive landscape mapping", "Growth rate projections with sources"] },
      { title: "Product Analytics", description: "Understand user behavior without a dedicated data team. Upload event logs and get cohort analyses, funnel visualizations, and retention curves.", bullets: ["Cohort analysis with retention heatmaps", "Funnel conversion optimization", "Feature adoption tracking"] },
      { title: "Financial Modeling", description: "Build and iterate on financial models from your actual data. Revenue projections, unit economics, and scenario planning — all automated.", bullets: ["Revenue model generation from historical data", "Unit economics calculation and tracking", "Burn rate analysis with runway projections"] },
      { title: "Competitive Analysis", description: "Track competitors systematically. DataAfro aggregates public data to keep you informed about market movements and strategic positioning.", bullets: ["Feature comparison matrices", "Pricing intelligence tracking", "Market positioning analysis"] },
      { title: "Hiring & Team Analytics", description: "Optimize your hiring pipeline and team performance with data. From candidate sourcing to performance reviews — data-driven people decisions.", bullets: ["Hiring funnel analytics", "Compensation benchmarking", "Team velocity and productivity metrics"] },
    ],
  },
  {
    slug: "legal-compliance",
    icon: Scale,
    title: "Legal & Compliance",
    category: "Legal Tech",
    description: "Contract analysis, due diligence reports, and regulatory filings — processed with precision at speed.",
    heroDescription: "Automate the data-intensive side of legal work. DataAfro processes contracts, filings, and compliance documents so your legal team can focus on strategy and counsel.",
    sections: [
      { title: "Contract Analysis", description: "Extract key terms, obligations, and risk clauses from thousands of contracts simultaneously. DataAfro identifies non-standard terms and flags potential issues.", bullets: ["Automated clause extraction and categorization", "Risk scoring for non-standard terms", "Obligation tracking with deadline alerts"] },
      { title: "Due Diligence", description: "Accelerate M&A due diligence by processing data rooms at scale. Financial statements, contracts, IP filings — all analyzed and summarized.", bullets: ["Automated data room processing", "Red flag identification and reporting", "Financial reconciliation across entities"] },
      { title: "Regulatory Filing Automation", description: "Generate and validate regulatory filings from raw data. Support for SEC, FCA, and other regulatory body formats.", bullets: ["Pre-submission validation checks", "Cross-filing consistency verification", "Historical filing comparison"] },
      { title: "Litigation Support", description: "Process discovery documents at scale. DataAfro extracts key facts, timelines, and relationships from large document sets.", bullets: ["Document review prioritization", "Timeline reconstruction from documents", "Key fact extraction and cross-referencing"] },
      { title: "Compliance Monitoring", description: "Continuous monitoring of compliance status across regulations. Automated gap analysis and remediation tracking.", bullets: ["Multi-regulation compliance mapping", "Automated gap identification", "Remediation progress tracking"] },
      { title: "IP Portfolio Analysis", description: "Analyze patent portfolios, trademark registrations, and IP assets. Generate landscape reports and competitive IP intelligence.", bullets: ["Patent landscape visualization", "Citation network analysis", "IP valuation support metrics"] },
    ],
  },
  {
    slug: "sustainability-esg",
    icon: Leaf,
    title: "Sustainability & ESG",
    category: "Environmental",
    description: "Carbon accounting, ESG scoring, and sustainability reports — from raw emissions data to board-ready reports.",
    heroDescription: "Turn environmental and social data into transparent, auditable sustainability reports. DataAfro helps organizations meet growing ESG disclosure requirements.",
    sections: [
      { title: "Carbon Accounting", description: "Calculate Scope 1, 2, and 3 emissions from operational data. DataAfro handles complex emission factor calculations and generates GHG Protocol-compliant reports.", bullets: ["Multi-scope emissions calculation", "Supply chain carbon footprint mapping", "Year-over-year reduction tracking"] },
      { title: "ESG Reporting", description: "Generate comprehensive ESG reports aligned with GRI, SASB, TCFD, and other frameworks. One dataset, multiple framework outputs.", bullets: ["Multi-framework report generation", "Materiality assessment automation", "Stakeholder-specific report variants"] },
      { title: "Supply Chain Sustainability", description: "Assess and monitor supplier sustainability performance. Track certifications, audit results, and improvement plans across your supply chain.", bullets: ["Supplier sustainability scoring", "Certification tracking and verification", "Risk assessment across supply tiers"] },
      { title: "Climate Risk Analysis", description: "Model physical and transition climate risks for your portfolio or operations. Scenario analysis aligned with TCFD recommendations.", bullets: ["Physical risk assessment by location", "Transition risk scenario modeling", "Financial impact quantification"] },
      { title: "Biodiversity & Land Use", description: "Track and report on biodiversity impacts and land use changes. Generate reports aligned with TNFD and other emerging frameworks.", bullets: ["Habitat impact assessment", "Land use change tracking", "Biodiversity metric calculation"] },
      { title: "Social Impact Measurement", description: "Quantify and report social impact across your operations. Community investment tracking, diversity metrics, and labor practice reporting.", bullets: ["DEI metric tracking and reporting", "Community investment ROI analysis", "Labor practice compliance monitoring"] },
    ],
  },
  {
    slug: "retail-ecommerce",
    icon: ShoppingCart,
    title: "Retail & E-Commerce",
    category: "Commerce",
    description: "Inventory optimization, demand forecasting, and customer lifetime value — all from your sales data.",
    heroDescription: "Transform retail and e-commerce data into competitive advantage. DataAfro helps merchants optimize everything from inventory to customer experience.",
    sections: [
      { title: "Demand Forecasting", description: "Predict future demand using historical sales, seasonality, and external factors. DataAfro generates SKU-level forecasts with confidence intervals.", bullets: ["SKU-level demand prediction", "Seasonal and trend decomposition", "Promotion impact modeling"] },
      { title: "Customer Lifetime Value", description: "Calculate and predict CLV across customer segments. Identify your most valuable customers and optimize acquisition spend.", bullets: ["Predictive CLV modeling", "Segment-level value analysis", "Acquisition cost optimization"] },
      { title: "Inventory Optimization", description: "Minimize stockouts and overstock with data-driven inventory management. Dynamic reorder points and safety stock calculations.", bullets: ["ABC-XYZ inventory classification", "Dynamic safety stock calculation", "Supplier lead time optimization"] },
      { title: "Price Optimization", description: "Analyze price elasticity and competitive pricing to optimize margins. DataAfro identifies optimal price points for each product and segment.", bullets: ["Price elasticity modeling", "Competitive price monitoring", "Margin optimization recommendations"] },
      { title: "Marketing Attribution", description: "Understand which channels drive conversions with multi-touch attribution modeling. Optimize your marketing spend with data-backed insights.", bullets: ["Multi-touch attribution models", "Channel ROI comparison", "Campaign performance analytics"] },
      { title: "Store Performance", description: "Compare store performance across locations with standardized metrics. Identify best practices from top performers and areas for improvement.", bullets: ["Store benchmarking dashboards", "Foot traffic to conversion analysis", "Assortment optimization by location"] },
    ],
  },
  {
    slug: "manufacturing-iot",
    icon: Cpu,
    title: "Manufacturing & IoT",
    category: "Industrial",
    description: "Sensor data analysis, predictive maintenance reports, and quality control — from raw IoT streams.",
    heroDescription: "Harness the flood of manufacturing and IoT data. DataAfro converts sensor streams into actionable insights for predictive maintenance, quality control, and operational efficiency.",
    sections: [
      { title: "Predictive Maintenance", description: "Analyze equipment sensor data to predict failures before they happen. DataAfro identifies degradation patterns and generates maintenance schedules.", bullets: ["Failure prediction with lead time estimates", "Maintenance schedule optimization", "Spare parts demand forecasting"] },
      { title: "Quality Control Analytics", description: "Process quality inspection data to identify root causes of defects. Statistical process control charts and capability analysis — all automated.", bullets: ["SPC chart generation with control limits", "Root cause analysis with Pareto diagrams", "Cpk and Ppk capability metrics"] },
      { title: "Production Optimization", description: "Analyze production line data to maximize throughput and minimize waste. OEE calculations, bottleneck identification, and cycle time optimization.", bullets: ["OEE calculation and trending", "Bottleneck detection and analysis", "Cycle time optimization recommendations"] },
      { title: "Energy Management", description: "Monitor and optimize energy consumption across facilities. Identify waste, track efficiency improvements, and generate sustainability reports.", bullets: ["Energy consumption pattern analysis", "Peak demand management", "Carbon footprint from energy usage"] },
      { title: "Supply Chain Visibility", description: "Track materials from procurement through production to delivery. Real-time visibility into supply chain performance and risk.", bullets: ["End-to-end supply chain tracking", "Supplier performance scorecards", "Logistics optimization analytics"] },
      { title: "Digital Twin Analytics", description: "Feed data into digital twin models for simulation and optimization. Process real-world sensor data alongside simulation outputs for validation.", bullets: ["Sensor data to simulation pipeline", "Model validation and calibration", "What-if scenario analysis"] },
    ],
  },
];
