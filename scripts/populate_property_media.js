const fs = require('fs');
const path = require('path');

const dbPath = path.join(process.cwd(), 'data', 'db.json');
const mockDbPath = path.join(process.cwd(), 'mock-db.json');

const sampleMedia = [
  { id: 'm_ext', url: '/images/property_hero.jpg', tag: 'Exterior / Facade', isCover: true, caption: 'Architectural Elevation' },
  { id: 'm_hall', url: '/images/deal_closing.jpg', tag: 'Hall / Living Area', isCover: false, caption: 'Soaring Great Room with Cathedral Ceilings' },
  { id: 'm_bed', url: '/images/luxury_bedroom.jpg', tag: 'Master Bedroom', isCover: false, caption: 'Primary Master Suite with Panoramic Views' },
  { id: 'm_kit', url: '/images/luxury_kitchen.jpg', tag: 'Kitchen', isCover: false, caption: 'Chef Kitchen with Calacatta Marble Island' },
  { id: 'm_bath', url: '/images/luxury_washroom.jpg', tag: 'Washroom', isCover: false, caption: 'Spa Bathroom with Freestanding Soaking Tub' },
  { id: 'm_balc', url: '/images/hero_dashboard.jpg', tag: 'Balcony', isCover: false, caption: 'Sunset Lounge & Entertainer Terrace' }
];

[dbPath, mockDbPath].forEach(filePath => {
  if (!fs.existsSync(filePath)) return;
  const db = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  if (!db.properties) return;

  db.properties = db.properties.map((p, idx) => {
    // Generate tailored media list
    const media = [
      { id: `m_${p.id}_1`, url: '/images/property_hero.jpg', tag: 'Exterior / Facade', isCover: true, caption: `${p.title} - Main Facade` },
      { id: `m_${p.id}_2`, url: '/images/deal_closing.jpg', tag: 'Hall / Living Area', isCover: false, caption: 'Open Living & Entertainment Hall' },
      { id: `m_${p.id}_3`, url: '/images/luxury_bedroom.jpg', tag: 'Master Bedroom', isCover: false, caption: 'Spacious Master Bedroom Suite' },
      { id: `m_${p.id}_4`, url: '/images/luxury_kitchen.jpg', tag: 'Kitchen', isCover: false, caption: 'Designer Modular Kitchen' },
      { id: `m_${p.id}_5`, url: '/images/luxury_washroom.jpg', tag: 'Washroom', isCover: false, caption: 'Designer Luxury Bathroom' },
      { id: `m_${p.id}_6`, url: '/images/hero_dashboard.jpg', tag: 'Balcony', isCover: false, caption: 'Private Balcony with Skyline View' }
    ];

    return {
      ...p,
      purpose: p.purpose || p.listingType || (idx % 2 === 0 ? 'For Sale' : 'For Rent'),
      carpetAreaSqFt: p.carpetAreaSqFt || (p.areaSqFt ? Math.round(Number(p.areaSqFt) * 0.8) : 1500),
      furnishing: p.furnishing || (idx % 3 === 0 ? 'Fully Furnished' : (idx % 3 === 1 ? 'Semi-Furnished' : 'Unfurnished')),
      parking: p.parking !== undefined ? p.parking : 2,
      sellerName: p.sellerName || p.ownerName || 'Verified Property Owner',
      sellerPhone: p.sellerPhone || '+1 (555) 234-9876',
      keyLocationNotes: p.keyLocationNotes || 'Key in lockbox #4920 on front door; call listing agent 2 hours prior.',
      media,
      images: media.map(m => m.url),
      videoTourUrl: p.videoTourUrl || 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
      virtualTourUrl: p.virtualTourUrl || 'https://my.matterport.com/show/?m=sample360',
      videos: p.videos && p.videos.length > 0 ? p.videos : [
        { id: `v_${p.id}_1`, url: 'https://www.youtube.com/watch?v=ScMzIvxBSi4', title: '4K Architectural Walkthrough Tour', type: 'video' }
      ]
    };
  });

  fs.writeFileSync(filePath, JSON.stringify(db, null, 2));
  console.log(`Updated ${db.properties.length} properties in ${filePath}`);
});
