from lib import *; import diagrams as d
names=['road_so_far','why_ladder','sunrise','income_types','leaky_bucket','iceberg','three_models','ladder_stairs','persona','bridge','price_steps','offer_stack','story_lesson_cta','content_grid','reach_compare','launch_path','one_percent','clock_ring','mindsets','traffic','roadmap_glance']
body=''.join(f'<div class="fig" style="margin-bottom:14px"><div class="cap">{n}</div>{getattr(d,n)()}</div>' for n in names)
open('/tmp/gallery.html','w').write(page_html(body))
