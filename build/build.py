#!/usr/bin/env python3
"""
Static-site generator for the At Home In Leander rebuild.

Migrates every page + post from the live WordPress site
(https://athomeinleander.com) into a modern, self-contained static HTML
site under ../public. Downloads in-content images and PDFs so the result
no longer depends on WordPress.

Usage:  python3 build/build.py
"""

import gzip
import html
import os
import re
import ssl
import sys
import urllib.request
import urllib.parse
from io import BytesIO

BASE = "https://athomeinleander.com"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC = os.path.join(ROOT, "public")
IMG_DIR = os.path.join(PUBLIC, "assets", "img")
DOC_DIR = os.path.join(PUBLIC, "assets", "docs")

PHONE = "(512) 785-5050"
PHONE_TEL = "+15127855050"
EMAIL = "Betty@BettySellsAustin.com"   # public agent contact
EXP = "https://bettysaenz.exprealty.com/contact.php"

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/120 Safari/537.36")
_ctx = ssl.create_default_context()
_downloaded = {}   # remote url -> local /assets path
_fetch_cache = {}


# --------------------------------------------------------------------------- #
#  HTTP helpers
# --------------------------------------------------------------------------- #
def fetch(url):
    if url in _fetch_cache:
        return _fetch_cache[url]
    req = urllib.request.Request(url, headers={
        "User-Agent": UA, "Accept-Encoding": "gzip", "Accept": "*/*"})
    with urllib.request.urlopen(req, context=_ctx, timeout=45) as r:
        data = r.read()
        if r.headers.get("Content-Encoding") == "gzip":
            data = gzip.GzipFile(fileobj=BytesIO(data)).read()
    text = data.decode("utf-8", "ignore")
    _fetch_cache[url] = text
    return text


def fetch_bytes(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, context=_ctx, timeout=60) as r:
        return r.read()


def download_asset(url):
    """Download an uploads image/pdf into /assets and return its local path."""
    url = html.unescape(url).split("?")[0]
    if url.startswith("//"):
        url = "https:" + url
    if url in _downloaded:
        return _downloaded[url]
    m = re.search(r"/uploads/(.+)$", url)
    if not m:
        return None
    flat = m.group(1).replace("/", "-")
    is_pdf = flat.lower().endswith(".pdf")
    dest_dir = DOC_DIR if is_pdf else IMG_DIR
    web = "/assets/docs/" if is_pdf else "/assets/img/"
    local_fs = os.path.join(dest_dir, flat)
    local_web = web + flat
    if not os.path.exists(local_fs):
        try:
            data = fetch_bytes(url)
            with open(local_fs, "wb") as f:
                f.write(data)
        except Exception as e:               # noqa: BLE001
            print("  ! image skip", url, e)
            _downloaded[url] = None
            return None
    _downloaded[url] = local_web
    return local_web


# --------------------------------------------------------------------------- #
#  HTML extraction / cleaning
# --------------------------------------------------------------------------- #
def balanced_div(src, start):
    """Given index of a `<div`, return (inner_html, end_index_after_close)."""
    open_end = src.index(">", start) + 1
    depth = 1
    i = open_end
    tag = re.compile(r"<(/?)div\b", re.I)
    while depth and i < len(src):
        m = tag.search(src, i)
        if not m:
            break
        depth += -1 if m.group(1) else 1
        i = m.end()
    close_start = src.rfind("<", open_end, i)
    return src[open_end:close_start], i


def extract_entry(html_text):
    """Return (title, content_html) from a WordPress page."""
    title = None
    mt = re.search(r'<h1[^>]*class="[^"]*entry-title[^"]*"[^>]*>(.*?)</h1>',
                   html_text, re.S)
    if mt:
        title = html.unescape(re.sub(r"<[^>]+>", "", mt.group(1))).strip()
    if not title:
        mt = re.search(r"<title>(.*?)</title>", html_text, re.S)
        if mt:
            title = html.unescape(mt.group(1)).split(" - At Home")[0].strip()

    mc = re.search(r'<div[^>]*class="[^"]*entry-content[^"]*"', html_text)
    if mc:
        content, _ = balanced_div(html_text, mc.start())
    else:
        content = ""
    return title or "At Home In Leander", clean_content(content)


