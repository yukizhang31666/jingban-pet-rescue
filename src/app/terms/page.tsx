import type { Metadata } from "next";
import Link from "next/link";
import { MobileShell } from "@/components/mobile-shell";

export const metadata: Metadata = { title: "用户协议" };

export default function TermsPage() {
  return <MobileShell><article className="legal-page"><span>鲸伴科技</span><h1>用户协议</h1><p>更新日期：2026年6月20日</p><h2>运营主体</h2><p>本服务由深圳市鲸伴科技有限公司运营，注册地址为深圳市南山区南山街道荔秀社区东滨路4078号永新时代广场2号楼6层6127。</p><h2>产品性质</h2><p>Pet ID 用于宠物档案、分享和防丢联系。SSR、宇宙身份、守护兽、身价和排名属于娱乐化内容，不构成真实资产评估或专业意见。</p><h2>公益寻宠与线索</h2><p>寻宠发布者应确保信息真实并及时更新状态。线索提交者不得发布骚扰、虚假、违法或危及人身与动物安全的内容；平台可对异常提交进行限流、关闭或依法处理。线索中转不代表平台对真实性作出担保。</p><h2>内容责任</h2><p>用户应确保上传内容和联系方式真实、合法且拥有使用权，不得利用平台发布违法、侵权、欺诈或危害他人的信息。</p><h2>人工收款</h2><p>用户付款前应核对收款方和金额。订单由后台人工确认与交付，未确认订单不视为已完成交易。</p><h2>本地服务</h2><p>平台展示的商家经过基础审核，具体服务合同、价格、履约与售后由用户和商家另行确认。</p><h2>服务调整</h2><p>鲸伴科技可根据运营、合规和安全需要调整功能，并尽合理努力保护已有 Pet ID 数据。</p><Link href="/">返回首页</Link></article></MobileShell>;
}
