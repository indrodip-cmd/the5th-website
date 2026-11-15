# -*- coding: utf-8 -*-
"""Builds the detailed, branded sample audit report PDF for The5th's
$10K Roadmap Audit landing page (served at /documents/sample-audit-report.pdf).
Run with: python3 scripts/build-sample-audit-report.py
Requires: pip install reportlab

2026-11-15 rebuild, per direct user feedback on the live sample PDF:
  - Too short (6 sparse pages) for a "full sample audit" claim -> now a
    genuinely detailed 12+ page document (exec summary + 8 content sections
    + methodology/credibility + FAQ + closing, each with real narrative, not
    one-line bullets).
  - Didn't actually look like The5th's brand -> now uses the real logo file
    and the live site's actual accent (lime #C9FF48 on near-black), not an
    unrelated muted-green palette. Lime is used only on dark surfaces or as
    a pale tint behind dark text (never as text on white: lime-on-white
    fails basic contrast, which would undercut the next point).
  - Body/table text was too small (9.7pt / 8.6pt) for an audience that
    skews older, reading on a phone -> every size below is raised
    (body 12.5pt, tables 11pt, captions 10pt), because a premium-looking
    report nobody can comfortably read does not build trust, it loses the
    sale right there.
"""
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak,
    HRFlowable, Image, ListFlowable, ListItem
)
from reportlab.pdfgen import canvas as canvas_module

OUT = "/home/user/the5th-website/public/documents/sample-audit-report.pdf"
LOGO = "/home/user/the5th-website/public/images/the5th-logo-colorful.png"

# ── Brand palette ──────────────────────────────────────────────────────────
# DARK/LIME match the live site's actual tokens (app/10k-roadmap/config.ts:
# T.bg / T.accent) exactly, used on dark surfaces (cover, banners, dividers)
# so the document is recognizably the same brand as the page it's linked
# from. On white body pages, lime text would be unreadable (fails contrast),
# so headings there use ACCENT_DEEP, a darker shade in the same yellow-green
# family, and lime itself only appears as a pale background tint or a rule.
DARK = colors.HexColor("#0B0F08")        # near-black, matches site T.bg
LIME = colors.HexColor("#C9FF48")        # exact site accent, dark surfaces only
LIME_TINT = colors.HexColor("#F3FAE0")   # pale lime wash for callout fills on white
ACCENT_DEEP = colors.HexColor("#4B6B10")  # readable-on-white accent, same hue family
INK = colors.HexColor("#17201A")         # near-black body text (not pure black)
MUTED = colors.HexColor("#5B6560")       # muted grey-green for captions
LINE = colors.HexColor("#DDE6D2")        # soft divider rules
WHITE = colors.white

styles = getSampleStyleSheet()

def style(name, **kw):
    parent = kw.pop("parent", styles["Normal"])
    return ParagraphStyle(name, parent=parent, **kw)

# Sizes raised across the board for readability on a phone screen, for an
# audience that skews older, see module docstring.
s_banner = style("banner", fontName="Helvetica-Bold", fontSize=10.5, textColor=WHITE,
                  alignment=TA_CENTER, letterSpacing=1.2, leading=13)
s_eyebrow = style("eyebrow", fontName="Helvetica-Bold", fontSize=11, textColor=LIME,
                   leading=14, letterSpacing=1)
s_h1 = style("h1", fontName="Helvetica-Bold", fontSize=27, textColor=WHITE, leading=31,
             spaceAfter=6)
s_sub = style("sub", fontName="Helvetica", fontSize=12.5, textColor=colors.HexColor("#C8D4C0"),
              leading=18)
s_h2 = style("h2", fontName="Helvetica-Bold", fontSize=16.5, textColor=DARK, leading=20,
             spaceBefore=18, spaceAfter=8)
s_h2num = style("h2num", parent=s_h2, textColor=ACCENT_DEEP)
s_h3 = style("h3", fontName="Helvetica-Bold", fontSize=13, textColor=ACCENT_DEEP, leading=16,
             spaceBefore=10, spaceAfter=5)
s_body = style("body", fontName="Helvetica", fontSize=12.5, textColor=INK, leading=18.5,
               spaceAfter=9, alignment=TA_LEFT)
s_bodyB = style("bodyB", parent=s_body, fontName="Helvetica-Bold")
s_bullet = style("bullet", parent=s_body, leftIndent=4, spaceAfter=7)
s_caption = style("caption", fontName="Helvetica-Oblique", fontSize=10, textColor=MUTED,
                   leading=14)
s_tcell = style("tcell", fontName="Helvetica", fontSize=11, textColor=INK, leading=15)
s_tcellB = style("tcellB", parent=s_tcell, fontName="Helvetica-Bold", textColor=WHITE)
s_footer = style("footer", fontName="Helvetica", fontSize=8.5, textColor=MUTED, leading=11)
s_coverInfoLabel = style("coverInfoLabel", parent=s_tcellB, fontSize=11)
s_coverInfoVal = style("coverInfoVal", parent=s_tcell, fontSize=11)
# Dark-surface variants, the cover page sits on DARK, so headings/bullets
# there need light text; the white-page s_h3/s_bullet (ACCENT_DEEP/INK) would
# be invisible against a near-black background.
s_h3_dark = style("h3dark", parent=s_h3, textColor=LIME)
s_bullet_dark = style("bulletdark", parent=s_bullet, textColor=colors.HexColor("#E7EEDC"))

PAGE_W, PAGE_H = LETTER
MX = 0.62 * inch

def banner_flow(text):
    t = Table([[Paragraph(text, s_banner)]], colWidths=[PAGE_W - 2 * MX])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), DARK),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    return t

