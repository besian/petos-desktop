// Breed-matched placeholder photos via the Dog CEO API (dog.ceo) — a free,
// public, no-auth API built for exactly this: random real dog photos,
// optionally filtered by breed. Best-effort breed mapping below; anything
// unmapped (or a breed the API doesn't recognize) falls back to a plain
// random dog photo rather than failing.
const BREED_SLUGS: Record<string, string> = {
  'golden retriever': 'retriever/golden',
  'labrador': 'labrador',
  'labrador retriever': 'labrador',
  'miniature dachshund': 'dachshund',
  'dachshund': 'dachshund',
  'border terrier': 'terrier/border',
  'french bulldog': 'bulldog/french',
  'bulldog': 'bulldog/french',
  'beagle': 'beagle',
  'poodle': 'poodle/standard',
  'toy poodle': 'poodle/toy',
  'miniature poodle': 'poodle/miniature',
  'pug': 'pug',
  'corgi': 'corgi/cardigan',
  'husky': 'husky',
  'siberian husky': 'husky',
  'boxer': 'boxer',
  'chihuahua': 'chihuahua',
  'collie': 'collie/border',
  'border collie': 'collie/border',
  'spaniel': 'spaniel/cocker',
  'cocker spaniel': 'spaniel/cocker',
  'shih tzu': 'shihtzu',
  'terrier': 'terrier',
  'retriever': 'retriever/golden',
  'bulldog/french': 'bulldog/french',
};

function slugFor(breed: string): string | null {
  const key = breed.trim().toLowerCase();
  if (BREED_SLUGS[key]) return BREED_SLUGS[key];
  for (const [name, slug] of Object.entries(BREED_SLUGS)) {
    if (key.includes(name)) return slug;
  }
  return null;
}

interface DogCeoResponse {
  message: string;
  status: string;
}

async function fetchJson(url: string): Promise<DogCeoResponse | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = (await res.json()) as DogCeoResponse;
    return data.status === 'success' ? data : null;
  } catch {
    return null;
  }
}

/** Fetches one photo URL, breed-matched when possible, falling back to a random dog photo. Returns null if the API is unreachable. */
export async function fetchDogPhoto(breed?: string): Promise<string | null> {
  const slug = breed ? slugFor(breed) : null;
  if (slug) {
    const specific = await fetchJson(`https://dog.ceo/api/breed/${slug}/images/random`);
    if (specific) return specific.message;
  }
  const fallback = await fetchJson('https://dog.ceo/api/breeds/image/random');
  return fallback ? fallback.message : null;
}

/** Fetches `count` distinct-ish photos for the same breed hint. */
export async function fetchDogPhotos(count: number, breed?: string): Promise<string[]> {
  const results = await Promise.all(Array.from({ length: count }, () => fetchDogPhoto(breed)));
  return results.filter((u): u is string => !!u);
}
