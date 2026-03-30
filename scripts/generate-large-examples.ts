import { encode } from "@msgpack/msgpack";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const examplesDir = join(import.meta.dir, "../src/benchmark/examples");

// ─── Seeded pseudo-random for deterministic output ───────────────────────────
let seed = 42;
function rand(): number {
	seed = (seed * 1664525 + 1013904223) & 0x7fffffff;
	return seed / 0x7fffffff;
}
function randInt(min: number, max: number): number {
	return Math.floor(rand() * (max - min + 1)) + min;
}
function randFloat(min: number, max: number, decimals = 2): number {
	return Number.parseFloat((rand() * (max - min) + min).toFixed(decimals));
}
function pick<T>(arr: T[]): T {
	return arr[randInt(0, arr.length - 1)];
}
function pickN<T>(arr: T[], n: number): T[] {
	const shuffled = [...arr].sort(() => rand() - 0.5);
	return shuffled.slice(0, n);
}

// ─── Product Catalog Data ────────────────────────────────────────────────────

const categories: Record<string, { subcategories: string[]; brands: string[]; products: { name: string; desc: string; tags: string[] }[] }> = {
	Furniture: {
		subcategories: ["Office Chairs", "Desks", "Bookshelves", "Filing Cabinets", "Tables"],
		brands: ["ErgoMax", "SteelCase", "Herman Miller", "Uplift", "Autonomous"],
		products: [
			{ name: "Ergonomic Mesh Office Chair", desc: "Premium ergonomic office chair with breathable mesh back, adjustable lumbar support, and 4D armrests. Designed for all-day comfort during long work sessions. Features a synchronized tilt mechanism and adjustable headrest.", tags: ["ergonomic", "mesh", "adjustable", "office", "lumbar-support"] },
			{ name: "Executive Leather Desk Chair", desc: "Luxurious executive chair upholstered in genuine top-grain leather with memory foam cushioning. Features a high back design, padded armrests, and a heavy-duty base rated for 300 lbs.", tags: ["executive", "leather", "premium", "office", "memory-foam"] },
			{ name: "Standing Desk Pro 60-inch", desc: "Electric height-adjustable standing desk with a spacious 60-inch bamboo top. Three programmable height presets, anti-collision technology, and integrated cable management tray.", tags: ["standing-desk", "electric", "adjustable", "bamboo", "ergonomic"] },
			{ name: "L-Shaped Corner Desk", desc: "Spacious L-shaped desk with powder-coated steel frame and engineered wood top. Includes a monitor shelf, headphone hook, and cable grommets. Fits perfectly in corner setups.", tags: ["l-shaped", "corner", "spacious", "steel-frame", "office"] },
			{ name: "Industrial Bookshelf 5-Tier", desc: "Rustic industrial bookshelf with five sturdy tiers of reclaimed wood shelves and a black metal pipe frame. Each shelf supports up to 50 lbs. Easy assembly required.", tags: ["bookshelf", "industrial", "rustic", "reclaimed-wood", "storage"] },
			{ name: "Mobile File Cabinet", desc: "Three-drawer mobile file cabinet on smooth-rolling casters with a locking mechanism. Fits under most desks. Steel construction with a scratch-resistant powder coat finish.", tags: ["file-cabinet", "mobile", "locking", "steel", "office"] },
			{ name: "Conference Table 8-Seat", desc: "Modern oval conference table seating up to 8 people. Features a built-in power hub with USB-C ports and an integrated cable channel. Walnut veneer over solid wood core.", tags: ["conference", "table", "meeting", "walnut", "power-hub"] },
			{ name: "Kneeling Chair Ergonomic", desc: "Ergonomic kneeling chair that promotes active sitting and proper spinal alignment. Adjustable height with thick foam padding covered in breathable fabric. Ideal for posture correction.", tags: ["kneeling", "ergonomic", "posture", "adjustable", "active-sitting"] },
		],
	},
	Electronics: {
		subcategories: ["Laptops", "Monitors", "Audio", "Cameras", "Networking"],
		brands: ["TechVault", "NovaPeak", "PixelForge", "SoundWave", "NetCore"],
		products: [
			{ name: "4K Ultra-Wide Monitor 34\"", desc: "34-inch curved ultra-wide monitor with 3440x1440 resolution, 165Hz refresh rate, and 1ms response time. HDR600 certified with 98% DCI-P3 color coverage. USB-C hub with 90W power delivery.", tags: ["monitor", "ultrawide", "4k", "curved", "hdr"] },
			{ name: "Wireless Noise-Cancelling Headphones", desc: "Premium wireless headphones with adaptive ANC, 40-hour battery life, and multipoint Bluetooth 5.3. Hi-Res Audio certified with LDAC codec support. Foldable design with premium carrying case.", tags: ["headphones", "wireless", "anc", "bluetooth", "hi-res"] },
			{ name: "Mechanical Gaming Keyboard", desc: "Full-size mechanical keyboard with Cherry MX Brown switches, per-key RGB backlighting, and hot-swappable sockets. PBT double-shot keycaps with a detachable USB-C braided cable.", tags: ["keyboard", "mechanical", "gaming", "rgb", "cherry-mx"] },
			{ name: "Thunderbolt 4 Dock Pro", desc: "Professional-grade Thunderbolt 4 docking station with dual 4K@60Hz display output, 2.5GbE Ethernet, and 96W laptop charging. Includes SD/microSD card reader and front/rear USB-A ports.", tags: ["dock", "thunderbolt", "usb-c", "professional", "charging"] },
			{ name: "Portable SSD 2TB", desc: "Ultra-fast portable SSD with 2TB capacity, delivering read speeds up to 2000MB/s over USB 3.2 Gen 2x2. IP65 water and dust resistant with a rugged aluminum enclosure.", tags: ["ssd", "portable", "fast", "rugged", "usb-c"] },
			{ name: "Streaming Webcam 4K HDR", desc: "Professional 4K webcam with HDR, auto-framing AI, and a built-in privacy shutter. Dual stereo microphones with noise reduction. Compatible with all major video conferencing platforms.", tags: ["webcam", "4k", "hdr", "streaming", "ai-framing"] },
			{ name: "Wi-Fi 7 Mesh Router System", desc: "Tri-band Wi-Fi 7 mesh system covering up to 7,500 sq ft. Supports speeds up to 33Gbps with MLO technology. Includes three nodes with 10GbE WAN ports and built-in VPN server.", tags: ["router", "wifi7", "mesh", "tri-band", "networking"] },
			{ name: "USB-C Power Bank 26800mAh", desc: "High-capacity power bank with 26,800mAh battery and 140W USB-C PD output. Can charge a MacBook Pro at full speed. Features pass-through charging and a digital display.", tags: ["power-bank", "usb-c", "portable", "fast-charge", "high-capacity"] },
		],
	},
	Kitchen: {
		subcategories: ["Appliances", "Cookware", "Utensils", "Storage", "Bakeware"],
		brands: ["ChefPro", "KitchenCraft", "CulinaryEdge", "HomeHarvest", "BrewMaster"],
		products: [
			{ name: "Smart Air Fryer 6-Quart", desc: "Wi-Fi connected air fryer with 6-quart capacity and 12 preset cooking functions. Companion app with 200+ recipes and remote monitoring. Dishwasher-safe basket with non-stick ceramic coating.", tags: ["air-fryer", "smart", "wifi", "non-stick", "kitchen"] },
			{ name: "Professional Blender 2200W", desc: "Commercial-grade blender with a 2200W motor, 64oz BPA-free pitcher, and variable speed control with pulse. Crushes ice in seconds and blends the smoothest smoothies. Self-cleaning program included.", tags: ["blender", "professional", "powerful", "bpa-free", "commercial"] },
			{ name: "Cast Iron Dutch Oven 7Qt", desc: "Enameled cast iron Dutch oven with 7-quart capacity. Even heat distribution for braising, baking, and slow cooking. Oven safe to 500F with a self-basting lid design.", tags: ["dutch-oven", "cast-iron", "enameled", "braising", "oven-safe"] },
			{ name: "Espresso Machine Dual Boiler", desc: "Semi-automatic espresso machine with dual boilers for simultaneous brewing and steaming. PID temperature control, 58mm portafilter, and 15-bar Italian pump. Includes tamper and milk jug.", tags: ["espresso", "dual-boiler", "semi-auto", "pid", "coffee"] },
			{ name: "Japanese Chef Knife 8-inch", desc: "Hand-forged 8-inch chef knife with a 67-layer Damascus steel blade and a VG-10 steel core. Pakkawood handle with a full tang design. Comes in a premium wooden gift box.", tags: ["knife", "chef", "damascus", "japanese", "vg10"] },
			{ name: "Sous Vide Precision Cooker", desc: "Bluetooth-enabled sous vide immersion circulator with 0.1F temperature accuracy. 1100W heating element for quick water heating. Adjustable clamp fits pots up to 10 inches deep.", tags: ["sous-vide", "precision", "bluetooth", "cooking", "immersion"] },
			{ name: "Airtight Food Storage Set 24pc", desc: "24-piece airtight food storage container set with snap-lock lids and silicone seals. BPA-free Tritan plastic. Microwave, freezer, and dishwasher safe. Stackable design saves space.", tags: ["storage", "airtight", "bpa-free", "stackable", "containers"] },
			{ name: "Induction Cooktop Portable", desc: "Portable single-burner induction cooktop with 1800W power and 10 temperature settings. Timer function up to 3 hours. Compatible with all induction-ready cookware. Child safety lock included.", tags: ["induction", "portable", "cooktop", "electric", "compact"] },
		],
	},
	Clothing: {
		subcategories: ["Outerwear", "Shirts", "Pants", "Activewear", "Accessories"],
		brands: ["NorthPeak", "UrbanThread", "FlexFit", "TrailRunner", "WoolCraft"],
		products: [
			{ name: "Merino Wool Base Layer", desc: "Lightweight merino wool base layer top with temperature regulation and natural odor resistance. Flatlock seams prevent chafing during all-day wear. UPF 50+ sun protection.", tags: ["merino", "base-layer", "wool", "temperature-regulation", "odor-resistant"] },
			{ name: "Waterproof Hiking Jacket", desc: "3-layer Gore-Tex waterproof jacket with fully sealed seams and adjustable hood. Pit zips for ventilation, multiple zippered pockets, and a stuff sack for compact storage.", tags: ["waterproof", "gore-tex", "hiking", "jacket", "outdoor"] },
			{ name: "Stretch Performance Chinos", desc: "Tailored-fit chinos with 4-way stretch fabric for unrestricted movement. Wrinkle-resistant with moisture-wicking technology. Suitable for office wear or casual outings.", tags: ["chinos", "stretch", "performance", "wrinkle-resistant", "tailored"] },
			{ name: "Down Insulated Vest", desc: "Lightweight 800-fill goose down vest with water-resistant ripstop nylon shell. Elastic binding at armholes and hem. Packs into its own internal pocket for travel convenience.", tags: ["vest", "down", "insulated", "packable", "lightweight"] },
			{ name: "Trail Running Shoes", desc: "Aggressive trail running shoes with Vibram Megagrip outsole and responsive midsole foam. Rock plate protection, gusseted tongue to keep debris out, and reflective accents for visibility.", tags: ["trail-running", "shoes", "vibram", "grip", "protective"] },
			{ name: "Organic Cotton T-Shirt Pack", desc: "3-pack of premium organic cotton t-shirts with a relaxed fit. Pre-shrunk and garment-dyed for a lived-in feel. Reinforced collar that won't stretch or sag after washing.", tags: ["t-shirt", "organic", "cotton", "pack", "relaxed-fit"] },
			{ name: "Technical Cargo Pants", desc: "Ripstop nylon cargo pants with articulated knees and a gusseted crotch for full range of motion. DWR coating repels light rain. Six secure pockets including hidden zippered thigh pocket.", tags: ["cargo", "technical", "ripstop", "dwr", "articulated"] },
			{ name: "Cashmere Crew Neck Sweater", desc: "Luxuriously soft 100% Grade-A Mongolian cashmere sweater with a classic crew neck. Rib-knit cuffs and hem for a polished look. Lightweight enough for layering in transitional seasons.", tags: ["cashmere", "sweater", "luxury", "crew-neck", "mongolian"] },
		],
	},
	Sports: {
		subcategories: ["Fitness", "Cycling", "Camping", "Water Sports", "Team Sports"],
		brands: ["PeakPower", "TrailBlazer", "AquaForce", "IronGrip", "SwiftStrike"],
		products: [
			{ name: "Adjustable Dumbbell Set 55lb", desc: "Space-saving adjustable dumbbell set replacing 15 sets of weights. Quick-change mechanism adjusts from 5 to 55 lbs in 2.5 lb increments. Steel plates with durable rubber coating.", tags: ["dumbbell", "adjustable", "weightlifting", "home-gym", "space-saving"] },
			{ name: "Carbon Fiber Road Bike", desc: "Lightweight carbon fiber road bike with Shimano 105 groupset and hydraulic disc brakes. Internal cable routing for a clean look. Tubeless-ready wheelset with 28mm tires.", tags: ["bike", "carbon", "road", "shimano", "disc-brakes"] },
			{ name: "Ultralight Backpacking Tent 2P", desc: "Two-person ultralight backpacking tent weighing just 2.8 lbs packed. Freestanding design with full rain fly. Double-wall construction prevents condensation. Sets up in under 5 minutes.", tags: ["tent", "ultralight", "backpacking", "2-person", "freestanding"] },
			{ name: "Inflatable Stand-Up Paddleboard", desc: "Premium inflatable SUP with military-grade PVC construction. Includes adjustable carbon fiber paddle, high-pressure pump, and wheeled carry bag. Supports riders up to 275 lbs.", tags: ["paddleboard", "inflatable", "sup", "water-sports", "portable"] },
			{ name: "Yoga Mat Premium 6mm", desc: "Eco-friendly yoga mat made from natural tree rubber with a microfiber suede top. 6mm thickness provides joint cushioning. Non-slip grip improves with moisture. Includes carrying strap.", tags: ["yoga", "mat", "eco-friendly", "non-slip", "rubber"] },
			{ name: "GPS Sports Watch Multi-Sport", desc: "Multi-sport GPS watch with wrist-based heart rate, blood oxygen sensor, and 14-day battery life. Supports 30+ activity profiles including triathlon. Built-in maps and music storage.", tags: ["watch", "gps", "multi-sport", "heart-rate", "fitness"] },
			{ name: "Resistance Bands Set Pro", desc: "Professional resistance bands set with 5 color-coded bands from 10 to 50 lbs. Includes door anchor, ankle straps, and foam handles. Latex-free TPE material for allergy safety.", tags: ["resistance-bands", "exercise", "portable", "latex-free", "home-gym"] },
			{ name: "Foam Roller High-Density", desc: "High-density EPP foam roller with a textured surface for deep tissue massage. 18-inch length is perfect for travel and targeted muscle groups. Supports up to 500 lbs without deformation.", tags: ["foam-roller", "recovery", "massage", "high-density", "portable"] },
		],
	},
	Books: {
		subcategories: ["Programming", "Design", "Business", "Science", "Literature"],
		brands: ["O'Reilly", "Pragmatic", "Manning", "Addison-Wesley", "No Starch Press"],
		products: [
			{ name: "TypeScript Design Patterns", desc: "Comprehensive guide to applying classic and modern design patterns in TypeScript. Covers creational, structural, and behavioral patterns with real-world examples from production applications.", tags: ["typescript", "design-patterns", "programming", "software-engineering", "reference"] },
			{ name: "Systems Design Interview Guide", desc: "In-depth preparation guide for systems design interviews. Covers distributed systems, caching, load balancing, and database sharding with detailed diagrams and step-by-step solutions.", tags: ["systems-design", "interview", "distributed-systems", "engineering", "career"] },
			{ name: "Rust Programming Handbook", desc: "Complete handbook for learning Rust from scratch. Covers ownership, lifetimes, async/await, and unsafe code. Includes 50+ exercises with solutions and a capstone project building a web server.", tags: ["rust", "programming", "handbook", "systems", "performance"] },
			{ name: "Data Visualization Principles", desc: "Essential guide to creating effective data visualizations. Covers color theory, chart selection, cognitive load, and accessibility. Includes case studies from journalism, science, and business.", tags: ["data-viz", "design", "charts", "accessibility", "reference"] },
			{ name: "Machine Learning Engineering", desc: "Practical guide to deploying ML models in production. Covers feature stores, model serving, A/B testing, monitoring drift, and MLOps pipelines. Written for engineers, not researchers.", tags: ["machine-learning", "mlops", "engineering", "production", "deployment"] },
			{ name: "The Art of PostgreSQL", desc: "Advanced PostgreSQL techniques including window functions, CTEs, JSONB operations, and full-text search. Demonstrates how to push logic into the database for simpler application code.", tags: ["postgresql", "database", "sql", "advanced", "backend"] },
			{ name: "Refactoring Legacy Code", desc: "Strategies for safely refactoring legacy codebases without introducing regressions. Covers characterization testing, the strangler fig pattern, and incremental migration approaches.", tags: ["refactoring", "legacy", "testing", "software-engineering", "maintenance"] },
			{ name: "Web Performance Optimization", desc: "Complete guide to making websites blazing fast. Covers Core Web Vitals, image optimization, code splitting, edge caching, and rendering strategies. Before/after case studies with measurable results.", tags: ["performance", "web", "optimization", "core-web-vitals", "frontend"] },
		],
	},
	Tools: {
		subcategories: ["Power Tools", "Hand Tools", "Measuring", "Safety", "Organization"],
		brands: ["MakerPro", "CraftForce", "PrecisionTool", "BuildRight", "WorkShield"],
		products: [
			{ name: "Cordless Drill Driver 20V", desc: "Brushless 20V cordless drill driver with 2-speed gearbox delivering up to 530 in-lbs of torque. Includes two 4.0Ah lithium-ion batteries, charger, and 30-piece bit set in a hard case.", tags: ["drill", "cordless", "brushless", "20v", "power-tool"] },
			{ name: "Digital Laser Level 360", desc: "Self-leveling 360-degree laser level with green beam technology visible up to 100ft. Pulse mode for use with detector. Includes magnetic mount, target plate, and padded carrying case.", tags: ["laser-level", "digital", "360", "self-leveling", "measuring"] },
			{ name: "Oscillating Multi-Tool Kit", desc: "Variable-speed oscillating multi-tool with tool-free blade change system. Includes 40 accessories for cutting, sanding, scraping, and grinding. Powerful 4.0-amp motor with soft-grip handle.", tags: ["multi-tool", "oscillating", "versatile", "cutting", "sanding"] },
			{ name: "Digital Caliper Stainless Steel", desc: "6-inch digital caliper with 0.0005-inch resolution and stainless steel construction. Measures inside, outside, depth, and step dimensions. IP54 rated for workshop environments.", tags: ["caliper", "digital", "precision", "stainless-steel", "measuring"] },
			{ name: "Portable Table Saw 10-inch", desc: "Compact 10-inch table saw with 25.5-inch rip capacity and a 15-amp motor. Rack and pinion fence system ensures accurate cuts. Folding stand with 8-inch wheels for jobsite mobility.", tags: ["table-saw", "portable", "10-inch", "power-tool", "woodworking"] },
			{ name: "Professional Socket Set 200pc", desc: "200-piece professional socket set with metric and SAE sizes. Chrome vanadium steel construction with mirror-polish finish. Includes ratchets, extensions, universal joints, and a blow-molded case.", tags: ["socket-set", "professional", "chrome-vanadium", "metric", "sae"] },
			{ name: "Cordless Impact Wrench 1/2\"", desc: "High-torque 20V cordless impact wrench delivering 1200 ft-lbs of nut-busting torque. Brushless motor with 3-speed settings. Compact design fits in tight spaces. Hog ring anvil for quick socket changes.", tags: ["impact-wrench", "cordless", "high-torque", "brushless", "automotive"] },
			{ name: "Workbench with Pegboard", desc: "Heavy-duty steel workbench with a 60x24 inch solid wood top rated for 1500 lbs. Includes full-width pegboard, drawer, and lower shelf. Adjustable leveling feet for uneven floors.", tags: ["workbench", "heavy-duty", "steel", "pegboard", "workshop"] },
		],
	},
	"Home Decor": {
		subcategories: ["Lighting", "Rugs", "Wall Art", "Plants", "Textiles"],
		brands: ["LuminArt", "CozyHome", "NatureCraft", "DesignHaus", "ThreadLux"],
		products: [
			{ name: "Smart LED Floor Lamp", desc: "Wi-Fi enabled floor lamp with 16 million color options and tunable white from 2200K to 6500K. Voice control via Alexa and Google Home. Dimmable with a sleek brushed brass finish.", tags: ["lamp", "smart", "led", "wifi", "dimmable"] },
			{ name: "Hand-Knotted Persian Rug 8x10", desc: "Authentic hand-knotted Persian rug crafted from 100% New Zealand wool. Traditional medallion design with rich jewel tones. Each rug is unique with slight variations that add character.", tags: ["rug", "persian", "hand-knotted", "wool", "traditional"] },
			{ name: "Macrame Wall Hanging Large", desc: "Handcrafted macrame wall hanging made from 100% natural cotton rope. Bohemian design measuring 36 inches wide by 48 inches long. Mounted on a smooth driftwood dowel.", tags: ["macrame", "wall-hanging", "handcrafted", "bohemian", "cotton"] },
			{ name: "Ceramic Planter Set Modern", desc: "Set of 3 modern ceramic planters in matte finish with bamboo saucers. Drainage holes prevent overwatering. Available in terracotta, sage green, and cream white. Fits 4, 6, and 8 inch pots.", tags: ["planter", "ceramic", "modern", "set", "bamboo"] },
			{ name: "Linen Blackout Curtains Pair", desc: "Pair of 100% European linen blackout curtains with a thermal insulating lining. Blocks 99% of light while maintaining a natural textured look. Rod pocket and back tab hanging options.", tags: ["curtains", "linen", "blackout", "thermal", "european"] },
			{ name: "Floating Shelves Walnut Set", desc: "Set of 3 floating shelves crafted from solid walnut with a hand-rubbed oil finish. Hidden bracket mounting system for a clean floating appearance. Supports up to 30 lbs each.", tags: ["shelves", "floating", "walnut", "solid-wood", "minimal"] },
			{ name: "Scented Candle Collection", desc: "Luxury scented candle collection with three 12oz soy wax candles in hand-blown glass vessels. Scents include bergamot & cedar, sea salt & driftwood, and fig & cassis. 60-hour burn time each.", tags: ["candle", "scented", "soy-wax", "luxury", "hand-blown"] },
			{ name: "Woven Throw Blanket Chunky", desc: "Chunky hand-woven throw blanket made from premium acrylic yarn. Oversized 50x70 inch dimensions. Machine washable and hypoallergenic. Perfect for layering on sofas and beds.", tags: ["throw", "blanket", "chunky", "woven", "cozy"] },
		],
	},
};

