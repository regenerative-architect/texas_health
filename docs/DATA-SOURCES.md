# Data Sources and Provenance

Retrieval/build date: **2026-09-28**.

The application separates bundled reference content, modeled planning outputs and live official services. A link marked **Live** can change after this build. Machine-readable metadata is in `data/source-registry.json`; selected operational facts are in `data/texas-health-reference-2026.json`.

## Texas health and access sources

| Domain | Publisher | Resource | Use / boundary |
|---|---|---|---|
| Medicaid/CHIP application | Texas HHSC | https://www.yourtexasbenefits.com/ | Official application/account pathway; the OS does not guarantee eligibility |
| Medicaid transportation | Texas HHSC | https://hhs.texas.gov/services/health/medicaid-chip/programs/medical-transportation-program | NEMT process, transport modes, request timing and accessibility planning |
| Aging/disability/behavioral-health offices | Texas HHSC | https://resources.hhs.texas.gov/pages/find-services | AAA/ADRC/LMHA/LIDDA navigation by county/ZIP |
| Medicare counseling | Texas HHSC | https://hhs.texas.gov/services/health/medicare | HICAP / Texas Medicare Help Line navigation |
| Disability services | Texas HHSC | https://hhs.texas.gov/services/disability/ | Disability programs and ECI navigation |
| Behavioral-health crisis services | Texas HHSC | https://hhs.texas.gov/services/mental-health-substance-use/mental-health-crisis-services | 988, 2-1-1 and local authority crisis pathways |
| Rural pediatric tele-connectivity | Texas HHSC | https://resources.hhs.texas.gov/rfa/hhs0017228 | 2026 rural hospital/RHC pediatric specialist connectivity program context |
| Workforce shortage | Texas DSHS / Texas Primary Care Office | https://www.dshs.texas.gov/center-health-statistics/texas-primary-care-office-tpco/shortage-area-designations/health-professional-shortage-area-designations | HPSA/MUA-P planning; not a guarantee that a named provider is available |
| Community health workers | Texas DSHS | https://www.dshs.texas.gov/community-health-worker | CHW/promotor(a) program, training and certification context |
| CHW competencies | Texas DSHS | https://www.dshs.texas.gov/community-health-worker/chw-core-competencies | 2026 competency-transition context |
| Maternal/infant dashboards | Texas DSHS | https://healthdata.dshs.texas.gov/ | Maternal/infant public-health data with source/limitation context |
| School health | Texas DSHS | https://www.dshs.texas.gov/immunizations/school | Current school/childcare immunization materials; verify school-year documents |
| Air quality | TCEQ | https://www.tceq.texas.gov/airquality | Environmental-health context; not individual medical diagnosis |
| Drinking water | TCEQ | https://www.tceq.texas.gov/drinkingwater | Public-water program/notice context |
| Rural/accessibility mobility | TxDOT | https://www.txdot.gov/projects/planning/utp/multimodal-programs.html | Transit/accessibility system planning |
| Broadband / BEAD | Texas Broadband Development Office | https://comptroller.texas.gov/programs/broadband/funding/bead/ | Broadband deployment/project status relevant to telehealth/community anchors |

## Federal health-access sources

| Domain | Publisher | Resource | Use / boundary |
|---|---|---|---|
| Community health centers | HRSA | https://www.hrsa.gov/get-health-care | Uninsured/underinsured care and sliding-fee health-center education |
| Health-center finder | HRSA | https://findahealthcenter.hrsa.gov/ | Live facility discovery; verify appointment availability directly |
| Hospital price transparency | CMS | https://www.cms.gov/priorities/key-initiatives/hospital-price-transparency | Machine-readable price/consumer-tool literacy; published amounts are not a guaranteed bill |
| Medical bill rights | CMS | https://www.cms.gov/initiatives/your-patient-rights/medical-bill-rights/know-your-medical-bill-rights | No Surprises Act / good-faith-estimate rights and exceptions |
| Medicare Savings Programs | Medicare/CMS | https://www.medicare.gov/basics/costs/help/medicare-savings-programs | Cost-assistance education; verify current limits |
| ACA Marketplace | HealthCare.gov | https://www.healthcare.gov/ | Enrollment and plan-comparison pathway |
| Heat & health | CDC | https://www.cdc.gov/heat-health/about/index.html | Heat-risk and continuity education |
| Preventive services | USPSTF | https://www.uspreventiveservicestaskforce.org/uspstf/recommendation-topics | Preventive-care discussion prompts; individualized recommendations may differ |
| Substance-use treatment | SAMHSA | https://findtreatment.gov/ | Live treatment-facility discovery |
| Crisis support | 988 Lifeline | https://988lifeline.org/ | Suicide/mental-health crisis access |

## Software / architecture sources

- Trystero documentation and releases — https://github.com/dmotz/trystero
- WebLLM 0.2.85 worker/cache documentation — https://webllm.mlc.ai/docs/user/advanced_usage.html

The app pins Trystero **0.25.3** because that version was requested. The source registry records the pin even if upstream has a newer release.

## Evidence classes

- **A** — authoritative measured/administrative data or official program information
- **B** — peer-reviewed evidence
- **C** — governmental/institutional analysis or software-project documentation
- **D** — preliminary evidence
- **E** — simplified model/scenario
- **F** — hypothesis/concept

Evidence class does not mean “good/bad” or rank people/communities. It describes evidence provenance/type.

## Source rules

1. Do not treat cached/bundled descriptions as proof of current eligibility, availability, hours, funding or clinical appropriateness.
2. Recheck date-sensitive programs at the official source before consequential action.
3. Store publisher, URL, source date/retrieval date, geography and limitations with locally entered evidence where feasible.
4. Never invent missing county/provider statistics.
5. Do not convert environmental measurements or access metrics into an individual diagnosis.
6. Record scenario/model output as modeled evidence rather than official Texas statistics.
7. Live integrations must expose retrieval time, publisher, geography and failure/offline state.
8. A broadband award/selection is not proof that service is already activated at a particular address.
