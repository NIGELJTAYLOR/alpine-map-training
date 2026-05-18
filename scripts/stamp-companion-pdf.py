#!/usr/bin/env python3
"""
Stamp the Alpine Map Training app URL onto every page of the companion
manual PDF, and add a more prominent button on the cover page.

  - Footer (every page): a short red label preceded by a small return
    arrow icon. The whole footer is a clickable PDF link.
  - Cover (page 1 only): a red "Open the interactive app" button sat
    in the top-right corner over the hero photo.

Both clickable areas use real PDF link annotations pointing to:

    https://alpine-map-training.vercel.app/

Usage:
    python3 scripts/stamp-companion-pdf.py [--input PATH] [--output PATH]

By default, reads the pristine source PDF from the project root
(Alpine_Map_Training_Workbook_v2.pdf) and writes the stamped copy to
public/companion-manual/Alpine_Map_Training_Companion_Manual.pdf.
The source is never modified, so the script can be re-run safely.

Requires:
    pip install pypdf reportlab
"""

from __future__ import annotations

import argparse
import io
import os
import shutil
import sys
import tempfile

from pypdf import PdfReader, PdfWriter
from pypdf.annotations import Link
from pypdf.generic import RectangleObject
from reportlab.lib.colors import HexColor
from reportlab.pdfgen import canvas

APP_URL = "https://alpine-map-training.vercel.app/"
FOOTER_LABEL = "Open the interactive Alpine Training App"

RED = HexColor("#D7263D")
WHITE = HexColor("#FFFFFF")

# Footer layout (PDF coordinates: bottom-left origin, units = points)
FOOTER_RULE_Y = 44          # y of the thin red rule above the link
FOOTER_TEXT_Y = 22          # baseline of the link text
FOOTER_ICON_SIZE = 11       # square bounding box for the return arrow
FOOTER_ICON_GAP = 6         # space between icon and text
FOOTER_RECT_PADDING = 6     # padding around clickable rectangle

# Cover button layout
COVER_BUTTON_W = 240
COVER_BUTTON_H = 44
COVER_BUTTON_MARGIN = 30    # from page top and right edges


def draw_return_arrow(c, x, y, size, color):
    """
    Draw a return-key style arrow icon whose bounding box has its
    bottom-left at (x, y) and is `size` wide and tall. The icon is
    drawn in `color` with a strong stroke so it reads at small sizes.
    """
    c.saveState()
    c.setStrokeColor(color)
    c.setFillColor(color)
    c.setLineWidth(1.3)
    c.setLineCap(1)   # round caps
    c.setLineJoin(1)  # round joins

    # The shape:
    #
    #         ┌───
    #         │
    #    ◀────┘
    #
    # An L-bend descending from upper-right, then a leftward arrow at
    # the bottom.
    top_y = y + size * 0.85
    mid_y = y + size * 0.30
    right_x = x + size * 0.85
    arrow_tip_x = x + size * 0.05
    arrow_back_x = x + size * 0.35

    # Top of the L (short horizontal stub leading into the corner)
    c.line(right_x - size * 0.15, top_y, right_x, top_y)
    # Down the right side
    c.line(right_x, top_y, right_x, mid_y)
    # Left along the bottom, stopping before the arrowhead
    c.line(right_x, mid_y, arrow_back_x, mid_y)

    # Filled triangular arrowhead pointing left
    p = c.beginPath()
    p.moveTo(arrow_tip_x, mid_y)
    p.lineTo(arrow_back_x, mid_y + size * 0.22)
    p.lineTo(arrow_back_x, mid_y - size * 0.22)
    p.close()
    c.drawPath(p, stroke=0, fill=1)

    c.restoreState()


