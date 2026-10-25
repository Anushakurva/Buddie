# moimoi

Soft, friendly app: sign up with a mobile number, passcode-locked tags (notes, to-dos, photos with stickers) and chat with contacts.

## Files

- `index.html` – all pages and popups (landing, dashboard, tag page, chat, plans)
- `css/style.css` – every colour, size and animation. Change the look here (colours are the `--` variables at the top).
- `js/dash.js` – tags, notes, to-dos, photos, stickers, icon picker
- `js/chat.js` – contacts, plans (free 2, Plus 5, Pro 10), chat
- `js/auth.js` – sign up and log in

Keep the script order in `index.html`: `dash.js`, then `chat.js`, then `auth.js`.

## Put it online (free)

### Option A: GitHub Pages
1. Create a new repository on GitHub and upload all these files (keep the `css` and `js` folders).
2. Go to Settings > Pages. Under "Build and deployment", choose "Deploy from a branch", branch `main`, folder `/ (root)`, then Save.
3. After a minute your site is at `https://YOUR-USERNAME.github.io/REPO-NAME/`.

### Option B: Netlify (gives a link in 30 seconds)
1. Go to app.netlify.com/drop and drag the whole folder onto the page.
2. You get a link like `https://random-name.netlify.app`. Rename it in Site settings.

### Option C: Vercel
Import the GitHub repository at vercel.com/new. No settings needed.

## Important: what works today

Everything is saved in the visitor's own browser (localStorage). That means:

- Accounts, tags, photos and chats exist only on the device that created them.
- A person on another phone cannot receive your messages or find you as a contact.
- Plan buttons are a demo. No money is taken.

## To really go live and earn

You need a backend so data and payments are shared and safe:

1. **Accounts + OTP:** Firebase Authentication (phone sign-in) or Supabase.
2. **Data:** store tags, notes, photos (Firebase Storage / Supabase Storage), contacts and messages in a database instead of localStorage. Replace the `load` and `save` functions in `js/dash.js` and the `g` and `s` functions in `js/chat.js`.
3. **Live chat:** Firestore or Supabase Realtime.
4. **Payments:** Razorpay subscriptions for Plus (5 contacts) and Pro (10 contacts). Verify the payment on the server, then raise the user's contact limit there. Never trust the browser for the plan.
5. **Rules:** add a privacy policy and terms page before you collect phone numbers and take payments.
