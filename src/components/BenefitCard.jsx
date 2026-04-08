"use client";

import React from "react";
import { motion } from "framer-motion";

const BenefitCard = ({ icon: Icon, title, description, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className="p-8 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg group relative overflow-hidden"
    >
      {/* Subtle background accent */}
      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
      </div>

      {/* Icon */}
      <div className="relative z-10 mb-6 p-4 w-fit rounded-xl bg-primary/10 group-hover:bg-primary/15 transition-colors">
        <Icon className="h-6 w-6 text-primary group-hover:scale-110 transition-transform duration-300" />
      </div>

      {/* Content */}
      <h3 className="relative z-10 text-xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors duration-300">
        {title}
      </h3>
      <p className="relative z-10 text-muted-foreground leading-relaxed text-sm">
        {description}
      </p>
    </motion.div>
  );
};

export default BenefitCard;
