import { BucketCategory, BucketPriority } from '../types';

export interface BucketSuggestion {
  id: string;
  title: string;
  category: BucketCategory;
  priority: BucketPriority;
  description: string;
  iconName?: string;
}

export const BUCKET_SUGGESTIONS: BucketSuggestion[] = [
  // TRAVEL
  {
    id: 'sug-1',
    title: 'Witness the Northern Lights in Lapland',
    category: 'TRAVEL',
    priority: 'HIGH',
    description: 'Camp under the aurora borealis in an glass igloo in Finland.',
  },
  {
    id: 'sug-2',
    title: 'Hike the Inca Trail to Machu Picchu',
    category: 'TRAVEL',
    priority: 'HIGH',
    description: 'Trek ancient mountain paths to reach the legendary sun gate.',
  },
  {
    id: 'sug-3',
    title: 'Ride a Hot Air Balloon over Cappadocia',
    category: 'TRAVEL',
    priority: 'MEDIUM',
    description: 'Soar above fairy chimneys in Turkey at sunrise.',
  },
  {
    id: 'sug-4',
    title: 'Explore the Cherry Blossom Season in Kyoto',
    category: 'TRAVEL',
    priority: 'MEDIUM',
    description: 'Stroll through historic bamboo groves and pink sakura blooms.',
  },
  {
    id: 'sug-5',
    title: 'Road trip along California’s Pacific Coast Highway',
    category: 'TRAVEL',
    priority: 'MEDIUM',
    description: 'Drive from San Francisco to San Diego along ocean cliffs.',
  },

  // LEARN
  {
    id: 'sug-6',
    title: 'Become conversational in a 3rd language',
    category: 'LEARN',
    priority: 'HIGH',
    description: 'Master 1000 essential words and order coffee like a local.',
  },
  {
    id: 'sug-7',
    title: 'Learn to play 3 songs on acoustic guitar',
    category: 'LEARN',
    priority: 'MEDIUM',
    description: 'Practice basic chords until finger calluses form.',
  },
  {
    id: 'sug-8',
    title: 'Master classical chess openings and tactics',
    category: 'LEARN',
    priority: 'LOW',
    description: 'Reach an online rating of 1500+ and defeat a grandmaster bot.',
  },
  {
    id: 'sug-9',
    title: 'Read the top 10 timeless philosophy classics',
    category: 'LEARN',
    priority: 'MEDIUM',
    description: 'Explore Stoicism, Eastern thought, and existentialism.',
  },
  {
    id: 'sug-10',
    title: 'Learn full-stack web development with Rust',
    category: 'LEARN',
    priority: 'HIGH',
    description: 'Build high-performance systems from scratch.',
  },

  // ADVENTURE
  {
    id: 'sug-11',
    title: 'Tandem Skydiving from 15,000 feet',
    category: 'ADVENTURE',
    priority: 'HIGH',
    description: 'Experience 60 seconds of pure adrenalizing freefall.',
  },
  {
    id: 'sug-12',
    title: 'Scuba dive in the Great Barrier Reef',
    category: 'ADVENTURE',
    priority: 'HIGH',
    description: 'Swim alongside sea turtles and colorful coral gardens.',
  },
  {
    id: 'sug-13',
    title: 'Camp solo under a starry desert sky',
    category: 'ADVENTURE',
    priority: 'MEDIUM',
    description: 'Disconnect completely from screens for 48 hours.',
  },
  {
    id: 'sug-14',
    title: 'White-water rafting down the Grand Canyon',
    category: 'ADVENTURE',
    priority: 'HIGH',
    description: 'Navigate Class IV rapids on the Colorado River.',
  },
  {
    id: 'sug-15',
    title: 'Bungee jump off a high suspension bridge',
    category: 'ADVENTURE',
    priority: 'MEDIUM',
    description: 'Leap into the canyon air with ultimate trust.',
  },

  // HEALTH
  {
    id: 'sug-16',
    title: 'Run an official Full Marathon (42.2 km)',
    category: 'HEALTH',
    priority: 'HIGH',
    description: 'Train for 16 weeks and cross the finish line with pride.',
  },
  {
    id: 'sug-17',
    title: 'Complete a 30-day Wim Hof Cold Shower challenge',
    category: 'HEALTH',
    priority: 'MEDIUM',
    description: 'Build resilience and boost mental clarity every morning.',
  },
  {
    id: 'sug-18',
    title: 'Achieve a clean unassisted handstand hold',
    category: 'HEALTH',
    priority: 'LOW',
    description: 'Develop core strength and balance for 15 solid seconds.',
  },
  {
    id: 'sug-19',
    title: 'Attend an intensive 10-day silent meditation retreat',
    category: 'HEALTH',
    priority: 'HIGH',
    description: 'Practice Vipassana meditation for deep self-awareness.',
  },
  {
    id: 'sug-20',
    title: 'Prepare all meal plans from scratch for 60 days',
    category: 'HEALTH',
    priority: 'MEDIUM',
    description: 'Eliminate ultra-processed foods and nourish body & mind.',
  },

  // CREATIVE
  {
    id: 'sug-21',
    title: 'Write and publish a hardcover book or novella',
    category: 'CREATIVE',
    priority: 'HIGH',
    description: 'Draft 50,000 words of compelling fiction or personal memoir.',
  },
  {
    id: 'sug-22',
    title: 'Record an original 5-track music album',
    category: 'CREATIVE',
    priority: 'MEDIUM',
    description: 'Compose lyrics, mix audio tracks, and share on streaming services.',
  },
  {
    id: 'sug-23',
    title: 'Paint a large acrylic canvas for living room centerpiece',
    category: 'CREATIVE',
    priority: 'LOW',
    description: 'Experiment with abstract gradients and gold leaf accents.',
  },
  {
    id: 'sug-24',
    title: 'Direct a 5-minute cinematic short film',
    category: 'CREATIVE',
    priority: 'MEDIUM',
    description: 'Storyboard, shoot with prime lenses, and edit with color grading.',
  },
  {
    id: 'sug-25',
    title: 'Build a custom handcrafted wooden table',
    category: 'CREATIVE',
    priority: 'MEDIUM',
    description: 'Sand live-edge timber, pour epoxy resin, and apply natural oil.',
  },

  // CAREER
  {
    id: 'sug-26',
    title: 'Launch an independent side-project to 1,000 users',
    category: 'CAREER',
    priority: 'HIGH',
    description: 'Solve a real problem, craft a landing page, and ship it.',
  },
  {
    id: 'sug-27',
    title: 'Deliver a Keynote presentation at an international conference',
    category: 'CAREER',
    priority: 'HIGH',
    description: 'Inspire an audience of 500+ peers on a topic you love.',
  },
  {
    id: 'sug-28',
    title: 'Mentor 3 aspiring developers or career switchers',
    category: 'CAREER',
    priority: 'MEDIUM',
    description: 'Share knowledge, review code, and empower others to succeed.',
  },
  {
    id: 'sug-29',
    title: 'Build an open-source library with 1,000 GitHub stars',
    category: 'CAREER',
    priority: 'MEDIUM',
    description: 'Create clean documentation and foster a helpful contributor community.',
  },

  // RELATIONSHIPS
  {
    id: 'sug-30',
    title: 'Host an unforgettable surprise anniversary party',
    category: 'RELATIONSHIPS',
    priority: 'HIGH',
    description: 'Gather closest friends and family for an evening of stories.',
  },
  {
    id: 'sug-31',
    title: 'Take parents on a fully funded dream vacation',
    category: 'RELATIONSHIPS',
    priority: 'HIGH',
    description: 'Treat them to luxury comfort and create lasting family memories.',
  },
  {
    id: 'sug-32',
    title: 'Establish a weekly distraction-free family dinner ritual',
    category: 'RELATIONSHIPS',
    priority: 'MEDIUM',
    description: 'Phones away, candles lit, deep conversation flowing.',
  },
  {
    id: 'sug-33',
    title: 'Reconnect with an old childhood best friend',
    category: 'RELATIONSHIPS',
    priority: 'LOW',
    description: 'Reach out, plan a weekend reunion, and reminisce.',
  },

  // MONEY
  {
    id: 'sug-34',
    title: 'Build a 6-month liquid emergency safety fund',
    category: 'MONEY',
    priority: 'HIGH',
    description: 'Automate monthly savings into a high-yield interest account.',
  },
  {
    id: 'sug-35',
    title: 'Invest in a diversified long-term passive index portfolio',
    category: 'MONEY',
    priority: 'HIGH',
    description: 'Set up recurring contributions for financial independence.',
  },
  {
    id: 'sug-36',
    title: 'Become completely debt-free',
    category: 'MONEY',
    priority: 'HIGH',
    description: 'Pay off remaining loans or credit balances systematically.',
  },

  // OTHER
  {
    id: 'sug-37',
    title: 'Adopt and raise a rescue pet',
    category: 'OTHER',
    priority: 'HIGH',
    description: 'Provide a loving forever home to a dog or cat.',
  },
  {
    id: 'sug-38',
    title: 'Plant 100 trees through local conservation groups',
    category: 'OTHER',
    priority: 'MEDIUM',
    description: 'Volunteer weekend hours to reforest native woodlands.',
  },
  {
    id: 'sug-39',
    title: 'Curate a home library with 200 favorite books',
    category: 'OTHER',
    priority: 'LOW',
    description: 'Build floor-to-ceiling wooden bookshelves and cozy reading nook.',
  },
  {
    id: 'sug-40',
    title: 'Create a 10-year personal time capsule',
    category: 'OTHER',
    priority: 'LOW',
    description: 'Fill a waterproof chest with photos, letters, and seal until 2036.',
  },
];
