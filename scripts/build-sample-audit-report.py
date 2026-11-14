# -*- coding: utf-8 -*-
"""Builds the detailed, branded sample audit report PDF for The5th's
$10K Roadmap Audit landing page (served at /documents/sample-audit-report.pdf).
Run with: python3 scripts/build-sample-audit-report.py
Requires: pip install reportlab
"""
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak,
    HRFlowable, KeepTogether, ListFlowable, ListItem
)
from reportlab.pdfgen import canvas as canvas_module

OUT = "/home/user/the5th-website/public/documents/sample-audit-report.pdf"

# ── Brand palette (matches the live site's black/green system) ──
INK = colors.HexColor("#14201A")       # near-black green, body text
DARK = colors.HexColor("#182014")      # deep forest green, bands/headers
ACCENT = colors.HexColor("#3F6B22")    # mid green, headings
ACCENT_LT = colors.HexColor("#EEF6E4")  # pale green tint, table fills
LINE = colors.HexColor("#D8E3CE")      # soft green-grey rules
MUTED = colors.HexColor("#5B6B58")     # muted green-grey for captions
WHITE = colors.white

styles = getSampleStyleSheet()

def style(name, **kw):
    parent = kw.pop("parent", styles["Normal"])
    return ParagraphStyle(name, parent=parent, **kw)

s_banner = style("banner", fontName="Helvetica-Bold", fontSize=9, textColor=WHITE,
                  alignment=TA_CENTER, letterSpacing=1.2)
s_eyebrow = style("eyebrow", fontName="Helvetica-Bold", fontSize=9.5, textColor=ACCENT,
                   leading=12, letterSpacing=1)
s_h1 = style("h1", fontName="Helvetica-Bold", fontSize=22, textColor=INK, leading=26,
             spaceAfter=4)
s_sub = style("sub", fontName="Helvetica", fontSize=10.5, textColor=MUTED, leading=14)
s_h2 = style("h2", fontName="Helvetica-Bold", fontSize=13.5, textColor=DARK, leading=16,
             spaceBefore=16, spaceAfter=6)
s_h3 = style("h3", fontName="Helvetica-Bold", fontSize=10.5, textColor=ACCENT, leading=13,
             spaceBefore=6, spaceAfter=3)
s_body = style("body", fontName="Helvetica", fontSize=9.7, textColor=INK, leading=14.5,
               spaceAfter=6, alignment=TA_LEFT)
s_bodyB = style("bodyB", parent=s_body, fontName="Helvetica-Bold")
s_bullet = style("bullet", parent=s_body, leftIndent=4, spaceAfter=4)
s_caption = style("caption", fontName="Helvetica-Oblique", fontSize=8.3, textColor=MUTED,
                   leading=11)
s_tcell = style("tcell", fontName="Helvetica", fontSize=8.6, textColor=INK, leading=11.5)
s_tcellB = style("tcellB", parent=s_tcell, fontName="Helvetica-Bold", textColor=WHITE)
s_footer = style("footer", fontName="Helvetica", fontSize=7.2, textColor=MUTED, leading=10)

PAGE_W, PAGE_H = LETTER
MX = 0.62 * inch

def banner_flow(text):
    t = Table([[Paragraph(text, s_banner)]], colWidths=[PAGE_W - 2 * MX])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), DARK),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    return t

def rule():
    return HRFlowable(width="100%", thickness=0.6, color=LINE, spaceBefore=2, spaceAfter=10)

def section(title):
    return [Paragraph(title, s_h2), rule()]

def bullets(items):
    return ListFlowable(
        [ListItem(Paragraph(i, s_bullet), leftIndent=12, value="•", bulletFontSize=9.5, bulletColor=ACCENT)
         for i in items],
        bulletType="bullet", start="•", leftIndent=6, spaceBefore=2, spaceAfter=8,
    )

