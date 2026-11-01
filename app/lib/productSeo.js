const MODEL_TOKEN_RE = /\b(?=[A-Z0-9-]*\d)[A-Z]{1,8}[A-Z0-9-]{2,14}\b/gi;
const MAX_IMPORTANT_MODELS = 8;
const BRAND_LOGO_PATH = 'statewide_appliance_spares_logo';

function uniquePreserveOrder(values = []) {
  const seen = new Set();
  const unique = [];

  values.forEach((value) => {
    const normalized = String(value || '')
      .trim()
      .toUpperCase();
    if (!normalized || seen.has(normalized)) return;
    seen.add(normalized);
    unique.push(String(value).trim());
  });

  return unique;
}

function compactText(value = '') {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function normalizeForTokens(value = '') {
  return String(value)
    .replace(/[/_\-(),.]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function textIncludesModel(text, model) {
  if (!text || !model) return false;
  const compactModel = compactText(model);
  if (compactModel.length < 3) return false;
  return compactText(text).includes(compactModel);
}

export function parseProductModels(value) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return uniquePreserveOrder(value.map((item) => String(item || '').trim()));
  }

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return uniquePreserveOrder(
        parsed.map((item) => String(item || '').trim()),
      );
    }
  } catch {
    // Fall through to delimiter parsing.
  }

  return uniquePreserveOrder(
    String(value)
      .split(/[,;|]/)
      .map((item) => item.trim()),
  );
}

export function extractModelTokens(value = '') {
  const matches = normalizeForTokens(value).match(MODEL_TOKEN_RE) || [];
  return uniquePreserveOrder(matches.map((token) => token.toUpperCase()));
}

export function getProductSku({product, selectedVariant} = {}) {
  return (
    selectedVariant?.sku ||
    product?.selectedVariant?.sku ||
    product?.variants?.nodes?.[0]?.sku ||
    ''
  );
}

const SMALL_TITLE_WORDS = new Set([
  'and',
  'or',
  'of',
  'for',
  'the',
  'a',
  'an',
  'to',
  'with',
  'in',
  'on',
  'at',
  'by',
]);

/** Short brand / part acronyms that should stay uppercase. */
const KEEP_UPPER_TOKENS = new Set([
  'aeg',
  'lg',
  'ixl',
  'iag',
  'nec',
  'neff',
  'smeg',
  'arc',
  'elba',
  'pcb',
  'led',
  'lcd',
  'usb',
  'ac',
  'dc',
  'tv',
  'bbq',
  'lpg',
  'oem',
  'abs',
  'epdm',
  'ntc',
  'wifi',
]);

