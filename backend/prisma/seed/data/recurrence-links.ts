import { PrismaClient, SimilarityType, DetectedBy } from '@prisma/client';

interface RecurrenceLinkSeed {
  incidentIndex: number;
  relatedIncidentIndex: number;
  similarityType: SimilarityType;
  detectedBy: DetectedBy;
  notes: string;
  isDismissed: boolean;
}

const RECURRENCE_LINKS: RecurrenceLinkSeed[] = [
  // ── Track 7 Walkway Slip/Fall Pattern (chronic hazard) ─────────────────
  // INC-2024-0010 → INC-2024-0001 (same location, similar type)
  {
    incidentIndex: 9, // INC-2024-0010
    relatedIncidentIndex: 0, // INC-2024-0001
    similarityType: 'SAME_LOCATION',
    detectedBy: 'SYSTEM',
    notes: 'Both incidents at BNSF Topeka Yard Track 7 area. Slip/fall pattern in wet/icy conditions.',
    isDismissed: false,
  },
  // INC-2025-0001 → INC-2024-0010 (same location repeat)
  {
    incidentIndex: 17, // INC-2025-0001
    relatedIncidentIndex: 9, // INC-2024-0010
    similarityType: 'SAME_LOCATION',
    detectedBy: 'SYSTEM',
    notes: 'Second fall at Track 7 walkway within 6 weeks. Ice management CAPA from prior incident was ineffective.',
    isDismissed: false,
  },
  // INC-2025-0012 → INC-2025-0001 (same location, same root cause)
  {
    incidentIndex: 28, // INC-2025-0012
    relatedIncidentIndex: 17, // INC-2025-0001
    similarityType: 'SAME_ROOT_CAUSE',
    detectedBy: 'SYSTEM',
    notes: 'Third fall at identical location. Root cause is drainage creating standing water that freezes. Prior CAPAs addressed symptoms only.',
    isDismissed: false,
  },
  // INC-2025-0048 → INC-2025-0012 (annual pattern)
  {
    incidentIndex: 64, // INC-2025-0048
    relatedIncidentIndex: 28, // INC-2025-0012
    similarityType: 'SAME_LOCATION',
    detectedBy: 'SYSTEM',
    notes: 'Fourth incident at Track 7 walkway. Wet leaves now instead of ice but same drainage/surface issue.',
    isDismissed: false,
  },
  // INC-2025-0052 → INC-2025-0048 (5th incident)
  {
    incidentIndex: 68, // INC-2025-0052
    relatedIncidentIndex: 64, // INC-2025-0048
    similarityType: 'SAME_LOCATION',
    detectedBy: 'SYSTEM',
    notes: 'Fifth documented incident at Track 7 walkway. Anti-slip grating from spring CAPA has deteriorated.',
    isDismissed: false,
  },
  // INC-2025-0060 → INC-2025-0052 (6th incident)
  {
    incidentIndex: 76, // INC-2025-0060
    relatedIncidentIndex: 68, // INC-2025-0052
    similarityType: 'SAME_ROOT_CAUSE',
    detectedBy: 'SYSTEM',
    notes: 'Sixth fall at Track 7 walkway. Same root cause persists after 12 months of CAPAs. Engineering solution never implemented.',
    isDismissed: false,
  },
  // INC-2026-0006 → INC-2025-0060 (7th incident - executive escalation)
  {
    incidentIndex: 82, // INC-2026-0006
    relatedIncidentIndex: 76, // INC-2025-0060
    similarityType: 'SAME_ROOT_CAUSE',
    detectedBy: 'SYSTEM',
    notes: 'SEVENTH fall at Track 7 walkway. 14-month pattern. All prior CAPAs failed. Location shut down pending permanent engineering solution.',
    isDismissed: false,
  },

  // ── Utility Strike Pattern ─────────────────────────────────────────────
  // INC-2024-0016 → INC-2024-0007 (utility strikes at different locations)
  {
    incidentIndex: 15, // INC-2024-0016
    relatedIncidentIndex: 6, // INC-2024-0007
    similarityType: 'SAME_TYPE',
    detectedBy: 'SYSTEM',
    notes: 'Multiple utility strikes across projects. Suggests systemic issue with locate verification procedures.',
    isDismissed: false,
  },
  // INC-2025-0016 → INC-2024-0016 (gas line strike)
  {
    incidentIndex: 32, // INC-2025-0016
    relatedIncidentIndex: 15, // INC-2024-0016
    similarityType: 'SAME_TYPE',
    detectedBy: 'SYSTEM',
    notes: 'Third utility strike. Locate inaccuracy is a recurring theme. One-call process reliability questioned.',
    isDismissed: false,
  },
  // INC-2025-0023 → INC-2025-0016 (electrical conduit)
  {
    incidentIndex: 39, // INC-2025-0023
    relatedIncidentIndex: 32, // INC-2025-0016
    similarityType: 'SAME_TYPE',
    detectedBy: 'MANUAL',
    notes: 'Utility strike pattern continues. Fourth strike in 6 months. All involve locate inaccuracy or missing locates.',
    isDismissed: false,
  },

  // ── Back Injury Pattern ────────────────────────────────────────────────
  // INC-2025-0014 → INC-2024-0003 (repetitive back strain)
  {
    incidentIndex: 30, // INC-2025-0014
    relatedIncidentIndex: 2, // INC-2024-0003
    similarityType: 'SAME_TYPE',
    detectedBy: 'MANUAL',
    notes: 'Both are back injuries from manual lifting. Different projects but same root cause: manual handling of heavy materials without mechanical assist.',
    isDismissed: false,
  },
  // INC-2025-0040 → INC-2025-0014 (back injury pattern)
  {
    incidentIndex: 56, // INC-2025-0040
    relatedIncidentIndex: 30, // INC-2025-0014
    similarityType: 'SAME_TYPE',
    detectedBy: 'SYSTEM',
    notes: 'Third back injury from manual lifting in 10 months. Systemic issue with manual material handling procedures.',
    isDismissed: false,
  },

  // ── Near Miss at Height Pattern ────────────────────────────────────────
  // INC-2025-0025 → INC-2025-0020 (fall protection and dropped objects)
  {
    incidentIndex: 41, // INC-2025-0025
    relatedIncidentIndex: 36, // INC-2025-0020
    similarityType: 'SAME_LOCATION',
    detectedBy: 'SYSTEM',
    notes: 'Both at NS Norfolk bridge site. Fall protection anchor failure and dropped tool from height within a month. Work-at-height safety program needs review.',
    isDismissed: false,
  },

  // ── Equipment Maintenance Pattern ──────────────────────────────────────
  // INC-2025-0030 → INC-2025-0024 (equipment not maintained)
  {
    incidentIndex: 46, // INC-2025-0030
    relatedIncidentIndex: 40, // INC-2025-0024
    similarityType: 'SAME_ROOT_CAUSE',
    detectedBy: 'MANUAL',
    notes: 'Both incidents caused by equipment maintenance being deferred due to production pressure. Systemic maintenance scheduling issue.',
    isDismissed: false,
  },
];

export async function seedRecurrenceLinks(prisma: PrismaClient, incidents: { id: string }[]) {
  const links = [];
  for (const rl of RECURRENCE_LINKS) {
    const link = await prisma.recurrenceLink.create({
      data: {
        incidentId: incidents[rl.incidentIndex].id,
        relatedIncidentId: incidents[rl.relatedIncidentIndex].id,
        similarityType: rl.similarityType,
        detectedBy: rl.detectedBy,
        notes: rl.notes,
        isDismissed: rl.isDismissed,
      },
    });
    links.push(link);
  }
  return links;
}
