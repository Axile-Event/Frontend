"use client";

import React from "react";
import { motion } from "framer-motion";

const StepCard = ({ number, title, description, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className="relative flex flex-col items-center text-center group"
    >
      {/* Step Badge */}
      <div className="mb-6 w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xl shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
        {number}
      </div>

      {/* Content */}
      <h3 className="text-2xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors duration-300">
        {title}
      </h3>
      <p className="text-muted-foreground leading-relaxed max-w-xs">
        {description}
      </p>
    </motion.div>
  );
};

export default StepCard;
