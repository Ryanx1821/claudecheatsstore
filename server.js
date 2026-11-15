const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const SHOP_ID = '207573';
const API_KEY = '6342749|MFAy03lhFM6tAVnk4qGBQ4UqlC8IiDAZNWRZLixh29eab68c';
const BASE_DIR = path.resolve(__dirname);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1571572812400038170/r3s_xg4dzCpicQqfiBUHIyp93srknslnhCgIVmjCTMW1cuBMkp2jwhfxyrlATHpzSVwx';

function sendDiscordWebhook(data, appId) {
  return new Promise((resolve) => {
    try {
      const parsedUrl = new URL(DISCORD_WEBHOOK_URL);
      const postData = JSON.stringify({
        username: 'Claude Cheats Reseller Bot',
        avatar_url: 'https://api.sellauth.com/storage/images/1271087.webp',
        embeds: [
          {
            title: '🚀 New Wholesale Reseller Application',
            color: 0xff6b00,
            description: 'A new reseller partnership application was submitted via the storefront.',
            fields: [
              { name: 'Application ID', value: `\`${appId}\``, inline: true },
              { name: 'Discord Username', value: data.discord ? `\`${data.discord}\`` : 'Not provided', inline: true },
              { name: 'Storefront / Channel URL', value: data.storeUrl || 'None', inline: false },
              { name: 'Expected Monthly Volume', value: data.volume || 'Not specified', inline: true },
              { name: 'Target Software Titles', value: data.titles || 'All Software', inline: true },
              { name: 'Notes & Experience', value: data.notes || 'None provided', inline: false }
            ],
            footer: {
              text: 'Claude Cheats · Automated Reseller System'
            },
            timestamp: new Date().toISOString()
          }
        ]
      });

      const postReq = https.request({
        hostname: parsedUrl.hostname,
        path: parsedUrl.pathname + parsedUrl.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      }, (postRes) => {
        postRes.on('data', () => {});
        postRes.on('end', () => resolve(true));
      });

      postReq.on('error', (err) => {
        console.error('[DISCORD WEBHOOK ERROR]', err.message);
        resolve(false);
      });

      postReq.write(postData);
      postReq.end();
    } catch (err) {
      console.error('[DISCORD WEBHOOK EXCEPTION]', err.message);
      resolve(false);
    }
  });
}

function fetchSellAuth(endpoint, options = {}) {
  return new Promise((resolve, reject) => {
    const targetUrl = `https://api.sellauth.com/v1/shops/${SHOP_ID}${endpoint}`;
    const parsed = url.parse(targetUrl);
    
    const reqOptions = {
      hostname: parsed.hostname,
      port: 443,
      path: parsed.path,
      method: options.method || 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Accept': 'application/json',
        'User-Agent': 'Claude-Cheats-Portal/1.0',
        ...(options.headers || {})
      }
    };

    const req = https.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsedData });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

