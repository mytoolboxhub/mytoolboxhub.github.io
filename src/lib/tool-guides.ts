export interface ToolGuide { purpose: string; steps: string[]; input: string; output: string; explanation: string; limits: string[]; related?: string; }
export const guides: Record<string, ToolGuide> = {
  jsontocsv: {
    purpose: 'Turn an array of API records into spreadsheet rows, combining the fields found across all records.',
    steps: ['Paste an object or array of objects into Input JSON, or drop a JSON file onto that box.', 'Choose comma, tab, or semicolon. Leave Include Headers and Flatten Objects enabled for the example below.', 'The output updates automatically. Copy the result or download the CSV, then select the same delimiter when importing it.'],
    input: '[{"name":"Ana","address":{"city":"Madrid"}},{"name":"Sam","active":true}]', output: 'name,address.city,active\nAna,Madrid,\nSam,,true',
    explanation: 'One record becomes one row. Nested property names become dot-separated columns. A field missing from a record becomes an empty cell; the active column is included even though it only appears in the second record.',
    limits: ['Arrays inside a record remain JSON text in one cell; they do not expand into extra rows.', 'Turn off flattening for keys that contain dots or are empty. Empty objects are preserved as {}. Null and missing values both become blank fields.', 'JavaScript numbers can lose precision above 9,007,199,254,740,991. Keep identifiers as quoted strings. Spreadsheet import can also alter leading zeros and dates.', 'CSV quoting does not prevent spreadsheet formula interpretation. Import untrusted text columns as text. Large files may exhaust browser memory.'], related: 'json-to-spreadsheet'
  },
  jsonformatter: {
    purpose: 'Make JSON readable and check syntax before using a sample in an API request or configuration file.',
    steps: ['Paste JSON into the input box.', 'Choose indentation and whether to sort object keys, then select Format. Select Minify for compact JSON.', 'Read any error, correct the input, and run the action again. Copy or download the output.'],
    input: '{"b":2,"a":1}', output: '{\n  "a": 1,\n  "b": 2\n}', explanation: 'With Sort Keys enabled and two-space indentation, the object keys appear alphabetically. Array element order is preserved.',
    limits: ['JSON does not permit comments, trailing commas, single-quoted strings, or undefined.', 'This is syntax validation, not validation against an API schema. Duplicate object keys are collapsed by JSON parsing.', 'Keep large numeric identifiers in quoted strings; parsing uses JavaScript number precision.'], related:'json-to-spreadsheet'
  },
  base64: {
    purpose: 'Encode UTF-8 text or a local file as Base64, or decode Base64 back into UTF-8 text.',
    steps: ['Choose Encode or Decode.', 'Enter text, or use the file picker in Encode mode. Enable URL-safe output when required by your destination.', 'Copy or download the result. A decoding error means the input is invalid Base64 or does not contain valid UTF-8 text.'],
    input: 'Hello', output: 'SGVsbG8=', explanation:'Standard Base64 encodes the five UTF-8 bytes in Hello and adds padding. URL-safe encoding removes padding and substitutes two alphabet characters.',
    limits: ['Base64 is reversible encoding, not encryption.', 'The text decoder does not reconstruct arbitrary binary files. File encoding returns Base64 text without a data-URL prefix.', 'Encoding expands file size by roughly one third and keeps the file in browser memory.']
  },
  timestamp: {
    purpose:'Inspect a Unix timestamp in UTC and local time, or convert an ISO date to seconds and milliseconds.',
    steps:['Enter a Unix number or ISO 8601 date in the conversion input.','Read the UTC and ISO results separately from the local-time result.','Use an explicit Z or timezone offset in date strings for reproducible conversion.'],
    input:'0',output:'1970-01-01T00:00:00.000Z',explanation:'Zero is the Unix epoch. The local-time display may show a different hour or calendar date because it uses your browser timezone.',
    limits:['Numeric magnitudes greater than 20,000,000,000 are interpreted as milliseconds; smaller magnitudes are interpreted as seconds. Early millisecond dates are therefore ambiguous—use an ISO date instead.','Negative timestamps represent dates before the epoch. Unsupported dates return an error. Relative time changes as time passes.']
  },
  regex: {
    purpose:'Test a JavaScript regular expression against sample text and inspect matching text, positions, and capture groups.',
    steps:['Enter the pattern without surrounding slashes.','Set flags such as g for all matches and i for case-insensitive matching.','Enter test text. Results update automatically; simplify the pattern if processing times out.'],
    input:'Pattern: \\d+\nFlags: g\nText: A12 B3',output:'12 at index 1\n3 at index 5',explanation:'The + quantifier matches consecutive digits. The global flag returns both matches; without g only the first is returned.',
    limits:['JavaScript regex syntax may differ from Python, PCRE, or database regex engines. Indices count UTF-16 code units.','Results stop at 5,000 matches. A worker is terminated after two seconds so costly backtracking does not freeze the page.']
  },
  colorconverter: {
    purpose:'Translate hex, comma-separated RGB/HSL, and ARGB values for use in code and design specifications.',
    steps:['Enter a supported color value.','Read the generated HEX, RGB, HSL, ARGB, and RGBA representations.','Use RGBA or ARGB when alpha transparency must be retained.'],
    input:'#ff000080',output:'HEX: #ff0000\nRGB: rgb(255, 0, 0)\nARGB: 0x80ff0000\nRGBA: rgba(255, 0, 0, 0.5)',explanation:'CSS eight-digit hex puts alpha last, while the 0x ARGB form puts alpha first. The six-digit HEX and RGB outputs intentionally omit transparency.',
    limits:['Supports hex, 0x RGB/ARGB, comma-separated rgb()/rgba(), and integer hsl()/hsla(). Named colors, space-separated CSS syntax, lab(), and color() are not supported.','Channels are clamped to their supported ranges; alpha and HSL output are rounded.']
  },
  htmltomarkdown: {
    purpose:'Extract a Markdown draft from HTML headings, paragraphs, lists, links, and code blocks.',
    steps:['Paste HTML into the input.','Read the Markdown output and check headings, lists, and links.','Copy or download the draft, then inspect it in your intended Markdown renderer.'],
    input:'<h2>Notes</h2><p>Hello <strong>team</strong>.</p>',output:'## Notes\n\n\nHello **team**.',explanation:'The heading becomes a level-two Markdown heading, and strong text becomes a bold span. Blank-line spacing can be normalised by your Markdown editor.',
    limits:['The parser is inert: it does not load images, execute scripts, or visit links from the input. Script and style contents are omitted.','This is a draft converter, not an HTML sanitizer. Tables, complex nested layouts, Markdown punctuation, and unsafe link destinations require review before publishing.']
  },
  yamljson: {
    purpose:'Convert configuration data between YAML 1.2 and JSON with a real YAML parser.',
    steps:['Select YAML to JSON or JSON to YAML.','Paste the source configuration and choose indentation where offered.','Check errors before copying the output; keep a copy of the original comments if you need them.'],
    input:'enabled: true\nlabels: [one, two]',output:'{\n  "enabled": true,\n  "labels": [\n    "one",\n    "two"\n  ]\n}',explanation:'The boolean remains a boolean, and the flow-style YAML sequence becomes a JSON array. The conversion preserves data rather than YAML presentation.',
    limits:['Comments and original YAML formatting are not retained through JSON. Duplicate mapping keys, multiple documents, unsupported tags, non-string mapping keys, and values JSON cannot represent produce errors.','Aliases are expanded with a limit of 100 to restrict expansion attacks. Cycles are rejected. Large numeric values remain subject to JavaScript precision.']
  },
  sqlformat: {
    purpose:'Format SQL for reading while preserving identifiers and quoted data.',
    steps:['Paste a query and choose indentation and keyword capitalisation.','Select Format SQL.','Review the output before copying or downloading; formatting does not execute your query.'],
    input:"select user_id from users where name = 'Ana  Maria';",output:"SELECT\n  user_id\nFROM\n  users\nWHERE\n  name = 'Ana  Maria';",explanation:'With two-space indentation and uppercase keywords, the clauses separate into lines. The underscore in user_id and two spaces inside the quoted string stay intact.',
    limits:['The selected parser is generic SQL. Vendor-specific syntax may be rejected; this interface does not select a database dialect.','Formatting is not a check that a query is safe, efficient, or valid against your schema. Existing semicolons are preserved; the option adds one only if missing.']
  },
  minifier: {
    purpose:'Reduce JavaScript, CSS, or JSON whitespace using syntax-aware parsing.',
    steps:['Select the input language.','Paste code and set comment removal and CSS hex-shortening options.','Run Minify, inspect the result, and test it in the environment where it will be used.'],
    input:'{"name": "Ana", "count": 2}',output:'{"name":"Ana","count":2}',explanation:'JSON mode parses and serialises the data without optional whitespace. JavaScript mode preserves variable names and disables compression transformations.',
    limits:['JavaScript uses Terser; CSS uses CSSTree. TypeScript and JSX must be compiled first.','Preserved CSS comments are collected at the beginning of the output. Keep required licence notices and inspect build-tool directives.','CSS parsing is not full browser compatibility validation. JSON numbers have JavaScript precision limits. Large code inputs can take time to process.']
  },
  jwt: {
    purpose:'Read JWT header and payload claims without uploading the token or pretending to verify its signature.',
    steps:['Paste a three-segment JWT; use a fictional token for testing.','Inspect the decoded header and payload.','Treat the expiry badge only as a comparison between exp and your device clock. Verify signatures, issuer, and audience in your authentication system.'],
    input:'eyJhbGciOiJub25lIn0.eyJzdWIiOiJkZW1vIiwiZXhwIjowfQ.',output:'Header: {"alg":"none"}\nPayload: {"sub":"demo","exp":0}\nExpiry: Expired\nSignature: Not verified',explanation:'This deliberately unsigned sample is readable but is not authenticated. The expiry time zero is at the Unix epoch.',
    limits:['A readable or not-expired token can still be forged, revoked, not yet valid, or intended for another audience. No cryptographic signature verification occurs here.','The header and payload must be JSON objects. An exp claim, when present, must be a finite number.'],related:'inspect-jwt'
  },
  urlparams: {
    purpose:'Inspect URL query parameters and generate a version without recognised campaign identifiers.',
    steps:['Paste an HTTP or HTTPS URL; a missing scheme is assumed to be HTTPS.','Compare the extracted keys and values with the cleaned URL.','Check the destination still works before sharing the cleaned URL.'],
    input:'https://example.com/item?id=7&utm_source=email#details',output:'https://example.com/item?id=7#details',explanation:'The id parameter and fragment remain. The recognised utm_source parameter is removed.',
    limits:['Removing a parameter can change a destination’s behaviour. This is not a guarantee of anonymity or removal of every tracking mechanism.','URL serialisation may change escaping. Values are already decoded once by URLSearchParams; any additional decoded display is informational. Duplicate parameters are retained.']
  },
  cron: {
    purpose:'Explain a five-field cron schedule and preview its next five run times in the browser timezone.',
    steps:['Enter minute, hour, day-of-month, month, and day-of-week fields separated by spaces.','Use numbers, month/day names, *, ranges, comma lists, or steps.','Compare the preview timezone with the timezone used by your actual scheduler.'],
    input:'*/15 * * * *',output:'Every 15 minutes',explanation:'Runs fall on minutes 00, 15, 30, and 45 of each hour. The five displayed dates depend on the current time.',
    limits:['This interface accepts standard five-field expressions, not seconds, Quartz extensions, @aliases, or hashed schedules.','Restricted day-of-month and day-of-week fields use OR matching. Timezones and daylight-saving transitions can change results; this tool does not schedule or execute jobs.']
  },
  passwordgen: {
    purpose:'Generate a random password locally using your browser’s cryptographic random-number API.',
    steps:['Set the length and permitted character groups.','Choose whether to exclude visually similar or ambiguous characters.','Generate and copy a result into your password manager. Use a distinct password for each account.'],
    input:'Length: 20; lowercase, uppercase, numbers, symbols enabled',output:'A fresh 20-character value on each generation',explanation:'There is no fixed expected password. The checkable properties are its length and membership in the selected character set.',
    limits:['Selecting a character group permits its characters; it does not guarantee every selected group appears in a short password. With all groups disabled the tool falls back to lowercase.','Entropy and strength labels are estimates based on the character pool, not proof of security. Clipboard history, browser extensions, and a compromised device can expose a copied password.']
  },
  uuid: {
    purpose:'Generate random version-four UUIDs for test records and application identifiers.',
    steps:['Choose the quantity and output casing/hyphen options.','Generate the list.','Copy or download the identifiers.'],
    input:'Quantity: 1; lowercase; hyphens enabled',output:'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx (y is 8, 9, a, or b)',explanation:'The displayed pattern describes the required structure, not a literal output. Random values change on each run.',
    limits:['Random UUIDs have a very low collision probability, not a mathematical uniqueness guarantee. Use database uniqueness constraints where needed.','These are UUID v4 values, not time-sortable UUID v7 values or authentication secrets.']
  },
  mockdata: {
    purpose:'Create small synthetic datasets with named fields for interface and import testing.',
    steps:['Add fields and choose types, ranges, or custom-list values.','Choose up to 1,000 rows and JSON, CSV, or SQL output.','Generate and inspect the output before importing it into a test environment.'],
    input:'One field: score; Integer; minimum 7; maximum 7; one row; JSON',output:'[\n  {\n    "score": 7\n  }\n]',explanation:'A fixed range makes this example reproducible. Other generated names, dates, and values vary between runs.',
    limits:['Names come from small example lists; data is not statistically representative. Email domains use example.com, example.org, or example.net. Do not contact generated numbers or addresses.','Field names must be unique and ranges valid. SQL export uses MySQL-style backtick identifiers and is a testing draft, not a cross-database import guarantee.']
  },
  urlencode: {
    purpose:'Encode text for a URL component, or decode percent-encoded text.',
    steps:['Select encoding or decoding and the component/full-URL mode.','Paste the text and inspect the output.','Use component mode for a single query value; preserve reserved separators only when handling a full URL.'],
    input:'hello world&x=1',output:'hello%20world%26x%3D1',explanation:'Component encoding protects the ampersand and equals sign so they do not become query separators.',
    limits:['Encoding an already-encoded value encodes its percent signs again. Invalid percent sequences cause a decoding error.','This does not make an arbitrary link trustworthy. Query summaries may show only the last value of a repeated key; use URL Params to inspect repeated parameters.']
  },
  htmlescape: {
    purpose:'Convert HTML-sensitive characters to entities, or decode entities back to text without rendering markup.',
    steps:['Choose Escape or Unescape.','Select extended characters if needed for escaping.','Paste text and copy the output for the intended context.'],
    input:'<b>A & B</b>',output:'&lt;b&gt;A &amp; B&lt;/b&gt;',explanation:'In Escape mode the angle brackets and ampersand become entities. In Unescape mode the reverse operation returns literal markup as text.',
    limits:['Unescaping does not sanitize HTML. Never insert untrusted decoded output into a page as executable markup.','Escaping applies once, including to existing ampersands. Extended escaping covers a common subset; decoding uses the HTML entity set. JavaScript, CSS, and URL contexts need different escaping rules.']
  },
  wordcounter: {
    purpose:'Count text units and estimate reading time while editing a draft.',
    steps:['Type or paste text.','Read word, character, sentence, and paragraph totals.','Use the keyword list as a rough repetition check, not a language analysis score.'],
    input:'Hello world.',output:'2 words; 12 characters; 1 sentence; 1 paragraph',explanation:'Words are separated by whitespace, punctuation ends sentences, and non-empty lines are counted as paragraphs. Reading time assumes 200 words per minute.',
    limits:['Character counts use UTF-16 code units, so some emoji count as two or more. Whitespace-based word counts are unsuitable for some languages.', 'Sentence detection is approximate around abbreviations and decimals. Keywords use an English-oriented filter. No readability grade is calculated.']
  },
  textdiff: {
    purpose:'Compare two text versions and inspect additions, deletions, and unchanged content.',
    steps:['Paste the original and modified text into their labelled boxes.','Choose line, word, or character comparison; set case and whitespace options.','Select Compare and review highlighted changes.'],
    input:'Original: apple\nbanana\n\nModified: apple\npear',output:'1 unchanged line: apple\n1 removed line: banana\n1 added line: pear',explanation:'Line mode treats each line as a unit. Word and character modes provide finer detail and their counts refer to tokens rather than lines.',
    limits:['Ignore Whitespace trims token edges; it does not normalise every internal space. Ignore Case does not alter the displayed source text.','Large comparisons are rejected when the remaining comparison matrix exceeds two million cells. Use line mode or smaller excerpts.'],related:'clean-compare-lists'
  },
  listcleaner: {
    purpose:'Remove duplicate entries and prepare a consistently ordered text list.',
    steps:['Paste one entry per line.','Choose trimming, blank-line removal, deduplication, and sort order.','Check the output before applying optional prefixes, suffixes, or numbering.'],
    input:' apple \nbanana\napple',output:'apple\nbanana',explanation:'With trimming and deduplication enabled, the first and third entries become equal. The first occurrence is retained.',
    limits:['Case-insensitive deduplication can combine distinct identifiers. Keep it disabled for case-sensitive keys.','Numeric sorting extracts numbers from text and is not a locale-aware currency parser. Shuffle is for convenience, not cryptographic randomness.'],related:'clean-compare-lists'
  },
  textcase: {
    purpose:'Convert labels into common writing styles and code-oriented naming formats.',
    steps:['Paste a label or short text.','Compare the generated naming styles.','Copy the specific result you need.'],
    input:'hello world',output:'camelCase: helloWorld\nsnake_case: hello_world\nkebab-case: hello-world',explanation:'The same words are joined with different separators or capitalisation. Original spacing and punctuation may not survive a naming-style conversion.',
    limits:['Programming-case word detection is primarily designed for Latin identifiers and camel-case boundaries. Review acronyms and non-Latin text.','This is text transformation, not translation or a guarantee that the result is a valid identifier in every programming language.']
  },
  stringmanipulator: {
    purpose:'Apply a sequence of line operations to clean, wrap, replace, and join text.',
    steps:['Paste text and enable the required operations.','Set parameters on each enabled operation. Operations run in the displayed order.','Inspect the result before copying; later operations receive the output of earlier operations.'],
    input:' apple \n banana ',output:'apple\nbanana',explanation:'Enable only Trim Lines with both sides selected for this example. Adding a Join Lines operation changes the shape of the output, so order matters.',
    limits:['Regular-expression operations use JavaScript syntax. Processing runs in a worker with a two-second timeout; large expanded outputs are rejected.','Wrapping lines is not SQL or JSON escaping. Embedded quotes and backslashes still need the escaping required by the destination format.'],related:'clean-compare-lists'
  },
  srtcleaner: {
    purpose:'Remove selected subtitle annotations while retaining SRT timing, or extract dialogue as plain text.',
    steps:['Paste SRT with numbered cues and comma-separated millisecond timestamps.','Choose HTML-tag, uppercase speaker-label, bracketed-description, and duplicate-line options.','Select SRT or text output and inspect the result before downloading.'],
    input:'1\n00:00:01,000 --> 00:00:02,000\n<i>Hello</i>',output:'1\n00:00:01,000 --> 00:00:02,000\nHello',explanation:'With Strip HTML enabled and SRT output selected, the italic tags disappear but the cue timing remains.',
    limits:['This is an SRT cleaner, not a transcription service or a WebVTT converter. Unsupported blocks may be omitted; compare the processed cue count with the source.','Removing bracketed text or speaker labels can remove meaningful dialogue. Speaker-label removal targets uppercase labels and >> prefixes.']
  }
};
