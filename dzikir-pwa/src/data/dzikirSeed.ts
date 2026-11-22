export type DzikirCategory = 'sholat' | 'harian' | 'ketenangan'

export type MeaningLevel = 1 | 2 | 3

export interface DzikirMeanings {
  /** Makna inti (bahasa). Terbuka sejak hitungan 0. */
  level1: string
  /** Manfaat & keutamaan. Terbuka di 100 hitungan seumur hidup. */
  level2: string
  /** Refleksi praktis harian. Terbuka di 333 hitungan seumur hidup. */
  level3: string
}

export interface DzikirItem {
  id: string
  title: string
  category: DzikirCategory
  arabic: string
  transliteration: string
  translation: string
  defaultTarget: number
  sourceRef: string
  meanings: DzikirMeanings
}

export const DEFAULT_DZIKIR_ID = 'tasbih'

/** Ambang hitungan seumur hidup untuk membuka tiap level makna. */
export const LEVEL_THRESHOLDS: Record<MeaningLevel, number> = {
  1: 0,
  2: 100,
  3: 333,
}

export const CATEGORY_LABELS: Record<DzikirCategory, string> = {
  sholat: 'Sholat',
  harian: 'Harian',
  ketenangan: 'Ketenangan',
}

export function getUnlockedLevel(lifetimeCount: number): MeaningLevel {
  if (lifetimeCount >= LEVEL_THRESHOLDS[3]) return 3
  if (lifetimeCount >= LEVEL_THRESHOLDS[2]) return 2
  return 1
}

