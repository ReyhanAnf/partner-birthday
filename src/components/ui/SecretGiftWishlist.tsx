import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Lock, Sparkles, Send, CheckCircle2, KeyRound, Trash2, Copy, Heart, ShieldAlert } from 'lucide-react';
import confetti from 'canvas-confetti';
import { romanticConfig, Locale, getRomanticText } from '@/config/romanticConfig';

interface WishItem {
  id: string;
  createdAt: string;
  category: string;
  wish: string;
  notes?: string;
}

const STORAGE_KEY = 'isha_secret_gift_wishlist';

interface SecretGiftWishlistProps {
  locale?: Locale;
}

export const SecretGiftWishlist: React.FC<SecretGiftWishlistProps> = ({ locale = 'id' }) => {
  const config = romanticConfig.secretGift;

  const [selectedCategory, setSelectedCategory] = useState<string>('kado');
  const [wishText, setWishText] = useState<string>('');
  const [notesText, setNotesText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSealed, setIsSealed] = useState<boolean>(false);
  const [lastSubmittedWish, setLastSubmittedWish] = useState<WishItem | null>(null);

  // Reyhan Secret Vault modal
  const [isVaultOpen, setIsVaultOpen] = useState<boolean>(false);
  const [savedWishes, setSavedWishes] = useState<WishItem[]>([]);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  // Load existing wishes on mount
  useEffect(() => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        setSavedWishes(JSON.parse(data));
      }
    } catch {
      // LocalStorage access handling
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wishText.trim()) return;

    setIsSubmitting(true);

    const categoryObj = config?.categories.find((c) => c.id === selectedCategory);
    const categoryLabel = categoryObj ? `${categoryObj.icon} ${categoryObj.label}` : selectedCategory;

    const newItem: WishItem = {
      id: `wish_${Date.now()}`,
      createdAt: new Date().toLocaleString('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
      category: categoryLabel,
      wish: wishText.trim(),
      notes: notesText.trim() || undefined,
    };

    const updatedList = [newItem, ...savedWishes];
    setSavedWishes(updatedList);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    } catch {
      // Ignore storage errors
    }

    setLastSubmittedWish(newItem);
    setIsSubmitting(false);
    setIsSealed(true);

    // Magical confetti burst
    try {
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.8 },
        colors: ['#F43F5E', '#EC4899', '#FBBF24', '#A855F7', '#38BDF8'],
      });
    } catch {
      // Canvas error fallback
    }
  };

  const handleResetForm = () => {
    setWishText('');
    setNotesText('');
    setIsSealed(false);
  };

  const handleSendToWhatsApp = () => {
    if (!lastSubmittedWish) return;

    const waNumber = config?.whatsappNumber ? config.whatsappNumber.replace(/[^0-9]/g, '') : '';
    const message =
      `Hai ayy! 🎁 Aku baru aja titip kado rahasia di web ulang tahunku nih:\n\n` +
      `✨ Kategori: ${lastSubmittedWish.category}\n` +
      `💖 Keinginan: ${lastSubmittedWish.wish}\n` +
      (lastSubmittedWish.notes ? `📌 Catatan: ${lastSubmittedWish.notes}\n\n` : '\n') +
      `Biar kamu langsung peka hehe 🤫💖`;

    const encoded = encodeURIComponent(message);
    const waUrl = waNumber
      ? `https://wa.me/${waNumber}?text=${encoded}`
      : `https://api.whatsapp.com/send?text=${encoded}`;

    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleDeleteWish = (id: string) => {
    const updated = savedWishes.filter((w) => w.id !== id);
    setSavedWishes(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  const handleCopyAllWishes = () => {
    if (savedWishes.length === 0) return;
    const text = savedWishes
      .map(
        (w, i) =>
          `#${i + 1} [${w.category}] - ${w.createdAt}\nKeinginan: ${w.wish}${
            w.notes ? `\nCatatan: ${w.notes}` : ''
          }\n`
      )
      .join('\n-------------------\n\n');

    navigator.clipboard?.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2200);
  };

  if (!config) return null;

  return (
    <div className="relative w-full max-w-2xl mx-auto mt-16 px-4">
      {/* Glow Halo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-2 bg-gradient-to-r from-rose-600/20 via-pink-500/15 to-amber-500/20 rounded-[2.5rem] blur-2xl opacity-75"
      />

      <div className="relative rounded-[2.2rem] bg-gradient-to-b from-[#140F27]/95 via-[#0D1022]/95 to-[#090B16]/95 border border-rose-300/30 p-6 sm:p-10 shadow-[0_25px_80px_rgba(0,0,0,0.85)] backdrop-blur-2xl overflow-hidden">
        {/* Subtle Decorative Star Ribbon */}
        <div className="flex items-center justify-between border-b border-white/10 pb-5 mb-7">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-400/30 flex items-center justify-center text-rose-300 shadow-inner">
              <Gift className="w-5 h-5 text-rose-300 animate-pulse" />
            </div>
            <div>
              <h3 className="font-serif italic text-2xl sm:text-3xl text-rose-100 font-semibold tracking-wide flex items-center gap-2">
                {getRomanticText(config.sectionTitle, locale)}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300/80 font-light mt-0.5">
                {getRomanticText(config.sectionSubtitle, locale)}
              </p>
            </div>
          </div>

          {/* Secret Reyhan Vault Button (Discreet lock/key) */}
          <button
            type="button"
            onClick={() => setIsVaultOpen(true)}
            title="Brankas Rahasia Reyhan"
            className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-200 border border-white/10 transition-colors"
          >
            <KeyRound className="w-4 h-4" />
          </button>
        </div>

        {/* Secret Prompt Whisper */}
        <div className="mb-6 p-4 rounded-2xl bg-rose-950/30 border border-rose-400/20 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-rose-100/90 leading-relaxed font-light">
            {getRomanticText(config.secretPrompt, locale)}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!isSealed ? (
            /* Input Form State */
            <motion.form
              key="wish-form"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {/* Category Pills */}
              <div>
                <label className="block text-xs font-serif uppercase tracking-widest text-amber-200/80 mb-2.5">
                  Kategori Keinginan
                </label>
                <div className="flex flex-wrap gap-2">
                  {config.categories.map((cat) => {
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 border cursor-pointer ${
                          isSelected
                            ? 'bg-rose-500 text-white border-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.4)] scale-105'
                            : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:border-white/20'
                        }`}
                      >
                        <span>{cat.icon}</span>
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Wishlist Main Input */}
              <div>
                <label className="block text-xs font-serif uppercase tracking-widest text-amber-200/80 mb-2">
                  Apa yang lagi dipengenin? <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={wishText}
                  onChange={(e) => setWishText(e.target.value)}
                  placeholder={getRomanticText(config.placeholderWish, locale)}
                  className="w-full px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/15 focus:border-rose-400 focus:bg-white/[0.07] focus:outline-none focus:ring-1 focus:ring-rose-400 text-sm text-slate-100 placeholder:text-slate-500 transition-all resize-none leading-relaxed"
                />
              </div>

              {/* Optional Notes / Links */}
              <div>
                <label className="block text-xs font-serif uppercase tracking-widest text-amber-200/80 mb-2">
                  Catatan Tambahan (Opsional)
                </label>
                <input
                  type="text"
                  value={notesText}
                  onChange={(e) => setNotesText(e.target.value)}
                  placeholder={getRomanticText(config.placeholderNotes, locale)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 focus:border-rose-400 focus:bg-white/[0.07] focus:outline-none focus:ring-1 focus:ring-rose-400 text-sm text-slate-100 placeholder:text-slate-500 transition-all"
                />
              </div>

              {/* Submit CTA */}
              <motion.button
                type="submit"
                disabled={isSubmitting || !wishText.trim()}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-600 to-amber-500 text-white font-serif tracking-wider font-medium text-sm sm:text-base shadow-[0_10px_30px_rgba(244,63,94,0.4)] hover:shadow-[0_15px_45px_rgba(244,63,94,0.6)] flex items-center justify-center gap-2.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>{getRomanticText(config.submitButton, locale)}</span>
              </motion.button>
            </motion.form>
          ) : (
            /* Success / Sealed Envelope State */
            <motion.div
              key="wish-success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="py-4 text-center flex flex-col items-center"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-rose-500 to-amber-400 p-0.5 shadow-[0_0_35px_rgba(244,63,94,0.6)] mb-4">
                <div className="w-full h-full rounded-full bg-[#120E22] flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-rose-300" />
                </div>
              </div>

              <h4 className="font-serif text-2xl text-rose-100 font-semibold mb-2">
                {getRomanticText(config.successTitle, locale)}
              </h4>
              <p className="text-sm text-slate-300 font-light max-w-md leading-relaxed mb-6">
                {getRomanticText(config.successMessage, locale)}
              </p>

              {/* Wish Recap Card */}
              {lastSubmittedWish && (
                <div className="w-full max-w-md p-4 rounded-2xl bg-white/[0.04] border border-rose-300/20 text-left mb-6 space-y-1.5 shadow-inner">
                  <div className="flex items-center justify-between text-xs text-amber-200/90 font-mono">
                    <span>{lastSubmittedWish.category}</span>
                    <span>{lastSubmittedWish.createdAt}</span>
                  </div>
                  <p className="text-sm text-slate-100 font-medium">"{lastSubmittedWish.wish}"</p>
                  {lastSubmittedWish.notes && (
                    <p className="text-xs text-slate-400 italic">Catatan: {lastSubmittedWish.notes}</p>
                  )}
                </div>
              )}

              {/* WhatsApp Whisper Action */}
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
                <motion.button
                  type="button"
                  onClick={handleSendToWhatsApp}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-medium text-xs sm:text-sm shadow-[0_8px_25px_rgba(16,185,129,0.35)] hover:shadow-[0_12px_35px_rgba(16,185,129,0.5)] flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>{getRomanticText(config.sendToWhatsAppButton, locale)}</span>
                </motion.button>

                <button
                  type="button"
                  onClick={handleResetForm}
                  className="w-full sm:w-auto px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs sm:text-sm transition-colors border border-white/10 cursor-pointer"
                >
                  Titip Lainnya
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* REYHAN SECRET VAULT MODAL (For Reyhan to inspect all wishes) */}
      <AnimatePresence>
        {isVaultOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              className="relative w-full max-w-lg rounded-3xl bg-[#140F27] border border-rose-400/40 p-6 sm:p-8 shadow-[0_30px_90px_rgba(0,0,0,0.9)] max-h-[85vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-rose-500/20 text-rose-300">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-serif text-xl text-rose-100 font-semibold">
                      Brankas Titip Kado Reyhan
                    </h4>
                    <p className="text-xs text-slate-400">
                      Semua wishlist & titip kado yang diinputkan oleh Saa
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsVaultOpen(false)}
                  className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-white/10"
                >
                  ✕
                </button>
              </div>

              {/* Wishes List */}
              <div className="overflow-y-auto space-y-3 pr-1 flex-1">
                {savedWishes.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-sm">
                    <Heart className="w-8 h-8 text-rose-500/40 mx-auto mb-2 animate-bounce" />
                    <p>Belum ada titip kado yang diinputkan Saa.</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Saat Saa mengisi form di atas, datanya langsung muncul di sini!
                    </p>
                  </div>
                ) : (
                  savedWishes.map((item, idx) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 relative group hover:border-rose-400/30 transition-all"
                    >
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-semibold text-amber-300">{item.category}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-400 font-mono">{item.createdAt}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteWish(item.id)}
                            title="Hapus item ini"
                            className="text-slate-500 hover:text-rose-400 opacity-60 hover:opacity-100 transition-opacity p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-slate-100 font-medium leading-relaxed">{item.wish}</p>
                      {item.notes && (
                        <p className="text-xs text-slate-400 mt-1 bg-black/20 p-2 rounded-lg border border-white/5">
                          📌 <span className="italic">{item.notes}</span>
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Modal Footer */}
              {savedWishes.length > 0 && (
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleCopyAllWishes}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-200 border border-white/10 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copySuccess ? 'Tersalin ke Clipboard!' : 'Salin Semua Wishlist'}</span>
                  </button>

                  <span className="text-xs text-slate-500 font-mono">
                    Total: {savedWishes.length} permintaan
                  </span>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
