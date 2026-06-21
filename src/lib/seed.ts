// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — Seed Script
// Run with:  npx tsx src/lib/seed.ts
// Clears existing seed data, then inserts:
//   • 3 demo users (cm, dept_head, field_officer)
//   • 5 departments
//   • 200 mock complaints distributed across all 11 Delhi districts
//   • ~60% of complaints have GPS coordinates → appear as dots on the map
// Complaint data is weighted to tell a compelling demo story:
//   East Delhi has the most water issues, South Delhi has road problems, etc.
// ─────────────────────────────────────────────────────────────────────────────

// Env is loaded via --env-file=.env.local in the npm seed script
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { connectDB } from './mongodb'
import User from '@/models/User'
import Department from '@/models/Department'
import Complaint from '@/models/Complaint'
import { getSLADeadline, getPriorityFromScore } from './sla'
import {
  DELHI_DISTRICTS,
  COMPLAINT_CATEGORIES,
  DEMO_USERS,
  DEPARTMENTS,
} from '@/constants'
import type {
  ComplaintCategory,
  ComplaintStatus,
  ComplaintPriority,
} from '@/types'

// ── Helpers ───────────────────────────────────────────────────────────────────

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000)
}

// ── Demo complaint content — makes the demo story believable ─────────────────

const COMPLAINT_TEMPLATES: Record<
  ComplaintCategory,
  { titles: string[]; descriptions: string[] }
> = {
  water: {
    titles: [
      'Water supply disrupted for 3 days',
      'Pipeline burst on main road',
      'No water in taps since morning',
      'Contaminated water supply reported',
      'Low water pressure in entire block',
    ],
    descriptions: [
      'Residents have had no water supply for the past 72 hours. Multiple complaints lodged with local office but no action taken.',
      'A major pipeline has burst near the market area causing flooding and water wastage. Immediate repair needed.',
      'Water supply has been completely cut off since 6 AM. Elderly residents are severely impacted.',
      'Water appears brown and smells bad. Multiple residents have reported stomach illness after consuming it.',
      'Water pressure has dropped significantly. Upper floor residents have no water access at all.',
    ],
  },
  electricity: {
    titles: [
      'Power outage for 12+ hours',
      'Transformer exploded — fire risk',
      'Frequent power cuts affecting hospital',
      'Electrical wires hanging dangerously low',
      'Street lights not working for a week',
    ],
    descriptions: [
      'The entire locality has been without power for over 12 hours. Temperature is extreme and patients on medical equipment are at risk.',
      'Local transformer exploded last night. Area is without power and there is a fire hazard with exposed wires.',
      'The nearby clinic is running on generator due to frequent power cuts. Patient care is being compromised.',
      'High tension wires have snapped and are hanging at head level near the school gate. Extremely dangerous for children.',
      'Street lights in the entire sector have not been working for 7 days. Incidents of theft and road accidents have increased.',
    ],
  },
  roads: {
    titles: [
      'Large pothole causing accidents',
      'Road completely waterlogged after rain',
      'Broken divider on highway causing head-on collisions',
      'Road dug for construction — not repaired for months',
      'Footpath encroached and broken',
    ],
    descriptions: [
      'A massive pothole has caused 3 motorcycle accidents in the past week. One person was seriously injured. Needs urgent repair.',
      'The main arterial road is completely flooded after last night\'s rain. Traffic is stuck for 2 km.',
      'The road divider near the flyover has been broken for months. Two head-on collisions have been reported.',
      'PWD dug the road for pipeline work 4 months ago but never repaired it. The patch has become extremely dangerous.',
      'The footpath has been completely occupied by an unauthorised structure. Pedestrians are forced onto the road.',
    ],
  },
  sanitation: {
    titles: [
      'Garbage not collected for 5 days',
      'Open drain overflowing into street',
      'Illegal dumping ground creating health hazard',
      'Public toilet in deplorable condition',
      'Dead animal on main road — not removed',
    ],
    descriptions: [
      'Garbage collection has not happened for 5 days. The street is overflowing with waste and stray animals are spreading it everywhere.',
      'The main drain is completely choked and sewage is overflowing onto the street and into homes. Dengue risk is high.',
      'An illegal waste dumping ground has been created near the park. Smell and health hazard for 500+ residents.',
      'The public toilet near the bus stand is in an extremely unhygienic state. No cleaning staff assigned for weeks.',
      'A dead cow has been lying on the main road for 2 days. Strong smell and health risk to surrounding area.',
    ],
  },
  health: {
    titles: [
      'Dengue outbreak in locality — no response',
      'Mobile health van not visiting for months',
      'Government dispensary medicines out of stock',
      'Stagnant water causing mosquito breeding',
      'Food poisoning from roadside vendor — action needed',
    ],
    descriptions: [
      'At least 15 confirmed dengue cases in our block. We have requested fogging multiple times but no action from the health department.',
      'The mobile health van that used to visit our area every Tuesday has not come for 3 months. Senior citizens are suffering.',
      'The local government dispensary has been out of basic medicines like paracetamol and antibiotics for 2 weeks.',
      'Water has been stagnant near the park for weeks, creating mosquito breeding grounds. Multiple children have been bitten.',
      'Multiple people fell ill after eating from a roadside vendor near the school. Food safety inspection required urgently.',
    ],
  },
  other: {
    titles: [
      'Encroachment on public land',
      'Noise pollution from illegal factory',
      'Stray dog menace — child bitten',
      'Unauthorised construction blocking road',
      'Tree fallen on power line — dangerous',
    ],
    descriptions: [
      'A private party has encroached on public land near the park and built a permanent structure. Local residents are objecting.',
      'An illegal manufacturing unit is running 24 hours causing severe noise and air pollution in the residential area.',
      'A pack of stray dogs attacked a 7-year-old child near the school. Multiple residents have been bitten in the past month.',
      'A neighbour has started construction that is blocking the service road. Emergency vehicles cannot pass through.',
      'A large tree fell during last night\'s storm and is resting on a live power line. Extremely dangerous situation.',
    ],
  },
}

