type LocationSource = {
  province?: string | null;
  city?: string | null;
  lost_location?: string | null;
};

const invalidLocationValues = new Set(["地区待补充", "undefined", "null"]);

function cleanLocationValue(value?: string | null) {
  const text = value?.trim() || "";
  return invalidLocationValues.has(text.toLowerCase()) ? "" : text;
}

export function formatLocation(report: LocationSource) {
  const province = cleanLocationValue(report.province);
  const city = cleanLocationValue(report.city);
  const lostLocation = cleanLocationValue(report.lost_location);
  if (province && city) return `${province}${city}`;
  if (city) return city;
  if (lostLocation) return lostLocation;
  if (province) return province;
  return "位置暂未填写";
}

export function formatDateTime(value?: string | null) {
  const text = value?.trim();
  if (!text) return "时间暂未填写";
  const match = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T\s](\d{1,2}):(\d{2}))?/);
  if (!match) return text;
  const [, year, month, day, hour, minute] = match;
  const date = `${year}年${Number(month)}月${Number(day)}日`;
  return hour && minute ? `${date} ${hour.padStart(2, "0")}:${minute}` : date;
}
