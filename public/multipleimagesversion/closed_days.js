window.CLOSED_DAYS_OVERRIDES = [
  {
    label: "Summer Closure 2026",
    event_date_start: "2026-06-05",
    event_date_end:   "2026-06-08",
    dropoff: [
      { date: "2026-06-02", time: "5:00 PM – 8:00 PM", default: false },
      { date: "2026-06-03", time: "5:00 PM – 8:00 PM", default: false },
      { date: "2026-06-04", time: "5:00 PM – 8:00 PM", default: true  }
    ],
    pickup: [
      { date: "2026-06-09",  time: "5:00 PM – 8:00 PM", default: true  },
      { date: "2026-06-10", time: "5:00 PM – 8:00 PM", default: false },
      { date: "2026-06-11", time: "5:00 PM – 8:00 PM", default: false }
    ]
  },
  {
    label: "Seattle Trip 2026",
    event_date_start: "2026-07-09",
    event_date_end:   "2026-07-15",
    dropoff: [
      { date: "2026-07-06", time: "5:00 PM – 8:00 PM", default: false },
      { date: "2026-07-07", time: "5:00 PM – 8:00 PM", default: false },
      { date: "2026-07-08", time: "5:00 PM – 8:00 PM", default: true  }
    ],
    pickup: [
      { date: "2026-07-16",  time: "5:00 PM – 8:00 PM", default: true  },
      { date: "2026-07-17", time: "5:00 PM – 8:00 PM", default: false },
      { date: "2026-07-18", time: "5:00 PM – 8:00 PM", default: false }
    ]
  }
];
