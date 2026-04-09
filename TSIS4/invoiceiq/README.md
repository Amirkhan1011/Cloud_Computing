# 🧾 InvoiceIQ — AI Invoice Intelligence Assistant

> AI-powered invoice data extraction for SMEs, built with Google Gemini and Streamlit.

---

## What is InvoiceIQ?

InvoiceIQ is a small-scale AI tool that helps small businesses and accounting firms extract 
structured data from invoice text using Google Gemini AI. Instead of manually reading invoices 
to find vendor names, dates, amounts, and payment terms, users paste or upload invoice text 
and receive an organized extraction in seconds.

**⚠️ Important:** All AI-extracted data must be reviewed by a qualified human before use 
in accounting records or financial workflows.

---

## Features

- 📋 Paste invoice text or upload a `.txt` file
- 🤖 Gemini AI extracts 9 structured fields
- ⚠️ Automatic warnings for missing or suspicious fields
- 💡 Plain-English business summary of the invoice
- 📥 Download extracted data as JSON
- 📊 Session token usage tracking (FinOps)
- 🔍 Raw AI response viewer for transparency
- 📝 Local logging for audit trail

---

## Extracted Fields

| Field | Description |
|---|---|
| Vendor Name | Company or individual issuing the invoice |
| Invoice Number | Unique invoice identifier |
| Invoice Date | Date invoice was issued |
| Due Date | Payment due date |
| Total Amount | Final amount due (including tax) |
| Tax / VAT Amount | Tax or VAT if separately stated |
| Currency | Invoice currency |
| Payment Terms | e.g., Net 30, Due on Receipt |
| Line Items Summary | Brief summary of what was purchased |

---

## Quick Start

### Prerequisites
- Python 3.10 or higher
- A Google Gemini API key ([get one free here](https://aistudio.google.com/app/apikey))

### Installation

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd invoiceiq

# 2. Create a virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure your API key
cp .env.example .env
# Edit .env and add your Gemini API key

# 5. Run the application
streamlit run app.py
```

### .env Configuration