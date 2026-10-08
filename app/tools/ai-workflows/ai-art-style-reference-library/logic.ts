/**
 * AI Art Style Reference Library — pure logic.
 *
 * WHAT IT HONESTLY DOES:
 * A fixed reference library of art styles with human-written descriptions
 * and human-written example prompt snippets. Pick a style from the select
 * list and get its card: description, an example snippet you can copy into
 * an image generator, a tag list, and sample keywords.
 *
 * This is a curated reference — nothing is generated, ranked, or scored by AI.
 * Styles, descriptions, and snippets are static data in this file.
 *
 * FIXED DATA (documented):
 * - ART_STYLES: 20 styles. Each style has exactly: name, description,
 *   exampleSnippet (8–16 words), tags (≥2), sampleKeywords (≥3).
 *
 * Deterministic: same style -> identical card, always.
 * Zero imports, zero DOM, zero network, zero Math.random.
 */

export interface ArtStyleCard {
  name: string;
  description: string;
  exampleSnippet: string;
  tags: string[];
  sampleKeywords: string[];
}

export const ART_STYLES: ReadonlyArray<ArtStyleCard> = [
  {
    name: "Cyberpunk",
    description: "Neon-drenched futuristic scenes with rain, holograms, and high-contrast city glow.",
    exampleSnippet: "rainy neon-lit Tokyo street at night, holographic signs, cinematic lighting, ultra detailed",
    tags: ["futuristic", "neon", "urban"],
    sampleKeywords: ["neon", "hologram", "night city", "futuristic"],
  },
  {
    name: "Photorealistic",
    description: "Images that mimic real photography with natural light, depth, and true-to-life detail.",
    exampleSnippet: "portrait of an elderly fisherman at dawn, 85mm lens, shallow depth of field, natural light",
    tags: ["photography", "realistic", "portrait"],
    sampleKeywords: ["photograph", "85mm", "natural light", "realistic"],
  },
  {
    name: "Watercolor",
    description: "Soft washes of translucent color with gentle edges, like traditional watercolor painting.",
    exampleSnippet: "misty mountain lake at sunrise, soft watercolor washes, gentle brush strokes, calm palette",
    tags: ["painting", "soft", "traditional"],
    sampleKeywords: ["watercolor", "wash", "soft edges", "painting"],
  },
  {
    name: "Oil Painting",
    description: "Rich, textured strokes with dramatic light and shadow in classic oil-paint style.",
    exampleSnippet: "still life of sunflowers in a clay vase, thick impasto oil paint, dramatic chiaroscuro lighting",
    tags: ["painting", "classic", "textured"],
    sampleKeywords: ["oil painting", "impasto", "canvas texture", "chiaroscuro"],
  },
  {
    name: "Anime",
    description: "Japanese animation style with expressive characters, clean lines, and vibrant color.",
    exampleSnippet: "anime girl with headphones on a rooftop at sunset, cel shading, vibrant sky, detailed background",
    tags: ["animation", "character", "vibrant"],
    sampleKeywords: ["anime", "cel shaded", "manga", "studio quality"],
  },
  {
    name: "Pixel Art",
    description: "Retro blocky graphics built from visible pixels, inspired by classic video games.",
    exampleSnippet: "cozy forest cabin at dusk, 16-bit pixel art, warm window glow, limited color palette",
    tags: ["retro", "game", "digital"],
    sampleKeywords: ["pixel art", "16-bit", "retro game", "sprite"],
  },
  {
    name: "3D Render",
    description: "Smooth computer-generated 3D scenes with soft studio lighting and clean geometry.",
    exampleSnippet: "minimal 3D product shot of a sneaker on a podium, soft studio lighting, octane render",
    tags: ["3d", "product", "clean"],
    sampleKeywords: ["3d render", "octane", "studio lighting", "blender"],
  },
  {
    name: "Low Poly",
    description: "Geometric faceted shapes forming landscapes and objects with a modern minimal feel.",
    exampleSnippet: "low poly desert landscape with cactus and hot air balloon, pastel colors, geometric facets",
    tags: ["3d", "geometric", "minimal"],
    sampleKeywords: ["low poly", "faceted", "geometric", "pastel"],
  },
  {
    name: "Line Art",
    description: "Elegant single-weight outlines with minimal or no fill — clean and graphic.",
    exampleSnippet: "continuous line drawing of a dancer in motion, black ink on white paper, minimalist",
    tags: ["drawing", "minimal", "graphic"],
    sampleKeywords: ["line art", "continuous line", "ink drawing", "outline"],
  },
  {
    name: "Pop Art",
    description: "Bold Warhol-inspired graphics with flat bright colors and halftone dot patterns.",
    exampleSnippet: "pop art portrait of a woman with sunglasses, bold flat colors, halftone dots, comic style",
    tags: ["bold", "retro", "graphic"],
    sampleKeywords: ["pop art", "halftone", "warhol", "comic"],
  },
  {
    name: "Steampunk",
    description: "Victorian-era machinery mixed with brass, gears, and steam-powered invention.",
    exampleSnippet: "steampunk airship over london rooftops, brass gears, steam clouds, victorian details, cinematic",
    tags: ["fantasy", "vintage", "machinery"],
    sampleKeywords: ["steampunk", "brass", "gears", "victorian"],
  },
  {
    name: "Vaporwave",
    description: "Nostalgic 80s-90s aesthetic: chrome, sunsets, grid floors, and pastel glitch.",
    exampleSnippet: "vaporwave sunset over a chrome ocean, retro grid floor, palm silhouettes, pink and cyan",
    tags: ["retro", "aesthetic", "surreal"],
    sampleKeywords: ["vaporwave", "aesthetic", "retro wave", "glitch"],
  },
  {
    name: "Dark Fantasy",
    description: "Moody, gothic fantasy worlds with dramatic lighting and epic scale.",
    exampleSnippet: "dark fantasy castle on a cliff in a storm, glowing windows, dramatic clouds, epic scale",
    tags: ["fantasy", "dark", "epic"],
    sampleKeywords: ["dark fantasy", "gothic", "epic", "moody"],
  },
  {
    name: "Minimalist",
    description: "Stripped-back compositions with lots of negative space and one clear subject.",
    exampleSnippet: "single red umbrella on an empty white beach, minimalist composition, generous negative space",
    tags: ["minimal", "clean", "modern"],
    sampleKeywords: ["minimalist", "negative space", "simple", "clean"],
  },
  {
    name: "Flat Vector",
    description: "Crisp flat-color illustrations with simple shapes — the look of modern app graphics.",
    exampleSnippet: "flat vector illustration of a freelancer working at a laptop, warm color palette, no gradients",
    tags: ["illustration", "flat", "modern"],
    sampleKeywords: ["flat design", "vector", "illustration", "no gradients"],
  },
  {
    name: "Isometric",
    description: "Tiny 3D diorama scenes viewed at a fixed angle, popular for tech and game art.",
    exampleSnippet: "isometric tiny coffee shop diorama, cute 3D details, pastel palette, soft shadows",
    tags: ["3d", "diorama", "cute"],
    sampleKeywords: ["isometric", "diorama", "tiny world", "tilt shift"],
  },
  {
    name: "Double Exposure",
    description: "Two images blended into one silhouette — usually a portrait filled with a landscape.",
    exampleSnippet: "double exposure portrait of a woman merged with a forest at dawn, monochrome, ethereal",
    tags: ["photography", "surreal", "portrait"],
    sampleKeywords: ["double exposure", "silhouette", "blended", "ethereal"],
  },
  {
    name: "Charcoal Sketch",
    description: "Raw, expressive black-and-white drawing with visible smudges and gestural strokes.",
    exampleSnippet: "charcoal sketch of a horse mid-gallop, expressive strokes, smudged shading, dramatic contrast",
    tags: ["drawing", "monochrome", "expressive"],
    sampleKeywords: ["charcoal", "sketch", "gestural", "monochrome"],
  },
  {
    name: "Claymation",
    description: "Handmade stop-motion look with soft clay textures and chunky rounded forms.",
    exampleSnippet: "claymation robot watering clay flowers, handmade texture, fingerprints visible, warm light",
    tags: ["3d", "handmade", "cute"],
    sampleKeywords: ["claymation", "clay render", "stop motion", "handmade"],
  },
  {
    name: "Neon Noir",
    description: "Dark detective-movie mood with single neon accents cutting through black shadows.",
    exampleSnippet: "neon noir alley at midnight, lone figure under a red neon sign, deep shadows, film grain",
    tags: ["dark", "neon", "cinematic"],
    sampleKeywords: ["neon noir", "film grain", "cinematic", "midnight"],
  },
];

/** Find a style by exact name (case-sensitive against the option list). */
export function findStyle(name: unknown): ArtStyleCard | undefined {
  if (typeof name !== "string") return undefined;
  return ART_STYLES.find((s) => s.name === name);
}

export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const style = findStyle(values["style"]);
  if (!style) {
    return { ok: false, error: "Please choose an art style from the list." };
  }
  return {
    ok: true,
    values: {
      styleName: style.name,
      description: style.description,
      exampleSnippet: style.exampleSnippet,
      tags: [...style.tags],
      sampleKeywords: [...style.sampleKeywords],
    },
  };
}
