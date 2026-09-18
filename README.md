# Happy Birthday, Mommy Sonia 🎂

A single-page birthday celebration site: countdown → reveal → photo tribute
→ letter → live family guestbook.

## Run it locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Before September 22, visitors only see the countdown. To preview the
reveal/gallery/letter/guestbook sections early without changing your
system clock, open:

```
http://localhost:3000/?preview=1
```

(The real date check still runs normally for everyone else — `preview=1`
only forces the post-countdown view for whoever has that link.)

To let family leave a guestbook message before the 22nd — without spoiling
the reveal for them — send them this link instead of the main one:

```
http://localhost:3000/?guestbook=1
```

It shows only the message form and list (no countdown, no reveal, no
photos), and writes to the exact same live guestbook everyone sees later —
so messages left early are just already there when the site opens for
real. Only share this link directly with the people you want writing
early messages; it's not linked from anywhere on the main site.

## 1. Add the real photos

Drop 8 images into `public/photos/` named `photo-01.jpg` through
`photo-08.jpg` (see `public/photos/README.md`). Edit captions in
`src/data/content.ts`.

## 2. Edit the letter

Lives in `src/data/content.ts` — `LETTER_PARAGRAPHS`. Replace the
placeholder text with the real thing before sharing the link. The
guestbook itself starts empty on purpose — real messages from family
are what fill it in once the link goes out.

## 3. Set up the live guestbook (Firebase Firestore)

The guestbook needs a real, free Firebase project:

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
   and create a new project (any name).
2. In the project, go to **Build > Firestore Database > Create database**.
   Start in **production mode** (rules are provided below), pick any
   region.
3. Go to **Firestore Database > Rules**, paste the contents of
   `firestore.rules` from this repo, and click **Publish**.
4. Go to **Project settings** (gear icon) > **General** > scroll to
   **Your apps** > click the **</>** (web) icon to register a new web app.
5. Copy the config values it gives you into a new `.env.local` file in
   this folder (copy `.env.local.example` as a starting point):

   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
   NEXT_PUBLIC_FIREBASE_APP_ID=...
   ```

6. Restart `npm run dev`. The guestbook form will light up — messages
   people submit show up live for everyone.

If you already had an earlier version of this site running, it may have
seeded four placeholder entries (Father/Sister/Ate/Titas) into your
Firestore database before this was removed — delete those manually from
**Firestore Database > Data > guestbook** in the console (doc IDs
`seed-father`, `seed-sister`, `seed-ate`, `seed-titas`) since the app's
write rules intentionally don't allow deleting from the client.

Reactions (the 🎉 button on each message) need the updated
`firestore.rules` in this repo re-pasted into **Firestore Database >
Rules** and published — the original rules only allowed creating new
entries, not incrementing a reaction count on existing ones.

Until `.env.local` is set up, the rest of the site still works — the
guestbook just shows a small setup notice instead of the form.

**Note:** these `NEXT_PUBLIC_*` values are meant to be visible in the
browser (that's how Firebase client SDKs work) — real access control comes
from the Firestore rules in `firestore.rules`, which only allow adding new
guestbook entries, not reading other Firebase data, editing, or deleting.

## 4. Deploy

Push this to a GitHub repo and import it on
[vercel.com/new](https://vercel.com/new), or run `npx vercel` from this
folder. Add the same `NEXT_PUBLIC_FIREBASE_*` environment variables in the
Vercel project settings (Settings > Environment Variables) — `.env.local`
is not deployed with your code.

The site already sends a `noindex` header via `metadata.robots` in
`src/app/layout.tsx`, so search engines won't pick up the private link.

## Stack

Next.js (App Router) + Tailwind CSS v4 + Firebase Firestore (guestbook) +
Framer Motion (animations) + canvas-confetti (reveal).
