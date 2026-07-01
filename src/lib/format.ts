type LocationSource = {
  province?: string | null;
  city?: string | null;
  lost_location?: string | null;
};

const invalidLocationValues = new Set([
  "地区待补充",
  "待补充",
  "未填写",
  "未提供",
  "未知",
  "位置暂未填写",
  "地区未填写",
  "地址待补充",
  "地址未填写",
  "undefined",
  "null",
  "n/a",
  "na",
  "-",
  "--",
]);

function cleanLocationValue(value?: string | null) {
  const text = value?.replace(/[\s\u3000]+/g, " ").trim() || "";
  const normalized = text.replace(/[\s\u3000]+/g, "").toLowerCase();
  return invalidLocationValues.has(normalized) ? "" : text;
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
