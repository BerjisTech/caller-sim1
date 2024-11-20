export interface Language {
  id: string; // Unique identifier
  name: string; // Name of the language
  iso_code: string; // ISO code of the language
  iso_639_1: string; // ISO 639-1 code of the language
  iso_639_2: string; // ISO 639-2 code of the language
  family: string; // Language family
  countries_spoken: string[]; // List of countries where the language is spoken
  tribes: string[]; // Tribes or groups speaking the language
  dialects: Dialect[]; // List of dialects for the language
}

export interface Dialect {
  id: string; // Unique identifier
  name: string; // Name of the dialect
  language_id: string; // Language to which the dialect belongs
}

export interface Term {
  id: string; // Unique identifier
  term: string; // Word or phrase
  definition: string; // Definition of the term
  parts_of_speech: string[]; // Parts of speech for the term
  synonyms: string[]; // List of synonyms for the term
  antonyms: string[]; // List of antonyms for the term
  examples: string[]; // List of examples for the term
  language: Language; // Language of the term
  dialect_id?: string; // Optional dialect
  attachments?: Attachment[]; // List of audio/video attachments
  translations?: Term[]; // List of translations for the term
  created_by: User; // Creator of the term
  creation_date: Date; // Date when the term was added
  is_translation?: boolean; // Indicates if the term is a translation
  is_correction?: boolean; // Indicates if the term is a correction
  translated_term_id?: string; // ID of the translated term
  corrected_term_id?: string; // ID of the corrected term
  comment?: string; // Comment or note for the term if it is a translation or correction
}

export interface Attachment {
  id: string; // Unique identifier
  type: 'audio' | 'video'; // Type of attachment
  url: string; // Link to the attachment
  uploaded_by: User; // User who uploaded the attachment
  for_sale?: boolean; // Indicates if the attachment is for sale
  price?: number; // Price for the attachment
}

export interface Glossary {
  id: string; // Unique identifier
  name: string; // Name of the glossary
  terms: Term[]; // List of terms in the glossary
  created_by: User; // Creator of the glossary
  price_per_word?: number; // Price per word/phrase if for sale
  is_for_sale: boolean; // Indicates if the glossary is for sale
}

export interface User {
  id: string; // Unique identifier
  username: string; // Username of the user
  languages: string[]; // List of languages the user is proficient in
  is_vetted: boolean; // Indicates if the user has been vetted
  interpreter_details?: InterpreterDetails; // Optional details for interpreters
}

export interface InterpreterDetails {
  availability: {
    scheduled: boolean; // Available for scheduled calls
    impromptu: boolean; // Available for impromptu calls
  };
  rates: {
    per_session: number; // Charge per session
  };
}

export interface Forum {
  id: string; // Unique identifier
  title: string; // Title of the forum
  description: string; // Description of the forum topic
  created_by: User; // Creator of the forum
  created_on: Date; // Date the forum was created
  posts: ForumPost[]; // List of posts in the forum
}

export interface ForumPost {
  id: string; // Unique identifier
  forum_id: string; // Forum to which the post belongs
  content: string; // Content of the post
  created_by: User; // Creator of the post
  created_on: Date; // Date of the post
  replies: ForumPost[]; // Replies to the post
  is_term_discussion?: boolean; // Indicates if the post is a term discussion
  is_term_question?: boolean; // Indicates if the post is a term question
  term_id?: string; // ID of the term being discussed
}

export interface BillingModel {
  type: 'direct' | 'subscription'; // Type of billing model
  subscription_tiers?: SubscriptionTier[]; // Optional subscription tiers
}

export interface SubscriptionTier {
  id: string; // Unique identifier
  name: string; // Name of the subscription tier
  price: number; // Price of the subscription
  benefits: string[]; // Benefits of the subscription tier
}

export interface Call {
  id: string; // Unique identifier for the call
  created_by: User; // User who initiated the call (client)
  interpreter: User; // Interpreter assigned to the call
  language_id: string; // Language for which interpretation is needed
  start_time: Date; // Scheduled start time for the call
  end_time?: Date; // Actual end time of the call (optional for in-progress)
  duration?: number; // Duration of the call in minutes
  status: CallStatus; // Current status of the call
  rate: number; // Rate charged for the call (per minute or session)
  billing_model: CallBillingModel; // Billing model (subscription or direct)
  recording?: Attachment; // Optional recording of the call, if available
}

export enum CallStatus {
  Scheduled = 'Scheduled',
  InProgress = 'InProgress',
  Completed = 'Completed',
  Canceled = 'Canceled',
}

export interface CallBillingModel {
  type: 'direct' | 'subscription'; // Indicates if the call is billed directly or through a subscription
  amount: number; // Amount to be charged (direct) or included in the subscription
}
