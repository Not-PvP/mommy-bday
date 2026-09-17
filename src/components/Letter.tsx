"use client";

import { motion } from "framer-motion";
import { LETTER_PARAGRAPHS, LETTER_SIGNOFF, RECIPIENT_NAME } from "@/data/content";
import FloatingDecor from "@/components/FloatingDecor";

export default function Letter() {
  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-maroon-900 to-maroon-700 px-6 py-24 sm:py-32">
      <FloatingDecor count={5} symbols={["♥", "✧", "❀"]} className="text-gold-300/30" />

      <div className="relative mx-auto max-w-2xl text-center">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-3 font-serif text-lg italic text-gold-300"
        >
          A letter for {RECIPIENT_NAME}
        </motion.p>

        <motion.span
          aria-hidden
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="font-display block text-6xl leading-none text-gold-400/70 sm:text-7xl"
        >
          &ldquo;
        </motion.span>

        <div className="-mt-4 space-y-6">
          {LETTER_PARAGRAPHS.map((paragraph, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="font-serif text-xl leading-relaxed text-blush-50 sm:text-2xl"
            >
              {paragraph}
            </motion.p>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0, rotate: -2 }}
          whileInView={{ opacity: 1, rotate: -2 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="font-hand mt-10 text-3xl text-gold-300 sm:text-4xl"
        >
          {LETTER_SIGNOFF}
        </motion.p>
      </div>
    </section>
  );
}
