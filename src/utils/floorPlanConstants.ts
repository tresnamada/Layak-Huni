// Floor Plan API Configuration Constants
export const FLOOR_PLAN_CONFIG = {
    // API Timeouts
    API_TIMEOUT: 30000, // 30 seconds
    RETRY_ATTEMPTS: 5,
    INITIAL_RETRY_DELAY: 1000, // 1 second

    // Image Configuration
    DEFAULT_IMAGE_SIZE: '1024x1024',
    THUMBNAIL_SIZE: '256x256',
    SUPPORTED_FORMATS: ['png', 'jpg', 'jpeg'],
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB

    // Validation Limits
    MAX_DESCRIPTION_LENGTH: 2000,
    MAX_FEATURES_COUNT: 10,
    MIN_DESCRIPTION_LENGTH: 10,

    // Default Values
    DEFAULT_STYLE: 'modern',
    DEFAULT_QUALITY: 'high',
    DEFAULT_ROOMS: ['Ruang Utama'],

    // Cost Estimation (IDR per m²)
    BASE_COST_PER_SQM: 3000000, // 3 million IDR
    STYLE_MULTIPLIERS: {
        'modern': 1.2,
        'minimalis': 1.0,
        'klasik': 1.3,
        'kontemporer': 1.1,
        'mediterania': 1.4,
        'tropical': 1.1,
        'industrial': 1.15,
        'scandinavian': 1.25
    } as const,

    // Premium Features (add cost multiplier)
    PREMIUM_FEATURES: [
        'smart home',
        'panel surya',
        'sistem air hujan',
        'home theater',
        'wine cellar',
        'swimming pool',
        'elevator',
        'sauna',
        'gym',
        'rooftop garden'
    ],

    // Error Messages
    ERROR_MESSAGES: {
        DESCRIPTION_REQUIRED: 'Deskripsi rumah harus diisi',
        DESCRIPTION_TOO_LONG: 'Deskripsi terlalu panjang (maksimal 2000 karakter)',
        DESCRIPTION_TOO_SHORT: 'Deskripsi terlalu pendek (minimal 10 karakter)',
        TOO_MANY_FEATURES: 'Terlalu banyak fitur dipilih (maksimal 10)',
        AUTH_REQUIRED: 'Anda harus login untuk menggunakan fitur ini',
        API_UNAVAILABLE: 'Layanan denah rumah sedang tidak tersedia',
        NETWORK_ERROR: 'Gagal terhubung ke server. Periksa koneksi internet Anda',
        GENERATION_FAILED: 'Gagal menghasilkan denah rumah. Silakan coba lagi',
        INVALID_RESPONSE: 'Respons dari server tidak valid',
        TIMEOUT_ERROR: 'Proses terlalu lama. Silakan coba lagi'
    },

    // Success Messages
    SUCCESS_MESSAGES: {
        GENERATION_COMPLETE: 'Denah rumah berhasil dibuat!',
        DOWNLOAD_READY: 'Denah siap diunduh',
        SAVED_SUCCESSFULLY: 'Denah berhasil disimpan'
    }
} as const;

// Room Detection Patterns for Indonesian descriptions
export const ROOM_PATTERNS = [
    { pattern: /(\d+)\s*kamar\s*tidur/gi, room: 'Kamar Tidur' },
    { pattern: /(\d+)\s*kamar\s*mandi/gi, room: 'Kamar Mandi' },
    { pattern: /(\d+)\s*wc/gi, room: 'WC' },
    { pattern: /ruang\s*keluarga/gi, room: 'Ruang Keluarga' },
    { pattern: /ruang\s*tamu/gi, room: 'Ruang Tamu' },
    { pattern: /ruang\s*makan/gi, room: 'Ruang Makan' },
    { pattern: /dapur/gi, room: 'Dapur' },
    { pattern: /carport/gi, room: 'Carport' },
    { pattern: /garasi/gi, room: 'Garasi' },
    { pattern: /teras/gi, room: 'Teras' },
    { pattern: /balkon/gi, room: 'Balkon' },
    { pattern: /ruang\s*kerja/gi, room: 'Ruang Kerja' },
    { pattern: /perpustakaan/gi, room: 'Perpustakaan' },
    { pattern: /gudang/gi, room: 'Gudang' },
    { pattern: /laundry/gi, room: 'Ruang Cuci' },
    { pattern: /pantry/gi, room: 'Pantry' },
    { pattern: /mushola/gi, room: 'Mushola' },
    { pattern: /ruang\s*serbaguna/gi, room: 'Ruang Serbaguna' }
] as const;

// Area Detection Patterns
export const AREA_PATTERNS = [
    /(\d+)\s*m[²2]/gi,
    /(\d+)\s*meter\s*persegi/gi,
    /luas\s*(\d+)/gi,
    /(\d+)\s*square\s*meter/gi
] as const;

// Dimension Estimation Helper
export const DIMENSION_HELPERS = {
    // Standard room sizes in Indonesia (in meters)
    STANDARD_ROOM_SIZES: {
        'Kamar Tidur Utama': { width: 4, height: 4 },
        'Kamar Tidur': { width: 3, height: 3 },
        'Kamar Mandi': { width: 2, height: 2 },
        'Ruang Keluarga': { width: 5, height: 4 },
        'Ruang Tamu': { width: 4, height: 4 },
        'Dapur': { width: 3, height: 3 },
        'Ruang Makan': { width: 3, height: 3 },
        'Carport': { width: 3, height: 6 },
        'Teras': { width: 2, height: 4 }
    },

    // Minimum house dimensions
    MIN_HOUSE_WIDTH: 6,
    MIN_HOUSE_HEIGHT: 6,
    MAX_HOUSE_WIDTH: 20,
    MAX_HOUSE_HEIGHT: 20,

    // Aspect ratio preferences
    PREFERRED_ASPECT_RATIOS: [
        { ratio: 1.0, name: 'Square' },
        { ratio: 1.2, name: 'Slightly Rectangular' },
        { ratio: 1.5, name: 'Rectangular' },
        { ratio: 0.8, name: 'Tall Rectangle' }
    ]
} as const;

// API Response Validation Schema
export const RESPONSE_VALIDATION = {
    REQUIRED_FIELDS: ['imageUrl'] as const,
    OPTIONAL_FIELDS: ['thumbnailUrl', 'metadata'] as const,
    METADATA_FIELDS: [
        'dimensions',
        'rooms',
        'totalArea',
        'estimatedCost',
        'constructionTime',
        'apiProvider',
        'generationTime'
    ] as const
} as const;

// Export types for better TypeScript support
export type StyleMultiplier = keyof typeof FLOOR_PLAN_CONFIG.STYLE_MULTIPLIERS;
export type ErrorMessageKey = keyof typeof FLOOR_PLAN_CONFIG.ERROR_MESSAGES;
export type SuccessMessageKey = keyof typeof FLOOR_PLAN_CONFIG.SUCCESS_MESSAGES;