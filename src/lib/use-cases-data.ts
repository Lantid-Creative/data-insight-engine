import {
  GraduationCap, Stethoscope, Landmark, FlaskConical, Pill, HeartPulse
} from "lucide-react";

export interface UseCaseSection {
  title: string;
  description: string;
  bullets?: string[];
}

export interface UseCaseData {
  slug: string;
  icon: typeof Stethoscope;
  title: string;
  category: string;
  description: string;
  heroDescription: string;
  sections: UseCaseSection[];
}

export const USE_CASES_DATA: UseCaseData[] = [
  {
    slug: "healthcare",
    icon: Stethoscope,
    title: "Healthcare & Hospitals",
    category: "Clinical Operations",
    description: "Patient data analysis, clinical trial summaries, and compliance reporting with HIPAA-first architecture.",
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
    slug: "pharma-biotech",
    icon: Pill,
    title: "Pharma & Biotech",
    category: "Drug Development",
    description: "Accelerate drug discovery pipelines with automated clinical data extraction, adverse event analysis, and FDA submission workflows.",
    heroDescription: "From molecule to market — DataAfro automates the data-intensive phases of drug development, helping pharma and biotech teams move faster while staying compliant.",
    sections: [
      { title: "Drug Discovery Data Processing", description: "Process high-throughput screening data, compound libraries, and assay results. DataAfro identifies promising candidates and generates structured reports for research teams.", bullets: ["HTS data normalization and hit identification", "SAR analysis with compound clustering", "Lead optimization tracking dashboards"] },
      { title: "Clinical Data Management", description: "Clean, validate, and reconcile clinical trial data across multiple sites. Ensure data integrity with automated edit checks and query resolution.", bullets: ["Automated CRF data validation", "Multi-site data reconciliation", "CDISC SDTM/ADaM dataset generation"] },
      { title: "Adverse Event Monitoring", description: "Detect and report adverse events from clinical and post-market data. Automated signal detection with MedDRA coding and narrative generation.", bullets: ["Automated MedDRA coding of adverse events", "Signal detection with disproportionality analysis", "CIOMS/PBRER narrative generation"] },
      { title: "FDA & EMA Submissions", description: "Compile submission-ready dossiers from raw clinical data. DataAfro automates eCTD formatting, cross-referencing, and quality checks.", bullets: ["eCTD Module 2-5 document generation", "Cross-study safety and efficacy summaries", "Submission readiness gap analysis"] },
      { title: "Real-World Evidence", description: "Analyze claims data, EHR extracts, and patient registries to generate real-world evidence supporting drug efficacy and market access.", bullets: ["Claims data analysis and cohort identification", "Treatment pattern and outcomes analysis", "Health economic modeling support"] },
      { title: "Pharmacovigilance", description: "Continuous post-market safety monitoring with automated ICSR processing, periodic safety report generation, and risk management plan updates.", bullets: ["Automated ICSR case processing", "PSUR/PBRER automated generation", "Risk-benefit assessment support"] },
    ],
  },
  {
    slug: "clinical-research",
    icon: FlaskConical,
    title: "Clinical Research Organizations",
    category: "CROs & Research",
    description: "Streamline multi-site trial management, data cleaning, and regulatory reporting for clinical research organizations.",
    heroDescription: "Purpose-built for CROs managing complex, multi-site clinical trials. DataAfro automates data management workflows so your teams can focus on science, not spreadsheets.",
    sections: [
      { title: "Multi-Site Trial Management", description: "Aggregate and harmonize data across dozens of clinical sites. DataAfro normalizes data formats, resolves discrepancies, and maintains a single source of truth.", bullets: ["Cross-site data harmonization", "Automated data discrepancy detection", "Real-time enrollment and progress dashboards"] },
      { title: "EDC Data Processing", description: "Extract, clean, and transform data from electronic data capture systems. Automated edit checks catch errors early and reduce query volumes.", bullets: ["Automated edit check execution", "Query generation and tracking", "Data listing and summary table generation"] },
      { title: "Biostatistical Programming", description: "Generate analysis-ready datasets and statistical outputs from raw clinical data. CDISC-compliant transformations with full traceability.", bullets: ["SDTM and ADaM dataset creation", "TFL (Tables, Figures, Listings) generation", "Define.xml and reviewer's guide automation"] },
      { title: "Regulatory Document Preparation", description: "Compile CSRs, IBs, and other regulatory documents from trial data. DataAfro ensures consistency across sections and compliance with ICH guidelines.", bullets: ["Clinical Study Report automation", "Investigator's Brochure updates", "Safety narrative generation"] },
      { title: "Data Quality & Monitoring", description: "Risk-based monitoring powered by data analytics. Identify sites at risk, track protocol deviations, and generate monitoring visit reports.", bullets: ["Risk-based monitoring dashboards", "Protocol deviation tracking and trending", "Centralized statistical monitoring"] },
      { title: "Study Close-Out", description: "Automate the tedious close-out process with database lock procedures, final TFL generation, and archival-ready documentation packaging.", bullets: ["Database lock checklist automation", "Final analysis dataset generation", "TMF archival document packaging"] },
    ],
  },
  {
    slug: "health-research",
    icon: GraduationCap,
    title: "Health Research & Academia",
    category: "Medical Research",
    description: "Turn clinical survey data into publication-ready summaries. Auto-generate systematic reviews and biostatistical breakdowns.",
    heroDescription: "Accelerate your health research pipeline from data collection to publication. DataAfro handles the tedious clinical data processing so you can focus on breakthrough medical discoveries.",
    sections: [
      { title: "Systematic Review Automation", description: "Upload hundreds of clinical study PDFs and DataAfro extracts key findings, methodologies, and PRISMA-compliant data. Generate structured systematic reviews with proper medical formatting.", bullets: ["PRISMA-compliant data extraction", "Thematic clustering of clinical studies", "Evidence quality assessment (GRADE framework)"] },
      { title: "Clinical Survey Processing", description: "Transform raw patient survey responses and PRO (Patient-Reported Outcomes) data into statistically rigorous analyses for clinical research.", bullets: ["Automated PRO scoring (EQ-5D, SF-36, PHQ-9)", "Cross-tabulation with patient demographics", "Statistical significance testing for clinical endpoints"] },
      { title: "Biostatistical Analysis", description: "Run complex biostatistical analyses from clinical datasets. Survival analysis, mixed-effects models, and meta-analyses — all without writing code.", bullets: ["Kaplan-Meier survival analysis", "Mixed-effects regression for longitudinal data", "Forest plots and meta-analysis outputs"] },
      { title: "NIH & Grant Reporting", description: "Compile clinical research progress into grant-compliant reports. Automatically format outputs to match NIH, WHO, Wellcome Trust, and other health funding body requirements.", bullets: ["NIH Biosketch and progress report templates", "Clinical milestone tracking with evidence", "Patient enrollment and outcome dashboards"] },
      { title: "Medical Data Visualization", description: "Generate publication-quality clinical charts — forest plots, Kaplan-Meier curves, CONSORT diagrams. Every visualization follows medical journal guidelines.", bullets: ["CONSORT flow diagram generation", "Clinical outcome visualizations", "NEJM/Lancet/BMJ styling presets"] },
      { title: "Research Collaboration", description: "Share de-identified clinical datasets with collaborators while maintaining full provenance and IRB compliance. Every transformation is logged for reproducibility.", bullets: ["De-identified dataset sharing", "IRB-compliant audit trails", "FAIR data principle compliance"] },
    ],
  },
  {
    slug: "public-health",
    icon: Landmark,
    title: "Public Health & Government",
    category: "Population Health",
    description: "Disease surveillance, epidemiological reporting, and health policy analytics — at scale, with zero manual formatting.",
    heroDescription: "Modernize public health data operations. DataAfro helps health departments and government agencies process population-level health data efficiently while maintaining transparency.",
    sections: [
      { title: "Disease Surveillance", description: "Process real-time disease reporting data from multiple sources. DataAfro generates surveillance dashboards, outbreak alerts, and WHO-compliant situation reports.", bullets: ["Real-time case count aggregation and trending", "Outbreak detection with threshold algorithms", "WHO IHR-compliant situation reporting"] },
      { title: "Epidemiological Analysis", description: "Run population-level analyses including incidence/prevalence calculations, risk factor assessments, and spatial epidemiology from public health datasets.", bullets: ["Incidence and prevalence rate calculations", "Risk factor analysis with odds ratios", "Geographic cluster detection and mapping"] },
      { title: "Health Program Evaluation", description: "Measure the effectiveness of public health programs — vaccination campaigns, maternal health initiatives, disease prevention programs — with rigorous impact evaluation.", bullets: ["Pre-post intervention analysis", "Cost-effectiveness analysis (CEA/CUA)", "Program reach and coverage metrics"] },
      { title: "Health Policy Analytics", description: "Model health policy scenarios using population data and projections. Help policymakers understand the impact of coverage changes, funding allocations, and regulatory decisions.", bullets: ["Health policy scenario modeling", "Budget impact analysis for health programs", "Health equity assessment across populations"] },
      { title: "Vital Statistics & Registry", description: "Process birth, death, and disease registry data at scale. Generate automated vital statistics reports compliant with national and international standards.", bullets: ["ICD-coded mortality analysis", "Birth outcome and maternal health reporting", "Disease registry analytics and trend reports"] },
      { title: "Health Data Transparency", description: "Generate public-facing health data dashboards and open data publications. Budget execution for health programs, facility performance metrics, and population health indicators.", bullets: ["Public health dashboard generation", "Open data publishing (FHIR/HL7 compliant)", "Health facility performance scorecards"] },
    ],
  },
  {
    slug: "digital-health",
    icon: HeartPulse,
    title: "Digital Health & Telemedicine",
    category: "HealthTech",
    description: "Telehealth analytics, remote patient monitoring data, and digital therapeutic outcome reporting for modern health platforms.",
    heroDescription: "Built for the next generation of healthcare delivery. DataAfro processes data from telemedicine platforms, wearables, and digital therapeutics to drive better patient outcomes.",
    sections: [
      { title: "Telehealth Analytics", description: "Analyze telemedicine visit data to optimize virtual care delivery. Track utilization, patient satisfaction, and clinical outcomes across your telehealth platform.", bullets: ["Visit volume and utilization analytics", "Patient satisfaction and NPS tracking", "Clinical outcome comparison: virtual vs. in-person"] },
      { title: "Remote Patient Monitoring", description: "Process data from RPM devices and wearables at scale. Aggregate vitals, detect anomalies, and generate clinical alerts and trend reports.", bullets: ["Multi-device vital sign aggregation", "Anomaly detection with clinical alert thresholds", "Patient compliance and engagement metrics"] },
      { title: "Digital Therapeutics Outcomes", description: "Measure and report clinical outcomes from digital therapeutic interventions. Generate evidence packages for payer submissions and regulatory approval.", bullets: ["DTx engagement and adherence analytics", "Clinical endpoint measurement", "RWE evidence package generation"] },
      { title: "Patient Journey Analytics", description: "Map the complete digital patient journey across touchpoints. Identify friction points, drop-offs, and opportunities to improve the care experience.", bullets: ["Multi-touchpoint patient journey mapping", "Care gap identification and closure tracking", "Patient engagement scoring"] },
      { title: "Wearable Data Integration", description: "Ingest and normalize data from Apple Health, Fitbit, Garmin, and clinical-grade devices. Generate unified patient health summaries from diverse data sources.", bullets: ["Multi-platform data normalization", "Longitudinal health trend analysis", "Clinical-grade data quality scoring"] },
      { title: "Health Platform Compliance", description: "Ensure your digital health platform meets HIPAA, HITRUST, and SOC 2 requirements. Automated compliance monitoring and evidence generation.", bullets: ["HIPAA technical safeguard monitoring", "HITRUST CSF evidence collection", "Automated penetration test reporting"] },
    ],
  },
];