def clean_content(c):
    # Drop scripts, styles, noscript, and known WP widgets/boilerplate.
    c = re.sub(r"<script\b.*?</script>", "", c, flags=re.S | re.I)
    c = re.sub(r"<style\b.*?</style>", "", c, flags=re.S | re.I)
    c = re.sub(r"<noscript\b.*?</noscript>", "", c, flags=re.S | re.I)
    for cls in ("sharedaddy", "jp-relatedposts", "addtoany",
                "saboxplugin", "sd-sharing", "wpcnt", "code-block"):
        c = re.sub(r'<div[^>]*class="[^"]*%s[^"]*".*?</div>' % cls,
                   "", c, flags=re.S | re.I)
    c = re.sub(r"Notice:\s*JavaScript is required for this content\.?",
               "", c, flags=re.I)
    c = re.sub(r"\[gravityform[^\]]*\]", "", c, flags=re.I)
    # Rewrite links + assets.
    c = rewrite_links(c)
    c = rewrite_images(c)
    # Tidy empties.
    c = re.sub(r"<p>(\s|&nbsp;|<br\s*/?>)*</p>", "", c, flags=re.I)
    c = re.sub(r"\n{3,}", "\n\n", c)
    return c.strip()


def to_local_path(url):
    """Normalize an internal athomeinleander URL to a root-relative path."""
    p = urllib.parse.urlparse(url)
    path = p.path
    if not path or path == "/":
        return "/"
    if "." in path.rsplit("/", 1)[-1]:      # a file (pdf/img) — leave to caller
        return None
    path = "/" + path.strip("/") + "/"
    if p.fragment:
        path += "#" + p.fragment
    return path


def rewrite_links(c):
    def repl(m):
        url = m.group(1)
        low = url.lower()
        if "athomeinleander.com" in low:
            if "/uploads/" in low:           # a document/image link
                local = download_asset(url)
                return 'href="%s"' % (local or url)
            local = to_local_path(url)
            if local:
                return 'href="%s"' % local
        return m.group(0)
    return re.sub(r'href="([^"]+)"', repl, c)


def rewrite_images(c):
    # Strip responsive attrs we can't satisfy locally.
    c = re.sub(r'\ssrcset="[^"]*"', "", c)
    c = re.sub(r'\ssizes="[^"]*"', "", c)
    c = re.sub(r'\s(?:data-[\w-]+|loading|decoding|fetchpriority)="[^"]*"',
               "", c)

    def repl(m):
        url = m.group(1)
        if "/uploads/" in url:
            local = download_asset(url)
            if local:
                return 'src="%s"' % local
        return m.group(0)
    return re.sub(r'src="([^"]+)"', repl, c)


