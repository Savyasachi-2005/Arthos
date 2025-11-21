"""
Report generation service for bank statement analysis.
Creates professional PDF reports with charts and insights.
"""
import io
import logging
from datetime import datetime
from typing import Optional

logger = logging.getLogger(__name__)


class ReportGenerator:
    """Service for generating analysis reports in various formats."""
    
    def __init__(self):
        """Initialize report generator."""
        self.reportlab_available = False
        self.matplotlib_available = False
        
        # Check ReportLab availability
        try:
            import reportlab
            self.reportlab_available = True
            logger.info("ReportLab is available for PDF generation")
        except ImportError:
            logger.warning("ReportLab not available. PDF generation will be limited.")
        
        # Check Matplotlib availability
        try:
            import matplotlib
            self.matplotlib_available = True
            logger.info("Matplotlib is available for chart generation")
        except ImportError:
            logger.warning("Matplotlib not available. Charts will not be included.")
    
    def generate_pdf_report(self, analysis_data: dict, statement_preview: str = "") -> bytes:
        """
        Generate a professional PDF report from analysis data.
        
        Args:
            analysis_data: Full analysis response data
            statement_preview: Preview of original statement text
            
        Returns:
            PDF bytes
        """
        if not self.reportlab_available:
            return self._generate_simple_pdf(analysis_data, statement_preview)
        
        try:
            from reportlab.lib import colors
            from reportlab.lib.pagesizes import letter, A4
            from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
            from reportlab.lib.units import inch
            from reportlab.platypus import (
                SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer,
                PageBreak, Image, KeepTogether
            )
            from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
            
            buffer = io.BytesIO()
            doc = SimpleDocTemplate(buffer, pagesize=letter,
                                    rightMargin=72, leftMargin=72,
                                    topMargin=72, bottomMargin=18)
            
            # Container for elements
            elements = []
            styles = getSampleStyleSheet()
            
            # Custom styles
            title_style = ParagraphStyle(
                'CustomTitle',
                parent=styles['Heading1'],
                fontSize=24,
                textColor=colors.HexColor('#1e40af'),
                spaceAfter=30,
                alignment=TA_CENTER
            )
            
            heading_style = ParagraphStyle(
                'CustomHeading',
                parent=styles['Heading2'],
                fontSize=16,
                textColor=colors.HexColor('#1e40af'),
                spaceAfter=12,
                spaceBefore=12
            )
            
            # Title
            elements.append(Paragraph("Bank Statement Analysis Report", title_style))
            elements.append(Paragraph(f"Generated on {datetime.now().strftime('%B %d, %Y at %I:%M %p')}", 
                                     styles['Normal']))
            elements.append(Spacer(1, 0.3*inch))
            
            # Summary section
            summary = analysis_data.get('summary', {})
            elements.append(Paragraph("Financial Summary", heading_style))
            
            summary_data = [
                ['Metric', 'Value'],
                ['Total Spending', f"₹{summary.get('total_spend', 0):,.2f}"],
                ['Total Income', f"₹{summary.get('total_income', 0):,.2f}"],
                ['Net Balance', f"₹{summary.get('total_income', 0) - summary.get('total_spend', 0):,.2f}"],
                ['Top Category', summary.get('top_category', 'N/A')],
                ['Top Merchant', summary.get('top_merchant', 'N/A')],
            ]
            
            summary_table = Table(summary_data, colWidths=[3*inch, 3*inch])
            summary_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e40af')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 12),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.lightgrey]),
            ]))
            elements.append(summary_table)
            elements.append(Spacer(1, 0.3*inch))
            
            # Category Breakdown
            category_breakdown = summary.get('category_breakdown', {})
            if category_breakdown:
                elements.append(Paragraph("Category Breakdown", heading_style))
                
                category_data = [['Category', 'Amount', 'Percentage']]
                total_spend = summary.get('total_spend', 1)
                for category, amount in sorted(category_breakdown.items(), key=lambda x: x[1], reverse=True):
                    percentage = (amount / total_spend * 100) if total_spend > 0 else 0
                    category_data.append([category, f"₹{amount:,.2f}", f"{percentage:.1f}%"])
                
                category_table = Table(category_data, colWidths=[2*inch, 2*inch, 2*inch])
                category_table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e40af')),
                    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                    ('FONTSIZE', (0, 0), (-1, 0), 11),
                    ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                    ('GRID', (0, 0), (-1, -1), 1, colors.black),
                    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.lightgrey]),
                ]))
                elements.append(category_table)
                elements.append(Spacer(1, 0.3*inch))
            
            # Wasteful Spending
            wasteful = summary.get('wasteful_spending', [])
            if wasteful:
                elements.append(Paragraph("⚠️ Wasteful Spending Detected", heading_style))
                for item in wasteful:
                    elements.append(Paragraph(f"• {item}", styles['Normal']))
                elements.append(Spacer(1, 0.2*inch))
            
            # Anomalies
            anomalies = analysis_data.get('anomalies', [])
            if anomalies:
                elements.append(Paragraph("🚨 Anomalies & Unusual Transactions", heading_style))
                for anomaly in anomalies:
                    elements.append(Paragraph(f"• {anomaly}", styles['Normal']))
                elements.append(Spacer(1, 0.2*inch))
            
            # Duplicate Charges
            duplicates = analysis_data.get('duplicate_charges', [])
            if duplicates:
                elements.append(Paragraph("🔄 Duplicate Charges", heading_style))
                for dup in duplicates:
                    elements.append(Paragraph(f"• {dup}", styles['Normal']))
                elements.append(Spacer(1, 0.2*inch))
            
            # Subscriptions
            subscriptions = analysis_data.get('subscriptions_detected', [])
            if subscriptions:
                elements.append(Paragraph("🔔 Subscriptions Detected", heading_style))
                subs_text = ", ".join(subscriptions)
                elements.append(Paragraph(subs_text, styles['Normal']))
                elements.append(Spacer(1, 0.2*inch))
            
            # Recommendations
            recommendations = analysis_data.get('recommendations', [])
            if recommendations:
                elements.append(PageBreak())
                elements.append(Paragraph("💡 AI Recommendations", heading_style))
                for i, rec in enumerate(recommendations, 1):
                    elements.append(Paragraph(f"{i}. {rec}", styles['Normal']))
                    elements.append(Spacer(1, 0.1*inch))
            
            # Transactions table
            transactions = analysis_data.get('transactions', [])
            if transactions:
                elements.append(PageBreak())
                elements.append(Paragraph("Transaction Details", heading_style))
                
                trans_data = [['Date', 'Merchant', 'Category', 'Amount', 'Type']]
                for txn in transactions[:50]:  # Limit to 50 for PDF size
                    trans_data.append([
                        txn.get('date', 'N/A')[:10],
                        txn.get('merchant', 'Unknown')[:25],
                        txn.get('category', 'Other'),
                        f"₹{txn.get('amount', 0):,.2f}",
                        txn.get('type', 'debit')
                    ])
                
                trans_table = Table(trans_data, colWidths=[1*inch, 2*inch, 1.2*inch, 1*inch, 0.8*inch])
                trans_table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e40af')),
                    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                    ('FONTSIZE', (0, 0), (-1, -1), 8),
                    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
                    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.lightgrey]),
                ]))
                elements.append(trans_table)
                
                if len(transactions) > 50:
                    elements.append(Spacer(1, 0.1*inch))
                    elements.append(Paragraph(f"Showing 50 of {len(transactions)} transactions", 
                                             styles['Italic']))
            
            # Build PDF
            doc.build(elements)
            
            pdf_bytes = buffer.getvalue()
            buffer.close()
            
            logger.info(f"Generated PDF report ({len(pdf_bytes)} bytes)")
            return pdf_bytes
            
        except Exception as e:
            logger.error(f"Failed to generate PDF: {e}")
            return self._generate_simple_pdf(analysis_data, statement_preview)
    
    def _generate_simple_pdf(self, analysis_data: dict, statement_preview: str = "") -> bytes:
        """
        Generate a simple text-based PDF when ReportLab is not available.
        
        Args:
            analysis_data: Full analysis response data
            statement_preview: Preview of original statement text
            
        Returns:
            Simple PDF bytes
        """
        from reportlab.pdfgen import canvas
        
        buffer = io.BytesIO()
        c = canvas.Canvas(buffer)
        
        y = 750
        c.setFont("Helvetica-Bold", 16)
        c.drawString(100, y, "Bank Statement Analysis Report")
        
        y -= 40
        c.setFont("Helvetica", 10)
        c.drawString(100, y, f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
        
        summary = analysis_data.get('summary', {})
        y -= 40
        c.drawString(100, y, f"Total Spend: ₹{summary.get('total_spend', 0):,.2f}")
        y -= 20
        c.drawString(100, y, f"Total Income: ₹{summary.get('total_income', 0):,.2f}")
        y -= 20
        c.drawString(100, y, f"Top Category: {summary.get('top_category', 'N/A')}")
        
        c.showPage()
        c.save()
        
        pdf_bytes = buffer.getvalue()
        buffer.close()
        
        return pdf_bytes


# Singleton instance
report_generator = ReportGenerator()
