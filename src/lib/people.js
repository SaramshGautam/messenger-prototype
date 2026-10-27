// Look up a person by full name ("Anna Morgan") or first name ("Anna").
export function findPerson(people, nameOrFirst) {
  if (!nameOrFirst) return undefined;
  return (
    people.find((p) => p.name === nameOrFirst) ??
    people.find((p) => p.firstName === nameOrFirst)
  );
}

export function initialsFor(name = "") {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}
