"""
InvoiceIQ — Streamlit Application
AI-powered invoice intelligence assistant for SMEs.

Run with: streamlit run app.py
"""

import json
import streamlit as st

from invoice_processor import extract_invoice
from logger_config import get_logger
from utils import (
    count_extracted_fields,
    extraction_to_json,
    format_for_display,
    get_summary,
)

logger = get_logger("app")

# ── Page Configuration 
st.set_page_config(
    page_title="InvoiceIQ — AI Invoice Analyzer",
    page_icon="🧾",
    layout="wide",
    initial_sidebar_state="expanded",
)

if "total_tokens_used" not in st.session_state:
    st.session_state.total_tokens_used = 0
if "extraction_count" not in st.session_state:
    st.session_state.extraction_count = 0
if "last_result" not in st.session_state:
    st.session_state.last_result = None
if "invoice_text" not in st.session_state:
    st.session_state.invoice_text = ""

# ── Sidebar
with st.sidebar:
    st.image("https://img.icons8.com/fluency/96/invoice.png", width=64)
    st.title("InvoiceIQ")
    st.caption("AI Invoice Intelligence for SMEs")
    st.divider()

    st.subheader("📊 Session Stats")
    st.metric("Invoices Analyzed", st.session_state.extraction_count)
    st.metric("Total Tokens Used", st.session_state.total_tokens_used)

    st.divider()
    st.subheader("ℹ️ About")
    st.markdown(
        """
        **InvoiceIQ** uses Google Gemini AI to extract 
        structured data from invoice text.
        
        **Model:** `gemini-2.5-flash`  
        **Version:** 1.0.0  
        
        Built for SME accounts payable workflows.
        """
    )

    st.divider()
    st.subheader("🔑 API Status")
    import os
    from dotenv import load_dotenv
    load_dotenv()
    if os.getenv("GEMINI_API_KEY"):
        st.success("API key configured ✓")
    else:
        st.error("API key not found")
        st.caption("Add GEMINI_API_KEY to your .env file")


# ── Main Header
st.title("🧾 InvoiceIQ")
st.subheader("AI-Powered Invoice Intelligence Assistant")
st.caption("Paste or upload invoice text to extract structured data using Google Gemini AI.")

st.divider()

# ── Input Section
col1, col2 = st.columns([3, 1])

with col1:
    st.subheader("📋 Invoice Input")

with col2:
    load_sample = st.button("📄 Load Sample Invoice", use_container_width=True)

# Load sample invoice if button clicked
if load_sample:
    try:
        with open("sample_invoice.txt", "r", encoding="utf-8") as f:
            st.session_state.invoice_text = f.read()
        st.info("✅ Sample invoice loaded. Click **Analyze Invoice** to process it.")
        logger.info("Sample invoice loaded by user.")
    except FileNotFoundError:
        st.warning("sample_invoice.txt not found. Please paste your invoice text manually.")

# File upload
uploaded_file = st.file_uploader(
    "Upload a .txt invoice file (optional)",
    type=["txt"],
    help="Upload a plain text invoice file. PDF support coming in v2."
)

if uploaded_file is not None:
    try:
        st.session_state.invoice_text = uploaded_file.read().decode("utf-8")
        st.success(
            f"✅ File uploaded: **{uploaded_file.name}** "
            f"({len(st.session_state.invoice_text)} characters)"
        )
        logger.info(
            "File uploaded: %s (%d chars)",
            uploaded_file.name,
            len(st.session_state.invoice_text)
        )
    except Exception as e:
        st.error(f"Could not read file: {str(e)}")

with st.form("invoice_form"):
    invoice_text = st.text_area(
        "Paste invoice text here:",
        key="invoice_text",
        height=250,
        placeholder=(
            "Paste your invoice text here...\n\n"
            "Example: INVOICE\nFrom: Acme Corp\nInvoice #: INV-001\nDate: Jan 1, 2024\n..."
        ),
        help="Paste the full text content of your invoice. The more complete the text, the better the extraction."
    )

    if invoice_text:
        st.caption(f"📝 {len(invoice_text)} characters | ~{len(invoice_text.split())} words")

    analyze_clicked = st.form_submit_button(
        "🔍 Analyze Invoice",
        type="primary",
        use_container_width=True
    )

st.divider()