def rule():
    return HRFlowable(width="100%", thickness=0.7, color=LINE, spaceBefore=3, spaceAfter=12)

def section(number, title):
    return [Paragraph(f'<font color="#4B6B10">{number}</font> &nbsp; {title}', s_h2), rule()]

def bullets(items, dark=False):
    item_style = s_bullet_dark if dark else s_bullet
    bullet_color = LIME if dark else ACCENT_DEEP
    return ListFlowable(
        [ListItem(Paragraph(i, item_style), leftIndent=14, value="•", bulletFontSize=12, bulletColor=bullet_color)
         for i in items],
        bulletType="bullet", start="•", leftIndent=6, spaceBefore=3, spaceAfter=10,
    )

def table(data, col_widths, header=True):
    t = Table(data, colWidths=col_widths, repeatRows=1 if header else 0)
    cmds = [
        ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
        ("FONTSIZE", (0, 0), (-1, -1), 11),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("GRID", (0, 0), (-1, -1), 0.6, LINE),
        ("LEFTPADDING", (0, 0), (-1, -1), 9),
        ("RIGHTPADDING", (0, 0), (-1, -1), 9),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("ROWBACKGROUNDS", (0, 1 if header else 0), (-1, -1), [WHITE, LIME_TINT]),
    ]
    if header:
        cmds += [
            ("BACKGROUND", (0, 0), (-1, 0), DARK),
            ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ]
    t.setStyle(TableStyle(cmds))
    return t

def callout(title, body_text):
    """Pale-lime highlight box with dark text, the lime brand tie-in on a
    white page, kept to a background fill so contrast never depends on
    colored text."""
    tbl = Table([[Paragraph(title, s_h3)], [Paragraph(body_text, s_body)]],
                colWidths=[PAGE_W - 2 * MX])
    tbl.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), LIME_TINT),
        ("BOX", (0, 0), (-1, -1), 0.8, colors.HexColor("#B9D98A")),
        ("LEFTPADDING", (0, 0), (-1, -1), 14), ("RIGHTPADDING", (0, 0), (-1, -1), 14),
        ("TOPPADDING", (0, 0), (-1, -1), 10), ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
    ]))
    return tbl

def header_footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(DARK)
    canvas.setLineWidth(2.4)
    canvas.line(MX, PAGE_H - 0.55 * inch, PAGE_W - MX, PAGE_H - 0.55 * inch)
    canvas.setFont("Helvetica-Bold", 9.5)
    canvas.setFillColor(DARK)
    canvas.drawString(MX, PAGE_H - 0.43 * inch, "THE5TH GLOBAL CONSULTING")
    canvas.setFont("Helvetica", 9.5)
    canvas.setFillColor(MUTED)
    canvas.drawRightString(PAGE_W - MX, PAGE_H - 0.43 * inch, "Private 60-Minute Business Audit: Illustrative Sample")
    canvas.setFont("Helvetica", 8.5)
    canvas.setFillColor(MUTED)
    canvas.drawString(MX, 0.42 * inch, "ILLUSTRATIVE SAMPLE: fictional business, used to show format and depth only. Not an actual client's audit.")
    canvas.drawRightString(PAGE_W - MX, 0.42 * inch, "Page %d" % canvas.getPageNumber())
    canvas.restoreState()

def cover_page():
    """Dark cover page (the one place lime text is used directly) so the
    document opens with an unmistakable, full-strength brand moment before
    settling into white, high-contrast body pages for the actual reading.

    Built as ONE single-cell table whose cell holds every flowable in a
    list, a table cell can hold a list of stacked flowables fine; what
    does NOT work is one row per flowable (an earlier version of this did
    that and silently dropped/cut content, since large flowables like a
    ListFlowable don't paginate correctly split across their own table
    rows). Single cell, list of children, no surprises. */"""
    cover_pad = 18
    inner_w = PAGE_W - 2 * MX - 2 * cover_pad
    inner = []
    inner.append(Spacer(1, 0.3 * inch))
    inner.append(Image(LOGO, width=1.9 * inch, height=1.9 * inch * (750 / 1920), hAlign="LEFT"))
    inner.append(Spacer(1, 0.4 * inch))
    cover_banner = Table([[Paragraph("ILLUSTRATIVE SAMPLE &nbsp;·&nbsp; NOT AN ACTUAL CLIENT'S AUDIT", s_banner)]], colWidths=[inner_w])
    cover_banner.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#1B2414")),
        ("TOPPADDING", (0, 0), (-1, -1), 8), ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    inner.append(cover_banner)
    inner.append(Spacer(1, 0.45 * inch))
    inner.append(Paragraph("THE5TH GLOBAL CONSULTING", s_eyebrow))
    inner.append(Paragraph("Private 60-Minute<br/>Business Audit", s_h1))
    inner.append(Paragraph(
        "A complete, personalized breakdown of your business position, offer, ideal buyer, "
        "biggest bottleneck, and a 100-day action plan, delivered inside 48 hours of your call.",
        s_sub))
    inner.append(Spacer(1, 0.3 * inch))

    info = table([
        [Paragraph("Prepared for", s_coverInfoLabel), Paragraph("Jordan Avery · Jordan Avery Coaching", s_coverInfoVal)],
        [Paragraph("Audit type", s_coverInfoLabel), Paragraph("Private 1:1, 60 minutes, conducted personally by founder Indrodip Ghosh", s_coverInfoVal)],
        [Paragraph("Delivered", s_coverInfoLabel), Paragraph("Written report + recording (if consented) within 48 hours", s_coverInfoVal)],
        [Paragraph("This sample", s_coverInfoLabel), Paragraph("Jordan Avery is a fictional business, used to illustrate the real format and depth of your audit.", s_coverInfoVal)],
    ], col_widths=[1.5 * inch, inner_w - 1.5 * inch], header=False)
    info.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), DARK),
        ("TEXTCOLOR", (0, 0), (0, -1), LIME),
        ("GRID", (0, 0), (-1, -1), 0.6, LINE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 9), ("RIGHTPADDING", (0, 0), (-1, -1), 9),
        ("TOPPADDING", (0, 0), (-1, -1), 9), ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
    ]))
    inner.append(info)

    content = Table([[inner]], colWidths=[PAGE_W - 2 * MX])
    content.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), DARK),
        ("LEFTPADDING", (0, 0), (-1, -1), 18), ("RIGHTPADDING", (0, 0), (-1, -1), 18),
        ("TOPPADDING", (0, 0), (-1, -1), 20), ("BOTTOMPADDING", (0, 0), (-1, -1), 20),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))
    return [content]

