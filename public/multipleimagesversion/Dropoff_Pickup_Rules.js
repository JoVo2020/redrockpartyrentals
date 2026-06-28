
window.DROPOFF_PICKUP_RULES = [
  {
    "event_day": "Monday",
    "dropoff": [
      { "option": 1, "day": "Sun", "time": "8:00 AM – 11:00 AM", "days_calc": -1, "default": false },
      { "option": 2, "day": "Sun", "time": "5:00 PM – 8:00 PM", "days_calc": -1, "default": true },
      { "option": 3, "day": "Mon", "time": "5:00 PM – 8:00 PM", "days_calc": 0, "default": false }
    ],
    "pickup": [
      { "option": 1, "day": "Mon", "time": "5PM-8PM", "days_calc": 0, "default": false },
      { "option": 2, "day": "Tue", "time": "5PM-8PM", "days_calc": 1, "default": true },
      { "option": 3, "day": "Wed", "time": "5PM-8PM", "days_calc": 2, "default": false }
    ]
  },
  {
    "event_day": "Tuesday",
    "dropoff": [
      { "option": 1, "day": "Sun", "time": "5:00 PM – 8:00 PM", "days_calc": -2, "default": false },
      { "option": 2, "day": "Mon", "time": "5:00 PM – 8:00 PM", "days_calc": -1, "default": true },
      { "option": 3, "day": "Tue", "time": "5:00 PM – 8:00 PM", "days_calc": 0, "default": false }
    ],
    "pickup": [
      { "option": 1, "day": "Tue", "time": "5:00 PM – 8:00 PM", "days_calc": 0, "default": false },
      { "option": 2, "day": "Wed", "time": "5:00 PM – 8:00 PM", "days_calc": 1, "default": true },
      { "option": 3, "day": "Thu", "time": "5:00 PM – 8:00 PM", "days_calc": 2, "default": false }
    ]
  },
  {
    "event_day": "Wednesday",
    "dropoff": [
      { "option": 1, "day": "Mon", "time": "5:00 PM – 8:00 PM", "days_calc": -2, "default": false },
      { "option": 2, "day": "Tue", "time": "5:00 PM – 8:00 PM", "days_calc": -1, "default": true },
      { "option": 3, "day": "Wed", "time": "5:00 PM – 8:00 PM", "days_calc": 0, "default": false }
    ],
    "pickup": [
      { "option": 1, "day": "Wed", "time": "5:00 PM – 8:00 PM", "days_calc": 0, "default": false },
      { "option": 2, "day": "Thu", "time": "5:00 PM – 8:00 PM", "days_calc": 1, "default": true },
      { "option": 3, "day": "Fri", "time": "5:00 PM – 8:00 PM", "days_calc": 2, "default": false }
    ]
  },
  {
    "event_day": "Thursday",
    "dropoff": [
      { "option": 1, "day": "Tue", "time": "5:00 PM – 8:00 PM", "days_calc": -2, "default": false },
      { "option": 2, "day": "Wed", "time": "5:00 PM – 8:00 PM", "days_calc": -1, "default": true },
      { "option": 3, "day": "Thu", "time": "5:00 PM – 8:00 PM", "days_calc": 0, "default": false }
    ],
    "pickup": [
      { "option": 1, "day": "Thu", "time": "5:00 PM – 8:00 PM", "days_calc": 0, "default": false },
      { "option": 2, "day": "Fri", "time": "5:00 PM – 8:00 PM", "days_calc": 1, "default": true },
      { "option": 3, "day": "Sat", "time": "8:00 AM – 11:00 AM", "days_calc": 2, "default": false }
    ]
  },
  {
    "event_day": "Friday",
    "dropoff": [
      { "option": 1, "day": "Wed", "time": "5:00 PM – 8:00 PM", "days_calc": -2, "default": false },
      { "option": 2, "day": "Thu", "time": "5:00 PM – 8:00 PM", "days_calc": -1, "default": true },
      { "option": 3, "day": "Fri", "time": "5:00 PM – 8:00 PM", "days_calc": 0, "default": false }
    ],
    "pickup": [
      { "option": 1, "day": "Fri", "time": "5:00 PM – 8:00 PM", "days_calc": 0, "default": false },
      { "option": 2, "day": "Sat", "time": "5:00 PM – 8:00 PM", "days_calc": 1, "default": true },
      { "option": 3, "day": "Sat", "time": "8:00 AM – 11:00 AM", "days_calc": 1, "default": false }
    ]
  },
  {
    "event_day": "Saturday",
    "dropoff": [
      { "option": 1, "day": "Thu", "time": "5:00 PM – 8:00 PM", "days_calc": -2, "default": false },
      { "option": 2, "day": "Fri", "time": "5:00 PM – 8:00 PM", "days_calc": -1, "default": false },
      { "option": 3, "day": "Sat", "time": "8:00 AM – 11:00 AM", "days_calc": 0, "default": true }
    ],
    "pickup": [
      { "option": 1, "day": "Sat", "time": "5:00 PM – 8:00 PM", "days_calc": 0, "default": false },
      { "option": 2, "day": "Sun", "time": "8:00 AM – 11:00 AM", "days_calc": 1, "default": true },
      { "option": 3, "day": "Sun", "time": "5:00 PM – 8:00 PM", "days_calc": 1, "default": false }
    ]
  },
  {
    "event_day": "Sunday",
    "dropoff": [
      { "option": 1, "day": "Sat", "time": "8:00 AM – 11:00 AM", "days_calc": -1, "default": false },
      { "option": 2, "day": "Sat", "time": "5:00 PM – 8:00 PM", "days_calc": -1, "default": false },
      { "option": 3, "day": "Sun", "time": "8:00 AM – 11:00 AM", "days_calc": 0, "default": true }
    ],
    "pickup": [
      { "option": 1, "day": "Sun", "time": "5:00 PM – 8:00 PM", "days_calc": 0, "default": false },
      { "option": 2, "day": "Mon", "time": "5:00 PM – 8:00 PM", "days_calc": 1, "default": true },
      { "option": 3, "day": "Tue", "time": "5:00 PM – 8:00 PM", "days_calc": 2, "default": false }
    ]
  }
];