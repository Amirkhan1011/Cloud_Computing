# InvoiceIQ — Reflective Summary

**Project:** InvoiceIQ — AI Invoice Intelligence Assistant  
**Role:** Product Architect (directing AI implementation agent)  
**Course:** SIS Week 12 — Integrated Agentic Mini-Project

---

## Project Summary

InvoiceIQ is a Streamlit-based AI tool that uses the Google Gemini API to extract 
structured data from invoice text. It was designed for SME bookkeepers and accounting 
professionals who need a faster, more reliable first-pass invoice review tool.

The project was developed using an agentic development model: I acted as the Product 
Architect, defining requirements, approving architectural decisions, and directing the 
AI agent (Claude) to generate all implementation artifacts. No core application logic 
was written manually.

---

## Agentic Development Process

The development followed a structured sequence:

1. **S2P Phase:** I directed the AI to propose three project options and evaluated them 
   against feasibility and rubric alignment criteria. InvoiceIQ was selected.

2. **Architecture Phase:** I directed the AI to produce a full architecture document 
   covering all 16 design dimensions before any code was written.

3. **R2D Phase:** The AI generated the project incrementally in six implementation blocks, 
   each following the structured A/B/C/D/E format that created audit trail entries.

4. **R2F/D2C Phase:** The AI implemented the extraction engine with built-in validation, 
   error handling, and logging — mapping directly to the fulfillment and detection streams.

---

## Hardest Architectural Bottlenecks to Communicate

### 1. Hallucination Mitigation
The most difficult architectural concept to communicate was the difference between 
*preventing* hallucination at the prompt level versus *detecting* it at the validation 
level. I had to direct the AI agent to use both strategies simultaneously — the prompt 
enforces null-over-fabrication, while the UI validation layer catches and surfaces nulls. 
Neither strategy alone is sufficient.

### 2. JSON Response Reliability
LLMs do not always return clean JSON. Communicating the need for a 3-attempt recovery 
parser (direct → strip fences → regex extract) required explicitly scoping the failure 
modes rather than assuming the API would always behave consistently. This is a 
production-grade concern that student projects often miss.

### 3. Separation of Concerns
Directing the AI to separate prompts (prompts.py), business logic (invoice_processor.py), 
display formatting (utils.py), and UI (app.py) required explicit architectural guidance. 
Left without direction, an AI agent tends to produce a single monolithic file. The modular 
structure makes each file independently testable and maintainable.

### 4. FinOps at Student Scale
Communicating the need for token usage tracking — even in a student project — required 
framing it as both a grading requirement (NFR demonstration) and a real-world practice. 
The sidebar token counter demonstrates cost awareness without requiring any external 
infrastructure.

---

## What I Learned

- Prompt engineering is software architecture: the structure of a prompt is as consequential 
  as the structure of a module.
- Agentic development requires precise architectural direction — ambiguous requirements 
  produce working but unstructured code.
- IT4IT is not just a compliance exercise: mapping to the four value streams forced me to 
  think about the product as a service, not just a script.
- The D2C stream is the most underappreciated: robust detection and correction is what 
  separates a demo from a production-grade tool.

---

## Limitations and Future Work

- **v1 limitation:** Text-only input. PDF OCR would dramatically expand practical utility.
- **v1 limitation:** No persistence. Extraction history would enable workflow tracking.
- **Future:** Confidence scores per field would improve the warning system.
- **Future:** Integration with accounting APIs (Xero, QuickBooks) would close the R2F loop.
- **Future:** Batch processing mode for uploading multiple invoices at once.