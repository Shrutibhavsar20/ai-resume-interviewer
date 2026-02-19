"""
PDF Report Generator for Interview Summary
"""
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak, Image
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from io import BytesIO
from datetime import datetime

def generate_interview_pdf(user_name, level, questions_answers, avg_score, total_questions, total_answered):
    """
    Generate a professional PDF report of the interview
    
    Args:
        user_name: Name of the candidate
        level: Interview level (Junior/Mid/Senior)
        questions_answers: List of dicts with 'q' and 'a' keys
        avg_score: Average score out of 10
        total_questions: Total questions asked
        total_answered: Total questions answered
    
    Returns:
        BytesIO object containing PDF binary data
    """
    
    # Create PDF in memory
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=0.75*inch,
        leftMargin=0.75*inch,
        topMargin=0.75*inch,
        bottomMargin=0.75*inch,
    )
    
    # Styles
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=28,
        textColor=colors.HexColor('#F5A623'),
        spaceAfter=6,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold',
    )
    
    subtitle_style = ParagraphStyle(
        'CustomSubtitle',
        parent=styles['Heading2'],
        fontSize=11,
        textColor=colors.HexColor('#A89880'),
        spaceAfter=12,
        alignment=TA_CENTER,
        fontName='Helvetica',
    )
    
    section_style = ParagraphStyle(
        'SectionTitle',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor('#F5A623'),
        spaceAfter=12,
        spaceBefore=12,
        fontName='Helvetica-Bold',
    )
    
    normal_style = ParagraphStyle(
        'CustomBody',
        parent=styles['BodyText'],
        fontSize=10,
        textColor=colors.HexColor('#F0E6D3'),
        leading=14,
    )
    
    question_style = ParagraphStyle(
        'Question',
        parent=styles['BodyText'],
        fontSize=9,
        textColor=colors.HexColor('#FFB944'),
        leading=12,
        fontName='Helvetica-Bold',
    )
    
    answer_style = ParagraphStyle(
        'Answer',
        parent=styles['BodyText'],
        fontSize=9,
        textColor=colors.HexColor('#3ECF8E'),
        leading=12,
    )
    
    # Story (content to add to PDF)
    story = []
    
    # Header
    story.append(Spacer(1, 0.3*inch))
    story.append(Paragraph("InterviewIQ", title_style))
    story.append(Paragraph("AI-Powered Interview Practice Platform", subtitle_style))
    story.append(Spacer(1, 0.2*inch))
    
    # Candidate Info Box
    candidate_data = [
        ["Candidate Name", user_name],
        ["Interview Level", level.upper()],
        ["Date", datetime.now().strftime("%B %d, %Y")],
        ["Time", datetime.now().strftime("%I:%M %p")],
    ]
    
    candidate_table = Table(candidate_data, colWidths=[2.2*inch, 3.8*inch])
    candidate_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#1D1A14')),
        ('BACKGROUND', (1, 0), (1, -1), colors.HexColor('#161410')),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#F0E6D3')),
        ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#F5A623')),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('ROWBACKGROUNDS', (0, 0), (-1, -1), [colors.HexColor('#1D1A14'), colors.HexColor('#161410')]),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#F5A623')),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
    ]))
    
    story.append(candidate_table)
    story.append(Spacer(1, 0.3*inch))
    
    # Summary Scores
    story.append(Paragraph("Performance Summary", section_style))
    
    # Score cards data
    score_color = colors.HexColor('#3ECF8E') if avg_score >= 8 else colors.HexColor('#F5A623') if avg_score >= 6 else colors.HexColor('#E05252')
    
    summary_data = [
        [
            f"Average Score\n\n{avg_score}/10",
            f"Questions Asked\n\n{total_questions}",
            f"Questions Answered\n\n{total_answered}",
        ]
    ]
    
    summary_table = Table(summary_data, colWidths=[2*inch, 2*inch, 2*inch])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#1D1A14')),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#FFB944')),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 12),
        ('GRID', (0, 0), (-1, -1), 2, score_color),
        ('TOPPADDING', (0, 0), (-1, -1), 15),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 15),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
    ]))
    
    story.append(summary_table)
    story.append(Spacer(1, 0.3*inch))
    
    # Q&A Details
    story.append(Paragraph("Questions & Answers", section_style))
    
    for i, pair in enumerate(questions_answers, 1):
        # Question
        story.append(Paragraph(f"<b>Q{i}:</b> {pair.get('q', 'N/A')}", question_style))
        story.append(Spacer(1, 0.1*inch))
        
        # Answer
        answer_text = pair.get('a', 'N/A')
        if len(answer_text) > 500:
            answer_text = answer_text[:500] + "..."
        story.append(Paragraph(f"<b>Your Answer:</b><br/>{answer_text}", answer_style))
        story.append(Spacer(1, 0.15*inch))
    
    story.append(Spacer(1, 0.2*inch))
    
    # Footer with tips
    story.append(Paragraph("Tips for Next Interview", section_style))
    
    if avg_score >= 8:
        tip = "<b>Excellent work!</b> You demonstrated strong technical knowledge and communication skills. Continue practicing to maintain this level."
        tip_color = colors.HexColor('#3ECF8E')
    elif avg_score >= 6:
        tip = "<b>Good effort!</b> You have a solid foundation. Focus on providing more specific examples and elaborating on your technical decisions."
        tip_color = colors.HexColor('#F5A623')
    else:
        tip = "<b>Keep practicing!</b> Work on structuring your answers better using the STAR format. Think before responding and include concrete examples."
        tip_color = colors.HexColor('#E05252')
    
    story.append(Paragraph(tip, normal_style))
    story.append(Spacer(1, 0.2*inch))
    
    # Footer
    story.append(Spacer(1, 0.1*inch))
    footer_style = ParagraphStyle(
        'Footer',
        parent=styles['Normal'],
        fontSize=8,
        textColor=colors.HexColor('#7A6E5F'),
        alignment=TA_CENTER,
    )
    story.append(Paragraph(
        f"Generated by InterviewIQ | AI-Powered Interview Coach | {datetime.now().strftime('%B %d, %Y at %I:%M %p')}",
        footer_style
    ))
    
    # Build PDF
    doc.build(story)
    
    # Get PDF data
    buffer.seek(0)
    # Return BytesIO object so callers can read or save the stream
    return buffer
