import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required.';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required.';
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required.';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 1200);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  if (submitted) {
    return (
      <div className="p-8 sm:p-12 rounded-3xl bg-card border border-emerald-500/40 shadow-emerald-glow text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
          <CheckCircle2 size={32} />
        </div>
        <h3 className="text-2xl font-bold text-gray-100">Message Sent Successfully</h3>
        <p className="text-sm text-gray-400 max-w-md mx-auto">
          Thank you for reaching out. I have received your message and will get back to you promptly.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-4 px-6 py-2.5 rounded-xl bg-card border border-card-border text-emerald-400 font-semibold text-sm hover:bg-card-hover transition-all"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-3xl bg-card border border-card-border shadow-xl space-y-5" noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Name */}
        <div className="space-y-1.5">
          <label htmlFor="name" className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
            Your Name <span className="text-emerald-400">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'name-error' : undefined}
            placeholder="Ahmed Atef"
            className={`w-full px-4 py-3 rounded-xl bg-canvas border text-gray-100 placeholder-gray-500 text-sm focus:outline-none focus:ring-2 transition-all ${
              errors.name ? 'border-red-500 focus:ring-red-500' : 'border-card-border focus:border-emerald-500 focus:ring-emerald-500/30'
            }`}
          />
          {errors.name && (
            <p id="name-error" className="text-xs text-red-400 flex items-center gap-1 mt-1">
              <AlertCircle size={12} /> {errors.name}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
            Your Email <span className="text-emerald-400">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
            placeholder="name@example.com"
            className={`w-full px-4 py-3 rounded-xl bg-canvas border text-gray-100 placeholder-gray-500 text-sm focus:outline-none focus:ring-2 transition-all ${
              errors.email ? 'border-red-500 focus:ring-red-500' : 'border-card-border focus:border-emerald-500 focus:ring-emerald-500/30'
            }`}
          />
          {errors.email && (
            <p id="email-error" className="text-xs text-red-400 flex items-center gap-1 mt-1">
              <AlertCircle size={12} /> {errors.email}
            </p>
          )}
        </div>
      </div>

      {/* Subject */}
      <div className="space-y-1.5">
        <label htmlFor="subject" className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
          Subject <span className="text-emerald-400">*</span>
        </label>
        <input
          type="text"
          id="subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          aria-invalid={!!errors.subject}
          aria-describedby={errors.subject ? 'subject-error' : undefined}
          placeholder="Frontend Internship Opportunity"
          className={`w-full px-4 py-3 rounded-xl bg-canvas border text-gray-100 placeholder-gray-500 text-sm focus:outline-none focus:ring-2 transition-all ${
            errors.subject ? 'border-red-500 focus:ring-red-500' : 'border-card-border focus:border-emerald-500 focus:ring-emerald-500/30'
          }`}
        />
        {errors.subject && (
          <p id="subject-error" className="text-xs text-red-400 flex items-center gap-1 mt-1">
            <AlertCircle size={12} /> {errors.subject}
          </p>
        )}
      </div>

      {/* Message */}
      <div className="space-y-1.5">
        <label htmlFor="message" className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
          Message <span className="text-emerald-400">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          value={formData.message}
          onChange={handleChange}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? 'message-error' : undefined}
          placeholder="Hello Ahmed, we would like to discuss a frontend role..."
          className={`w-full px-4 py-3 rounded-xl bg-canvas border text-gray-100 placeholder-gray-500 text-sm focus:outline-none focus:ring-2 transition-all resize-none ${
            errors.message ? 'border-red-500 focus:ring-red-500' : 'border-card-border focus:border-emerald-500 focus:ring-emerald-500/30'
          }`}
        />
        {errors.message && (
          <p id="message-error" className="text-xs text-red-400 flex items-center gap-1 mt-1">
            <AlertCircle size={12} /> {errors.message}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full inline-flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-emerald-500 text-canvas font-semibold hover:bg-emerald-400 transition-all shadow-emerald-glow disabled:opacity-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-canvas"
      >
        {isSubmitting ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            <span>Sending Message...</span>
          </>
        ) : (
          <>
            <Send size={18} />
            <span>Send Message</span>
          </>
        )}
      </button>
    </form>
  );
};
