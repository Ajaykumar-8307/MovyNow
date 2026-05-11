import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');
hydrateEnvFromFile(resolve(process.cwd(), '.env'));
const TMDB_BASE_URL = process.env['TMDB_BASE_URL'] || 'https://api.themoviedb.org/3';

type RequestParams = Record<string, string | number | boolean | undefined | null>;
type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

interface StreamLookupResponse {
  streamUrl: string | null;
  embedUrl: string | null;
  sourceName: string;
  quality: string | null;
  subtitles: Array<{ label: string; url: string }>;
  raw: JsonValue | null;
}

const app = express();
const angularApp = new AngularNodeAppEngine();

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/movies/trending', async (_req, res) => {
  await handleTmdbRequest(res, '/trending/movie/week');
});

app.get('/api/movies/popular', async (_req, res) => {
  await handleTmdbRequest(res, '/discover/movie', {
    sort_by: 'popularity.desc',
    include_adult: false,
    include_video: false,
    page: 1,
  });
});

app.get('/api/movies/top-rated', async (_req, res) => {
  await handleTmdbRequest(res, '/discover/movie', {
    sort_by: 'vote_average.desc',
    include_adult: false,
    include_video: false,
    page: 1,
    'vote_count.gte': 500,
  });
});

app.get('/api/movies/now-playing', async (_req, res) => {
  await handleTmdbRequest(res, '/movie/now_playing', { region: 'IN' });
});

app.get('/api/movies/indian', async (_req, res) => {
  await handleTmdbRequest(res, '/discover/movie', {
    sort_by: 'popularity.desc',
    region: 'IN',
    with_origin_country: 'IN',
    include_adult: false,
    include_video: false,
    page: 1,
  });
});

app.get('/api/movies/genre/:genreId', async (req, res) => {
  await handleTmdbRequest(res, '/discover/movie', {
    sort_by: 'popularity.desc',
    with_genres: req.params['genreId'] ?? '',
    include_adult: false,
    include_video: false,
    page: 1,
  });
});

app.get('/api/movies/search', async (req, res) => {
  const query = String(req.query['q'] ?? '').trim();

  if (!query) {
    res.json({
      page: 1,
      results: [],
      total_pages: 0,
      total_results: 0,
    });
    return;
  }

  await handleTmdbRequest(res, '/search/movie', {
    query,
    include_adult: false,
  });
});

app.get('/api/movies/:id', async (req, res) => {
  const id = req.params['id'];

  if (!id) {
    res.status(400).json({ message: 'movie id is required' });
    return;
  }

  await handleTmdbRequest(res, `/movie/${id}`, {
    append_to_response: 'videos,credits,recommendations',
  });
});

app.get('/api/movies/by-imdb/:imdbId', async (req, res) => {
  const imdbId = req.params['imdbId'];
  if (!imdbId) {
    res.status(400).json({ message: 'imdb id is required' });
    return;
  }

  try {
    const tmdbId = await getTmdbMovieIdByImdb(imdbId);
    if (!tmdbId) {
      res.status(404).json({ message: 'No TMDB movie mapped for imdb id' });
      return;
    }

    const details = await tmdbRequest<JsonValue>(`/movie/${tmdbId}`, {
      append_to_response: 'videos,credits,recommendations',
    });
    res.json(details);
  } catch (error) {
    res.status(502).json({
      message: 'Failed to resolve movie details by imdb id',
      details: error instanceof Error ? error.message : 'unknown error',
    });
  }
});

