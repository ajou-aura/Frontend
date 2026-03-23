const sanitizeTopicPart = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize("NFKC")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-_.~%]/g, "-")
    .replace(/-+/g, "-");

export function userTopic(email: string) {
  return `user-${sanitizeTopicPart(email)}`;
}

export function typeTopic(type: string) {
  return `type-${sanitizeTopicPart(type)}`;
}
