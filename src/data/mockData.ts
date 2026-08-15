export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
}

export interface Review {
  id: string;
  productId: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
  approved: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: number;
  compare_at_price?: number;
  category_id: string;
  stock: number;
  sku: string;
  images: string[];
  materials: string[];
  care_instructions: string[];
  customization_available: boolean;
  personalization_options?: string[];
  preparation_time?: string;
  shipping_time?: string;
  featured: boolean;
  bestseller: boolean;
  new_product: boolean;
  status: 'active' | 'archived';
  created_at: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
  customization?: string;
}

export interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface Order {
  id: string;
  customer_id: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  order_status: 'pending' | 'confirmed' | 'being_crafted' | 'packed' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address: ShippingAddress;
  notes?: string;
  created_at: string;
}

export interface CustomOrderRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  productType: string;
  occasion: string;
  preferredColor: string;
  quantity: number;
  budgetRange: string;
  customizationDetails: string;
  requiredDate: string;
  referenceImage?: string;
  message?: string;
  status: 'new' | 'contacted' | 'in_discussion' | 'approved' | 'being_crafted' | 'completed' | 'rejected';
  created_at: string;
}

export interface Coupon {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minSubtotal?: number;
  active: boolean;
}

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'keychains',
    name: 'Crochet Keychains',
    description: 'Cute, pocket-sized handmade companions for your keys or bags.',
    image: '/images/butterfly_keychain.jpg',
  },
  {
    id: 'flowers',
    name: 'Crochet Flowers',
    description: 'Handmade crochet flowers and floral creations that bloom forever.',
    image: '/images/flower_bookmark.jpg',
  },
  {
    id: 'bookmarks',
    name: 'Crochet Bookmarks',
    description: 'Elegantly stitched stems and blossoms to mark your reading journeys.',
    image: '/images/flower_bookmark.jpg',
  },
  {
    id: 'accessories',
    name: 'Crochet Accessories',
    description: 'Wearable handmade bows and bands that add soft texture to your hair.',
    image: '/images/hair_accessories.jpg',
  },
  {
    id: 'gifts',
    name: 'Crochet Gifts',
    description: 'Beautifully bundled handmade sets perfect for birthdays and special moments.',
    image: '/images/custom_gift.jpg',
  },
  {
    id: 'custom-crochet',
    name: 'Custom Crochet',
    description: 'Personalized designs custom-knitted in your favorite color patterns.',
    image: '/images/custom_gift.jpg',
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Crochet Butterfly Keychain',
    slug: 'crochet-butterfly-keychain',
    short_description: 'An adorable handmade crochet butterfly keychain featuring vibrant wings and dangling flower buds.',
    description: 'Add a touch of handcrafted sweetness to your keys, bag, or backpack with this lovely crochet butterfly keychain. Carefully stitched with high-quality, non-pilling cotton yarn, this keychain is durable and soft. It features a bright multi-colored butterfly wing pattern and three dangling flower buds that sway beautifully with movement. Each piece is unique and made with love.',
    price: 249,
    compare_at_price: 299,
    category_id: 'keychains',
    stock: 12,
    sku: 'KC-BUTTERFLY-01',
    images: ['/images/butterfly_keychain.jpg', '/images/evil_eye_keychain.jpg'],
    materials: ['100% Organic Cotton Yarn', 'Metal Key Ring', 'Hypoallergenic Fiberfill'],
    care_instructions: [
      'Gently hand wash in cold water with mild detergent.',
      'Do not wring or squeeze aggressively.',
      'Lay flat on a clean dry towel to air dry.',
      'Do not bleach or iron.'
    ],
    customization_available: true,
    personalization_options: ['Vibrant Red & Orange (Default)', 'Dusty Pink & White', 'Sage Green & Beige', 'Lavender & Pastel Yellow'],
    preparation_time: '2-3 days',
    shipping_time: '3-5 days',
    featured: true,
    bestseller: true,
    new_product: true,
    status: 'active',
    created_at: '2026-08-01T10:00:00Z',
  },
  {
    id: 'prod-2',
    name: 'Crochet Evil Eye Keychain',
    slug: 'crochet-evil-eye-keychain',
    short_description: 'A pocket-sized crochet evil eye keychain designed to bring good vibes and protect your keys.',
    description: 'Stitched with precision, this crochet evil eye keychain is a wonderful charm to keep close. Featuring concentric circles of deep blue, white, soft blue, and a black pupil, it serves as both a fashionable accessory and a symbol of protection. Ideal for gifting to friends and family or keeping for yourself.',
    price: 199,
    category_id: 'keychains',
    stock: 18,
    sku: 'KC-EVILEYE-01',
    images: ['/images/evil_eye_keychain.jpg', '/images/butterfly_keychain.jpg'],
    materials: ['Organic Cotton Yarn', 'Metal Key Ring', 'Wooden Bead Accent'],
    care_instructions: [
      'Spot clean with a damp cloth.',
      'If fully washed, hand wash cold and air dry.',
      'Avoid pulling on any yarn loops.'
    ],
    customization_available: false,
    preparation_time: '1-2 days',
    shipping_time: '3-5 days',
    featured: true,
    bestseller: true,
    new_product: false,
    status: 'active',
    created_at: '2026-08-02T12:00:00Z',
  },
  {
    id: 'prod-3',
    name: 'Crochet Flower Bookmark',
    slug: 'crochet-flower-bookmark',
    short_description: 'An elegant, long-stemmed crochet flower bookmark to accompany your reading sessions.',
    description: 'Never lose your place again with this beautiful handmade flower bookmark. A purple flower with a bright yellow center sits gracefully at the top of a long, green chain-stitched stem, finished with two delicate green leaves. It lies flat inside any book and peeks out elegantly, making it a perfect gift for book lovers.',
    price: 149,
    compare_at_price: 179,
    category_id: 'bookmarks',
    stock: 25,
    sku: 'BM-FLOWER-01',
    images: ['/images/flower_bookmark.jpg', '/images/hair_accessories.jpg'],
    materials: ['Soft Cotton Yarn', 'Fabric Stiffener (for leaves)'],
    care_instructions: [
      'Lay flat and hand wash only if needed.',
      'Reshape while damp and let air dry.',
      'Steam iron on low setting if edges curl.'
    ],
    customization_available: true,
    personalization_options: ['Soft Purple (Default)', 'Blush Pink', 'Sunny Yellow', 'Pastel Blue'],
    preparation_time: '1-2 days',
    shipping_time: '3-5 days',
    featured: true,
    bestseller: false,
    new_product: true,
    status: 'active',
    created_at: '2026-08-03T09:00:00Z',
  },
  {
    id: 'prod-4',
    name: 'Crochet Hair Bow Clips (Set of 2)',
    slug: 'crochet-hair-bow-clips',
    short_description: 'A set of two soft, dusty blush pink crochet bow clips for a warm and elegant hair accessory.',
    description: 'This set features two matching crochet bows mounted on secure alligator metal clips. Crafted from dusty blush pink cotton yarn, they add a warm, feminine, and artistic touch to any hairstyle. Sturdy construction ensures they stay in place comfortably all day long.',
    price: 129,
    category_id: 'accessories',
    stock: 15,
    sku: 'HA-BOWS-01',
    images: ['/images/hair_accessories.jpg', '/images/flower_bookmark.jpg'],
    materials: ['Premium Cotton Yarn', 'Alligator Steel Clips', 'Hot Glue Adhesion'],
    care_instructions: [
      'Avoid contact with water to protect the metal clips from rusting.',
      'Spot clean yarn parts gently if required.'
    ],
    customization_available: true,
    personalization_options: ['Blush Pink (Default)', 'Cocoa Brown', 'Creamy White', 'Sage Green'],
    preparation_time: '2 days',
    shipping_time: '3-5 days',
    featured: false,
    bestseller: true,
    new_product: true,
    status: 'active',
    created_at: '2026-08-04T15:00:00Z',
  },
  {
    id: 'prod-5',
    name: 'Crochet Mini Sunflower Pot',
    slug: 'crochet-mini-sunflower-pot',
    short_description: 'A cute, hand-stitched mini crochet sunflower in an adorable brown potted base.',
    description: 'Stitched with soft cotton threads, this mini crochet sunflower potted plant is a delightful desk companion. Resting inside a tiny knitted brown pot, its bright yellow petals bring sunshine and warmth to any office desk, study table, dashboard, or shelf. Requires zero maintenance and makes a thoughtful gift!',
    price: 299,
    category_id: 'flowers',
    stock: 8,
    sku: 'FL-SUNFLOWER-01',
    images: ['/images/flower_bookmark.jpg', '/images/custom_gift.jpg'],
    materials: ['Cotton Threads', 'Fiberfill Stuffing', 'Recycled Cardboard Pot Base'],
    care_instructions: [
      'Dust gently with a soft dry brush.',
      'Do not wash or submerge in water.',
      'Reshape leaves if flattened during transit.'
    ],
    customization_available: false,
    preparation_time: '2-3 days',
    shipping_time: '3-5 days',
    featured: true,
    bestseller: true,
    new_product: true,
    status: 'active',
    created_at: '2026-08-05T11:00:00Z',
  },
  {
    id: 'prod-6',
    name: 'Custom Crochet Gift Box',
    slug: 'custom-crochet-gift-box',
    short_description: 'A beautifully packaged custom-crafted gift bundle complete with personalized notes.',
    description: 'Make someone feel special with this small-batch customized gift box. We bundle a selection of Neeshiartique favorites (like keychains, flower bookmarks, and bow clips) inside a kraft gift box, wrapped in soft cotton ribbon and finished with a dried baby\'s breath flower sprig. Include a handwritten message of your choice to complete this thoughtful gift.',
    price: 499,
    category_id: 'gifts',
    stock: 10,
    sku: 'GB-CUSTOM-01',
    images: ['/images/custom_gift.jpg', '/images/butterfly_keychain.jpg'],
    materials: ['Kraft Cardboard Box', 'Cotton Ribbon Wrapper', 'Dried Flowers', 'Handwritten Cardboard Tag'],
    care_instructions: ['Keep in dry storage.', 'Handle dried flowers gently.'],
    customization_available: true,
    personalization_options: ['Default (1 Keychain + 1 Bookmark)', 'Double Keychain Box', 'Double Bookmark & Bows Box'],
    preparation_time: '4-6 days',
    shipping_time: '3-5 days',
    featured: true,
    bestseller: true,
    new_product: false,
    status: 'active',
    created_at: '2026-08-06T14:30:00Z',
  },
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    productId: 'prod-1',
    customerName: 'Shruti P.',
    rating: 5,
    comment: 'The crochet butterfly keychain is absolutely beautiful! The detail is incredible, and the white flower buds dangling look so lovely on my tote bag. Highly recommended!',
    date: '2026-08-10',
    approved: true,
  },
  {
    id: 'rev-2',
    productId: 'prod-2',
    customerName: 'Yash P.',
    rating: 5,
    comment: 'Great quality and stitching. Bought the evil eye keychain, and it feels sturdy. The wooden bead is a nice touch.',
    date: '2026-08-12',
    approved: true,
  },
  {
    id: 'rev-3',
    productId: 'prod-3',
    customerName: 'Neelam R.',
    rating: 4.5,
    comment: 'Such a sweet bookmark! Makes reading my physical books feel special. The packaging was so lovely as well.',
    date: '2026-08-14',
    approved: true,
  },
];