# --------------------------------------------------------------------------- #
#  Template
# --------------------------------------------------------------------------- #
NAV = """
<ul class="menu" id="primary-menu">
  <li class="has-sub"><a href="/homes-for-sale/">Featured Homes</a>
    <ul>
      <li class="has-sub"><a href="/homes-for-sale/">Homes For Sale</a>
        <ul>
          <li><a href="/1826-tall-chief-leander-tx/">1826 Tall Chief &ndash; Leander, TX</a></li>
          <li><a href="/607-thrush-dr-leander-tx-78641/">607 Thrush Dr. Leander TX</a></li>
        </ul>
      </li>
      <li class="has-sub"><a href="/sold-homes/">Sold Homes</a>
        <ul>
          <li><a href="/751-silver-creek-drive-leander-texas-78641/">751 Silver Creek Drive</a></li>
          <li><a href="/605-thrush-drive-leander-tx-78641/">605 Thrush Drive</a></li>
          <li><a href="/513-sparkling-brook-ln-leander-tx-78641/">513 Sparkling Brook Ln</a></li>
        </ul>
      </li>
    </ul>
  </li>
  <li class="has-sub"><a href="/leander-texas-info/">Leander, Texas Info</a>
    <ul>
      <li class="has-sub"><a href="/history-of-leander/">History of Leander</a>
        <ul>
          <li><a href="/history-of-leander/bagdad/">Bagdad</a></li>
          <li><a href="/history-of-leander/dino-tracks/">Dinosaur Tracks</a></li>
        </ul>
      </li>
      <li><a href="/future-of-leander/">Future of Leander</a></li>
      <li><a href="/future-of-leander/new-construction/">New Homes In Leander</a></li>
      <li><a href="/leander-neighborhoods/">Neighborhoods</a></li>
      <li class="has-sub"><a href="/resources/">Resources</a>
        <ul>
          <li><a href="/leander-tx-schools/">Schools</a></li>
          <li><a href="/leander-tx-groceries-organic-foods/">Groceries &ndash; Organic Foods</a></li>
          <li><a href="/restaurants-leander-tx/">Restaurants</a></li>
          <li><a href="/dog-friendly-places/">Dog-Friendly Places</a></li>
          <li><a href="/leander-tx-hardware-and-lumber-stores/">Hardware &amp; Lumber Stores</a></li>
        </ul>
      </li>
    </ul>
  </li>
  <li><a href="/about/">About</a></li>
  <li><a href="/contact/">Contact</a></li>
  <li><a href="/search-properties-2/">Search Properties</a></li>
</ul>
"""

SIDEBAR = """
<aside class="sidebar">
  <div class="card agent-card">
    <img src="/assets/img/betty.png" alt="Betty Saenz, REALTOR">
    <h3>Betty Saenz</h3>
    <div class="role">REALTOR&reg; &middot; eXp Realty</div>
    <a class="btn" href="tel:%(tel)s">&#9742; Call / Text</a>
    <a class="btn btn-ghost" href="/contact/">Contact Betty</a>
  </div>
  <div class="card">
    <h4>Explore</h4>
    <ul class="linklist">
      <li><a href="/search-properties-2/">Search Properties</a></li>
      <li><a href="/homes-for-sale/">Homes For Sale</a></li>
      <li><a href="/leander-neighborhoods/">Leander Neighborhoods</a></li>
      <li><a href="/leander-tx-schools/">Leander Schools</a></li>
      <li><a href="/leander-texas-info/">About Leander, TX</a></li>
      <li><a href="/resources/">Local Resources</a></li>
    </ul>
  </div>
</aside>
""" % {"tel": PHONE_TEL}

FOOTER = """
<div class="cta-band">
  <div class="wrap">
    <h2>Thinking about buying or selling in Leander?</h2>
    <p>Betty Saenz knows Leander inside and out. Reach out for local guidance with no pressure.</p>
    <a class="btn btn-lg" href="tel:%(tel)s">&#9742; Call or Text %(phone)s</a>
  </div>
</div>
<footer class="site-footer">
  <div class="wrap footer-grid">
    <div class="footer-brand">
      <img src="/assets/img/logo.png" alt="At Home In Leander">
      <p>Local news, neighborhoods, and homes for sale in Leander, Texas &mdash;
         curated by Betty Saenz, REALTOR&reg; with eXp Realty.</p>
      <p><a href="tel:%(tel)s">&#9742; %(phone)s</a><br>
         <a href="mailto:%(email)s">%(email)s</a></p>
    </div>
    <div>
      <h4>Explore</h4>
      <ul>
        <li><a href="/search-properties-2/">Search Properties</a></li>
        <li><a href="/homes-for-sale/">Homes For Sale</a></li>
        <li><a href="/sold-homes/">Sold Homes</a></li>
        <li><a href="/leander-neighborhoods/">Neighborhoods</a></li>
        <li><a href="/leander-texas-info/">Leander, Texas Info</a></li>
      </ul>
    </div>
    <div>
      <h4>Resources</h4>
      <ul>
        <li><a href="/leander-tx-schools/">Schools</a></li>
        <li><a href="/restaurants-leander-tx/">Restaurants</a></li>
        <li><a href="/dog-friendly-places/">Dog-Friendly Places</a></li>
        <li><a href="/about/">About</a></li>
        <li><a href="/contact/">Contact</a></li>
      </ul>
    </div>
  </div>
  <div class="footer-legal">
    <div class="wrap">
      <span>&copy; %(year)s At Home In Leander &middot; Betty Saenz, REALTOR&reg;, eXp Realty</span>
      <span>
        <a href="/assets/docs/2018-02-IABS-PRINT-Version-pdf.pdf" target="_blank" rel="noopener">Information About Brokerage Services</a> &middot;
        <a href="/assets/docs/2018-02-Consumer-Info.pdf" target="_blank" rel="noopener">Consumer Protection Notice</a>
      </span>
    </div>
  </div>
</footer>
""" % {"tel": PHONE_TEL, "phone": PHONE, "email": EMAIL, "year": 2026}