def table(data, col_widths, header=True, align_last_center=False):
    t = Table(data, colWidths=col_widths, repeatRows=1 if header else 0)
    cmds = [
        ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
        ("FONTSIZE", (0, 0), (-1, -1), 8.6),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("GRID", (0, 0), (-1, -1), 0.5, LINE),
        ("LEFTPADDING", (0, 0), (-1, -1), 7),
        ("RIGHTPADDING", (0, 0), (-1, -1), 7),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("ROWBACKGROUNDS", (0, 1 if header else 0), (-1, -1), [WHITE, ACCENT_LT]),
    ]
    if header:
        cmds += [
            ("BACKGROUND", (0, 0), (-1, 0), DARK),
            ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ]
    t.setStyle(TableStyle(cmds))
    return t

def header_footer(canvas, doc):
    canvas.saveState()
    # top accent rule
    canvas.setStrokeColor(DARK)
    canvas.setLineWidth(2.2)
    canvas.line(MX, PAGE_H - 0.52 * inch, PAGE_W - MX, PAGE_H - 0.52 * inch)
    canvas.setFont("Helvetica-Bold", 8)
    canvas.setFillColor(DARK)
    canvas.drawString(MX, PAGE_H - 0.42 * inch, "THE5TH GLOBAL CONSULTING")
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(MUTED)
    canvas.drawRightString(PAGE_W - MX, PAGE_H - 0.42 * inch, "Private 60-Minute Business Audit — Illustrative Sample")
    # footer
    canvas.setFont("Helvetica", 7.4)
    canvas.setFillColor(MUTED)
    canvas.drawString(MX, 0.4 * inch, "ILLUSTRATIVE SAMPLE — fictional business, used to show format and depth only. Not an actual client's audit.")
    canvas.drawRightString(PAGE_W - MX, 0.4 * inch, "Page %d" % canvas.getPageNumber())
    canvas.restoreState()

def cover_page():
    flow = []
    flow.append(Spacer(1, 0.05 * inch))
    flow.append(banner_flow("ILLUSTRATIVE SAMPLE &nbsp;·&nbsp; NOT AN ACTUAL CLIENT'S AUDIT"))
    flow.append(Spacer(1, 0.55 * inch))
    flow.append(Paragraph("THE5TH GLOBAL CONSULTING", s_eyebrow))
    flow.append(Paragraph("Private 60-Minute Business Audit", s_h1))
    flow.append(Paragraph(
        "A complete, personalized breakdown of your business position, offer, ideal buyer, "
        "biggest bottleneck, and a 100-day action plan — delivered inside 48 hours of your call.",
        s_sub))
    flow.append(Spacer(1, 0.3 * inch))

    info = table([
        [Paragraph("Prepared for", s_tcellB), Paragraph("Jordan Avery · Jordan Avery Coaching", s_tcell)],
        [Paragraph("Audit type", s_tcellB), Paragraph("Private 1:1, 60 minutes, conducted by founder Indrodip Ghosh", s_tcell)],
        [Paragraph("Delivered", s_tcellB), Paragraph("Written report + recording (if consented) within 48 hours", s_tcell)],
        [Paragraph("Note", s_tcellB), Paragraph("Jordan Avery is a fictional business built to illustrate the real format and depth of your audit.", s_tcell)],
    ], col_widths=[1.4 * inch, PAGE_W - 2 * MX - 1.4 * inch], header=False)
    info.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), DARK),
        ("TEXTCOLOR", (0, 0), (0, -1), WHITE),
        ("GRID", (0, 0), (-1, -1), 0.5, LINE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 8), ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 7), ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]))
    flow.append(info)
    flow.append(Spacer(1, 0.4 * inch))

    flow.append(Paragraph("WHAT'S INSIDE THIS AUDIT", s_h3))
    flow.append(bullets([
        "<b>1. Current Business Position</b> — where the revenue, time and attention are actually going today.",
        "<b>2. Offer &amp; Positioning Assessment</b> — why the current offer underperforms, priced and worded as it is.",
        "<b>3. Ideal Customer Analysis</b> — the one buyer profile converting best, and the ones quietly wasting outreach.",
        "<b>4. Biggest Bottleneck</b> — the single constraint to fix before anything else, scored across 5 growth levers.",
        "<b>5. Recommended Changes</b> — specific, ordered changes to the offer, pricing and outreach.",
        "<b>6. 100-Day Roadmap</b> — a phased plan across Days 1–30, 31–60 and 61–100.",
        "<b>7. AI Implementation Toolkit</b> — ready-to-use ChatGPT/Claude prompts for this exact plan.",
        "<b>8. Business Growth Calculators</b> — your numbers run through the revenue, pricing and client-acquisition models.",
    ]))
    flow.append(Spacer(1, 0.25 * inch))
    flow.append(rule())
    flow.append(Paragraph(
        "Your real audit follows this exact structure — built from your actual business, not a template filled in "
        "around a generic framework. This sample uses a fictional 1:1 coaching business to show you the format and "
        "depth before you book.",
        s_caption))
    return flow

