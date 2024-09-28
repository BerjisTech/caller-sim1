import { faker } from '@faker-js/faker';

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
  user_id: Math.random().toString(36).substring(7),
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
