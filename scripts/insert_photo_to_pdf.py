"""
Insert resume photo + rebuild header + fix bio text.

Changes:
  - Photo: resume_avatar.jpg (1:1), top-aligned with name & subtitle
  - Subtitle: "MOBILE DEVELOPER" (removed "Senior")
  - Bio: remove "(Next.js, NestJS, PostgreSQL)" phrase
"""
import fitz
import io, shutil, os

PHOTO_PATH = "/Users/thang/Downloads/resume_avatar.jpg"
PDF_BAK    = "/Users/thang/Development/thangvq-digital-hub/public/resume.pdf.bak"
PDF_IN     = "/Users/thang/Development/thangvq-digital-hub/public/resume.pdf"
PDF_TEMP   = PDF_IN + ".tmp"

# ── 1. Restore backup ─────────────────────────────────────────────────────────
shutil.copy(PDF_BAK, PDF_IN)
print("Restored backup PDF")

# ── 2. Load photo as-is ───────────────────────────────────────────────────────
with open(PHOTO_PATH, "rb") as f:
    img_bytes = f.read()
print(f"Photo loaded: {len(img_bytes)} bytes")

# ── 3. Open PDF ───────────────────────────────────────────────────────────────
doc = fitz.open(PDF_IN)
page = doc[0]

# Known layout from PDF inspection:
# Bio box:   Rect(39.68, 112.39, 555.59, 196.27)
# Bio light bg fill: (0.9725, 0.9804, 0.9882)
# Bio teal:  (0.051, 0.580, 0.533)  — left border strip ~4pt wide
# Text left: x=53.2   Text right: x=545.1

# Photo: 1:1, aligned to left margin x=39.7
PHOTO_X0   = 39.7
PHOTO_Y0   = 18.0
PHOTO_SIZE = 80.0          # square 1:1
PHOTO_X1   = PHOTO_X0 + PHOTO_SIZE
PHOTO_Y1   = PHOTO_Y0 + PHOTO_SIZE  # = 98

TEXT_X = PHOTO_X1 + 13.0  # text starts right after photo + gap

# ── A: Blank header area (safe margin above bio box) ─────────────────────────
page.draw_rect(fitz.Rect(18, 12, 440, 108),
               color=(1, 1, 1), fill=(1, 1, 1))

# ── B: Insert photo ───────────────────────────────────────────────────────────
page.insert_image(
    fitz.Rect(PHOTO_X0, PHOTO_Y0, PHOTO_X1, PHOTO_Y1),
    stream=img_bytes,
    keep_proportion=True,
)

# ── C: "Thang Vu" — TOP-aligned (baseline ≈ PHOTO_Y0 + cap-height)
#    Cap height for 25pt helv ≈ 18pt → baseline at ~36–38
page.insert_text(
    fitz.Point(TEXT_X, 38),
    "Thang Vu",
    fontsize=25,
    fontname="helv",
    color=(0.1, 0.1, 0.1),
)

# ── D: "MOBILE DEVELOPER" — teal, just below name (38 + ~18 gap = 56)
page.insert_text(
    fitz.Point(TEXT_X, 57),
    "MOBILE DEVELOPER",
    fontsize=10.5,
    fontname="helv",
    color=(0.0, 0.59, 0.53),
)

# ── 4. Fix bio text ───────────────────────────────────────────────────────────
# Bio box exact coords from PDF inspection:
BIO_RECT = fitz.Rect(39.68, 112.39, 555.59, 196.27)

# Step A: blank bio text area only (keep drawings intact — they render above white anyway)
# Actually we need to blank the entire box and redraw everything
page.draw_rect(BIO_RECT, color=(1, 1, 1), fill=(1, 1, 1))

# Step B: Redraw light background
page.draw_rect(BIO_RECT,
               color=None,
               fill=(0.9725, 0.9804, 0.9882))

# Step C: Redraw teal left border strip (~4pt wide)
teal_border = fitz.Rect(BIO_RECT.x0, BIO_RECT.y0,
                         BIO_RECT.x0 + 4.0, BIO_RECT.y1)
page.draw_rect(teal_border, color=None, fill=(0.051, 0.580, 0.533))

# Step D: Rewrite bio text (removed "(Next.js, NestJS, PostgreSQL)")
NEW_BIO = (
    "Dedicated tech innovator with 9+ years of experience in Mobile Development "
    "(Flutter/Android) and a proven track record of driving core app architecture "
    "at fast-growing startups. Highly proficient in leveraging cutting-edge "
    "Autonomous Software Engineering (ASE) workflows to rapidly prototype full-cycle "
    "web and backend solutions. Combines deep mobile expertise orchestrated via "
    "advanced AI agents to deliver scalable products efficiently."
)

bio_text_rect = fitz.Rect(53.2, 119.0, 545.1, 194.0)
page.insert_textbox(
    bio_text_rect,
    NEW_BIO,
    fontsize=9.5,
    fontname="helv",
    color=(0.15, 0.15, 0.15),
    align=fitz.TEXT_ALIGN_JUSTIFY,
)

# ── 5. Save ───────────────────────────────────────────────────────────────────
doc.save(PDF_TEMP, incremental=False, encryption=fitz.PDF_ENCRYPT_NONE)
doc.close()
os.replace(PDF_TEMP, PDF_IN)
print("✅ Saved to", PDF_IN)
