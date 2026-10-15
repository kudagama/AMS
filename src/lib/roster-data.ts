export interface DailyBreakIntervals {
  interval1: string; // e.g. "Tea1=17:00" or "Night Rest=23:00"
  interval2: string; // e.g. "Tea2=19:35" or "Morning Break=5:45"
  interval3: string; // e.g. "Lunch or Dinner=14:35"
}

export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface DayShiftSchedule {
  dayName: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
  dateStr: string; // e.g. "19.10.2026"
  fullDate: string; // e.g. "2026-10-19"
  shift: string;
  intervals: DailyBreakIntervals;
}

export interface AgentRosterRecord {
  no: number;
  svn: string; // Service Number / SVC NO, e.g. "21094"
  name: string;
  cc: string; // Cost Center / Group: "CO", "KY", "MH", "PR", "BW", "BC", "KE", "KT"
  schedule: Record<DayKey, DayShiftSchedule>;
}

export const ROSTER_DAYS: { key: DayKey; label: string; dateStr: string; fullDate: string }[] = [
  { key: 'mon', label: 'Mon', dateStr: '19.10.2026', fullDate: '2026-10-19' },
  { key: 'tue', label: 'Tue', dateStr: '20.10.2026', fullDate: '2026-10-20' },
  { key: 'wed', label: 'Wed', dateStr: '21.10.2026', fullDate: '2026-10-21' },
  { key: 'thu', label: 'Thu', dateStr: '22.10.2026', fullDate: '2026-10-22' },
  { key: 'fri', label: 'Fri', dateStr: '23.10.2026', fullDate: '2026-10-23' },
  { key: 'sat', label: 'Sat', dateStr: '24.10.2026', fullDate: '2026-10-24' },
  { key: 'sun', label: 'Sun', dateStr: '25.10.2026', fullDate: '2026-10-25' },
];

function makeSchedule(
  shifts: [string, string, string, string, string, string, string],
  wedIntervals: DailyBreakIntervals = { interval1: 'Tea1=0:00', interval2: 'Tea2=0:00', interval3: 'Lunch or Dinner=0:00' },
  thuIntervals: DailyBreakIntervals = { interval1: 'Tea1=0:00', interval2: 'Tea2=0:00', interval3: 'Lunch or Dinner=0:00' }
): Record<DayKey, DayShiftSchedule> {
  const getIntervalsForShift = (shift: string, day: DayKey): DailyBreakIntervals => {
    if (day === 'wed') return wedIntervals;
    if (day === 'thu') return thuIntervals;

    if (shift === 'Off') {
      return { interval1: 'Tea1=0:00', interval2: 'Tea2=0:00', interval3: 'Lunch or Dinner=0:00' };
    }
    if (shift === 'Night Off') {
      return { interval1: 'Night Rest=2:00', interval2: 'Morning Break=6:15', interval3: 'Lunch or Dinner=0:00' };
    }
    if (shift === '7:00 AM - 3:00 PM') {
      return { interval1: 'Tea1=8:00', interval2: 'Tea2=10:35', interval3: 'Lunch or Dinner=13:20' };
    }
    if (shift === '8:00 AM - 4:00 PM') {
      return { interval1: 'Tea1=9:10', interval2: 'Tea2=14:10', interval3: 'Lunch or Dinner=12:20' };
    }
    if (shift === '9:00 AM - 5:00 PM') {
      return { interval1: 'Tea1=10:15', interval2: 'Tea2=15:10', interval3: 'Lunch or Dinner=12:50' };
    }
    if (shift === '1:00 PM - 10:00 PM') {
      return { interval1: 'Tea1=17:20', interval2: 'Tea2=19:30', interval3: 'Lunch or Dinner=14:15' };
    }
    if (shift === '4:00 PM - 8:00 AM') {
      return { interval1: 'Tea1=18:15', interval2: 'Tea2=0:00', interval3: 'Lunch or Dinner=20:45' };
    }
    return { interval1: 'Tea1=0:00', interval2: 'Tea2=0:00', interval3: 'Lunch or Dinner=0:00' };
  };

  const days: DayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  const res: any = {};
  days.forEach((d, idx) => {
    const shift = shifts[idx];
    res[d] = {
      dayName: ROSTER_DAYS[idx].label,
      dateStr: ROSTER_DAYS[idx].dateStr,
      fullDate: ROSTER_DAYS[idx].fullDate,
      shift,
      intervals: getIntervalsForShift(shift, d),
    };
  });
  return res;
}