// Fallback high-tier software catalog if SellAuth remote catalog has 0 entries
const DEFAULT_CATALOG = [
  {
    id: 101,
    name: 'Claude Fortnite Private',
    slug: 'fortnite-private',
    category: 'Fortnite',
    status: 'Undetected',
    image: '/assets/1152335.webp',
    anticheat: ['BattlEye', 'EasyAntiCheat'],
    featured: true,
    bestseller: true,
    rating: 4.98,
    reviewsCount: 312,
    description: 'Kernel-level private external cheat. Streamproof rendering, configurable smooth aimbot, bone prioritization, and customizable item/player ESP.',
    features: [
      'Kernel ring-0 hypervisor driver',
      'Memory-write free external aimbot',
      'Full player ESP (box, bones, snapline, distance, weapons)',
      'Loot & chest ESP with custom rarities',
      'Streamproof (OBS, Discord, Twitch bypass)',
      'Built-in HWID Spoofer included'
    ],
    variants: [
      { id: 'fn-day', name: '1 Day Access', price: 6.99, duration: '24 Hours' },
      { id: 'fn-week', name: '7 Day Access', price: 21.99, duration: '7 Days', popular: true },
      { id: 'fn-month', name: '30 Day Access', price: 49.99, duration: '30 Days' },
      { id: 'fn-life', name: 'Lifetime Access', price: 139.99, duration: 'Lifetime' }
    ]
  },
  {
    id: 102,
    name: 'Claude Valorant External',
    slug: 'valorant-external',
    category: 'Valorant',
    status: 'Undetected',
    image: '/assets/1000627.webp',
    anticheat: ['Vanguard'],
    featured: true,
    bestseller: true,
    rating: 4.96,
    reviewsCount: 247,
    description: 'Undetected DMA & Kernel solution engineered specifically for Vanguard. Colorbot and overlay ESP with zero injected DLL footprint.',
    features: [
      'Vanguard 100% bypass architecture',
      'Humanized bezier curve smooth aim assist',
      'Head/Neck/Chest hitbox auto-switch',
      'Recoil control system (RCS)',
      '2D Radar & spike timer overlay',
      'Windows 10/11 all builds compatible'
    ],
    variants: [
      { id: 'val-day', name: '1 Day Access', price: 8.99, duration: '24 Hours' },
      { id: 'val-week', name: '7 Day Access', price: 27.99, duration: '7 Days', popular: true },
      { id: 'val-month', name: '30 Day Access', price: 59.99, duration: '30 Days' },
      { id: 'val-life', name: 'Lifetime Access', price: 169.99, duration: 'Lifetime' }
    ]
  },
  {
    id: 103,
    name: 'Claude Apex Legends Internal',
    slug: 'apex-internal',
    category: 'Apex Legends',
    status: 'Undetected',
    image: '/assets/1058898.webp',
    anticheat: ['EasyAntiCheat'],
    featured: true,
    bestseller: false,
    rating: 4.94,
    reviewsCount: 189,
    description: 'High performance internal build. Predictive bullet drop compensation, silent aim, glow ESP, spectator list, and item tier filters.',
    features: [
      'Predictive ballistic bullet drop aimbot',
      'Chams & player glow with shield color tags',
      'Spectator detection alert banner',
      'Auto super-glide & bunny hop scripts',
      'Loot ESP with weapon attachments filter',
      'Zero FPS drop on 144Hz-360Hz monitors'
    ],
    variants: [
      { id: 'apex-day', name: '1 Day Access', price: 5.99, duration: '24 Hours' },
      { id: 'apex-week', name: '7 Day Access', price: 18.99, duration: '7 Days' },
      { id: 'apex-month', name: '30 Day Access', price: 44.99, duration: '30 Days', popular: true },
      { id: 'apex-life', name: 'Lifetime Access', price: 119.99, duration: 'Lifetime' }
    ]
  },
  {
    id: 104,
    name: 'Claude Call of Duty: Warzone / MW3',
    slug: 'cod-warzone',
    category: 'Call of Duty',
    status: 'Undetected',
    image: '/assets/1150492.webp',
    anticheat: ['Ricochet'],
    featured: true,
    bestseller: true,
    rating: 4.97,
    reviewsCount: 284,
    description: 'Ricochet-proof kernel cheat. Controller support, target lock, bone scan, UAV radar map, and automated shadowban prevention.',
    features: [
      'Ricochet signature & behavioral bypass',
      'Full controller & mouse/keyboard support',
      'Always-active 2D directional radar',
      'Custom crosshair & visibility checks',
      'Loot cache & killstreak marker ESP',
      'Shadowban protection module'
    ],
    variants: [
      { id: 'cod-day', name: '1 Day Access', price: 7.49, duration: '24 Hours' },
      { id: 'cod-week', name: '7 Day Access', price: 23.99, duration: '7 Days', popular: true },
      { id: 'cod-month', name: '30 Day Access', price: 54.99, duration: '30 Days' },
      { id: 'cod-life', name: 'Lifetime Access', price: 149.99, duration: 'Lifetime' }
    ]
  },
  {
    id: 105,
    name: 'Claude Universal HWID Spoofer',
    slug: 'hwid-spoofer',
    category: 'Spoofers',
    status: 'Undetected',
    image: '/assets/1152351.webp',
    anticheat: ['BattlEye', 'EasyAntiCheat', 'Vanguard', 'Ricochet'],
    featured: false,
    bestseller: false,
    rating: 4.99,
    reviewsCount: 420,
    description: 'Permanent & temporary kernel HWID masking. Spoofs Disk Drive serials, Motherboard UUID, NIC MAC, GPU serial, ARP cache, and Registry keys.',
    features: [
      'Kernel EFI bootloader driver',
      'Disk drive serial number virtualization',
      'Network adapter MAC randomize',
      'SMBIOS & Motherboard UUID masking',
      'Registry cleaning & trace cleaner',
      'One-click automated cleanup'
    ],
    variants: [
      { id: 'spoofer-day', name: '1 Day Key', price: 4.99, duration: '24 Hours' },
      { id: 'spoofer-month', name: '30 Day Key', price: 29.99, duration: '30 Days', popular: true },
      { id: 'spoofer-life', name: 'Lifetime Key', price: 79.99, duration: 'Lifetime' }
    ]
  },
  {
    id: 106,
    name: 'Arcane Rust Private DMA',
    slug: 'rust-private',
    category: 'Rust',
    status: 'Undetected',
    image: '/assets/1058939.webp',
    anticheat: ['EasyAntiCheat', 'Cerberus'],
    featured: true,
    bestseller: true,
    rating: 4.95,
    reviewsCount: 164,
    description: 'Hardware DMA-based external software for Rust. Completely invisible to EAC and game memory scans.',
    features: [
      'Direct Memory Access (DMA) 100% invisible',
      'Silent aimbot with hitchance slider',
      'Player, Sleeper, Scientist, Animal ESP',
      'Ore, Bradley, Heli, Codelock radar',
      'No recoil & customizable spread reduction',
      'Web-radar link for teammates'
    ],
    variants: [
      { id: 'rust-day', name: '1 Day Access', price: 8.60, duration: '24 Hours' },
      { id: 'rust-week', name: '7 Day Access', price: 29.99, duration: '7 Days', popular: true },
      { id: 'rust-month', name: '30 Day Access', price: 69.99, duration: '30 Days' },
      { id: 'rust-life', name: 'Lifetime Access', price: 189.99, duration: 'Lifetime' }
    ]
  }
];

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // API Endpoints
  if (pathname.startsWith('/api/')) {
    res.setHeader('Content-Type', 'application/json');

    // 1. Shop Info
    if (pathname === '/api/shop') {
      try {
        const response = await fetchSellAuth('');
        if (response.data) {
          res.writeHead(200);
          res.end(JSON.stringify(response.data));
          return;
        }
      } catch (err) {
        console.error('API Shop Error:', err);
      }
      res.writeHead(200);
      res.end(JSON.stringify({
        id: SHOP_ID,
        name: 'Claude Cheats',
        subdomain: 'cla-ude',
        url: 'https://cla-ude.mysellauth.com',
        currency: 'USD',
        description: 'Elite Gaming Software & Kernel Security Tools'
      }));
      return;
    }

    // 2. Products List - STRICTLY SELLAUTH PRODUCTS ONLY
    if (pathname === '/api/products') {
      try {
        const response = await fetchSellAuth('/products?include=images,variants');
        if (response.data && Array.isArray(response.data.data)) {
          const sellauthProds = response.data.data.map(p => {
            const img = (p.images && p.images.length > 0 && p.images[0].url) ? p.images[0].url : null;
            const minPrice = (p.variants && p.variants.length > 0)
              ? Math.min(...p.variants.map(v => parseFloat(v.price || 0)))
              : parseFloat(p.price || 6.00);

            return {
              id: p.id,
              name: p.name,
              category: (p.category && p.category.name) || 'Software',
              status: p.status_text || 'Undetected',
              status_text: p.status_text || 'Undetected',
              status_color: p.status_color || '#10b981',
              image: img || '/assets/1058939.webp',
              images: p.images || [],
              price: minPrice,
              stock: p.stock_count !== undefined ? p.stock_count : (p.stock || 1),
              featured: true,
              bestseller: true,
              desc: p.description || 'Instant automated SellAuth key delivery and loader download.',
              features: [
                'SellAuth Instant Automated Key Delivery',
                'Windows 10 / 11 All Builds Supported',
                'Kernel-Level Ring-0 Protection',
                'Live Customer & Invoice Support'
              ],
              variants: (p.variants && p.variants.length > 0) ? p.variants.map(v => ({
                id: v.id,
                name: v.name || 'Access',
                price: parseFloat(v.price || 0)
              })) : [{ id: 'default', name: 'Standard Access', price: minPrice }],
              updated_at: p.updated_at
            };
          });

          // STRICTLY SellAuth products only
          res.writeHead(200);
          res.end(JSON.stringify({ source: 'sellauth', data: sellauthProds }));
          return;
        }
      } catch (err) {
        console.error('API Products Error:', err);
      }
      res.writeHead(200);
      res.end(JSON.stringify({ source: 'sellauth', data: [] }));
      return;
    }

    // 3. Payment Methods
    if (pathname === '/api/payment-methods') {
      try {
        const response = await fetchSellAuth('/payment-methods');
        if (response.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
          res.writeHead(200);
          res.end(JSON.stringify(response.data));
          return;
        }
      } catch (err) {
        console.error('API Payment Methods Error:', err);
      }
      res.writeHead(200);
      res.end(JSON.stringify({
        data: [
          { name: 'Cash App', type: 'CASHAPP', is_active: true, fee: '0%' },
          { name: 'Stripe (Cards / Apple Pay / Google Pay)', type: 'STRIPE', is_active: true, fee: '0%' },
          { name: 'PayPal (Friends & Family)', type: 'PAYPALFF', is_active: true, fee: '0%' },
          { name: 'Cryptocurrency (BTC, ETH, LTC, SOL, USDT)', type: 'CRYPTO', is_active: true, fee: '0%' },
          { name: 'Customer Balance', type: 'CUSTOMERBALANCE', is_active: true, fee: '0%' }
        ]
      }));
      return;
    }

    // 4. Status Check
    if (pathname === '/api/status') {
      let stats = null;
      let sellauthProducts = [];
      try {
        const resp = await fetchSellAuth('/stats');
        stats = resp.data;
      } catch (e) {}

      try {
        const prodResp = await fetchSellAuth('/products?include=images,variants');
        if (prodResp.data && Array.isArray(prodResp.data.data)) {
          sellauthProducts = prodResp.data.data.map(p => ({
            id: p.id,
            name: p.name,
            category: (p.category && p.category.name) || 'Software',
            status: p.status_text || 'Undetected',
            status_text: p.status_text || 'Undetected',
            status_color: p.status_color || '#10b981',
            image: (p.images && p.images.length > 0 && p.images[0].url) ? p.images[0].url : '/assets/1058939.webp',
            stock: p.stock_count !== undefined ? p.stock_count : (p.stock || 'In Stock'),
            updated_at: p.updated_at
          }));
        }
      } catch (e) {
        console.error('API Status Products Error:', e);
      }

      res.writeHead(200);
      res.end(JSON.stringify({
        status: 'online',
        uptime: '99.98%',
        serverTime: new Date().toISOString(),
        sellauth: {
          connected: true,
          shopId: SHOP_ID,
          storeName: 'Claude Cheats',
          stats: stats || { products_sold: 6, total_customers: 6, average_rating: 5 }
        },
        sellauthProducts: sellauthProducts,
        services: [
          { name: 'Ring-0 Hypervisor Kernel Driver', status: 'Undetected', status_color: '#10b981', version: 'v4.1.8', anticheats: 'Kernel Integrity' },
          { name: 'Anti-Cheat Detection Watchdog', status: 'Undetected', status_color: '#10b981', version: 'v3.2.0', anticheats: 'EAC / BattlEye / Vanguard' },
          { name: 'Automated Key Delivery Engine', status: 'OPERATIONAL', status_color: '#10b981', version: 'Instant (< 5s)', anticheats: 'Automated Webhook' },
          { name: 'Payment Verification Gateways', status: 'ACTIVE', status_color: '#10b981', version: 'Cash App / Stripe / Crypto', anticheats: 'Autonomous' },
          { name: 'HWID Virtualization Engine', status: 'Undetected', status_color: '#10b981', version: 'v5.0.2', anticheats: 'Ring-0 EFI' }
        ]
      }));
      return;
    }

    // 5. Invoices Lookup / Search
    if (pathname === '/api/invoices/lookup') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', async () => {
        try {
          const payload = JSON.parse(body || '{}');
          const query = (payload.query || '').trim().toLowerCase();

          if (!query) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: 'Please provide an email or Invoice ID' }));
            return;
          }

          const response = await fetchSellAuth('/invoices?per_page=100');
          const allInvoices = (response.data && response.data.data) ? response.data.data : [];

          // Filter by email or ID or unique_id
          const matched = allInvoices.filter(inv => {
            const emailMatch = inv.email && inv.email.toLowerCase().includes(query);
            const idMatch = String(inv.id).includes(query) || (inv.unique_id && inv.unique_id.toLowerCase().includes(query));
            return emailMatch || idMatch;
          });

          res.writeHead(200);
          res.end(JSON.stringify({
            count: matched.length,
            invoices: matched.slice(0, 10).map(inv => ({
              id: inv.id,
              unique_id: inv.unique_id,
              status: inv.status,
              price: inv.price,
              currency: inv.currency,
              gateway: (inv.payment_method && inv.payment_method.name) || inv.gateway,
              created_at: inv.created_at,
              completed_at: inv.completed_at,
              email: inv.email ? inv.email.replace(/(.{2})(.*)(?=@)/, (gp1, gp2, gp3) => gp2 + '*'.repeat(gp3.length)) : 'N/A'
            }))
          }));
        } catch (e) {
          res.writeHead(500);
          res.end(JSON.stringify({ error: 'Failed to query invoices from SellAuth', details: e.message }));
        }
      });
      return;
    }

    // 6. Reseller Application
    if (pathname === '/api/reseller/apply' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', async () => {
        try {
          const data = JSON.parse(body || '{}');
          console.log('[RESELLER APPLICATION RECEIVED]', data);
          const appId = 'RES-' + Math.random().toString(36).substring(2, 8).toUpperCase();

          // Dispatch directly to configured Discord Webhook
          await sendDiscordWebhook(data, appId);

          res.writeHead(200);
          res.end(JSON.stringify({
            success: true,
            applicationId: appId,
            message: 'Application recorded and forwarded to our Discord team! Join discord.gg/cla-ude to finalize.'
          }));
        } catch (e) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Invalid application payload' }));
        }
      });
      return;
    }

    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Endpoint not found' }));
    return;
  }

  // Static File Serving
  let filePath = path.join(BASE_DIR, pathname === '/' ? 'index.html' : pathname);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      filePath = path.join(BASE_DIR, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error loading file: ' + readErr.message);
        return;
      }
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache'
      });
      res.end(content);
    });
  });
});

server.listen(PORT, () => {
  console.log(`[CLAUDE CHEATS] Storefront running at http://localhost:${PORT}`);
  console.log(`[CLAUDE CHEATS] Connected to SellAuth Shop #${SHOP_ID}`);
});
