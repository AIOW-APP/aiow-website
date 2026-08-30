export type MailProviderOptions = { clientSecret:string|undefined; target:Record<string,unknown>; tokenUrl?:string; graphUrl?:string };
export function buildMailProviderOptions(env?:NodeJS.ProcessEnv): MailProviderOptions;
