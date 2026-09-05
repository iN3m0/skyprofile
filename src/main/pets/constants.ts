/**
 * Pet leveling/rarity/identity data — factual game-design data (XP curve,
 * per-type max rarity/level, head textures, cosmetic quirks like the
 * Golden Dragon egg), not creative content. Ported from SkyCrypt
 * (src/constants/pets.js, MIT-licensed), the same precedent as the
 * skill-leveling and accessory-chain data already ported elsewhere in this
 * app. SkyCrypt's own source is ~1 year stale at the time of porting (an
 * archived predecessor to the tool now running at sky.shiiyu.moe) — a
 * handful of newer pets (Frog, Crow, Hermit Crab, Jade Dragon, confirmed
 * missing here via a live diff against a real profile's pet list) aren't in
 * this table yet. `petService.ts` falls back to a generic entry for any
 * unrecognized type rather than failing, mirroring SkyCrypt's own
 * behavior for the same situation — this table is a best-effort catalog,
 * not assumed exhaustive, and new pets will keep appearing before it's
 * updated again.
 *
 * `head` values are Mojang skin-texture hashes in SkyCrypt's own
 * `/head/<hash>` shorthand — resolved to a usable URL the same way
 * `getItemSkinUrls` resolves custom item skins: `https://textures.minecraft.net/texture/<hash>`.
 */
/** SkyCrypt's own "unknown pet" head texture — reused both for a genuinely uncatalogued type (petService.ts's fallback) and for a few catalogued-but-icon-less entries below (FROG/CROW/HERMIT_CRAB/JADE_DRAGON). */
export const UNKNOWN_HEAD = '/head/bc8ea1f51f253ff5142ca11ae45193a4ad8c3ab5e9c6eec8ba7a4fcb7bac40'

export const PET_RARITY_OFFSET: Record<string, number> = {
  common: 0,
  uncommon: 6,
  rare: 11,
  epic: 16,
  legendary: 20,
  mythic: 20
}

export const PET_LEVELS: number[] = [100, 110, 120, 130, 145, 160, 175, 190, 210, 230, 250, 275, 300, 330, 360, 400, 440, 490, 540, 600, 660, 730, 800, 880, 960, 1050, 1150, 1260, 1380, 1510, 1650, 1800, 1960, 2130, 2310, 2500, 2700, 2920, 3160, 3420, 3700, 4000, 4350, 4750, 5200, 5700, 6300, 7000, 7800, 8700, 9700, 10800, 12000, 13300, 14700, 16200, 17800, 19500, 21300, 23200, 25200, 27400, 29800, 32400, 35200, 38200, 41400, 44800, 48400, 52200, 56200, 60400, 64800, 69400, 74200, 79200, 84700, 90700, 97200, 104200, 111700, 119700, 128200, 137200, 146700, 156700, 167700, 179700, 192700, 206700, 221700, 237700, 254700, 272700, 291700, 311700, 333700, 357700, 383700, 411700, 441700, 476700, 516700, 561700, 611700, 666700, 726700, 791700, 861700, 936700, 1016700, 1101700, 1191700, 1286700, 1386700, 1496700, 1616700, 1746700, 1886700, 0, 5555, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700, 1886700]

export interface PetDefinition {
  head: string | Record<string, string>
  name?: string | Record<string, string>
  type: string
  maxTier: string
  maxLevel: number
  emoji: string
  category?: string
  passivePerks?: boolean
  bingoExclusive?: boolean
  obtainsExp?: string
  customLevelExpRarityOffset?: string
  ignoresTierBoost?: boolean
  alwaysGainsExp?: boolean | string
  typeGroup?: string
  upgrades?: Record<string, { head?: string }>
  hatching?: { level: number; name: string; head: string }
  /** Excludes this pet from the Pet Score total — only Montezuma (a Rift-only cosmetic pet) uses this, per the source. */
  ignoredInPetScoreCalculation?: boolean
}

