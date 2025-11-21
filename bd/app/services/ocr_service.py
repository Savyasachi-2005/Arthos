"""
OCR service for extracting text from images and PDFs.
Supports multiple OCR engines: Tesseract and EasyOCR.
"""
import logging
import tempfile
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)


class OCRService:
    """Service for extracting text from images and PDFs."""
    
    def __init__(self):
        """Initialize OCR service with available engines."""
        self.tesseract_available = False
        self.easyocr_available = False
        self.pdfplumber_available = False
        
        # Check Tesseract availability
        try:
            import pytesseract
            pytesseract.get_tesseract_version()
            self.tesseract_available = True
            logger.info("Tesseract OCR is available")
        except Exception as e:
            logger.warning(f"Tesseract OCR not available: {e}")
        
        # Check EasyOCR availability
        try:
            import easyocr
            self.easyocr_available = True
            self.easyocr_reader = None  # Lazy load
            logger.info("EasyOCR is available")
        except Exception as e:
            logger.warning(f"EasyOCR not available: {e}")
        
        # Check pdfplumber availability
        try:
            import pdfplumber
            self.pdfplumber_available = True
            logger.info("pdfplumber is available")
        except Exception as e:
            logger.warning(f"pdfplumber not available: {e}")
    
    def extract_from_image(self, image_path: str) -> str:
        """
        Extract text from image using available OCR engine.
        
        Args:
            image_path: Path to the image file
            
        Returns:
            Extracted text as string
        """
        # Try Tesseract first (faster)
        if self.tesseract_available:
            try:
                return self._extract_with_tesseract(image_path)
            except Exception as e:
                logger.error(f"Tesseract extraction failed: {e}")
        
        # Fallback to EasyOCR
        if self.easyocr_available:
            try:
                return self._extract_with_easyocr(image_path)
            except Exception as e:
                logger.error(f"EasyOCR extraction failed: {e}")
        
        raise RuntimeError("No OCR engine available. Please install pytesseract or easyocr.")
    
    def extract_from_pdf(self, pdf_path: str) -> str:
        """
        Extract text from PDF using pdfplumber or PyPDF2.
        
        Args:
            pdf_path: Path to the PDF file
            
        Returns:
            Extracted text as string
        """
        # Try pdfplumber first (better quality)
        if self.pdfplumber_available:
            try:
                return self._extract_with_pdfplumber(pdf_path)
            except Exception as e:
                logger.error(f"pdfplumber extraction failed: {e}")
        
        # Fallback to PyPDF2
        try:
            return self._extract_with_pypdf2(pdf_path)
        except Exception as e:
            logger.error(f"PyPDF2 extraction failed: {e}")
            raise RuntimeError("PDF extraction failed with all available methods")
    
    def _extract_with_tesseract(self, image_path: str) -> str:
        """Extract text using Tesseract OCR."""
        from PIL import Image
        import pytesseract
        
        logger.info(f"Extracting text with Tesseract from: {image_path}")
        image = Image.open(image_path)
        
        # Use custom config for better accuracy on bank statements
        custom_config = r'--oem 3 --psm 6'
        text = pytesseract.image_to_string(image, config=custom_config)
        
        logger.info(f"Tesseract extracted {len(text)} characters")
        return text
    
    def _extract_with_easyocr(self, image_path: str) -> str:
        """Extract text using EasyOCR."""
        import easyocr
        
        logger.info(f"Extracting text with EasyOCR from: {image_path}")
        
        # Lazy load reader (expensive operation)
        if self.easyocr_reader is None:
            logger.info("Initializing EasyOCR reader...")
            self.easyocr_reader = easyocr.Reader(['en'], gpu=False)
        
        results = self.easyocr_reader.readtext(image_path)
        text = '\n'.join([result[1] for result in results])
        
        logger.info(f"EasyOCR extracted {len(text)} characters")
        return text
    
    def _extract_with_pdfplumber(self, pdf_path: str) -> str:
        """Extract text using pdfplumber."""
        import pdfplumber
        
        logger.info(f"Extracting text with pdfplumber from: {pdf_path}")
        text_parts = []
        
        with pdfplumber.open(pdf_path) as pdf:
            for page_num, page in enumerate(pdf.pages, 1):
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(page_text)
                    logger.debug(f"Extracted page {page_num}: {len(page_text)} characters")
        
        full_text = '\n'.join(text_parts)
        logger.info(f"pdfplumber extracted {len(full_text)} characters from {len(text_parts)} pages")
        return full_text
    
    def _extract_with_pypdf2(self, pdf_path: str) -> str:
        """Extract text using PyPDF2 (fallback)."""
        import PyPDF2
        
        logger.info(f"Extracting text with PyPDF2 from: {pdf_path}")
        text_parts = []
        
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            for page_num, page in enumerate(pdf_reader.pages, 1):
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(page_text)
                    logger.debug(f"Extracted page {page_num}: {len(page_text)} characters")
        
        full_text = '\n'.join(text_parts)
        logger.info(f"PyPDF2 extracted {len(full_text)} characters from {len(text_parts)} pages")
        return full_text
    
    async def process_file(self, file_content: bytes, filename: str, content_type: str) -> str:
        """
        Process uploaded file and extract text.
        
        Args:
            file_content: Raw file bytes
            filename: Original filename
            content_type: MIME type of the file
            
        Returns:
            Extracted text
        """
        logger.info(f"Processing file: {filename} (type: {content_type})")
        
        # Determine file type
        is_pdf = content_type == 'application/pdf' or filename.lower().endswith('.pdf')
        is_image = content_type.startswith('image/') or any(
            filename.lower().endswith(ext) for ext in ['.jpg', '.jpeg', '.png', '.bmp', '.tiff']
        )
        
        # Save to temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=Path(filename).suffix) as tmp_file:
            tmp_file.write(file_content)
            tmp_path = tmp_file.name
        
        try:
            if is_pdf:
                logger.info("Processing as PDF")
                return self.extract_from_pdf(tmp_path)
            elif is_image:
                logger.info("Processing as Image")
                return self.extract_from_image(tmp_path)
            else:
                raise ValueError(f"Unsupported file type: {content_type}")
        finally:
            # Clean up temp file
            try:
                Path(tmp_path).unlink()
            except Exception as e:
                logger.warning(f"Failed to delete temp file {tmp_path}: {e}")


# Singleton instance
ocr_service = OCRService()
