export interface UrlParam {
  key: string;
  value: string;
  decodedValue: string;
  isTracking: boolean;
}

export interface UrlExtractResult {
  originalUrl: string;
  baseUrl: string;
  hash: string;
  params: UrlParam[];
  cleanUrl: string; // The URL with tracking params removed
  error?: string;
}

// Common tracking parameters used by marketing tools
const TRACKING_PARAMS = new Set([
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'utm_id',
  'gclid',     // Google Ads
  'dclid',     // Google Display Network
  'fbclid',    // Facebook
  'igshid',    // Instagram
  'ttclid',    // TikTok
  'twclid',    // Twitter
  'msclkid',   // Microsoft Ads
  'mc_cid',    // Mailchimp
  'mc_eid',    // Mailchimp
  'oly_enc_id',// Omeda
  'oly_anon_id',
  '_bta_tid',  // Bronto
  '_bta_c',
  'wickedid',  // Wicked Reports
  'cid',       // Generic Campaign ID
  'ref',       // Generic Referrer
  'vgo_ee',    // Vero
  '_ke',       // Klaviyo
  'irclickid', // Impact Radius
]);

export function extractUrlParams(inputStr: string): UrlExtractResult {
  let urlStr = inputStr.trim();
  
  if (!urlStr) {
    return { originalUrl: '', baseUrl: '', hash: '', params: [], cleanUrl: '' };
  }

  // Prepend protocol if missing so the URL API can parse it
  if (!/^https?:\/\//i.test(urlStr)) {
    urlStr = 'https://' + urlStr;
  }

  try {
    const url = new URL(urlStr);
    const params: UrlParam[] = [];
    const searchParams = new URLSearchParams(url.search);
    
    // We want to create a clean URL without tracking params
    const cleanParams = new URLSearchParams();

    searchParams.forEach((value, key) => {
      const isTracking = TRACKING_PARAMS.has(key.toLowerCase());
      
      let decodedValue = value;
      try {
        // Search params are already decoded by URLSearchParams,
        // but double URL-encoded values might need another pass.
        // E.g., %2520 -> %20
        if (value.includes('%')) {
          decodedValue = decodeURIComponent(value);
        }
      } catch (e) {
        // ignore if it fails to decode
      }

      params.push({
        key,
        value,
        decodedValue,
        isTracking
      });

      if (!isTracking) {
        cleanParams.append(key, value);
      }
    });

    // Build the clean URL
    const cleanSearchStr = cleanParams.toString();
    const cleanUrlObj = new URL(url.toString());
    cleanUrlObj.search = cleanSearchStr ? `?${cleanSearchStr}` : '';
    
    return {
      originalUrl: url.toString(),
      baseUrl: `${url.protocol}//${url.host}${url.pathname}`,
      hash: url.hash,
      params,
      cleanUrl: cleanUrlObj.toString()
    };

  } catch (err) {
    return {
      originalUrl: inputStr,
      baseUrl: '',
      hash: '',
      params: [],
      cleanUrl: '',
      error: 'Invalid URL format'
    };
  }
}

export function bulkExtractUrlParams(input: string): UrlExtractResult[] {
  const lines = input.split(/\r?\n/).filter(l => l.trim().length > 0);
  return lines.map(extractUrlParams);
}