def contents_page():
    """What's inside, as its own white page, a long bullet list doesn't fit
    on the single-page dark cover table (a Table cell can't split across
    pages), and white-on-white-page styling reads better anyway than white
    text forced onto a dark card for 12 bullets."""
    flow = [Paragraph("WHAT'S INSIDE THIS AUDIT", s_h2)]
    flow.append(rule())
    flow.append(bullets([
        "<b>Executive Summary</b>: the one-paragraph version of everything below, for a fast first read.",
        "<b>1. Current Business Position</b>: where the revenue, time and attention are actually going today.",
        "<b>2. Offer &amp; Positioning Assessment</b>: why the current offer underperforms, priced and worded as it is.",
        "<b>3. Ideal Customer Analysis</b>: the one buyer profile converting best, and the ones quietly wasting outreach.",
        "<b>4. Biggest Bottleneck</b>: the single constraint to fix before anything else, and the logic behind that call.",
        "<b>5. Recommended Changes</b>: specific, ordered changes to the offer, pricing and outreach, with the reasoning for each.",
        "<b>6. What Changes Once This Is Fixed</b>: a before/after projection, in plain numbers.",
        "<b>7. Your 100-Day Roadmap</b>: a phased plan across Days 1–30, 31–60 and 61–100.",
        "<b>8. AI Implementation Toolkit</b>: ready-to-use ChatGPT/Claude prompts for this exact plan.",
        "<b>9. Business Growth Calculators</b>: your numbers run through the revenue, pricing and client-acquisition models.",
        "<b>Methodology &amp; Who You're Working With</b>: how this diagnosis was built, and by whom.",
        "<b>Before You Book: Questions People Ask</b>: straight answers, no fine print.",
    ]))
    flow.append(Spacer(1, 10))
    flow.append(Paragraph(
        "Your real audit follows this exact structure, built from your actual business (not a template filled "
        "in around a generic framework. This sample uses a fictional 1:1 coaching business to show you the "
        "format and depth before you book.", s_caption))
    return flow