# ── Processing & Results
if analyze_clicked:
    if not invoice_text or not invoice_text.strip():
        st.warning("⚠️ Please paste or upload invoice text before analyzing.")
    else:
        with st.spinner("🤖 Gemini AI is analyzing your invoice..."):
            try:
                result = extract_invoice(invoice_text)
                st.session_state.last_result = result
                st.session_state.extraction_count += 1
                st.session_state.total_tokens_used += result["token_usage"].get("total_tokens", 0)
                logger.info(
                    "UI extraction complete. Session total tokens: %d",
                    st.session_state.total_tokens_used
                )

            except EnvironmentError as e:
                st.error(f"⚙️ **Configuration Error:** {str(e)}")
                st.stop()

            except ValueError as e:
                st.error(f"📋 **Input Error:** {str(e)}")
                st.stop()

            except RuntimeError as e:
                st.error(f"🤖 **AI Service Error:** {str(e)}")
                st.stop()

            except Exception as e:
                logger.error("Unexpected error during extraction: %s", str(e))
                st.error(
                    "❌ An unexpected error occurred. Please check the logs and try again. "
                    f"Details: {str(e)}"
                )
                st.stop()

# ── Render Results
if st.session_state.last_result:
    result = st.session_state.last_result
    extraction = result["extraction"]
    warnings = result["warnings"]

    st.success("✅ Invoice analyzed successfully!")

    # ── HUMAN REVIEW DISCLAIMER
    st.warning(
        "⚠️ **Human Review Required:** "
        "AI-extracted data must be verified by a qualified person before use in "
        "accounting records, payments, or financial workflows. "
        "InvoiceIQ is an AI assistant, not an authoritative data source."
    )

    st.divider()

    # ── Results Layout
    res_col1, res_col2 = st.columns([3, 2])

    with res_col1:
        st.subheader("📊 Extracted Invoice Data")

        # Extraction completeness
        extracted_count, total_count = count_extracted_fields(extraction)
        completeness_pct = int((extracted_count / total_count) * 100)
        st.progress(completeness_pct / 100, text=f"Extraction completeness: {completeness_pct}% ({extracted_count}/{total_count} fields)")

        # Display table
        display_rows = format_for_display(extraction)
        st.dataframe(
            display_rows,
            use_container_width=True,
            hide_index=True,
            column_config={
                "Field": st.column_config.TextColumn("Field", width="medium"),
                "Extracted Value": st.column_config.TextColumn("Extracted Value", width="large"),
            }
        )

    with res_col2:
        st.subheader("💡 AI Summary")
        summary = get_summary(extraction)
        st.info(summary)

        st.subheader("⚡ Performance")
        perf_col1, perf_col2 = st.columns(2)
        with perf_col1:
            st.metric("Response Time", f"{result['response_time_ms']:.0f} ms")
        with perf_col2:
            st.metric("Tokens Used", result['token_usage'].get('total_tokens', '—'))

        token_detail = result['token_usage']
        st.caption(
            f"Prompt: {token_detail.get('prompt_tokens', '—')} tokens | "
            f"Completion: {token_detail.get('completion_tokens', '—')} tokens"
        )

    st.divider()

    # ── Warnings Section
    if warnings:
        st.subheader("⚠️ Field Warnings")
        st.caption("The following fields could not be extracted or contain suspicious values. Please review manually.")
        for warning in warnings:
            st.markdown(warning)
    else:
        st.success("✅ All required fields were successfully extracted with no warnings.")

    st.divider()

    # ── Download & Raw Output
    dl_col, raw_col = st.columns(2)

    with dl_col:
        st.subheader("⬇️ Export")
        json_output = extraction_to_json(extraction)
        st.download_button(
            label="📥 Download as JSON",
            data=json_output,
            file_name="invoiceiq_extraction.json",
            mime="application/json",
            use_container_width=True,
        )

    with raw_col:
        st.subheader("🔍 Transparency")
        with st.expander("View raw AI response"):
            st.code(result["raw_response"], language="json")
            st.caption("This is the unprocessed response from the Gemini AI model.")

# ── Footer
st.divider()
st.caption(
    "InvoiceIQ v1.0 | Powered by Google Gemini AI | "
    "Built for SME accounts payable workflows | "
    "⚠️ Always verify AI-extracted data before use in financial systems."
)