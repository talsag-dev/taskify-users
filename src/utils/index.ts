import * as bcrypt from 'bcryptjs';

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

export async function comparePasswords(
  plain: string,
  hashed: string,
): Promise<boolean> {
  return await bcrypt.compare(plain, hashed);
}
