window.CLOSED_DAYS_OVERRIDES = [
  {
    label: "Sep 26",
    event_date_start: "2026-09-26",
    event_date_end:   "2026-09-26",
    dropoff: [
      { date: "2026-09-24", time: "4:00 PM – 8:00 PM", default: false },
      { date: "2026-09-25", time: "4:00 PM – 8:00 PM", default: false },
      { date: "2026-09-26", time: "7:00 AM – 12:00 PM", default: true  }
    ],
    pickup: [
      { date: "2026-09-27", time: "7:00 AM – 12:00 PM", default: true  },
      { date: "2026-09-27", time: "4:00 PM – 8:00 PM", default: false },
      { date: "2026-09-28", time: "4:00 PM – 8:00 PM", default: false }
    ]
  },

  {
    label: "Sep 27",
    event_date_start: "2026-09-27",
    event_date_end:   "2026-09-27",
    dropoff: [
      { date: "2026-09-25", time: "4:00 PM – 8:00 PM", default: false },
      { date: "2026-09-26", time: "4:00 PM – 8:00 PM", default: false },
      { date: "2026-09-27", time: "7:00 AM – 12:00 PM", default: true  }
    ],
    pickup: [
      { date: "2026-09-27", time: "4:00 PM – 8:00 PM", default: true  },
      { date: "2026-09-28", time: "4:00 PM – 8:00 PM", default: false },
      { date: "2026-09-29", time: "4:00 PM – 8:00 PM", default: false }
    ]
  },
  
  {
    label: "July 4th-5th 2026",
    event_date_start: "2026-07-04",
    event_date_end:   "2026-07-05",
    dropoff: [
      { date: "2026-07-02", time: "5:00 PM – 8:00 PM", default: false },
      { date: "2026-07-03", time: "5:00 PM – 8:00 PM", default: true },
      { date: "2026-07-04",  time: "8:00 AM – 11:00 AM", default: false  }
    ],
    pickup: [
      { date: "2026-07-05", time: "8:00 AM – 11:00 AM", default: false  },
      { date: "2026-07-05", time: "5:00 PM – 8:00 PM", default: false },
      { date: "2026-07-06", time: "5:00 PM – 8:00 PM", default: true }
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
