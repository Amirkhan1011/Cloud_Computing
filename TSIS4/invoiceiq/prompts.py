"""
InvoiceIQ — Prompt Templates
All Gemini prompt templates are centralized here.
Prompts are versioned to support iterative improvement.
"""

EXTRACTION_PROMPT_V1 = """
You are an expert accounts payable assistant. Your task is to extract structured data from the invoice text provided below.

INSTRUCTIONS:
- Extract ONLY the fields listed in the schema below.
- If a field is not present in the invoice text, return null for that field. Do NOT guess or invent values.
- Return ONLY a valid JSON object. Do not include any explanation, markdown formatting, or code fences.
- For amounts, return numeric values as strings (e.g., "1500.00"). Include currency symbol if present.
- For dates, use the format found in the document. Do not normalize.

REQUIRED OUTPUT SCHEMA:
{{
  "vendor_name": string or null,
  "invoice_number": string or null,
  "invoice_date": string or null,
  "due_date": string or null,
  "total_amount": string or null,
  "tax_vat_amount": string or null,
  "currency": string or null,
  "line_items_summary": string or null,
  "payment_terms": string or null,
  "summary": string
}}

FIELD DESCRIPTIONS:
- vendor_name: The company or individual issuing the invoice
- invoice_number: The unique invoice identifier
- invoice_date: The date the invoice was issued
- due_date: The date payment is due
- total_amount: The final total amount due (including tax)
- tax_vat_amount: The tax or VAT amount if separately stated
- currency: The currency of the invoice (e.g., USD, EUR, GBP)
- line_items_summary: A brief plain-English summary of what was purchased/billed
- payment_terms: Payment terms if stated (e.g., Net 30, Due on receipt)
- summary: A 2-3 sentence plain-English business summary of this invoice suitable for an accountant

IMPORTANT: The summary field must always be populated. All other fields should be null if not found.

INVOICE TEXT:
{invoice_text}
"""


def build_extraction_prompt(invoice_text: str) -> str:
    """
    Builds the extraction prompt by injecting the invoice text.
    
    Args:
        invoice_text: Raw invoice text from user input
        
    Returns:
        Formatted prompt string ready to send to Gemini
    """
    return EXTRACTION_PROMPT_V1.format(invoice_text=invoice_text.strip())