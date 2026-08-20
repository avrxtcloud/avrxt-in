import { boolean, object, optional, string } from 'valibot';
import { createSubjects } from '@openauthjs/openauth/subject';

export const authSubjects = createSubjects({
  user: object({
    id: string(),
    provider: string(),
    email: optional(string()),
    name: optional(string()),
    avatar: optional(string()),
    admin: boolean(),
  }),
});
