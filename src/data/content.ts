// Central place to edit the site's content.

// Birthday target — local time. Change the year if you're reusing this next year.
export const BIRTHDAY_TARGET = new Date(2026, 8, 22, 0, 0, 0); // Sept 22, 2026

// Revealed only after the countdown ends — kept out of the Countdown
// section on purpose so the "who" stays a surprise until the reveal.
export const RECIPIENT_NAME = "Mommy Sonia";

export const TEASER_LINE = "Something special is coming…";
export const COUNTDOWN_HEADLINE = "Counting down to something special";
export const MARQUEE_TEXT = "Happy Birthday Mommy";

export type Photo = {
  src: string;
  caption: string;
  // Optional CSS object-position (e.g. "20% center") for photos where the
  // default centered crop cuts off someone important — the gallery crops
  // to a portrait frame, so a wide landscape photo loses its left/right
  // edges unless told where to focus instead.
  focus?: string;
};

// Drop real files into /public/photos using these exact names and the
// gallery will pick them up automatically — no code changes needed.
export const PHOTOS: Photo[] = [
  { src: "/photos/photo-01.jpg", caption: "03/10/17" },
  { src: "/photos/photo-02.jpg", caption: "03/28/25" },
  { src: "/photos/photo-03.jpg", caption: "03/21/16" },
  {
    src: "/photos/photo-04.jpg",
    caption: "08/14/22",
    focus: "8% center",
  },
  { src: "/photos/photo-05.jpg", caption: "01/02/17" },
  { src: "/photos/photo-06.jpg", caption: "01/01/16" },
  { src: "/photos/photo-07.jpg", caption: "12/25/16" },
  { src: "/photos/photo-08.jpg", caption: "04/16/16" },
  { src: "/photos/photo-09.jpg", caption: "03/10/17" },
  { src: "/photos/photo-10.jpg", caption: "02/22/16" },
  { src: "/photos/photo-11.jpg", caption: "01/01/16" },
  {
    src: "/photos/photo-12.jpg",
    caption: "5/14/16",
    focus: "17% center",
  },
  {
    src: "/photos/photo-13.jpg",
    caption: "04/17/22",
    focus: "center 38%",
  },
];

// Edit this with your real letter — 2-3 short paragraphs is plenty.
export const LETTER_PARAGRAPHS: string[] = [
  "Mommy, every year that passes by and being able to celebrate with you is a gift to me.",
  "Thank you for every unseen sacrifice you made, every meal, every allowance, every “kaya mo yan.”",
  "Today I hope you feel all the love you've showered all of us over the years.",
  "Happy birthday, Mommy! I love you more than this website could ever show.",
];

export const LETTER_SIGNOFF = "With all my love, Gelo";
