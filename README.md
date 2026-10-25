# moimoi (Firebase version)

Accounts, contacts and chat now work between different phones. Tags, notes, to-dos and photos still stay on each person's own device.

All files go in ONE folder (no sub-folders). Upload them all to the root of your GitHub repository.

## 1. Create the Firebase project (free, no card)
1. Go to console.firebase.google.com > Add project (turn off Google Analytics).
2. Build > Authentication > Get started > Sign-in method > turn ON "Email/Password".
3. Build > Firestore Database > Create database > pick a location near you (for example asia-south1) > Start in production mode.
4. Firestore > Rules tab > delete everything, paste the content of `firestore.rules` > Publish.
5. Project settings (gear icon) > Your apps > Web (</>) > register an app. Copy the config values.
6. Open `firebase-config.js` and replace the PASTE_... values with yours. Commit.
7. Authentication > Settings > Authorized domains > Add your site domain (for example `yourname.github.io` or `your-site.netlify.app`).

## 2. How sign-up works (test version)
- A mobile number becomes the hidden login `NUMBER@moimoi.app`, with the password the person chose. There is no OTP, so numbers are not verified. Fine for friends and classmates, not for the public.
- Two people can chat only after BOTH have added each other as contacts.
- Plans are a demo: the plan is saved online but no payment is taken, and a technical user could change their own plan. Real plans need Razorpay and a server.

## 3. Files
`index.html` page · `style.css` look · `dash.js` tags, notes, photos, stickers · `chat.js` contacts and chat · `auth.js` sign up and log in · `firebase-config.js` your keys · `firestore.rules` database security