export const CONTACT_CENTER_ROSTER: AgentRosterRecord[] = [
  {
    no: 1,
    svn: '20849',
    name: 'D M A D E Liyanage',
    cc: 'KY',
    schedule: makeSchedule(
      ['4:00 PM - 8:00 AM', 'Night Off', 'Off', '1:00 PM - 10:00 PM', '1:00 PM - 10:00 PM', '7:00 AM - 3:00 PM', 'Off'],
      { interval1: 'Tea1=0:00', interval2: 'Tea2=0:00', interval3: 'Lunch or Dinner=0:00' },
      { interval1: 'Tea1=17:25', interval2: 'Tea2=19:40', interval3: 'Lunch or Dinner=14:05' }
    ),
  },
  {
    no: 2,
    svn: '20850',
    name: 'H M K Avishka',
    cc: 'MH',
    schedule: makeSchedule(
      ['Off', '1:00 PM - 10:00 PM', '7:00 AM - 3:00 PM', 'Off', '4:00 PM - 8:00 AM', 'Night Off', '1:00 PM - 10:00 PM'],
      { interval1: 'Tea1=8:00', interval2: 'Tea2=10:35', interval3: 'Lunch or Dinner=13:20' },
      { interval1: 'Tea1=0:00', interval2: 'Tea2=0:00', interval3: 'Lunch or Dinner=0:00' }
    ),
  },
  {
    no: 3,
    svn: '20851',
    name: 'R A Udayananda',
    cc: 'PR',
    schedule: makeSchedule(
      ['1:00 PM - 10:00 PM', 'Off', '4:00 PM - 8:00 AM', 'Night Off', '8:00 AM - 4:00 PM', '1:00 PM - 10:00 PM', 'Off'],
      { interval1: 'Tea1=18:15', interval2: 'Tea2=0:00', interval3: 'Lunch or Dinner=20:45' },
      { interval1: 'Night Rest=2:00', interval2: 'Morning Break=6:15', interval3: 'Lunch or Dinner=0:00' }
    ),
  },
  {
    no: 4,
    svn: '20852',
    name: 'D M D Pabasara',
    cc: 'MH',
    schedule: makeSchedule(
      ['7:00 AM - 3:00 PM', '1:00 PM - 10:00 PM', '8:00 AM - 4:00 PM', 'Off', '1:00 PM - 10:00 PM', 'Off', '4:00 PM - 8:00 AM'],
      { interval1: 'Tea1=8:00', interval2: 'Tea2=10:30', interval3: 'Lunch or Dinner=13:25' },
      { interval1: 'Tea1=0:00', interval2: 'Tea2=0:00', interval3: 'Lunch or Dinner=0:00' }
    ),
  },
  {
    no: 5,
    svn: '20853',
    name: 'J V Hettiarachchi',
    cc: 'BW',
    schedule: makeSchedule(
      ['1:00 PM - 10:00 PM', 'Off', '1:00 PM - 10:00 PM', '8:00 AM - 4:00 PM', 'Off', '4:00 PM - 8:00 AM', 'Night Off'],
      { interval1: 'Tea1=17:00', interval2: 'Tea2=19:35', interval3: 'Lunch or Dinner=14:35' },
      { interval1: 'Tea1=9:10', interval2: 'Tea2=14:10', interval3: 'Lunch or Dinner=12:15' }
    ),
  },
  {
    no: 6,
    svn: '20854',
    name: 'V Nithusan',
    cc: 'BC',
    schedule: makeSchedule(
      ['1:00 PM - 10:00 PM', '4:00 PM - 8:00 AM', 'Night Off', 'Off', '1:00 PM - 10:00 PM', '8:00 AM - 4:00 PM', 'Off'],
      { interval1: 'Night Rest=23:00', interval2: 'Morning Break=5:45', interval3: 'Lunch or Dinner=0:00' },
      { interval1: 'Tea1=0:00', interval2: 'Tea2=0:00', interval3: 'Lunch or Dinner=0:00' }
    ),
  },
  {
    no: 7,
    svn: '20857',
    name: 'R D S O Dharmasiri',
    cc: 'CO',
    schedule: makeSchedule(
      ['1:00 PM - 10:00 PM', '1:00 PM - 10:00 PM', '9:00 AM - 5:00 PM', 'Off', 'Off', '4:00 PM - 8:00 AM', 'Night Off'],
      { interval1: 'Tea1=10:15', interval2: 'Tea2=15:10', interval3: 'Lunch or Dinner=12:50' },
      { interval1: 'Tea1=0:00', interval2: 'Tea2=0:00', interval3: 'Lunch or Dinner=0:00' }
    ),
  },
  {
    no: 8,
    svn: '20858',
    name: 'U H D I De Silva',
    cc: 'KE',
    schedule: makeSchedule(
      ['Night Off', '1:00 PM - 10:00 PM', 'Off', '4:00 PM - 8:00 AM', 'Night Off', '1:00 PM - 10:00 PM', 'Off'],
      { interval1: 'Tea1=0:00', interval2: 'Tea2=0:00', interval3: 'Lunch or Dinner=0:00' },
      { interval1: 'Tea1=18:35', interval2: 'Tea2=0:00', interval3: 'Lunch or Dinner=21:05' }
    ),
  },
  {
    no: 9,
    svn: '20859',
    name: 'T Jesika',
    cc: 'BC',
    schedule: makeSchedule(
      ['1:00 PM - 10:00 PM', 'Off', 'Off', '1:00 PM - 10:00 PM', '4:00 PM - 8:00 AM', 'Night Off', '9:00 AM - 5:00 PM'],
      { interval1: 'Tea1=0:00', interval2: 'Tea2=0:00', interval3: 'Lunch or Dinner=0:00' },
      { interval1: 'Tea1=17:05', interval2: 'Tea2=19:35', interval3: 'Lunch or Dinner=14:10' }
    ),
  },
  {
    no: 10,
    svn: '20862',
    name: 'C N Somadasa',
    cc: 'MH',
    schedule: makeSchedule(
      ['Off', '4:00 PM - 8:00 AM', 'Night Off', '7:00 AM - 3:00 PM', '1:00 PM - 10:00 PM', 'Off', '1:00 PM - 10:00 PM'],
      { interval1: 'Night Rest=2:00', interval2: 'Morning Break=7:00', interval3: 'Lunch or Dinner=0:00' },
      { interval1: 'Tea1=8:00', interval2: 'Tea2=10:30', interval3: 'Lunch or Dinner=13:10' }
    ),
  },
  {
    no: 11,
    svn: '20864',
    name: 'H B S M Herath',
    cc: 'PR',
    schedule: makeSchedule(
      ['1:00 PM - 10:00 PM', 'Off', '4:00 PM - 8:00 AM', 'Night Off', 'Off', '1:00 PM - 10:00 PM', '8:00 AM - 4:00 PM'],
      { interval1: 'Tea1=18:35', interval2: 'Tea2=0:00', interval3: 'Lunch or Dinner=21:05' },
      { interval1: 'Night Rest=2:00', interval2: 'Morning Break=6:15', interval3: 'Lunch or Dinner=0:00' }
    ),
  },
  {
    no: 12,
    svn: '20865',
    name: 'A P G S M Jayarathne',
    cc: 'CO',
    schedule: makeSchedule(
      ['Off', '4:00 PM - 8:00 AM', 'Night Off', '1:00 PM - 10:00 PM', 'Off', '1:00 PM - 10:00 PM', '8:00 AM - 4:00 PM'],
      { interval1: 'Night Rest=2:00', interval2: 'Morning Break=7:00', interval3: 'Lunch or Dinner=0:00' },
      { interval1: 'Tea1=17:30', interval2: 'Tea2=19:35', interval3: 'Lunch or Dinner=14:30' }
    ),
  },
  {
    no: 13,
    svn: '20866',
    name: 'H A S Shashiprabha',
    cc: 'CO',
    schedule: makeSchedule(
      ['Night Off', '1:00 PM - 10:00 PM', 'Off', '4:00 PM - 8:00 AM', 'Night Off', 'Off', '1:00 PM - 10:00 PM'],
      { interval1: 'Tea1=0:00', interval2: 'Tea2=0:00', interval3: 'Lunch or Dinner=0:00' },
      { interval1: 'Tea1=18:35', interval2: 'Tea2=0:00', interval3: 'Lunch or Dinner=21:05' }
    ),
  },
  {
    no: 14,
    svn: '20867',
    name: 'M A W P Wickramathunga',
    cc: 'CO',
    schedule: makeSchedule(
      ['Night Off', 'Off', '1:00 PM - 10:00 PM', '1:00 PM - 10:00 PM', '4:00 PM - 8:00 AM', 'Night Off', 'Off'],
      { interval1: 'Tea1=17:35', interval2: 'Tea2=19:30', interval3: 'Lunch or Dinner=14:10' },
      { interval1: 'Tea1=17:00', interval2: 'Tea2=19:30', interval3: 'Lunch or Dinner=14:00' }
    ),
  },
  {
    no: 15,
    svn: '20868',
    name: 'G H A Thathsarani',
    cc: 'CO',
    schedule: makeSchedule(
      ['4:00 PM - 8:00 AM', 'Night Off', '8:00 AM - 4:00 PM', '1:00 PM - 10:00 PM', 'Off', 'Off', '1:00 PM - 10:00 PM'],
      { interval1: 'Tea1=9:25', interval2: 'Tea2=14:20', interval3: 'Lunch or Dinner=12:20' },
      { interval1: 'Tea1=17:25', interval2: 'Tea2=19:40', interval3: 'Lunch or Dinner=14:05' }
    ),
  },
  {
    no: 16,
    svn: '20869',
    name: 'N M Ayoshani',
    cc: 'CO',
    schedule: makeSchedule(
      ['Off', '4:00 PM - 8:00 AM', 'Night Off', '1:00 PM - 10:00 PM', '1:00 PM - 10:00 PM', '8:00 AM - 4:00 PM', 'Off'],
      { interval1: 'Night Rest=2:00', interval2: 'Morning Break=6:15', interval3: 'Lunch or Dinner=0:00' },
      { interval1: 'Tea1=17:15', interval2: 'Tea2=19:45', interval3: 'Lunch or Dinner=14:30' }
    ),
  },
  {
    no: 17,
    svn: '20870',
    name: 'R M G D Rathnayake',
    cc: 'KY',
    schedule: makeSchedule(
      ['Night Off', '1:00 PM - 10:00 PM', 'Off', '4:00 PM - 8:00 AM', 'Night Off', 'Off', '9:00 AM - 5:00 PM'],
      { interval1: 'Tea1=0:00', interval2: 'Tea2=0:00', interval3: 'Lunch or Dinner=0:00' },
      { interval1: 'Tea1=18:00', interval2: 'Tea2=0:00', interval3: 'Lunch or Dinner=20:30' }
    ),
  },
  {
    no: 18,
    svn: '20871',
    name: 'P A S N P Arachchi',
    cc: 'KE',
    schedule: makeSchedule(
      ['Night Off', '1:00 PM - 10:00 PM', 'Off', '4:00 PM - 8:00 AM', 'Night Off', '1:00 PM - 10:00 PM', 'Off'],
      { interval1: 'Tea1=0:00', interval2: 'Tea2=0:00', interval3: 'Lunch or Dinner=0:00' },
      { interval1: 'Tea1=18:00', interval2: 'Tea2=0:00', interval3: 'Lunch or Dinner=20:30' }
    ),
  },
  {
    no: 19,
    svn: '20872',
    name: 'A Nivilidinusha',
    cc: 'BC',
    schedule: makeSchedule(
      ['1:00 PM - 10:00 PM', 'Off', 'Off', '1:00 PM - 10:00 PM', '4:00 PM - 8:00 AM', 'Night Off', '7:00 AM - 3:00 PM'],
      { interval1: 'Tea1=0:00', interval2: 'Tea2=0:00', interval3: 'Lunch or Dinner=0:00' },
      { interval1: 'Tea1=17:20', interval2: 'Tea2=19:30', interval3: 'Lunch or Dinner=14:05' }
    ),
  },
  {
    no: 20,
    svn: '20874',
    name: 'H D V Sathsarani',
    cc: 'KT',
    schedule: makeSchedule(
      ['Off', '4:00 PM - 8:00 AM', 'Night Off', '1:00 PM - 10:00 PM', '1:00 PM - 10:00 PM', 'Off', '8:00 AM - 4:00 PM'],
      { interval1: 'Night Rest=2:00', interval2: 'Morning Break=7:00', interval3: 'Lunch or Dinner=0:00' },
      { interval1: 'Tea1=17:30', interval2: 'Tea2=19:35', interval3: 'Lunch or Dinner=14:30' }
    ),
  },
  {
    no: 21,
    svn: '20875',
    name: 'D A R Dasanayaka',
    cc: 'KE',
    schedule: makeSchedule(
      ['Night Off', '1:00 PM - 10:00 PM', 'Off', '4:00 PM - 8:00 AM', 'Night Off', '1:00 PM - 10:00 PM', 'Off'],
      { interval1: 'Tea1=0:00', interval2: 'Tea2=0:00', interval3: 'Lunch or Dinner=0:00' },
      { interval1: 'Tea1=18:15', interval2: 'Tea2=0:00', interval3: 'Lunch or Dinner=20:45' }
    ),
  },
  {
    no: 22,
    svn: '20876',
    name: 'H R Hansani',
    cc: 'KT',
    schedule: makeSchedule(
      ['4:00 PM - 8:00 AM', 'Night Off', 'Off', '1:00 PM - 10:00 PM', '1:00 PM - 10:00 PM', '9:00 AM - 5:00 PM', 'Off'],
      { interval1: 'Tea1=0:00', interval2: 'Tea2=0:00', interval3: 'Lunch or Dinner=0:00' },
      { interval1: 'Tea1=17:20', interval2: 'Tea2=19:30', interval3: 'Lunch or Dinner=14:15' }
    ),
  },
  {
    no: 23,
    svn: '20877',
    name: 'W P A S Tharika',
    cc: 'MH',
    schedule: makeSchedule(
      ['8:00 AM - 4:00 PM', '1:00 PM - 10:00 PM', 'Off', 'Off', '4:00 PM - 8:00 AM', 'Night Off', '1:00 PM - 10:00 PM'],
      { interval1: 'Tea1=0:00', interval2: 'Tea2=0:00', interval3: 'Lunch or Dinner=0:00' },
      { interval1: 'Tea1=0:00', interval2: 'Tea2=0:00', interval3: 'Lunch or Dinner=0:00' }
    ),
  },
  {
    no: 24,
    svn: '20878',
    name: 'P G P N Jayawardhana',
    cc: 'MH',
    schedule: makeSchedule(
      ['Off', '4:00 PM - 8:00 AM', 'Night Off', 'Off', '1:00 PM - 10:00 PM', '9:00 AM - 5:00 PM', '1:00 PM - 10:00 PM'],
      { interval1: 'Night Rest=23:00', interval2: 'Morning Break=5:45', interval3: 'Lunch or Dinner=0:00' },
      { interval1: 'Tea1=0:00', interval2: 'Tea2=0:00', interval3: 'Lunch or Dinner=0:00' }
    ),
  },
  {
    no: 25,
    svn: '20879',
    name: 'F F Rihaf',
    cc: 'PR',
    schedule: makeSchedule(
      ['1:00 PM - 10:00 PM', 'Off', '4:00 PM - 8:00 AM', 'Night Off', '9:00 AM - 5:00 PM', '1:00 PM - 10:00 PM', 'Off'],
      { interval1: 'Tea1=18:35', interval2: 'Tea2=0:00', interval3: 'Lunch or Dinner=21:05' },
      { interval1: 'Night Rest=2:00', interval2: 'Morning Break=6:15', interval3: 'Lunch or Dinner=0:00' }
    ),
  },
  {
    no: 26,
    svn: '20986',
    name: 'P. S. Ekanayake',
    cc: 'PR',
    schedule: makeSchedule(
      ['1:00 PM - 10:00 PM', '8:00 AM - 4:00 PM', '4:00 PM - 8:00 AM', 'Night Off', 'Off', 'Off', '1:00 PM - 10:00 PM'],
      { interval1: 'Tea1=18:00', interval2: 'Tea2=0:00', interval3: 'Lunch or Dinner=20:30' },
      { interval1: 'Night Rest=23:00', interval2: 'Morning Break=5:45', interval3: 'Lunch or Dinner=0:00' }
    ),
  },
  {
    no: 27,
    svn: '21094',
    name: 'Saveen Aruditha Kudagama',
    cc: 'CO',
    schedule: makeSchedule(
      ['Off', '7:00 AM - 3:00 PM', '1:00 PM - 10:00 PM', '1:00 PM - 10:00 PM', '8:00 AM - 4:00 PM', 'Off', '4:00 PM - 8:00 AM'],
      { interval1: 'Tea1=17:00', interval2: 'Tea2=19:30', interval3: 'Lunch or Dinner=14:15' },
      { interval1: 'Tea1=17:25', interval2: 'Tea2=19:30', interval3: 'Lunch or Dinner=14:10' }
    ),
  },
  {
    no: 28,
    svn: '21096',
    name: 'P.K.M.Kisara Githmi Peramune',
    cc: 'CO',
    schedule: makeSchedule(
      ['1:00 PM - 10:00 PM', '8:00 AM - 4:00 PM', 'Off', '4:00 PM - 8:00 AM', 'Night Off', '1:00 PM - 10:00 PM', 'Off'],
      { interval1: 'Tea1=0:00', interval2: 'Tea2=0:00', interval3: 'Lunch or Dinner=0:00' },
      { interval1: 'Tea1=18:15', interval2: 'Tea2=0:00', interval3: 'Lunch or Dinner=20:45' }
    ),
  },
  {
    no: 29,
    svn: '21097',
    name: 'Samudya Sathsaran',
    cc: 'CO',
    schedule: makeSchedule(
      ['4:00 PM - 8:00 AM', 'Night Off', 'Off', '1:00 PM - 10:00 PM', 'Off', '8:00 AM - 4:00 PM', '1:00 PM - 10:00 PM'],
      { interval1: 'Tea1=0:00', interval2: 'Tea2=0:00', interval3: 'Lunch or Dinner=0:00' },
      { interval1: 'Tea1=17:30', interval2: 'Tea2=19:35', interval3: 'Lunch or Dinner=14:00' }
    ),
  },
  {
    no: 30,
    svn: '21098',
    name: 'Adhithya Nethrani Gajanayake',
    cc: 'CO',
    schedule: makeSchedule(
      ['Night Off', '1:00 PM - 10:00 PM', '1:00 PM - 10:00 PM', 'Off', 'Off', '4:00 PM - 8:00 AM', 'Night Off'],
      { interval1: 'Tea1=17:30', interval2: 'Tea2=19:35', interval3: 'Lunch or Dinner=14:05' },
      { interval1: 'Tea1=0:00', interval2: 'Tea2=0:00', interval3: 'Lunch or Dinner=0:00' }
    ),
  },
  {
    no: 31,
    svn: '21099',
    name: 'L.P.Erangi Perera',
    cc: 'CO',
    schedule: makeSchedule(
      ['1:00 PM - 10:00 PM', 'Off', '4:00 PM - 8:00 AM', 'Night Off', '7:00 AM - 3:00 PM', 'Off', '1:00 PM - 10:00 PM'],
      { interval1: 'Tea1=18:00', interval2: 'Tea2=0:00', interval3: 'Lunch or Dinner=20:30' },
      { interval1: 'Night Rest=23:00', interval2: 'Morning Break=5:45', interval3: 'Lunch or Dinner=0:00' }
    ),
  },
  {
    no: 32,
    svn: '21100',
    name: 'P.K.D.Shashini Dilasha Panditha',
    cc: 'CO',
    schedule: makeSchedule(
      ['Night Off', 'Off', '1:00 PM - 10:00 PM', 'Off', '4:00 PM - 8:00 AM', 'Night Off', '1:00 PM - 10:00 PM'],
      { interval1: 'Tea1=17:05', interval2: 'Tea2=19:35', interval3: 'Lunch or Dinner=14:10' },
      { interval1: 'Tea1=0:00', interval2: 'Tea2=0:00', interval3: 'Lunch or Dinner=0:00' }
    ),
  },
  {
    no: 33,
    svn: '21101',
    name: 'Sanduni Chathurika Weerasekara',
    cc: 'KY',
    schedule: makeSchedule(
      ['4:00 PM - 8:00 AM', 'Night Off', 'Off', '1:00 PM - 10:00 PM', '1:00 PM - 10:00 PM', 'Off', '8:00 AM - 4:00 PM'],
      { interval1: 'Tea1=0:00', interval2: 'Tea2=0:00', interval3: 'Lunch or Dinner=0:00' },
      { interval1: 'Tea1=17:30', interval2: 'Tea2=19:30', interval3: 'Lunch or Dinner=14:00' }
    ),
  },
  {
    no: 34,
    svn: '21218',
    name: 'U A Roshani Shashikala',
    cc: 'CO',
    schedule: makeSchedule(
      ['9:00 AM - 5:00 PM', '1:00 PM - 10:00 PM', '1:00 PM - 10:00 PM', '8:00 AM - 4:00 PM', 'Off', 'Off', '4:00 PM - 8:00 AM'],
      { interval1: 'Tea1=17:20', interval2: 'Tea2=19:30', interval3: 'Lunch or Dinner=14:05' },
      { interval1: 'Tea1=9:20', interval2: 'Tea2=14:20', interval3: 'Lunch or Dinner=12:30' }
    ),
  },
  {
    no: 35,
    svn: '21219',
    name: 'V G T Virajini Perera',
    cc: 'PR',
    schedule: makeSchedule(
      ['Off', 'Off', '4:00 PM - 8:00 AM', 'Night Off', '1:00 PM - 10:00 PM', '1:00 PM - 10:00 PM', '9:00 AM - 5:00 PM'],
      { interval1: 'Tea1=18:15', interval2: 'Tea2=0:00', interval3: 'Lunch or Dinner=20:45' },
      { interval1: 'Night Rest=2:00', interval2: 'Morning Break=6:15', interval3: 'Lunch or Dinner=0:00' }
    ),
  },
  {
    no: 36,
    svn: '21220',
    name: 'K V D O Sewmini Vithana',
    cc: 'CO',
    schedule: makeSchedule(
      ['8:00 AM - 4:00 PM', '1:00 PM - 10:00 PM', '1:00 PM - 10:00 PM', 'Off', 'Off', '4:00 PM - 8:00 AM', 'Night Off'],
      { interval1: 'Tea1=17:30', interval2: 'Tea2=19:35', interval3: 'Lunch or Dinner=14:30' },
      { interval1: 'Tea1=0:00', interval2: 'Tea2=0:00', interval3: 'Lunch or Dinner=0:00' }
    ),
  },
  {
    no: 37,
    svn: '21221',
    name: 'O M D S K Dissanayake',
    cc: 'CO',
    schedule: makeSchedule(
      ['4:00 PM - 8:00 AM', 'Night Off', '1:00 PM - 10:00 PM', 'Off', '1:00 PM - 10:00 PM', '9:00 AM - 5:00 PM', 'Off'],
      { interval1: 'Tea1=17:00', interval2: 'Tea2=19:30', interval3: 'Lunch or Dinner=14:00' },
      { interval1: 'Tea1=0:00', interval2: 'Tea2=0:00', interval3: 'Lunch or Dinner=0:00' }
    ),
  },
  {
    no: 38,
    svn: '21260',
    name: 'P. V.D. S. C Senadeera',
    cc: 'CO',
    schedule: makeSchedule(
      ['Off', '9:00 AM - 5:00 PM', '1:00 PM - 10:00 PM', '4:00 PM - 8:00 AM', 'Night Off', 'Off', '1:00 PM - 10:00 PM'],
      { interval1: 'Tea1=17:25', interval2: 'Tea2=19:40', interval3: 'Lunch or Dinner=14:05' },
      { interval1: 'Tea1=18:00', interval2: 'Tea2=0:00', interval3: 'Lunch or Dinner=20:30' }
    ),
  },
  {
    no: 39,
    svn: '21307',
    name: 'W. A. H. B. D. Fernando',
    cc: 'CO',
    schedule: makeSchedule(
      ['1:00 PM - 10:00 PM', '4:00 PM - 8:00 AM', 'Night Off', 'Off', 'Off', '1:00 PM - 10:00 PM', '8:00 AM - 4:00 PM'],
      { interval1: 'Night Rest=23:00', interval2: 'Morning Break=5:45', interval3: 'Lunch or Dinner=0:00' },
      { interval1: 'Tea1=0:00', interval2: 'Tea2=0:00', interval3: 'Lunch or Dinner=0:00' }
    ),
  },
  {
    no: 40,
    svn: '21308',
    name: 'W. Dilsi',
    cc: 'CO',
    schedule: makeSchedule(
      ['4:00 PM - 8:00 AM', 'Night Off', 'Off', 'Off', '1:00 PM - 10:00 PM', '8:00 AM - 4:00 PM', '1:00 PM - 10:00 PM'],
      { interval1: 'Tea1=0:00', interval2: 'Tea2=0:00', interval3: 'Lunch or Dinner=0:00' },
      { interval1: 'Tea1=0:00', interval2: 'Tea2=0:00', interval3: 'Lunch or Dinner=0:00' }
    ),
  },
  {
    no: 41,
    svn: '21309',
    name: 'P. Imalsha Nethmi',
    cc: 'CO',
    schedule: makeSchedule(
      ['4:00 PM - 8:00 AM', 'Night Off', '1:00 PM - 10:00 PM', 'Off', '1:00 PM - 10:00 PM', 'Off', '9:00 AM - 5:00 PM'],
      { interval1: 'Tea1=17:20', interval2: 'Tea2=19:30', interval3: 'Lunch or Dinner=14:15' },
      { interval1: 'Tea1=0:00', interval2: 'Tea2=0:00', interval3: 'Lunch or Dinner=0:00' }
    ),
  },
  {
    no: 42,
    svn: '21310',
    name: 'M. P. C. Premawansha',
    cc: 'CO',
    schedule: makeSchedule(
      ['Night Off', 'Off', '1:00 PM - 10:00 PM', '1:00 PM - 10:00 PM', 'Off', '4:00 PM - 8:00 AM', 'Night Off'],
      { interval1: 'Tea1=17:30', interval2: 'Tea2=19:35', interval3: 'Lunch or Dinner=14:05' },
      { interval1: 'Tea1=17:25', interval2: 'Tea2=19:40', interval3: 'Lunch or Dinner=14:10' }
    ),
  },
  {
    no: 43,
    svn: '21311',
    name: 'L. T. Kavindi Wasana',
    cc: 'CO',
    schedule: makeSchedule(
      ['Off', 'Off', '1:00 PM - 10:00 PM', '4:00 PM - 8:00 AM', 'Night Off', '1:00 PM - 10:00 PM', '7:00 AM - 3:00 PM'],
      { interval1: 'Tea1=17:35', interval2: 'Tea2=19:30', interval3: 'Lunch or Dinner=14:15' },
      { interval1: 'Tea1=18:15', interval2: 'Tea2=0:00', interval3: 'Lunch or Dinner=20:45' }
    ),
  },
  {
    no: 44,
    svn: '21312',
    name: 'R. G. T. Umaya Rajapaksha',
    cc: 'CO',
    schedule: makeSchedule(
      ['Night Off', '1:00 PM - 10:00 PM', 'Off', '4:00 PM - 8:00 AM', 'Night Off', 'Off', '1:00 PM - 10:00 PM'],
      { interval1: 'Tea1=0:00', interval2: 'Tea2=0:00', interval3: 'Lunch or Dinner=0:00' },
      { interval1: 'Tea1=18:00', interval2: 'Tea2=0:00', interval3: 'Lunch or Dinner=20:30' }
    ),
  },
  {
    no: 45,
    svn: '21531',
    name: 'S.A.S.L. Perera',
    cc: 'CO',
    schedule: makeSchedule(
      ['1:00 PM - 10:00 PM', 'Off', '1:00 PM - 10:00 PM', '9:00 AM - 5:00 PM', 'Off', '4:00 PM - 8:00 AM', 'Night Off'],
      { interval1: 'Tea1=17:20', interval2: 'Tea2=19:30', interval3: 'Lunch or Dinner=14:15' },
      { interval1: 'Tea1=10:15', interval2: 'Tea2=15:10', interval3: 'Lunch or Dinner=12:50' }
    ),
  },
  {
    no: 46,
    svn: '21532',
    name: 'G. Kiruba-T',
    cc: 'CO',
    schedule: makeSchedule(
      ['1:00 PM - 10:00 PM', '1:00 PM - 10:00 PM', 'Off', '4:00 PM - 8:00 AM', 'Night Off', 'Off', '9:00 AM - 5:00 PM'],
      { interval1: 'Tea1=0:00', interval2: 'Tea2=0:00', interval3: 'Lunch or Dinner=0:00' },
      { interval1: 'Tea1=18:15', interval2: 'Tea2=0:00', interval3: 'Lunch or Dinner=20:45' }
    ),
  },
  {
    no: 47,
    svn: '21533',
    name: 'K.H. Ketakumbura',
    cc: 'CO',
    schedule: makeSchedule(
      ['4:00 PM - 8:00 AM', 'Night Off', '1:00 PM - 10:00 PM', 'Off', '1:00 PM - 10:00 PM', '8:00 AM - 4:00 PM', 'Off'],
      { interval1: 'Tea1=17:00', interval2: 'Tea2=19:35', interval3: 'Lunch or Dinner=14:20' },
      { interval1: 'Tea1=0:00', interval2: 'Tea2=0:00', interval3: 'Lunch or Dinner=0:00' }
    ),
  },
  {
    no: 48,
    svn: '21536',
    name: 'D.T.P.P. Prabuddika',
    cc: 'CO',
    schedule: makeSchedule(
      ['4:00 PM - 8:00 AM', 'Night Off', 'Off', '1:00 PM - 10:00 PM', 'Off', '1:00 PM - 10:00 PM', '8:00 AM - 4:00 PM'],
      { interval1: 'Tea1=0:00', interval2: 'Tea2=0:00', interval3: 'Lunch or Dinner=0:00' },
      { interval1: 'Tea1=17:25', interval2: 'Tea2=19:40', interval3: 'Lunch or Dinner=14:15' }
    ),
  },
];