def page(title, body, description="", canonical=""):
    desc = description or ("Leander, Texas real estate, neighborhoods, schools "
                           "and local info from Betty Saenz, REALTOR.")
    return """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>%(title)s | At Home In Leander</title>
<meta name="description" content="%(desc)s">
<link rel="icon" href="/assets/img/favicon.png" sizes="192x192">
<link rel="apple-touch-icon" href="/assets/img/favicon.png">
<link rel="stylesheet" href="/assets/css/style.css">
</head>
<body>
<div class="topbar">
  <div class="wrap">
    <span class="tb-tag">Leander, Texas Real Estate &amp; Community Guide</span>
    <a class="tb-cta" href="tel:%(tel)s">&#9742; Call / Text %(phone)s</a>
  </div>
</div>
<header class="site-header">
  <div class="wrap header-inner">
    <a class="brand" href="/"><img src="/assets/img/logo.png" alt="At Home In Leander"></a>
    <div class="header-cta">
      <a class="btn btn-ghost" href="/search-properties-2/">Search Homes</a>
      <a class="btn" href="tel:%(tel)s">&#9742; <span class="cta-label">%(phone)s</span></a>
      <button class="nav-toggle" aria-label="Menu" aria-expanded="false"
              aria-controls="primary-menu">&#9776;</button>
    </div>
  </div>
</header>
<nav class="mainnav" aria-label="Primary">
  <div class="wrap">%(nav)s</div>
</nav>
<main id="main">
%(body)s
</main>
%(footer)s
<script src="/assets/js/main.js"></script>
</body>
</html>
""" % {"title": html.escape(title), "desc": html.escape(desc),
       "tel": PHONE_TEL, "phone": PHONE, "nav": NAV, "body": body,
       "footer": FOOTER}


def titleize(slug):
    return slug.replace("-", " ").title()


def breadcrumb(path, title):
    segs = [s for s in path.strip("/").split("/") if s]
    crumbs = ['<a href="/">Home</a>']
    acc = ""
    for i, s in enumerate(segs):
        acc += "/" + s
        label = title if i == len(segs) - 1 else titleize(s)
        if i == len(segs) - 1:
            crumbs.append("<span>%s</span>" % html.escape(label))
        else:
            crumbs.append('<a href="%s/">%s</a>' % (acc, html.escape(label)))
    return " &rsaquo; ".join(crumbs)


def interior(path, title, content, layout="sidebar"):
    head = ('<div class="page-head"><div class="wrap">'
            '<div class="breadcrumbs">%s</div><h1>%s</h1></div></div>'
            % (breadcrumb(path, title), html.escape(title)))
    if layout == "full":
        inner = '<div class="wrap section">%s</div>' % content
    else:
        inner = ('<div class="wrap layout"><div class="content">%s</div>%s</div>'
                 % (content, SIDEBAR))
    return head + inner


def write(path, html_str):
    if path == "/":
        fs = os.path.join(PUBLIC, "index.html")
    else:
        fs = os.path.join(PUBLIC, path.strip("/"), "index.html")
    os.makedirs(os.path.dirname(fs), exist_ok=True)
    with open(fs, "w", encoding="utf-8") as f:
        f.write(html_str)