const colors = ["Black", "White", "Gray", "Navy", "Red", "Green", "Blue", "Walnut", "Silver", "Charcoal", "Natural", "Cream", "Olive", "Burgundy", "Slate"];
const sizes = ["Small", "Standard", "Medium", "Large", "XL", "One Size", "Compact", "Full"];
const warehouses = ["US-WEST", "US-EAST", "US-CENTRAL", "EU-WEST", "EU-CENTRAL", "APAC"];
const materials = ["Aluminum", "Steel", "Wood", "Plastic", "Carbon Fiber", "Nylon", "Mesh", "Leather", "Fabric", "Rubber", "Ceramic", "Glass"];
const firstNames = ["John", "Sarah", "Mike", "Emily", "David", "Lisa", "James", "Anna", "Robert", "Jessica", "Chris", "Amanda", "Daniel", "Rachel", "Andrew", "Michelle", "Kevin", "Laura", "Brian", "Nicole"];
const reviewTitlesGood = ["Best purchase ever", "Exceeded expectations", "Worth every penny", "Highly recommend", "Five stars all the way", "Love this product", "Game changer", "Outstanding quality", "Perfect fit", "Absolutely fantastic"];
const reviewTitlesMeh = ["Decent but not perfect", "Good enough for the price", "Some issues but OK", "Mixed feelings", "Solid but nothing special"];
const reviewBodiesGood = [
	"After extensive research, I'm so glad I went with this. The quality is outstanding and it arrived in perfect condition.",
	"This has completely transformed my daily routine. I can't imagine going back to what I was using before.",
	"Bought this as a gift and ended up getting one for myself too. Everyone loves it.",
	"The build quality is exceptional. You can tell this was designed by people who actually use these products.",
	"Setup was straightforward and everything works exactly as described. Very pleased with this purchase.",
];
const reviewBodiesMeh = [
	"It's fine for what it is, but I expected a bit more polish at this price point.",
	"Works as advertised but the build quality could be better. Wouldn't buy the premium version.",
	"Decent product but the instructions were confusing and setup took longer than expected.",
];

