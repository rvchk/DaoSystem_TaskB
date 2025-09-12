export const getDepartments = (startup) => [
  {
    value: "management",
    label: "Менеджмент",
    budget: startup?.departments?.management || 0,
  },
  {
    value: "marketing",
    label: "Маркетинг",
    budget: startup?.departments?.marketing || 0,
  },
  {
    value: "development",
    label: "Разработка",
    budget: startup?.departments?.development || 0,
  },
  {
    value: "legal",
    label: "Юридический",
    budget: startup?.departments?.legal || 0,
  },
];
