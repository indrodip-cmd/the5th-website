# Wikidata / entity data — The5th Consulting & Indrodip Ghosh

Ready-to-submit data to create Wikidata items so Google's Knowledge Graph and AI
assistants recognise the brand + founder as an entity and link every profile.

- Create items at: https://www.wikidata.org/wiki/Special:NewItem (guided UI)
- Or batch-import via QuickStatements: https://quickstatements.toolforge.org/
  (needs a Wikidata account; paste the blocks below — fields are TAB-separated).
- **Do the Person first**, note its Q-id (e.g. `Q123…`), then create the
  Organization and set "founded by" = that Q-id (and vice-versa).

Property IDs (P…) are stable. Item values (Q…) are my best match — **verify each
Q-id** by searching wikidata.org (the label is given next to it). String/URL/ID
values are exact.

---

## 1) Person — Indrodip Ghosh

**Label (en):** Indrodip Ghosh
**Description (en):** Marketing and growth consultant; founder of The5th Consulting
**Aliases (en):** Indradip Ghosh; Indrodip

| Property | P-id | Value |
| --- | --- | --- |
| instance of | P31 | human — `Q5` |
| sex or gender | P21 | male — `Q6581097` *(confirm)* |
| occupation | P106 | entrepreneur — `Q131524` |
| occupation | P106 | businessperson — `Q43845` |
| occupation | P106 | consultant — `Q1162163` *(verify)* |
| official website | P856 | `https://the5th.consulting/` |
| Facebook ID | P2013 | `withindrodip` |
| LinkedIn personal profile ID | P6634 | `marketing-growth-consultant` |
| employer / owner of | P108 / P1830 | The5th Consulting (its Q-id, once created) |
| country of citizenship | P27 | *(fill in, e.g. India `Q668`)* |

### QuickStatements — Person
```
CREATE
LAST	Len	"Indrodip Ghosh"
LAST	Den	"Marketing and growth consultant; founder of The5th Consulting"
LAST	Aen	"Indradip Ghosh"
LAST	P31	Q5
LAST	P106	Q131524
LAST	P106	Q43845
LAST	P856	"https://the5th.consulting/"
LAST	P2013	"withindrodip"
LAST	P6634	"marketing-growth-consultant"
```

---

## 2) Organization — The5th Consulting

**Label (en):** The5th Consulting
**Description (en):** Business consulting company helping coaches and consultants turn expertise into a premium business
**Aliases (en):** The5th; The5th Consulting & 10K Roadmap; 10K Roadmap

| Property | P-id | Value |
| --- | --- | --- |
| instance of | P31 | company — `Q783794` *(or "consulting firm" — verify)* |
| industry | P452 | management consulting — `Q192376` *(verify)* |
| founded by | P112 | Indrodip Ghosh (Person Q-id from step 1) |
| official website | P856 | `https://the5th.consulting/` |
| Instagram username | P2003 | `the5thconsulting` |
| Spotify show ID | P11625 | `033AYgOaBgPXGTAlNfLJfn` *(verify property id)* |
| inception | P571 | *(founding year, if known)* |
| country | P17 | *(fill in)* |

### QuickStatements — Organization
```
CREATE
LAST	Len	"The5th Consulting"
LAST	Den	"Business consulting company helping coaches and consultants turn expertise into a premium business"
LAST	Aen	"The5th"
LAST	P31	Q783794
LAST	P856	"https://the5th.consulting/"
LAST	P2003	"the5thconsulting"
LAST	P112	PERSON_QID   # replace with Indrodip Ghosh's Q-id
```

---

## References (important)
Wikidata prefers each statement to have a **reference**. Add "reference URL" (P854)
= the source that supports it. Good sources here:
- https://the5th.consulting/about (founder, brand)
- https://www.linkedin.com/in/marketing-growth-consultant/
- Any press: Forbes / The Guardian / HuffPost / TEDx / Yahoo Finance mentions
- The5th Podcast on Spotify

**Notability:** Wikidata accepts entities describable with *serious, public
references*. The website + LinkedIn + podcast + press mentions should qualify; the
more independent press/citations you can reference, the safer it is from deletion.

## Also worth claiming (same facts → entity consistency)
Use the exact same name/URL/handles everywhere so search engines and AI merge them:
- Google Business Profile · Bing Places
- Crunchbase · LinkedIn Company Page
- Google Knowledge Panel "claim" (once it appears)