export const INITIAL_COUPONS: Coupon[] = [
  { code: 'LOVECROCHET', type: 'percentage', value: 10, active: true },
  { code: 'NEESHIGIFT', type: 'fixed', value: 50, minSubtotal: 300, active: true },
  { code: 'WELCOME15', type: 'percentage', value: 15, active: true },
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-9872',
    customer_id: 'cust-1',
    items: [
      {
        productId: 'prod-1',
        name: 'Crochet Butterfly Keychain',
        quantity: 1,
        price: 249,
        image: '/images/butterfly_keychain.jpg',
        customization: 'Dusty Pink & White',
      },
    ],
    subtotal: 249,
    shipping: 40,
    discount: 0,
    total: 289,
    payment_status: 'paid',
    order_status: 'being_crafted',
    shipping_address: {
      fullName: 'Sagar Patidar',
      email: 'sagar@example.com',
      phone: '6388992271',
      address: 'Sector 3, HSR Layout',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560102',
      country: 'India',
    },
    notes: 'Please wrap it nicely, it is a birthday gift for a friend!',
    created_at: '2026-08-14T11:20:00Z',
  },
];

export const INITIAL_CUSTOM_ORDERS: CustomOrderRequest[] = [
  {
    id: 'REQ-4512',
    name: 'Sarah M.',
    email: 'sarah.m@example.com',
    phone: '+919988776655',
    productType: 'Crochet Keychain',
    occasion: 'Anniversary Gift',
    preferredColor: 'Lavender and Cream',
    quantity: 2,
    budgetRange: '₹500 - ₹1000',
    customizationDetails: 'I would like two interlocking heart keychains in lavender and cream wool with our initials "S & B" embroidered on them.',
    requiredDate: '2026-09-05',
    status: 'approved',
    created_at: '2026-08-12T16:45:00Z',
  },
];
