-- ============================================
-- Invoicaty Migration v2: i18n + Multi-Currency (Global Edition)
-- ============================================
-- Safe migration: all new columns have defaults
-- Existing users default to KW/KWD/Arabic to preserve current UX
-- Includes ALL world countries (ISO 3166-1) and active currencies (ISO 4217)
-- ============================================

-- ============================================
-- 1. Currencies table
-- ============================================
CREATE TABLE IF NOT EXISTS currencies (
  code CHAR(3) PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  symbol TEXT NOT NULL,
  decimal_places SMALLINT NOT NULL DEFAULT 2,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed all active world currencies (ISO 4217)
INSERT INTO currencies (code, name_en, name_ar, symbol, decimal_places) VALUES
  ('AED', 'UAE Dirham', 'درهم إماراتي', 'د.إ', 2),
  ('AFN', 'Afghan Afghani', 'أفغاني', '؋', 2),
  ('ALL', 'Albanian Lek', 'ليك ألباني', 'L', 2),
  ('AMD', 'Armenian Dram', 'درام أرميني', '֏', 2),
  ('ANG', 'Netherlands Antillean Guilder', 'غيلدر أنتيلي', 'ƒ', 2),
  ('AOA', 'Angolan Kwanza', 'كوانزا أنغولي', 'Kz', 2),
  ('ARS', 'Argentine Peso', 'بيزو أرجنتيني', '$', 2),
  ('AUD', 'Australian Dollar', 'دولار أسترالي', 'A$', 2),
  ('AWG', 'Aruban Florin', 'فلورن أروبي', 'ƒ', 2),
  ('AZN', 'Azerbaijani Manat', 'مانات أذربيجاني', '₼', 2),
  ('BAM', 'Bosnia-Herzegovina Convertible Mark', 'مارك بوسني', 'KM', 2),
  ('BBD', 'Barbadian Dollar', 'دولار بربادوسي', 'Bds$', 2),
  ('BDT', 'Bangladeshi Taka', 'تاكا بنغلاديشي', '৳', 2),
  ('BGN', 'Bulgarian Lev', 'ليف بلغاري', 'лв', 2),
  ('BHD', 'Bahraini Dinar', 'دينار بحريني', 'د.ب', 3),
  ('BIF', 'Burundian Franc', 'فرنك بوروندي', 'FBu', 0),
  ('BMD', 'Bermudian Dollar', 'دولار برمودي', 'BD$', 2),
  ('BND', 'Brunei Dollar', 'دولار بروناي', 'B$', 2),
  ('BOB', 'Bolivian Boliviano', 'بوليفيانو', 'Bs', 2),
  ('BRL', 'Brazilian Real', 'ريال برازيلي', 'R$', 2),
  ('BSD', 'Bahamian Dollar', 'دولار باهامي', 'B$', 2),
  ('BTN', 'Bhutanese Ngultrum', 'نغولترم بوتاني', 'Nu.', 2),
  ('BWP', 'Botswana Pula', 'بولا بوتسواني', 'P', 2),
  ('BYN', 'Belarusian Ruble', 'روبل بيلاروسي', 'Br', 2),
  ('BZD', 'Belize Dollar', 'دولار بليزي', 'BZ$', 2),
  ('CAD', 'Canadian Dollar', 'دولار كندي', 'C$', 2),
  ('CDF', 'Congolese Franc', 'فرنك كونغولي', 'FC', 2),
  ('CHF', 'Swiss Franc', 'فرنك سويسري', 'CHF', 2),
  ('CLP', 'Chilean Peso', 'بيزو تشيلي', '$', 0),
  ('CNY', 'Chinese Yuan', 'يوان صيني', '¥', 2),
  ('COP', 'Colombian Peso', 'بيزو كولومبي', '$', 2),
  ('CRC', 'Costa Rican Colón', 'كولون كوستاريكي', '₡', 2),
  ('CUP', 'Cuban Peso', 'بيزو كوبي', '$', 2),
  ('CVE', 'Cape Verdean Escudo', 'إسكودو الرأس الأخضر', '$', 2),
  ('CZK', 'Czech Koruna', 'كرونة تشيكية', 'Kč', 2),
  ('DJF', 'Djiboutian Franc', 'فرنك جيبوتي', 'Fdj', 0),
  ('DKK', 'Danish Krone', 'كرونة دنماركية', 'kr', 2),
  ('DOP', 'Dominican Peso', 'بيزو دومينيكي', 'RD$', 2),
  ('DZD', 'Algerian Dinar', 'دينار جزائري', 'د.ج', 2),
  ('EGP', 'Egyptian Pound', 'جنيه مصري', 'ج.م', 2),
  ('ERN', 'Eritrean Nakfa', 'ناكفا إريتري', 'Nfk', 2),
  ('ETB', 'Ethiopian Birr', 'بير إثيوبي', 'Br', 2),
  ('EUR', 'Euro', 'يورو', '€', 2),
  ('FJD', 'Fijian Dollar', 'دولار فيجي', 'FJ$', 2),
  ('FKP', 'Falkland Islands Pound', 'جنيه فوكلاندي', '£', 2),
  ('GBP', 'British Pound', 'جنيه إسترليني', '£', 2),
  ('GEL', 'Georgian Lari', 'لاري جورجي', '₾', 2),
  ('GHS', 'Ghanaian Cedi', 'سيدي غاني', '₵', 2),
  ('GIP', 'Gibraltar Pound', 'جنيه جبل طارق', '£', 2),
  ('GMD', 'Gambian Dalasi', 'دالاسي غامبي', 'D', 2),
  ('GNF', 'Guinean Franc', 'فرنك غيني', 'FG', 0),
  ('GTQ', 'Guatemalan Quetzal', 'كتزال غواتيمالي', 'Q', 2),
  ('GYD', 'Guyanese Dollar', 'دولار غياني', 'G$', 2),
  ('HKD', 'Hong Kong Dollar', 'دولار هونغ كونغ', 'HK$', 2),
  ('HNL', 'Honduran Lempira', 'ليمبيرا هندوراسي', 'L', 2),
  ('HRK', 'Croatian Kuna', 'كونا كرواتية', 'kn', 2),
  ('HTG', 'Haitian Gourde', 'غورد هايتي', 'G', 2),
  ('HUF', 'Hungarian Forint', 'فورنت هنغاري', 'Ft', 2),
  ('IDR', 'Indonesian Rupiah', 'روبية إندونيسية', 'Rp', 2),
  ('ILS', 'Israeli New Shekel', 'شيكل إسرائيلي', '₪', 2),
  ('INR', 'Indian Rupee', 'روبية هندية', '₹', 2),
  ('IQD', 'Iraqi Dinar', 'دينار عراقي', 'د.ع', 3),
  ('IRR', 'Iranian Rial', 'ريال إيراني', '﷼', 2),
  ('ISK', 'Icelandic Króna', 'كرونة آيسلندية', 'kr', 0),
  ('JMD', 'Jamaican Dollar', 'دولار جامايكي', 'J$', 2),
  ('JOD', 'Jordanian Dinar', 'دينار أردني', 'د.أ', 3),
  ('JPY', 'Japanese Yen', 'ين ياباني', '¥', 0),
  ('KES', 'Kenyan Shilling', 'شلن كيني', 'KSh', 2),
  ('KGS', 'Kyrgyzstani Som', 'سوم قيرغيزي', 'с', 2),
  ('KHR', 'Cambodian Riel', 'ريال كمبودي', '៛', 2),
  ('KMF', 'Comorian Franc', 'فرنك قمري', 'CF', 0),
  ('KPW', 'North Korean Won', 'وون كوري شمالي', '₩', 2),
  ('KRW', 'South Korean Won', 'وون كوري جنوبي', '₩', 0),
  ('KWD', 'Kuwaiti Dinar', 'دينار كويتي', 'د.ك', 3),
  ('KYD', 'Cayman Islands Dollar', 'دولار كايماني', 'CI$', 2),
  ('KZT', 'Kazakhstani Tenge', 'تنغ كازاخستاني', '₸', 2),
  ('LAK', 'Lao Kip', 'كيب لاوسي', '₭', 2),
  ('LBP', 'Lebanese Pound', 'ليرة لبنانية', 'ل.ل', 2),
  ('LKR', 'Sri Lankan Rupee', 'روبية سريلانكية', 'Rs', 2),
  ('LRD', 'Liberian Dollar', 'دولار ليبيري', 'L$', 2),
  ('LSL', 'Lesotho Loti', 'لوتي ليسوتي', 'L', 2),
  ('LYD', 'Libyan Dinar', 'دينار ليبي', 'د.ل', 3),
  ('MAD', 'Moroccan Dirham', 'درهم مغربي', 'د.م', 2),
  ('MDL', 'Moldovan Leu', 'ليو مولدوفي', 'L', 2),
  ('MGA', 'Malagasy Ariary', 'أرياري مدغشقري', 'Ar', 2),
  ('MKD', 'Macedonian Denar', 'دينار مقدوني', 'ден', 2),
  ('MMK', 'Myanmar Kyat', 'كيات ميانماري', 'K', 2),
  ('MNT', 'Mongolian Tögrög', 'توغروغ منغولي', '₮', 2),
  ('MOP', 'Macanese Pataca', 'باتاكا ماكاوي', 'MOP$', 2),
  ('MRU', 'Mauritanian Ouguiya', 'أوقية موريتانية', 'UM', 2),
  ('MUR', 'Mauritian Rupee', 'روبية موريشية', '₨', 2),
  ('MVR', 'Maldivian Rufiyaa', 'روفية مالديفية', 'Rf', 2),
  ('MWK', 'Malawian Kwacha', 'كواشا مالاوي', 'MK', 2),
  ('MXN', 'Mexican Peso', 'بيزو مكسيكي', 'Mex$', 2),
  ('MYR', 'Malaysian Ringgit', 'رينغيت ماليزي', 'RM', 2),
  ('MZN', 'Mozambican Metical', 'متيكال موزمبيقي', 'MT', 2),
  ('NAD', 'Namibian Dollar', 'دولار ناميبي', 'N$', 2),
  ('NGN', 'Nigerian Naira', 'نيرة نيجيرية', '₦', 2),
  ('NIO', 'Nicaraguan Córdoba', 'كوردوبا نيكاراغوي', 'C$', 2),
  ('NOK', 'Norwegian Krone', 'كرونة نرويجية', 'kr', 2),
  ('NPR', 'Nepalese Rupee', 'روبية نيبالية', '₨', 2),
  ('NZD', 'New Zealand Dollar', 'دولار نيوزيلندي', 'NZ$', 2),
  ('OMR', 'Omani Rial', 'ريال عماني', 'ر.ع', 3),
  ('PAB', 'Panamanian Balboa', 'بالبوا بنمي', 'B/.', 2),
  ('PEN', 'Peruvian Sol', 'سول بيروفي', 'S/', 2),
  ('PGK', 'Papua New Guinean Kina', 'كينا بابوا غينيا', 'K', 2),
  ('PHP', 'Philippine Peso', 'بيزو فلبيني', '₱', 2),
  ('PKR', 'Pakistani Rupee', 'روبية باكستانية', '₨', 2),
  ('PLN', 'Polish Złoty', 'زلوتي بولندي', 'zł', 2),
  ('PYG', 'Paraguayan Guaraní', 'غواراني باراغواي', '₲', 0),
  ('QAR', 'Qatari Riyal', 'ريال قطري', 'ر.ق', 2),
  ('RON', 'Romanian Leu', 'ليو روماني', 'lei', 2),
  ('RSD', 'Serbian Dinar', 'دينار صربي', 'дин', 2),
  ('RUB', 'Russian Ruble', 'روبل روسي', '₽', 2),
  ('RWF', 'Rwandan Franc', 'فرنك رواندي', 'FRw', 0),
  ('SAR', 'Saudi Riyal', 'ريال سعودي', 'ر.س', 2),
  ('SBD', 'Solomon Islands Dollar', 'دولار سليماني', 'SI$', 2),
  ('SCR', 'Seychellois Rupee', 'روبية سيشيلية', '₨', 2),
  ('SDG', 'Sudanese Pound', 'جنيه سوداني', 'ج.س', 2),
  ('SEK', 'Swedish Krona', 'كرونة سويدية', 'kr', 2),
  ('SGD', 'Singapore Dollar', 'دولار سنغافوري', 'S$', 2),
  ('SHP', 'Saint Helena Pound', 'جنيه سانت هيلانة', '£', 2),
  ('SLL', 'Sierra Leonean Leone', 'ليون سيراليوني', 'Le', 2),
  ('SOS', 'Somali Shilling', 'شلن صومالي', 'Sh', 2),
  ('SRD', 'Surinamese Dollar', 'دولار سورينامي', 'Sr$', 2),
  ('SSP', 'South Sudanese Pound', 'جنيه جنوب السودان', 'SS£', 2),
  ('STN', 'São Tomé and Príncipe Dobra', 'دوبرا ساو تومي', 'Db', 2),
  ('SYP', 'Syrian Pound', 'ليرة سورية', 'ل.س', 2),
  ('SZL', 'Swazi Lilangeni', 'ليلانغيني سوازي', 'L', 2),
  ('THB', 'Thai Baht', 'بات تايلندي', '฿', 2),
  ('TJS', 'Tajikistani Somoni', 'سوموني طاجيكي', 'SM', 2),
  ('TMT', 'Turkmenistani Manat', 'مانات تركماني', 'm', 2),
  ('TND', 'Tunisian Dinar', 'دينار تونسي', 'د.ت', 3),
  ('TOP', 'Tongan Paʻanga', 'بانغا تونغي', 'T$', 2),
  ('TRY', 'Turkish Lira', 'ليرة تركية', '₺', 2),
  ('TTD', 'Trinidad & Tobago Dollar', 'دولار ترينيدادي', 'TT$', 2),
  ('TWD', 'New Taiwan Dollar', 'دولار تايواني', 'NT$', 2),
  ('TZS', 'Tanzanian Shilling', 'شلن تنزاني', 'TSh', 2),
  ('UAH', 'Ukrainian Hryvnia', 'هريفنيا أوكرانية', '₴', 2),
  ('UGX', 'Ugandan Shilling', 'شلن أوغندي', 'USh', 0),
  ('USD', 'US Dollar', 'دولار أمريكي', '$', 2),
  ('UYU', 'Uruguayan Peso', 'بيزو أوروغواي', '$U', 2),
  ('UZS', 'Uzbekistani Som', 'سوم أوزبكي', 'so''m', 2),
  ('VES', 'Venezuelan Bolívar', 'بوليفار فنزويلي', 'Bs.S', 2),
  ('VND', 'Vietnamese Đồng', 'دونغ فيتنامي', '₫', 0),
  ('VUV', 'Vanuatu Vatu', 'فاتو فانواتي', 'VT', 0),
  ('WST', 'Samoan Tālā', 'تالا ساموي', 'WS$', 2),
  ('XAF', 'Central African CFA Franc', 'فرنك وسط أفريقي', 'FCFA', 0),
  ('XCD', 'East Caribbean Dollar', 'دولار شرق كاريبي', 'EC$', 2),
  ('XOF', 'West African CFA Franc', 'فرنك غرب أفريقي', 'CFA', 0),
  ('XPF', 'CFP Franc', 'فرنك المحيط الهادئ', '₣', 0),
  ('YER', 'Yemeni Rial', 'ريال يمني', 'ر.ي', 2),
  ('ZAR', 'South African Rand', 'راند جنوب أفريقي', 'R', 2),
  ('ZMW', 'Zambian Kwacha', 'كواشا زامبي', 'ZK', 2),
  ('ZWL', 'Zimbabwean Dollar', 'دولار زيمبابوي', 'Z$', 2)
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- 2. Countries table (ALL ISO 3166-1 countries)
-- ============================================
CREATE TABLE IF NOT EXISTS countries (
  code CHAR(2) PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  default_currency CHAR(3) REFERENCES currencies(code),
  default_tax_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
  phone_code TEXT,
  flag_emoji TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO countries (code, name_en, name_ar, default_currency, default_tax_rate, phone_code, flag_emoji) VALUES
  ('AD', 'Andorra', 'أندورا', 'EUR', 4.50, '+376', '🇦🇩'),
  ('AE', 'United Arab Emirates', 'الإمارات', 'AED', 5.00, '+971', '🇦🇪'),
  ('AF', 'Afghanistan', 'أفغانستان', 'AFN', 0.00, '+93', '🇦🇫'),
  ('AG', 'Antigua and Barbuda', 'أنتيغوا وباربودا', 'XCD', 15.00, '+1268', '🇦🇬'),
  ('AI', 'Anguilla', 'أنغويلا', 'XCD', 0.00, '+1264', '🇦🇮'),
  ('AL', 'Albania', 'ألبانيا', 'ALL', 20.00, '+355', '🇦🇱'),
  ('AM', 'Armenia', 'أرمينيا', 'AMD', 20.00, '+374', '🇦🇲'),
  ('AO', 'Angola', 'أنغولا', 'AOA', 14.00, '+244', '🇦🇴'),
  ('AR', 'Argentina', 'الأرجنتين', 'ARS', 21.00, '+54', '🇦🇷'),
  ('AS', 'American Samoa', 'ساموا الأمريكية', 'USD', 0.00, '+1684', '🇦🇸'),
  ('AT', 'Austria', 'النمسا', 'EUR', 20.00, '+43', '🇦🇹'),
  ('AU', 'Australia', 'أستراليا', 'AUD', 10.00, '+61', '🇦🇺'),
  ('AW', 'Aruba', 'أروبا', 'AWG', 1.50, '+297', '🇦🇼'),
  ('AX', 'Åland Islands', 'جزر أولاند', 'EUR', 24.00, '+358', '🇦🇽'),
  ('AZ', 'Azerbaijan', 'أذربيجان', 'AZN', 18.00, '+994', '🇦🇿'),
  ('BA', 'Bosnia and Herzegovina', 'البوسنة والهرسك', 'BAM', 17.00, '+387', '🇧🇦'),
  ('BB', 'Barbados', 'بربادوس', 'BBD', 17.50, '+1246', '🇧🇧'),
  ('BD', 'Bangladesh', 'بنغلاديش', 'BDT', 15.00, '+880', '🇧🇩'),
  ('BE', 'Belgium', 'بلجيكا', 'EUR', 21.00, '+32', '🇧🇪'),
  ('BF', 'Burkina Faso', 'بوركينا فاسو', 'XOF', 18.00, '+226', '🇧🇫'),
  ('BG', 'Bulgaria', 'بلغاريا', 'BGN', 20.00, '+359', '🇧🇬'),
  ('BH', 'Bahrain', 'البحرين', 'BHD', 10.00, '+973', '🇧🇭'),
  ('BI', 'Burundi', 'بوروندي', 'BIF', 18.00, '+257', '🇧🇮'),
  ('BJ', 'Benin', 'بنين', 'XOF', 18.00, '+229', '🇧🇯'),
  ('BL', 'Saint Barthélemy', 'سان بارتيلمي', 'EUR', 0.00, '+590', '🇧🇱'),
  ('BM', 'Bermuda', 'برمودا', 'BMD', 0.00, '+1441', '🇧🇲'),
  ('BN', 'Brunei', 'بروناي', 'BND', 0.00, '+673', '🇧🇳'),
  ('BO', 'Bolivia', 'بوليفيا', 'BOB', 13.00, '+591', '🇧🇴'),
  ('BQ', 'Caribbean Netherlands', 'هولندا الكاريبية', 'USD', 8.00, '+599', '🇧🇶'),
  ('BR', 'Brazil', 'البرازيل', 'BRL', 17.00, '+55', '🇧🇷'),
  ('BS', 'Bahamas', 'الباهاما', 'BSD', 12.00, '+1242', '🇧🇸'),
  ('BT', 'Bhutan', 'بوتان', 'BTN', 0.00, '+975', '🇧🇹'),
  ('BV', 'Bouvet Island', 'جزيرة بوفيه', 'NOK', 0.00, '+47', '🇧🇻'),
  ('BW', 'Botswana', 'بوتسوانا', 'BWP', 14.00, '+267', '🇧🇼'),
  ('BY', 'Belarus', 'بيلاروسيا', 'BYN', 20.00, '+375', '🇧🇾'),
  ('BZ', 'Belize', 'بليز', 'BZD', 12.50, '+501', '🇧🇿'),
  ('CA', 'Canada', 'كندا', 'CAD', 5.00, '+1', '🇨🇦'),
  ('CC', 'Cocos (Keeling) Islands', 'جزر كوكوس', 'AUD', 0.00, '+61', '🇨🇨'),
  ('CD', 'DR Congo', 'جمهورية الكونغو الديمقراطية', 'CDF', 16.00, '+243', '🇨🇩'),
  ('CF', 'Central African Republic', 'جمهورية أفريقيا الوسطى', 'XAF', 19.00, '+236', '🇨🇫'),
  ('CG', 'Republic of the Congo', 'جمهورية الكونغو', 'XAF', 18.90, '+242', '🇨🇬'),
  ('CH', 'Switzerland', 'سويسرا', 'CHF', 7.70, '+41', '🇨🇭'),
  ('CI', 'Côte d''Ivoire', 'ساحل العاج', 'XOF', 18.00, '+225', '🇨🇮'),
  ('CK', 'Cook Islands', 'جزر كوك', 'NZD', 15.00, '+682', '🇨🇰'),
  ('CL', 'Chile', 'تشيلي', 'CLP', 19.00, '+56', '🇨🇱'),
  ('CM', 'Cameroon', 'الكاميرون', 'XAF', 19.25, '+237', '🇨🇲'),
  ('CN', 'China', 'الصين', 'CNY', 13.00, '+86', '🇨🇳'),
  ('CO', 'Colombia', 'كولومبيا', 'COP', 19.00, '+57', '🇨🇴'),
  ('CR', 'Costa Rica', 'كوستاريكا', 'CRC', 13.00, '+506', '🇨🇷'),
  ('CU', 'Cuba', 'كوبا', 'CUP', 0.00, '+53', '🇨🇺'),
  ('CV', 'Cape Verde', 'الرأس الأخضر', 'CVE', 15.00, '+238', '🇨🇻'),
  ('CW', 'Curaçao', 'كوراساو', 'ANG', 6.00, '+599', '🇨🇼'),
  ('CX', 'Christmas Island', 'جزيرة عيد الميلاد', 'AUD', 0.00, '+61', '🇨🇽'),
  ('CY', 'Cyprus', 'قبرص', 'EUR', 19.00, '+357', '🇨🇾'),
  ('CZ', 'Czechia', 'التشيك', 'CZK', 21.00, '+420', '🇨🇿'),
  ('DE', 'Germany', 'ألمانيا', 'EUR', 19.00, '+49', '🇩🇪'),
  ('DJ', 'Djibouti', 'جيبوتي', 'DJF', 10.00, '+253', '🇩🇯'),
  ('DK', 'Denmark', 'الدنمارك', 'DKK', 25.00, '+45', '🇩🇰'),
  ('DM', 'Dominica', 'دومينيكا', 'XCD', 15.00, '+1767', '🇩🇲'),
  ('DO', 'Dominican Republic', 'جمهورية الدومينيكان', 'DOP', 18.00, '+1809', '🇩🇴'),
  ('DZ', 'Algeria', 'الجزائر', 'DZD', 19.00, '+213', '🇩🇿'),
  ('EC', 'Ecuador', 'الإكوادور', 'USD', 12.00, '+593', '🇪🇨'),
  ('EE', 'Estonia', 'إستونيا', 'EUR', 20.00, '+372', '🇪🇪'),
  ('EG', 'Egypt', 'مصر', 'EGP', 14.00, '+20', '🇪🇬'),
  ('EH', 'Western Sahara', 'الصحراء الغربية', 'MAD', 0.00, '+212', '🇪🇭'),
  ('ER', 'Eritrea', 'إريتريا', 'ERN', 0.00, '+291', '🇪🇷'),
  ('ES', 'Spain', 'إسبانيا', 'EUR', 21.00, '+34', '🇪🇸'),
  ('ET', 'Ethiopia', 'إثيوبيا', 'ETB', 15.00, '+251', '🇪🇹'),
  ('FI', 'Finland', 'فنلندا', 'EUR', 24.00, '+358', '🇫🇮'),
  ('FJ', 'Fiji', 'فيجي', 'FJD', 9.00, '+679', '🇫🇯'),
  ('FK', 'Falkland Islands', 'جزر فوكلاند', 'FKP', 0.00, '+500', '🇫🇰'),
  ('FM', 'Micronesia', 'ميكرونيزيا', 'USD', 0.00, '+691', '🇫🇲'),
  ('FO', 'Faroe Islands', 'جزر فارو', 'DKK', 25.00, '+298', '🇫🇴'),
  ('FR', 'France', 'فرنسا', 'EUR', 20.00, '+33', '🇫🇷'),
  ('GA', 'Gabon', 'الغابون', 'XAF', 18.00, '+241', '🇬🇦'),
  ('GB', 'United Kingdom', 'المملكة المتحدة', 'GBP', 20.00, '+44', '🇬🇧'),
  ('GD', 'Grenada', 'غرينادا', 'XCD', 15.00, '+1473', '🇬🇩'),
  ('GE', 'Georgia', 'جورجيا', 'GEL', 18.00, '+995', '🇬🇪'),
  ('GF', 'French Guiana', 'غويانا الفرنسية', 'EUR', 8.50, '+594', '🇬🇫'),
  ('GG', 'Guernsey', 'غيرنزي', 'GBP', 0.00, '+44', '🇬🇬'),
  ('GH', 'Ghana', 'غانا', 'GHS', 15.00, '+233', '🇬🇭'),
  ('GI', 'Gibraltar', 'جبل طارق', 'GIP', 0.00, '+350', '🇬🇮'),
  ('GL', 'Greenland', 'جرينلاند', 'DKK', 0.00, '+299', '🇬🇱'),
  ('GM', 'Gambia', 'غامبيا', 'GMD', 15.00, '+220', '🇬🇲'),
  ('GN', 'Guinea', 'غينيا', 'GNF', 18.00, '+224', '🇬🇳'),
  ('GP', 'Guadeloupe', 'غوادلوب', 'EUR', 8.50, '+590', '🇬🇵'),
  ('GQ', 'Equatorial Guinea', 'غينيا الاستوائية', 'XAF', 15.00, '+240', '🇬🇶'),
  ('GR', 'Greece', 'اليونان', 'EUR', 24.00, '+30', '🇬🇷'),
  ('GS', 'South Georgia', 'جورجيا الجنوبية', 'GBP', 0.00, '+500', '🇬🇸'),
  ('GT', 'Guatemala', 'غواتيمالا', 'GTQ', 12.00, '+502', '🇬🇹'),
  ('GU', 'Guam', 'غوام', 'USD', 4.00, '+1671', '🇬🇺'),
  ('GW', 'Guinea-Bissau', 'غينيا بيساو', 'XOF', 17.00, '+245', '🇬🇼'),
  ('GY', 'Guyana', 'غيانا', 'GYD', 14.00, '+592', '🇬🇾'),
  ('HK', 'Hong Kong', 'هونغ كونغ', 'HKD', 0.00, '+852', '🇭🇰'),
  ('HM', 'Heard & McDonald Islands', 'جزر هيرد وماكدونالد', 'AUD', 0.00, '+672', '🇭🇲'),
  ('HN', 'Honduras', 'هندوراس', 'HNL', 15.00, '+504', '🇭🇳'),
  ('HR', 'Croatia', 'كرواتيا', 'EUR', 25.00, '+385', '🇭🇷'),
  ('HT', 'Haiti', 'هايتي', 'HTG', 10.00, '+509', '🇭🇹'),
  ('HU', 'Hungary', 'المجر', 'HUF', 27.00, '+36', '🇭🇺'),
  ('ID', 'Indonesia', 'إندونيسيا', 'IDR', 11.00, '+62', '🇮🇩'),
  ('IE', 'Ireland', 'أيرلندا', 'EUR', 23.00, '+353', '🇮🇪'),
  ('IL', 'Israel', 'إسرائيل', 'ILS', 17.00, '+972', '🇮🇱'),
  ('IM', 'Isle of Man', 'جزيرة مان', 'GBP', 20.00, '+44', '🇮🇲'),
  ('IN', 'India', 'الهند', 'INR', 18.00, '+91', '🇮🇳'),
  ('IO', 'British Indian Ocean Territory', 'إقليم المحيط الهندي البريطاني', 'USD', 0.00, '+246', '🇮🇴'),
  ('IQ', 'Iraq', 'العراق', 'IQD', 0.00, '+964', '🇮🇶'),
  ('IR', 'Iran', 'إيران', 'IRR', 9.00, '+98', '🇮🇷'),
  ('IS', 'Iceland', 'آيسلندا', 'ISK', 24.00, '+354', '🇮🇸'),
  ('IT', 'Italy', 'إيطاليا', 'EUR', 22.00, '+39', '🇮🇹')
ON CONFLICT (code) DO NOTHING;

INSERT INTO countries (code, name_en, name_ar, default_currency, default_tax_rate, phone_code, flag_emoji) VALUES
  ('JE', 'Jersey', 'جيرزي', 'GBP', 5.00, '+44', '🇯🇪'),
  ('JM', 'Jamaica', 'جامايكا', 'JMD', 15.00, '+1876', '🇯🇲'),
  ('JO', 'Jordan', 'الأردن', 'JOD', 16.00, '+962', '🇯🇴'),
  ('JP', 'Japan', 'اليابان', 'JPY', 10.00, '+81', '🇯🇵'),
  ('KE', 'Kenya', 'كينيا', 'KES', 16.00, '+254', '🇰🇪'),
  ('KG', 'Kyrgyzstan', 'قيرغيزستان', 'KGS', 12.00, '+996', '🇰🇬'),
  ('KH', 'Cambodia', 'كمبوديا', 'KHR', 10.00, '+855', '🇰🇭'),
  ('KI', 'Kiribati', 'كيريباتي', 'AUD', 12.50, '+686', '🇰🇮'),
  ('KM', 'Comoros', 'جزر القمر', 'KMF', 10.00, '+269', '🇰🇲'),
  ('KN', 'Saint Kitts and Nevis', 'سانت كيتس ونيفيس', 'XCD', 17.00, '+1869', '🇰🇳'),
  ('KP', 'North Korea', 'كوريا الشمالية', 'KPW', 0.00, '+850', '🇰🇵'),
  ('KR', 'South Korea', 'كوريا الجنوبية', 'KRW', 10.00, '+82', '🇰🇷'),
  ('KW', 'Kuwait', 'الكويت', 'KWD', 0.00, '+965', '🇰🇼'),
  ('KY', 'Cayman Islands', 'جزر كايمان', 'KYD', 0.00, '+1345', '🇰🇾'),
  ('KZ', 'Kazakhstan', 'كازاخستان', 'KZT', 12.00, '+7', '🇰🇿'),
  ('LA', 'Laos', 'لاوس', 'LAK', 10.00, '+856', '🇱🇦'),
  ('LB', 'Lebanon', 'لبنان', 'LBP', 11.00, '+961', '🇱🇧'),
  ('LC', 'Saint Lucia', 'سانت لوسيا', 'XCD', 12.50, '+1758', '🇱🇨'),
  ('LI', 'Liechtenstein', 'ليختنشتاين', 'CHF', 7.70, '+423', '🇱🇮'),
  ('LK', 'Sri Lanka', 'سريلانكا', 'LKR', 15.00, '+94', '🇱🇰'),
  ('LR', 'Liberia', 'ليبيريا', 'LRD', 10.00, '+231', '🇱🇷'),
  ('LS', 'Lesotho', 'ليسوتو', 'LSL', 15.00, '+266', '🇱🇸'),
  ('LT', 'Lithuania', 'ليتوانيا', 'EUR', 21.00, '+370', '🇱🇹'),
  ('LU', 'Luxembourg', 'لوكسمبورغ', 'EUR', 17.00, '+352', '🇱🇺'),
  ('LV', 'Latvia', 'لاتفيا', 'EUR', 21.00, '+371', '🇱🇻'),
  ('LY', 'Libya', 'ليبيا', 'LYD', 0.00, '+218', '🇱🇾'),
  ('MA', 'Morocco', 'المغرب', 'MAD', 20.00, '+212', '🇲🇦'),
  ('MC', 'Monaco', 'موناكو', 'EUR', 20.00, '+377', '🇲🇨'),
  ('MD', 'Moldova', 'مولدوفا', 'MDL', 20.00, '+373', '🇲🇩'),
  ('ME', 'Montenegro', 'الجبل الأسود', 'EUR', 21.00, '+382', '🇲🇪'),
  ('MF', 'Saint Martin', 'سانت مارتن', 'EUR', 0.00, '+590', '🇲🇫'),
  ('MG', 'Madagascar', 'مدغشقر', 'MGA', 20.00, '+261', '🇲🇬'),
  ('MH', 'Marshall Islands', 'جزر مارشال', 'USD', 0.00, '+692', '🇲🇭'),
  ('MK', 'North Macedonia', 'مقدونيا الشمالية', 'MKD', 18.00, '+389', '🇲🇰'),
  ('ML', 'Mali', 'مالي', 'XOF', 18.00, '+223', '🇲🇱'),
  ('MM', 'Myanmar', 'ميانمار', 'MMK', 5.00, '+95', '🇲🇲'),
  ('MN', 'Mongolia', 'منغوليا', 'MNT', 10.00, '+976', '🇲🇳'),
  ('MO', 'Macau', 'ماكاو', 'MOP', 0.00, '+853', '🇲🇴'),
  ('MP', 'Northern Mariana Islands', 'جزر ماريانا الشمالية', 'USD', 0.00, '+1670', '🇲🇵'),
  ('MQ', 'Martinique', 'مارتينيك', 'EUR', 8.50, '+596', '🇲🇶'),
  ('MR', 'Mauritania', 'موريتانيا', 'MRU', 16.00, '+222', '🇲🇷'),
  ('MS', 'Montserrat', 'مونتسرات', 'XCD', 0.00, '+1664', '🇲🇸'),
  ('MT', 'Malta', 'مالطا', 'EUR', 18.00, '+356', '🇲🇹'),
  ('MU', 'Mauritius', 'موريشيوس', 'MUR', 15.00, '+230', '🇲🇺'),
  ('MV', 'Maldives', 'المالديف', 'MVR', 8.00, '+960', '🇲🇻'),
  ('MW', 'Malawi', 'مالاوي', 'MWK', 16.50, '+265', '🇲🇼'),
  ('MX', 'Mexico', 'المكسيك', 'MXN', 16.00, '+52', '🇲🇽'),
  ('MY', 'Malaysia', 'ماليزيا', 'MYR', 10.00, '+60', '🇲🇾'),
  ('MZ', 'Mozambique', 'موزمبيق', 'MZN', 17.00, '+258', '🇲🇿'),
  ('NA', 'Namibia', 'ناميبيا', 'NAD', 15.00, '+264', '🇳🇦'),
  ('NC', 'New Caledonia', 'كاليدونيا الجديدة', 'XPF', 11.00, '+687', '🇳🇨'),
  ('NE', 'Niger', 'النيجر', 'XOF', 19.00, '+227', '🇳🇪'),
  ('NF', 'Norfolk Island', 'جزيرة نورفولك', 'AUD', 0.00, '+672', '🇳🇫'),
  ('NG', 'Nigeria', 'نيجيريا', 'NGN', 7.50, '+234', '🇳🇬'),
  ('NI', 'Nicaragua', 'نيكاراغوا', 'NIO', 15.00, '+505', '🇳🇮'),
  ('NL', 'Netherlands', 'هولندا', 'EUR', 21.00, '+31', '🇳🇱'),
  ('NO', 'Norway', 'النرويج', 'NOK', 25.00, '+47', '🇳🇴'),
  ('NP', 'Nepal', 'نيبال', 'NPR', 13.00, '+977', '🇳🇵'),
  ('NR', 'Nauru', 'ناورو', 'AUD', 0.00, '+674', '🇳🇷'),
  ('NU', 'Niue', 'نيوي', 'NZD', 12.50, '+683', '🇳🇺'),
  ('NZ', 'New Zealand', 'نيوزيلندا', 'NZD', 15.00, '+64', '🇳🇿'),
  ('OM', 'Oman', 'عمان', 'OMR', 5.00, '+968', '🇴🇲'),
  ('PA', 'Panama', 'بنما', 'PAB', 7.00, '+507', '🇵🇦'),
  ('PE', 'Peru', 'بيرو', 'PEN', 18.00, '+51', '🇵🇪'),
  ('PF', 'French Polynesia', 'بولينزيا الفرنسية', 'XPF', 16.00, '+689', '🇵🇫'),
  ('PG', 'Papua New Guinea', 'بابوا غينيا الجديدة', 'PGK', 10.00, '+675', '🇵🇬'),
  ('PH', 'Philippines', 'الفلبين', 'PHP', 12.00, '+63', '🇵🇭'),
  ('PK', 'Pakistan', 'باكستان', 'PKR', 17.00, '+92', '🇵🇰'),
  ('PL', 'Poland', 'بولندا', 'PLN', 23.00, '+48', '🇵🇱'),
  ('PM', 'Saint Pierre and Miquelon', 'سان بيير وميكلون', 'EUR', 0.00, '+508', '🇵🇲'),
  ('PN', 'Pitcairn Islands', 'جزر بيتكيرن', 'NZD', 0.00, '+64', '🇵🇳'),
  ('PR', 'Puerto Rico', 'بورتوريكو', 'USD', 11.50, '+1787', '🇵🇷'),
  ('PS', 'Palestine', 'فلسطين', 'ILS', 16.00, '+970', '🇵🇸'),
  ('PT', 'Portugal', 'البرتغال', 'EUR', 23.00, '+351', '🇵🇹'),
  ('PW', 'Palau', 'بالاو', 'USD', 0.00, '+680', '🇵🇼'),
  ('PY', 'Paraguay', 'باراغواي', 'PYG', 10.00, '+595', '🇵🇾'),
  ('QA', 'Qatar', 'قطر', 'QAR', 0.00, '+974', '🇶🇦'),
  ('RE', 'Réunion', 'لا ريونيون', 'EUR', 8.50, '+262', '🇷🇪'),
  ('RO', 'Romania', 'رومانيا', 'RON', 19.00, '+40', '🇷🇴'),
  ('RS', 'Serbia', 'صربيا', 'RSD', 20.00, '+381', '🇷🇸'),
  ('RU', 'Russia', 'روسيا', 'RUB', 20.00, '+7', '🇷🇺'),
  ('RW', 'Rwanda', 'رواندا', 'RWF', 18.00, '+250', '🇷🇼'),
  ('SA', 'Saudi Arabia', 'السعودية', 'SAR', 15.00, '+966', '🇸🇦'),
  ('SB', 'Solomon Islands', 'جزر سليمان', 'SBD', 10.00, '+677', '🇸🇧'),
  ('SC', 'Seychelles', 'سيشل', 'SCR', 15.00, '+248', '🇸🇨'),
  ('SD', 'Sudan', 'السودان', 'SDG', 17.00, '+249', '🇸🇩'),
  ('SE', 'Sweden', 'السويد', 'SEK', 25.00, '+46', '🇸🇪'),
  ('SG', 'Singapore', 'سنغافورة', 'SGD', 9.00, '+65', '🇸🇬'),
  ('SH', 'Saint Helena', 'سانت هيلانة', 'SHP', 0.00, '+290', '🇸🇭'),
  ('SI', 'Slovenia', 'سلوفينيا', 'EUR', 22.00, '+386', '🇸🇮'),
  ('SJ', 'Svalbard and Jan Mayen', 'سفالبارد ويان ماين', 'NOK', 0.00, '+47', '🇸🇯'),
  ('SK', 'Slovakia', 'سلوفاكيا', 'EUR', 23.00, '+421', '🇸🇰'),
  ('SL', 'Sierra Leone', 'سيراليون', 'SLL', 15.00, '+232', '🇸🇱'),
  ('SM', 'San Marino', 'سان مارينو', 'EUR', 0.00, '+378', '🇸🇲'),
  ('SN', 'Senegal', 'السنغال', 'XOF', 18.00, '+221', '🇸🇳'),
  ('SO', 'Somalia', 'الصومال', 'SOS', 0.00, '+252', '🇸🇴'),
  ('SR', 'Suriname', 'سورينام', 'SRD', 10.00, '+597', '🇸🇷'),
  ('SS', 'South Sudan', 'جنوب السودان', 'SSP', 18.00, '+211', '🇸🇸'),
  ('ST', 'São Tomé and Príncipe', 'ساو تومي وبرينسيبي', 'STN', 15.00, '+239', '🇸🇹'),
  ('SV', 'El Salvador', 'السلفادور', 'USD', 13.00, '+503', '🇸🇻'),
  ('SX', 'Sint Maarten', 'سينت مارتن', 'ANG', 5.00, '+1721', '🇸🇽'),
  ('SY', 'Syria', 'سوريا', 'SYP', 11.00, '+963', '🇸🇾'),
  ('SZ', 'Eswatini', 'إسواتيني', 'SZL', 15.00, '+268', '🇸🇿'),
  ('TC', 'Turks and Caicos Islands', 'جزر توركس وكايكوس', 'USD', 0.00, '+1649', '🇹🇨'),
  ('TD', 'Chad', 'تشاد', 'XAF', 18.00, '+235', '🇹🇩'),
  ('TF', 'French Southern Territories', 'أراضي فرنسا الجنوبية', 'EUR', 0.00, '+262', '🇹🇫'),
  ('TG', 'Togo', 'توغو', 'XOF', 18.00, '+228', '🇹🇬'),
  ('TH', 'Thailand', 'تايلاند', 'THB', 7.00, '+66', '🇹🇭'),
  ('TJ', 'Tajikistan', 'طاجيكستان', 'TJS', 15.00, '+992', '🇹🇯'),
  ('TK', 'Tokelau', 'توكيلاو', 'NZD', 0.00, '+690', '🇹🇰'),
  ('TL', 'Timor-Leste', 'تيمور الشرقية', 'USD', 0.00, '+670', '🇹🇱'),
  ('TM', 'Turkmenistan', 'تركمانستان', 'TMT', 15.00, '+993', '🇹🇲'),
  ('TN', 'Tunisia', 'تونس', 'TND', 19.00, '+216', '🇹🇳'),
  ('TO', 'Tonga', 'تونغا', 'TOP', 15.00, '+676', '🇹🇴'),
  ('TR', 'Turkey', 'تركيا', 'TRY', 20.00, '+90', '🇹🇷'),
  ('TT', 'Trinidad and Tobago', 'ترينيداد وتوباغو', 'TTD', 12.50, '+1868', '🇹🇹'),
  ('TV', 'Tuvalu', 'توفالو', 'AUD', 0.00, '+688', '🇹🇻'),
  ('TW', 'Taiwan', 'تايوان', 'TWD', 5.00, '+886', '🇹🇼'),
  ('TZ', 'Tanzania', 'تنزانيا', 'TZS', 18.00, '+255', '🇹🇿'),
  ('UA', 'Ukraine', 'أوكرانيا', 'UAH', 20.00, '+380', '🇺🇦'),
  ('UG', 'Uganda', 'أوغندا', 'UGX', 18.00, '+256', '🇺🇬'),
  ('UM', 'U.S. Outlying Islands', 'جزر الولايات المتحدة', 'USD', 0.00, '+1', '🇺🇲'),
  ('US', 'United States', 'الولايات المتحدة', 'USD', 0.00, '+1', '🇺🇸'),
  ('UY', 'Uruguay', 'الأوروغواي', 'UYU', 22.00, '+598', '🇺🇾'),
  ('UZ', 'Uzbekistan', 'أوزبكستان', 'UZS', 12.00, '+998', '🇺🇿'),
  ('VA', 'Vatican City', 'الفاتيكان', 'EUR', 0.00, '+379', '🇻🇦'),
  ('VC', 'Saint Vincent and the Grenadines', 'سانت فينسنت والغرينادين', 'XCD', 16.00, '+1784', '🇻🇨'),
  ('VE', 'Venezuela', 'فنزويلا', 'VES', 16.00, '+58', '🇻🇪'),
  ('VG', 'British Virgin Islands', 'جزر العذراء البريطانية', 'USD', 0.00, '+1284', '🇻🇬'),
  ('VI', 'U.S. Virgin Islands', 'جزر العذراء الأمريكية', 'USD', 0.00, '+1340', '🇻🇮'),
  ('VN', 'Vietnam', 'فيتنام', 'VND', 10.00, '+84', '🇻🇳'),
  ('VU', 'Vanuatu', 'فانواتو', 'VUV', 15.00, '+678', '🇻🇺'),
  ('WF', 'Wallis and Futuna', 'واليس وفوتونا', 'XPF', 0.00, '+681', '🇼🇫'),
  ('WS', 'Samoa', 'ساموا', 'WST', 15.00, '+685', '🇼🇸'),
  ('YE', 'Yemen', 'اليمن', 'YER', 5.00, '+967', '🇾🇪'),
  ('YT', 'Mayotte', 'مايوت', 'EUR', 0.00, '+262', '🇾🇹'),
  ('ZA', 'South Africa', 'جنوب أفريقيا', 'ZAR', 15.00, '+27', '🇿🇦'),
  ('ZM', 'Zambia', 'زامبيا', 'ZMW', 16.00, '+260', '🇿🇲'),
  ('ZW', 'Zimbabwe', 'زيمبابوي', 'ZWL', 15.00, '+263', '🇿🇼')
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- 3. Extend profiles table (regional preferences)
-- ============================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS country_code CHAR(2) REFERENCES countries(code);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS default_currency CHAR(3) REFERENCES currencies(code);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_language CHAR(2) DEFAULT 'ar' CHECK (preferred_language IN ('ar','en'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5,2) DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS business_type TEXT CHECK (business_type IN ('freelancer','small_business','agency','enterprise') OR business_type IS NULL);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Backfill: existing users → Kuwait/KWD/Arabic (preserves current UX)
UPDATE profiles
SET
  country_code = COALESCE(country_code, 'KW'),
  default_currency = COALESCE(default_currency, 'KWD'),
  preferred_language = COALESCE(preferred_language, 'ar'),
  onboarding_completed = COALESCE(onboarding_completed, TRUE)
WHERE country_code IS NULL OR default_currency IS NULL;

-- ============================================
-- 4. Extend invoices table (currency, tax, discount, notes)
-- ============================================
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS currency_code CHAR(3) REFERENCES currencies(code);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5,2) DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(12,3) DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(12,3) DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS subtotal DECIMAL(12,3) DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS total DECIMAL(12,3) DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT '';

-- Backfill: copy old currency text → new FK + initialize totals
UPDATE invoices
SET
  currency_code = COALESCE(currency_code, UPPER(TRIM(currency)), 'KWD'),
  subtotal = COALESCE(NULLIF(subtotal, 0), amount),
  total = COALESCE(NULLIF(total, 0), amount)
WHERE currency_code IS NULL OR subtotal = 0 OR total = 0;

-- Fallback for unrecognized currency codes
UPDATE invoices
SET currency_code = 'KWD'
WHERE currency_code IS NOT NULL
  AND currency_code NOT IN (SELECT code FROM currencies);

-- ============================================
-- 5. Update auto-create profile trigger (new users → onboarding)
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, email, country_code, default_currency, preferred_language, onboarding_completed)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    NULL,
    NULL,
    'ar',
    FALSE
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. Public read access to lookup tables
-- ============================================
ALTER TABLE currencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read currencies" ON currencies;
CREATE POLICY "Anyone can read currencies" ON currencies
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Anyone can read countries" ON countries;
CREATE POLICY "Anyone can read countries" ON countries
  FOR SELECT USING (TRUE);

-- ============================================
-- 7. Verification queries (run after migration)
-- ============================================
-- SELECT 'currencies' AS table_name, COUNT(*) FROM currencies
-- UNION ALL SELECT 'countries', COUNT(*) FROM countries;
-- SELECT email, country_code, default_currency, preferred_language, onboarding_completed FROM profiles WHERE email = 'hello@sn3s.com';
-- SELECT COUNT(*) AS my_invoices, COUNT(currency_code) AS with_currency FROM invoices WHERE user_id = (SELECT id FROM auth.users WHERE email = 'hello@sn3s.com');