// ── District weighting — for a compelling demo story ─────────────────────────
// Higher weight = more complaints generated for that district

const DISTRICT_WEIGHTS: Record<string, number> = {
  'East Delhi':       20,  // highest — water crisis story
  'South Delhi':      15,  // road problems
  'North East Delhi': 14,  // sanitation issues
  'West Delhi':       12,
  'North West Delhi': 10,
  'Central Delhi':     9,
  'Shahdara':          8,
  'South West Delhi':  5,
  'North Delhi':       4,
  'New Delhi':         2,
  'South East Delhi':  1,
}

// ── Category weighting per district — for story coherence ───────────────────

const DISTRICT_CATEGORY_BIAS: Record<string, ComplaintCategory> = {
  'East Delhi':       'water',
  'South Delhi':      'roads',
  'North East Delhi': 'sanitation',
  'West Delhi':       'electricity',
  'North West Delhi': 'health',
  'Central Delhi':    'roads',
  'Shahdara':         'sanitation',
  'South West Delhi': 'water',
  'North Delhi':      'electricity',
  'New Delhi':        'other',
  'South East Delhi': 'health',
}

// ── District bounding boxes (approximate) — used to generate realistic dots ──
// Each entry: [minLat, maxLat, minLng, maxLng]

const DISTRICT_BOUNDS: Record<string, [number, number, number, number]> = {
  'Central Delhi':    [28.630, 28.680, 77.195, 77.250],
  'East Delhi':       [28.620, 28.680, 77.280, 77.360],
  'New Delhi':        [28.580, 28.640, 77.170, 77.230],
  'North Delhi':      [28.680, 28.760, 77.180, 77.260],
  'North East Delhi': [28.670, 28.740, 77.280, 77.360],
  'North West Delhi': [28.680, 28.780, 77.060, 77.190],
  'Shahdara':         [28.660, 28.730, 77.280, 77.340],
  'South Delhi':      [28.490, 28.580, 77.170, 77.310],
  'South East Delhi': [28.530, 28.610, 77.270, 77.360],
  'South West Delhi': [28.490, 28.580, 77.060, 77.180],
  'West Delhi':       [28.610, 28.690, 77.050, 77.160],
}

