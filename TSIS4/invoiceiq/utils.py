"""
InvoiceIQ — Utility Functions
Formatting, display helpers, and data transformation utilities.
Keeps the Streamlit UI layer clean and free of business logic.
"""

import json
from typing import Any


# ── Human-readable field labels
FIELD_LABELS = {
    "vendor_name": "Vendor Name",
    "invoice_number": "Invoice Number",
    "invoice_date": "Invoice Date",
    "due_date": "Due Date",
    "total_amount": "Total Amount",
    "tax_vat_amount": "Tax / VAT Amount",
    "currency": "Currency",
    "line_items_summary": "Line Items Summary",
    "payment_terms": "Payment Terms",
    "summary": "AI Summary",
}

# ── Fields to show in the main extraction table
TABLE_FIELDS = [
    "vendor_name",
    "invoice_number",
    "invoice_date",
    "due_date",
    "total_amount",
    "tax_vat_amount",
    "currency",
    "payment_terms",
]


def format_for_display(extraction: dict[str, Any]) -> list[dict[str, str]]:
    """
    Converts the raw extraction dict into a list of display rows
    suitable for rendering in a Streamlit table.
    
    Returns:
        List of dicts: [{"Field": "Vendor Name", "Extracted Value": "Acme Corp"}, ...]
    """
    rows = []
    for key in TABLE_FIELDS:
        value = extraction.get(key)
        rows.append({
            "Field": FIELD_LABELS.get(key, key.replace("_", " ").title()),
            "Extracted Value": str(value) if value is not None else "— Not found —",
        })
    return rows


def get_summary(extraction: dict[str, Any]) -> str:
    """
    Extracts the AI-generated summary from the extraction dict.
    Returns a fallback message if summary is missing.
    """
    return extraction.get("summary") or (
        "No summary was generated. Please review the extracted fields manually."
    )


def extraction_to_json(extraction: dict[str, Any]) -> str:
    """
    Serializes the extraction dict to a formatted JSON string
    suitable for download.
    """
    return json.dumps(extraction, indent=2, ensure_ascii=False)


def count_extracted_fields(extraction: dict[str, Any]) -> tuple[int, int]:
    """
    Returns (extracted_count, total_count) for progress display.
    """
    total = len(TABLE_FIELDS)
    extracted = sum(
        1 for key in TABLE_FIELDS
        if extraction.get(key) is not None and str(extraction.get(key)).strip()
    )
    return extracted, total