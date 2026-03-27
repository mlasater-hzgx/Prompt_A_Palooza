import { PrismaClient, FishboneCategory } from '@prisma/client';

interface FishboneSeed {
  investigationIndex: number;
  category: FishboneCategory;
  description: string;
  isContributing: boolean;
  evidence: string | null;
  sortOrder: number;
}

const FISHBONE_FACTORS: FishboneSeed[] = [
  // Investigation 2 (INC-2024-0003 - Strained back lifting rail connector) - method: BOTH
  {
    investigationIndex: 2,
    category: 'PEOPLE',
    description: 'Worker attempted solo lift of 65-lb joint bar',
    isContributing: true,
    evidence: 'Worker admitted to lifting alone. Witness confirmed solo lift.',
    sortOrder: 1,
  },
  {
    investigationIndex: 2,
    category: 'PEOPLE',
    description: 'Work partner left area without communicating',
    isContributing: true,
    evidence: 'Partner confirmed walking to water cooler without telling buddy.',
    sortOrder: 2,
  },
  {
    investigationIndex: 2,
    category: 'PROCESS',
    description: 'Two-person lift requirement not enforced by supervision',
    isContributing: true,
    evidence: 'Supervisor was 200 feet away at time of incident.',
    sortOrder: 3,
  },
  {
    investigationIndex: 2,
    category: 'MANAGEMENT',
    description: 'Supervisor-to-worker ratio too high for adequate oversight',
    isContributing: false,
    evidence: 'One supervisor for 12 workers spread across 500 feet of track.',
    sortOrder: 4,
  },
  {
    investigationIndex: 2,
    category: 'EQUIPMENT',
    description: 'Mechanical lifting aid available but 100 feet from work area',
    isContributing: false,
    evidence: 'Rail cart with lift attachment was positioned at end of work zone.',
    sortOrder: 5,
  },
  {
    investigationIndex: 2,
    category: 'ENVIRONMENT',
    description: 'No environmental contributing factors identified',
    isContributing: false,
    evidence: null,
    sortOrder: 6,
  },

  // Investigation 3 (INC-2024-0004 - Signal cable damage) - method: FISHBONE
  {
    investigationIndex: 3,
    category: 'PROCESS',
    description: 'One-call locate was inaccurate by 6 inches outside tolerance zone',
    isContributing: true,
    evidence: 'Measured distance from locate mark to actual cable: 24 inches vs 18-inch tolerance.',
    sortOrder: 1,
  },
  {
    investigationIndex: 3,
    category: 'MATERIALS',
    description: 'Cable as-built drawings did not match field conditions',
    isContributing: true,
    evidence: 'As-built drawing showed cable 3 feet east of actual position.',
    sortOrder: 2,
  },
  {
    investigationIndex: 3,
    category: 'PROCESS',
    description: 'No requirement to pothole/verify critical utility locations before mechanical excavation',
    isContributing: true,
    evidence: 'Excavation procedure only requires hand digging within tolerance zone.',
    sortOrder: 3,
  },
  {
    investigationIndex: 3,
    category: 'PEOPLE',
    description: 'Operator followed correct excavation procedure - operator not at fault',
    isContributing: false,
    evidence: 'Operator was outside the marked tolerance zone when cable was struck.',
    sortOrder: 4,
  },
  {
    investigationIndex: 3,
    category: 'EQUIPMENT',
    description: 'Backhoe bucket size appropriate for work',
    isContributing: false,
    evidence: 'Standard 24-inch bucket used per plan.',
    sortOrder: 5,
  },
  {
    investigationIndex: 3,
    category: 'MANAGEMENT',
    description: 'No independent verification of utility locates required by project plan',
    isContributing: true,
    evidence: 'Project excavation plan accepts one-call locates at face value.',
    sortOrder: 6,
  },

  // Investigation 5 (INC-2024-0012 - Slip on frozen ballast, head) - method: BOTH
  {
    investigationIndex: 5,
    category: 'ENVIRONMENT',
    description: 'Heavy frost on ballast surface at 18°F',
    isContributing: true,
    evidence: 'Temperature records and site photos confirm frost conditions.',
    sortOrder: 1,
  },
  {
    investigationIndex: 5,
    category: 'PEOPLE',
    description: 'Worker carrying 22-lb rail wrench reduced ability to recover from slip',
    isContributing: true,
    evidence: 'Tool weight documented. Worker states he could not break fall due to carrying tool.',
    sortOrder: 2,
  },
  {
    investigationIndex: 5,
    category: 'EQUIPMENT',
    description: 'No traction aids (ice cleats) provided or available',
    isContributing: true,
    evidence: 'PPE inventory confirmed no traction devices stocked.',
    sortOrder: 3,
  },
  {
    investigationIndex: 5,
    category: 'PROCESS',
    description: 'No procedure restricting heavy carrying during icy conditions',
    isContributing: true,
    evidence: 'Job procedures reviewed - no weather-dependent lifting restrictions.',
    sortOrder: 4,
  },
  {
    investigationIndex: 5,
    category: 'MANAGEMENT',
    description: 'PPE assessment conducted in summer did not consider winter hazards',
    isContributing: true,
    evidence: 'PPE hazard assessment dated July 2024.',
    sortOrder: 5,
  },
  {
    investigationIndex: 5,
    category: 'MATERIALS',
    description: 'Hard hat properly worn - mitigated head injury severity',
    isContributing: false,
    evidence: 'Hard hat showed impact mark consistent with rail strike.',
    sortOrder: 6,
  },

  // Investigation 8 (INC-2025-0004 - Hand strain torque wrench) - method: FISHBONE
  {
    investigationIndex: 8,
    category: 'EQUIPMENT',
    description: 'Wrong size socket used (15/16" vs required 7/8")',
    isContributing: true,
    evidence: 'Socket measured; specification confirmed 7/8" required.',
    sortOrder: 1,
  },
  {
    investigationIndex: 8,
    category: 'MATERIALS',
    description: 'Correct 7/8" deep socket not available in tool room',
    isContributing: true,
    evidence: 'Tool room inventory showed socket was checked out and not returned.',
    sortOrder: 2,
  },
  {
    investigationIndex: 8,
    category: 'PEOPLE',
    description: 'Worker chose to improvise with wrong tool rather than stopping work',
    isContributing: true,
    evidence: 'Worker statement admits choosing to proceed.',
    sortOrder: 3,
  },
  {
    investigationIndex: 8,
    category: 'MANAGEMENT',
    description: 'Production pressure perceived by worker as higher priority than safety',
    isContributing: true,
    evidence: 'Anonymous survey: 40% of crew felt pressure to improvise.',
    sortOrder: 4,
  },
  {
    investigationIndex: 8,
    category: 'PROCESS',
    description: 'Tool verification step not included in torque operation procedure',
    isContributing: true,
    evidence: 'Torque procedure reviewed - no step requiring socket size verification.',
    sortOrder: 5,
  },
  {
    investigationIndex: 8,
    category: 'ENVIRONMENT',
    description: 'Cold temperature (28°F) may have reduced hand dexterity',
    isContributing: false,
    evidence: 'Worker was wearing insulated gloves. States hands were functional.',
    sortOrder: 6,
  },

  // Investigation 10 (INC-2025-0012 - Third fall at Track 7) - method: BOTH
  {
    investigationIndex: 10,
    category: 'ENVIRONMENT',
    description: 'Walkway in topographic low point collects surface water runoff',
    isContributing: true,
    evidence: 'Site survey: walkway 6 inches lower than surrounding grade. Drainage flows toward walkway.',
    sortOrder: 1,
  },
  {
    investigationIndex: 10,
    category: 'ENVIRONMENT',
    description: 'Compacted ice forms more readily in areas with standing water',
    isContributing: true,
    evidence: 'Ice thickness measured at 1.5 inches in walkway vs 0.25 inches on surrounding ballast.',
    sortOrder: 2,
  },
  {
    investigationIndex: 10,
    category: 'PROCESS',
    description: 'Prior CAPAs addressed symptoms (ice treatment) not root cause (drainage)',
    isContributing: true,
    evidence: 'Two prior CAPA reviews show only surface treatment actions, no engineering controls.',
    sortOrder: 3,
  },
  {
    investigationIndex: 10,
    category: 'MANAGEMENT',
    description: 'No escalation procedure for recurring incidents at same location',
    isContributing: true,
    evidence: 'Investigation SOPs have no escalation criteria for recurrence.',
    sortOrder: 4,
  },
  {
    investigationIndex: 10,
    category: 'MANAGEMENT',
    description: 'Prior investigations did not include engineering expertise',
    isContributing: true,
    evidence: 'Team composition for prior investigations: safety personnel only.',
    sortOrder: 5,
  },
  {
    investigationIndex: 10,
    category: 'PEOPLE',
    description: 'Crew arrived before ice treatment was applied (schedule gap)',
    isContributing: true,
    evidence: 'Production start 6:15 AM. Maintenance start 6:30 AM. 15-minute gap.',
    sortOrder: 6,
  },
  {
    investigationIndex: 10,
    category: 'EQUIPMENT',
    description: 'Anti-slip grating from spring CAPA had deteriorated',
    isContributing: true,
    evidence: 'Grating inspection showed material degradation. Not rated for outdoor freeze-thaw.',
    sortOrder: 7,
  },
  {
    investigationIndex: 10,
    category: 'MATERIALS',
    description: 'Anti-slip grating material not rated for outdoor freeze-thaw cycles',
    isContributing: true,
    evidence: 'Product specification sheet confirms indoor use only. Purchased incorrectly.',
    sortOrder: 8,
  },

  // Investigation 13 (INC-2025-0017 - Vehicle rollover) - method: FISHBONE
  {
    investigationIndex: 13,
    category: 'ENVIRONMENT',
    description: 'Access road grade of 15 degrees exceeds vehicle stability limits',
    isContributing: true,
    evidence: 'Inclinometer reading: 15 degrees. Vehicle manual states max 12 degrees.',
    sortOrder: 1,
  },
  {
    investigationIndex: 13,
    category: 'ENVIRONMENT',
    description: 'Loose gravel surface reduced tire traction',
    isContributing: true,
    evidence: 'Road surface inspection noted 3-4 inches of loose aggregate.',
    sortOrder: 2,
  },
  {
    investigationIndex: 13,
    category: 'PROCESS',
    description: 'No speed limit or grade warning posted on access road',
    isContributing: true,
    evidence: 'Site inspection confirmed no signage on access road.',
    sortOrder: 3,
  },
  {
    investigationIndex: 13,
    category: 'EQUIPMENT',
    description: 'Side-by-side vehicle has higher center of gravity than standard ATV',
    isContributing: true,
    evidence: 'Vehicle specifications reviewed. CG height 28 inches vs 22 inches for ATV.',
    sortOrder: 4,
  },
  {
    investigationIndex: 13,
    category: 'PEOPLE',
    description: 'Driver wearing seatbelt - prevented ejection',
    isContributing: false,
    evidence: 'Driver confirms seatbelt use. No injuries from rollover.',
    sortOrder: 5,
  },
  {
    investigationIndex: 13,
    category: 'MANAGEMENT',
    description: 'Access road assessment not part of project safety plan',
    isContributing: true,
    evidence: 'Project safety plan reviewed - no section for vehicle access routes.',
    sortOrder: 6,
  },

  // Investigation 14 (INC-2025-0024 - Wrist from vibration) - method: BOTH
  {
    investigationIndex: 14,
    category: 'EQUIPMENT',
    description: 'Vibration dampeners worn beyond service limits',
    isContributing: true,
    evidence: 'Dampener thickness: 3mm remaining vs 8mm minimum. Last replaced 400 hours ago (interval: 200 hours).',
    sortOrder: 1,
  },
  {
    investigationIndex: 14,
    category: 'PEOPLE',
    description: 'Operator ran machine for 6 consecutive hours without break',
    isContributing: true,
    evidence: 'Machine hour meter: 6.2 hours continuous. Maximum recommended: 2 hours.',
    sortOrder: 2,
  },
  {
    investigationIndex: 14,
    category: 'PROCESS',
    description: 'No vibration exposure monitoring or time limits enforced',
    isContributing: true,
    evidence: 'No vibration exposure log maintained. No operational time limits documented.',
    sortOrder: 3,
  },
  {
    investigationIndex: 14,
    category: 'MANAGEMENT',
    description: 'PM schedule not followed due to production pressure',
    isContributing: true,
    evidence: 'PM records show 2 missed scheduled dampener inspections.',
    sortOrder: 4,
  },
  {
    investigationIndex: 14,
    category: 'MATERIALS',
    description: 'Replacement dampeners not stocked on site',
    isContributing: false,
    evidence: 'Supply inventory: dampeners not in standard parts kit. Must be special ordered.',
    sortOrder: 5,
  },
  {
    investigationIndex: 14,
    category: 'ENVIRONMENT',
    description: 'Ballast conditions required higher machine effort, increasing vibration',
    isContributing: false,
    evidence: 'Ballast was heavily fouled, requiring more passes.',
    sortOrder: 6,
  },

  // Investigation 17 (INC-2025-0042 - Excavator track on rail) - method: FISHBONE
  {
    investigationIndex: 17,
    category: 'PEOPLE',
    description: 'Operator did not recognize extent of rail damage from cab',
    isContributing: false,
    evidence: 'Operator statement: felt bump but assumed normal ground irregularity.',
    sortOrder: 1,
  },
  {
    investigationIndex: 17,
    category: 'PEOPLE',
    description: 'No spotter assigned despite proximity to active rail',
    isContributing: true,
    evidence: 'Pre-task plan did not require spotter. No spotter available.',
    sortOrder: 2,
  },
  {
    investigationIndex: 17,
    category: 'PROCESS',
    description: 'Equipment travel path not identified in pre-task plan',
    isContributing: true,
    evidence: 'Pre-task plan reviewed - no equipment travel path section.',
    sortOrder: 3,
  },
  {
    investigationIndex: 17,
    category: 'EQUIPMENT',
    description: 'Excavator cab visibility limited toward right track side',
    isContributing: true,
    evidence: 'Cab visibility study: blind spot extends 8 feet on right side.',
    sortOrder: 4,
  },
  {
    investigationIndex: 17,
    category: 'MANAGEMENT',
    description: 'No equipment proximity rules for active rail documented',
    isContributing: true,
    evidence: 'Project safety plan has no equipment proximity requirements for rail.',
    sortOrder: 5,
  },
  {
    investigationIndex: 17,
    category: 'ENVIRONMENT',
    description: 'Drainage work required equipment positioning near active rail',
    isContributing: false,
    evidence: 'Work scope required excavation within 10 feet of active track.',
    sortOrder: 6,
  },
];

export async function seedFishbone(prisma: PrismaClient, investigations: { id: string }[]) {
  const factors = [];
  for (const fb of FISHBONE_FACTORS) {
    const { investigationIndex, ...data } = fb;
    const factor = await prisma.fishboneFactor.create({
      data: {
        ...data,
        investigationId: investigations[investigationIndex].id,
      },
    });
    factors.push(factor);
  }
  return factors;
}
