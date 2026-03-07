from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, PageBreak, Preformatted

ROOT = Path(r"C:\Users\Administrator\Documents\Playground\avrxt-in")
REPORT_MD = ROOT / "ANALYSIS_REPORT_codex_v3fix.md"
LINT_JSON = ROOT / "lint-report.json"
AUDIT_JSON = ROOT / "audit-report.json"
OUT_PDF = ROOT / "output" / "pdf" / "avrxt-in-codex-v3fix-full-report.pdf"


def clean_text(text: str) -> str:
    # Keep output broadly ASCII-safe for predictable PDF rendering.
    text = text.replace("\u2013", "-").replace("\u2014", "-").replace("\u2019", "'")
    text = text.replace("\u2018", "'").replace("\u201c", '"').replace("\u201d", '"')
    return text.encode("ascii", "replace").decode("ascii")


def read_text_robust(path: Path) -> str:
    raw = path.read_bytes()
    for enc in ("utf-8", "utf-8-sig", "utf-16", "utf-16-le", "utf-16-be", "cp1252", "latin-1"):
        try:
            return raw.decode(enc)
        except UnicodeDecodeError:
            continue
    return raw.decode("utf-8", errors="replace")


def on_page(canvas, doc):
    canvas.saveState()
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(colors.HexColor("#666666"))
    canvas.drawRightString(A4[0] - 20 * mm, 12 * mm, f"Page {canvas.getPageNumber()}")
    canvas.drawString(20 * mm, 12 * mm, "avrxt-in | codex/v3fix | Full Analysis Report")
    canvas.restoreState()


def md_to_story(md_text: str, styles: dict) -> list:
    story = []
    for raw in md_text.splitlines():
        line = clean_text(raw.rstrip())
        if not line.strip():
            story.append(Spacer(1, 4))
            continue
        if line.startswith("# "):
            story.append(Paragraph(escape(line[2:]), styles["h1"]))
            story.append(Spacer(1, 6))
        elif line.startswith("## "):
            story.append(Paragraph(escape(line[3:]), styles["h2"]))
            story.append(Spacer(1, 4))
        elif line.startswith("### "):
            story.append(Paragraph(escape(line[4:]), styles["h3"]))
            story.append(Spacer(1, 3))
        elif line.startswith("- "):
            bullet = clean_text(line[2:])
            story.append(Paragraph(f"- {escape(bullet)}", styles["body"]))
        elif line.startswith("1. ") or line.startswith("2. ") or line.startswith("3. ") or line.startswith("4. ") or line.startswith("5. ") or line.startswith("6. ") or line.startswith("7. ") or line.startswith("8. ") or line.startswith("9. "):
            story.append(Paragraph(escape(line), styles["body"]))
        else:
            story.append(Paragraph(escape(line), styles["body"]))
    return story


def lint_appendix(story: list, styles: dict):
    lint = json.loads(read_text_robust(LINT_JSON))
    issues = []
    for file_entry in lint:
        file_path = file_entry.get("filePath", "")
        for m in file_entry.get("messages", []):
            issues.append(
                {
                    "file": file_path,
                    "line": m.get("line", 0),
                    "col": m.get("column", 0),
                    "severity": "error" if m.get("severity", 1) == 2 else "warning",
                    "rule": m.get("ruleId") or "(no-rule)",
                    "message": clean_text(m.get("message", "")),
                }
            )

    rule_counts: dict[str, int] = {}
    for i in issues:
        rule_counts[i["rule"]] = rule_counts.get(i["rule"], 0) + 1

    story.append(PageBreak())
    story.append(Paragraph("Appendix A - Complete ESLint Findings", styles["h1"]))
    story.append(Paragraph(f"Total findings: {len(issues)}", styles["body"]))
    story.append(Spacer(1, 6))

    story.append(Paragraph("A.1 Rule Counts", styles["h2"]))
    for rule, count in sorted(rule_counts.items(), key=lambda x: (-x[1], x[0])):
        story.append(Paragraph(escape(f"- {rule}: {count}"), styles["mono"]))

    story.append(Spacer(1, 8))
    story.append(Paragraph("A.2 File-by-file Findings", styles["h2"]))

    for i, item in enumerate(issues, 1):
        rel = item["file"].replace(str(ROOT) + "\\", "")
        line = f"{i}. [{item['severity'].upper()}] {rel}:{item['line']}:{item['col']} | {item['rule']} | {item['message']}"
        story.append(Paragraph(escape(clean_text(line)), styles["mono"]))


