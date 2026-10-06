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
    label: "Oct 10",
    event_date_start: "2026-10-10",
    event_date_end:   "2026-10-10",
    dropoff: [
      { date: "2026-10-08", time: "4:00 PM – 8:00 PM", default: false },
      { date: "2026-10-09", time: "4:00 PM – 8:00 PM", default: false },
      { date: "2026-10-10", time: "7:00 AM – 11:00 AM", default: true  }
    ],
    pickup: [
      { date: "2026-10-10", time: "4:00 PM – 8:00 PM", default: false  },
      { date: "2026-10-11", time: "7:00 AM – 11:00 AM", default: false },
      { date: "2026-10-11", time: "4:00 PM – 8:00 PM", default: true }
    ]
  },
  
  {
    label: "Michigan Trip Oct 2026",
    event_date_start: "2026-10-23",
    event_date_end:   "2026-10-27",
    dropoff: [
      { date: "2026-10-20", time: "5:00 PM – 8:00 PM", default: false },
      { date: "2026-10-21", time: "5:00 PM – 8:00 PM", default: false },
      { date: "2026-10-22",  time: "4:00 PM – 8:00 PM", default: true  }
    ],
    pickup: [
      { date: "2026-10-26", time: "4:00 PM – 8:00 PM", default: true  },
      { date: "2026-10-27", time: "5:00 PM – 8:00 PM", default: false },
      { date: "2026-10-28", time: "5:00 PM – 8:00 PM", default: false }
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
