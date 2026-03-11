"use client";

import React, { useState, useCallback, memo, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { submitApplication } from "@/lib/hiringService";

const INITIAL_FORM = {
  full_name: "",
  email: "",
  phone: "",
  motivation: "",
  are_you_student: "",
  university: "",
  department: "",
  level: "",
};

// Hardware accelerated variants
const fadeIn = {
  hidden: { opacity: 0, y: 10 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { 
      delay: i * 0.05, 
      duration: 0.4, 
      ease: [0.25, 0.1, 0.25, 1.0] 
    },
  }),
};

const conditionalSlide = {
  initial: { opacity: 0, height: 0, marginTop: 0 },
  animate: {
    opacity: 1,
    height: "auto",
    marginTop: 20,
    transition: { duration: 0.3, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    height: 0,
    marginTop: 0,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

/* ── Optimized Sub-components ── */

const FieldError = memo(({ errors }) => {
  if (!errors || errors.length === 0) return null;
  return (
    <motion.p 
      initial={{ opacity: 0, x: -5 }}
      animate={{ opacity: 1, x: 0 }}
      className="text-xs text-destructive mt-1 font-medium"
    >
      {errors[0]}
    </motion.p>
  );
});
FieldError.displayName = "FieldError";

const RadioOption = memo(({ name, value, label, checked, onChange }) => {
  return (
    <label
      className={`flex items-center gap-3 px-5 py-3 rounded-xl border cursor-pointer transition-all duration-200 select-none flex-1 justify-center md:justify-start ${
        checked
          ? "border-primary bg-primary/5 text-foreground ring-1 ring-primary/20"
          : "border-border bg-muted/30 text-muted-foreground hover:border-primary/30 hover:bg-muted/50"
      }`}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <span
        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
          checked ? "border-primary" : "border-muted-foreground/40"
        }`}
      >
        {checked && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-2 h-2 rounded-full bg-primary"
          />
        )}
      </span>
      <span className="text-sm font-medium">{label}</span>
    </label>
  );
});
RadioOption.displayName = "RadioOption";

/** @param {{ defaultPosition: string, roleType: string }} props */
const HiringApplicationForm = ({ defaultPosition = "", roleType = "intern" }) => {
  const [form, setForm] = useState({
    ...INITIAL_FORM,
    position: defaultPosition,
  });

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState(null);

  const isStudent = form.are_you_student === "yes";

  // Memoized handlers to prevent unnecessary re-renders of the entire form on every stroke
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    
    // Clear field error if user starts typing
    setFieldErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  const handleStudentChange = useCallback((value) => {
    setForm((prev) => ({
      ...prev,
      are_you_student: value,
      ...(value === "no" ? { university: "", department: "", level: "" } : {}),
    }));
    
    setFieldErrors((prev) => {
      if (!prev.are_you_student) return prev;
      const next = { ...prev };
      delete next.are_you_student;
      return next;
    });
  }, []);

  const validate = () => {
    const errs = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!form.full_name.trim()) errs.full_name = ["Full name is required."];
    if (!form.email.trim()) {
      errs.email = ["Email is required."];
    } else if (!emailRegex.test(form.email)) {
      errs.email = ["Enter a valid email address."];
    }
    if (!form.phone.trim()) errs.phone = ["WhatsApp number is required."];
    if (!form.are_you_student) {
      errs.are_you_student = ["Please select an option."];
    }

    if (form.are_you_student === "yes") {
      if (!form.university.trim()) errs.university = ["University is required."];
      if (!form.department.trim()) errs.department = ["Department is required."];
      if (!form.level.trim()) errs.level = ["Level is required."];
    }

    if (!form.motivation.trim()) errs.motivation = ["This field is required."];
    if (!form.position.trim()) errs.position = ["Position is required."];

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError(null);
    setFieldErrors({});

    const clientErrors = validate();
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      return;
    }

    setSubmitting(true);

    try {
      const result = await submitApplication({
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        role_type: roleType,
        position: form.position,
        cover_message: form.motivation,
      });

      setSuccess(result.message || "Application submitted successfully!");
      setForm({ ...INITIAL_FORM, position: defaultPosition });
    } catch (err) {
      const status = err?.response?.status;
      if (status === 400 && err?.response?.data) {
        const data = err.response.data;
        if (typeof data === "object" && !data.detail) {
          setFieldErrors(data);
        } else {
          setGeneralError(data.detail || "Validation failed. Please check your inputs.");
        }
      } else {
        setGeneralError("Something went wrong. Please try again later.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ willChange: "transform, opacity" }}
        className="p-10 rounded-3xl bg-card border border-border text-center space-y-6"
      >
        <div className="mx-auto w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8 text-green-500" />
        </div>
        <h3 className="text-2xl font-bold">{success}</h3>
        <p className="text-muted-foreground">
          We&apos;ll review your application and reach out to you soon.
        </p>
        <Button
          onClick={() => setSuccess(null)}
          variant="outline"
          className="rounded-xl border-border hover:bg-muted"
        >
          Submit Another Application
        </Button>
      </motion.div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 md:p-10 rounded-3xl bg-card border border-border space-y-6 overflow-hidden"
    >
      {generalError && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="flex items-start gap-3 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm"
        >
          <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
          <span>{generalError}</span>
        </motion.div>
      )}

      {/* Group 1: Identity */}
      <motion.div 
        custom={0} variants={fadeIn} initial="hidden" animate="visible"
        style={{ willChange: "transform, opacity" }}
        className="grid md:grid-cols-2 gap-5"
      >
        <div className="space-y-2">
          <Label htmlFor="full_name">
            Full Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="full_name"
            name="full_name"
            placeholder="John Doe"
            value={form.full_name}
            onChange={handleChange}
            className="bg-muted/50 border-border h-12 rounded-xl focus-visible:ring-primary/20"
          />
          <FieldError errors={fieldErrors.full_name} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">
            Email <span className="text-destructive">*</span>
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="john@example.com"
            value={form.email}
            onChange={handleChange}
            className="bg-muted/50 border-border h-12 rounded-xl focus-visible:ring-primary/20"
          />
          <FieldError errors={fieldErrors.email} />
        </div>
      </motion.div>

      {/* Group 2: Contact & Position */}
      <motion.div 
        custom={1} variants={fadeIn} initial="hidden" animate="visible"
        style={{ willChange: "transform, opacity" }}
        className="grid md:grid-cols-2 gap-5"
      >
        <div className="space-y-2">
          <Label htmlFor="phone">
            WhatsApp Number <span className="text-destructive">*</span>
          </Label>
          <Input
            id="phone"
            name="phone"
            placeholder="+234 812 345 6789"
            value={form.phone}
            onChange={handleChange}
            className="bg-muted/50 border-border h-12 rounded-xl focus-visible:ring-primary/20"
          />
          <FieldError errors={fieldErrors.phone} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="position">
            Position <span className="text-destructive">*</span>
          </Label>
          <Input
            id="position"
            name="position"
            value={form.position}
            readOnly
            className="bg-muted/50 border-border h-12 rounded-xl opacity-70 cursor-not-allowed select-none"
          />
          <FieldError errors={fieldErrors.position} />
        </div>
      </motion.div>

      {/* Student Question */}
      <motion.div
        custom={2} variants={fadeIn} initial="hidden" animate="visible"
        style={{ willChange: "transform, opacity" }}
        className="space-y-3"
      >
        <Label>
          Are you currently a student?{" "}
          <span className="text-destructive">*</span>
        </Label>
        <div className="flex gap-4">
          <RadioOption
            name="are_you_student"
            value="yes"
            label="Yes"
            checked={form.are_you_student === "yes"}
            onChange={() => handleStudentChange("yes")}
          />
          <RadioOption
            name="are_you_student"
            value="no"
            label="No"
            checked={form.are_you_student === "no"}
            onChange={() => handleStudentChange("no")}
          />
        </div>
        <FieldError errors={fieldErrors.are_you_student} />
      </motion.div>

      {/* Conditional Student Fields - Using key to ensure clean mount/unmount */}
      <AnimatePresence mode="wait">
        {isStudent && (
          <motion.div
            key="student-fields"
            variants={conditionalSlide}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ willChange: "height, opacity" }}
            className="space-y-5 overflow-hidden"
          >
            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="university">
                  University <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="university"
                  name="university"
                  placeholder="e.g. University of Lagos"
                  value={form.university}
                  onChange={handleChange}
                  className="bg-muted/50 border-border h-12 rounded-xl focus-visible:ring-primary/20"
                />
                <FieldError errors={fieldErrors.university} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">
                  Department <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="department"
                  name="department"
                  placeholder="e.g. Computer Science"
                  value={form.department}
                  onChange={handleChange}
                  className="bg-muted/50 border-border h-12 rounded-xl focus-visible:ring-primary/20"
                />
                <FieldError errors={fieldErrors.department} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="level">
                Level <span className="text-destructive">*</span>
              </Label>
              <Input
                id="level"
                name="level"
                placeholder="e.g. 300 Level, Final Year"
                value={form.level}
                onChange={handleChange}
                className="bg-muted/50 border-border h-12 rounded-xl focus-visible:ring-primary/20"
              />
              <FieldError errors={fieldErrors.level} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Motivation */}
      <motion.div
        custom={3} variants={fadeIn} initial="hidden" animate="visible"
        style={{ willChange: "transform, opacity" }}
        className="space-y-2"
      >
        <Label htmlFor="motivation">
          Why do you want to join the Axile team?{" "}
          <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="motivation"
          name="motivation"
          placeholder="Tell us what excites you about this role and what you hope to contribute…"
          value={form.motivation}
          onChange={handleChange}
          className="min-h-[140px] bg-muted/50 border-border rounded-xl resize-none focus-visible:ring-primary/20"
        />
        <FieldError errors={fieldErrors.motivation} />
      </motion.div>

      {/* Submit */}
      <motion.div
        custom={4} variants={fadeIn} initial="hidden" animate="visible"
        style={{ willChange: "transform, opacity" }}
      >
        <Button
          type="submit"
          disabled={submitting}
          className="w-full h-14 text-lg rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 active:scale-[0.98] transition-all font-bold"
        >
          {submitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Submitting…
            </>
          ) : (
            "Submit Application"
          )}
        </Button>
      </motion.div>
    </form>
  );
};

export default memo(HiringApplicationForm);