function randCoord(min: number, max: number): number {
  return parseFloat((min + Math.random() * (max - min)).toFixed(6))
}

function districtCoordinates(district: string): { lat: number; lng: number } | null {
  // ~60% of complaints get coordinates — makes the map dot layer interesting
  // but not every single complaint (mirrors real-world GPS adoption)
  if (Math.random() > 0.60) return null

  const bounds = DISTRICT_BOUNDS[district]
  if (!bounds) return null

  const [minLat, maxLat, minLng, maxLng] = bounds
  return {
    lat: randCoord(minLat, maxLat),
    lng: randCoord(minLng, maxLng),
  }
}

function weightedDistrict(): string {
  const entries = Object.entries(DISTRICT_WEIGHTS)
  const total   = entries.reduce((sum, [, w]) => sum + w, 0)
  let   rand    = Math.random() * total
  for (const [district, weight] of entries) {
    rand -= weight
    if (rand <= 0) return district
  }
  return entries[0][0]
}

function pickCategory(district: string): ComplaintCategory {
  // 60% chance of district's biased category, 40% random
  if (Math.random() < 0.6) return DISTRICT_CATEGORY_BIAS[district] ?? 'other'
  return pick(COMPLAINT_CATEGORIES).value
}

// ── Status distribution — makes dashboard interesting ────────────────────────

const STATUS_DISTRIBUTION: { status: ComplaintStatus; weight: number }[] = [
  { status: 'open',        weight: 35 },
  { status: 'in_progress', weight: 25 },
  { status: 'assigned',    weight: 15 },
  { status: 'resolved',    weight: 20 },
  { status: 'escalated',   weight: 5  },
]

function pickStatus(): ComplaintStatus {
  const total = STATUS_DISTRIBUTION.reduce((s, x) => s + x.weight, 0)
  let rand    = Math.random() * total
  for (const { status, weight } of STATUS_DISTRIBUTION) {
    rand -= weight
    if (rand <= 0) return status
  }
  return 'open'
}

// ── Main Seed ─────────────────────────────────────────────────────────────────

