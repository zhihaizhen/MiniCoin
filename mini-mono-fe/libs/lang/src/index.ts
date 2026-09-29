export * from './getTmsMessages';

export type ILocaleMessage = {
  [key: string]: string | ILocaleMessage;
};

// Get processed language messages sync from tms git remote
export async function lang(
  locale: string,
  project: string,
  path?: string
): Promise<ILocaleMessage> {
  if (!locale) return {};
  try {
    const localeModule = await import(`../.sync/${locale}/${project}.json`);
    const localeMessages = localeModule.default;
    if (!localeMessages) return {};
    if (!path) return localeMessages;
    const pathMessages = localeMessages[path];
    return pathMessages;
  } catch (e) {
    console.error('Error:', e);
    return {};
  }
}