function generateProduct(index: number) {
	const categoryKeys = Object.keys(categories);
	const catName = categoryKeys[index % categoryKeys.length];
	const cat = categories[catName];
	const product = cat.products[index % cat.products.length];
	const brand = cat.brands[index % cat.brands.length];
	const subcategory = cat.subcategories[index % cat.subcategories.length];

	const id = `prod_${String(index + 1).padStart(3, "0")}`;
	const price = randFloat(9.99, 2499.99);
	const compareAtPrice = Number.parseFloat((price * randFloat(1.1, 1.4)).toFixed(2));
	const ratingAvg = randFloat(3.2, 5.0, 1);
	const ratingCount = randInt(50, 5000);
	const r5 = Math.round(ratingCount * randFloat(0.4, 0.7));
	const r4 = Math.round(ratingCount * randFloat(0.1, 0.3));
	const r3 = Math.round(ratingCount * randFloat(0.03, 0.1));
	const r2 = Math.round(ratingCount * randFloat(0.01, 0.05));
	const r1 = ratingCount - r5 - r4 - r3 - r2;

	const numVariants = randInt(2, 4);
	const variantColors = pickN(colors, numVariants);
	const variantSize = pick(sizes);
	const variants = variantColors.map((color, vi) => ({
		id: `var_${id}_${String.fromCharCode(97 + vi)}`,
		color,
		size: variantSize,
		sku: `SKU-${catName.toUpperCase().replace(/ /g, "")}-${String(index + 1).padStart(3, "0")}-${color.toUpperCase().replace(/ /g, "").slice(0, 3)}`,
		price: vi === 0 ? price : Number.parseFloat((price + randFloat(-20, 50)).toFixed(2)),
		inStock: rand() > 0.15,
	}));

	const numReviews = randInt(1, 3);
	const reviews = Array.from({ length: numReviews }, (_, ri) => {
		const rating = randInt(3, 5);
		const isGood = rating >= 4;
		return {
			author: `${pick(firstNames)} ${String.fromCharCode(65 + randInt(0, 25))}.`,
			rating,
			title: isGood ? pick(reviewTitlesGood) : pick(reviewTitlesMeh),
			body: isGood ? pick(reviewBodiesGood) : pick(reviewBodiesMeh),
			date: `2024-${String(randInt(1, 12)).padStart(2, "0")}-${String(randInt(1, 28)).padStart(2, "0")}`,
			verified: rand() > 0.2,
		};
	});

	const numImages = randInt(2, 4);
	const images = Array.from({ length: numImages }, (_, ii) => {
		const views = ["main", "side", "back", "detail", "close-up", "lifestyle"];
		return `https://cdn.example.com/products/${id}/${views[ii % views.length]}.jpg`;
	});

	const quantity = randInt(0, 800);
	const inStock = quantity > 0;

	const specMats = pickN(materials, randInt(2, 4));
	const year = randInt(2023, 2024);
	const month = randInt(1, 12);
	const day = randInt(1, 28);

	return {
		id,
		sku: `SKU-${catName.toUpperCase().replace(/ /g, "").slice(0, 4)}-${String(index + 1).padStart(3, "0")}`,
		name: product.name,
		description: product.desc,
		price,
		compareAtPrice,
		currency: "USD",
		category: catName,
		subcategory,
		brand,
		tags: product.tags,
		images,
		rating: {
			average: ratingAvg,
			count: ratingCount,
			distribution: { "5": Math.abs(r5), "4": Math.abs(r4), "3": Math.abs(r3), "2": Math.abs(r2), "1": Math.abs(r1) },
		},
		inventory: { inStock, quantity, warehouse: pick(warehouses) },
		variants,
		specifications: {
			weight: `${randFloat(0.2, 30, 1)} kg`,
			dimensions: `${randInt(10, 120)} x ${randInt(10, 120)} x ${randInt(5, 150)} cm`,
			material: specMats.join(", "),
			maxWeight: `${randInt(50, 300)} kg`,
			warranty: `${pick(["1", "2", "3", "5", "10"])} years`,
		},
		reviews,
		createdAt: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T${String(randInt(0, 23)).padStart(2, "0")}:${String(randInt(0, 59)).padStart(2, "0")}:00Z`,
		updatedAt: `2024-${String(randInt(1, 12)).padStart(2, "0")}-${String(randInt(1, 28)).padStart(2, "0")}T${String(randInt(0, 23)).padStart(2, "0")}:${String(randInt(0, 59)).padStart(2, "0")}:00Z`,
	};
}

// ─── Analytics Data ──────────────────────────────────────────────────────────

const topPagePaths = ["/", "/products", "/checkout", "/cart", "/about", "/blog", "/pricing", "/contact", "/docs", "/signup", "/login", "/dashboard", "/settings", "/search", "/categories"];

function generateAnalyticsDay(dateStr: string, dayOfYear: number, dayOfWeek: number) {
	// Seasonal trend: higher in Q4, lower in Q1
	const seasonalMultiplier = 0.8 + 0.4 * Math.sin((dayOfYear - 80) * (2 * Math.PI / 365));
	// Weekend dip
	const weekendMultiplier = dayOfWeek === 0 || dayOfWeek === 6 ? 0.65 : 1.0;
	// Weekly variation
	const dayVariation = 1 + (rand() - 0.5) * 0.3;
	const baseMultiplier = seasonalMultiplier * weekendMultiplier * dayVariation;

	const pageViews = Math.round(8000 + 8000 * baseMultiplier + randInt(-500, 500));
	const uniqueVisitors = Math.round(pageViews * randFloat(0.3, 0.45));
	const sessions = Math.round(uniqueVisitors * randFloat(1.2, 1.6));
	const newUsers = Math.round(uniqueVisitors * randFloat(0.25, 0.4));
	const returningUsers = uniqueVisitors - newUsers;
	const transactions = Math.round(sessions * randFloat(0.03, 0.08));
	const revenue = Number.parseFloat((transactions * randFloat(35, 120)).toFixed(2));

	const numTopPages = randInt(4, 6);
	const selectedPaths = pickN(topPagePaths, numTopPages);
	const topPages = selectedPaths.map((path) => ({
		path,
		views: randInt(200, Math.round(pageViews * 0.4)),
		avgTime: randFloat(8, 180, 1),
	}));

	const desktop = randFloat(0.45, 0.65);
	const mobile = randFloat(0.25, 0.45);
	const tablet = Number.parseFloat((1 - desktop - mobile).toFixed(2));

	// Hourly traffic: low at night, peak during business hours
	const hourlyBase = [0.02, 0.015, 0.01, 0.008, 0.007, 0.01, 0.03, 0.06, 0.08, 0.1, 0.11, 0.12, 0.115, 0.11, 0.1, 0.09, 0.085, 0.075, 0.06, 0.05, 0.04, 0.035, 0.03, 0.025];
	const hourlyTraffic = hourlyBase.map((base) => Math.round(pageViews * base * (0.8 + rand() * 0.4)));

	return {
		date: dateStr,
		pageViews,
		uniqueVisitors,
		sessions,
		bounceRate: randFloat(0.25, 0.55, 3),
		avgSessionDuration: randFloat(120, 380, 1),
		newUsers,
		returningUsers,
		revenue,
		transactions,
		conversionRate: Number.parseFloat((transactions / sessions).toFixed(4)),
		topPages,
		deviceBreakdown: {
			desktop,
			mobile,
			tablet: Math.max(0.01, tablet),
		},
		hourlyTraffic,
	};
}

// ─── CUE Generation ─────────────────────────────────────────────────────────

function toCueValue(value: unknown, indent: number): string {
	const pad = "  ".repeat(indent);
	const innerPad = "  ".repeat(indent + 1);

	if (value === null || value === undefined) return "null";
	if (typeof value === "boolean") return value ? "true" : "false";
	if (typeof value === "number") return String(value);
	if (typeof value === "string") return JSON.stringify(value);

	if (Array.isArray(value)) {
		if (value.length === 0) return "[]";
		// Check if it's an array of primitives
		const allPrimitive = value.every((v) => typeof v !== "object" || v === null);
		if (allPrimitive) {
			return `[${value.map((v) => toCueValue(v, 0)).join(", ")}]`;
		}
		const items = value.map((v) => `${innerPad}${toCueValue(v, indent + 1)}`);
		return `[${items.join(",")}]`;
	}

	if (typeof value === "object") {
		const entries = Object.entries(value as Record<string, unknown>);
		if (entries.length === 0) return "{}";
		const fields = entries.map(([k, v]) => {
			// CUE keys: quote if they contain special chars
			const key = /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(k) ? k : JSON.stringify(k);
			return `${innerPad}${key}: ${toCueValue(v, indent + 1)}`;
		});
		return `{\n${fields.join("\n")}\n${pad}}`;
	}

	return String(value);
}

function toCue(rootKey: string, data: unknown): string {
	return `${rootKey}: ${toCueValue(data, 0)}\n`;
}

// ─── Msgpack Generation ─────────────────────────────────────────────────────

function writeMsgpack(name: string, data: unknown) {
	const jsonPath = join(examplesDir, `${name}.json`);
	const cuePath = join(examplesDir, `${name}.cue`);
	const msgpackPath = join(examplesDir, `${name}.msgpack`);
	const tsPath = join(examplesDir, `${name}.msgpack.ts`);

	const jsonStr = JSON.stringify(data, null, 2);
	writeFileSync(jsonPath, jsonStr);
	const jsonSize = Buffer.byteLength(jsonStr);

	// Determine CUE root key from structure
	const rootKey = Object.keys(data as Record<string, unknown>)[0];
	const cueStr = toCue(rootKey, (data as Record<string, unknown>)[rootKey]);
	writeFileSync(cuePath, cueStr);
	const cueSize = Buffer.byteLength(cueStr);

	const packed = encode(data);
	writeFileSync(msgpackPath, packed);

	const bytes = Array.from(new Uint8Array(packed));
	const tsContent = [
		"// Auto-generated - do not edit. Run `bun run ./scripts/generate-large-examples.ts` to regenerate.",
		`export default new Uint8Array([${bytes.join(",")}]);`,
		"",
	].join("\n");
	writeFileSync(tsPath, tsContent);

	process.stdout.write(`\n${name}:\n`);
	process.stdout.write(`  JSON:    ${(jsonSize / 1024).toFixed(1)} KB (${jsonSize} bytes)\n`);
	process.stdout.write(`  CUE:     ${(cueSize / 1024).toFixed(1)} KB (${cueSize} bytes)\n`);
	process.stdout.write(`  MsgPack: ${(packed.byteLength / 1024).toFixed(1)} KB (${packed.byteLength} bytes)\n`);
}

// ─── Main ────────────────────────────────────────────────────────────────────

process.stdout.write("Generating large example datasets...\n");

// Example 1: Large Product Catalog
const products = Array.from({ length: 100 }, (_, i) => generateProduct(i));
const productCatalog = { products };
writeMsgpack("large-product-catalog", productCatalog);

// Example 2: Large Analytics Dataset
const startDate = new Date("2024-01-01");
const days = Array.from({ length: 365 }, (_, i) => {
	const date = new Date(startDate);
	date.setDate(date.getDate() + i);
	const dateStr = date.toISOString().split("T")[0];
	const dayOfWeek = date.getDay();
	return generateAnalyticsDay(dateStr, i + 1, dayOfWeek);
});
const analyticsData = { days };
writeMsgpack("large-analytics", analyticsData);

process.stdout.write("\nDone!\n");
