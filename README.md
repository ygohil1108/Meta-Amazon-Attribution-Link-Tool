# Meta-Amazon-Attribution-Link-Tool

Turns an Amazon Attribution link into a link for Meta (Facebook/Instagram) ads that sends shoppers to the **Amazon app** instead of loading Amazon inside Meta's in-app browser, where they usually aren't signed in.

It's a small static site, hosted for free on GitHub Pages. It has no backend, no tracking and no click limits.

## How it works

| Device | What happens |
| --- | --- |
| iPhone / iPad | Opens `com.amazon.mobile.shopping.web://…` (the Amazon app). Inside Facebook/Instagram, iOS shows **“Open in Amazon?”**. This prompt comes from iOS and no link tool can remove it. If the shopper taps Cancel, or the app isn't installed, the page falls back to the normal Amazon web page. |
| Android | Opens an `intent://` link that names the Amazon app, with the web link built in as the fallback. |
| Desktop | Redirects straight to the Amazon link. |

Your full Attribution link (`maas=…&ref_=aa_maas&tag=maas`) is passed through unchanged in every case, so Amazon Attribution still counts the click.

For safety, the redirect page only sends people to Amazon storefront domains (amazon.com, amazon.co.uk, amazon.ca and so on), so nobody can use your site to redirect to other websites.

## Files

```
index.html         Link builder: paste an Attribution link, get an ad-ready link
go/index.html      Redirect page that ad clicks land on
assets/deeplink.js Shared logic (app/intent URLs, encoding, Amazon domain check)
links.json         Optional short names, e.g. "tol" → go/?id=tol
```

## Publish on GitHub Pages

1. Push this repo to GitHub.
2. On GitHub, open **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to *Deploy from a branch*, choose `main` and `/ (root)`, then click **Save**.
4. After about a minute the site is live at
   `https://ygohil1108.github.io/Meta-Amazon-Attribution-Link-Tool/`

Optional: to use your own domain (for example `go.yourbrand.com`), add it under **Settings → Pages → Custom domain** and create the CNAME record your DNS provider asks for. A branded domain looks more trustworthy in ads.

## Creating a link

1. Open the site and paste your full Amazon Attribution link.
2. Click **Create link** and copy the result. It looks like
   `https://ygohil1108.github.io/Meta-Amazon-Attribution-Link-Tool/go/?l=aHR0cHM6Ly93d3cu…`
   It works right away and needs no repo changes, because the destination is encoded inside the link.
3. Paste it as the **Website URL** in your Meta ad.

### Shorter links (optional)

Type a short name such as `tol` when creating the link. The builder gives you a line to add to `links.json`:

```json
{
  "tol": "https://www.amazon.com/dp/B0HDS1XBJQ?maas=...&ref_=aa_maas&tag=maas"
}
```

Commit and push it. Then `…/go/?id=tol` works too. You can change where a short link points later by editing `links.json`, without touching the ad.

## Testing before you run an ad

1. Send the link to yourself in an Instagram DM and tap it on an iPhone and an Android phone. It should open the product in the Amazon app (on iPhone, after you tap **Open**).
2. On a phone without the Amazon app, check the Amazon page loads with `maas=` still in the address bar.
3. After 24–48 hours, confirm Click-throughs are rising in Amazon Attribution.
4. Retest every month or two, and after major iOS, Facebook or Instagram updates. Apple, Meta and Amazon change app-opening behavior from time to time.

## Local preview

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.
