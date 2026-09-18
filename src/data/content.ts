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
};

// Drop real files into /public/photos using these exact names and the
// gallery will pick them up automatically — no code changes needed.
export const PHOTOS: Photo[] = [
  { src: "/photos/photo-01.jpg", caption: "Add a caption for this memory" },
  { src: "/photos/photo-02.jpg", caption: "Add a caption for this memory" },
  { src: "/photos/photo-03.jpg", caption: "Add a caption for this memory" },
  { src: "/photos/photo-04.jpg", caption: "Add a caption for this memory" },
  { src: "/photos/photo-05.jpg", caption: "Add a caption for this memory" },
  { src: "/photos/photo-06.jpg", caption: "Add a caption for this memory" },
  { src: "/photos/photo-07.jpg", caption: "Add a caption for this memory" },
  { src: "/photos/photo-08.jpg", caption: "Add a caption for this memory" },
];

// Edit this with your real letter — 2-3 short paragraphs is plenty.
export const LETTER_PARAGRAPHS: string[] = [
  "Mommy, every year that passes and to celebrate with you is a gift to me.",
  "Thank you for every unseen sacrifice you made, every meal, every allowance, every “kaya mo yan.”",
  "Today I hope you feel all the love you've given all of us over the years.",
  "Happy birthday, Mommy! I love you more than this website could ever show.",
  "P.S. I hope you like the website I made for you! It’s a little something to show where your sacrifices are going to.",
];

export const LETTER_SIGNOFF = "With all my love, Gelo";
