import { PrismaClient } from '@prisma/client';

interface FiveWhySeed {
  investigationIndex: number;
  sequence: number;
  question: string;
  answer: string;
  evidence: string | null;
}

const FIVE_WHYS: FiveWhySeed[] = [
  // Investigation 0 (INC-2024-0001 - Slip on wet ballast)
  {
    investigationIndex: 0,
    sequence: 1,
    question: 'Why did the worker slip and fall?',
    answer: 'The ballast surface was wet and slippery from morning dew.',
    evidence: 'Weather records confirm overcast conditions with dew point reached. Photos show wet ballast surface.',
  },
  {
    investigationIndex: 0,
    sequence: 2,
    question: 'Why was the worker walking on a wet, slippery surface without precaution?',
    answer: 'The morning job briefing did not address walkway surface conditions.',
    evidence: 'Job briefing form reviewed - no mention of surface condition assessment.',
  },
  {
    investigationIndex: 0,
    sequence: 3,
    question: 'Why didn\'t the job briefing address surface conditions?',
    answer: 'There was no requirement in the job briefing checklist to assess walkway conditions.',
    evidence: 'Standard job briefing checklist reviewed - no field for surface/walkway conditions.',
  },
  {
    investigationIndex: 0,
    sequence: 4,
    question: 'Why was surface condition assessment not part of the job briefing checklist?',
    answer: 'The checklist was developed for production tasks and did not include environmental hazard assessments for access routes.',
    evidence: 'Checklist revision history shows last update was 2 years ago, focused on production hazards.',
  },

  // Investigation 1 (INC-2024-0002 - Near miss clearance)
  {
    investigationIndex: 1,
    sequence: 1,
    question: 'Why did the flagman enter the minimum clearance distance?',
    answer: 'The flagman wanted to communicate with a worker on the other side of the track.',
    evidence: 'Flagman statement confirms he moved closer to verbally communicate.',
  },
  {
    investigationIndex: 1,
    sequence: 2,
    question: 'Why did the flagman choose to approach physically instead of using the radio?',
    answer: 'The flagman said the radio had intermittent static and he felt verbal communication was more reliable.',
    evidence: 'Radio tested - confirmed intermittent interference in that area of the yard.',
  },
  {
    investigationIndex: 1,
    sequence: 3,
    question: 'Why was the radio experiencing interference?',
    answer: 'Radio repeater coverage was inadequate in the west end of the yard. Known dead spot.',
    evidence: 'RF coverage survey from 2023 identified weak signal areas. No corrective action taken.',
  },

  // Investigation 4 (INC-2024-0010 - Fall on icy walkway)
  {
    investigationIndex: 4,
    sequence: 1,
    question: 'Why did the worker fall?',
    answer: 'Black ice had formed on the walkway surface overnight.',
    evidence: 'Temperature logs show overnight low of 22°F with 100% humidity. Photos show ice on walkway.',
  },
  {
    investigationIndex: 4,
    sequence: 2,
    question: 'Why was black ice present on the walkway at shift start?',
    answer: 'No ice treatment (salt/sand) had been applied before workers arrived.',
    evidence: 'No maintenance log entry for walkway treatment on 11/22. Maintenance crew confirmed no treatment was applied.',
  },
  {
    investigationIndex: 4,
    sequence: 3,
    question: 'Why was no ice treatment applied?',
    answer: 'There was no procedure or assigned responsibility for pre-shift walkway treatment during winter months.',
    evidence: 'Review of all site procedures found no winter walkway maintenance SOP.',
  },
  {
    investigationIndex: 4,
    sequence: 4,
    question: 'Why was there no winter walkway maintenance procedure?',
    answer: 'The walkway hazard had not been identified in the project hazard assessment. The assessment focused on track work hazards, not access route conditions.',
    evidence: 'Project hazard assessment reviewed. No mention of seasonal walkway hazards.',
  },
  {
    investigationIndex: 4,
    sequence: 5,
    question: 'Why didn\'t the project hazard assessment include access route conditions?',
    answer: 'The hazard assessment template did not include a category for access routes, walkways, or seasonal conditions. Root cause: inadequate hazard assessment template.',
    evidence: 'Hazard assessment template reviewed. No category for environmental access hazards.',
  },

  // Investigation 5 (INC-2024-0012 - Slip on frozen ballast, head)
  {
    investigationIndex: 5,
    sequence: 1,
    question: 'Why did the worker fall?',
    answer: 'Frost-covered ballast was extremely slippery and the worker was carrying a heavy rail wrench, reducing balance.',
    evidence: 'Temperature records: 18°F with heavy frost. Rail wrench weighs 22 lbs.',
  },
  {
    investigationIndex: 5,
    sequence: 2,
    question: 'Why was the worker carrying a heavy tool on a frosty surface?',
    answer: 'No procedure restricted carrying heavy loads during icy conditions. No alternative transport method was available.',
    evidence: 'Job procedures reviewed - no weather-dependent restrictions on manual carrying.',
  },
  {
    investigationIndex: 5,
    sequence: 3,
    question: 'Why were no traction aids provided for icy conditions?',
    answer: 'Ice cleats were not part of the standard PPE inventory for the project. No one had requested them.',
    evidence: 'PPE inventory list reviewed - no traction devices listed.',
  },
  {
    investigationIndex: 5,
    sequence: 4,
    question: 'Why were ice cleats not part of standard PPE for winter operations?',
    answer: 'The PPE assessment did not consider seasonal variation in slip hazards. PPE assessment was conducted in summer.',
    evidence: 'PPE hazard assessment dated July 2024. No seasonal adjustments documented.',
  },

  // Investigation 7 (INC-2025-0001 - Slip on ice repeat)
  {
    investigationIndex: 7,
    sequence: 1,
    question: 'Why did another worker fall at the same Track 7 walkway location?',
    answer: 'Ice had re-formed on the walkway overnight after the previous day\'s treatment wore off.',
    evidence: 'Temperature dropped to 8°F overnight. Previous ice treatment was applied at 4 PM the prior day.',
  },
  {
    investigationIndex: 7,
    sequence: 2,
    question: 'Why was the CAPA from the November incident ineffective?',
    answer: 'The CAPA specified daily ice treatment but the timing was wrong - treatment was applied in the afternoon and did not survive overnight freezing.',
    evidence: 'CAPA log shows treatment applied at 3:45 PM on Jan 5. Temperature dropped below freezing by 8 PM.',
  },
  {
    investigationIndex: 7,
    sequence: 3,
    question: 'Why was the treatment timing not aligned with crew arrival?',
    answer: 'The maintenance crew schedule (7:00 AM start) did not account for the production crew\'s early start (6:30 AM). A 30-minute gap existed.',
    evidence: 'Maintenance schedule shows 7:00 AM start. Production schedule shows 6:30 AM start.',
  },
  {
    investigationIndex: 7,
    sequence: 4,
    question: 'Why wasn\'t the maintenance schedule adjusted after the November incident?',
    answer: 'The CAPA focused on adding ice treatment to the maintenance checklist but did not address the timing gap between maintenance and production schedules.',
    evidence: 'CAPA from INC-2024-0010 reviewed - specifies "daily treatment" but not timing relative to production shift.',
  },
  {
    investigationIndex: 7,
    sequence: 5,
    question: 'Why did the November CAPA not address the scheduling gap?',
    answer: 'The investigation did not involve operations scheduling. Root cause: incomplete CAPA that addressed symptom (lack of treatment) but not systemic issue (schedule misalignment).',
    evidence: 'November investigation team did not include operations/scheduling personnel.',
  },

  // Investigation 10 (INC-2025-0012 - Third fall at Track 7)
  {
    investigationIndex: 10,
    sequence: 1,
    question: 'Why did a third fall occur at the Track 7 walkway despite two prior CAPAs?',
    answer: 'Both prior CAPAs addressed the ice on the surface (symptom) but not the underlying cause (drainage creating standing water that freezes).',
    evidence: 'Review of both prior CAPAs: CAPA-1 added ice treatment, CAPA-2 adjusted treatment timing. Neither addressed drainage.',
  },
  {
    investigationIndex: 10,
    sequence: 2,
    question: 'Why does ice form at this location more severely than other walkways?',
    answer: 'The walkway is in a topographic low point that collects surface water runoff. This water pools and freezes more readily than drained areas.',
    evidence: 'Site survey confirms walkway is 6 inches lower than surrounding grade. Drainage flow pattern directs water toward walkway.',
  },
  {
    investigationIndex: 10,
    sequence: 3,
    question: 'Why has the drainage issue not been corrected?',
    answer: 'Prior investigations identified ice treatment as the corrective action without examining why this location was worse than others. The drainage root cause was never identified.',
    evidence: 'Neither prior investigation included engineering or drainage assessment.',
  },
  {
    investigationIndex: 10,
    sequence: 4,
    question: 'Why did prior investigations not identify the drainage root cause?',
    answer: 'Investigation teams did not include engineering expertise. Investigations focused on behavioral and procedural corrections rather than physical/engineering conditions.',
    evidence: 'Prior investigation team composition: safety personnel only. No site engineers participated.',
  },
  {
    investigationIndex: 10,
    sequence: 5,
    question: 'Why was engineering expertise not included in investigation teams for recurring incidents?',
    answer: 'No escalation procedure existed for recurring incidents at the same location. Root cause: lack of a recurrence-triggered escalation process that brings in engineering and management resources.',
    evidence: 'Investigation SOPs reviewed - no escalation criteria for recurring incidents.',
  },

  // Investigation 6 (INC-2024-0014 - Worker on wrong track)
  {
    investigationIndex: 6,
    sequence: 1,
    question: 'Why was the worker on the wrong track?',
    answer: 'Worker misidentified Track 10 as Track 11 due to ambiguous track layout at the work location.',
    evidence: 'Worker statement: "I counted from the crossover and thought the first track was Track 11."',
  },
  {
    investigationIndex: 6,
    sequence: 2,
    question: 'Why was track identification ambiguous?',
    answer: 'No physical track number markers were present at the work location. Worker relied on counting tracks from a reference point.',
    evidence: 'Site inspection confirmed no track identification signs in the work area.',
  },
  {
    investigationIndex: 6,
    sequence: 3,
    question: 'Why were there no track markers at the work location?',
    answer: 'Track markers are permanent railroad property and not part of the construction work zone setup. The job briefing did not include walking the work limits.',
    evidence: 'Work zone setup checklist does not include track identification aids.',
  },

  // Investigation 8 (INC-2025-0004 - Hand strain torque wrench)
  {
    investigationIndex: 8,
    sequence: 1,
    question: 'Why did the torque wrench slip off the bolt?',
    answer: 'The socket was slightly oversized for the bolt head (15/16" socket on a 7/8" bolt).',
    evidence: 'Socket measured at 15/16". Bolt specification calls for 7/8" socket.',
  },
  {
    investigationIndex: 8,
    sequence: 2,
    question: 'Why was the wrong socket size being used?',
    answer: 'The correct 7/8" deep socket was not available in the tool room. Worker used the next available size.',
    evidence: 'Tool room inventory checked - 7/8" deep socket was checked out and not returned.',
  },
  {
    investigationIndex: 8,
    sequence: 3,
    question: 'Why did the worker use an incorrect tool rather than stopping work?',
    answer: 'Worker felt production pressure to complete the bolt torquing and improvised rather than waiting for the correct tool.',
    evidence: 'Worker statement: "We were behind schedule and I thought it would work."',
  },
  {
    investigationIndex: 8,
    sequence: 4,
    question: 'Why did the worker feel that production pressure overrode tool safety?',
    answer: 'Stop-work authority culture had not been effectively reinforced. Worker perceived schedule as higher priority than procedure compliance.',
    evidence: 'Anonymous crew survey showed 40% felt "some pressure" to improvise when tools unavailable.',
  },
];

export async function seedFiveWhy(prisma: PrismaClient, investigations: { id: string }[]) {
  const entries = [];
  for (const fw of FIVE_WHYS) {
    const { investigationIndex, ...data } = fw;
    const entry = await prisma.fiveWhyAnalysis.create({
      data: {
        ...data,
        investigationId: investigations[investigationIndex].id,
      },
    });
    entries.push(entry);
  }
  return entries;
}