# --------------------------------------------------------------------------- #
#  Special pages
# --------------------------------------------------------------------------- #
def build_home():
    title, content = extract_entry(fetch(BASE + "/"))
    hero = """
<section class="hero">
  <div class="wrap">
    <span class="eyebrow">Leander &middot; Williamson &amp; Travis County, Texas</span>
    <h1>At Home In Leander</h1>
    <p>Your local guide to homes, neighborhoods, schools and life in one of
       Texas&rsquo; fastest-growing communities.</p>
    <div class="btn-row">
      <a class="btn btn-lg" href="/search-properties-2/">Search Homes for Sale</a>
      <a class="btn btn-lg btn-ghost" href="/contact/" style="color:#fff;border-color:#fff">Contact Betty</a>
    </div>
  </div>
</section>"""
    tiles = """
<section class="section">
  <div class="wrap">
    <div class="eyebrow-c">Explore Leander</div>
    <h2 class="section-title">Everything you need to feel at home</h2>
    <p class="section-sub">From active listings to the story of the town itself,
       here&rsquo;s a place to start.</p>
    <div class="grid cols-4">
      <a class="tile" href="/search-properties-2/"><div class="tile-body">
        <h3>Search Properties</h3><p>Browse the live MLS for homes across Central Texas.</p></div></a>
      <a class="tile" href="/leander-neighborhoods/"><div class="tile-body">
        <h3>Neighborhoods</h3><p>Explore 50+ Leander communities and subdivisions.</p></div></a>
      <a class="tile" href="/leander-texas-info/"><div class="tile-body">
        <h3>Leander, TX Info</h3><p>History, growth, and the future of Leander.</p></div></a>
      <a class="tile" href="/resources/"><div class="tile-body">
        <h3>Local Resources</h3><p>Schools, restaurants, groceries and more.</p></div></a>
    </div>
  </div>
</section>"""
    welcome = ('<section class="section alt"><div class="wrap layout">'
               '<div class="content"><h2>Welcome to Leander, Texas</h2>%s</div>%s'
               '</div></section>' % (content, SIDEBAR))
    write("/", page("Leander TX Real Estate & Community Guide",
                    hero + tiles + welcome,
                    description=("Leander, Texas real estate and community guide "
                                 "by Betty Saenz, REALTOR with eXp Realty. Homes "
                                 "for sale, neighborhoods, schools and local info.")))
    print("  + / (home)")


def build_contact():
    body = """
<div class="contact-methods">
  <div class="contact-card"><div class="ic">&#9742;</div><h3>Call or Text</h3>
    <a href="tel:%(tel)s">%(phone)s</a></div>
  <div class="contact-card"><div class="ic">&#9993;</div><h3>Email</h3>
    <a href="mailto:%(email)s">%(email)s</a></div>
  <div class="contact-card"><div class="ic">&#127968;</div><h3>Brokerage</h3>
    <a href="%(exp)s" target="_blank" rel="noopener">eXp Realty &rsaquo;</a></div>
</div>
<p>Betty Saenz is your resource for Leander, the Austin Metro area and Central
Texas real estate. Whether you&rsquo;re buying, selling, or just have questions
about a neighborhood, reach out any time &mdash; calls and texts are welcome.</p>
<p><a class="btn btn-lg" href="tel:%(tel)s">&#9742; Call or Text %(phone)s</a></p>
""" % {"tel": PHONE_TEL, "phone": PHONE, "email": EMAIL, "exp": EXP}
    write("/contact/", page("Contact Betty Saenz",
          interior("/contact/", "Contact", body, layout="full")))
    print("  + /contact/")


