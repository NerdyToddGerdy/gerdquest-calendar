# Portrait artwork

Drop an image here named after a character's id to replace its drawn
portrait everywhere in the game (hero cards, hero preview, hero sheet and the
page scene):

    sw_bram.png          → Bram Hollis (The Starwake)
    er_kennelmaster.webp → The Kennelmaster (The Ember Road)

Ids are the `id` of a hero (`src/content/campaigns/*/content.ts`, `heroes.ts`)
or enemy. Accepted: png, jpg, jpeg, webp, avif, svg.

Tips: transparent background, the character standing and facing **right**,
roughly 6:7 (e.g. 600 x 700), feet near the bottom edge. Bosses are mirrored
automatically to face the hero in scenes.

Only add art you have the rights to use (your own, commissioned, or licensed
from the publisher).
