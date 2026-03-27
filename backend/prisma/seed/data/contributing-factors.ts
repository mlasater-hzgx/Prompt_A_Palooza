import { PrismaClient } from '@prisma/client';

interface ContributingFactorSeed {
  incidentIndex: number;
  factorTypeName: string; // We'll look up the ID by name
  description: string | null;
  isPrimary: boolean;
}

const CONTRIBUTING_FACTORS: ContributingFactorSeed[] = [
  // INC-2024-0001 (index 0) - Slip on wet ballast
  { incidentIndex: 0, factorTypeName: 'Uneven Ground/Surface', description: 'Wet ballast surface created slip hazard', isPrimary: true },
  { incidentIndex: 0, factorTypeName: 'Inadequate Procedure', description: 'No procedure for walkway condition assessment', isPrimary: false },

  // INC-2024-0002 (index 1) - Near miss clearance
  { incidentIndex: 1, factorTypeName: 'Failure to Follow Procedure', description: 'Flagman entered minimum clearance distance', isPrimary: true },
  { incidentIndex: 1, factorTypeName: 'Communication Failure', description: 'Radio dead spot forced physical approach', isPrimary: false },

  // INC-2024-0003 (index 2) - Strained back
  { incidentIndex: 2, factorTypeName: 'Failure to Follow Procedure', description: 'Solo lift of 65-lb joint bar against two-person requirement', isPrimary: true },
  { incidentIndex: 2, factorTypeName: 'Communication Failure', description: 'Partner left area without communicating', isPrimary: false },
  { incidentIndex: 2, factorTypeName: 'Inadequate Supervision', description: 'Supervisor was not observing heavy lift operations', isPrimary: false },

  // INC-2024-0004 (index 3) - Signal cable damage
  { incidentIndex: 3, factorTypeName: 'Inadequate Procedure', description: 'No requirement to pothole critical utilities', isPrimary: true },
  { incidentIndex: 3, factorTypeName: 'Inadequate Risk Assessment', description: 'Did not verify utility locate accuracy independently', isPrimary: false },

  // INC-2024-0005 (index 4) - Vehicle backing
  { incidentIndex: 4, factorTypeName: 'Failure to Follow Procedure', description: 'No spotter used during backing maneuver', isPrimary: true },
  { incidentIndex: 4, factorTypeName: 'Poor Lighting', description: 'Pre-dawn darkness reduced visibility', isPrimary: false },

  // INC-2024-0006 (index 5) - Trip on uneven ballast
  { incidentIndex: 5, factorTypeName: 'Uneven Ground/Surface', description: 'Ballast disturbed by tamping not yet leveled', isPrimary: true },

  // INC-2024-0008 (index 7) - Laceration from rail clip
  { incidentIndex: 7, factorTypeName: 'Equipment Malfunction', description: 'Rail clip shattered during removal', isPrimary: true },
  { incidentIndex: 7, factorTypeName: 'Inadequate Procedure', description: 'PPE gap between glove and sleeve not addressed in procedure', isPrimary: false },

  // INC-2024-0009 (index 8) - Crane load swing
  { incidentIndex: 8, factorTypeName: 'Weather Conditions', description: 'Wind gusts to 35 mph caused unexpected load swing', isPrimary: true },
  { incidentIndex: 8, factorTypeName: 'Inadequate Risk Assessment', description: 'Wind speed monitoring not in place before lift', isPrimary: false },

  // INC-2024-0010 (index 9) - Fall on icy walkway
  { incidentIndex: 9, factorTypeName: 'Weather Conditions', description: 'Black ice formed on walkway overnight', isPrimary: false },
  { incidentIndex: 9, factorTypeName: 'Missing Procedure', description: 'No winter walkway maintenance SOP existed', isPrimary: true },
  { incidentIndex: 9, factorTypeName: 'Inadequate Risk Assessment', description: 'Seasonal walkway hazards not in project hazard assessment', isPrimary: false },

  // INC-2024-0012 (index 11) - Slip on frozen ballast head
  { incidentIndex: 11, factorTypeName: 'Weather Conditions', description: 'Heavy frost at 18°F', isPrimary: true },
  { incidentIndex: 11, factorTypeName: 'Missing Procedure', description: 'No procedure for heavy tool transport in icy conditions', isPrimary: false },
  { incidentIndex: 11, factorTypeName: 'Inadequate Risk Assessment', description: 'PPE assessment did not consider seasonal variation', isPrimary: false },

  // INC-2024-0013 (index 12) - Fire in equipment shed
  { incidentIndex: 12, factorTypeName: 'Failure to Follow Procedure', description: 'Space heater left running unattended near flammable materials', isPrimary: true },
  { incidentIndex: 12, factorTypeName: 'Inadequate Supervision', description: 'No inspection of shed at end of shift', isPrimary: false },

  // INC-2024-0014 (index 13) - Worker on wrong track
  { incidentIndex: 13, factorTypeName: 'Communication Failure', description: 'Job briefing did not include walk-through of work limits', isPrimary: true },
  { incidentIndex: 13, factorTypeName: 'Inadequate Procedure', description: 'No temporary track identification signs required', isPrimary: false },

  // INC-2025-0001 (index 17) - Slip on ice repeat
  { incidentIndex: 17, factorTypeName: 'Weather Conditions', description: 'Re-freezing overnight negated previous day treatment', isPrimary: false },
  { incidentIndex: 17, factorTypeName: 'Inadequate Procedure', description: 'CAPA treatment timing did not align with crew start time', isPrimary: true },
  { incidentIndex: 17, factorTypeName: 'Resource Constraints', description: 'Maintenance crew schedule gap allowed untreated surfaces', isPrimary: false },

  // INC-2025-0004 (index 20) - Hand strain torque wrench
  { incidentIndex: 20, factorTypeName: 'Improper Tool Use', description: 'Wrong size socket (15/16" vs 7/8")', isPrimary: true },
  { incidentIndex: 20, factorTypeName: 'Resource Constraints', description: 'Correct tool not available in tool room', isPrimary: false },

  // INC-2025-0007 (index 23) - Finger pinch in coupler
  { incidentIndex: 23, factorTypeName: 'Failure to Follow Procedure', description: 'Manual coupler alignment instead of using alignment tool', isPrimary: true },
  { incidentIndex: 23, factorTypeName: 'Complacency', description: 'Experienced worker took shortcut', isPrimary: false },

  // INC-2025-0010 (index 26) - Hearing damage
  { incidentIndex: 26, factorTypeName: 'Inadequate Training', description: 'Improper ear plug insertion despite prior training', isPrimary: true },
  { incidentIndex: 26, factorTypeName: 'Inadequate Maintenance', description: 'Old, stiffened foam ear plugs should have been replaced', isPrimary: false },

  // INC-2025-0011 (index 27) - Trench wall collapse
  { incidentIndex: 27, factorTypeName: 'Weather Conditions', description: 'Soil saturated from 2 days of rain', isPrimary: false },
  { incidentIndex: 27, factorTypeName: 'Missing Procedure', description: 'No shoring in 5-foot trench', isPrimary: true },
  { incidentIndex: 27, factorTypeName: 'Inadequate Supervision', description: 'Competent person did not assess soil conditions after rain', isPrimary: false },

  // INC-2025-0012 (index 28) - Third fall Track 7
  { incidentIndex: 28, factorTypeName: 'Uneven Ground/Surface', description: 'Chronic drainage issue creating standing water that freezes', isPrimary: true },
  { incidentIndex: 28, factorTypeName: 'Inadequate Procedure', description: 'Prior CAPAs addressed symptoms not root cause', isPrimary: false },
  { incidentIndex: 28, factorTypeName: 'Inadequate Risk Assessment', description: 'No engineering assessment of drainage', isPrimary: false },

  // INC-2025-0015 (index 31) - Excavator near power line
  { incidentIndex: 31, factorTypeName: 'Communication Failure', description: 'Spotter distracted by phone call', isPrimary: true },
  { incidentIndex: 31, factorTypeName: 'Inadequate Supervision', description: 'No backup awareness for critical spotter role', isPrimary: false },

  // INC-2025-0024 (index 40) - Wrist from vibration
  { incidentIndex: 40, factorTypeName: 'Inadequate Maintenance', description: 'Vibration dampeners worn past service limits', isPrimary: true },
  { incidentIndex: 40, factorTypeName: 'Fatigue', description: 'Worker operated continuously for 6 hours without break', isPrimary: false },

  // INC-2025-0025 (index 41) - Fall protection anchor failure
  { incidentIndex: 41, factorTypeName: 'Equipment Malfunction', description: 'Anchor installed with insufficient embedment depth', isPrimary: true },
  { incidentIndex: 41, factorTypeName: 'Inadequate Supervision', description: 'Anchor not inspected by competent person before use', isPrimary: false },

  // INC-2025-0027 (index 43) - Thermite welding burn
  { incidentIndex: 43, factorTypeName: 'Weather Conditions', description: 'Moisture in mold caused molten metal splash', isPrimary: true },
  { incidentIndex: 43, factorTypeName: 'Inadequate Procedure', description: 'Moisture check procedure did not account for ambient humidity', isPrimary: false },

  // INC-2025-0029 (index 45) - Heat stroke
  { incidentIndex: 45, factorTypeName: 'Weather Conditions', description: 'Extreme heat: 102°F with heat index 112°F', isPrimary: true },
  { incidentIndex: 45, factorTypeName: 'Inadequate Procedure', description: 'Water cooler spacing (400 ft) exceeded recommendation (200 ft)', isPrimary: false },
  { incidentIndex: 45, factorTypeName: 'Resource Constraints', description: 'No shade structure at flagging position', isPrimary: false },

  // INC-2025-0031 (index 47) - Wire rope laceration
  { incidentIndex: 47, factorTypeName: 'Inadequate Maintenance', description: 'Wire rope overdue for inspection with visible broken wires', isPrimary: true },
  { incidentIndex: 47, factorTypeName: 'Failure to Follow Procedure', description: 'Pre-use wire rope inspection not performed', isPrimary: false },

  // INC-2025-0040 (index 56) - Back injury lifting form
  { incidentIndex: 56, factorTypeName: 'Fatigue', description: 'Two-person lift failed when partner grip slipped from sweat', isPrimary: false },
  { incidentIndex: 56, factorTypeName: 'Weather Conditions', description: 'Hot conditions caused excessive sweating reducing grip', isPrimary: false },
  { incidentIndex: 56, factorTypeName: 'Inadequate Procedure', description: 'No mechanical assist required for 120-lb panels', isPrimary: true },

  // INC-2025-0052 (index 68) - Topeka annual pattern
  { incidentIndex: 68, factorTypeName: 'Uneven Ground/Surface', description: 'Same chronic drainage issue - 5th incident at location', isPrimary: true },
  { incidentIndex: 68, factorTypeName: 'Inadequate Maintenance', description: 'Anti-slip grating deteriorated and not replaced', isPrimary: false },

  // INC-2025-0057 (index 73) - Fall from ladder
  { incidentIndex: 73, factorTypeName: 'Weather Conditions', description: 'Frost on metal ladder rungs', isPrimary: true },
  { incidentIndex: 73, factorTypeName: 'Failure to Follow Procedure', description: 'Worker not wearing issued ice cleats', isPrimary: false },
  { incidentIndex: 73, factorTypeName: 'Inadequate Risk Assessment', description: 'Ladder climbing during frost not addressed in task plan', isPrimary: false },

  // INC-2026-0006 (index 82) - 7th slip same location
  { incidentIndex: 82, factorTypeName: 'Uneven Ground/Surface', description: 'Same chronic drainage issue - 7th incident. Engineering solution never implemented.', isPrimary: true },
  { incidentIndex: 82, factorTypeName: 'Inadequate Supervision', description: 'Management failed to enforce permanent engineering fix despite repeated CAPAs', isPrimary: false },
  { incidentIndex: 82, factorTypeName: 'Resource Constraints', description: 'Engineering solution budget not approved through 6 incident cycles', isPrimary: false },
];

export async function seedContributingFactors(
  prisma: PrismaClient,
  incidents: { id: string }[],
  factorTypes: { id: string; name: string }[],
) {
  // Build a lookup map for factor type names to IDs
  const factorTypeMap = new Map<string, string>();
  for (const ft of factorTypes) {
    factorTypeMap.set(ft.name, ft.id);
  }

  const factors = [];
  for (const cf of CONTRIBUTING_FACTORS) {
    const factorTypeId = factorTypeMap.get(cf.factorTypeName);
    if (!factorTypeId) {
      console.warn(`Factor type not found: ${cf.factorTypeName}`);
      continue;
    }
    const factor = await prisma.contributingFactor.create({
      data: {
        incidentId: incidents[cf.incidentIndex].id,
        factorTypeId,
        description: cf.description,
        isPrimary: cf.isPrimary,
      },
    });
    factors.push(factor);
  }
  return factors;
}
