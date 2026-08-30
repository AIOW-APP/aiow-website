export function buildMailProviderOptions(env = process.env) {
  const production = env.NODE_ENV === "production" || env.VERCEL_ENV === "production";
  if (production && env.AIOW_MAIL_PROVIDER_TEST_MODE === "1") throw new Error("mail provider test mode forbidden in production");
  if (production && (env.AIOW_MICROSOFT_TOKEN_URL || env.AIOW_MICROSOFT_GRAPH_SEND_URL)) throw new Error("mail provider URL overrides forbidden in production");
  const target = { gateId:"mail_provider_production_v1", environment:"production", provider:"microsoft_graph", tenantId:env.AIOW_MICROSOFT_TENANT_ID, applicationId:env.AIOW_MICROSOFT_APPLICATION_ID, mailbox:env.AIOW_MICROSOFT_MAILBOX, sender:env.AIOW_MICROSOFT_SENDER, controlMailbox:env.AIOW_MICROSOFT_CONTROL_MAILBOX, runtimeCapability:"mail_send", fallbackProvider:null };
  const options = { clientSecret:env.AIOW_MICROSOFT_CLIENT_SECRET, target };
  if (env.AIOW_MAIL_PROVIDER_TEST_MODE === "1") {
    const tokenUrl = env.AIOW_MICROSOFT_TOKEN_URL; const graphUrl = env.AIOW_MICROSOFT_GRAPH_SEND_URL;
    for (const value of [tokenUrl, graphUrl]) if (value) {
      const url = new URL(value);
      if (url.protocol !== "http:" || url.username || url.password || url.hash || !["127.0.0.1", "localhost", "::1"].includes(url.hostname)) throw new Error("invalid provider mock URL");
    }
    if (tokenUrl) options.tokenUrl = tokenUrl;
    if (graphUrl) options.graphUrl = graphUrl;
  }
  return options;
}
