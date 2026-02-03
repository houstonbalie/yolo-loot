import { Player, Item, LootEvent } from '../types';

export const INITIAL_PLAYERS: Player[] = [
  {
    id: '1',
    name: 'ThunderGod',
    class: 'Dark Knight',
    cp: '1.2M',
    dkp: 1250,
    role: 'Tank',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDacnWWUQz6kZFqnL6R073jA6Uq92-b-D1-iyZmzCMZLHovcVzyy0nEMJaBMyLRGfO6r9uDbEU5Hm74AFXL-YJFAN3Qg25y6XyK1FWhfbVjuQOPns-XtbiGC525X9KQhkEs6LbBmO9oQQcu_qp9SPw7jdAU8aPfegICpHG7UNQEXfRexBJXpvmOqPD2Hu-kR_FdlbSJjwEc15NGVgm7iLKsTGPs_xj7cM_KNdUjmeFU5kjA-cREYDFACoP2hS7_eNfYaOoXYOSgqxlJ',
    status: 'Online'
  },
  {
    id: '2',
    name: 'MysticAura',
    class: 'Dark Wizard',
    cp: '980K',
    dkp: 980,
    role: 'DPS',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD4Ccz1E-7PHVvT7NLk3CCzrUKxziaWjmhMFsRPJKQvtnzdx1sKIbpZ1oBfU7Q7V6jNIpLGaLS9g1PTOdQaIbRaR_YzC0Z59qfE7K8Db9fD9ygrucfOdAm_G9YktK7V7r-Mj_-Dur63kVtBC9rFf6JlpEQYRia2zrGcOoiguvSxFq_gg0J_F2YEAUZjAvtqaT2vovE-aP23SdDkDSFl3IUbVZ9pzA5ffO1vf1DDxj2YY0EuUTy9NXhc1klWl9ll3rYWC6pmn0N5SJe9',
    status: 'Online'
  },
  {
    id: '3',
    name: 'NightShade',
    class: 'Dark Lord',
    cp: '850K',
    dkp: 850,
    role: 'DPS',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBBqIKv1CsMGl2R3mQuhlX9TQODx9o6c6MoHPSU6d2cVbYrKflmoKK2mR-aG8bxSSbBs0xSocpTCInJSrTqbYO99kxuc1dqQusonusanMpaLPDyUCEwI9WWIfDsJ7QHw9EfWiFOkPmtUTPXdvtTzby__7pEYsnM5ekLgFdUBr6l0lRR8QwL7yMJw3wPsF_keOFLPC5BcsmGs5wzi_s1cC9EB69C0Mu-T65MgNCkI06tFpoFUiBGA-0Vf6hWykuMq7TWq_ofodHNBRKm',
    status: 'Offline'
  },
  {
    id: '4',
    name: 'HealerX',
    class: 'Elf',
    cp: '720K',
    dkp: 720,
    role: 'Healer',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCLvBQXQpnKfB8KYfYTS7H6KqjPCRxcSBha5vaG_7JDdUZlGAsatiJE3lgb925jXb98-pGs-5w5dX5V-vTbimrPRfzXtCoIaOhDSp05O9G4ma-1Ozp8JH0emOMBeMADOcbg6d6y1X09KIiSdYmexiUZm55wh9mLhu3YY2K6o9FfoINIs0kHM0jhVkeoq8eDINvW8vK_ZSdbamDiknNpTIfsb0J8m7kkdLdmisLNow1-4iv5rBcYuP4UxGmouqJ3soHk5gO2yO8gurBW',
    status: 'Online'
  }
];