def audit_appendix(story: list, styles: dict):
    audit = json.loads(read_text_robust(AUDIT_JSON))
    vulns = audit.get("vulnerabilities", {})
    meta = audit.get("metadata", {}).get("vulnerabilities", {})

    story.append(PageBreak())
    story.append(Paragraph("Appendix B - npm audit Vulnerability Inventory", styles["h1"]))
    summary = (
        f"Total={meta.get('total', 0)}, Critical={meta.get('critical', 0)}, "
        f"High={meta.get('high', 0)}, Moderate={meta.get('moderate', 0)}, Low={meta.get('low', 0)}"
    )
    story.append(Paragraph(escape(clean_text(summary)), styles["body"]))
    story.append(Spacer(1, 8))

    for name in sorted(vulns.keys()):
        v = vulns[name]
        sev = v.get("severity", "unknown")
        direct = v.get("isDirect", False)
        rng = clean_text(str(v.get("range", "")))
        header = f"- {name} | severity={sev} | direct={direct} | range={rng}"
        story.append(Paragraph(escape(header), styles["mono"]))


def build_pdf():
    OUT_PDF.parent.mkdir(parents=True, exist_ok=True)

    styles = getSampleStyleSheet()
    custom = {
        "h1": ParagraphStyle(
            "h1_custom",
            parent=styles["Heading1"],
            fontName="Helvetica-Bold",
            fontSize=16,
            leading=20,
            textColor=colors.HexColor("#111111"),
            spaceAfter=6,
        ),
        "h2": ParagraphStyle(
            "h2_custom",
            parent=styles["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=12,
            leading=15,
            textColor=colors.HexColor("#222222"),
            spaceAfter=4,
        ),
        "h3": ParagraphStyle(
            "h3_custom",
            parent=styles["Heading3"],
            fontName="Helvetica-Bold",
            fontSize=10,
            leading=13,
            textColor=colors.HexColor("#333333"),
            spaceAfter=3,
        ),
        "body": ParagraphStyle(
            "body_custom",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=9.5,
            leading=13,
            textColor=colors.HexColor("#111111"),
            spaceAfter=2,
        ),
        "mono": ParagraphStyle(
            "mono_custom",
            parent=styles["BodyText"],
            fontName="Courier",
            fontSize=8,
            leading=10,
            textColor=colors.HexColor("#111111"),
            spaceAfter=1,
        ),
    }

    story = []
    story.append(Paragraph("avrxt-in Full Analysis Report", custom["h1"]))
    story.append(Paragraph("Branch: codex/v3fix", custom["body"]))
    story.append(Paragraph(f"Generated: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}", custom["body"]))
    story.append(Spacer(1, 10))

    md_text = read_text_robust(REPORT_MD)
    story.extend(md_to_story(md_text, custom))

    lint_appendix(story, custom)
    audit_appendix(story, custom)

    doc = SimpleDocTemplate(
        str(OUT_PDF),
        pagesize=A4,
        leftMargin=18 * mm,
        rightMargin=18 * mm,
        topMargin=16 * mm,
        bottomMargin=18 * mm,
        title="avrxt-in Full Analysis Report",
        author="Codex",
        subject="Static analysis and manual review report",
    )
    doc.build(story, onFirstPage=on_page, onLaterPages=on_page)

    print(str(OUT_PDF))


if __name__ == "__main__":
    build_pdf()
