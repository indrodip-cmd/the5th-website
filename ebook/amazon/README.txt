Expertise to Income: Amazon KDP package
Open KDP-listing.md first. It has every field to paste, the pricing table and the upload checklist.

Kindle:     expertise-to-income.epub + kindle-cover-1600x2560.jpg
Paperback:  paperback-interior-7x10.pdf + paperback-cover-wrap.pdf (cover-specs.txt has the maths)

Rebuild (if the book text changes): see ebook/ in the repository.
  AMAZON=1 PRINT=1 python3 build.py  (paperback interior)
  python3 epub.py                    (Kindle edition)
If the paperback page count changes, the spine width in the cover must be recalculated.
