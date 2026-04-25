export const buildingTypes = ["Corridor", "Suite", "Apartment"] as const;

export const quadSortOptions = [
  { value: "rating", label: "Highest rating" },
  { value: "reviews", label: "Most reviews" },
  { value: "recent", label: "Most recent" }
] as const;

export const bestForOptions = [
  "Quiet",
  "Social",
  "Convenience",
  "Suite-style",
  "Apartment-style"
] as const;

export const classYearOptions = ["Freshman", "Sophomore", "Junior", "Senior"] as const;

export const residenceSeasonOptions = ["Fall", "Winter", "Spring", "Summer"] as const;

export const residenceStartYear = 2000;

export const ratingFieldDefinitions = [
  {
    name: "overall_rating",
    label: "Overall rating",
    helpText: "Your headline score for the building overall."
  },
  {
    name: "cleanliness_rating",
    label: "Cleanliness",
    helpText: "Shared spaces, trash, and general upkeep."
  },
  {
    name: "noise_rating",
    label: "Noise",
    helpText: "How manageable the day-to-day noise level felt."
  },
  {
    name: "bathroom_rating",
    label: "Bathroom",
    helpText: "Condition, convenience, and reliability of bathrooms."
  },
  {
    name: "location_rating",
    label: "Location",
    helpText: "Walking distance to class, food, buses, and essentials."
  },
  {
    name: "social_rating",
    label: "Social",
    helpText: "How easy it felt to meet people and build community."
  },
  {
    name: "amenities_rating",
    label: "Amenities",
    helpText: "Lounges, kitchens, laundry, study spaces, and extras."
  },
  {
    name: "room_quality_rating",
    label: "Room quality",
    helpText: "Layout, comfort, storage, and overall livability."
  }
] as const;

export const reviewCategoryLabels = [
  {
    key: "cleanliness_rating",
    label: "Cleanliness",
    description: "Shared-space upkeep and day-to-day maintenance."
  },
  {
    key: "noise_rating",
    label: "Noise",
    description: "How quiet or disruptive the building tends to feel."
  },
  {
    key: "bathroom_rating",
    label: "Bathroom",
    description: "Condition and convenience of bathroom access."
  },
  {
    key: "location_rating",
    label: "Location",
    description: "Proximity to classes, buses, dining, and campus life."
  },
  {
    key: "social_rating",
    label: "Social",
    description: "Ease of making friends and finding community."
  },
  {
    key: "amenities_rating",
    label: "Amenities",
    description: "Kitchens, lounges, laundry, and shared resources."
  },
  {
    key: "room_quality_rating",
    label: "Room quality",
    description: "Room condition, storage, comfort, and layout."
  }
] as const;