def build():
    doc = SimpleDocTemplate(
        OUT, pagesize=LETTER,
        leftMargin=MX, rightMargin=MX, topMargin=0.78 * inch, bottomMargin=0.68 * inch,
        title="The5th: Sample Business Audit (Illustrative)",
        author="The5th Global Consulting",
    )
    flow = []
    flow += cover_page()
    flow.append(PageBreak())
    flow += contents_page()
    flow.append(PageBreak())

    # ── Executive Summary ──────────────────────────────────────────────────
    flow += section("", "Executive Summary")
    flow.append(Paragraph(
        "Jordan Avery runs a 1:1 executive-coaching practice that is busy but not predictable: enough "
        "conversations are happening every month, yet revenue swings two to three times from one month to the "
        "next, and roughly six in ten sales conversations stall on &ldquo;let me think about it.&rdquo; After reviewing the "
        "business position, the offer, the buyer, and the sales process side by side, the diagnosis is specific: "
        "<b>the constraint is offer clarity, not lead volume.</b> Jordan already has more conversations than the "
        "business can convert; the fix is not more outreach, it is a sharper, more specific offer aimed at the "
        "buyer who is already converting best, backed by a follow-up system for the ones who stall. The sections "
        "that follow walk through exactly how that conclusion was reached, and the ordered, 100-day plan to act "
        "on it. Your real audit reaches a conclusion the same way: from your actual numbers, not a generic "
        "framework with your name typed into it.", s_body))
    flow.append(table([
        [Paragraph("Snapshot", s_tcellB), Paragraph("Now", s_tcellB), Paragraph("90 Days From Now (Projected)", s_tcellB)],
        [Paragraph("Monthly revenue", s_tcell), Paragraph("$4,200, inconsistent", s_tcell), Paragraph("$9,000–$10,500, steadier", s_tcell)],
        [Paragraph("Close rate", s_tcell), Paragraph("~40%", s_tcell), Paragraph("~55% with follow-up in place", s_tcell)],
        [Paragraph("Price per engagement", s_tcell), Paragraph("$800 flat", s_tcell), Paragraph("$900–$950, with a $150–200 entry offer", s_tcell)],
        [Paragraph("Lead source", s_tcell), Paragraph("55% referral, unpredictable", s_tcell), Paragraph("Direct outreach, repeatable weekly volume", s_tcell)],
    ], col_widths=[1.7 * inch, 1.9 * inch, PAGE_W - 2 * MX - 3.6 * inch]))
    flow.append(Spacer(1, 2))
    flow.append(Paragraph(
        "These are illustrative projections built into this sample to show the format, not a promise about your "
        "numbers. Section 6 explains exactly how a projection like this gets built from your real figures.",
        s_caption))

    flow.append(PageBreak())

    # ── 1. Current Business Position ──
    flow += section("1", "Current Business Position")
    flow.append(Paragraph(
        "Jordan runs a 1:1 executive-coaching practice from Denver, in its third year, averaging "
        "<b>$4,200/month</b> from a mix of referrals (55%) and inconsistent social content (45%). Pricing sits at "
        "a flat <b>$800/engagement</b> with no tiered structure, there is no recurring or retainer offer, and "
        "roughly <b>60% of sales conversations end with &ldquo;let me think about it.&rdquo;</b> Jordan spends an "
        "estimated 9 hours a week on content and outreach, and almost no time on follow-up with past "
        "&ldquo;maybes.&rdquo; None of this is unusual for a coaching business at this stage, it is a common pattern: "
        "enough activity to look busy, not enough structure to convert that activity into predictable revenue.",
        s_body))
    flow.append(Paragraph(
        "The month-to-month swing is the clearest symptom. A business bringing in $4,200 one month and $9,000 "
        "the next is not actually growing or shrinking, it is reacting to whichever referral or post happened to "
        "land that month. Fixing the swing matters more than raising the ceiling, because a predictable $6,000 a "
        "month is a more buildable business than an unpredictable $4,200-to-$9,000 range, even though the "
        "second one looks better on a good month. This is a realistic, but fictional, starting point used to "
        "show the structure and depth of your real audit.", s_body))
    flow.append(table([
        [Paragraph("Metric", s_tcellB), Paragraph("Current", s_tcellB), Paragraph("What it signals", s_tcellB)],
        [Paragraph("Monthly revenue", s_tcell), Paragraph("$4,200", s_tcell), Paragraph("Inconsistent, swings 2–3x month to month", s_tcell)],
        [Paragraph("Price per engagement", s_tcell), Paragraph("$800 flat", s_tcell), Paragraph("Below market ceiling for this specialty", s_tcell)],
        [Paragraph("Close rate", s_tcell), Paragraph("~40%", s_tcell), Paragraph("60% stall on &ldquo;let me think about it&rdquo;", s_tcell)],
        [Paragraph("Lead source mix", s_tcell), Paragraph("55% referral / 45% social", s_tcell), Paragraph("No owned, repeatable channel", s_tcell)],
        [Paragraph("Hours/week on growth", s_tcell), Paragraph("~9 hrs", s_tcell), Paragraph("Spent on content, almost none on follow-up", s_tcell)],
    ], col_widths=[1.8 * inch, 1.5 * inch, PAGE_W - 2 * MX - 3.3 * inch]))

    flow.append(PageBreak())

    # ── 2. Offer & Positioning Assessment ──
    flow += section("2", "Offer &amp; Positioning Assessment")
    flow.append(Paragraph(
        "The core problem with Jordan's offer is not the price, and it is not the delivery, it is that the "
        "offer is described by <b>outcome</b> (&ldquo;helping leaders grow&rdquo;) rather than <b>mechanism</b> (what "
        "specifically happens, for whom, by when). An outcome-only offer is indistinguishable from a dozen other "
        "coaches a prospect found the same week searching the same three words. When everything sounds the "
        "same, the only thing left to compare is price, which is exactly why price objections show up at all.",
        s_body))
    flow.append(Paragraph(
        "Four specific gaps show up once the offer is examined closely. First, pricing sits below the ceiling "
        "the market will actually bear for this specialty, and there is no lower-priced entry point for a buyer "
        "who is interested but not ready to commit $800 on a first conversation. Second, there is no proof asset "
        "(no named client, no specific before/after number) attached anywhere in the first message a prospect "
        "sees; a claim with no evidence reads as marketing, not fact. Third, positioning currently competes on "
        "availability and friendliness (&ldquo;I have openings, I'm easy to talk to&rdquo;) rather than a specific, "
        "provable result, which is a weak basis to defend a price on. Fourth, there is no urgency or scarcity "
        "mechanism anywhere in the sales process, which is part of why &ldquo;let me think about it&rdquo; has no "
        "natural deadline attached to it and simply drifts.", s_body))
    flow.append(callout(
        "What a stronger offer statement looks like",
        "Weak: &ldquo;I help leaders grow into their potential.&rdquo;<br/>"
        "Stronger: &ldquo;I help newly-promoted VPs stop managing former peers like friends and start leading them, "
        "in the first 90 days, before bad habits set in.&rdquo; Same coach, same skillset, one sentence a stranger "
        "understands immediately, naming who it's for, what changes, and by when."))

    flow.append(PageBreak())

    # ── 3. Ideal Customer Analysis ──
    flow += section("3", "Ideal Customer Analysis")
    flow.append(Paragraph(
        "Every past client was pulled apart by outcome: who became a fast, enthusiastic buyer, and who dragged "
        "out into a &ldquo;maybe&rdquo; that never closed. The highest-converting past clients share one specific trait: "
        "a <b>recent title change</b> (promoted to VP or Director in the last six months) inside a 50&ndash;500 "
        "person company, not &ldquo;anyone who wants to grow as a leader.&rdquo; That second, broader group is where "
        "almost all of the stalled conversations come from: solo founders and small-team operators who are "
        "curious about leadership but have no deadline forcing a decision.", s_body))
    flow.append(Paragraph(
        "This matters more than it might first appear. Narrowing outreach and messaging to the specific, "
        "deadline-driven buyer, instead of leadership in general, is the single highest-leverage change "
        "available right now, ahead of any pricing or content change. A newly-promoted VP with 90 days to prove "
        "themselves is not comparison-shopping the way a curious solo founder is; they are trying to solve a "
        "specific, time-boxed problem, which is exactly the kind of buyer who converts on a clear, specific "
        "offer rather than negotiating one down.", s_body))
    flow.append(table([
        [Paragraph("Signal", s_tcellB), Paragraph("Best-fit buyer", s_tcellB), Paragraph("Lowest-converting &ldquo;maybe&rdquo;", s_tcellB)],
        [Paragraph("Career stage", s_tcell), Paragraph("Promoted into VP/Director in last 6 months", s_tcell), Paragraph("Same title for 3+ years, browsing &ldquo;someday&rdquo;", s_tcell)],
        [Paragraph("Company size", s_tcell), Paragraph("50–500 employees", s_tcell), Paragraph("Solo founders / 1–5 person teams", s_tcell)],
        [Paragraph("Stated problem", s_tcell), Paragraph("&ldquo;I don't know how to lead people who used to be my peers&rdquo;", s_tcell), Paragraph("&ldquo;I want to be a better leader generally&rdquo;", s_tcell)],
        [Paragraph("Buying urgency", s_tcell), Paragraph("First 90 days in the new role, deadline-driven", s_tcell), Paragraph("No deadline, exploring options", s_tcell)],
    ], col_widths=[1.3 * inch, 2.4 * inch, PAGE_W - 2 * MX - 3.7 * inch]))
    flow.append(Spacer(1, 4))
    flow.append(Paragraph(
        "Your real audit identifies this same pattern from your actual client history, who bought fast, who "
        "stalled, and what they had in common, not a guess at your ideal customer from a worksheet.", s_caption))

    flow.append(PageBreak())

    # ── 4. Biggest Bottleneck ──
    flow += section("4", "Biggest Bottleneck")
    flow.append(Paragraph(
        "<b>Offer clarity, not lead volume, is the constraint to fix first.</b> Jordan already has enough "
        "conversations happening every month; the problem is that too few of them convert, because the offer "
        "does not name a specific before-and-after. Fixing acquisition, more content, more outreach, more "
        "leads, before fixing the offer would not solve anything; it would simply produce more &ldquo;let me "
        "think about it&rdquo; conversations at a larger, more expensive scale.", s_body))
    flow.append(Paragraph(
        "This conclusion comes from scoring all five growth levers side by side rather than reacting to the "
        "loudest symptom. It would be easy to look at inconsistent revenue and assume the answer is &ldquo;get more "
        "leads,&rdquo; but the Leads row below is already adequate, the actual weak points are the offer itself and "
        "what happens after a prospect says &ldquo;maybe.&rdquo; That is the diagnostic discipline your real audit "
        "applies to your business: not fixing the first thing that looks broken, but fixing the thing that is "
        "actually constraining growth.", s_body))
    flow.append(table([
        [Paragraph("Growth lever", s_tcellB), Paragraph("Health", s_tcellB), Paragraph("Why", s_tcellB)],
        [Paragraph("Positioning", s_tcell), Paragraph("Weak", s_tcell), Paragraph("Competes on friendliness, not a provable result", s_tcell)],
        [Paragraph("Offer", s_tcell), Paragraph("Weakest, fix first", s_tcell), Paragraph("No specific before/after, no entry price point", s_tcell)],
        [Paragraph("Leads", s_tcell), Paragraph("Adequate", s_tcell), Paragraph("Enough conversations already happening monthly", s_tcell)],
        [Paragraph("Sales process", s_tcell), Paragraph("Weak", s_tcell), Paragraph("No urgency mechanism; stalls become silent no's", s_tcell)],
        [Paragraph("Conversion / follow-up", s_tcell), Paragraph("Weak", s_tcell), Paragraph("Past &ldquo;maybes&rdquo; are never re-contacted", s_tcell)],
    ], col_widths=[1.6 * inch, 1.6 * inch, PAGE_W - 2 * MX - 3.2 * inch]))

    flow.append(PageBreak())

    # ── 5. Recommended Changes ──
    flow += section("5", "Recommended Changes")
    flow.append(Paragraph(
        "Each change below is ordered, earlier changes make the later ones work better, so the sequence "
        "matters as much as the list itself.", s_body))
    flow.append(Paragraph("<b>1. Rename the core offer around the specific transition.</b>", s_bodyB))
    flow.append(Paragraph(
        "Move from generic &ldquo;coaching&rdquo; language to naming the exact transition being solved (new leadership "
        "role, first 90 days). This alone makes the offer instantly recognizable to the right buyer and "
        "invisible noise to everyone else, which is the goal, since the wrong buyer was never going to convert "
        "anyway.", s_body))
    flow.append(Paragraph("<b>2. Introduce a lower-priced diagnostic session ($150&ndash;200) as the first purchase.</b>", s_bodyB))
    flow.append(Paragraph(
        "This mirrors the audit model itself: a small, low-risk first purchase that proves the value before "
        "asking for $800. It gives the &ldquo;not ready yet&rdquo; buyer a real next step instead of a binary "
        "yes/no, which is where many of today's stalls are actually lost.", s_body))
    flow.append(Paragraph("<b>3. Move outreach to the highest-converting signal.</b>", s_bodyB))
    flow.append(Paragraph(
        "Shift from general social posting to direct conversations with people who recently changed title, "
        "the buyer signal identified in Section 3. This is a targeting change, not a volume change; the same "
        "nine hours a week, pointed at a buyer who is already proven to convert.", s_body))
    flow.append(Paragraph("<b>4. Add one proof asset to the first message every prospect sees.</b>", s_bodyB))
    flow.append(Paragraph(
        "A specific client result, named and numbered, placed where a prospect decides whether to keep reading. "
        "This is the single fastest trust-building change available, and it costs nothing to add once it exists.",
        s_body))
    flow.append(Paragraph("<b>5. Build a simple follow-up sequence for every &ldquo;let me think about it.&rdquo;</b>", s_bodyB))
    flow.append(Paragraph(
        "A short, five-touch sequence over three weeks so a stalled conversation is reopened on a schedule, "
        "instead of being quietly lost the moment the call ends.", s_body))

    flow.append(PageBreak())

    # ── 6. What Changes Once This Is Fixed ──
    flow += section("6", "What Changes Once This Is Fixed")
    flow.append(Paragraph(
        "It is fair to ask: if the offer and follow-up change, does the math actually move, or is this just "
        "advice that sounds reasonable? Here is the arithmetic behind the Executive Summary's projection, using "
        "Jordan's own numbers rather than a generic growth percentage.", s_body))
    flow.append(table([
        [Paragraph("Lever", s_tcellB), Paragraph("Before", s_tcellB), Paragraph("After", s_tcellB), Paragraph("Effect", s_tcellB)],
        [Paragraph("Close rate", s_tcell), Paragraph("~40%", s_tcell), Paragraph("~55% (est.)", s_tcell), Paragraph("Same conversations, more become clients", s_tcell)],
        [Paragraph("Price per engagement", s_tcell), Paragraph("$800", s_tcell), Paragraph("$900–$950", s_tcell), Paragraph("More revenue per client, same delivery cost", s_tcell)],
        [Paragraph("Stalled &ldquo;maybes&rdquo;", s_tcell), Paragraph("Lost, no follow-up", s_tcell), Paragraph("Re-opened on a 5-touch sequence", s_tcell), Paragraph("Revenue recovered from work already done", s_tcell)],
        [Paragraph("Monthly swing", s_tcell), Paragraph("2–3x month to month", s_tcell), Paragraph("Narrower, more predictable", s_tcell), Paragraph("Easier to plan, hire, and reinvest", s_tcell)],
    ], col_widths=[1.3 * inch, 1.15 * inch, 1.3 * inch, PAGE_W - 2 * MX - 3.75 * inch]))
    flow.append(Spacer(1, 4))
    flow.append(callout(
        "Why this is a projection, not a promise",
        "This table shows the logic, not a guarantee: a higher close rate and a small price increase compound "
        "into materially more revenue from the same number of conversations, which is why fixing the offer "
        "outranks fixing lead volume. Your real audit builds this same table from your actual numbers, and is "
        "explicit everywhere that outcomes depend on your market, your delivery, and your follow-through."))

    flow.append(PageBreak())

    # ── 7. 100-Day Roadmap ──
    flow += section("7", "Your 100-Day Roadmap")
    flow.append(Paragraph(
        "Your real roadmap is phased the same way: a focused first 30 days that fixes the offer itself, a "
        "scaling middle phase that builds the systems around it, and a final phase that compounds what is "
        "already proven to work. Below is the illustrative shape of that plan.", s_body))

    flow.append(Paragraph("Phase 1, Days 1&ndash;30: Fix the Offer", s_h3))
    flow.append(Paragraph(
        "Nothing else in this plan works until the offer itself is specific. The first 30 days are deliberately "
        "narrow: rewrite the offer, build the lower-priced entry point, and start pointing outreach at the "
        "buyer who already converts best.", s_body))
    flow.append(table([
        [Paragraph("Week", s_tcellB), Paragraph("Focus", s_tcellB), Paragraph("Outcome", s_tcellB)],
        [Paragraph("1", s_tcell), Paragraph("Rewrite the core offer and one-line positioning", s_tcell), Paragraph("A message a stranger understands in one read", s_tcell)],
        [Paragraph("2", s_tcell), Paragraph("Build the lower-priced diagnostic entry offer", s_tcell), Paragraph("A lower-risk first purchase for new buyers", s_tcell)],
        [Paragraph("3–4", s_tcell), Paragraph("Direct outreach to 20 recently-promoted leaders/week", s_tcell), Paragraph("A repeatable, trackable lead source", s_tcell)],
    ], col_widths=[0.9 * inch, 2.9 * inch, PAGE_W - 2 * MX - 3.8 * inch]))

    flow.append(Paragraph("Phase 2, Days 31&ndash;60: Build the Follow-up Engine", s_h3))
    flow.append(Paragraph(
        "With a sharper offer live, the second phase stops revenue leaking out of stalled conversations and "
        "starts building the proof that makes the next sale easier than the last one.", s_body))
    flow.append(table([
        [Paragraph("Week", s_tcellB), Paragraph("Focus", s_tcellB), Paragraph("Outcome", s_tcellB)],
        [Paragraph("5–6", s_tcell), Paragraph("Build a 5-touch follow-up sequence for every stalled &ldquo;maybe&rdquo;", s_tcell), Paragraph("Stalled conversations get reopened, not lost", s_tcell)],
        [Paragraph("7", s_tcell), Paragraph("Add one named, numbered proof story to the offer page", s_tcell), Paragraph("Objections drop before they're raised", s_tcell)],
        [Paragraph("8", s_tcell), Paragraph("Introduce a soft deadline (cohort start date) to every proposal", s_tcell), Paragraph("&ldquo;Let me think about it&rdquo; gets a natural decision point", s_tcell)],
    ], col_widths=[0.9 * inch, 2.9 * inch, PAGE_W - 2 * MX - 3.8 * inch]))

    flow.append(Paragraph("Phase 3, Days 61&ndash;100: Scale What's Working", s_h3))
    flow.append(Paragraph(
        "By the final phase, the offer and the follow-up system are both proven on real conversations. This "
        "phase is about volume and pricing, not more experimentation, doing more of what is already working.",
        s_body))
    flow.append(table([
        [Paragraph("Week", s_tcellB), Paragraph("Focus", s_tcellB), Paragraph("Outcome", s_tcellB)],
        [Paragraph("9–12", s_tcell), Paragraph("Double outreach volume on the highest-converting buyer signal", s_tcell), Paragraph("Pipeline grows from the channel already proven to work", s_tcell)],
        [Paragraph("13–14", s_tcell), Paragraph("Test a 10–15% price increase on the core offer", s_tcell), Paragraph("Revenue per client rises without losing close rate", s_tcell)],
        [Paragraph("15", s_tcell), Paragraph("Review all 100 days of numbers and set the next quarter's target", s_tcell), Paragraph("A clear, numbers-based plan for what's next", s_tcell)],
    ], col_widths=[0.9 * inch, 2.9 * inch, PAGE_W - 2 * MX - 3.8 * inch]))
    flow.append(Spacer(1, 4))
    flow.append(Paragraph(
        "Your real 100-day roadmap is built the same way, from your actual numbers, offer and market, not a "
        "generic template with your name on it.", s_caption))

    flow.append(PageBreak())

    # ── 8. AI Implementation Toolkit ──
    flow += section("8", "AI Implementation Toolkit")
    flow.append(Paragraph(
        "Every audit includes ready-to-use ChatGPT and Claude prompts built around your specific plan, not "
        "generic marketing prompts copied from a blog post. Five examples from Jordan's toolkit:", s_body))

    def prompt_box(title, body_text):
        tbl = Table([[Paragraph(title, s_h3)], [Paragraph(body_text, s_tcell)]],
                    colWidths=[PAGE_W - 2 * MX])
        tbl.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), LIME_TINT),
            ("BOX", (0, 0), (-1, -1), 0.7, colors.HexColor("#B9D98A")),
            ("LEFTPADDING", (0, 0), (-1, -1), 12), ("RIGHTPADDING", (0, 0), (-1, -1), 12),
            ("TOPPADDING", (0, 0), (-1, -1), 9), ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
        ]))
        return tbl

    flow.append(prompt_box(
        "Prompt 1, Rewrite the core offer",
        "&ldquo;I run a 1:1 executive-coaching practice. My current offer is described as &lsquo;helping leaders "
        "grow,&rsquo; priced at $800. My best clients are people promoted to VP/Director in the last 90 days who "
        "feel they can't lead former peers. Rewrite my offer as one sentence naming the specific before/after "
        "transformation for this exact buyer, with no generic leadership language.&rdquo;"))
    flow.append(Spacer(1, 8))
    flow.append(prompt_box(
        "Prompt 2, Build the follow-up sequence",
        "&ldquo;Write a 5-message follow-up sequence (email or DM) for a prospect who said &lsquo;let me think about "
        "it&rsquo; after an $800 coaching proposal. Message 1 sends same day, messages 2&ndash;5 space out over 3 "
        "weeks. Each message should add one new piece of value or proof, never just &lsquo;checking in.&rsquo;&rdquo;"))
    flow.append(Spacer(1, 8))
    flow.append(prompt_box(
        "Prompt 3, Draft the outreach message",
        "&ldquo;Write a short, non-salesy LinkedIn message to someone who was promoted to Director in the last 90 "
        "days. Reference the specific challenge of leading former peers. End with one direct, low-pressure "
        "question, not a pitch.&rdquo;"))
    flow.append(Spacer(1, 8))
    flow.append(prompt_box(
        "Prompt 4, Build the proof asset",
        "&ldquo;Here is a client result: [describe the result]. Turn this into a two-sentence proof story I can "
        "place on my offer page, specific enough to be believable, short enough to read in five seconds, no "
        "vague claims like &lsquo;transformative&rsquo; or &lsquo;life-changing.&rsquo;&rdquo;"))
    flow.append(Spacer(1, 8))
    flow.append(prompt_box(
        "Prompt 5, Design the entry offer",
        "&ldquo;I want to create a $150&ndash;200 diagnostic session as a lower-risk first purchase before my $800 core "
        "offer. Propose three structures for this session (length, format, what's delivered) that make the next "
        "step to the full offer feel obvious, not like a separate sale.&rdquo;"))
    flow.append(Spacer(1, 10))
    flow.append(Paragraph(
        "Your real toolkit includes the exact prompts for your plan's recommended changes, pricing, outreach, "
        "content and follow-up, not these illustrative examples.", s_caption))

    flow.append(PageBreak())

    # ── 9. Business Growth Calculators ──
    flow += section("9", "Business Growth Calculators &mdash; Sample Output")
    flow.append(Paragraph(
        "Your audit includes access to three interactive calculators on the audit page itself, which you can "
        "re-run any time with your own numbers. Run with Jordan's numbers, here is what they surface:", s_body))

    flow.append(Paragraph("Revenue Goal Calculator", s_h3))
    flow.append(Paragraph(
        "Shows the gap between the current monthly number and a stated goal, and how a modest price change "
        "shrinks the number of clients needed to close it.", s_body))
    flow.append(table([
        [Paragraph("Input", s_tcellB), Paragraph("Value", s_tcellB), Paragraph("Output", s_tcellB)],
        [Paragraph("Monthly revenue goal", s_tcell), Paragraph("$10,000", s_tcell), Paragraph("Gap to close: $5,800/mo", s_tcell)],
        [Paragraph("Price per engagement", s_tcell), Paragraph("$800", s_tcell), Paragraph("Needs ~12.5 clients/mo at current price", s_tcell)],
        [Paragraph("At recommended +15% price", s_tcell), Paragraph("$920", s_tcell), Paragraph("Needs ~10.9 clients/mo, 2 fewer sales needed", s_tcell)],
    ], col_widths=[2.0 * inch, 1.2 * inch, PAGE_W - 2 * MX - 3.2 * inch]))

    flow.append(Paragraph("Offer Pricing Calculator", s_h3))
    flow.append(Paragraph(
        "Compares the current price against the category ceiling, and recommends both an entry offer and a "
        "revised core price.", s_body))
    flow.append(table([
        [Paragraph("Input", s_tcellB), Paragraph("Value", s_tcellB), Paragraph("Output", s_tcellB)],
        [Paragraph("Current price", s_tcell), Paragraph("$800", s_tcell), Paragraph("Below category ceiling for this specialty", s_tcell)],
        [Paragraph("Recommended entry offer", s_tcell), Paragraph("$150–200", s_tcell), Paragraph("Lowers first-purchase risk, raises close rate on cold leads", s_tcell)],
        [Paragraph("Recommended core price", s_tcell), Paragraph("$900–950", s_tcell), Paragraph("Within market ceiling once offer is repositioned", s_tcell)],
    ], col_widths=[2.0 * inch, 1.2 * inch, PAGE_W - 2 * MX - 3.2 * inch]))

    flow.append(Paragraph("Client Acquisition Calculator", s_h3))
    flow.append(Paragraph(
        "Translates a higher close rate into fewer conversations needed per month for the same number of "
        "clients, and checks that against the outreach plan in Section 7.", s_body))
    flow.append(table([
        [Paragraph("Input", s_tcellB), Paragraph("Value", s_tcellB), Paragraph("Output", s_tcellB)],
        [Paragraph("Current close rate", s_tcell), Paragraph("~40%", s_tcell), Paragraph("31 conversations/mo needed for 12.5 clients", s_tcell)],
        [Paragraph("Close rate with follow-up sequence", s_tcell), Paragraph("~55% (est.)", s_tcell), Paragraph("Same client target from ~23 conversations/mo", s_tcell)],
        [Paragraph("Outreach needed per week", s_tcell), Paragraph("20 targeted contacts", s_tcell), Paragraph("Matches the 100-day roadmap's Phase 1 target", s_tcell)],
    ], col_widths=[2.0 * inch, 1.2 * inch, PAGE_W - 2 * MX - 3.2 * inch]))
    flow.append(Spacer(1, 10))
    flow.append(Paragraph(
        "These calculators run live on your audit's numbers, not estimates typed in after the call, you can "
        "adjust any input yourself and watch the whole chain move.", s_caption))

    flow.append(PageBreak())

    # ── Methodology & Who You're Working With ──
    flow += section("", "Methodology &amp; Who You're Working With")
    flow.append(Paragraph(
        "This diagnosis did not come from a template with blanks filled in. It followed the same four-step "
        "process your real audit follows: review the actual numbers (not impressions), identify the pattern "
        "across past client outcomes (who converted fast, who stalled, and why), score every growth lever "
        "side by side so the real constraint is found rather than the loudest symptom, and build an ordered "
        "plan where each step makes the next one work better.", s_body))
    flow.append(Paragraph(
        "Your audit is conducted personally, 1-on-1, by founder Indrodip Ghosh, never handed to a sales rep "
        "or a junior coach. Indrodip is a consumer psychologist (University of California, Berkeley) and the "
        "founder of The5th Global Consulting, which has worked with 76 coaches and consultants across 12 "
        "nations. Running The5th from outside the US coaching bubble means the diagnosis you receive is not "
        "the same recycled playbook you may have already bought elsewhere.", s_body))
    flow.append(callout(
        "Why this matters for your audit",
        "A diagnosis is only as trustworthy as the process behind it. Knowing the method, and knowing a real "
        "person with real credentials is personally behind your specific numbers, not an automated report, is "
        "part of what you're paying $29 for."))

    flow.append(PageBreak())

    # ── Before You Book: Questions People Ask ──
    flow += section("", "Before You Book: Questions People Ask")
    faqs = [
        ("Is the $29 really refundable?",
         "Yes. If you attend the call and feel it did not give you real clarity or a usable next step, email "
         "within 7 days for a full refund, no conditions attached. You keep the written plan either way."),
        ("Do I have to be on camera?",
         "No. Camera optional, audio-only is completely fine. If you would prefer not to get on a call at all, "
         "tell us and we will run it as a written-only audit instead, for the same price."),
        ("What happens to my information?",
         "Your answers and the call are used only to build your audit and, if you consent, to provide you the "
         "recording. Nothing is shared or sold. See the Privacy Policy on the website for the full detail."),
        ("How personalized is my actual audit, really?",
         "Every part of this sample (business position, offer assessment, buyer analysis, bottleneck and "
         "roadmap) is rebuilt from scratch from your real answers and your real numbers. Nothing here is "
         "copy-pasted into your report."),
        ("What if I'm not sure I'm ready to be coached?",
         "The audit itself is not a pitch for further coaching. It is a diagnosis you can act on alone if you "
         "choose to. Some people find that enough; others ask what working together further could look like. "
         "Either way, the plan is yours to keep."),
    ]
    for q, a in faqs:
        flow.append(Paragraph(q, s_h3))
        flow.append(Paragraph(a, s_body))

    flow.append(Spacer(1, 14))
    flow.append(rule())
    flow.append(Paragraph(
        "This is an illustrative sample built to show the format and depth of a real audit. It uses a fictional "
        "business (Jordan Avery / Jordan Avery Coaching) and is not the record of any actual client. It makes no "
        "guarantee of income or results; individual outcomes depend on your own offer, market and effort. "
        "© The5th Global Consulting.", s_caption))

    doc.build(flow, onFirstPage=header_footer, onLaterPages=header_footer)
    print("Wrote", OUT)

if __name__ == "__main__":
    build()
