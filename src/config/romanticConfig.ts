/**
 * src/config/romanticConfig.ts
 *
 * Centralized Romantic Configuration for Happy Birthday Isha.
 * Edit this single file to customize all names, dates, quotes, chapter captions,
 * and the birthday love letter without touching any animation or component code.
 */

export type Locale = 'id' | 'en';

export interface LocalizedString {
  id: string;
  en: string;
}

export interface QuoteItem {
  id: string;
  text: LocalizedString;
}

export interface ChapterStory {
  id: string;
  chapterNumber: string;
  badge: LocalizedString;
  title: LocalizedString;
  subtitle: LocalizedString;
  quote: LocalizedString;
  description: LocalizedString;
}

export interface LoveLetterConfig {
  salutation: LocalizedString;
  paragraphs: LocalizedString[];
  closing: LocalizedString;
  signature: string;
  stampText: LocalizedString;
}

export interface RomanticConfig {
  recipientName: string;
  nickname: string;
  birthdayDate: string;
  recipient: {
    name: string;
    fullName: string;
    alternativeName: string;
    nickname: string;
    partnerName: string;
    birthdayDate: string;
    formattedDate: LocalizedString;
    milestoneYear: string;
  };
  audio: {
    trackUrl: string;
    title: string;
    artist: string;
    defaultVolume: number;
  };
  preloader: {
    supertitle: LocalizedString;
    title: LocalizedString;
    loadingStatus: LocalizedString;
    readyStatus: LocalizedString;
    buttonText: LocalizedString;
    buttonSubtext: LocalizedString;
    quotes: QuoteItem[];
  };
  hero: {
    badge: LocalizedString;
    supertitle: LocalizedString;
    headline: LocalizedString;
    subtitle: LocalizedString;
    dateBadge: LocalizedString;
    poeticHook: LocalizedString;
    scrollHint: LocalizedString;
  };
  childhood: {
    eyebrow: LocalizedString;
    title: LocalizedString;
    description: LocalizedString;
    captions: LocalizedString[];
  };
  chapters: {
    ishaSolo: { title: string; subtitle: string; quotes: string[] };
    coupleJourney: { title: string; subtitle: string; quotes: string[] };
    exclusiveReel: { title: string; subtitle: string; videoCaption: string };
  };
  stage2IshaStory: {
    sectionBadge: LocalizedString;
    sectionTitle: LocalizedString;
    sectionSubtitle: LocalizedString;
    viewAllButtonText: LocalizedString;
    chapters: ChapterStory[];
  };
  stage3ReyhanIsha: {
    sectionBadge: LocalizedString;
    sectionTitle: LocalizedString;
    description: LocalizedString;
    stickers: LocalizedString[];
  };
  stage4Exclusive: {
    sectionBadge: LocalizedString;
    sectionTitle: LocalizedString;
    marqueeDescription: LocalizedString;
    videoHeading: LocalizedString;
    videoCaption: LocalizedString;
    videoAudioHint: LocalizedString;
  };
  finale: {
    stampText: string;
    letterHeader: string;
    letterBody: string[];
    closingWish: string;
    signature: string;
  };
  stage5Finale: {
    sectionBadge: LocalizedString;
    envelopePrompt: LocalizedString;
    envelopeClosePrompt?: LocalizedString;
    letter: LoveLetterConfig;
    celebrationButton: LocalizedString;
    postConfettiMessage: LocalizedString;
    replayButton: LocalizedString;
  };
  secretGift?: {
    sectionTitle: LocalizedString;
    sectionSubtitle: LocalizedString;
    secretPrompt: LocalizedString;
    categories: { id: string; label: string; icon: string }[];
    placeholderWish: LocalizedString;
    placeholderNotes: LocalizedString;
    submitButton: LocalizedString;
    successTitle: LocalizedString;
    successMessage: LocalizedString;
    sendToWhatsAppButton: LocalizedString;
    whatsappNumber?: string;
  };
}

