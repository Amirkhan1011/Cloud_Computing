"""
InvoiceIQ — Core AI Extraction Engine
Handles all interactions with the Gemini API.
Responsible for: prompt construction, API call, response parsing,
field validation, and warning generation.

This module is the agentic core of InvoiceIQ.
"""

import json
import os
import re
import time
from typing import Any

import google.generativeai as genai
from dotenv import load_dotenv

from logger_config import get_logger
from prompts import build_extraction_prompt

load_dotenv()

logger = get_logger("invoice_processor")

REQUIRED_FIELDS = [
    "vendor_name",
    "invoice_number",
    "invoice_date",
    "due_date",
    "total_amount",
    "currency",
]

SUSPICIOUS_PATTERNS = [
    r"N/A", r"not available", r"unknown", r"n/a", r"tbd", r"TBD"
]


def _initialize_gemini() -> genai.GenerativeModel:
    """
    Initializes and returns the Gemini generative model.
    Raises a clear error if the API key is not configured.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        logger.error("GEMINI_API_KEY not found in environment variables.")
        raise EnvironmentError(
            "GEMINI_API_KEY is not set. Please add it to your .env file. "
            "Get your key at: https://aistudio.google.com/app/apikey"
        )
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel(
        model_name="gemini-2.5-flash",
        generation_config=genai.GenerationConfig(
            temperature=0.1,
            top_p=0.8,
            max_output_tokens=1024,
        )
    )
    logger.info("Gemini model initialized: gemini-2.5-flash")
    return model


def _strip_json_fences(raw_text: str) -> str:
    """
    Removes markdown code fences that Gemini sometimes wraps around JSON.
    Handles ```json ... ``` and ``` ... ``` patterns.
    """
    # Remove ```json ... ``` blocks
    cleaned = re.sub(r"```json\s*", "", raw_text)
    cleaned = re.sub(r"```\s*", "", cleaned)
    return cleaned.strip()


def _parse_gemini_response(raw_response: str) -> dict[str, Any]:
    """
    Parses the raw Gemini text response into a Python dict.
    Handles common LLM formatting issues gracefully.
    
    Returns:
        Parsed dict if successful
        
    Raises:
        ValueError if parsing fails after cleanup attempts
    """
    if not raw_response or not raw_response.strip():
        raise ValueError("Gemini returned an empty response.")

    try:
        return json.loads(raw_response.strip())
    except json.JSONDecodeError:
        pass

    # Attempt 2: Strip markdown fences and retry
    try:
        cleaned = _strip_json_fences(raw_response)
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    # Attempt 3: Find the first { ... } block in the response
    try:
        match = re.search(r"\{.*\}", raw_response, re.DOTALL)
        if match:
            return json.loads(match.group())
    except json.JSONDecodeError:
        pass

    logger.error("Failed to parse Gemini response as JSON after 3 attempts.")
    logger.debug("Raw response was: %s", raw_response[:500])
    raise ValueError(
        "Could not parse AI response as structured data. "
        "The model may have returned an unexpected format."
    )


def validate_fields(extraction: dict[str, Any]) -> list[str]:
    """
    Validates extracted fields and returns a list of human-readable warnings.
    Checks for:
    - Missing required fields (null or empty)
    - Suspicious placeholder values
    
    Args:
        extraction: Parsed extraction dict from Gemini
        
    Returns:
        List of warning strings (empty list if no issues)
    """
    warnings = []

    for field in REQUIRED_FIELDS:
        value = extraction.get(field)
        if value is None or str(value).strip() == "":
            friendly_name = field.replace("_", " ").title()
            warnings.append(f"⚠️ **{friendly_name}** could not be extracted from the invoice.")

    # Check for suspicious placeholder values in all fields
    for field, value in extraction.items():
        if value and isinstance(value, str):
            for pattern in SUSPICIOUS_PATTERNS:
                if re.search(pattern, value, re.IGNORECASE):
                    friendly_name = field.replace("_", " ").title()
                    warnings.append(
                        f"⚠️ **{friendly_name}** contains a suspicious value: '{value}'. Please verify manually."
                    )

    return warnings


def extract_invoice(invoice_text: str) -> dict[str, Any]:
    """
    Main extraction function. Orchestrates the full pipeline:
    1. Input validation
    2. Gemini API call
    3. Response parsing
    4. Field validation
    5. Logging
    
    Args:
        invoice_text: Raw invoice text from the user
        
    Returns:
        Dict with keys:
            - 'extraction': dict of extracted fields
            - 'warnings': list of warning strings
            - 'token_usage': dict with prompt/completion/total token counts
            - 'response_time_ms': float
            - 'raw_response': str (for transparency)
    
    Raises:
        EnvironmentError: If API key is missing
        ValueError: If input is empty or response parsing fails
        RuntimeError: If Gemini API call fails
    """

    if not invoice_text or not invoice_text.strip():
        raise ValueError("Invoice text cannot be empty. Please paste or upload invoice content.")

    if len(invoice_text.strip()) < 20:
        raise ValueError(
            "Invoice text is too short to extract meaningful data. "
            "Please provide the full invoice content."
        )

    logger.info("Starting invoice extraction. Input length: %d chars", len(invoice_text))

    model = _initialize_gemini()

    prompt = build_extraction_prompt(invoice_text)
    logger.debug("Prompt constructed. Length: %d chars", len(prompt))

    start_time = time.time()
    try:
        response = model.generate_content(prompt)
    except Exception as api_error:
        logger.error("Gemini API call failed: %s", str(api_error))
        raise RuntimeError(
            f"AI service error: {str(api_error)}. "
            "Please check your API key and internet connection."
        ) from api_error

    response_time_ms = (time.time() - start_time) * 1000
    logger.info("Gemini API response received in %.0f ms", response_time_ms)

    try:
        raw_text = response.text
    except Exception:
        raise RuntimeError(
            "Gemini returned an empty or blocked response. "
            "This may be due to content filtering. Please check your invoice content."
        )

    extraction = _parse_gemini_response(raw_text)

    warnings = validate_fields(extraction)

    token_usage = {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0}
    try:
        usage = response.usage_metadata
        token_usage = {
            "prompt_tokens": usage.prompt_token_count,
            "completion_tokens": usage.candidates_token_count,
            "total_tokens": usage.total_token_count,
        }
    except Exception:
        logger.warning("Could not retrieve token usage metadata.")

    extracted_count = sum(1 for v in extraction.values() if v is not None and str(v).strip())
    logger.info(
        "Extraction complete | Fields extracted: %d/%d | Warnings: %d | Tokens: %s",
        extracted_count,
        len(extraction),
        len(warnings),
        token_usage
    )

    if warnings:
        for w in warnings:
            logger.warning("Field warning: %s", w)

    return {
        "extraction": extraction,
        "warnings": warnings,
        "token_usage": token_usage,
        "response_time_ms": response_time_ms,
        "raw_response": raw_text,
    }