# Ember: emberireland.com

The website for Ember, a rock covers band from Limerick, Ireland. It's a plain static site (HTML, CSS and JavaScript) with no build step, hosted free on GitHub Pages.

## Everyday edits

### Add or remove a gig
Edit `data/gigs.json`. Each gig is one line:

```json
{ "date": "2026-11-14", "venue": "Bar Name", "town": "Limerick City", "time": "21:30", "link": "", "note": "Free in" }
```

- `date` must be `YYYY-MM-DD`. Past gigs hide themselves, so you never need to delete old ones.
- `link` (optional): a Facebook event or ticket URL. It shows a "Details" button.
- `note` (optional): a short tag such as "Free in" or "Tickets €10".
- `"private": true` shows the gig as "Private event" (good for weddings).
- Put a comma between gigs, but not after the last one.

### Update the setlist
Edit `data/setlist.json`. `era` sets the column: `70s & 80s`, `90s`, `2000s` or `2010s+`. New eras appear automatically.

### Photos
Search `index.html` for `REPLACE:` to find every placeholder:

| What | Where |
|---|---|
| Logo | `images/logo.svg` (replace the file, or point the `<img>` tags at a PNG) |
| Hero background | `css/style.css`, `.hero__bg`. Add `url("../images/hero.jpg") center / cover` as the last layer |
| Member photos, names, instruments | "ABOUT" section of `index.html` |
| Gallery | "GALLERY" section. Put photos in `images/gallery/` and update both `href` and `src` |
| Social share image | Save a 1200×630 photo as `images/og-image.jpg` |

Resize photos before uploading. About 1600px wide and under 300 KB keeps the site fast. https://squoosh.app is free and does this well.

### Videos
In the "MEDIA" section, put the YouTube video ID in `data-youtube="..."`. The ID is the part after `v=` in `https://www.youtube.com/watch?v=XXXXXXXXXXX`.

### Bio, testimonials, social links
Edit the text directly in `index.html` (search for `REPLACE:`). Add the band's social profile URLs to the `"sameAs": []` list near the top too, which helps Google.

## Preview locally
```bash
python -m http.server 8080
```
Then open http://localhost:8080. Opening `index.html` by double-clicking won't load the gigs or setlist, because browsers block the data files from `file://`.

## One-time setup

### 1. Booking form (Web3Forms) ✅ done
Enquiries are emailed through https://web3forms.com (no account needed, 250 a month free). The access key is the `access_key` hidden field in `index.html`.
- To send enquiries to a different inbox, request a new key at web3forms.com with that email and replace the value.
- Spam protection: the hidden `botcheck` field catches bots.

### 2. GitHub Pages
1. Create a free account at https://github.com and a new **public** repository named `ember-site`.
2. Upload the contents of this folder: drag and drop via "Add file → Upload files", or run:
   ```bash
   git init
   git add .
   git commit -m "Ember website"
   git branch -M main
   git remote add origin https://github.com/<your-username>/ember-site.git
   git push -u origin main
   ```
3. In the repo, go to **Settings → Pages**. Set Source to "Deploy from a branch", choose `main` / `(root)`, and save.
4. Under **Custom domain**, enter `emberireland.com` and save. The `CNAME` file in this folder already contains it.

### 3. Point emberireland.com at GitHub (at your domain registrar)
In your registrar's DNS settings (Blacknight, GoDaddy, Namecheap, etc.), delete any existing `A` records for the root domain, then add:

| Type | Host / Name | Value |
|---|---|---|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | `<your-username>.github.io` |

DNS can take from a few minutes to 24 hours to update. Once GitHub shows a green tick, go back to **Settings → Pages** and tick **Enforce HTTPS**.

### 4. Verify the domain (recommended)
In GitHub, go to **your profile → Settings → Pages → Add a domain**. GitHub gives you a `TXT` record to add at your registrar. This stops anyone else from using emberireland.com on GitHub.

### 5. Get found on Google
- Add the site to Google Search Console (https://search.google.com/search-console) and submit `https://emberireland.com/sitemap.xml`.
- Create a free Google Business Profile for "Ember – Rock Covers Band" in Limerick. This matters a lot for "wedding band Limerick" searches.

## Files
```
index.html        the whole page
css/style.css     colours, fonts, layout (theme colours at the top)
js/main.js        menu, gigs, setlist search, video, gallery, booking form
data/gigs.json    gig dates
data/setlist.json songs
images/           logo, photos
CNAME             custom domain for GitHub Pages
404.html          "page not found" page
robots.txt, sitemap.xml  for search engines
```
