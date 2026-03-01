"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, X, FileText, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select-component";
import { fetchRoleTypes, submitApplication } from "@/lib/hiringService";

const HiringApplicationForm = ({ defaultPosition = "", defaultRoleType = "" }) => {
  // ── Role types from API ──
  const [roleTypes, setRoleTypes] = useState([]);
  const [roleTypesLoading, setRoleTypesLoading] = useState(true);
  const [roleTypesError, setRoleTypesError] = useState(null);

  // ── Form state ──
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    role_type: defaultRoleType,
    position: defaultPosition,
    cover_message: "",
  });

  const isPositionPrefilled = Boolean(defaultPosition);
  const isRoleTypePrefilled = Boolean(defaultRoleType);
  const [resume, setResume] = useState(null);
  const fileInputRef = useRef(null);

  // ── Submission state ──
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState(null);

  // ── Fetch role types on mount ──
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchRoleTypes();
        if (!cancelled) setRoleTypes(data.role_types ?? []);
      } catch (err) {
        if (!cancelled) setRoleTypesError("Failed to load role types. Please refresh.");
      } finally {
        if (!cancelled) setRoleTypesLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ── Helpers ──
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
    }
  };

  const handleRoleTypeChange = (value) => {
    setForm((prev) => ({ ...prev, role_type: value }));
    if (fieldErrors.role_type) {
      setFieldErrors((prev) => { const n = { ...prev }; delete n.role_type; return n; });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        setFieldErrors((prev) => ({ ...prev, resume: ["Only PDF files are accepted."] }));
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setFieldErrors((prev) => ({ ...prev, resume: ["File size must be under 10 MB."] }));
        return;
      }
      setResume(file);
      setFieldErrors((prev) => { const n = { ...prev }; delete n.resume; return n; });
    }
  };

  const removeFile = () => {
    setResume(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Client-side validation ──
  const validate = () => {
    const errs = {};
    if (!form.full_name.trim()) errs.full_name = ["Full name is required."];
    if (!form.email.trim()) {
      errs.email = ["Email is required."];
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = ["Enter a valid email address."];
    }
    if (!form.role_type) errs.role_type = ["Please select a role type."];
    if (!form.position.trim()) errs.position = ["Position is required."];
    return errs;
  };

  // ── Submit ──
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
      const result = await submitApplication({ ...form, resume: resume || undefined });
      setSuccess(result.message || "Application submitted successfully!");
      // Clear form
      setForm({ full_name: "", email: "", phone: "", role_type: defaultRoleType, position: defaultPosition, cover_message: "" });
      removeFile();
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

  const fadeIn = {
    hidden: { opacity: 0, y: 15 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.06, duration: 0.5, ease: "easeOut" },
    }),
  };

  // ── Success state ──
  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-10 rounded-3xl bg-card border border-border text-center space-y-6"
      >
        <div className="mx-auto w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8 text-green-500" />
        </div>
        <h3 className="text-2xl font-bold">{success}</h3>
        <p className="text-muted-foreground">We'll review your application and reach out to you soon.</p>
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
    <form onSubmit={handleSubmit} className="p-8 md:p-10 rounded-3xl bg-card border border-border space-y-6">
      {generalError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm"
        >
          <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
          <span>{generalError}</span>
        </motion.div>
      )}

      {/* Full Name & Email */}
      <div className="grid md:grid-cols-2 gap-5">
        <motion.div custom={0} variants={fadeIn} initial="hidden" animate="visible" className="space-y-2">
          <Label htmlFor="full_name">
            Full Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="full_name"
            name="full_name"
            placeholder="John Doe"
            value={form.full_name}
            onChange={handleChange}
            className="bg-muted/50 border-border h-12 rounded-xl"
          />
          {fieldErrors.full_name && (
            <p className="text-xs text-destructive mt-1">{fieldErrors.full_name[0]}</p>
          )}
        </motion.div>

        <motion.div custom={1} variants={fadeIn} initial="hidden" animate="visible" className="space-y-2">
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
            className="bg-muted/50 border-border h-12 rounded-xl"
          />
          {fieldErrors.email && (
            <p className="text-xs text-destructive mt-1">{fieldErrors.email[0]}</p>
          )}
        </motion.div>
      </div>

      {/* Phone & Role Type */}
      <div className="grid md:grid-cols-2 gap-5">
        <motion.div custom={2} variants={fadeIn} initial="hidden" animate="visible" className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            placeholder="+234 800 000 0000"
            value={form.phone}
            onChange={handleChange}
            className="bg-muted/50 border-border h-12 rounded-xl"
          />
          {fieldErrors.phone && (
            <p className="text-xs text-destructive mt-1">{fieldErrors.phone[0]}</p>
          )}
        </motion.div>

        {isRoleTypePrefilled ? (
          <input type="hidden" name="role_type" value={form.role_type} />
        ) : (
          <motion.div custom={3} variants={fadeIn} initial="hidden" animate="visible" className="space-y-2">
            <Label>
              Role Type <span className="text-destructive">*</span>
            </Label>
            {roleTypesLoading ? (
              <div className="h-12 rounded-xl bg-muted/50 border border-border flex items-center px-4">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mr-2" />
                <span className="text-sm text-muted-foreground">Loading roles…</span>
              </div>
            ) : roleTypesError ? (
              <div className="h-12 rounded-xl bg-destructive/5 border border-destructive/20 flex items-center px-4">
                <span className="text-sm text-destructive">{roleTypesError}</span>
              </div>
            ) : (
              <Select value={form.role_type} onValueChange={handleRoleTypeChange}>
                <SelectTrigger className="bg-muted/50 border-border h-12 rounded-xl">
                  <SelectValue placeholder="Select role type" />
                </SelectTrigger>
                <SelectContent>
                  {roleTypes.map((rt) => (
                    <SelectItem key={rt.value} value={rt.value}>
                      {rt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {fieldErrors.role_type && (
              <p className="text-xs text-destructive mt-1">{fieldErrors.role_type[0]}</p>
            )}
          </motion.div>
        )}
      </div>

      {/* Position */}
      <motion.div custom={4} variants={fadeIn} initial="hidden" animate="visible" className="space-y-2">
        <Label htmlFor="position">
          Position <span className="text-destructive">*</span>
        </Label>
        <Input
          id="position"
          name="position"
          placeholder="e.g. Frontend Developer, Marketing Intern"
          value={form.position}
          onChange={isPositionPrefilled ? undefined : handleChange}
          readOnly={isPositionPrefilled}
          className={`bg-muted/50 border-border h-12 rounded-xl ${isPositionPrefilled ? "opacity-70 cursor-not-allowed" : ""}`}
        />
        {fieldErrors.position && (
          <p className="text-xs text-destructive mt-1">{fieldErrors.position[0]}</p>
        )}
      </motion.div>

      {/* Resume Upload */}
      <motion.div custom={5} variants={fadeIn} initial="hidden" animate="visible" className="space-y-2">
        <Label>Resume (PDF preferred)</Label>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="hidden"
          id="resume-upload"
        />
        {resume ? (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border border-border">
            <FileText className="h-5 w-5 text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{resume.name}</p>
              <p className="text-xs text-muted-foreground">{(resume.size / 1024).toFixed(1)} KB</p>
            </div>
            <button
              type="button"
              onClick={removeFile}
              className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <label
            htmlFor="resume-upload"
            className="flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed border-border hover:border-primary/40 cursor-pointer transition-colors bg-muted/30 hover:bg-muted/50"
          >
            <Upload className="h-6 w-6 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Click to upload your resume (PDF, max 10 MB)
            </span>
          </label>
        )}
        {fieldErrors.resume && (
          <p className="text-xs text-destructive mt-1">{fieldErrors.resume[0]}</p>
        )}
      </motion.div>

      {/* Cover Message */}
      <motion.div custom={6} variants={fadeIn} initial="hidden" animate="visible" className="space-y-2">
        <Label htmlFor="cover_message">Cover Message</Label>
        <Textarea
          id="cover_message"
          name="cover_message"
          placeholder="Tell us why you'd be a great fit…"
          value={form.cover_message}
          onChange={handleChange}
          className="min-h-[120px] bg-muted/50 border-border rounded-xl resize-none"
        />
        {fieldErrors.cover_message && (
          <p className="text-xs text-destructive mt-1">{fieldErrors.cover_message[0]}</p>
        )}
      </motion.div>

      {/* Submit */}
      <motion.div custom={7} variants={fadeIn} initial="hidden" animate="visible">
        <Button
          type="submit"
          disabled={submitting}
          className="w-full h-14 text-lg rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all font-bold"
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

export default HiringApplicationForm;