export const romanticConfig: RomanticConfig = {
  recipientName: 'Isha',
  nickname: 'Saa',
  birthdayDate: '26 Oktober',
  recipient: {
    name: 'Isha',
    fullName: 'Isha Alfitriani',
    alternativeName: 'Saa',
    nickname: 'Saa',
    partnerName: 'Reyhan',
    birthdayDate: '2005-10-26',
    formattedDate: {
      id: '26 Oktober 2005',
      en: 'October 26, 2005',
    },
    milestoneYear: '21',
  },

  audio: {
    trackUrl: '/audio/romantic_ambiance.mp3',
    title: 'Ambient',
    artist: 'For Isha (Saa)',
    defaultVolume: 0.65,
  },

  preloader: {
    supertitle: {
      id: 'BIRTHDAY SAA 💖',
      en: 'BIRTHDAY SAA 💖',
    },
    title: {
      id: 'Sebentar, lagi disiapin',
      en: 'One moment, getting things ready',
    },
    loadingStatus: {
      id: 'Memuat foto dan video kenangan...',
      en: 'Loading photos and videos...',
    },
    readyStatus: {
      id: 'Semua sudah siap',
      en: 'All set',
    },
    buttonText: {
      id: 'Buka',
      en: 'Open',
    },
    buttonSubtext: {
      id: 'Nyalakan suara biar lebih berasa',
      en: 'Turn your sound on',
    },
    quotes: [
      {
        id: 'q1',
        text: {
          id: 'Dari zaman TK sampai sekarang, ternyata sudah sejauh ini.',
          en: 'From kindergarten until now, we have come this far.',
        },
      },
      {
        id: 'q2',
        text: {
          id: 'Banyak hal berubah, tapi kita masih jalan bareng.',
          en: 'A lot has changed, but we are still walking together.',
        },
      },
      {
        id: 'q3',
        text: {
          id: 'Kumpulan foto dan video yang mungkin kamu sudah lupa.',
          en: 'Full of photos and clips you might have forgotten about.',
        },
      },
    ],
  },

  hero: {
    badge: {
      id: '26 Oktober 2005',
      en: 'October 26, 2005',
    },
    supertitle: {
      id: '26 Oktober 2005',
      en: 'October 26, 2005',
    },
    headline: {
      id: 'Selamat Ulang Tahun, Isha Alfitriani',
      en: 'Happy Birthday, Isha Alfitriani',
    },
    subtitle: {
      id: 'Untuk Saa • 21 Tahun',
      en: 'For Saa • 21 Years',
    },
    dateBadge: {
      id: '26 Oktober 2005 • 26 Oktober 2026',
      en: 'October 26, 2005 • October 26, 2026',
    },
    poeticHook: {
      id: 'Selamat 21 tahun, Saa. Ini rangkuman perjalanan hidup dan cerita kebersamaan kita sejauh ini.',
      en: 'Happy 21st, Saa. Here is a recap of your life journey and our days together so far.',
    },
    scrollHint: {
      id: 'Scroll ke bawah',
      en: 'Scroll down',
    },
  },

  childhood: {
    eyebrow: {
      id: 'Awal mula',
      en: 'Where it started',
    },
    title: {
      id: 'Sejak masih TK',
      en: 'Since kindergarten',
    },
    description: {
      id: 'Dua anak kecil yang belum tahu kalau nanti bakal tumbuh besar bareng.',
      en: 'Two little kids with no idea they would grow up side by side.',
    },
    captions: [
      { id: 'Masa TK', en: 'Kindergarten days' },
      { id: 'Masih kecil banget', en: 'So tiny back then' },
    ],
  },

  chapters: {
    ishaSolo: {
      title: 'Saa',
      subtitle: 'Kumpulan foto Saa',
      quotes: [],
    },
    coupleJourney: {
      title: 'Perjalanan kita',
      subtitle: 'Foto-foto kita berdua',
      quotes: [],
    },
    exclusiveReel: {
      title: 'Momen apa adanya',
      subtitle: 'Foto dan video',
      videoCaption: 'Beberapa video kecil.',
    },
  },

  stage2IshaStory: {
    sectionBadge: {
      id: 'Saa',
      en: 'Saa',
    },
    sectionTitle: {
      id: 'Saa dari waktu ke waktu',
      en: 'Saa through the years',
    },
    sectionSubtitle: {
      id: 'Sentuh foto untuk lihat lebih jelas',
      en: 'Tap any photo to view it larger',
    },
    viewAllButtonText: {
      id: 'Semua foto Saa',
      en: 'All photos of Saa',
    },
    chapters: [
      {
        id: 'chapter-smile',
        chapterNumber: '01',
        badge: { id: 'Senyum', en: 'Smile' },
        title: {
          id: 'Senyum yang khas',
          en: 'That signature smile',
        },
        subtitle: {
          id: 'Yang paling sering kelihatan',
          en: 'The one we see the most',
        },
        quote: {
          id: 'Hampir di setiap foto, senyumnya selalu sama.',
          en: 'In almost every photo, it is the same smile.',
        },
        description: {
          id: 'Geser terus ke bawah.',
          en: 'Keep scrolling.',
        },
      },
      {
        id: 'chapter-grace',
        chapterNumber: '02',
        badge: { id: 'Apa adanya', en: 'As she is' },
        title: {
          id: 'Sederhana dan apa adanya',
          en: 'Simple, just as she is',
        },
        subtitle: {
          id: 'Elegance without pretense',
          en: 'Elegance without pretense',
        },
        quote: {
          id: 'Nggak perlu banyak gaya, sudah cukup.',
          en: 'No need to try hard. It is already enough.',
        },
        description: {
          id: 'Dari yang rapi sampai yang lagi santai, semuanya tetap Saa.',
          en: 'Dressed up or laid back, it is always Saa.',
        },
      },
      {
        id: 'chapter-joy',
        chapterNumber: '03',
        badge: { id: 'Ceria', en: 'Joy' },
        title: {
          id: 'Yang bikin suasana rame',
          en: 'The one who livens things up',
        },
        subtitle: {
          id: 'Pure, authentic happiness',
          en: 'Pure, authentic happiness',
        },
        quote: {
          id: 'Tetap ceria terus ya, Saa.',
          en: 'Stay cheerful, Saa.',
        },
        description: {
          id: 'Ekspresi lucu dan tawa yang nggak dibuat-buat.',
          en: 'Goofy faces and laughter that is never forced.',
        },
      },
    ],
  },

  stage3ReyhanIsha: {
    sectionBadge: {
      id: 'Birthday Saa 💖',
      en: 'Birthday Saa 💖',
    },
    sectionTitle: {
      id: 'Jalan bareng sejauh ini',
      en: 'How far we have walked together',
    },
    description: {
      id: 'Dari sekolah, jalan-jalan, sampai hal-hal kecil sehari-hari. Terima kasih sudah selalu bareng.',
      en: 'School days, trips, and the small everyday things. Thanks for always being around.',
    },
    stickers: [
      { id: 'Jalan-jalan', en: 'Trips' },
      { id: 'Ngobrol', en: 'Long talks' },
      { id: 'Ketawa bareng', en: 'Laughing together' },
      { id: 'Hari-hari biasa', en: 'Ordinary days' },
      { id: 'Tumbuh bareng', en: 'Growing up together' },
      { id: 'Masih bareng', en: 'Still together' },
    ],
  },

  stage4Exclusive: {
    sectionBadge: {
      id: 'Rekaman',
      en: 'Footage',
    },
    sectionTitle: {
      id: 'Momen yang sempat terekam',
      en: 'Moments we happened to capture',
    },
    marqueeDescription: {
      id: 'Foto dan video candid. Sentuh untuk memutar atau memperbesar.',
      en: 'Candid photos and videos. Tap to play or enlarge.',
    },
    videoHeading: {
      id: 'Video',
      en: 'Video',
    },
    videoCaption: {
      id: 'Diputar otomatis saat kamu sampai di sini.',
      en: 'Plays automatically when you get here.',
    },
    videoAudioHint: {
      id: 'Sentuh untuk layar penuh dengan suara',
      en: 'Tap for fullscreen with sound',
    },
  },

  finale: {
    stampText: 'Untuk Saa',
    letterHeader: 'Saa,',
    letterBody: [],
    closingWish: 'Dari,',
    signature: 'Reyhan',
  },

  stage5Finale: {
    sectionBadge: {
      id: 'Terakhir',
      en: 'Lastly',
    },
    envelopePrompt: {
      id: 'Buka pesan',
      en: 'Open message',
    },
    envelopeClosePrompt: {
      id: 'Tutup pesan',
      en: 'Close message',
    },
    letter: {
      salutation: {
        id: 'Selamat ulang tahun sayanggg.. ❤️🩷',
        en: 'Happy birthday my love.. ❤️🩷',
      },
      paragraphs: [
        {
          id: 'Ga kerasa ya tiba tiba nambah umur ajaa, yang ke twenty :). Hari spesial ini banyak banget hal yang udah kamu lalui dari kamu lahirr, ketemu aku dan sampe sekarang.',
          en: 'Time flies so fast, suddenly another year older, turning twenty :). On this special day, there are so many things you have been through from when you were born, meeting me, and until right now.',
        },
        {
          id: 'Aku bahagia dan bersyukur banget bisa kenal kamu ayy, kamu selalu punya tempat di hati aku..',
          en: 'I am so truly happy and grateful to know you, you always hold a special place in my heart..',
        },
        {
          id: 'Makasih ya udah sabar, dukung dan nemenin aku, udah bikin hari hari aku jadi lebih seruu. Makasih juga udah bikin aku belajar banyak hal tentang pengertian.',
          en: 'Thank you for being patient, supporting and accompanying me, for making my days so much more fun. Thank you also for teaching me so much about understanding.',
        },
        {
          id: 'Semoga semua hal-hal baik datang ke kamuu,, kesehatan, rezeki yang lancar, semuaa urusan kamu dipermudah , apapun yang kamu semoga kan dapat tercapaii, kuliah dan hal apapun dilancarkan..',
          en: 'May all good things come to you, good health, smooth blessings, all your affairs made easy, whatever you wish for can be achieved, your studies and everything made smooth..',
        },
        {
          id: 'Kamu memang kuat dan mandiri ayy, dan aku yakin kamu bisa hadapin rintangan yang ada. Tapi aku mohon kamu jangan selalu hadapi sendiri, ada aku ayy yang bakal selalu support kamu, libatin aku di hari hari kamu. Apapun yang terjadi kita lewati bareng bareng..',
          en: 'You are indeed strong and independent, and I believe you can overcome any obstacle. But please don\'t always face it alone, I am here and will always support you, involve me in your days. Whatever happens, we will go through it together..',
        },
      ],
      closing: {
        id: 'Happy birthday my princess yang kicik imut gemazz 🩵🩵🩵🩵',
        en: 'Happy birthday my princess yang kicik imut gemazz 🩵🩵🩵🩵',
      },
      signature: 'Reyhan',
      stampText: {
        id: '26.10.2026',
        en: '26.10.2026',
      },
    },
    celebrationButton: {
      id: 'Rayakan',
      en: 'Celebrate',
    },
    postConfettiMessage: {
      id: 'Selamat ulang tahun yang ke-21 Sayang',
      en: 'Happy 21st birthday, dear',
    },
    replayButton: {
      id: 'Sekali lagi',
      en: 'Once more',
    },
  },

  secretGift: {
    sectionTitle: {
      id: 'Kotak Titip Kado Rahasia 🎁✨',
      en: 'Secret Gift Capsule 🎁✨',
    },
    sectionSubtitle: {
      id: 'Khusus buat Saa: titip kado atau wishlist apa pun yang lagi kamu pengenin',
      en: 'Exclusively for Saa: whisper any gift or wish you have been secretly hoping for',
    },
    secretPrompt: {
      id: 'Psst... Tulis apa pun yang kamu pengenin di sini, jangan malu-malu yaa. Seolah-olah rahasia ke bintang-bintang... tapi tenang, Reyhan bakal langsung peka! 🤫💖',
      en: 'Psst... Write down whatever you wish for here, don\'t be shy. Kept as a secret under the stars... but don\'t worry, Reyhan will secretly receive the signal! 🤫💖',
    },
    categories: [
      { id: 'kado', label: 'Wishlist Kado', icon: '🎁' },
      { id: 'fashion', label: 'Baju / Aksesoris', icon: '👗' },
      { id: 'kuliner', label: 'Makan Enak', icon: '🍣' },
      { id: 'trip', label: 'Jalan Bareng', icon: '🗺️' },
      { id: 'surprise', label: 'Surprise Me!', icon: '✨' },
    ],
    placeholderWish: {
      id: 'Mau kado apa nih? (contoh: tas, sepatu, novel, boneka, skincare, atau traktiran...)',
      en: 'What gift do you desire? (e.g., bag, shoes, novel, plushie, skincare, or a treat...)',
    },
    placeholderNotes: {
      id: 'Catatan tambahan / link / warna favorit (opsional)',
      en: 'Additional notes / link / favorite color (optional)',
    },
    submitButton: {
      id: 'Kunci & Titip ke Kotak Rahasia 🔒',
      en: 'Lock & Store in Secret Capsule 🔒',
    },
    successTitle: {
      id: 'Tersimpan Rahasia di Brankas! 🎀',
      en: 'Secretly Sealed in the Vault! 🎀',
    },
    successMessage: {
      id: 'Wishlist kado kamu sudah disegel rapat dengan pita emas. Reyhan bakal langsung tau kode rahasianya! 🤫✨',
      en: 'Your gift wish is sealed tight with golden ribbons. Reyhan will secretly receive the memo! 🤫✨',
    },
    sendToWhatsAppButton: {
      id: 'Bisikkan ke WA Reyhan Langsung 💌',
      en: 'Whisper Directly to Reyhan\'s WA 💌',
    },
    whatsappNumber: '',
  },
};

export function getRomanticText(localizedObj: LocalizedString, lang: Locale = 'id'): string {
  return localizedObj[lang] || localizedObj.id || localizedObj.en || '';
}
