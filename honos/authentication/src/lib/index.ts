export function getFullName(firstName: string, lastName: string) {
  return `${firstName.trim()} ${lastName.trim()}`;
}

export function normalizeEmail(email: string) {
  email = email.trim();
  try {
    const [emailName, domainPart] = rsplit(email, "@", -1);
    return `${emailName}@${domainPart.toLowerCase()}`;
  } catch {
    return email;
  }
}

export function rsplit(value: string, sep: string, maxsplit: number = 0) {
  let split = value.split(sep);

  return maxsplit
    ? [split.slice(0, -maxsplit).join(sep)].concat(split.slice(-maxsplit))
    : split;
}
