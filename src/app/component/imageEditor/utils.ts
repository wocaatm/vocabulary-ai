export const formatPercentString = (
  value: number | string | undefined | null
): string => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return `${value}%`;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return "0%";
    }
    return trimmed.endsWith("%") ? trimmed : `${trimmed}%`;
  }

  return "0%";
};

export const formatAudioFilename = (value?: string | null): string => {
  if (!value) {
    return "";
  }
  return value.trim().toLowerCase().replace(/\s+/g, "_");
};

