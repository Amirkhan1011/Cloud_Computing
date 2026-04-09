# InvoiceIQ — IT4IT Value Stream Mapping

**Project:** InvoiceIQ — AI Invoice Intelligence Assistant  
**Version:** 1.0  
**Course:** SIS Week 12 — Integrated Agentic Mini-Project

---

## Overview

The IT4IT Reference Architecture defines four value streams that together describe how 
IT organizations create, deliver, and maintain technology services. InvoiceIQ was 
designed with explicit alignment to all four value streams.

---

## S2P — Strategy to Portfolio

**What it covers:** How technology investments are identified, assessed, and approved.

**InvoiceIQ alignment:**
- The business problem was identified: SMEs lose significant time to manual invoice processing.
- A cost-benefit case was assessed: Gemini API free tier makes this viable at near-zero operational cost.
- Three product options were evaluated; InvoiceIQ was selected based on implementation feasibility, 
  business value clarity, and AI appropriateness.
- Product scope was defined, non-goals were documented, and risks (hallucination, privacy) were assessed.
- This document and the architecture plan constitute the S2P artifact set.

**Evidence:** Architecture design document, problem statement, scope definition, option evaluation.

---

## R2D — Requirement to Deploy

**What it covers:** How requirements are translated into deployed, working software.

**InvoiceIQ alignment:**
- 10 functional requirements (FR-01 to FR-10) were explicitly defined.
- 7 non-functional requirements (NFR-01 to NFR-07) were defined covering performance, 
  security, cost, and reliability.
- Architecture was designed: module separation (app / processor / prompts / utils / logger).
- Code was generated incrementally by an AI agent under Product Architect direction.
- Deployment approach documented: local Streamlit with pip install.
- requirements.txt ensures reproducible deployment.

**Evidence:** FR/NFR tables, folder structure, requirements.txt, incremental code generation logs.

---

## R2F — Request to Fulfill

**What it covers:** How user requests are received, processed, and fulfilled.

**InvoiceIQ alignment:**
- The core product loop is a classic R2F flow:
  1. User submits invoice text (REQUEST)
  2. Gemini AI extracts structured fields (PROCESS)
  3. Structured data returned to user with summary and warnings (FULFILL)
- The `extract_invoice()` function in `invoice_processor.py` is the fulfillment engine.
- The Streamlit UI is the fulfillment interface — the front door of the service.
- JSON download provides the fulfilled artifact the user can take away.

**Evidence:** extract_invoice() function, app.py fulfillment flow, JSON download feature.

---

## D2C — Detect to Correct

**What it covers:** How issues, anomalies, and failures are detected and corrected.

**InvoiceIQ alignment:**
- **Detection layer 1 (prompt):** Null-over-hallucination instruction prevents fabricated values.
- **Detection layer 2 (parser):** 3-attempt JSON recovery handles malformed AI responses.
- **Detection layer 3 (validation):** `validate_fields()` detects missing required fields.
- **Detection layer 4 (UI):** Warning badges surface field-level issues to the user.
- **Detection layer 5 (disclaimer):** Human review mandate corrects over-reliance risk.
- **Detection layer 6 (logging):** All events logged with token usage, warnings, and errors.
- **Detection layer 7 (error handling):** All failure modes caught and communicated clearly.

**Evidence:** validate_fields(), warning UI section, logger_config.py, error handling in extract_invoice().

---

## Summary Table

| IT4IT Stream | InvoiceIQ Components | Evidence Artifacts |
|---|---|---|
| S2P | Business case, option evaluation, scope definition, risk assessment | Architecture document, this summary |
| R2D | FR/NFR definition, architecture, code generation, deployment | All code files, requirements.txt, README |
| R2F | extract_invoice(), Streamlit UI, JSON download | invoice_processor.py, app.py |
| D2C | validate_fields(), warnings UI, logging, error handling, disclaimer | utils.py, logger_config.py, app.py warnings |