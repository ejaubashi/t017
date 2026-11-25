const asset = (file) => `${import.meta.env.BASE_URL}reference/${file}`;

export const assets = {
  scene: asset("scene.webp"),
  portrait: asset("portrait.webp"),
  portraitDots: asset("portrait-dots.webp"),
  eyes: asset("eyes.webp"),
};

export const projects = [
  {
    id: "firma",
    name: "Firma",
    description: "Law firm",
    category: "Web",
    image: asset("firma.webp"),
  },
  {
    id: "un-kisu",
    name: "Un Kisu",
    description: "Japanese strawberries",
    category: "Web",
    image: asset("west-berry.webp"),
  },
  {
    id: "hotlaser",
    name: "Hotlaser",
    description: "Laser workshop",
    category: "Web",
    image: asset("gifts.webp"),
  },
  {
    id: "rimma",
    name: "Rimma",
    description: "Hair colourist",
    category: "Web",
    image: asset("rimma.webp"),
  },
  {
    id: "liverpool-house",
    name: "Liverpool House",
    description: "Residential complex",
    category: "Web",
    image: asset("liverpool.webp"),
  },
  {
    id: "yantos",
    name: "Yantos: Interesting Facts",
    description: "Video Creatives",
    category: "Motion",
    image: asset("yantos.webp"),
  },
  {
    id: "radar",
    name: "VHF Radar P-18TS",
    description: "Promo Film",
    category: "Motion",
    image: asset("radar.webp"),
  },
];

export const socials = [
  { name: "Telegram", href: null },
  { name: "Instagram", href: null },
  { name: "LinkedIn", href: null },
  { name: "Email", href: "mailto:jaubashi@gmail.com" },
];
