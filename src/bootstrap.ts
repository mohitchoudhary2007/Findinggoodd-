/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// This file is used to bootstrap an initial admin user via the console or a script.
// In this app, we will manually check for the user's email in the admin panel if no admin exists,
// or just inform the user how to add themselves.
// However, since the user's email is mohitdudwal123@gmail.com, I will add a temporary check in AdminPanel
// or just provide instructions.
// Better: Add a "First Admin" bypass if the collection is empty.

import { db } from './lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

export async function bootstrapAdmin(uid: string) {
  await setDoc(doc(db, 'admins', uid), {
    email: 'mohitdudwal123@gmail.com',
    role: 'owner'
  });
}
