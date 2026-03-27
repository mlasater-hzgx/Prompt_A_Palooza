import { PrismaClient } from '@prisma/client';

interface WitnessStatementSeed {
  incidentIndex: number;
  witnessName: string;
  witnessTitle: string | null;
  witnessEmployer: string | null;
  witnessPhone: string | null;
  statementDate: string;
  statementText: string;
  collectedByIndex: number | null; // index into users array
}

const STATEMENTS: WitnessStatementSeed[] = [
  // INC-2024-0001 (index 0) - Slip on wet ballast
  {
    incidentIndex: 0,
    witnessName: 'Frank Torres',
    witnessTitle: 'Track Laborer',
    witnessEmployer: 'Herzog',
    witnessPhone: '785-555-0121',
    statementDate: '2024-10-03',
    statementText: 'I was walking about 10 feet behind Carlos when I saw him slip. The ballast was wet from the morning dew. He went down hard on his left knee against the rail. I helped him up and we walked to the first aid station together. The area had been slippery all morning.',
    collectedByIndex: 2, // Mike Thompson
  },
  // INC-2024-0002 (index 1) - Near miss track machine clearance
  {
    incidentIndex: 1,
    witnessName: 'Larry Mitchell',
    witnessTitle: 'Tamper Operator',
    witnessEmployer: 'Herzog',
    witnessPhone: '785-555-0134',
    statementDate: '2024-10-08',
    statementText: 'I was operating the tamper and saw the flagman standing too close to the active track. I sounded the horn three times. He jumped back just in time. I estimate the tamper was about 15 feet from him when he moved. He should have been at least 25 feet from the rail.',
    collectedByIndex: 2,
  },
  {
    incidentIndex: 1,
    witnessName: 'Ray Gonzalez',
    witnessTitle: 'Flagman',
    witnessEmployer: 'Herzog',
    witnessPhone: '785-555-0142',
    statementDate: '2024-10-08',
    statementText: 'I was the flagman involved. I had stepped closer to the track to communicate with a worker on the other side. I heard the horn and immediately moved back. I acknowledge I was inside the minimum clearance distance. I should have used the radio instead of moving closer.',
    collectedByIndex: 2,
  },
  // INC-2024-0003 (index 2) - Strained back
  {
    incidentIndex: 2,
    witnessName: 'Paul Hernandez',
    witnessTitle: 'Track Worker',
    witnessEmployer: 'Herzog',
    witnessPhone: '816-555-0156',
    statementDate: '2024-10-15',
    statementText: 'I was working about 20 feet away. I heard Derek grunt and saw him drop the joint bar. He was holding his lower back and couldn\'t straighten up. He told me he tried to lift it by himself because his partner had walked away to get water. The joint bars are supposed to be a two-person lift.',
    collectedByIndex: 2,
  },
  // INC-2024-0004 (index 3) - Signal cable damage
  {
    incidentIndex: 3,
    witnessName: 'Tom Bradley',
    witnessTitle: 'Backhoe Operator',
    witnessEmployer: 'Herzog',
    witnessPhone: '404-555-0178',
    statementDate: '2024-10-22',
    statementText: 'I was operating the backhoe for the signal foundation excavation. I had the utility locate marks visible and was digging carefully. The cable was about 6 inches outside the marked tolerance zone. When I felt the bucket grab something, I stopped immediately but the cable was already severed.',
    collectedByIndex: 3, // Lisa Rodriguez
  },
  // INC-2024-0010 (index 9) - Fall on icy walkway
  {
    incidentIndex: 9,
    witnessName: 'Doug Freeman',
    witnessTitle: 'Track Laborer',
    witnessEmployer: 'Herzog',
    witnessPhone: '785-555-0189',
    statementDate: '2024-11-22',
    statementText: 'I was walking ahead of Brian on the walkway to Track 7. I could tell it was slick but was being extra careful. I heard Brian yell and turned around to see him on the ground. He hit his right hip hard. The walkway was covered in black ice. There was no salt or sand on the walkway that morning.',
    collectedByIndex: 2,
  },
  {
    incidentIndex: 9,
    witnessName: 'Amy Nguyen',
    witnessTitle: 'Safety Technician',
    witnessEmployer: 'Herzog',
    witnessPhone: '785-555-0195',
    statementDate: '2024-11-22',
    statementText: 'I arrived at the scene about 5 minutes after the fall. Brian was sitting on the ground, clearly in pain. I checked the walkway conditions and confirmed black ice was present across the entire walkway from Track 7 to the equipment shed, approximately 200 feet. No ice melt had been applied that morning.',
    collectedByIndex: 2,
  },
  // INC-2024-0012 (index 11) - Slip on frozen ballast, head
  {
    incidentIndex: 11,
    witnessName: 'Keith Jackson',
    witnessTitle: 'Foreman',
    witnessEmployer: 'Herzog',
    witnessPhone: '785-555-0201',
    statementDate: '2024-12-02',
    statementText: 'Ryan was carrying a rail wrench to the work area when his feet went out from under him. He fell backwards and his head hit the rail. Thank God he was wearing his hard hat. But he said he was dizzy right after. I called for transport to the hospital right away. The frost was heavy that morning and the ballast was like glass.',
    collectedByIndex: 2,
  },
  // INC-2024-0014 (index 13) - Worker on wrong track
  {
    incidentIndex: 13,
    witnessName: 'Randy Phillips',
    witnessTitle: 'Flagman',
    witnessEmployer: 'Herzog',
    witnessPhone: '816-555-0214',
    statementDate: '2024-12-10',
    statementText: 'I was positioned at the east end of the work zone. I saw the yard engine coming on Track 10 and then realized our guy was on Track 10 instead of Track 11. I blew my horn and radioed simultaneously. He looked up, saw the engine, and stepped over to Track 11 with maybe 100 feet to spare. The engine was only going about 10 mph but it was still too close.',
    collectedByIndex: 2,
  },
  // INC-2025-0001 (index 17) - Slip on ice repeat
  {
    incidentIndex: 17,
    witnessName: 'Doug Freeman',
    witnessTitle: 'Track Laborer',
    witnessEmployer: 'Herzog',
    witnessPhone: '785-555-0189',
    statementDate: '2025-01-06',
    statementText: 'This is the same walkway where Brian fell back in November. I reported then that the ice treatment wasn\'t being done consistently. This morning, Steve slipped in almost the exact same spot. The ice melt from yesterday had washed away and it re-froze overnight. Nobody had treated the walkway before our shift started at 6:30.',
    collectedByIndex: 2,
  },
  {
    incidentIndex: 17,
    witnessName: 'Amy Nguyen',
    witnessTitle: 'Safety Technician',
    witnessEmployer: 'Herzog',
    witnessPhone: '785-555-0195',
    statementDate: '2025-01-06',
    statementText: 'This is now the second significant slip/fall at the Track 7 walkway in less than two months. After the November incident, a CAPA was issued requiring daily ice treatment before shift start. The maintenance crew was supposed to apply treatment by 6:00 AM but they did not do so this morning. The log shows no entry for January 6.',
    collectedByIndex: 2,
  },
  // INC-2025-0007 (index 23) - Finger pinch in coupler
  {
    incidentIndex: 23,
    witnessName: 'Dennis Carter',
    witnessTitle: 'Equipment Operator',
    witnessEmployer: 'Herzog',
    witnessPhone: '816-555-0227',
    statementDate: '2025-01-30',
    statementText: 'Kevin was guiding the coupler alignment by hand, which we\'re told not to do. The equipment moved slightly and his finger got caught between the knuckle and the body. He screamed and pulled his hand out. His finger was already turning purple. I know it\'s tempting to reach in and align things by hand, but the alignment tool is there for a reason.',
    collectedByIndex: 2,
  },
  // INC-2025-0011 (index 27) - Trench wall collapse
  {
    incidentIndex: 27,
    witnessName: 'Rick Morrison',
    witnessTitle: 'Excavator Operator',
    witnessEmployer: 'Herzog',
    witnessPhone: '404-555-0234',
    statementDate: '2025-02-17',
    statementText: 'I saw Tommy climb out of the trench to get a tool from the truck. Maybe 30 seconds later, the whole wall just let go. Probably 3 or 4 cubic yards of wet soil slid into the trench right where he had been standing. If he had been 30 seconds later getting out, he would have been buried. The soil was saturated from two days of rain.',
    collectedByIndex: 3,
  },
  {
    incidentIndex: 27,
    witnessName: 'Thomas Rivera',
    witnessTitle: 'Cable Technician',
    witnessEmployer: 'Herzog',
    witnessPhone: '404-555-0241',
    statementDate: '2025-02-17',
    statementText: 'I was the one in the trench. I had gone down to retrieve my cable tester that I left at the bottom. When I climbed out and walked maybe 10 steps, I heard a rumble and turned around to see the wall collapse. I felt sick to my stomach realizing I was just standing there. The trench was about 5 feet deep with no shoring.',
    collectedByIndex: 3,
  },
  // INC-2025-0012 (index 28) - Fall on icy ballast third time
  {
    incidentIndex: 28,
    witnessName: 'Doug Freeman',
    witnessTitle: 'Track Laborer',
    witnessEmployer: 'Herzog',
    witnessPhone: '785-555-0189',
    statementDate: '2025-02-20',
    statementText: 'This is now the THIRD fall at the same Track 7 walkway. I have personally witnessed all three. The ice management plan from the January CAPA was not executed this morning because our crew arrived at 6:15, before the maintenance crew started at 6:30. The work schedule and the ice treatment schedule don\'t align. This needs to be fixed.',
    collectedByIndex: 2,
  },
  // INC-2025-0015 (index 31) - Excavator near power line
  {
    incidentIndex: 31,
    witnessName: 'Howard Klein',
    witnessTitle: 'Spotter',
    witnessEmployer: 'Herzog',
    witnessPhone: '404-555-0256',
    statementDate: '2025-03-10',
    statementText: 'I was supposed to be spotting for the excavator but I received a phone call from my supervisor about an unrelated issue. I took the call and took my eyes off the excavator for about a minute. When I looked back, the boom was within a couple feet of the power line. I yelled at the operator to stop. I take full responsibility for the distraction.',
    collectedByIndex: 3,
  },
  // INC-2025-0025 (index 41) - Fall protection anchor failure
  {
    incidentIndex: 41,
    witnessName: 'Greg Sullivan',
    witnessTitle: 'Ironworker Foreman',
    witnessEmployer: 'Coastal Bridge Builders Inc',
    witnessPhone: '757-555-0267',
    statementDate: '2025-05-10',
    statementText: 'I heard a scraping sound and turned to see the anchor bolt sliding out of the concrete. The worker grabbed onto the rebar cage instinctively. The anchor had been installed with only 2 inches of embedment when the minimum is 4 inches. I don\'t know who installed it but it clearly wasn\'t checked by anyone qualified.',
    collectedByIndex: 3,
  },
  // INC-2025-0027 (index 43) - Thermite welding burn
  {
    incidentIndex: 43,
    witnessName: 'Vernon Hill',
    witnessTitle: 'Welder Helper',
    witnessEmployer: 'Herzog',
    witnessPhone: '785-555-0278',
    statementDate: '2025-05-20',
    statementText: 'Patrick is one of our most experienced welders. He set the mold up properly but when the thermite ignited, there was a pop and molten steel sprayed out the side. Patrick said he thought there might have been moisture in the mold but it passed the visual check. The splash went about 4 feet and a glob hit his arm. His FR shirt burned through in seconds.',
    collectedByIndex: 2,
  },
  // INC-2025-0029 (index 45) - Heat stroke
  {
    incidentIndex: 45,
    witnessName: 'Brian Mitchell',
    witnessTitle: 'Foreman',
    witnessEmployer: 'Herzog',
    witnessPhone: '785-555-0189',
    statementDate: '2025-06-05',
    statementText: 'Anthony was assigned to the flagging position at milepost 44. There was no shade available. I had set water coolers at 200-foot intervals but Anthony was 400 feet from the nearest one. When I checked on him at 3 PM, he was slurring his words and his skin was red and hot. I called 911 immediately. His temp was 104 when the medics arrived.',
    collectedByIndex: 2,
  },
  {
    incidentIndex: 45,
    witnessName: 'Jessica Martinez',
    witnessTitle: 'EMT',
    witnessEmployer: 'Shawnee County EMS',
    witnessPhone: '785-555-0290',
    statementDate: '2025-06-05',
    statementText: 'We arrived on scene at approximately 15:12. Patient was conscious but confused and disoriented. Skin was hot and dry. Core temperature measured at 104.2°F. We initiated rapid cooling with ice packs to neck, armpits, and groin. Established IV access and administered cold saline. Patient was transported to Stormont Vail ER priority 1.',
    collectedByIndex: 2,
  },
  // INC-2025-0033 (index 49) - Knee injury
  {
    incidentIndex: 49,
    witnessName: 'Andre Walker',
    witnessTitle: 'Track Laborer',
    witnessEmployer: 'Herzog',
    witnessPhone: '404-555-0301',
    statementDate: '2025-06-25',
    statementText: 'Chris was stepping along the ties heading to the next work spot. There was a spike sticking up about 2 inches higher than the others - it hadn\'t been fully driven. His boot caught on it and his knee twisted sideways. I could hear a pop from 10 feet away. He went down and couldn\'t put weight on it at all.',
    collectedByIndex: 3,
  },
  // INC-2025-0040 (index 56) - Back injury lifting form
  {
    incidentIndex: 56,
    witnessName: 'Marcus Freeman',
    witnessTitle: 'Carpenter',
    witnessEmployer: 'Coastal Bridge Builders Inc',
    witnessPhone: '757-555-0312',
    statementDate: '2025-08-08',
    statementText: 'Robert and I were moving a form panel that weighed about 120 pounds. We had it between us but my hand slipped because of sweat - it was really hot out. The full weight shifted to Robert and I heard him scream. He grabbed his back and went to his knees. He couldn\'t stand up afterwards. The ambulance took about 12 minutes to arrive.',
    collectedByIndex: 3,
  },
  // INC-2025-0052 (index 68) - Topeka annual pattern
  {
    incidentIndex: 68,
    witnessName: 'Doug Freeman',
    witnessTitle: 'Track Laborer',
    witnessEmployer: 'Herzog',
    witnessPhone: '785-555-0189',
    statementDate: '2025-11-03',
    statementText: 'I am providing yet another witness statement for a fall at the Track 7 walkway. This is at least the fifth one I have personally seen. The anti-slip grating that was installed after last winter\'s incidents has deteriorated and was not replaced. The frost this morning was heavy and the surface was as slick as I\'ve ever seen it. When will this be permanently fixed?',
    collectedByIndex: 2,
  },
  // INC-2025-0057 (index 73) - Fall from ladder
  {
    incidentIndex: 73,
    witnessName: 'Alan Parker',
    witnessTitle: 'Signal Technician',
    witnessEmployer: 'Herzog',
    witnessPhone: '303-555-0323',
    statementDate: '2025-12-02',
    statementText: 'Brandon was coming down the signal mast ladder. The rungs were covered in frost and he was wearing standard work boots, not the ice-cleats we had been issued. His right foot slipped off a rung about 8 feet up and he fell straight down, landing on his back on the ballast. He was conscious but in severe pain and couldn\'t move his legs at first.',
    collectedByIndex: 2,
  },
  {
    incidentIndex: 73,
    witnessName: 'Maria Gonzalez',
    witnessTitle: 'Paramedic',
    witnessEmployer: 'Denver Health EMS',
    witnessPhone: '303-555-0334',
    statementDate: '2025-12-02',
    statementText: 'We responded to a fall from height at BNSF rail yard. Patient was a 28-year-old male, conscious and alert, complaining of severe thoracic back pain. Spinal immobilization applied. Sensation and motor function intact in all extremities, though patient reported numbness in legs initially that resolved during transport. Transported to Denver Health.',
    collectedByIndex: 2,
  },
  // INC-2025-0060 (index 76) - Slip on icy platform 6th
  {
    incidentIndex: 76,
    witnessName: 'Doug Freeman',
    witnessTitle: 'Track Laborer',
    witnessEmployer: 'Herzog',
    witnessPhone: '785-555-0189',
    statementDate: '2025-12-22',
    statementText: 'Sixth time at this location. I feel like I\'m writing the same statement over and over. This morning\'s fall was exactly like the others - ice on the walkway, no pre-treatment, worker goes down. The prior CAPAs have all been band-aids. We need a permanent solution - covered walkway, heated mats, or re-routing the walkway entirely.',
    collectedByIndex: 2,
  },
  // INC-2026-0006 (index 82) - 7th slip at same location
  {
    incidentIndex: 82,
    witnessName: 'Doug Freeman',
    witnessTitle: 'Track Laborer',
    witnessEmployer: 'Herzog',
    witnessPhone: '785-555-0189',
    statementDate: '2026-02-02',
    statementText: 'Seven times. This is the seventh documented incident at the Track 7 walkway. Austin went down hard on his back. He was in serious pain and his legs went numb for a few minutes. An ambulance was called. I have been a witness to every single one of these incidents. Each time we do a CAPA and each time the problem comes back. This location needs to be shut down until a permanent engineering solution is in place.',
    collectedByIndex: 2,
  },
  {
    incidentIndex: 82,
    witnessName: 'Keith Jackson',
    witnessTitle: 'Foreman',
    witnessEmployer: 'Herzog',
    witnessPhone: '785-555-0201',
    statementDate: '2026-02-02',
    statementText: 'As the foreman, I have to take responsibility for allowing work to continue at a location with a known chronic hazard. Each time we implemented a CAPA - ice melt, anti-slip grating, schedule changes - something failed. The root cause is that this walkway is in a low-lying area that collects water and freezes. No surface treatment alone will fix it. We need an engineered solution or an alternative route.',
    collectedByIndex: 2,
  },
];

export async function seedWitnessStatements(
  prisma: PrismaClient,
  incidents: { id: string }[],
  users: { id: string }[],
) {
  const statements = [];
  for (const ws of STATEMENTS) {
    const { incidentIndex, collectedByIndex, statementDate, ...data } = ws;
    const statement = await prisma.witnessStatement.create({
      data: {
        ...data,
        incidentId: incidents[incidentIndex].id,
        collectedById: collectedByIndex !== null ? users[collectedByIndex].id : null,
        statementDate: new Date(statementDate + 'T00:00:00.000Z'),
      },
    });
    statements.push(statement);
  }
  return statements;
}
