import { faker } from '@faker-js/faker';

export interface User {
  id: string;
  profile: Profile;
}

export interface Profile {
  user_id: string;
  is_anonymous: boolean;
  is_authenticated: boolean;
  is_superuser: boolean;
  is_staff: boolean;
  username: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  avatar?: string;
}

export const defaultProfile: Profile = {
  user_id: generateBrowserBasedId(),
  is_anonymous: true,
  is_authenticated: false,
  is_superuser: false,
  is_staff: false,
  username: faker.internet.userName(),
  email: faker.internet.email(),
  first_name: faker.person.firstName(),
  last_name: faker.person.lastName(),
  full_name: faker.person.fullName(),
  avatar: faker.image.avatar(),
};

function generateBrowserBasedId(): string {
  // Generate new ID if not found in localStorage
  const userAgent = navigator.userAgent; // Browser user agent string
  const platform = navigator.hardwareConcurrency || 'unknown'; // Number of logical processors
  const languages = navigator.languages.join(','); // User's preferred languages
  const screenResolution = `${window.screen.width}x${window.screen.height}`; // Screen resolution (e.g., '1920x1080')
  const deviceMemory = (navigator as any).deviceMemory || 'unknown'; // Device memory in GB (if available)
  const timestamp = Date.now().toString(); // Precise timestamp for uniqueness

  // Combine the components to make the ID more unique across devices
  const idString = `${userAgent}-${platform}-${languages}-${screenResolution}-${deviceMemory}-${timestamp}`;
  return btoa(idString).substring(0, 12); // Encode in base64 and shorten to the first 12 characters
}
