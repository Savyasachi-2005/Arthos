"""
Bank statement analysis router.
Handles upload, OCR extraction, and AI-powered analysis of bank statements.
"""
import json
import logging
from typing import List

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import Response
from sqlmodel import Session, select

from app.database import get_session
from app.models import BankAnalysis
from app.schemas.bank import (
    AnalyzeStatementRequest,
    AnalyzeStatementResponse,
    BankAnalysisHistoryItem,
    BankAnalysisHistoryResponse,
    DownloadReportRequest,
    StatementUploadResponse,
)
from app.services.gemini_service import get_gemini_service
from app.services.ocr_service import ocr_service
from app.services.statement_cleaner import statement_cleaner
from app.services.report_generator import report_generator

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/bank", tags=["bank"])


@router.post("/upload-statement", response_model=StatementUploadResponse)
async def upload_statement(
    file: UploadFile = File(None),
    raw_text: str = None,
) -> StatementUploadResponse:
    """
    Upload bank statement for text extraction.
    
    Supports:
    - Image files (JPG, PNG) via OCR
    - PDF files via text extraction
    - Raw text input (fallback)
    
    Args:
        file: Uploaded file (image or PDF)
        raw_text: Raw text (if not uploading file)
        
    Returns:
        Extracted text and transaction lines
    """
    logger.info(f"Upload request received: file={file.filename if file else 'none'}, raw_text={bool(raw_text)}")
    
    extracted_text = ""
    
    # Process file if provided
    if file:
        if not file.filename:
            raise HTTPException(status_code=400, detail="Invalid file upload")
        
        try:
            # Read file content
            content = await file.read()
            
            if not content:
                raise HTTPException(status_code=400, detail="Empty file uploaded")
            
            logger.info(f"Processing file: {file.filename} ({len(content)} bytes)")
            
            # Extract text using OCR service
            extracted_text = await ocr_service.process_file(
                file_content=content,
                filename=file.filename,
                content_type=file.content_type or ""
            )
            
            if not extracted_text:
                raise HTTPException(
                    status_code=422,
                    detail="Failed to extract text from file. Please ensure it's a valid bank statement."
                )
                
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"File processing error: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to process file: {str(e)}"
            )
    
    # Use raw text if provided and no file
    elif raw_text:
        extracted_text = raw_text
        logger.info(f"Using provided raw text ({len(raw_text)} characters)")
    
    else:
        raise HTTPException(
            status_code=400,
            detail="Either file or raw_text must be provided"
        )
    
    # Clean and extract transaction lines
    try:
        cleaned_text, transaction_lines = statement_cleaner.preprocess_for_ai(extracted_text)
        
        logger.info(f"Extraction complete: {len(transaction_lines)} lines extracted")
        
        return StatementUploadResponse(
            raw_text=cleaned_text,
            lines=transaction_lines,
            line_count=len(transaction_lines)
        )
        
    except Exception as e:
        logger.error(f"Text cleaning error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process statement text: {str(e)}"
        )


@router.post("/analyze", response_model=AnalyzeStatementResponse)
async def analyze_statement(
    request: AnalyzeStatementRequest,
    session: Session = Depends(get_session),
) -> AnalyzeStatementResponse:
    """
    Analyze bank statement using Gemini AI.
    
    Performs:
    - Transaction extraction and categorization
    - Spending pattern analysis
    - Wasteful spending detection
    - Anomaly detection
    - Duplicate charge detection
    - Subscription identification
    - Personalized recommendations
    
    Args:
        request: Analysis request with raw statement text
        session: Database session
        
    Returns:
        Complete analysis with insights and recommendations
    """
    logger.info(f"Analysis request received (text length: {len(request.raw_text)})")
    
    if not request.raw_text or len(request.raw_text) < 50:
        raise HTTPException(
            status_code=400,
            detail="Statement text is too short. Please provide a valid bank statement."
        )
    
    try:
        # Get Gemini service
        gemini_service = get_gemini_service()
        
        # Perform AI analysis
        logger.info("Starting Gemini AI analysis...")
        analysis_result = await gemini_service.analyze_statement(request.raw_text)
        
        # Save to database
        try:
            bank_analysis = BankAnalysis(
                raw_text=request.raw_text,
                total_spend=analysis_result.summary.total_spend,
                total_income=analysis_result.summary.total_income,
                transaction_count=len(analysis_result.transactions),
                top_category=analysis_result.summary.top_category,
                top_merchant=analysis_result.summary.top_merchant,
                analysis_json=analysis_result.model_dump_json(),
            )
            
            session.add(bank_analysis)
            session.commit()
            session.refresh(bank_analysis)
            
            logger.info(f"Analysis saved to database with ID: {bank_analysis.id}")
            
        except Exception as db_error:
            logger.error(f"Failed to save analysis to database: {db_error}")
            # Continue even if DB save fails
        
        logger.info(f"Analysis complete: {len(analysis_result.transactions)} transactions found")
        return analysis_result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Analysis error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to analyze statement: {str(e)}"
        )


@router.get("/history", response_model=BankAnalysisHistoryResponse)
async def get_analysis_history(
    limit: int = 10,
    offset: int = 0,
    session: Session = Depends(get_session),
) -> BankAnalysisHistoryResponse:
    """
    Get previously analyzed bank statements.
    
    Args:
        limit: Maximum number of results
        offset: Number of results to skip
        session: Database session
        
    Returns:
        List of previous analyses with summary info
    """
    logger.info(f"History request: limit={limit}, offset={offset}")
    
    try:
        # Query analyses ordered by most recent
        statement = (
            select(BankAnalysis)
            .order_by(BankAnalysis.created_at.desc())
            .offset(offset)
            .limit(limit)
        )
        
        analyses = session.exec(statement).all()
        
        # Count total
        count_statement = select(BankAnalysis)
        total = len(session.exec(count_statement).all())
        
        # Convert to response items
        history_items = []
        for analysis in analyses:
            # Get preview of raw text (first 200 chars)
            preview = analysis.raw_text[:200] + "..." if len(analysis.raw_text) > 200 else analysis.raw_text
            
            item = BankAnalysisHistoryItem(
                id=analysis.id,
                timestamp=analysis.created_at,
                raw_text_preview=preview,
                total_spend=analysis.total_spend,
                transaction_count=analysis.transaction_count,
                top_category=analysis.top_category,
            )
            history_items.append(item)
        
        logger.info(f"Retrieved {len(history_items)} history items (total: {total})")
        
        return BankAnalysisHistoryResponse(
            analyses=history_items,
            total=total,
        )
        
    except Exception as e:
        logger.error(f"Failed to retrieve history: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve analysis history: {str(e)}"
        )


@router.post("/download-report")
async def download_report(
    request: DownloadReportRequest,
) -> Response:
    """
    Generate and download a professional PDF report of the analysis.
    
    Args:
        request: Pre-analyzed data and raw text
        
    Returns:
        PDF file as download
    """
    logger.info("Generating PDF report for download")
    
    try:
        # Convert analysis data to dict
        analysis_dict = request.analysis_data.model_dump()
        
        # Generate PDF
        pdf_bytes = report_generator.generate_pdf_report(
            analysis_data=analysis_dict,
            statement_preview=request.raw_text[:500]
        )
        
        # Create filename from analysis data
        summary = request.analysis_data.summary
        filename = f"bank_analysis_{summary.top_category}_{summary.total_spend:.0f}.pdf"
        
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to generate PDF report: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate PDF report: {str(e)}"
        )
