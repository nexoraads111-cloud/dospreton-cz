/** Client project photos — WebP primary for perf, paths under /photos. */

export const CATEGORIES = [
  { id: 'all', label: 'Vše' },
  { id: 'obklady', label: 'Obklady' },
  { id: 'koupelny', label: 'Koupelny' },
  { id: 'kamen', label: 'Fasády / kámen' },
  { id: 'schody', label: 'Schody' },
]

/** Full gallery — every client photo, with filter categories */
export const gallery = [
  {
    id: 'bath-01',
    title: 'Koupelna — obklady',
    image: '/photos/bath-01-wide.webp',
    category: 'koupelny',
  },
  {
    id: 'bath-02',
    title: 'Koupelna — vchod a vana',
    image: '/photos/bath-02-doorway.webp',
    category: 'koupelny',
  },
  {
    id: 'bath-03',
    title: 'Technická místnost',
    image: '/photos/bath-03-plumbing.webp',
    category: 'koupelny',
  },
  {
    id: 'bath-04',
    title: 'Koupelna — nika',
    image: '/photos/bath-04-niche.webp',
    category: 'koupelny',
  },
  {
    id: 'bath-05',
    title: 'Koupelna — vana a instalace',
    image: '/photos/bath-05-tub-side.webp',
    category: 'koupelny',
  },
  {
    id: 'tiling-01',
    title: 'Schodiště — pohled nahoru',
    image: '/photos/tiling-01-stairs-up.webp',
    category: 'schody',
  },
  {
    id: 'tiling-02',
    title: 'Schodiště — pohled dolů',
    image: '/photos/tiling-02-stairs-down.webp',
    category: 'schody',
  },
  {
    id: 'tiling-03',
    title: 'Chodba a podesty',
    image: '/photos/tiling-03-landing.webp',
    category: 'schody',
  },
  {
    id: 'tiling-04',
    title: 'Chodba — dlažba',
    image: '/photos/tiling-04-hallway.webp',
    category: 'obklady',
  },
  {
    id: 'tiling-05',
    title: 'Balkon — dlažba',
    image: '/photos/tiling-05-yellow-nook.webp',
    category: 'obklady',
  },
  {
    id: 'tiling-06',
    title: 'Schodiště — detail',
    image: '/photos/tiling-06-stairs-tight.webp',
    category: 'schody',
  },
  {
    id: 'tiling-07',
    title: 'Terasa — dlažba',
    image: '/photos/tiling-07-patio.webp',
    category: 'obklady',
  },
  {
    id: 'tiling-08',
    title: 'Kamenný chodník a obklad',
    image: '/photos/tiling-08-stone-walkway.webp',
    category: 'kamen',
  },
  {
    id: 'tiling-09',
    title: 'Kamenný obklad — roh',
    image: '/photos/tiling-09-stone-corner.webp',
    category: 'kamen',
  },
]

export const photos = {
  hero: '/photos/bath-01-wide.webp',
  heroJpg: '/photos/bath-01-hero.jpg',
  about: '/photos/tiling-05-yellow-nook.webp',
  contactBg: '/photos/tiling-09-stone-corner.webp',
  services: {
    tiles: '/photos/tiling-04-hallway.webp',
    bathroom: '/photos/bath-02-doorway.webp',
    facade: '/photos/tiling-09-stone-corner.webp',
    stairs: '/photos/tiling-01-stairs-up.webp',
  },
  realizations: gallery,
}

export function findGalleryIndex(imagePath) {
  const i = gallery.findIndex((g) => g.image === imagePath)
  return i >= 0 ? i : 0
}
