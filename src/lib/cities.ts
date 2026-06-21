export type CityConfig = {
  slug: string;
  name: string;
  province?: string;
  description?: string;
};

export const cities: CityConfig[] = [
  { slug: "shenzhen", name: "深圳", province: "广东" },
  { slug: "guangzhou", name: "广州", province: "广东" },
  { slug: "shanghai", name: "上海", province: "上海" },
  { slug: "beijing", name: "北京", province: "北京" },
  { slug: "chengdu", name: "成都", province: "四川" },
  { slug: "hangzhou", name: "杭州", province: "浙江" },
  { slug: "wuhan", name: "武汉", province: "湖北" },
  { slug: "nanjing", name: "南京", province: "江苏" },
  { slug: "chongqing", name: "重庆", province: "重庆" },
  { slug: "xian", name: "西安", province: "陕西" },
  { slug: "suzhou", name: "苏州", province: "江苏" },
];

export function findCity(slug: string) {
  return cities.find((city) => city.slug === slug.toLowerCase());
}