app.get('/api/stream/:id', async (req, res) => {
  const id = req.params['id'];

  if (!id) {
    res.status(400).json({ message: 'movie id is required' });
    return;
  }

  const vidApiBaseUrl = process.env['VIDAPI_BASE_URL'];
  const vidApiKey = process.env['VIDAPI_KEY'];

  if (!vidApiBaseUrl) {
    res.status(503).json({ message: 'VIDAPI_BASE_URL is missing on server' });
    return;
  }

  try {
    const details = await tmdbRequest<{ imdb_id?: string | null }>(`/movie/${id}`);
    const imdbId = details.imdb_id ?? '';
    const embedTemplate = process.env['VIDAPI_EMBED_TEMPLATE'];

    if (embedTemplate && imdbId) {
      res.json({
        streamUrl: null,
        embedUrl: embedTemplate.replace('{imdbId}', imdbId),
        sourceName: 'VidAPI',
        quality: null,
        subtitles: [],
        raw: null,
      } satisfies StreamLookupResponse);
      return;
    }

    if (vidApiBaseUrl.includes('/embed/movie') && imdbId) {
      res.json({
        streamUrl: null,
        embedUrl: `${vidApiBaseUrl.replace(/\/$/, '')}/${imdbId}`,
        sourceName: 'VidAPI',
        quality: null,
        subtitles: [],
        raw: null,
      } satisfies StreamLookupResponse);
      return;
    }

    const normalized = await fetchVidApiStream(vidApiBaseUrl, {
      apiKey: vidApiKey,
      tmdbId: String(id),
      imdbId,
      type: 'movie',
    });
    res.json(normalized);
  } catch (error) {
    res.status(502).json({
      message: 'Failed to resolve stream source',
      details: error instanceof Error ? error.message : 'unknown error',
    });
  }
});