def build():
    doc = SimpleDocTemplate(
        OUT, pagesize=LETTER,
        leftMargin=MX, rightMargin=MX, topMargin=0.75 * inch, bottomMargin=0.65 * inch,
        title="The5th — Sample Business Audit (Illustrative)",
        author="The5th Global Consulting",
    )
    flow = []
    flow += cover_page()
    flow.append(PageBreak())

    # ── 1. Current Business Position ──
    flow += section("1. Current Business Position")
    flow.append(Paragraph(
        "Jordan runs a 1:1 executive-coaching practice from Denver, in its third year, averaging "
        "<b>$4,200/month</b> from a mix of referrals (55%) and inconsistent social content (45%). Pricing sits at "
        "a flat <b>$800/engagement</b> with no tiered structure, there is no recurring or retainer offer, and "
        "roughly <b>60% of sales conversations end with “let me think about it.”</b> Jordan spends an "
        "estimated 9 hours/week on content and outreach, and almost no time on follow-up with past “maybes.” "
        "This is a realistic, but fictional, starting point used to show the structure of your real audit.", s_body))
    flow.append(table([
        [Paragraph("Metric", s_tcellB), Paragraph("Current", s_tcellB), Paragraph("What it signals", s_tcellB)],
        [Paragraph("Monthly revenue", s_tcell), Paragraph("$4,200", s_tcell), Paragraph("Inconsistent — swings 2–3x month to month", s_tcell)],
        [Paragraph("Price per engagement", s_tcell), Paragraph("$800 flat", s_tcell), Paragraph("Below market ceiling for this specialty", s_tcell)],
        [Paragraph("Close rate", s_tcell), Paragraph("~40%", s_tcell), Paragraph("60% stall on “let me think about it”", s_tcell)],
        [Paragraph("Lead source mix", s_tcell), Paragraph("55% referral / 45% social", s_tcell), Paragraph("No owned, repeatable channel", s_tcell)],
        [Paragraph("Hours/week on growth", s_tcell), Paragraph("~9 hrs", s_tcell), Paragraph("Spent on content, almost none on follow-up", s_tcell)],
    ], col_widths=[1.7 * inch, 1.3 * inch, PAGE_W - 2 * MX - 3.0 * inch]))
    flow.append(Spacer(1, 4))

    # ── 2. Offer & Positioning Assessment ──
    flow += section("2. Offer & Positioning Assessment")
    flow.append(bullets([
        "The offer is described by <b>outcome</b> (“better leadership”) rather than <b>mechanism</b>, which makes it indistinguishable from a dozen other coaches searched the same week.",
        "Pricing is below the ceiling the market will bear for this specialty; there is <b>no entry offer</b> to lower first-purchase risk for a buyer who isn't ready to commit to $800.",
        "Positioning currently competes on <b>availability and friendliness</b> rather than a specific, provable result — this is why price objections show up at all.",
        "There is no <b>proof asset</b> (case study, before/after, number) attached to the offer in the first message a prospect sees.",
        "No <b>urgency or scarcity mechanism</b> exists anywhere in the sales process, which is part of why “let me think about it” has no natural deadline attached to it.",
    ]))

    # ── 3. Ideal Customer Analysis ──
    flow += section("3. Ideal Customer Analysis")
    flow.append(Paragraph(
        "The highest-converting past clients share one trait: a <b>recent title change</b> (new VP or Director) "
        "inside a 50–500 person company, not “anyone wanting to grow as a leader.” Narrowing outreach and "
        "messaging to this buyer, instead of leadership in general, is the single highest-leverage change "
        "available right now.", s_body))
    flow.append(table([
        [Paragraph("Signal", s_tcellB), Paragraph("Best-fit buyer", s_tcellB), Paragraph("Lowest-converting “maybe”", s_tcellB)],
        [Paragraph("Career stage", s_tcell), Paragraph("Promoted into VP/Director in last 6 months", s_tcell), Paragraph("Same title for 3+ years, browsing “someday”", s_tcell)],
        [Paragraph("Company size", s_tcell), Paragraph("50–500 employees", s_tcell), Paragraph("Solo founders / 1–5 person teams", s_tcell)],
        [Paragraph("Stated problem", s_tcell), Paragraph("“I don't know how to lead people who used to be my peers”", s_tcell), Paragraph("“I want to be a better leader generally”", s_tcell)],
        [Paragraph("Buying urgency", s_tcell), Paragraph("First 90 days in the new role — deadline-driven", s_tcell), Paragraph("No deadline, exploring options", s_tcell)],
    ], col_widths=[1.3 * inch, 2.35 * inch, PAGE_W - 2 * MX - 3.65 * inch]))
    flow.append(Spacer(1, 6))

    # ── 4. Biggest Bottleneck ──
    flow += section("4. Biggest Bottleneck")
    flow.append(Paragraph(
        "<b>Offer clarity, not lead volume.</b> Jordan already has enough conversations; too few convert because "
        "the offer does not name a specific before/after. Fixing acquisition before fixing the offer would only "
        "produce more “let me think about it” conversations at a larger scale.", s_body))
    flow.append(table([
        [Paragraph("Growth lever", s_tcellB), Paragraph("Health", s_tcellB), Paragraph("Why", s_tcellB)],
        [Paragraph("Positioning", s_tcell), Paragraph("Weak", s_tcell), Paragraph("Competes on friendliness, not a provable result", s_tcell)],
        [Paragraph("Offer", s_tcell), Paragraph("Weakest — fix first", s_tcell), Paragraph("No specific before/after, no entry price point", s_tcell)],
        [Paragraph("Leads", s_tcell), Paragraph("Adequate", s_tcell), Paragraph("Enough conversations already happening monthly", s_tcell)],
        [Paragraph("Sales process", s_tcell), Paragraph("Weak", s_tcell), Paragraph("No urgency mechanism; stalls become silent no's", s_tcell)],
        [Paragraph("Conversion / follow-up", s_tcell), Paragraph("Weak", s_tcell), Paragraph("Past “maybes” are never re-contacted", s_tcell)],
    ], col_widths=[1.5 * inch, 1.5 * inch, PAGE_W - 2 * MX - 3.0 * inch]))
    flow.append(Spacer(1, 6))

    # ── 5. Recommended Changes ──
    flow += section("5. Recommended Changes")
    flow.append(bullets([
        "<b>Rename the core offer</b> around the specific transition (new leadership role, first 90 days) rather than generic “coaching.”",
        "<b>Introduce a lower-priced diagnostic session</b> ($150–200) as the first purchase, mirroring the audit model itself, to lower first-purchase risk.",
        "<b>Move outreach</b> from general social posting to direct conversations with people who recently changed title — the highest-converting signal identified above.",
        "<b>Add one proof asset</b> (a specific client result, named and numbered) to the first message every new prospect sees.",
        "<b>Build a simple follow-up sequence</b> for every “let me think about it,” so stalled conversations aren't simply lost.",
    ]))

    flow.append(PageBreak())

    # ── 6. 100-Day Roadmap ──
    flow += section("6. Personalized 100-Day Roadmap")
    flow.append(Paragraph(
        "Your real roadmap is phased the same way: a focused first 30 days, a scaling middle phase, and a final "
        "phase that compounds what's working. Below is the illustrative shape of that plan.", s_body))

    flow.append(Paragraph("Phase 1 — Days 1–30: Fix the Offer", s_h3))
    flow.append(table([
        [Paragraph("Week", s_tcellB), Paragraph("Focus", s_tcellB), Paragraph("Outcome", s_tcellB)],
        [Paragraph("1", s_tcell), Paragraph("Rewrite the core offer and one-line positioning", s_tcell), Paragraph("A message a stranger understands in one read", s_tcell)],
        [Paragraph("2", s_tcell), Paragraph("Build the lower-priced diagnostic entry offer", s_tcell), Paragraph("A lower-risk first purchase for new buyers", s_tcell)],
        [Paragraph("3–4", s_tcell), Paragraph("Direct outreach to 20 recently-promoted leaders/week", s_tcell), Paragraph("A repeatable, trackable lead source", s_tcell)],
    ], col_widths=[0.8 * inch, 3.0 * inch, PAGE_W - 2 * MX - 3.8 * inch]))

    flow.append(Paragraph("Phase 2 — Days 31–60: Build the Follow-up Engine", s_h3))
    flow.append(table([
        [Paragraph("Week", s_tcellB), Paragraph("Focus", s_tcellB), Paragraph("Outcome", s_tcellB)],
        [Paragraph("5–6", s_tcell), Paragraph("Build a 5-touch follow-up sequence for every stalled “maybe”", s_tcell), Paragraph("Stalled conversations get reopened, not lost", s_tcell)],
        [Paragraph("7", s_tcell), Paragraph("Add one named, numbered proof story to the offer page", s_tcell), Paragraph("Objections drop before they're raised", s_tcell)],
        [Paragraph("8", s_tcell), Paragraph("Introduce a soft deadline (cohort start date) to every proposal", s_tcell), Paragraph("“Let me think about it” gets a natural decision point", s_tcell)],
    ], col_widths=[0.8 * inch, 3.0 * inch, PAGE_W - 2 * MX - 3.8 * inch]))

    flow.append(Paragraph("Phase 3 — Days 61–100: Scale What's Working", s_h3))
    flow.append(table([
        [Paragraph("Week", s_tcellB), Paragraph("Focus", s_tcellB), Paragraph("Outcome", s_tcellB)],
        [Paragraph("9–12", s_tcell), Paragraph("Double outreach volume on the highest-converting buyer signal", s_tcell), Paragraph("Pipeline grows from the channel already proven to work", s_tcell)],
        [Paragraph("13–14", s_tcell), Paragraph("Test a 10–15% price increase on the core offer", s_tcell), Paragraph("Revenue per client rises without losing close rate", s_tcell)],
        [Paragraph("15", s_tcell), Paragraph("Review all 100 days of numbers and set the next quarter's target", s_tcell), Paragraph("A clear, numbers-based plan for what's next", s_tcell)],
    ], col_widths=[0.8 * inch, 3.0 * inch, PAGE_W - 2 * MX - 3.8 * inch]))
    flow.append(Spacer(1, 4))
    flow.append(Paragraph(
        "Your real 100-day roadmap is built the same way, from your actual numbers, offer and market — not a "
        "generic template with your name on it.", s_caption))

    flow.append(PageBreak())

    # ── 7. AI Implementation Toolkit ──
    flow += section("7. AI Implementation Toolkit")
    flow.append(Paragraph(
        "Every audit includes ready-to-use ChatGPT and Claude prompts built around your specific plan, not generic "
        "marketing prompts. Three examples from Jordan's toolkit:", s_body))

    def prompt_box(title, body):
        tbl = Table([[Paragraph(title, s_h3)], [Paragraph(body, s_tcell)]],
                    colWidths=[PAGE_W - 2 * MX])
        tbl.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), ACCENT_LT),
            ("BOX", (0, 0), (-1, -1), 0.6, LINE),
            ("LEFTPADDING", (0, 0), (-1, -1), 10), ("RIGHTPADDING", (0, 0), (-1, -1), 10),
            ("TOPPADDING", (0, 0), (-1, -1), 8), ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ]))
        return tbl

    flow.append(prompt_box(
        "Prompt 1 — Rewrite the core offer",
        "“I run a 1:1 executive-coaching practice. My current offer is described as ‘helping leaders "
        "grow,’ priced at $800. My best clients are people promoted to VP/Director in the last 90 days who "
        "feel they can't lead former peers. Rewrite my offer as one sentence naming the specific before/after "
        "transformation for this exact buyer, with no generic leadership language.”"))
    flow.append(Spacer(1, 6))
    flow.append(prompt_box(
        "Prompt 2 — Build the follow-up sequence",
        "“Write a 5-message follow-up sequence (email or DM) for a prospect who said ‘let me think about "
        "it’ after a $800 coaching proposal. Message 1 sends same day, messages 2–5 space out over 3 "
        "weeks. Each message should add one new piece of value or proof, never just ‘checking in.’”"))
    flow.append(Spacer(1, 6))
    flow.append(prompt_box(
        "Prompt 3 — Draft the outreach message",
        "“Write a short, non-salesy LinkedIn message to someone who was promoted to Director in the last 90 "
        "days. Reference the specific challenge of leading former peers. End with one direct, low-pressure "
        "question, not a pitch.”"))
    flow.append(Spacer(1, 10))
    flow.append(Paragraph(
        "Your real toolkit includes the exact prompts for your plan's recommended changes — pricing, outreach, "
        "content and follow-up — not these illustrative examples.", s_caption))

    flow.append(PageBreak())

    # ── 8. Business Growth Calculators ──
    flow += section("8. Business Growth Calculators — Sample Output")
    flow.append(Paragraph(
        "Your audit includes access to three interactive calculators. Run with Jordan's numbers, here's what "
        "they surface:", s_body))

    flow.append(Paragraph("Revenue Goal Calculator", s_h3))
    flow.append(table([
        [Paragraph("Input", s_tcellB), Paragraph("Value", s_tcellB), Paragraph("Output", s_tcellB)],
        [Paragraph("Monthly revenue goal", s_tcell), Paragraph("$10,000", s_tcell), Paragraph("Gap to close: $5,800/mo", s_tcell)],
        [Paragraph("Price per engagement", s_tcell), Paragraph("$800", s_tcell), Paragraph("Needs ~12.5 clients/mo at current price", s_tcell)],
        [Paragraph("At recommended +15% price", s_tcell), Paragraph("$920", s_tcell), Paragraph("Needs ~10.9 clients/mo — 2 fewer sales needed", s_tcell)],
    ], col_widths=[1.9 * inch, 1.1 * inch, PAGE_W - 2 * MX - 3.0 * inch]))

    flow.append(Paragraph("Offer Pricing Calculator", s_h3))
    flow.append(table([
        [Paragraph("Input", s_tcellB), Paragraph("Value", s_tcellB), Paragraph("Output", s_tcellB)],
        [Paragraph("Current price", s_tcell), Paragraph("$800", s_tcell), Paragraph("Below category ceiling for this specialty", s_tcell)],
        [Paragraph("Recommended entry offer", s_tcell), Paragraph("$150–200", s_tcell), Paragraph("Lowers first-purchase risk, raises close rate on cold leads", s_tcell)],
        [Paragraph("Recommended core price", s_tcell), Paragraph("$900–950", s_tcell), Paragraph("Within market ceiling once offer is repositioned", s_tcell)],
    ], col_widths=[1.9 * inch, 1.1 * inch, PAGE_W - 2 * MX - 3.0 * inch]))

    flow.append(Paragraph("Client Acquisition Calculator", s_h3))
    flow.append(table([
        [Paragraph("Input", s_tcellB), Paragraph("Value", s_tcellB), Paragraph("Output", s_tcellB)],
        [Paragraph("Current close rate", s_tcell), Paragraph("~40%", s_tcell), Paragraph("31 conversations/mo needed for 12.5 clients", s_tcell)],
        [Paragraph("Close rate with follow-up sequence", s_tcell), Paragraph("~55% (est.)", s_tcell), Paragraph("Same client target from ~23 conversations/mo", s_tcell)],
        [Paragraph("Outreach needed per week", s_tcell), Paragraph("20 targeted contacts", s_tcell), Paragraph("Matches the 100-day roadmap's Phase 1 target", s_tcell)],
    ], col_widths=[1.9 * inch, 1.1 * inch, PAGE_W - 2 * MX - 3.0 * inch]))
    flow.append(Spacer(1, 10))
    flow.append(Paragraph(
        "These calculators run live on your audit's numbers, not estimates typed in after the call — you can "
        "adjust any input yourself and watch the whole chain move.", s_caption))

    flow.append(Spacer(1, 16))
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