export const MOCK_ITEMS: Item[] = [
  {
    id: 'item1',
    name: 'Baú do Arcanjo',
    rarity: 'Legendary',
    stats: 'Contém item Excelente',
    chance: '1.0%',
    iconUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDkL-u-yUd5MmGxd6GrKte3C2bE1d9vXnXIczh6vQ1vFnZEoVVqIMlyktaMoazBp84Ona5MjylcZ9Jo1thB8Lrx3ja2ae4fZlxtU04VT8SGwBoVyqrNTIM7HoIkdmIdUuGS9mMZav2VvCrSWUr3QucqsKnrj9LnlQEO8nPNbxcaPVPXPsWidg9diGQuADerhTK4R16KfFfR46Ta19ErxvNu1uBlYdBkc2huxasU2QGNutbvXob6oJ5gtTrz-nxkouD-Iv3g9YIsltjj',
    cost: 500
  },
  {
    id: 'item2',
    name: 'Chama do Condor',
    rarity: 'Epic',
    stats: 'Material de Asa Lvl 3',
    chance: '2.5%',
    iconUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCkdDSk486oh3e_SZ-NPWJMyo3s-OGZ2YnxCHUANyeD3SpCEiofTnagOqUlzu8udSQ0Si9lYu2X2_hWPaOScVobnuftFvu2YbxIiFRKmUHi0edHZq_kSROuAJ7jQOpuKjApQSVUJx41wE84WtRiM6FZNB7wpEpVDMaUQp1TgV6lP3Glx2r0yqmj3bF2GhCFIXkvpHDvMxf6exl-iux6IFSOIijKDesWVuzASeVWoYa6ouamMiIkiqYpxi2syS3i0saDLk-11vjplskU',
    cost: 150
  },
  {
    id: 'item3',
    name: 'Pena do Condor',
    rarity: 'Epic',
    stats: 'Material de Asa Lvl 3',
    chance: '2.5%',
    iconUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC5OLMWYEP66suY8WSq3CjyqWrfyV2s7aBtxWL7mYIRLEn0aK9PHQUnWLqrHtcHcQDjK6uPRKcAMhbael-sFh7tdNemw0jDwR5DUrvLC9CgdY_oFXeGPUar-u3FC5XnUddnYfiow1oKaUWKOb_1p2nW-qNY1M02rNvuRYiTcqtjIbBqf8_Kok72Dus705NQRRFSdAoMrBEpnMKha2bQmXOJPyjTSRzsNkEiYhM5TJAyPCLRICDuXIp4usYLD6odSeOKyrJdyB4kFGMo',
    cost: 150
  },
  {
    id: 'item4',
    name: 'Pedra do Caos',
    rarity: 'Rare',
    stats: 'Material de Combinação',
    chance: '5.0%',
    iconUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD2zgO49YVHs9QoXZB37bhLLYsDADg18yRpNfwyhputEB8LC1a9M4ILfYwOKGSY_toHY3lcmghQKcBSo3V6dwo-HZBFsFSNyM4CbQu83E91bVV4tibmYwQKWayRD7J2eoZMgXy82dxSUQ6w2Z6kPpZoacVrGDZ7rXimawm07T-yC3R8txcPrCgMwDbEwicWYig7aXE8IpbH-UZrAqmugAs9nLij3tUG65Abxl3GIfv3k9jE3zOQtvYKJGEhDWD2Dq-CUhUFyw-NWtjs',
    cost: 50
  },
  {
    id: 'item5',
    name: 'Alma',
    rarity: 'Uncommon',
    stats: 'Joia de Aprimoramento',
    chance: '10.0%',
    iconUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAHlJU6SBR73wsXzFvwKvNCzg89yjYJW_gxRF_xsJBMStQHVdPdxbIbs-ogZ7EGt87SZfiARVloPknlTx2U5ZmkOBm5rUjIz-I5UW-ae_XmaNF95XDBcZHk0c5rVkM-QpNB8KLz8Hs_uZ41SyECBlyfSN--MWIfddiPdr9XRY47FALY69ROlsYzma9MmXIeD-pVCY8KYvwanteUT-kle9HWot-agpuzHEb6JtcYn3IO9P-Pj8sWuWO6y5tTO-KI5DJph_n-n5gaelpL',
    cost: 10
  }
];

export const INITIAL_HISTORY: LootEvent[] = [
  {
    id: 'h1',
    itemId: 'item1',
    playerId: '1',
    status: 'Acquired',
    date: '24 Out, 20:30',
    raidName: 'Castle Siege',
    cost: 500
  },
  {
    id: 'h2',
    itemId: 'item2',
    playerId: '1',
    status: 'Skipped',
    date: '22 Out, 21:15',
    raidName: 'Kanturu Relics',
    cost: 0
  },
  {
    id: 'h3',
    itemId: 'item5',
    playerId: '1',
    status: 'Absent',
    date: '20 Out, 19:45',
    raidName: 'Blood Castle',
    cost: 0
  },
  {
    id: 'h4',
    itemId: 'item3',
    playerId: '2',
    status: 'Acquired',
    date: '18 Out, 22:00',
    raidName: 'Chaos Castle',
    cost: 150
  }
];