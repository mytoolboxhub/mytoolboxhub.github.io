export interface UrlParts {
  protocol: string;
  host: string;
  path: string;
  query: string;
  fragment: string;
  queryParams: Record<string, string>;
}

export function parseUrlParts(input: string): UrlParts | null {
  try {
    const url = new URL(input);
    const queryParams: Record<string, string> = {};
    
    url.searchParams.forEach((value, key) => {
      queryParams[key] = value;
    });

    return {
      protocol: url.protocol.replace(':', ''),
      host: url.host,
      path: url.pathname,
      query: url.search,
      fragment: url.hash,
      queryParams
    };
  } catch (e) {
    return null; // Not a valid full URL
  }
}
