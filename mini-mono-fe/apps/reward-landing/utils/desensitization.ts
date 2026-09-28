export const desensitization = (str: string) => {
  if (str?.includes('***')) {
    return str;
  }

  if (!str || str?.length <= 1) {
    if (str !== '-') {
      return str;
    } else {
      return '*';
    }
  }

  if (str?.length === 2) {
    return `${str?.[0]}*`;
  }

  if (str?.length === 3) {
    return `${str?.[0]}**`;
  }

  if (str?.length === 4) {
    return `${str?.[0]}**${str?.[3]}`;
  }

  if (str?.length === 5) {
    return `${str?.[0]}***${str?.[4]}`;
  }

  if (str?.length === 6) {
    return `${str?.[0]}${str?.[1]}***${str?.[5]}`;
  }

  if (str?.length >= 7) {
    return `${str?.[0]}${str?.[1]}***${str?.[5]}${str?.[6]}`;
  }

  return str;
};