export const DZIKIR_SEED: DzikirItem[] = [
  {
    id: 'tasbih',
    title: 'Tasbih',
    category: 'sholat',
    arabic: 'سُبْحَانَ اللّٰهِ',
    transliteration: 'Subhanallah',
    translation: 'Maha Suci Allah.',
    defaultTarget: 33,
    sourceRef: 'HR. Bukhari & Muslim',
    meanings: {
      level1:
        "Subhanallah berarti 'Maha Suci Allah': menyucikan Allah dari segala kekurangan, cela, dan sifat yang tidak layak bagi-Nya.",
      level2:
        'Termasuk kalimat yang ringan di lisan namun berat di timbangan amal. Setelah shalat, tasbih 33x bersama tahmid 33x dan takbir 34x adalah amalan yang dianjurkan Nabi ﷺ.',
      level3:
        'Saat kagum pada alam, atau saat tergoda mengeluh, ucapkan tasbih untuk mengingat bahwa Allah Maha Sempurna dan rencana-Nya tidak pernah cacat. Jadikan ia jeda kecil sebelum bereaksi.',
    },
  },
  {
    id: 'tahmid',
    title: 'Tahmid',
    category: 'sholat',
    arabic: 'اَلْحَمْدُ لِلّٰهِ',
    transliteration: 'Alhamdulillah',
    translation: 'Segala puji bagi Allah.',
    defaultTarget: 33,
    sourceRef: 'HR. Muslim',
    meanings: {
      level1:
        "Alhamdulillah berarti 'Segala puji bagi Allah': pengakuan bahwa semua nikmat dan kebaikan bersumber dari-Nya.",
      level2:
        'Rasulullah ﷺ menyebut bahwa alhamdulillah memenuhi timbangan amal. Syukur juga menjadi sebab bertambahnya nikmat (QS. Ibrahim: 7).',
      level3:
        'Sebelum tidur, ingat tiga hal kecil yang patut disyukuri hari ini, lalu ucapkan alhamdulillah untuk masing-masing. Syukur yang dilatih membuat hati lebih lapang.',
    },
  },
  {
    id: 'takbir',
    title: 'Takbir',
    category: 'sholat',
    arabic: 'اَللّٰهُ أَكْبَرُ',
    transliteration: 'Allahu Akbar',
    translation: 'Allah Maha Besar.',
    defaultTarget: 34,
    sourceRef: 'HR. Muslim',
    meanings: {
      level1:
        "Allahu Akbar berarti 'Allah Maha Besar': lebih besar dari semua masalah, rasa takut, dan keinginan kita.",
      level2:
        'Takbir menyempurnakan hitungan 100 dzikir setelah shalat (33 tasbih, 33 tahmid, 34 takbir). Ia juga termasuk empat kalimat yang paling dicintai Allah.',
      level3:
        'Ketika sebuah beban terasa terlalu besar, ucapkan takbir dan ingat bahwa ada Zat yang lebih besar dari beban itu. Latih diri mengecilkan masalah dengan mengagungkan-Nya.',
    },
  },
  {
    id: 'istighfar',
    title: 'Istighfar',
    category: 'ketenangan',
    arabic: 'أَسْتَغْفِرُ اللّٰهَ',
    transliteration: 'Astaghfirullah',
    translation: 'Aku memohon ampun kepada Allah.',
    defaultTarget: 100,
    sourceRef: 'HR. Bukhari & Muslim',
    meanings: {
      level1:
        "Astaghfirullah berarti 'Aku memohon ampun kepada Allah': pengakuan atas kelemahan diri dan kebutuhan akan ampunan-Nya.",
      level2:
        'Nabi ﷺ beristighfar sekitar 70 hingga 100 kali sehari. Allah juga menjanjikan keluasan rezeki dan kebaikan bagi hamba yang memohon ampun (QS. Nuh: 10-12).',
      level3:
        'Di akhir hari, ingat satu kesalahan yang ingin kamu perbaiki, beristighfarlah dengan tulus, lalu maafkan dirimu dengan niat berbenah. Pintu taubat selalu terbuka.',
    },
  },
  {
    id: 'tahlil',
    title: 'Tahlil',
    category: 'harian',
    arabic: 'لَا إِلٰهَ إِلَّا اللّٰهُ',
    transliteration: 'La ilaha illallah',
    translation: 'Tiada tuhan yang berhak disembah selain Allah.',
    defaultTarget: 100,
    sourceRef: 'HR. Tirmidzi & Bukhari',
    meanings: {
      level1:
        "La ilaha illallah berarti 'Tiada tuhan yang berhak disembah selain Allah': inti tauhid dan fondasi keimanan.",
      level2:
        'Rasulullah ﷺ bersabda bahwa dzikir yang paling utama adalah La ilaha illallah (HR. Tirmidzi). Orang yang paling berbahagia dengan syafaat beliau adalah yang mengucapkannya ikhlas dari hatinya (HR. Bukhari).',
      level3:
        'Saat bergantung pada banyak hal (pekerjaan, penilaian orang, hasil), ucapkan tahlil untuk menata ulang hati: hanya Allah tempat bergantung yang sebenarnya. Lepaskan satu kekhawatiran hari ini.',
    },
  },
  {
    id: 'ayat-kursi',
    title: "Ta'awudz & Ayat Kursi",
    category: 'ketenangan',
    arabic: 'أَعُوذُ بِاللَّهِ مِنْ الشَّيْطَانِ الرَّجِيمِ اللَّهُ لاَ إِلَهَ إِلاَّ هُوَ الْحَيُّ الْقَيُّومُ، لاَ تَأْخُذُهُ سِنَةٌ وَلاَ نَوْمٌ، لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ، مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلاَّ بِإِذْنِهِ، يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ، وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلاَّ بِمَا شَاءَ، وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ، وَلَا يَئُودُهُ حِفْظُهُمَا، وَهُوَ الْعَلِيُّ الْعَظِيمُ',
    transliteration: "A'uudzu billaahi minasy syaithaanir rajiim. Allaahu laa ilaaha illaa huwal hayyul qayyuum, laa ta'khudzuhuu sinatuw wa laa na'uum, lahuu maa fis samaawaati wa maa fil ardh, man dzalladzii yasyfa'u 'indahuu illaa bi-idznih, ya'lamu maa baina aidiihim wa maa khalfahum, wa laa yuhiithuuna bisyai-im min 'ilmihii illaa bimaa syaa-a, wasi'a kursiyyuhus samaawaati wal ardh, wa laa ya-uuduhuu hifzhuhumaa, wa huwal 'aliyyul 'azhiim.",
    translation: 'Aku berlindung kepada Allah dari godaan syaitan yang terkutuk. Allah, tidak ada tuhan selain Dia, Yang Maha Hidup, Yang terus-menerus mengurus makhluk-Nya, tidak mengantuk dan tidak tidur. Milik-Nya apa yang ada di langit dan di bumi. Tiada yang dapat memberi syafaat di sisi-Nya tanpa izin-Nya. Dia mengetahui apa yang di hadapan mereka dan apa yang di belakang mereka, dan mereka tidak mengetahui sesuatu apa pun dari ilmu-Nya melainkan apa yang Dia kehendaki. Kursi-Nya meliputi langit dan bumi, dan Dia tidak merasa berat memelihara keduanya, dan Dia Maha Tinggi lagi Maha Agung.',
    defaultTarget: 1,
    sourceRef: "HR. An-Nasa'i, Ath-Thabrani, Al-Hakim",
    meanings: {
      level1:
        "Ta'awudz adalah permohonan perlindungan kepada Allah dari godaan syaitan yang terkutuk. Ayat Kursi menegaskan keagungan Allah: Dia Yang Hidup Kekal, tidak mengantuk dan tidak tidur, dan kursi-Nya meliputi langit dan bumi.",
      level2:
        "Ayat Kursi dibaca pagi dan petang untuk memohon perlindungan. Haditsnya diriwayatkan An-Nasa'i dalam 'Amalul Yaum wal Lailah dan Ath-Thabrani, serta dinilai shahih oleh Syaikh Al-Albani.",
      level3:
        'Saat merasa rentan atau cemas, ingat bahwa Allah tidak pernah lengah menjaga langit dan bumi. Jadikan ayat ini tempat berlindung sebelum menghadapi hari.',
    },
  },
  {
    id: 'al-ikhlas',
    title: 'Al-Ikhlas',
    category: 'ketenangan',
    arabic: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ قُلْ هُوَ اللَّهُ أَحَدٌ اللَّهُ الصَّمَدُ لَمْ يَلِدْ وَلَمْ يُولَدْ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ',
    transliteration: "Qul huwallaahu ahad, Allaahush shamad, lam yalid wa lam yuulad, wa lam yakul lahuu kufuwan ahad.",
    translation: 'Katakanlah: Dia-lah Allah Yang Maha Esa. Allah adalah tempat bergantung segala sesuatu. Dia tidak beranak dan tidak pula diperanakkan, dan tidak ada sesuatu pun yang setara dengan-Nya.',
    defaultTarget: 3,
    sourceRef: "HR. Abu Dawud, At-Tirmidzi, An-Nasa'i",
    meanings: {
      level1:
        'Surat Al-Ikhlas menegaskan keesaan Allah: Dia Maha Esa, tempat bergantung segala sesuatu, tidak beranak dan tidak diperanakkan, dan tidak ada yang setara dengan-Nya.',
      level2:
        "Bersama Al-Falaq dan An-Naas, surat ini termasuk Al-Mu'awwidzaat yang dibaca pagi dan petang sebagai perlindungan. Haditsnya diriwayatkan Abu Dawud, At-Tirmidzi, dan An-Nasa'i.",
      level3:
        'Saat hati terasa penuh kekhawatiran, ulangi keyakinan bahwa hanya Allah tempat bergantung yang sebenarnya. Jadikan surat ini pengingat bahwa tidak ada sandaran lain yang setara dengan-Nya.',
    },
  },
  {
    id: 'al-falaq',
    title: 'Al-Falaq',
    category: 'ketenangan',
    arabic: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ مِن شَرِّ مَا خَلَقَ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ',
    transliteration: "Qul a'uudzu birabbil falaq, min syarri maa khalaq, wa min syarri ghaasiqin idzaa waqab, wa min syarrin naffaatsaati fil 'uqad, wa min syarri haasidin idzaa hasad.",
    translation: 'Katakanlah: Aku berlindung kepada Rabb yang menguasai waktu subuh, dari kejahatan makhluk yang Dia ciptakan, dan dari kejahatan malam apabila telah gelap gulita, dan dari kejahatan wanita-wanita penyihir yang meniup pada buhul-buhulnya, serta dari kejahatan orang yang dengki apabila dia dengki.',
    defaultTarget: 3,
    sourceRef: "HR. Abu Dawud, At-Tirmidzi, An-Nasa'i",
    meanings: {
      level1:
        'Surat Al-Falaq memohon perlindungan kepada Rabb yang menguasai waktu Subuh dari berbagai kejahatan: kejahatan makhluk-Nya, malam yang gelap gulita, tukang sihir yang meniup pada buhul, dan kedengkian orang yang dengki.',
      level2:
        "Termasuk Al-Mu'awwidzaat yang dibaca pagi dan petang bersama Al-Ikhlas dan An-Naas. Haditsnya diriwayatkan Abu Dawud, At-Tirmidzi, dan An-Nasa'i, dan dinilai hasan shahih oleh At-Tirmidzi.",
      level3:
        "Setiap kali merasa iri atau terganggu oleh niat buruk orang lain, mintalah perlindungan kepada Allah. Lalu doakan kebaikan bagi orang tersebut, agar hati tetap bersih.",
    },
  },
  {
    id: 'an-naas',
    title: 'An-Naas',
    category: 'ketenangan',
    arabic: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ قُلْ أَعُوذُ بِرَبِّ النَّاسِ مَلِكِ النَّاسِ إِلَهِ النَّاسِ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ مِنَ الْجِنَّةِ وَ النَّاسِ',
    transliteration: "Qul a'uudzu birabbin naas, malikin naas, ilaahin naas, min syarril waswaasil khannaas, alladzii yuwaswisu fii shuduurin naas, minal jinnati wan naas.",
    translation: 'Katakanlah: Aku berlindung kepada Rabb manusia, Raja manusia, Sembahan manusia, dari kejahatan bisikan syaitan yang bersembunyi, yang membisikkan kejahatan ke dalam dada manusia, dari golongan jin dan manusia.',
    defaultTarget: 3,
    sourceRef: "HR. Abu Dawud, At-Tirmidzi, An-Nasa'i",
    meanings: {
      level1:
        'Surat An-Naas memohon perlindungan kepada Allah sebagai Rabb, Raja, dan Sembahan manusia, dari bisikan syaitan yang bersembunyi dan membisikkan keburukan ke dalam dada manusia, baik dari golongan jin maupun manusia.',
      level2:
        "Termasuk Al-Mu'awwidzaat yang dibaca pagi dan petang bersama Al-Ikhlas dan Al-Falaq. Haditsnya diriwayatkan Abu Dawud, At-Tirmidzi, dan An-Nasa'i.",
      level3:
        'Saat pikiran dipenuhi bisikan yang meresahkan, berlindunglah kepada Rabb manusia, lalu tenangkan hati dengan menyebut nama-Nya.',
    },
  },
  {
    id: 'pagi-memasuki',
    title: 'Memasuki Pagi',
    category: 'harian',
    arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَـهَ إِلاَّ اللهُ وَحْدَهُ لاَ شَرِيْكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيْرُ. رَبِّ أَسْأَلُكَ خَيْرَ مَا فِيْ هَذَا الْيَوْمِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوْذُ بِكَ مِنْ شَرِّ مَا فِيْ هَذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ، رَبِّ أَعُوْذُ بِكَ مِنَ الْكَسَلِ وَسُوْءِ الْكِبَرِ، رَبِّ أَعُوْذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ',
    transliteration: "Ashbahnaa wa ashbahal mulku lillaah, wal hamdu lillaah, laa ilaaha illallaahu wahdahu laa syariikalah, lahul mulku wa lahul hamdu wa huwa 'alaa kulli syai-in qadiir. Rabbi as-aluka khaira maa fii haadzal yaumi wa khaira maa ba'dahu, wa a'uudzu bika min syarri maa fii haadzal yaumi wa syarri maa ba'dahu, rabbi a'uudzu bika minal kasali wa suu-il kibar, rabbi a'uudzu bika min 'adzaabin fin naari wa 'adzaabin fil qabr.",
    translation: 'Kami berpagi hari dan berpagi hari pula kerajaan milik Allah, segala puji bagi Allah, tiada ilah yang berhak disembah selain Allah semata yang tiada sekutu bagi-Nya. Bagi-Nya kerajaan dan bagi-Nya pujian dan Dia Maha Kuasa atas segala sesuatu. Wahai Rabb, aku memohon kepada-Mu kebaikan hari ini dan kebaikan setelahnya, dan aku berlindung kepada-Mu dari keburukan hari ini dan keburukan setelahnya. Wahai Rabb, aku berlindung kepada-Mu dari kemalasan dan keburukan masa tua, aku berlindung kepada-Mu dari siksa neraka dan siksa kubur.',
    defaultTarget: 1,
    sourceRef: 'HR. Muslim',
    meanings: {
      level1:
        'Pengakuan bahwa kita memasuki pagi dalam kekuasaan Allah. Dzikir ini memohon kebaikan hari ini dan sesudahnya, serta perlindungan dari kejahatannya, dari kemalasan, dari kejelekan di masa tua, dan dari siksa neraka serta kubur.',
      level2:
        "Dibaca sekali di pagi hari sebagai pengakuan bahwa segala kerajaan dan pujian hanya milik Allah. Haditsnya diriwayatkan Muslim dari Ibnu Mas'ud.",
      level3:
        'Sebelum aktivitas dimulai, ucapkan dzikir ini untuk menata niat: memohon kebaikan hari ini dan menjauh dari hal yang melalaikan, termasuk kemalasan.',
    },
  },
  {
    id: 'sore-memasuki',
    title: 'Memasuki Sore',
    category: 'harian',
    arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ للهِ، وَالْحَمْدُ للهِ، لَا إِلَهَ إِلاَّ اللهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذِهِ اللَّيْلَةِ وَخَيْرَ مَا بَعْدَهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذِهِ اللَّيْلَةِ وَشَرِّ مَا بَعْدَهَا، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ',
    transliteration: "Amsainaa wa amsal mulku lillaah, wal hamdu lillaah, laa ilaaha illallaahu wahdahu laa syariikalah, lahul mulku wa lahul hamdu wa huwa 'alaa kulli syai-in qadiir. Rabbi as-aluka khaira maa fii haadzihil lailati wa khaira maa ba'dahaa, wa a'uudzu bika min syarri maa fii haadzihil lailati wa syarri maa ba'dahaa, rabbi a'uudzu bika minal kasali wa suu-il kibar, rabbi a'uudzu bika min 'adzaabin fin naari wa 'adzaabin fil qabr.",
    translation: 'Kami memasuki waktu sore dan pada waktu sore ini pula kerajaan milik Allah, segala puji bagi Allah, tiada ilah yang berhak disembah selain Allah semata yang tiada sekutu bagi-Nya. Bagi-Nya kerajaan dan bagi-Nya pujian dan Dia Maha Kuasa atas segala sesuatu. Wahai Rabb, aku memohon kepada-Mu kebaikan malam ini dan kebaikan setelahnya, dan aku berlindung kepada-Mu dari keburukan malam ini dan keburukan setelahnya. Wahai Rabb, aku berlindung kepada-Mu dari kemalasan dan keburukan masa tua, aku berlindung kepada-Mu dari siksa neraka dan siksa kubur.',
    defaultTarget: 1,
    sourceRef: 'HR. Muslim',
    meanings: {
      level1:
        'Pengakuan yang sama seperti dzikir pagi, dengan memohon kebaikan malam ini dan sesudahnya, serta perlindungan dari kejahatan malam ini dan sesudahnya, dari kemalasan, dan dari siksa neraka serta kubur.',
      level2:
        "Melengkapi dzikir pagi, dzikir sore ini dibaca sekali di waktu petang sebagai pengakuan atas kekuasaan Allah di malam hari. Haditsnya diriwayatkan Muslim dari Ibnu Mas'ud.",
      level3:
        'Di penghujung hari, kembalikan segala beban dan rencana kepada Allah. Tidur dengan hati yang lebih ringan karena tahu siapa yang mengatur malam ini.',
    },
  },
  {
    id: 'pagi-berserah',
    title: 'Berserah Diri Pagi',
    category: 'harian',
    arabic: 'اَللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوْتُ وَإِلَيْكَ النُّشُوْرُ',
    transliteration: "Allaahumma bika ashbahnaa, wa bika amsainaa, wa bika nahyaa, wa bika namuutu, wa ilaikan nusyuur.",
    translation: 'Ya Allah, dengan pertolongan-Mu kami memasuki pagi, dan kepada-Mu kebangkitan.',
    defaultTarget: 1,
    sourceRef: "HR. Abu Dawud, At-Tirmidzi, Ibnu Majah",
    meanings: {
      level1:
        'Ya Allah, dengan rahmat dan kehendak-Mu kami memasuki pagi, hidup, dan mati. Dan kepada-Mu kebangkitan. Dzikir ini mengakui bahwa seluruh hidup berada dalam pengaturan Allah.',
      level2:
        "Dzikir ini mengakui bahwa hidup, mati, dan kebangkitan berada dalam genggaman Allah. Diriwayatkan Abu Dawud, At-Tirmidzi, dan Ibnu Majah, serta dishahihkan Syaikh Al-Albani.",
      level3:
        'Setiap pagi, sadari bahwa hari ini adalah pinjaman dari Allah. Jalani setiap urusan dengan sikap berserah, dan jangan merasa memegang kendali penuh.',
    },
  },
  {
    id: 'sore-berserah',
    title: 'Berserah Diri Sore',
    category: 'harian',
    arabic: 'اَللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيْرُ',
    transliteration: "Allaahumma bika amsainaa, wa bika ashbahnaa, wa bika nahyaa, wa bika namuutu, wa ilaikal mashiir.",
    translation: 'Ya Allah, dengan pertolongan-Mu kami memasuki sore, dan kepada-Mu tempat kembali.',
    defaultTarget: 1,
    sourceRef: "HR. Abu Dawud, At-Tirmidzi, Ibnu Majah",
    meanings: {
      level1:
        'Ya Allah, dengan rahmat dan kehendak-Mu kami memasuki sore dan pagi, hidup dan mati, dan kepada-Mu tempat kembali seluruh makhluk.',
      level2:
        "Pasangan dzikir pagi ini diriwayatkan Abu Dawud, At-Tirmidzi, dan Ibnu Majah. Ia menegaskan bahwa hidup, mati, dan kembali kepada Allah berada dalam pengaturan-Nya.",
      level3:
        'Di penghujung hari, serahkan kekhawatiran dan rencana esok kepada Allah. Tidur dengan hati yang lebih ringan karena tahu kepada siapa segalanya kembali.',
    },
  },
  {
    id: 'sayyidul-istighfar',
    title: 'Sayyidul Istighfar',
    category: 'harian',
    arabic: 'اَللَّهُمَّ أَنْتَ رَبِّيْ لاَ إِلَـهَ إِلاَّ أَنْتَ، خَلَقْتَنِيْ وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوْذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوْءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوْءُ بِذَنْبِيْ فَاغْفِرْ لِيْ فَإِنَّهُ لاَ يَغْفِرُ الذُّنُوْبَ إِلاَّ أَنْتَ',
    transliteration: "Allaahumma anta rabbii, laa ilaaha illaa anta, khalaqtanii wa ana 'abduka, wa ana 'alaa 'ahdika wa wa'dika mastatha'tu, a'uudzu bika min syarri maa shana'tu, abuu-u laka bini'matika 'alayya wa abuu-u bidzambii faghfir lii fa-innahu laa yaghfirudz dzunuuba illaa anta.",
    translation: 'Ya Allah, Engkau adalah Rabb-ku, tiada tuhan yang berhak disembah selain Engkau. Engkaulah yang menciptakanku dan aku adalah hamba-Mu. Aku berusaha menepati ikrar dan janjiku kepada-Mu semampuku. Aku berlindung kepada-Mu dari keburukan yang telah kuperbuat. Aku mengakui nikmat-Mu kepadaku dan aku mengakui dosaku kepada-Mu, maka ampunilah aku, sesungguhnya tiada yang dapat mengampuni dosa selain Engkau.',
    defaultTarget: 1,
    sourceRef: 'HR. Al-Bukhari dari Syaddad bin Aus',
    meanings: {
      level1:
        'Sayyidul istighfar berarti penghulu istighfar. Isinya pengakuan tauhid, pengakuan bahwa kita hamba-Nya, pengakuan atas nikmat dan dosa, serta permohonan ampun kepada Allah karena tidak ada yang mengampuni dosa selain Dia.',
      level2:
        'Dalam hadits riwayat Al-Bukhari dari Syaddad bin Aus, Nabi ﷺ bersabda bahwa siapa yang mengucapkannya dengan yakin di siang hari lalu meninggal sebelum sore, ia termasuk penghuni surga.',
      level3:
        'Jadikan dzikir ini ringkasan pengakuan harian: aku hamba-Mu, aku berusaha menepati janjiku semampuku, dan aku mengakui dosaku. Setelah itu, lepaskan rasa bersalah dan kembali melangkah.',
    },
  },
  {
    id: 'aafinii',
    title: 'Kesehatan Badan',
    category: 'ketenangan',
    arabic: 'اَللَّهُمَّ عَافِنِيْ فِيْ بَدَنِيْ، اَللَّهُمَّ عَافِنِيْ فِيْ سَمْعِيْ، اَللَّهُمَّ عَافِنِيْ فِيْ بَصَرِيْ، لاَ إِلَـهَ إِلاَّ أَنْتَ. اَللَّهُمَّ إِنِّي أَعُوْذُ بِكَ مِنَ الْكُفْرِ وَالْفَقْرِ، وَأَعُوْذُ بِكَ مِنْ عَذَابِ الْقَبْرِ، لاَ إِلَـهَ إِلاَّ أَنْتَ',
    transliteration: "Allaahumma 'aafinii fii badanii, Allaahumma 'aafinii fii sam'ii, Allaahumma 'aafinii fii basharii, laa ilaaha illaa anta. Allaahumma innii a'uudzu bika minal kufri wal faqr, wa a'uudzu bika min 'adzaabil qabr, laa ilaaha illaa anta.",
    translation: 'Ya Allah, selamatkanlah tubuhku (dari penyakit). Ya Allah, selamatkanlah pendengaranku. Ya Allah, selamatkanlah penglihatanku, tiada tuhan yang berhak disembah selain Engkau. Ya Allah, sesungguhnya aku berlindung kepada-Mu dari kekufuran dan kefakiran, dan aku berlindung kepada-Mu dari siksa kubur, tiada tuhan yang berhak disembah selain Engkau.',
    defaultTarget: 3,
    sourceRef: 'HR. Abu Dawud, Ahmad',
    meanings: {
      level1:
        'Permohonan agar Allah menyelamatkan tubuh, pendengaran, dan penglihatan, serta perlindungan dari kekufuran, kefakiran, dan siksa kubur.',
      level2:
        'Kesehatan adalah nikmat yang sering dilupakan. Dzikir ini dibaca tiga kali pagi dan petang sebagai syukur sekaligus permohonan agar nikmat itu terjaga. Diriwayatkan Abu Dawud dan Ahmad, dan dihasankan oleh Syaikh Al-Albani.',
      level3:
        'Saat tubuh terasa lelah atau mulai mengeluh, syukuri anggota tubuh yang masih berfungsi. Gunakan mata dan telinga hari ini untuk hal-hal yang bermanfaat.',
    },
  },
  {
    id: 'afwa-aafiyah',
    title: 'Perlindungan Dunia & Akhirat',
    category: 'ketenangan',
    arabic: 'اَللَّهُمَّ إِنِّيْ أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَاْلآخِرَةِ، اَللَّهُمَّ إِنِّيْ أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي دِيْنِيْ وَدُنْيَايَ وَأَهْلِيْ وَمَالِيْ اللَّهُمَّ اسْتُرْ عَوْرَاتِى وَآمِنْ رَوْعَاتِى. اَللَّهُمَّ احْفَظْنِيْ مِنْ بَيْنِ يَدَيَّ، وَمِنْ خَلْفِيْ، وَعَنْ يَمِيْنِيْ وَعَنْ شِمَالِيْ، وَمِنْ فَوْقِيْ، وَأَعُوْذُ بِعَظَمَتِكَ أَنْ أُغْتَالَ مِنْ تَحْتِيْ',
    transliteration: "Allaahumma innii as-alukal 'afwa wal 'aafiyah fid dunyaa wal aakhirah. Allaahumma innii as-alukal 'afwa wal 'aafiyah fii diinii wa dunyaaya wa ahlii wa maalii. Allaahummastur 'auraatii wa aamin rau'aatii. Allaahummahfazhnii mim baini yadayya, wa min khalfii, wa 'an yamiinii, wa 'an syimaalii, wa min fauqii, wa a'uudzu bi'azhamatika an ughtaala min tahtii.",
    translation: 'Ya Allah, sesungguhnya aku memohon maaf dan keselamatan di dunia dan akhirat. Ya Allah, sesungguhnya aku memohon ampunan dan keselamatan dalam agamaku, duniaku, keluargaku, dan hartaku. Ya Allah, tutupilah aib-aibku dan tenteramkanlah rasa takutku. Ya Allah, peliharalah aku dari arah depanku, belakangku, kananku, kiriku, dan atasku. Dan aku berlindung dengan keagungan-Mu agar aku tidak disambar dari bawahku.',
    defaultTarget: 1,
    sourceRef: "HR. Abu Dawud, An-Nasa'i, Ibnu Majah",
    meanings: {
      level1:
        'Permohonan maaf dan keselamatan di dunia dan akhirat, dalam agama, dunia, keluarga, dan harta. Juga permohonan agar aib ditutupi, rasa takut ditenangkan, dan dijaga dari segala arah, termasuk dari bahaya yang datang dari bawah.',
      level2:
        "Dzikir ini diriwayatkan Abu Dawud, An-Nasa'i, dan Ibnu Majah, serta dinilai shahih oleh Syaikh Al-Albani. Ia termasuk doa yang dianjurkan dibaca pagi dan petang bersama dzikir lainnya.",
      level3:
        'Saat merasa kurang aman, baik di keluarga, pekerjaan, atau keuangan, ingat doa ini. Lakukan usaha yang bertanggung jawab, lalu serahkan hasilnya kepada Allah.',
    },
  },
  {
    id: 'alimal-ghaib',
    title: 'Perlindungan dari Diri & Syaitan',
    category: 'ketenangan',
    arabic: 'اَللَّهُمَّ عَالِمَ الْغَيْبِ وَالشَّهَادَةِ فَاطِرَ السَّمَاوَاتِ وَاْلأَرْضِ، رَبَّ كُلِّ شَيْءٍ وَمَلِيْكَهُ، أَشْهَدُ أَنْ لاَ إِلَـهَ إِلاَّ أَنْتَ، أَعُوْذُ بِكَ مِنْ شَرِّ نَفْسِيْ، وَمِنْ شَرِّ الشَّيْطَانِ وَشِرْكِهِ، وَأَنْ أَقْتَرِفَ عَلَى نَفْسِيْ سُوْءًا أَوْ أَجُرَّهُ إِلَى مُسْلِمٍ',
    transliteration: "Allaahumma 'aalimal ghaibi wasy syahaadati, faathiras samaawaati wal ardh, rabba kulli syai-in wa maliikahu, asyhadu alla ilaha illa anta, a'uudzu bika min syarri nafsii, wa min syarrisy syaithaani wa syirkihi, wa an aqtarifa 'alaa nafsii suu-an au ajurrahuu ilaa muslim.",
    translation: 'Ya Allah, Yang Maha Mengetahui yang ghaib dan yang nyata, Pencipta langit dan bumi, Rabb dan Penguasa segala sesuatu. Aku bersaksi bahwa tiada tuhan selain Engkau. Aku berlindung kepada-Mu dari kejahatan diriku, dan dari kejahatan syaitan dan ajakan syiriknya, serta dari berbuat keburukan terhadap diriku sendiri atau menyeretnya kepada seorang muslim.',
    defaultTarget: 1,
    sourceRef: 'HR. Abu Dawud, At-Tirmidzi',
    meanings: {
      level1:
        'Pengakuan bahwa Allah mengetahui yang ghaib dan yang nyata, serta permohonan perlindungan dari kejahatan diri sendiri, dari godaan syaitan dan balatentaranya, dan dari mencelakai diri atau orang Islam lain.',
      level2:
        'Dzikir ini dibaca pagi dan petang sebagai pengakuan atas ilmu Allah dan perlindungan dari keburukan diri. Diriwayatkan Abu Dawud dan At-Tirmidzi, dan dishahihkan Syaikh Al-Albani dalam Shahih At-Tirmidzi.',
      level3:
        'Saat menyadari diri sedang khilaf atau tergoda keburukan, ingat bahwa tidak ada yang tersembunyi bagi Allah. Mohon perlindungan-Nya, lalu perbaiki satu langkah kecil hari itu.',
    },
  },
  {
    id: 'bismillah-yadhurru',
    title: 'Pelindung dari Bahaya',
    category: 'ketenangan',
    arabic: 'بِسْمِ اللهِ الَّذِي لاَ يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي اْلأَرْضِ وَلاَ فِي السَّمَاءِ وَهُوَ السَّمِيْعُ الْعَلِيْمُ',
    transliteration: "Bismillaahil ladzii laa yadhurru ma'asmihi syai'un fil ardhi wa laa fis samaa'i wa huwas samii'ul 'aliim.",
    translation: 'Dengan nama Allah, yang bersama nama-Nya tidak ada sesuatu pun yang membahayakan, di bumi maupun di langit.',
    defaultTarget: 3,
    sourceRef: 'HR. Abu Dawud, At-Tirmidzi, Ibnu Majah',
    meanings: {
      level1:
        'Dengan menyebut nama Allah, tidak ada sesuatu pun yang dapat membahayakan, baik di bumi maupun di langit. Dia Maha Mendengar dan Maha Mengetahui.',
      level2:
        "Dalam riwayat Abu Dawud dan lainnya, orang yang membacanya tiga kali pagi dan petang tidak akan tertimpa musibah secara mendadak. Dishahihkan Syaikh Al-Albani dalam Shahih Ibni Majah.",
      level3:
        'Sebelum keluar rumah atau memulai pekerjaan, ucapkan dzikir ini dengan sadar. Ia mengingatkan bahwa perlindungan terbaik datang dari Allah, bukan semata dari kekuatan diri sendiri.',
    },
  },
  {
    id: 'radhiitu',
    title: 'Ridha kepada Allah',
    category: 'harian',
    arabic: 'رَضِيْتُ بِاللهِ رَبًّا، وَبِاْلإِسْلاَمِ دِيْنًا، وَبِمُحَمَّدٍ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا',
    transliteration: "Radhiitu billaahi rabbaa, wa bil islaami diinaa, wa bi Muhammadin shallallaahu 'alaihi wa sallam nabiyyaa.",
    translation: 'Aku ridha Allah sebagai Rabb, Islam sebagai agama, dan Muhammad sebagai nabi.',
    defaultTarget: 3,
    sourceRef: 'HR. Ahmad, Abu Dawud, At-Tirmidzi',
    meanings: {
      level1:
        'Ikrar ridha bahwa Allah adalah Rabb, Islam adalah agama, dan Muhammad ﷺ adalah nabi. Ridha berarti menerima dengan lapang hati.',
      level2:
        'Dalam riwayat Abu Dawud, orang yang mengucapkannya tiga kali pagi dan petang mendapat janji keridhaan dari Allah. Dzikir ini juga diriwayatkan Ahmad dan At-Tirmidzi.',
      level3:
        'Setiap pagi dan petang, perbarui komitmen ini. Saat hasil tidak sesuai harapan, ingat bahwa kita sudah ridha kepada Allah sebagai Rabb dan menerima takdir-Nya dengan lapang.',
    },
  },
  {
    id: 'yaa-hayyu',
    title: 'Memohon Pertolongan',
    category: 'ketenangan',
    arabic: 'يَا حَيُّ يَا قَيُّوْمُ بِرَحْمَتِكَ أَسْتَغِيْثُ، أَصْلِحْ لِيْ شَأْنِيْ كُلَّهُ وَلاَ تَكِلْنِيْ إِلَى نَفْسِيْ طَرْفَةَ عَيْنٍ',
    transliteration: "Yaa Hayyu yaa Qayyuumu, birahmatika astaghiits. Ashlih lii sya'nii kullahu, wa laa takilnii ilaa nafsii tharfata 'ain.",
    translation: 'Wahai Rabb Yang Maha Hidup, Yang Berdiri Sendiri, dengan rahmat-Mu aku memohon pertolongan. Perbaikilah seluruh urusanku.',
    defaultTarget: 1,
    sourceRef: "HR. An-Nasa'i, Al-Hakim",
    meanings: {
      level1:
        'Permohonan kepada Allah Yang Maha Hidup dan Berdiri Sendiri agar memperbaiki seluruh urusan, dan tidak menyerahkan diri kepada diri sendiri walau sekejap mata.',
      level2:
        "Dzikir ini mengakui kelemahan diri dan bergantung penuh kepada Allah. Diriwayatkan An-Nasa'i dalam 'Amalul Yaum wal Lailah dan Al-Hakim, serta dishahihkan Syaikh Al-Albani.",
      level3:
        'Saat semua urusan terasa kusut, kerjakan dulu bagian yang bisa kita kendalikan, lalu serahkan sisanya kepada Allah. Tarik napas, dan ucapkan dzikir ini.',
    },
  },
  {
    id: 'fithratil-islam',
    title: 'Fitrah Islam',
    category: 'harian',
    arabic: 'أَصْبَحْنَا عَلَى فِطْرَةِ اْلإِسْلاَمِ وَعَلَى كَلِمَةِ اْلإِخْلاَصِ، وَعَلَى دِيْنِ نَبِيِّنَا مُحَمَّدٍ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ، وَعَلَى مِلَّةِ أَبِيْنَا إِبْرَاهِيْمَ، حَنِيْفًا مُسْلِمًا وَمَا كَانَ مِنَ الْمُشْرِكِيْنَ',
    transliteration: "Ashbahnaa 'alaa fithratil islaam, wa 'alaa kalimatil ikhlaash, wa 'alaa diini nabiyyinaa Muhammadin shallallaahu 'alaihi wa sallam, wa 'alaa millati abiinaa Ibraahiim, haniifan muslimaa, wa maa kaana minal musyrikiin.",
    translation: 'Kami memasuki pagi di atas fitrah Islam, kalimat ikhlas, agama Nabi kami, dan agama Ibrahim yang lurus.',
    defaultTarget: 1,
    sourceRef: 'HR. Ahmad, Ad-Darimi',
    meanings: {
      level1:
        'Pengakuan bahwa di pagi hari kita berpegang pada fitrah Islam, kalimat ikhlas, agama Nabi Muhammad, dan agama Ibrahim yang lurus, serta tidak termasuk orang musyrik.',
      level2:
        "Fitrah Islam adalah kecenderungan asli manusia untuk mengenal dan menyembah Allah. Dzikir ini khusus dibaca di pagi hari, dan diriwayatkan Ahmad serta Ad-Darimi. Dalam riwayat lain, lafaz 'Amsainaa' juga dibaca di sore hari.",
      level3:
        'Saat bangun pagi, sebelum membuka kabar dan pesan, jadikan kalimat ikhlas sebagai pegangan. Tanyakan pada diri sendiri: apa yang hari ini akan menjaga hati tetap lurus?',
    },
  },
  {
    id: 'tasbih-pagi',
    title: 'Tasbih Pagi',
    category: 'harian',
    arabic: 'سُبْحَانَ اللهِ وَبِحَمْدِهِ: عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ وَمِدَادَ كَلِمَاتِهِ',
    transliteration: "Subhaanallaahi wa bihamdihi: 'adada khalqihi, wa ridhaa nafsihi, wa zinata 'arsyihi, wa midaada kalimaatihi.",
    translation: 'Mahasuci Allah, aku memuji-Nya sebanyak makhluk-Nya dan sebanyak tinta kalimat-Nya.',
    defaultTarget: 3,
    sourceRef: 'HR. Muslim',
    meanings: {
      level1:
        "Tasbih ini memuji Allah dengan ukuran yang tak terbatas: sebanyak makhluk-Nya, sejauh keridhaan-Nya, seberat timbangan 'Arsy-Nya, dan sebanyak tinta tulisan kalimat-Nya.",
      level2:
        "Dalam riwayat Muslim dari Juwairiyah, Nabi ﷺ menyebut bahwa kalimat ini lebih berat timbangannya dibanding seluruh dzikir yang Juwairiyah baca sejak pagi itu. Dibaca tiga kali khusus di pagi hari.",
      level3:
        'Saat memulai aktivitas pagi, ucapkan dzikir ini perlahan. Ia mengingatkan bahwa pujian kepada Allah tidak ada batasnya, sehingga kita tidak pernah pantas merasa sudah cukup bersyukur.',
    },
  },
  {
    id: 'ilmu-rezeki-amal',
    title: 'Ilmu, Rezeki & Amal',
    category: 'harian',
    arabic: 'اَللَّهُمَّ إِنِّيْ أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلاً مُتَقَبَّلاً',
    transliteration: "Allaahumma innii as-aluka 'ilman naafi'aa, wa rizqan thayyiban, wa 'amalan mutaqabbalaa.",
    translation: 'Ya Allah, aku memohon kepada-Mu ilmu yang bermanfaat, rezeki yang baik, dan amal yang diterima.',
    defaultTarget: 1,
    sourceRef: "HR. Ibnu Majah, An-Nasa'i",
    meanings: {
      level1:
        'Doa memohon tiga hal: ilmu yang bermanfaat, rezeki yang baik dan halal, serta amal yang diterima oleh Allah.',
      level2:
        "Doa ini khusus dibaca di pagi hari, setelah shalat Shubuh. Diriwayatkan Ibnu Majah dan An-Nasa'i, serta dishahihkan Syaikh Al-Albani dalam Shahih Ibni Majah.",
      level3:
        'Saat memulai hari, tanyakan pada diri sendiri: ilmu apa yang ingin dipelajari hari ini, dan amal kecil apa yang bisa dikerjakan dengan ikhlas?',
    },
  },
  {
    id: 'subhanallah-wa-bihamdih',
    title: 'Subhanallah wa Bihamdih',
    category: 'harian',
    arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
    transliteration: 'Subhaanallaahi wa bihamdih',
    translation: 'Mahasuci Allah, aku memuji-Nya.',
    defaultTarget: 100,
    sourceRef: 'HR. Muslim dari Abu Hurairah',
    meanings: {
      level1:
        "Mahasuci Allah dan aku memuji-Nya: kalimat yang menyucikan Allah dari segala kekurangan sekaligus menyatakan syukur atas segala nikmat-Nya.",
      level2:
        'Dalam hadits riwayat Muslim dari Abu Hurairah, siapa yang membacanya seratus kali dalam sehari, kesalahannya digugurkan meskipun sebanyak buih di lautan.',
      level3:
        'Saat menunggu, di perjalanan, atau sebelum tidur, hitung dzikir ini dengan jari. Ia adalah tabungan kecil yang terus bertambah.',
    },
  },
  {
    id: 'audzu-bikalimaat',
    title: 'Perlindungan Sore',
    category: 'ketenangan',
    arabic: 'أَعُوْذُ بِكَلِمَاتِ اللهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
    transliteration: "A'uudzu bikalimaatillaahit taammaati min syarri maa khalaq.",
    translation: 'Aku berlindung dengan kalimat-kalimat Allah yang sempurna dari kejahatan makhluk yang diciptakan-Nya.',
    defaultTarget: 3,
    sourceRef: 'HR. Muslim, At-Tirmidzi, Ibnu Majah',
    meanings: {
      level1:
        'Permohonan perlindungan dengan kalimat-kalimat Allah yang sempurna dari kejahatan segala sesuatu yang diciptakan-Nya.',
      level2:
        "Dibaca khusus di sore hari, tiga kali. Dalam riwayat At-Tirmidzi, orang yang membacanya ketika sore hari dijaga dari sengatan binatang berbisa pada malam itu.",
      level3:
        'Ketika sore menjelang dan malam tiba, lindungi diri dan keluarga dengan dzikir ini. Ia mengingatkan bahwa penjagaan terbaik ada pada Allah, dari malam hingga pagi.',
    },
  },
  {
    id: 'al-baqarah-285',
    title: 'Al-Baqarah 285-286',
    category: 'ketenangan',
    arabic: 'آَمَنَ الرَّسُولُ بِمَا أُنْزِلَ إِلَيْهِ مِنْ رَبِّهِ وَالْمُؤْمِنُونَ كُلٌّ آَمَنَ بِاللَّهِ وَمَلَائِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ لَا نُفَرِّقُ بَيْنَ أَحَدٍ مِنْ رُسُلِهِ وَقَالُوا سَمِعْنَا وَأَطَعْنَا غُفْرَانَكَ رَبَّنَا وَإِلَيْكَ الْمَصِيرُ لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلاَّ وُسْعَهَا لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا اكْتَسَبَتْ رَبَّنَا لَا تُؤَاخِذْنَا إِنْ نَسِينَا أَوْ أَخْطَأْنَا رَبَّنَا وَلَا تَحْمِلْ عَلَيْنَا إِصْرًا كَمَا حَمَلْتَهُ عَلَى الَّذِينَ مِنْ قَبْلِنَا رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِ وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَا أَنْتَ مَوْلَانَا فَانْصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ',
    transliteration: "Aamanar rasuulu bimaa unzila ilaihi mir rabbihii wal mu'minuun...",
    translation: 'Rasul dan orang-orang beriman mengimani Allah dan para rasul-Nya. Allah tidak membebani seseorang melainkan sesuai kesanggupannya.',
    defaultTarget: 1,
    sourceRef: 'HR. Bukhari & Muslim',
    meanings: {
      level1:
        'Dua ayat penutup Surat Al-Baqarah. Rasul dan orang-orang beriman mengimani Allah, malaikat-Nya, kitab-kitab-Nya, dan rasul-rasul-Nya, lalu berdoa memohon ampunan.',
      level2:
        'Dalam hadits riwayat Bukhari dan Muslim, siapa yang membaca dua ayat ini pada malam hari, keduanya sudah mencukupinya.',
      level3:
        'Sebelum tidur, bacalah dua ayat ini dengan tenang lalu serahkan hari yang sudah berlalu kepada Allah. Allah tidak membebani kita melebihi kemampuan.',
    },
  },
  {
    id: 'bismika-robbi',
    title: 'Meletakkan Lambung',
    category: 'ketenangan',
    arabic: 'بِاسْمِكَ رَبِّيْ وَضَعْتُ جَنْبِيْ، وَبِكَ أَرْفَعُهُ، فَإِنْ أَمْسَكْتَ نَفْسِيْ فَارْحَمْهَا، وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِيْنَ',
    transliteration: "Bismika robbi wadho'tu jambii, wa bika arfa'uh, fa-in amsakta nafsii farhamhaa, wa in arsaltahaa fahfazh-haa bimaa tahfazh bihi 'ibaadakash shoolihiin.",
    translation: 'Dengan nama-Mu, Rabbku, aku meletakkan lambungku, dan dengan nama-Mu aku bangkit.',
    defaultTarget: 1,
    sourceRef: 'HR. Bukhari & Muslim',
    meanings: {
      level1:
        'Dzikir saat berbaring. Aku meletakkan lambung dengan nama Allah dan bangkit pun dengan nama-Nya. Jika nyawa ditahan, berilah rahmat; jika dilepaskan, jagalah sebagaimana Allah menjaga hamba-hamba-Nya yang shalih.',
      level2:
        "Dalam hadits riwayat Bukhari dan Muslim, dzikir ini dibaca sebelum berbaring. Tempat tidur dibersihkan dahulu karena bisa jadi ada kotoran yang membahayakan.",
      level3:
        'Sebelum berbaring, rapikan dan bersihkan tempat tidur, lalu ucapkan dzikir ini. Kebiasaan kecil ini mengingatkan bahwa tidur pun berada dalam penjagaan Allah.',
    },
  },
  {
    id: 'khalaqta-nafsi',
    title: 'Penjagaan Jiwa',
    category: 'ketenangan',
    arabic: 'اَللَّهُمَّ إِنَّكَ خَلَقْتَ نَفْسِيْ وَأَنْتَ تَوَفَّاهَا، لَكَ مَمَاتُهَا وَمَحْيَاهَا، إِنْ أَحْيَيْتَهَا فَاحْفَظْهَا، وَإِنْ أَمَتَّهَا فَاغْفِرْ لَهَا. اَللَّهُمَّ إِنِّيْ أَسْأَلُكَ الْعَافِيَةَ',
    transliteration: "Allahumma innaka kholaqta nafsii wa anta tawaffaahaa, laka mamaatuhaa wa mahyaahaa, in ahyaytahaa fahfazh-haa, wa in ammatahaa faghfir lahaa. Allahumma innii as-alukal 'aafiyah.",
    translation: 'Ya Allah, Engkau menciptakan diriku dan Engkaulah yang mewafatkannya. Jagalah aku jika Engkau hidupkan, dan ampunilah jika Engkau matikan.',
    defaultTarget: 1,
    sourceRef: 'HR. Muslim',
    meanings: {
      level1:
        'Pengakuan bahwa Allah yang menciptakan dan mewafatkan jiwa. Jika dihidupkan kembali, jagalah; jika dimatikan, ampunilah. Di akhir doa, kita memohon keselamatan dari Allah.',
      level2:
        'Diriwayatkan Muslim. Doa ini menyerahkan hidup dan mati sepenuhnya kepada Allah.',
      level3:
        'Sebelum tidur, ingat bahwa kita tidak tahu apakah akan bangun lagi. Serahkan jiwa kepada Allah dengan tenang.',
    },
  },
  {
    id: 'qinii-adzaab',
    title: 'Dijauhkan dari Siksa',
    category: 'ketenangan',
    arabic: 'اَللَّهُمَّ قِنِيْ عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ',
    transliteration: "Allahumma qinii 'adzaabak, yawma tab'atsu 'ibaadak.",
    translation: 'Ya Allah, jauhkanlah aku dari siksa-Mu pada hari Engkau membangkitkan hamba-hamba-Mu.',
    defaultTarget: 1,
    sourceRef: 'HR. At-Tirmidzi & Abu Dawud',
    meanings: {
      level1:
        'Permohonan agar dijauhkan dari siksa Allah pada hari kiamat, saat seluruh hamba dibangkitkan.',
      level2:
        'Diriwayatkan At-Tirmidzi dan Abu Dawud. Syaikh Al-Albani mengkritik riwayat yang menyebut doa ini dibaca tiga kali, jadi cukup dibaca sekali.',
      level3:
        'Sebelum tidur, ingat hari kebangkitan dan mintalah Allah menjauhkan kita dari siksa-Nya.',
    },
  },
  {
    id: 'bismika-amuutu',
    title: 'Mati dan Hidup',
    category: 'harian',
    arabic: 'بِاسْمِكَ اللَّهُمَّ أَمُوْتُ وَأَحْيَا',
    transliteration: 'Bismika allahumma amuutu wa ahyaa.',
    translation: 'Dengan nama-Mu, ya Allah, aku mati dan aku hidup.',
    defaultTarget: 1,
    sourceRef: 'HR. Bukhari & Muslim',
    meanings: {
      level1:
        'Dzikir ketika hendak tidur: dengan nama Allah aku berbaring seperti mati, dan dengan nama-Nya aku bangkit kembali.',
      level2:
        'Diriwayatkan Bukhari dan Muslim. Dzikir ini dibaca tepat sebelum tidur sebagai pengakuan bahwa hidup dan mati ada di tangan Allah.',
      level3:
        'Tidur itu seperti mati sejenak, dan bangun adalah kehidupan yang Allah kembalikan. Ucapkan syukur setiap kali terbangun.',
    },
  },
  {
    id: 'robbas-samawat',
    title: 'Pelunasan Utang & Kecukupan',
    category: 'ketenangan',
    arabic: 'اَللَّهُمَّ رَبَّ السَّمَاوَاتِ السَّبْعِ وَرَبَّ الْعَرْشِ الْعَظِيْمِ، رَبَّنَا وَرَبَّ كُلِّ شَيْءٍ، فَالِقَ الْحَبِّ وَالنَّوَى، وَمُنْزِلَ التَّوْرَاةِ وَاْلإِنْجِيْلِ وَالْفُرْقَانِ، أَعُوْذُ بِكَ مِنْ شَرِّ كُلِّ شَيْءٍ أَنْتَ آخِذٌ بِنَاصِيَتِهِ. اَللَّهُمَّ أَنْتَ اْلأَوَّلُ فَلَيْسَ قَبْلَكَ شَيْءٌ، وَأَنْتَ اْلآخِرُ فَلَيْسَ بَعْدَكَ شَيْءٌ، وَأَنْتَ الظَّاهِرُ فَلَيْسَ فَوْقَكَ شَيْءٌ، وَأَنْتَ الْبَاطِنُ فَلَيْسَ دُوْنَكَ شَيْءٌ، اِقْضِ عَنَّا الدَّيْنَ وَأَغْنِنَا مِنَ الْفَقْرِ',
    transliteration: "Allahumma robbas-samaawaatis sab'i wa robbal 'arsyil 'azhiim... Antal awwalu falaysa qoblaka syai-un... iqdhi 'annad-dainaa wa aghninaa minal faqri.",
    translation: "Ya Allah, Rabb langit yang tujuh dan Rabb 'Arsy yang agung, lunasilah utang kami dan cukupkan kami dari kefakiran.",
    defaultTarget: 1,
    sourceRef: 'HR. Muslim',
    meanings: {
      level1:
        'Pengakuan bahwa Allah adalah yang awal dan yang akhir, yang zhahir dan yang batin. Doa ini memohon perlindungan dari kejahatan segala makhluk, pelunasan utang, dan kecukupan dari kefakiran.',
      level2:
        "Diriwayatkan Muslim. Kalimat 'tidak ada sesuatu di bawah-Mu' dimaknai sebagai ilmu Allah yang meliputi segala sesuatu, sebagaimana dijelaskan dalam Syarh Al 'Aqidah Al Wasithiyah.",
      level3:
        'Saat memikirkan utang atau kebutuhan yang belum terpenuhi, ucapkan doa ini. Serahkan kekhawatiran itu kepada Allah yang meliputi segala sesuatu.',
    },
  },
  {
    id: 'alhamdulillah-atamanaa',
    title: 'Syukur Makan & Berteduh',
    category: 'harian',
    arabic: 'الْحَمْدُ لِلَّهِ الَّذِيْ أَطْعَمَنَا وَسَقَانَا وَكَفَانَا وَآوَانَا، فَكَمْ مِمَّنْ لاَ كَافِيَ لَهُ وَلاَ مُؤْوِيَ',
    transliteration: "Alhamdulillahilladzi ath'amanaa wa saqoonaa wa kafaanaa wa aawaanaa, fakam mimman laa kaafiya lahu wa laa mu'wiya.",
    translation: 'Segala puji bagi Allah yang memberi kami makan dan minum, mencukupi kami, dan memberi tempat berteduh.',
    defaultTarget: 1,
    sourceRef: 'HR. Muslim',
    meanings: {
      level1:
        'Syukur kepada Allah atas makanan, minuman, kecukupan, dan tempat berteduh. Banyak orang yang tidak mendapatkan semua itu.',
      level2:
        'Diriwayatkan Muslim sebagai dzikir syukur sebelum tidur.',
      level3:
        'Sebelum tidur, hitung nikmat yang sudah didapat hari ini. Mengingat orang yang tidak punya tempat berteduh membuat syukur terasa lebih dalam.',
    },
  },
  {
    id: 'as-sajdah-mulk',
    title: 'Surat As-Sajdah & Al-Mulk',
    category: 'harian',
    arabic: 'الم تَنْزِيلُ تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ',
    transliteration: 'Alif Lam Mim Tanzil. Tabarakalladzi biyadihil mulk.',
    translation: 'Membaca Surat As-Sajdah dan Surat Al-Mulk sebelum tidur.',
    defaultTarget: 1,
    sourceRef: 'HR. At-Tirmidzi',
    meanings: {
      level1:
        'Membaca dua surat sebelum tidur: As-Sajdah dan Al-Mulk, masing-masing dibuka dengan Alif Lam Mim Tanzil dan Tabarakalladzi biyadihil mulk.',
      level2:
        'Diriwayatkan At-Tirmidzi dan dinilai hasan oleh Al-Hafizh Abu Thohir.',
      level3:
        "Malam hari bisa menjadi waktu bersama Al-Qur'an. Luangkan dua surat ini sebelum tidur, supaya layar ponsel tidak menjadi hal terakhir yang dilihat.",
    },
  },
  {
    id: 'aslamtu-nafsi',
    title: 'Menyerahkan Diri',
    category: 'harian',
    arabic: 'اَللَّهُمَّ أَسْلَمْتُ نَفْسِيْ إِلَيْكَ، وَفَوَّضْتُ أَمْرِيْ إِلَيْكَ، وَوَجَّهْتُ وَجْهِيَ إِلَيْكَ، وَأَلْجَأْتُ ظَهْرِيْ إِلَيْكَ، رَغْبَةً وَرَهْبَةً إِلَيْكَ، لاَ مَلْجَأَ وَلاَ مَنْجَا مِنْكَ إِلاَّ إِلَيْكَ، آمَنْتُ بِكِتَابِكَ الَّذِيْ أَنْزَلْتَ وَبِنَبِيِّكَ الَّذِيْ أَرْسَلْتَ',
    transliteration: "Allahumma aslamtu nafsii ilaik, wa fawwadh-tu amrii ilaik, wa wajjahtu wajhiya ilaik... Aamantu bikitaabikalladzi anzalta wa bi nabiyyikalladzi arsalta.",
    translation: 'Ya Allah, aku menyerahkan diriku dan urusanku kepada-Mu, dan aku beriman kepada Kitab dan Nabi yang Engkau utus.',
    defaultTarget: 1,
    sourceRef: 'HR. Bukhari & Muslim',
    meanings: {
      level1:
        'Penyerahan diri secara utuh kepada Allah: jiwa, urusan, dan wajah dihadapkan kepada-Nya dengan harap dan takut. Tidak ada tempat berlindung dan penyelamat kecuali Allah.',
      level2:
        'Dalam hadits riwayat Bukhari dan Muslim, siapa yang membaca dzikir ini ketika hendak tidur lalu ia mati, maka ia mati di atas fitrah.',
      level3:
        'Sebelum tidur, serahkan kembali urusan hari ini kepada Allah. Hati yang berserah lebih ringan membawa beban esok hari.',
    },
  },
  {
    id: 'shalawat',
    title: 'Shalawat',
    category: 'harian',
    arabic: 'اَللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ',
    transliteration: "Allahumma shalli 'ala Muhammad wa 'ala ali Muhammad",
    translation: 'Ya Allah, limpahkanlah shalawat dan keberkahan kepada Nabi Muhammad dan keluarga Nabi Muhammad.',
    defaultTarget: 10,
    sourceRef: 'HR. Bukhari & Muslim',
    meanings: {
      level1: 'Permohonan rahmat, kemuliaan, dan keselamatan untuk Rasulullah ﷺ dan keluarga beliau.',
      level2: 'Setiap satu shalawat dibalas Allah dengan sepuluh rahmat, penghapusan sepuluh dosa, dan peninggian sepuluh derajat.',
      level3: 'Membaca shalawat melembutkan hati, menumbuhkan mahabbah, serta menghadirkan ketenangan dalam keseharian.',
    },
  },
]

export function getDzikirById(id: string): DzikirItem {
  return DZIKIR_SEED.find((item) => item.id === id) ?? DZIKIR_SEED[0]
}
