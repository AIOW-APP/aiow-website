export interface MailRunRouteOptions {
  env?: NodeJS.ProcessEnv;
  now?: () => number;
  randomUUID?: () => string;
  configured: (env?: NodeJS.ProcessEnv) => boolean;
  rpc: (name:string,args:Record<string,unknown>) => Promise<unknown>;
  execute: (options:any) => Promise<any>;
  createStore: () => any;
  buildProviderOptions: () => Record<string,unknown>;
}
export function handleMailOutboxRunV1(request:Request,options:MailRunRouteOptions):Promise<Response>;