function escapeRegExp(value = '') {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function titleCaseWord(word = '') {
  if (!word) return word;
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

function buildProtectedTitleTokens({vendor, sku} = {}) {
  const protectedTokens = new Map();

  KEEP_UPPER_TOKENS.forEach((token) => {
    protectedTokens.set(token, token.toUpperCase());
  });

  if (sku) {
    protectedTokens.set(compactText(sku), String(sku).trim());
  }

  String(vendor || '')
    .split(/\s*[&/,]\s*/)
    .forEach((part) => {
      const token = String(part || '').trim();
      if (!token || /^n\/?a$/i.test(token)) return;
      const compact = compactText(token);
      if (!compact) return;
      const letters = token.replace(/[^A-Za-z]/g, '');
      const display =
        letters.length > 0 && letters.length <= 4
          ? token.toUpperCase()
          : token
              .split(/\s+/)
              .filter(Boolean)
              .map((word) => titleCaseWord(word))
              .join(' ');
      protectedTokens.set(compact, display);
    });

  return protectedTokens;
}

function formatTitlePiece(piece, {isFirst, protectedTokens} = {}) {
  if (!piece) return piece;
  if (piece === '&') return '&';

  const compact = compactText(piece);
  if (compact && protectedTokens?.has(compact)) {
    return protectedTokens.get(compact);
  }

  if (/\d/.test(piece)) {
    return piece.toUpperCase();
  }

  const lower = piece.toLowerCase();
  if (!isFirst && SMALL_TITLE_WORDS.has(lower)) {
    return lower;
  }

  return titleCaseWord(piece);
}

/**
 * Title Case for PDP / schema titles. Keeps brand acronyms (AEG, LG),
 * model/SKU tokens (PS216SB), and does not shout regular words.
 */
export function formatProductTitleCase(title = '', {vendor, sku} = {}) {
  const value = String(title || '').trim();
  if (!value) return value;

  const protectedTokens = buildProtectedTitleTokens({vendor, sku});
  let isFirstWord = true;

  return value
    .split(/(\s+)/)
    .map((chunk) => {
      if (/^\s+$/.test(chunk)) return chunk;

      const formatted = chunk
        .split(/([-/])/)
        .map((part) => {
          if (part === '-' || part === '/') return part;
          const next = formatTitlePiece(part, {
            isFirst: isFirstWord,
            protectedTokens,
          });
          if (part.trim()) isFirstWord = false;
          return next;
        })
        .join('');

      return formatted;
    })
    .join('');
}

export function getCleanedProductTitle(title = '', {vendor, sku} = {}) {
  const stripped =
    String(title)
      .replace(/\s*-?\s*was\b.*$/i, '')
      .trim() || title;
  return formatProductTitleCase(stripped, {vendor, sku});
}

export function getImportantModelNumbers({product, selectedVariant} = {}) {
  const sku = getProductSku({product, selectedVariant});
  const title = getCleanedProductTitle(product?.title, {
    vendor: product?.vendor,
    sku,
  });
  const handle = product?.handle || '';
  const metafieldModels = parseProductModels(product?.models?.value);
  const titleModels = extractModelTokens(title);
  const handleHaystack = compactText(handle);

  const fromHandle = metafieldModels.filter((model) => {
    const compactModel = compactText(model);
    return compactModel.length >= 4 && handleHaystack.includes(compactModel);
  });
  const fromTitle = [
    ...metafieldModels.filter((model) => textIncludesModel(title, model)),
    ...titleModels,
  ];

  return uniquePreserveOrder([...fromHandle, ...fromTitle])
    .filter((model) => compactText(model) !== compactText(sku))
    .slice(0, MAX_IMPORTANT_MODELS);
}

export function getProductSeoName({product, selectedVariant, models} = {}) {
  const sku = getProductSku({product, selectedVariant});
  const title = getCleanedProductTitle(product?.title, {
    vendor: product?.vendor,
    sku,
  });
  const importantModels =
    models || getImportantModelNumbers({product, selectedVariant});
  const extraModels = importantModels.filter(
    (model) => !textIncludesModel(title, model),
  );

  return uniquePreserveOrder([sku, title, ...extraModels])
    .join(' ')
    .trim();
}

export function getProductSeoDescription({
  product,
  selectedVariant,
  models,
} = {}) {
  const sku = getProductSku({product, selectedVariant});
  const importantModels =
    models || getImportantModelNumbers({product, selectedVariant});
  const rawTitle = String(product?.title || '').trim();
  const cleanedTitle = getCleanedProductTitle(rawTitle, {
    vendor: product?.vendor,
    sku,
  });
  let base = String(
    product?.seo?.description || product?.description || '',
  ).trim();
  if (rawTitle && cleanedTitle && rawTitle !== cleanedTitle) {
    const rawCore = rawTitle.replace(/\s*-?\s*genuine\s*$/i, '').trim();
    const cleanedCore = cleanedTitle.replace(/\s*-?\s*Genuine\s*$/i, '').trim();
    if (rawTitle.length > 3) {
      base = base.replace(new RegExp(escapeRegExp(rawTitle), 'gi'), cleanedTitle);
    }
    if (rawCore.length > 6 && rawCore !== rawTitle) {
      base = base.replace(new RegExp(escapeRegExp(rawCore), 'gi'), cleanedCore);
    }
  }
  const prefixParts = [
    sku && `SKU ${sku}`,
    importantModels.length && `Models ${importantModels.join(', ')}`,
  ].filter(Boolean);
  const prefix = prefixParts.join('. ');

  if (!prefix) return base;
  if (!base) return `${prefix}.`;

  const alreadyHasSignals =
    (!sku || textIncludesModel(base, sku)) &&
    importantModels.every((model) => textIncludesModel(base, model));
  if (alreadyHasSignals) return base;

  return `${prefix}. ${base}`;
}

function titleCaseWords(value = '') {
  return String(value)
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => {
      if (/\d/.test(word)) return word.toUpperCase();
      if (word.length <= 4 && word === word.toUpperCase()) return word;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

export function getProductImageAlt({product, selectedVariant, models} = {}) {
  const sku = getProductSku({product, selectedVariant});
  const title = getCleanedProductTitle(product?.title, {
    vendor: product?.vendor,
    sku,
  });
  const vendor = String(product?.vendor || '').trim();
  const importantModels =
    models || getImportantModelNumbers({product, selectedVariant});
  const isGenuine = /genuine/i.test(title);
  const skipTokens = uniquePreserveOrder([
    sku,
    vendor,
    'genuine',
    ...importantModels,
    ...extractModelTokens(title),
  ]);
  const descriptive = normalizeForTokens(title)
    .split(/\s+/)
    .filter((word) => {
      const compactWord = compactText(word);
      return (
        compactWord &&
        !skipTokens.some((token) => compactText(token) === compactWord)
      );
    })
    .join(' ');

  return uniquePreserveOrder([
    sku,
    isGenuine ? 'Genuine' : '',
    vendor && !textIncludesModel(descriptive, vendor) ? vendor : '',
    titleCaseWords(descriptive),
    ...importantModels,
    'replacement part',
  ]).join(' ');
}

export function getVisibleProductLead({product, selectedVariant, models} = {}) {
  const sku = getProductSku({product, selectedVariant});
  const vendor = String(product?.vendor || '').trim();
  const importantModels =
    models || getImportantModelNumbers({product, selectedVariant});
  const isGenuine = /genuine/i.test(product?.title || '');
  const usableVendor = vendor && !/^n\/?a$/i.test(vendor);
  const genuineLabel = isGenuine ? ' genuine' : '';
  const brandLabel = usableVendor ? ` ${vendor}` : '';

  if (sku && importantModels.length) {
    return `${sku} is a${genuineLabel}${brandLabel} replacement part for models ${importantModels.join(
      ', ',
    )}.`;
  }
  if (sku) {
    return `${sku} is a${genuineLabel}${brandLabel} replacement part.`;
  }
  if (importantModels.length) {
    return `Fits models ${importantModels.join(', ')}.`;
  }
  return '';
}

export function getImageMimeType(url = '') {
  try {
    const pathname = new URL(url).pathname.toLowerCase();
    if (pathname.endsWith('.png')) return 'image/png';
    if (pathname.endsWith('.gif')) return 'image/gif';
    if (pathname.endsWith('.webp')) return 'image/webp';
    if (pathname.endsWith('.svg')) return 'image/svg+xml';
    if (pathname.endsWith('.jpg') || pathname.endsWith('.jpeg')) {
      return 'image/jpeg';
    }
  } catch {
    const clean = String(url).split('?')[0].toLowerCase();
    if (clean.endsWith('.png')) return 'image/png';
    if (clean.endsWith('.webp')) return 'image/webp';
  }
  return 'image/jpeg';
}

export function isBrandLogoImage(image) {
  const url = image?.url || image?.src || '';
  return Boolean(url) && url.toLowerCase().includes(BRAND_LOGO_PATH);
}