/** Pet Score value per rarity tier — https://hypixelskyblock.minecraft.wiki/w/Pet_Score, cross-checked against a real profile's live score. */
export const PET_VALUE: Record<string, number> = {
  common: 1,
  uncommon: 2,
  rare: 3,
  epic: 4,
  legendary: 5,
  mythic: 6
}

/** [Pet Score threshold, Magic Find bonus] pairs, ascending — same source as PET_VALUE. */
export const PET_REWARDS: [number, number][] = [
  [10, 1],
  [25, 2],
  [50, 3],
  [75, 4],
  [100, 5],
  [130, 6],
  [175, 7],
  [225, 8],
  [275, 9],
  [325, 10],
  [375, 11],
  [450, 12],
  [500, 13]
]

export const PET_DATA: Record<string, PetDefinition> = {
  ARMADILLO: {
    head: "/head/c1eb6df4736ae24dd12a3d00f91e6e3aa7ade6bbefb0978afef2f0f92461018f",
    type: "mining",
    maxTier: "legendary",
    maxLevel: 100,
    emoji: "🦔",
    category: "Mount"
  },
  BAT: {
    head: "/head/382fc3f71b41769376a9e92fe3adbaac3772b999b219c9d6b4680ba9983e527",
    type: "mining",
    maxTier: "mythic",
    maxLevel: 100,
    emoji: "🦇"
  },
  BLAZE: {
    head: "/head/b78ef2e4cf2c41a2d14bfde9caff10219f5b1bf5b35a49eb51c6467882cb5f0",
    type: "combat",
    maxTier: "legendary",
    maxLevel: 100,
    emoji: "🔥"
  },
  CHICKEN: {
    head: "/head/7f37d524c3eed171ce149887ea1dee4ed399904727d521865688ece3bac75e",
    type: "farming",
    maxTier: "legendary",
    maxLevel: 100,
    emoji: "🐔"
  },
  HORSE: {
    head: "/head/36fcd3ec3bc84bafb4123ea479471f9d2f42d8fb9c5f11cf5f4e0d93226",
    type: "combat",
    maxTier: "legendary",
    maxLevel: 100,
    emoji: "🐴",
    category: "Mount"
  },
  JERRY: {
    head: "/head/822d8e751c8f2fd4c8942c44bdb2f5ca4d8ae8e575ed3eb34c18a86e93b",
    type: "combat",
    maxTier: "mythic",
    maxLevel: 100,
    emoji: "🧑"
  },
  OCELOT: {
    head: "/head/5657cd5c2989ff97570fec4ddcdc6926a68a3393250c1be1f0b114a1db1",
    type: "foraging",
    maxTier: "legendary",
    maxLevel: 100,
    emoji: "🐆"
  },
  PIGMAN: {
    head: "/head/63d9cb6513f2072e5d4e426d70a5557bc398554c880d4e7b7ec8ef4945eb02f2",
    type: "combat",
    maxTier: "legendary",
    maxLevel: 100,
    emoji: "🐷"
  },
  RABBIT: {
    head: "/head/117bffc1972acd7f3b4a8f43b5b6c7534695b8fd62677e0306b2831574b",
    type: "farming",
    maxTier: "legendary",
    maxLevel: 100,
    emoji: "🐰"
  },
  SHEEP: {
    head: "/head/64e22a46047d272e89a1cfa13e9734b7e12827e235c2012c1a95962874da0",
    type: "alchemy",
    maxTier: "legendary",
    maxLevel: 100,
    emoji: "🐏"
  },
  SILVERFISH: {
    head: "/head/da91dab8391af5fda54acd2c0b18fbd819b865e1a8f1d623813fa761e924540",
    type: "mining",
    maxTier: "legendary",
    maxLevel: 100,
    emoji: "🪳"
  },
  WITHER_SKELETON: {
    head: "/head/f5ec964645a8efac76be2f160d7c9956362f32b6517390c59c3085034f050cff",
    type: "mining",
    maxTier: "legendary",
    maxLevel: 100,
    emoji: "💀"
  },
  SKELETON_HORSE: {
    head: "/head/47effce35132c86ff72bcae77dfbb1d22587e94df3cbc2570ed17cf8973a",
    type: "combat",
    maxTier: "legendary",
    maxLevel: 100,
    emoji: "🦓",
    category: "Mount"
  },
  WOLF: {
    head: "/head/dc3dd984bb659849bd52994046964c22725f717e986b12d548fd169367d494",
    type: "combat",
    maxTier: "legendary",
    maxLevel: 100,
    emoji: "🐺"
  },
  ENDERMAN: {
    head: "/head/6eab75eaa5c9f2c43a0d23cfdce35f4df632e9815001850377385f7b2f039ce1",
    type: "combat",
    maxTier: "mythic",
    maxLevel: 100,
    emoji: "🔮"
  },
  PHOENIX: {
    head: "/head/23aaf7b1a778949696cb99d4f04ad1aa518ceee256c72e5ed65bfa5c2d88d9e",
    type: "combat",
    maxTier: "legendary",
    maxLevel: 100,
    emoji: "🐦"
  },
  MAGMA_CUBE: {
    head: "/head/38957d5023c937c4c41aa2412d43410bda23cf79a9f6ab36b76fef2d7c429",
    type: "combat",
    maxTier: "legendary",
    maxLevel: 100,
    emoji: "🌋"
  },
  FLYING_FISH: {
    head: {
      default: "/head/40cd71fbbbbb66c7baf7881f415c64fa84f6504958a57ccdb8589252647ea",
      mythic: "/head/b0e2363c2d41a9d323ba625de8c0637063a36fe85a045de275a7b7739ded6051"
    },
    type: "fishing",
    maxTier: "mythic",
    maxLevel: 100,
    emoji: "🐟"
  },
  BLUE_WHALE: {
    head: "/head/dab779bbccc849f88273d844e8ca2f3a67a1699cb216c0a11b44326ce2cc20",
    type: "fishing",
    maxTier: "legendary",
    maxLevel: 100,
    emoji: "🐋"
  },
  TIGER: {
    head: "/head/fc42638744922b5fcf62cd9bf27eeab91b2e72d6c70e86cc5aa3883993e9d84",
    type: "combat",
    maxTier: "legendary",
    maxLevel: 100,
    emoji: "🐯"
  },
  LION: {
    head: "/head/38ff473bd52b4db2c06f1ac87fe1367bce7574fac330ffac7956229f82efba1",
    type: "foraging",
    maxTier: "legendary",
    maxLevel: 100,
    emoji: "🦁"
  },
  PARROT: {
    head: "/head/5df4b3401a4d06ad66ac8b5c4d189618ae617f9c143071c8ac39a563cf4e4208",
    type: "alchemy",
    maxTier: "legendary",
    maxLevel: 100,
    emoji: "🦜"
  },
  SNOWMAN: {
    head: "/head/11136616d8c4a87a54ce78a97b551610c2b2c8f6d410bc38b858f974b113b208",
    type: "combat",
    maxTier: "mythic",
    maxLevel: 100,
    emoji: "⛄"
  },
  TURTLE: {
    head: "/head/212b58c841b394863dbcc54de1c2ad2648af8f03e648988c1f9cef0bc20ee23c",
    type: "combat",
    maxTier: "legendary",
    maxLevel: 100,
    emoji: "🐢"
  },
  BEE: {
    head: "/head/7e941987e825a24ea7baafab9819344b6c247c75c54a691987cd296bc163c263",
    type: "farming",
    maxTier: "legendary",
    maxLevel: 100,
    emoji: "🐝"
  },
  ENDER_DRAGON: {
    head: "/head/aec3ff563290b13ff3bcc36898af7eaa988b6cc18dc254147f58374afe9b21b9",
    type: "combat",
    maxTier: "legendary",
    maxLevel: 100,
    emoji: "🐲"
  },
  GUARDIAN: {
    head: "/head/221025434045bda7025b3e514b316a4b770c6faa4ba9adb4be3809526db77f9d",
    type: "enchanting",
    maxTier: "mythic",
    maxLevel: 100,
    emoji: "🐡"
  },
  SQUID: {
    head: "/head/01433be242366af126da434b8735df1eb5b3cb2cede39145974e9c483607bac",
    type: "fishing",
    maxTier: "legendary",
    maxLevel: 100,
    emoji: "🦑"
  },
  GIRAFFE: {
    head: "/head/176b4e390f2ecdb8a78dc611789ca0af1e7e09229319c3a7aa8209b63b9",
    type: "foraging",
    maxTier: "legendary",
    maxLevel: 100,
    emoji: "🦒"
  },
  ELEPHANT: {
    head: "/head/7071a76f669db5ed6d32b48bb2dba55d5317d7f45225cb3267ec435cfa514",
    type: "farming",
    maxTier: "legendary",
    maxLevel: 100,
    emoji: "🐘"
  },
  MONKEY: {
    head: "/head/13cf8db84807c471d7c6922302261ac1b5a179f96d1191156ecf3e1b1d3ca",
    type: "foraging",
    maxTier: "legendary",
    maxLevel: 100,
    emoji: "🐵"
  },
  SPIDER: {
    head: "/head/cd541541daaff50896cd258bdbdd4cf80c3ba816735726078bfe393927e57f1",
    type: "combat",
    maxTier: "mythic",
    maxLevel: 100,
    emoji: "🕷️"
  },
  ENDERMITE: {
    head: "/head/5a1a0831aa03afb4212adcbb24e5dfaa7f476a1173fce259ef75a85855",
    type: "mining",
    maxTier: "mythic",
    maxLevel: 100,
    emoji: "🐜"
  },
  GHOUL: {
    head: "/head/87934565bf522f6f4726cdfe127137be11d37c310db34d8c70253392b5ff5b",
    type: "combat",
    maxTier: "legendary",
    maxLevel: 100,
    emoji: "🧟"
  },
  JELLYFISH: {
    head: "/head/913f086ccb56323f238ba3489ff2a1a34c0fdceeafc483acff0e5488cfd6c2f1",
    type: "alchemy",
    maxTier: "legendary",
    maxLevel: 100,
    emoji: "🎐"
  },
  PIG: {
    head: "/head/621668ef7cb79dd9c22ce3d1f3f4cb6e2559893b6df4a469514e667c16aa4",
    type: "farming",
    maxTier: "legendary",
    maxLevel: 100,
    emoji: "🐷",
    category: "Mount"
  },
  ROCK: {
    head: "/head/cb2b5d48e57577563aca31735519cb622219bc058b1f34648b67b8e71bc0fa",
    type: "mining",
    maxTier: "legendary",
    maxLevel: 100,
    emoji: "🪨",
    category: "Mount"
  },
  SKELETON: {
    head: "/head/fca445749251bdd898fb83f667844e38a1dff79a1529f79a42447a0599310ea4",
    type: "combat",
    maxTier: "legendary",
    maxLevel: 100,
    emoji: "💀"
  },
  ZOMBIE: {
    head: "/head/56fc854bb84cf4b7697297973e02b79bc10698460b51a639c60e5e417734e11",
    type: "combat",
    maxTier: "legendary",
    maxLevel: 100,
    emoji: "🧟"
  },
  DOLPHIN: {
    head: "/head/cefe7d803a45aa2af1993df2544a28df849a762663719bfefc58bf389ab7f5",
    type: "fishing",
    maxTier: "legendary",
    maxLevel: 100,
    emoji: "🐬"
  },
  BABY_YETI: {
    head: "/head/ab126814fc3fa846dad934c349628a7a1de5b415021a03ef4211d62514d5",
    type: "fishing",
    maxTier: "legendary",
    maxLevel: 100,
    emoji: "❄️"
  },
  MEGALODON: {
    head: "/head/a94ae433b301c7fb7c68cba625b0bd36b0b14190f20e34a7c8ee0d9de06d53b9",
    type: "fishing",
    maxTier: "legendary",
    maxLevel: 100,
    emoji: "🦈"
  },
  GOLEM: {
    head: "/head/89091d79ea0f59ef7ef94d7bba6e5f17f2f7d4572c44f90f76c4819a714",
    type: "combat",
    maxTier: "legendary",
    maxLevel: 100,
    emoji: "🗿"
  },
  HOUND: {
    head: "/head/b7c8bef6beb77e29af8627ecdc38d86aa2fea7ccd163dc73c00f9f258f9a1457",
    type: "combat",
    maxTier: "legendary",
    maxLevel: 100,
    emoji: "👹"
  },
  TARANTULA: {
    head: "/head/8300986ed0a04ea79904f6ae53f49ed3a0ff5b1df62bba622ecbd3777f156df8",
    type: "combat",
    maxTier: "mythic",
    maxLevel: 100,
    emoji: "🕸️"
  },
  BLACK_CAT: {
    head: "/head/e4b45cbaa19fe3d68c856cd3846c03b5f59de81a480eec921ab4fa3cd81317",
    type: "combat",
    maxTier: "mythic",
    maxLevel: 100,
    emoji: "🐈‍⬛"
  },
  SPIRIT: {
    head: "/head/8d9ccc670677d0cebaad4058d6aaf9acfab09abea5d86379a059902f2fe22655",
    type: "combat",
    maxTier: "legendary",
    maxLevel: 100,
    emoji: "👻",
    passivePerks: true
  },
  GRIFFIN: {
    head: "/head/4c27e3cb52a64968e60c861ef1ab84e0a0cb5f07be103ac78da67761731f00c8",
    type: "combat",
    maxTier: "legendary",
    maxLevel: 100,
    emoji: "🦅",
    ignoresTierBoost: true
  },
  MITHRIL_GOLEM: {
    head: "/head/c1b2dfe8ed5dffc5b1687bc1c249c39de2d8a6c3d90305c95f6d1a1a330a0b1",
    type: "mining",
    maxTier: "mythic",
    maxLevel: 100,
    emoji: "🗿"
  },
  GRANDMA_WOLF: {
    head: "/head/4e794274c1bb197ad306540286a7aa952974f5661bccf2b725424f6ed79c7884",
    type: "combat",
    maxTier: "legendary",
    maxLevel: 100,
    emoji: "👵",
    passivePerks: true
  },
  RAT: {
    head: "/head/a8abb471db0ab78703011979dc8b40798a941f3a4dec3ec61cbeec2af8cffe8",
    type: "combat",
    maxTier: "mythic",
    maxLevel: 100,
    emoji: "🐀",
    category: "Morph",
    upgrades: {
      mythic: {
        head: "/head/250de7097d939e447ca2d398441cba1d2a5e1a69052ac99c19ff20ad5a3f01ab"
      }
    }
  },
  BAL: {
    head: "/head/c469ba2047122e0a2de3c7437ad3dd5d31f1ac2d27abde9f8841e1d92a8c5b75",
    type: "mining",
    maxTier: "legendary",
    maxLevel: 100,
    emoji: "🧨"
  },
  SCATHA: {
    head: "/head/df03ad96092f3f789902436709cdf69de6b727c121b3c2daef9ffa1ccaed186c",
    type: "mining",
    maxTier: "legendary",
    maxLevel: 100,
    emoji: "🐾"
  },
  GOLDEN_DRAGON: {
    head: "/head/2e9f9b1fc014166cb46a093e5349b2bf6edd201b680d62e48dbf3af9b0459116",
    type: "combat",
    maxTier: "legendary",
    maxLevel: 200,
    emoji: "🐉",
    hatching: {
      level: 100,
      name: "Golden Dragon Egg",
      head: "/head/113bdf2d2b00605606826df76e211ea288aa050edc9d71cb09986c488ca0411c"
    }
  },
  AMMONITE: {
    head: "/head/a074a7bd976fe6aba1624161793be547d54c835cf422243a851ba09d1e650553",
    type: "fishing",
    maxTier: "legendary",
    maxLevel: 100,
    emoji: "🐾"
  },
  BINGO: {
    head: "/head/d4cd9c707c7092d4759fe2b2b6a713215b6e39919ec4e7afb1ae2b6f8576674c",
    type: "all",
    maxTier: "epic",
    maxLevel: 100,
    emoji: "🎲",
    passivePerks: true,
    bingoExclusive: true,
    customLevelExpRarityOffset: "common"
  },
  MOOSHROOM_COW: {
    head: "/head/2b52841f2fd589e0bc84cbabf9e1c27cb70cac98f8d6b3dd065e55a4dcb70d77",
    type: "farming",
    maxTier: "legendary",
    maxLevel: 100,
    emoji: "🐮"
  },
  SNAIL: {
    head: "/head/50a9933a3b10489d38f6950c4e628bfcf9f7a27f8d84666f04f14d5374252972",
    type: "mining",
    maxTier: "legendary",
    maxLevel: 100,
    emoji: "🐌"
  },
  KUUDRA: {
    head: "/head/1f0239fb498e5907ede12ab32629ee95f0064574a9ffdff9fc3a1c8e2ec17587",
    type: "combat",
    maxTier: "legendary",
    maxLevel: 100,
    emoji: "👹",
    passivePerks: true,
    alwaysGainsExp: "§cCrimson Isle"
  },
  DROPLET_WISP: {
    head: "/head/b412e70375ec99ee38ae94b30e9b10752d459662b54794dfe66fe6a183c672d3",
    type: "gabagool",
    maxTier: "uncommon",
    maxLevel: 100,
    emoji: "💦",
    obtainsExp: "feed",
    ignoresTierBoost: true,
    typeGroup: "WISP"
  },
  FROST_WISP: {
    head: "/head/1d8ad9936d758c5ea30b0b7cc7c67c2bfcea829ecf2425c0b50fc92a26ae23d0",
    type: "gabagool",
    maxTier: "rare",
    maxLevel: 100,
    emoji: "💦",
    obtainsExp: "feed",
    ignoresTierBoost: true,
    typeGroup: "WISP"
  },
  GLACIAL_WISP: {
    head: "/head/3e2018feebe1a99177b3cb196d4e44521268b4b3eb56e6419cb0253cdbf0456c",
    type: "gabagool",
    maxTier: "epic",
    maxLevel: 100,
    emoji: "💦",
    obtainsExp: "feed",
    ignoresTierBoost: true,
    typeGroup: "WISP"
  },
  SUBZERO_WISP: {
    head: "/head/7a0eb37e58c942eca4d33ab44e26eb1910c783788510b0a53b6f4d18881e237e",
    type: "gabagool",
    maxTier: "legendary",
    maxLevel: 100,
    emoji: "💦",
    obtainsExp: "feed",
    ignoresTierBoost: true,
    typeGroup: "WISP"
  },
  REINDEER: {
    head: "/head/a2df65c6fd19a58bee38252192ac7ce2cf1dc8632c3547a9228b6b697240d098",
    type: "fishing",
    maxTier: "legendary",
    maxLevel: 100,
    emoji: "🦌"
  },
  RIFT_FERRET: {
    head: "/head/b6b11399448260185da1d17e54c984515faab6d8585f00972451ec2b43d46f94",
    type: "combat",
    maxTier: "legendary",
    maxLevel: 100,
    emoji: "🦝"
  },
  FRACTURED_MONTEZUMA_SOUL: {
    head: "/head/df656c06e8a5cb4692564ee21748bddec9d785d1834284aaa1439601bba47d6b",
    name: {
      default: "Montezuma"
    },
    type: "combat",
    maxTier: "epic",
    maxLevel: 100,
    emoji: "💀",
    ignoredInPetScoreCalculation: true
  },
  EERIE: {
    head: "/head/c3af70c6ff76ba48f24ee8a2063a5b50bbfabf409f4795248a292f8289f47c98",
    type: "combat",
    maxTier: "common",
    maxLevel: 100,
    emoji: "🕷️"
  },
  SLUG: {
    head: "/head/7a79d0fd677b54530961117ef84adc206e2cc5045c1344d61d776bf8ac2fe1ba",
    type: "farming",
    maxTier: "legendary",
    maxLevel: 100,
    emoji: "🐌"
  },
  OWL: {
    head: "/head/da3216da54e7368fb40b721239ad95e07ef4f97d93f1c42ff319bab9a53882af",
    type: "taming",
    maxTier: "legendary",
    maxLevel: 100,
    emoji: "🦉",
    passivePerks: true
  },
  TYRANNOSAURUS: {
    head: "/head/93f28ec96df59c67e9d2fc2e7e3d055fa31646e4111add9fe26a692801964126",
    type: "combat",
    maxTier: "legendary",
    maxLevel: 100,
    emoji: "🦖",
    name: {
      default: "T-Rex"
    }
  },
  SPINOSAURUS: {
    head: "/head/d3c9d479471a2f13f22548315159591720992e70c920fef83a901b7186720e3c",
    type: "fishing",
    maxTier: "legendary",
    maxLevel: 100,
    emoji: "🦖"
  },
  GOBLIN: {
    head: "/head/7309d8dc35a638a04b915a3b15a1452ceeae0d7ea42bcdadb21b03046987515c",
    type: "mining",
    maxTier: "legendary",
    maxLevel: 100,
    emoji: "👺"
  },
  ANKYLOSAURUS: {
    head: "/head/c1aa836b9096c417903299a6c5ab41738c19648ac439fed4bcbe6c32605338dc",
    type: "combat",
    maxTier: "legendary",
    maxLevel: 100,
    emoji: "🦖"
  },
  PENGUIN: {
    head: "/head/37534e97f36e5a8335928e171ec99608bee7fb16e260afb301025b3b17eeefc4",
    type: "fishing",
    maxTier: "legendary",
    maxLevel: 100,
    emoji: "🐧"
  },
  MAMMOTH: {
    head: "/head/6b10715732cd1fd49fa1b6187947c307dd4687105cf033840607f9d6234743ad",
    type: "combat",
    maxTier: "legendary",
    maxLevel: 100,
    emoji: "🐘"
  },
  MOLE: {
    head: "/head/727baaafc09978d4bda73e16afdde85ec13b0f95ad989524c5fcaa717cf06b4a",
    type: "mining",
    maxTier: "legendary",
    maxLevel: 100,
    emoji: "🦡"
  },
  GLACITE_GOLEM: {
    head: "/head/af132a6593876d3c377d503fd66eca3fb938743251f7b16a9870c60b7388c8a3",
    type: "mining",
    maxTier: "legendary",
    maxLevel: 100,
    emoji: "🗿"
  },

  // The four entries below were added after this table was ported — found
  // missing via a live diff against a real profile's owned-pet list (so
  // confirmed real and currently obtainable, unlike a couple of other
  // NEU-REPO-listed pets that showed zero corroborating evidence in live
  // Hypixel data and were left out as likely pre-release/datamined-only).
  // No head texture hash was readily available for these, so they render
  // via the generic unknown-pet fallback icon until one is found — real
  // name/rarity/level math is unaffected by that gap. maxTier/skillType
  // cross-checked against the wiki + NEU-REPO's `pet_types` mapping.
  FROG: {
    head: UNKNOWN_HEAD,
    type: "foraging",
    maxTier: "legendary",
    maxLevel: 100,
    emoji: "🐸"
  },
  CROW: {
    head: UNKNOWN_HEAD,
    type: "combat",
    maxTier: "legendary",
    maxLevel: 100,
    emoji: "🐦‍⬛"
  },
  HERMIT_CRAB: {
    head: UNKNOWN_HEAD,
    type: "fishing",
    maxTier: "legendary",
    maxLevel: 100,
    emoji: "🦀"
  },
  // Joins Golden Dragon as a 200-max-level Dragon pet — confirmed via
  // NEU-REPO's petnums.json custom_pet_leveling entry (same flat post-100
  // XP curve Golden Dragon uses, already covered by the shared PET_LEVELS
  // table here — no separate curve needed).
  JADE_DRAGON: {
    head: UNKNOWN_HEAD,
    type: "foraging",
    maxTier: "legendary",
    maxLevel: 200,
    emoji: "🐉"
  }
}
