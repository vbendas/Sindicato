"use client";

import { useState, useRef } from "react";
import { Send, Paperclip, X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/png",
  "image/jpeg",
];

export function ClerkContactForm() {
  const t = useT();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("");
  const [caseRef, setCaseRef] = useState("");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const CATEGORIES = [
    { value: "general", label: t("clerk.contact.categoryGeneral") },
    { value: "legal", label: t("clerk.contact.categoryLegal") },
    { value: "press", label: t("clerk.contact.categoryPress") },
    { value: "partnership", label: t("clerk.contact.categoryPartnership") },
    { value: "bug", label: t("clerk.contact.categoryBug") },
    { value: "other", label: t("clerk.contact.categoryOther") },
  ];

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    category: false,
    message: false,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    setFileError("");
    if (!f) {
      setFile(null);
      return;
    }
    if (!ALLOWED_TYPES.includes(f.type)) {
      setFileError(t("clerk.contact.fileErrorTypes"));
      setFile(null);
      return;
    }
    if (f.size > MAX_FILE_SIZE) {
      setFileError(t("clerk.contact.fileErrorSize"));
      setFile(null);
      return;
    }
    setFile(f);
  };

  const isValid =
    name.trim() &&
    email.trim() &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    category &&
    message.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, category: true, message: true });

    if (!isValid) return;

    setIsLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("category", category);
      formData.append("caseRef", caseRef);
      formData.append("message", message);
      if (file) formData.append("file", file);

      const res = await fetch("/api/clerk/contact", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to send message");
      }

      setSuccess(true);
    } catch (err) {
      setError((err as Error).message || t("clerk.contact.errorGeneric"));
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="h-full flex flex-col items-center justify-center px-6">
        <CheckCircle2 size={40} className="text-green-400 mb-3" />
        <p className="text-sm text-sindicato-warm-white/90 text-center font-medium">
          {t("clerk.contact.successTitle")}
        </p>
        <p className="text-xs text-sindicato-warm-white/50 text-center mt-1">
          {t("clerk.contact.successBody")}
        </p>
        <button
          onClick={() => {
            setSuccess(false);
            setName("");
            setEmail("");
            setCategory("");
            setCaseRef("");
            setMessage("");
            setFile(null);
            setTouched({ name: false, email: false, category: false, message: false });
          }}
          className="mt-4 text-xs text-sindicato-warm-white/40 hover:text-sindicato-warm-white/70 transition-colors"
        >
          {t("clerk.contact.sendAnother")}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="h-full flex flex-col overflow-y-auto">
      <div className="flex-1 p-4 space-y-3">
        <div>
          <label className="text-xs text-sindicato-warm-white/50 block mb-1">
            {t("clerk.contact.nameLabel")} *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setTouched((p) => ({ ...p, name: true }))}
            className={cn(
              "w-full px-4 py-2.5 rounded-xl bg-white/5 border text-sm text-sindicato-warm-white placeholder:text-sindicato-warm-white/30 outline-none transition-all duration-200",
              touched.name && !name.trim()
                ? "border-red-500/50"
                : "border-white/10 focus:border-white/20 focus:bg-white/[0.07]"
            )}
            placeholder={t("clerk.contact.namePlaceholder")}
          />
          {touched.name && !name.trim() && (
            <p className="text-[10px] text-red-400 mt-0.5">{t("clerk.contact.required")}</p>
          )}
        </div>

        <div>
          <label className="text-xs text-sindicato-warm-white/50 block mb-1">
            {t("clerk.contact.emailLabel")} *
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched((p) => ({ ...p, email: true }))}
            className={cn(
              "w-full px-4 py-2.5 rounded-xl bg-white/5 border text-sm text-sindicato-warm-white placeholder:text-sindicato-warm-white/30 outline-none transition-all duration-200",
              touched.email && (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
                ? "border-red-500/50"
                : "border-white/10 focus:border-white/20 focus:bg-white/[0.07]"
            )}
            placeholder={t("clerk.contact.emailPlaceholder")}
          />
          {touched.email && !email.trim() && (
            <p className="text-[10px] text-red-400 mt-0.5">{t("clerk.contact.required")}</p>
          )}
          {touched.email && email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
            <p className="text-[10px] text-red-400 mt-0.5">{t("clerk.contact.invalidEmail")}</p>
          )}
        </div>

        <div>
          <label className="text-xs text-sindicato-warm-white/50 block mb-1">
            {t("clerk.contact.subjectLabel")} *
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            onBlur={() => setTouched((p) => ({ ...p, category: true }))}
            className={cn(
              "w-full px-4 py-2.5 rounded-xl bg-white/5 border text-sm text-sindicato-warm-white outline-none transition-all duration-200 appearance-none",
              touched.category && !category
                ? "border-red-500/50"
                : "border-white/10 focus:border-white/20 focus:bg-white/[0.07]"
            )}
          >
            <option value="" className="bg-sindicato-charcoal">
              {t("clerk.contact.selectCategory")}
            </option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value} className="bg-sindicato-charcoal">
                {c.label}
              </option>
            ))}
          </select>
          {touched.category && !category && (
            <p className="text-[10px] text-red-400 mt-0.5">{t("clerk.contact.required")}</p>
          )}
        </div>

        <div>
          <label className="text-xs text-sindicato-warm-white/50 block mb-1">
            {t("clerk.contact.caseRefLabel")}{" "}
            <span className="text-sindicato-warm-white/30">{t("clerk.contact.caseRefOptional")}</span>
          </label>
          <input
            type="text"
            value={caseRef}
            onChange={(e) => setCaseRef(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-white/20 focus:bg-white/[0.07] text-sm text-sindicato-warm-white placeholder:text-sindicato-warm-white/30 outline-none transition-all duration-200"
            placeholder={t("clerk.contact.caseRefPlaceholder")}
          />
        </div>

        <div>
          <label className="text-xs text-sindicato-warm-white/50 block mb-1">
            {t("clerk.contact.messageLabel")} *
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onBlur={() => setTouched((p) => ({ ...p, message: true }))}
            rows={3}
            className={cn(
              "w-full px-4 py-2.5 rounded-xl bg-white/5 border text-sm text-sindicato-warm-white placeholder:text-sindicato-warm-white/30 outline-none transition-all duration-200 resize-none",
              touched.message && !message.trim()
                ? "border-red-500/50"
                : "border-white/10 focus:border-white/20 focus:bg-white/[0.07]"
            )}
            placeholder={t("clerk.contact.messagePlaceholder")}
          />
          {touched.message && !message.trim() && (
            <p className="text-[10px] text-red-400 mt-0.5">{t("clerk.contact.required")}</p>
          )}
        </div>

        <div>
          <label className="text-xs text-sindicato-warm-white/50 block mb-1">
            {t("clerk.contact.attachmentLabel")}{" "}
            <span className="text-sindicato-warm-white/30">{t("clerk.contact.attachmentOptional")}</span>
          </label>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
            className="hidden"
          />
          {file ? (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10">
              <Paperclip size={12} className="text-sindicato-warm-white/50" />
              <span className="text-xs text-sindicato-warm-white/70 truncate flex-1">
                {file.name}
              </span>
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="text-sindicato-warm-white/40 hover:text-sindicato-warm-white transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-dashed border-white/10 hover:border-white/20 hover:bg-white/[0.07] text-xs text-sindicato-warm-white/40 hover:text-sindicato-warm-white/60 transition-all duration-200 w-full"
            >
              <Paperclip size={12} />
              {t("clerk.contact.attachFile")}
            </button>
          )}
          {fileError && (
            <p className="text-[10px] text-red-400 mt-0.5">{fileError}</p>
          )}
        </div>

        {error && (
          <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
            {error}
          </p>
        )}
      </div>

      <div className="border-t border-white/5 bg-sindicato-smoked-charcoal/60 backdrop-blur-2xl px-4 py-3">
        <Button
          type="submit"
          onClick={handleSubmit}
          disabled={!isValid || isLoading}
          className="w-full bg-sindicato-bordeaux text-sindicato-warm-white hover:bg-sindicato-bordeaux/80 h-10 rounded-2xl shadow-lg shadow-bordeaux/20 transition-all duration-200"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 border-2 border-sindicato-warm-white/30 border-t-sindicato-warm-white rounded-full animate-spin" />
              {t("clerk.contact.sending")}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Send size={14} />
              {t("clerk.contact.sendMessage")}
            </div>
          )}
        </Button>
      </div>
    </form>
  );
}
