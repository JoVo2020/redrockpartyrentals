window.CLOSED_DAYS_OVERRIDES = [

  {
    label: "Nov 1",
    event_date_start: "2026-11-01",
    event_date_end:   "2026-11-01",
    dropoff: [
      { date: "2026-10-30", time: "5:00 PM – 8:00 PM", default: false },
      { date: "2026-10-31", time: "7:00 AM – 11:00 AM", default: false },
      { date: "2026-11-01", time: "7:00 AM – 11:00 AM", default: true  }
    ],
    pickup: [
      { date: "2026-11-01", time: "4:00 PM – 8:00 PM", default: false  },
      { date: "2026-11-02", time: "5:00 PM – 8:00 PM", default: true },
      { date: "2026-11-03", time: "5:00 PM – 8:00 PM", default: false }
    ]
  },
  
  {
    label: "Oct 31",
    event_date_start: "2026-10-31",
    event_date_end:   "2026-10-31",
    dropoff: [
      { date: "2026-10-28", time: "5:00 PM – 8:00 PM", default: false },
      { date: "2026-10-30", time: "5:00 PM – 8:00 PM", default: false },
      { date: "2026-10-31", time: "7:00 AM – 11:00 AM", default: true  }
    ],
    pickup: [
      { date: "2026-11-01", time: "7:00 AM – 11:00 AM", default: true  },
      { date: "2026-11-01", time: "4:00 PM – 8:00 PM", default: false },
      { date: "2026-11-02", time: "5:00 PM – 8:00 PM", default: false }
    ]
  },

  {
    label: "Oct 30",
    event_date_start: "2026-10-30",
    event_date_end:   "2026-10-30",
    dropoff: [
      { date: "2026-10-27", time: "5:00 PM – 8:00 PM", default: false },
      { date: "2026-10-28", time: "5:00 PM – 8:00 PM", default: false },
      { date: "2026-10-30", time: "5:00 PM – 8:00 PM", default: true  }
    ],
    pickup: [
      { date: "2026-10-31", time: "7:00 AM – 11:00 AM", default: true  },
      { date: "2026-11-01", time: "7:00 AM – 11:00 AM", default: false },
      { date: "2026-11-01", time: "4:00 PM – 8:00 PM", default: false }
    ]
  },
  
    {
    label: "Oct 29",
    event_date_start: "2026-10-27",
    event_date_end:   "2026-10-29",
    dropoff: [
      { date: "2026-10-26", time: "5:00 PM – 8:00 PM", default: false },
      { date: "2026-10-27", time: "5:00 PM – 8:00 PM", default: true },
      { date: "2026-10-28", time: "5:00 PM – 8:00 PM", default: false  }
    ],
    pickup: [
      { date: "2026-10-30", time: "5:00 PM – 8:00 PM", default: true  },
      { date: "2026-10-31", time: "7:00 AM – 11:00 AM", default: false },
      { date: "2026-11-01", time: "7:00 AM – 11:00 AM", default: false }
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
