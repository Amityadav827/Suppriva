"use client";

import { motion } from "framer-motion";
import { Facebook, Instagram, Linkedin, Youtube } from "lucide-react";

const socials = [
  { label: "Facebook", icon: Facebook },
  { label: "Instagram", icon: Instagram },
  { label: "LinkedIn", icon: Linkedin },
  { label: "YouTube", icon: Youtube },
];

export function SocialLinks() {
  return (
    <div className="mt-6 flex gap-3">
      {socials.map((social) => {
        const Icon = social.icon;

        return (
          <motion.span
            key={social.label}
            aria-label={social.label}
            aria-disabled="true"
            whileHover={{ y: -3, scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            transition={{ duration: 0.28 }}
            className="grid size-11 place-items-center rounded-full border border-white/10 bg-white/[0.07] text-white/78 shadow-[0_12px_30px_rgba(0,0,0,0.14)] transition duration-300 hover:border-gold/45 hover:text-gold hover:shadow-[0_16px_40px_rgba(217,165,32,0.16)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
          >
            <Icon className="size-5" aria-hidden="true" />
          </motion.span>
        );
      })}
    </div>
  );
}