async function seed() {
  console.log('🌱 Connecting to MongoDB...')
  await connectDB()

  // ── Clear existing seed collections ──────────────────────────────────────
  console.log('🗑️  Clearing existing data...')
  await Promise.all([
    User.deleteMany({}),
    Department.deleteMany({}),
    Complaint.deleteMany({}),
  ])

  // ── Seed users ────────────────────────────────────────────────────────────
  console.log('👤 Seeding users...')
  const hashedUsers = await Promise.all(
    DEMO_USERS.map(async (u) => ({
      name:       u.name,
      email:      u.email,
      password:   await bcrypt.hash(u.password, 10),
      role:       u.role,
      department: u.role === 'dept_head' ? 'water' : undefined,
    }))
  )
  await User.insertMany(hashedUsers)
  console.log(`   ✓ ${hashedUsers.length} users created`)

  // ── Seed departments ──────────────────────────────────────────────────────
  console.log('🏢 Seeding departments...')
  const deptDocs = DEPARTMENTS.map((d) => ({
    name:              d.name,
    slug:              d.slug,
    headName:          `Head of ${d.name}`,
    grade:             pick(['A', 'A-', 'B+', 'B', 'C']),
    slaComplianceRate: randInt(65, 98),
    avgResolutionDays: parseFloat((Math.random() * 4 + 0.5).toFixed(1)),
    openCount:         randInt(20, 300),
    resolvedCount:     randInt(100, 1000),
    lastUpdated:       new Date(),
  }))
  // Give water dept the worst stats — supports East Delhi water crisis story
  const waterDept = deptDocs.find((d) => d.slug === 'water')
  if (waterDept) {
    waterDept.grade             = 'C'
    waterDept.slaComplianceRate = 62
    waterDept.avgResolutionDays = 3.8
  }
  await Department.insertMany(deptDocs)
  console.log(`   ✓ ${deptDocs.length} departments created`)

  // ── Seed complaints ───────────────────────────────────────────────────────
  console.log('📋 Seeding 200 complaints...')
  const complaints = []

  for (let i = 0; i < 200; i++) {
    const district  = weightedDistrict()
    const category  = pickCategory(district)
    const status    = pickStatus()
    const templates = COMPLAINT_TEMPLATES[category]
    const titleIdx  = randInt(0, templates.titles.length - 1)
    const createdAt = daysAgo(randInt(0, 30))

    // AI-like priority scores — critical complaints skewed toward East Delhi water
    let priorityScore: number
    if (district === 'East Delhi' && category === 'water') {
      priorityScore = randInt(70, 99)
    } else if (status === 'escalated') {
      priorityScore = randInt(75, 95)
    } else {
      priorityScore = randInt(10, 85)
    }

    const priority: ComplaintPriority = getPriorityFromScore(priorityScore)
    const slaDeadline                 = getSLADeadline(category, createdAt)

    // Resolved complaints have an afterPhotoUrl for realism
    const afterPhotoUrl =
      status === 'resolved'
        ? `https://picsum.photos/seed/${i}/400/300`
        : undefined

    // GPS coordinates — ~60% of complaints get a dot on the map
    const coords = districtCoordinates(district)

    complaints.push({
      title:                   templates.titles[titleIdx],
      description:             templates.descriptions[titleIdx],
      category,
      district,
      ward:                    `Ward ${randInt(1, 40)}`,
      status,
      priority,
      priorityScore,
      priorityReason:          `Score ${priorityScore}/100: This issue affects ${randInt(50, 20000)} citizens and has SLA risk.`,
      citizenName:             Math.random() > 0.4 ? `Citizen ${i + 1}` : undefined,
      citizenPhone:            Math.random() > 0.5 ? `98${randInt(10000000, 99999999)}` : undefined,
      assignedDept:            COMPLAINT_CATEGORIES.find((c) => c.value === category)?.dept ?? undefined,
      slaDeadline,
      slaBreached:             slaDeadline < new Date() && status !== 'resolved',
      estimatedCitizensAffected: randInt(10, 25000),
      sentiment:               pick(['positive', 'neutral', 'negative', 'negative', 'negative']),
      afterPhotoUrl,
      // Coordinates — present on ~60% of complaints so the map shows a spread of dots
      ...(coords ? { coordinates: { ...coords, source: 'gps' as const } } : {}),
      submissionMode:          'form' as const,
      timeline: [
        { status: 'open', timestamp: createdAt, note: 'Complaint submitted by citizen' },
        ...(status !== 'open'
          ? [{ status, timestamp: new Date(createdAt.getTime() + randInt(1, 12) * 3600000), note: 'Status updated' }]
          : []),
      ],
      createdAt,
      updatedAt: new Date(),
    })
  }

  await Complaint.insertMany(complaints)
  console.log(`   ✓ 200 complaints created`)

  // ── Summary ───────────────────────────────────────────────────────────────
  const criticalCount = complaints.filter((c) => c.priority === 'critical').length
  const openCount     = complaints.filter((c) => c.status   === 'open').length
  const breachedCount = complaints.filter((c) => c.slaBreached).length
  const dotCount      = complaints.filter((c) => c.coordinates).length

  console.log('\n✅ Seed complete!')
  console.log(`   Critical: ${criticalCount} | Open: ${openCount} | SLA Breached: ${breachedCount} | Map Dots: ${dotCount}`)
  console.log('\n📧 Demo credentials:')
  DEMO_USERS.forEach((u) => console.log(`   ${u.role.padEnd(14)} ${u.email}  /  ${u.password}`))

  await mongoose.disconnect()
  process.exit(0)
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