app.get('/api/stream/by-imdb/:imdbId', async (req, res) => {
  const imdbId = req.params['imdbId'];
  if (!imdbId) {
    res.status(400).json({ message: 'imdb id is required' });
    return;
  }

  const vidApiBaseUrl = process.env['VIDAPI_BASE_URL'];
  const vidApiKey = process.env['VIDAPI_KEY'];
  const embedTemplate = process.env['VIDAPI_EMBED_TEMPLATE'];

  if (!vidApiBaseUrl && !embedTemplate) {
    res.status(503).json({ message: 'VIDAPI_BASE_URL or VIDAPI_EMBED_TEMPLATE is missing on server' });
    return;
  }

  try {
    if (embedTemplate) {
      res.json({
        streamUrl: null,
        embedUrl: embedTemplate.replace('{imdbId}', imdbId),
        sourceName: 'VidAPI',
        quality: null,
        subtitles: [],
        raw: null,
      } satisfies StreamLookupResponse);
      return;
    }

    if (vidApiBaseUrl && vidApiBaseUrl.includes('/embed/movie')) {
      res.json({
        streamUrl: null,
        embedUrl: `${vidApiBaseUrl.replace(/\/$/, '')}/${imdbId}`,
        sourceName: 'VidAPI',
        quality: null,
        subtitles: [],
        raw: null,
      } satisfies StreamLookupResponse);
      return;
    }

    const normalized = await fetchVidApiStream(vidApiBaseUrl ?? '', {
      apiKey: vidApiKey,
      tmdbId: '',
      imdbId,
      type: 'movie',
    });
    res.json(normalized);
  } catch (error) {
    res.status(502).json({
      message: 'Failed to resolve stream source by imdb id',
      details: error instanceof Error ? error.message : 'unknown error',
    });
  }
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);

async function handleTmdbRequest(
  res: express.Response,
  path: string,
  params: RequestParams = {},
): Promise<void> {
  try {
    const payload = await tmdbRequest<JsonValue>(path, params);
    res.json(payload);
  } catch (error) {
    res.status(502).json({
      message: 'TMDB request failed',
      details: error instanceof Error ? error.message : 'unknown error',
    });
  }
}

async function tmdbRequest<T>(path: string, params: RequestParams = {}): Promise<T> {
  const apiKey = process.env['TMDB_API_KEY'];

  if (!apiKey) {
    throw new Error('TMDB_API_KEY is missing on server');
  }

  const url = buildUrl(`${TMDB_BASE_URL}${path}`, {
    api_key: apiKey,
    language: 'en-US',
    ...params,
  });

  return fetchJson<T>(url);
}

function buildUrl(baseUrl: string, params: RequestParams = {}): string {
  const url = new URL(baseUrl);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
}

async function fetchJson<T>(url: string, init: RequestInit = {}): Promise<T> {
  const timeoutMs = Number(process.env['API_TIMEOUT_MS'] ?? 8000);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        accept: 'application/json',
        ...(init.headers ?? {}),
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} from ${url}`);
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchVidApiStream(
  baseUrl: string,
  options: {
    apiKey?: string;
    tmdbId: string;
    imdbId?: string;
    type: string;
  },
): Promise<StreamLookupResponse> {
  const url = buildUrl(baseUrl, {
    tmdbId: options.tmdbId,
    imdbId: options.imdbId,
    type: options.type,
    apiKey: options.apiKey,
  });
  const raw = await fetchJson<JsonValue>(url);
  return normalizeVidApiPayload(raw);
}

function normalizeVidApiPayload(payload: JsonValue): StreamLookupResponse {
  const obj = isRecord(payload) ? payload : {};
  const streamUrl = findUrlValue(obj, ['streamUrl', 'url', 'playUrl', 'file']);
  const embedUrl = findUrlValue(obj, ['embedUrl', 'iframeUrl', 'playerUrl']);
  const quality = findStringValue(obj, ['quality', 'resolution']);
  const sourceName = findStringValue(obj, ['provider', 'source', 'name']) ?? 'VidAPI';
  const subtitles = normalizeSubtitles(obj['subtitles']);

  if (!streamUrl && !embedUrl) {
    throw new Error('VidAPI response does not include a playable URL');
  }

  return {
    streamUrl,
    embedUrl,
    sourceName,
    quality,
    subtitles,
    raw: payload,
  };
}

function normalizeSubtitles(value: JsonValue | undefined): Array<{ label: string; url: string }> {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => {
      if (!isRecord(entry)) {
        return null;
      }

      const label = String(entry['label'] ?? entry['lang'] ?? 'Subtitles');
      const url = String(entry['url'] ?? entry['file'] ?? '');
      return url ? { label, url } : null;
    })
    .filter((item): item is { label: string; url: string } => item !== null);
}

function findUrlValue(source: Record<string, JsonValue>, keys: string[]): string | null {
  for (const key of keys) {
    const direct = toHttpUrl(source[key]);
    if (direct) {
      return direct;
    }
  }

  const nested = ['data', 'result', 'stream', 'source', 'sources']
    .map((key) => source[key])
    .find((value) => value !== undefined);

  if (Array.isArray(nested)) {
    for (const entry of nested) {
      if (isRecord(entry)) {
        const url = toHttpUrl(entry['url'] ?? entry['file'] ?? entry['src']);
        if (url) {
          return url;
        }
      }
    }
  } else if (isRecord(nested)) {
    return (
      findUrlValue(nested, keys) ?? toHttpUrl(nested['url'] ?? nested['file'] ?? nested['src'])
    );
  }

  return null;
}

function findStringValue(source: Record<string, JsonValue>, keys: string[]): string | null {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'string' && value.trim()) {
      return value;
    }
  }

  return null;
}

function toHttpUrl(value: JsonValue | undefined): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return /^https?:\/\//.test(trimmed) ? trimmed : null;
}

function isRecord(value: JsonValue | undefined): value is Record<string, JsonValue> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

async function getTmdbMovieIdByImdb(imdbId: string): Promise<number | null> {
  const response = await tmdbRequest<{
    movie_results?: Array<{ id?: number }>;
  }>(`/find/${imdbId}`, {
    external_source: 'imdb_id',
  });

  const movieId = response.movie_results?.[0]?.id;
  return typeof movieId === 'number' ? movieId : null;
}

function hydrateEnvFromFile(path: string): void {
  if (!existsSync(path)) {
    return;
  }

  const lines = readFileSync(path, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, '');
    if (key && !process.env[key]) {
      process.env[key] = value;
    }
  }
}