def make_overlay(page_w: float, page_h: float, is_cover: bool) -> PdfReader:
    """Generate a one-page PDF overlay matching the source page size."""
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=(page_w, page_h))

    # ----- Footer on every page -----
    # Thin red rule sits above the link content. Both rule and link are
    # higher off the bottom edge than v1 so they have breathing room.
    c.setStrokeColor(RED)
    c.setLineWidth(0.6)
    c.line(36, FOOTER_RULE_Y, page_w - 36, FOOTER_RULE_Y)

    # Measure the label so we can centre [icon] [gap] [text] as a block.
    label_font = "Helvetica-Bold"
    label_size = 9
    label_w = c.stringWidth(FOOTER_LABEL, label_font, label_size)
    total_w = FOOTER_ICON_SIZE + FOOTER_ICON_GAP + label_w
    block_x = (page_w - total_w) / 2
    icon_x = block_x
    icon_y = FOOTER_TEXT_Y - 1  # nudge icon down so it visually aligns
    text_x = block_x + FOOTER_ICON_SIZE + FOOTER_ICON_GAP

    draw_return_arrow(c, icon_x, icon_y, FOOTER_ICON_SIZE, RED)

    c.setFillColor(RED)
    c.setFont(label_font, label_size)
    c.drawString(text_x, FOOTER_TEXT_Y, FOOTER_LABEL)

    # ----- Cover button: top right corner -----
    if is_cover:
        bx = page_w - COVER_BUTTON_W - COVER_BUTTON_MARGIN
        by = page_h - COVER_BUTTON_H - COVER_BUTTON_MARGIN
        c.setFillColor(RED)
        c.setStrokeColor(RED)
        c.roundRect(bx, by, COVER_BUTTON_W, COVER_BUTTON_H, 3, stroke=0, fill=1)

        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 13)
        c.drawCentredString(
            page_w - COVER_BUTTON_W / 2 - COVER_BUTTON_MARGIN,
            by + COVER_BUTTON_H / 2 + 4,
            "OPEN THE INTERACTIVE APP",
        )
        c.setFont("Helvetica", 8)
        c.drawCentredString(
            page_w - COVER_BUTTON_W / 2 - COVER_BUTTON_MARGIN,
            by + COVER_BUTTON_H / 2 - 10,
            "alpine-map-training.vercel.app",
        )

    c.save()
    buf.seek(0)
    return PdfReader(buf)


def add_url_link(writer: PdfWriter, page_index: int, rect: RectangleObject):
    annotation = Link(rect=rect, url=APP_URL)
    writer.add_annotation(page_number=page_index, annotation=annotation)


def main():
    here = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.normpath(os.path.join(here, ".."))
    default_input = os.path.join(
        project_root, "Alpine_Map_Training_Workbook_v2.pdf"
    )
    default_output = os.path.join(
        project_root,
        "public",
        "companion-manual",
        "Alpine_Map_Training_Companion_Manual.pdf",
    )

    parser = argparse.ArgumentParser()
    parser.add_argument("--input", default=default_input)
    parser.add_argument("--output", default=default_output)
    args = parser.parse_args()

    src_path = os.path.abspath(args.input)
    if not os.path.exists(src_path):
        print(f"[stamp-pdf] input not found: {src_path}", file=sys.stderr)
        sys.exit(1)
    out_path = os.path.abspath(args.output)

    print(f"[stamp-pdf] reading {src_path}")
    reader = PdfReader(src_path)
    writer = PdfWriter()

    total = len(reader.pages)
    for i, page in enumerate(reader.pages):
        mb = page.mediabox
        page_w = float(mb.width)
        page_h = float(mb.height)
        is_cover = i == 0

        overlay = make_overlay(page_w, page_h, is_cover)
        page.merge_page(overlay.pages[0])
        writer.add_page(page)

        # Clickable rect over the footer block.
        footer_left = 36
        footer_right = page_w - 36
        footer_bottom = FOOTER_TEXT_Y - FOOTER_RECT_PADDING
        footer_top = FOOTER_TEXT_Y + 11 + FOOTER_RECT_PADDING
        footer_rect = RectangleObject(
            (footer_left, footer_bottom, footer_right, footer_top)
        )
        add_url_link(writer, i, footer_rect)

        # Cover button click rect on top of the visible button.
        if is_cover:
            bx = page_w - COVER_BUTTON_W - COVER_BUTTON_MARGIN
            by = page_h - COVER_BUTTON_H - COVER_BUTTON_MARGIN
            button_rect = RectangleObject(
                (bx, by, bx + COVER_BUTTON_W, by + COVER_BUTTON_H)
            )
            add_url_link(writer, i, button_rect)

    # Write to a temp file first so a mid-write failure does not nuke
    # the output PDF.
    tmp_fd, tmp_path = tempfile.mkstemp(suffix=".pdf")
    os.close(tmp_fd)
    try:
        with open(tmp_path, "wb") as fh:
            writer.write(fh)
        os.makedirs(os.path.dirname(out_path), exist_ok=True)
        shutil.move(tmp_path, out_path)
    finally:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)

    out_size = os.path.getsize(out_path)
    print(
        f"[stamp-pdf] wrote {out_path} ({total} pages, "
        f"{out_size/1_000_000:.1f} MB)"
    )


if __name__ == "__main__":
    main()
