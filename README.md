# SPARSH Carry Bags — website

Static website (HTML + CSS + vanilla JS modules). No build step, no frameworks.

## Run locally
ES modules need a web server (double-clicking index.html will not work):

    cd sparsh-website
    python3 -m http.server 8080        # or: npm start
    # open http://localhost:8080

## Where to edit
| What | Where |
|---|---|
| WhatsApp number, **email**, address, social links, website URL | `js/config.js` |
| Product names, descriptions, options, FAQ, industries, steps | `js/content.js` |
| Colours (brand palette) | top of `css/styles.css` (`:root`) |
| Page layout / section text (hero, story, CTA) | `index.html` |
| Privacy policy text | `privacy.html` |

### WhatsApp number / email
Open `js/config.js`: change `whatsappNumber` (10 digits, +91 is added automatically) and put the business email address in `email`.
The enquiry form now e-mails every enquiry straight to that inbox through `send-enquiry.php` (needs PHP hosting such as Hostinger; change the recipient at the top of that file). A copy of each enquiry is also kept in `_data/enquiries.log` (web access blocked). If the first mails land in Spam, mark them "Not spam" once.

### Logo
Replace files in `assets/logo/` keeping the same names:
`logo.png` + `logo.webp` (round logo in header/footer), `logo-mark.png` (transparent logo printed on the bag mockups), `favicon-64.png`, `favicon-192.png`, `apple-touch-icon.png`.
The shipped logo files were cropped from the supplied reference poster; swap in the original vector/PNG when you have it.

### Product images
Products currently show drawn kraft-bag mockups (`js/bags.js`) carrying your logo.
To use real photos: add the image to `assets/images/` and in `js/content.js` set, for example,
`image: "assets/images/sos-bag.jpg", alt: "SOS paper bag printed with logo"` on that product.
The mockup is replaced automatically.

### Social preview
`assets/images/og-image.jpg` (1200x630) is used when the link is shared. Replace it any time.

## Connecting a real backend (later)
Set `formEndpoint` in `js/config.js` to your API/CRM URL. The form then also POSTs JSON
(`name, company, phone, email, product, print, quantity, size, notes, source, submittedAt`).
Right now nothing is stored: the form only opens WhatsApp/email with a prefilled message and tells the visitor to press Send.

## Before going live
- Add the confirmed business email and any social links in `js/config.js`.
- Upload to hosting for `sparshcarrybags.in` over HTTPS (canonical, sitemap and OG URLs assume this domain).
- Replace mockups / OG image with real product photos when available.
- Have the privacy policy reviewed if analytics or a database is added.
- Add a physical address / LocalBusiness schema only after verifying details.

## Note on colours
Brand colours are exactly as briefed. Two darker gold shades (`--color-gold-deep`, `--color-gold-text`) are used only for button fills and small gold text so they pass contrast checks.