def build_search():
    iframe = ('<iframe src="https://idx.diversesolutions.com/scripts/controls/'
              'Remote-Frame.aspx?MasterAccountID=59157&SearchSetupID=27&LinkID=0'
              '&Height=2000" width="100%" height="2000" frameborder="0" '
              'title="Property Search" loading="lazy"></iframe>')
    body = ('<p>Search all Central Texas MLS listings below &mdash; homes for sale '
            'in Leander, Cedar Park, Georgetown, and the greater Austin area. '
            'Contact <a href="/contact/">Betty Saenz</a> about any property you '
            'find.</p>' + iframe)
    write("/search-properties-2/",
          page("Search Properties",
               interior("/search-properties-2/", "Search Properties", body,
                        layout="full")))
    print("  + /search-properties-2/")


def build_page(url):
    path = urllib.parse.urlparse(url).path
    if path in ("/", "/contact/", "/contact",
                "/search-properties-2/", "/search-properties-2",
                "/blog/", "/blog"):
        return
    try:
        title, content = extract_entry(fetch(url))
    except Exception as e:                    # noqa: BLE001
        print("  ! FAIL", url, e)
        return
    local = to_local_path(url)
    if not local:
        return
    # Neighborhoods hub gets a card grid appended.
    layout = "sidebar"
    write(local, page(title, interior(local, title, content, layout)))
    print("  +", local)


def build_blog(post_urls):
    tiles = []
    for u in post_urls:
        try:
            t, _ = extract_entry(fetch(u))
        except Exception:                     # noqa: BLE001
            continue
        lp = to_local_path(u)
        tiles.append('<a class="tile" href="%s"><div class="tile-body">'
                     '<h3>%s</h3><p>Read more &rsaquo;</p></div></a>'
                     % (lp, html.escape(t)))
    body = ('<div class="grid cols-3">%s</div>' % "".join(tiles)) or "<p>No posts.</p>"
    write("/blog/", page("Leander News & Blog",
          interior("/blog/", "Leander News & Blog", body, layout="full")))
    print("  + /blog/")


# --------------------------------------------------------------------------- #
#  Sitemap
# --------------------------------------------------------------------------- #
def sitemap_urls(name):
    xml = fetch("%s/%s" % (BASE, name))
    return re.findall(r"<loc>([^<]+)</loc>", xml)


def core_assets():
    """Fetch logo, agent photo, favicon, and required TX PDFs up front."""
    mapping = {
        "/wp-content/uploads/2020/05/AtHomeInLeanderHeader.2020png-"
        "e1607816190397.png": "logo.png",
        "/wp-content/uploads/2023/09/BettySidebarLogo2.png": "betty.png",
        "/wp-content/uploads/2020/07/cropped-Screen-Shot-2020-07-29-at-"
        "3.04.48-PM-192x192.png": "favicon.png",
    }
    for src, dest in mapping.items():
        fs = os.path.join(IMG_DIR, dest)
        if not os.path.exists(fs):
            try:
                with open(fs, "wb") as f:
                    f.write(fetch_bytes(BASE + src))
                print("  + asset", dest)
            except Exception as e:            # noqa: BLE001
                print("  ! asset", dest, e)
    for pdf in ("/wp-content/uploads/2018/02/IABS-PRINT-Version-pdf.pdf",
                "/wp-content/uploads/2018/02/Consumer-Info.pdf"):
        download_asset(BASE + pdf)


def main():
    for d in (IMG_DIR, DOC_DIR,
              os.path.join(PUBLIC, "assets", "css"),
              os.path.join(PUBLIC, "assets", "js")):
        os.makedirs(d, exist_ok=True)

    print("Fetching core assets...")
    core_assets()

    pages = sitemap_urls("page-sitemap.xml")
    posts = sitemap_urls("post-sitemap.xml")
    print("Pages: %d  Posts: %d" % (len(pages), len(posts)))

    print("Building special pages...")
    build_home()
    build_contact()
    build_search()

    print("Building content pages...")
    for u in pages:
        build_page(u)
    for u in posts:
        build_page(u)

    build_blog(posts)

    n = sum(len(files) for _, _, files in os.walk(PUBLIC)
            if True)
    total = sum(1 for _, _, fs in os.walk(PUBLIC) for f in fs if f == "index.html")
    print("Done. %d HTML pages written to %s" % (total, PUBLIC))


if __name__ == "__main__":
    main()
