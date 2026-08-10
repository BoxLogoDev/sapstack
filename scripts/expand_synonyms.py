#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""data/synonyms.yaml 의 빠진 zh/vi/ja/de 번역을 채운다.

canonical 줄 바로 뒤에 같은 매핑 레벨로 끼워 넣는다. notes 처럼 블록
스칼라가 뒤에 오는 항목이 있어서, 앵커를 블록 끝이 아니라 맨 앞으로
잡아야 YAML 구조가 깨지지 않는다.

사용법: python scripts/expand_synonyms.py [--check]
"""

import re
import sys
from pathlib import Path

import yaml

TARGET = Path(__file__).resolve().parent.parent / "data" / "synonyms.yaml"
LANGS = ("zh", "vi", "ja", "de")
CANONICAL = re.compile(r"^(\s*)- canonical: (\S+)\s*$")
FIELD = re.compile(r"^\s*([a-z_]+):")


class StrictLoader(yaml.SafeLoader):
    """중복 키를 조용히 덮어쓰지 않고 실패시킨다. js-yaml 은 여기서 터진다."""


def _reject_duplicates(loader, node, deep=False):
    mapping = {}
    for key_node, value_node in node.value:
        key = loader.construct_object(key_node, deep=deep)
        if key in mapping:
            raise yaml.YAMLError(
                "중복 키 %r (%d줄)" % (key, key_node.start_mark.line + 1)
            )
        mapping[key] = loader.construct_object(value_node, deep=deep)
    return mapping


StrictLoader.add_constructor(
    yaml.resolver.BaseResolver.DEFAULT_MAPPING_TAG, _reject_duplicates
)

TRANSLATIONS = {
    "customer": {
        "zh": {"primary": "客户", "variants": ["用户", "购货方", "KUNNR"]},
        "vi": {"primary": "Khách hàng", "variants": ["Khách", "Bên mua", "KUNNR"]}
    },
    "payment_method": {
        "zh": {"primary": "支付方式", "variants": ["付款方式", "支付方法", "ZWELS"]},
        "vi": {"primary": "Phương thức thanh toán", "variants": ["Cách thanh toán", "ZWELS"]}
    },
    "payment_block": {
        "zh": {"primary": "支付冻结", "variants": ["付款冻结", "支付锁定", "ZAHLS"]},
        "vi": {"primary": "Khóa thanh toán", "variants": ["Cấm thanh toán", "ZAHLS"]}
    },
    "payment_run": {
        "zh": {"primary": "支付运行", "variants": ["批量支付", "支付处理", "F110"]},
        "vi": {"primary": "Chạy thanh toán", "variants": ["Xử lý thanh toán", "F110"]}
    },
    "accounts_payable": {
        "zh": {"primary": "应付账款", "variants": ["应付", "债权人", "BSIK"]},
        "vi": {"primary": "Công nợ phải trả", "variants": ["Nợ phải trả", "BSIK"]}
    },
    "accounts_receivable": {
        "zh": {"primary": "应收账款", "variants": ["应收", "债务人", "BSID"]},
        "vi": {"primary": "Công nợ phải thu", "variants": ["Nợ phải thu", "BSID"]}
    },
    "special_gl": {
        "zh": {"primary": "特殊总账", "variants": ["特殊G/L", "特殊原账", "UMSKZ"]},
        "vi": {"primary": "Sổ cái đặc biệt", "variants": ["GL đặc biệt", "UMSKZ"]}
    },
    "withholding_tax": {
        "zh": {"primary": "代扣税", "variants": ["所得税代扣", "代扣", "WHT"]},
        "vi": {"primary": "Thuế khấu trừ", "variants": ["Thuế tạm giữ", "WHT"]}
    },
    "tax_code": {
        "zh": {"primary": "税码", "variants": ["税种代码", "税金代码", "MWSKZ"]},
        "vi": {"primary": "Mã thuế", "variants": ["Mã loại thuế", "MWSKZ"]}
    },
    "house_bank": {
        "zh": {"primary": "公司银行", "variants": ["自有银行", "内部银行", "HBKID"]},
        "vi": {"primary": "Ngân hàng công ty", "variants": ["Ngân hàng nội bộ", "HBKID"]}
    },
    "period_close": {
        "zh": {"primary": "期间关闭", "variants": ["月末关闭", "会计期间关闭", "月结"]},
        "vi": {"primary": "Đóng kỳ", "variants": ["Đóng tháng", "Kết thúc kỳ", "D+3"]}
    },
    "foreign_currency_valuation": {
        "zh": {"primary": "外币估值", "variants": ["外汇估值", "外币重估", "FCV"]},
        "vi": {"primary": "Định giá ngoại tệ", "variants": ["Đánh giá tiền tệ nước ngoài", "FCV"]}
    },
    "cost_element": {
        "zh": {"primary": "成本要素", "variants": ["原价要素", "成本科目", "KSTAR"]},
        "vi": {"primary": "Yếu tố chi phí", "variants": ["Loại chi phí", "KSTAR"]}
    },
    "internal_order": {
        "zh": {"primary": "内部订单", "variants": ["内部指令", "内部命令", "IO"]},
        "vi": {"primary": "Lệnh nội bộ", "variants": ["Đơn đặt hàng nội bộ", "IO"]}
    },
    "wbs_element": {
        "zh": {"primary": "WBS要素", "variants": ["工作分解结构", "WBS"]},
        "vi": {"primary": "Yếu tố WBS", "variants": ["Phần tử cấu trúc phân tách công việc", "WBS"]}
    },
    "activity_type": {
        "zh": {"primary": "活动类型", "variants": ["活动种类", "作业类型", "LSTAR"]},
        "vi": {"primary": "Loại hoạt động", "variants": ["Hình thức hoạt động", "LSTAR"]}
    },
    "assessment": {
        "zh": {"primary": "分摊", "variants": ["评估", "费用分摊", "RKEB"]},
        "vi": {"primary": "Phân bổ", "variants": ["Đánh giá", "RKEB"]}
    },
    "distribution": {
        "zh": {"primary": "分配", "variants": ["分布", "成本分配", "RKE"]},
        "vi": {"primary": "Phân phối", "variants": ["Phân chia", "RKE"]}
    },
    "settlement": {
        "zh": {"primary": "结算", "variants": ["清算", "解决", "COBL"]},
        "vi": {"primary": "Quyết toán", "variants": ["Thanh toán", "COBL"]}
    },
    "co_pa": {
        "zh": {"primary": "利润分析", "variants": ["收益分析", "CO-PA", "盈利能力分析"]},
        "vi": {"primary": "Phân tích lợi nhuận", "variants": ["CO-PA", "Phân tích khả năng sinh lời"]}
    },
    "material": {
        "zh": {"primary": "物料", "variants": ["物品", "商品", "MATNR"]},
        "vi": {"primary": "Vật liệu", "variants": ["Hàng hóa", "Sản phẩm", "MATNR"]}
    },
    "plant": {
        "zh": {"primary": "工厂", "variants": ["生产工厂", "厂房", "WERKS"]},
        "vi": {"primary": "Nhà máy", "variants": ["Cơ sở sản xuất", "WERKS"]}
    },
    "warehouse": {
        "zh": {"primary": "仓库", "variants": ["库房", "仓", "LGORT"]},
        "vi": {"primary": "Kho", "variants": ["Kho lưu trữ", "LGORT"]}
    },
    "bin": {
        "zh": {"primary": "料位", "variants": ["库位", "存放位置", "LGPLA"]},
        "vi": {"primary": "Vị trí lưu trữ", "variants": ["Ngăn kho", "LGPLA"]}
    },
    "stock": {
        "zh": {"primary": "库存", "variants": ["存货", "库存量", "MENGE"]},
        "vi": {"primary": "Tồn kho", "variants": ["Hàng tồn", "MENGE"]}
    },
    "goods_receipt": {
        "zh": {"primary": "收货", "variants": ["货物收据", "入库", "MIGO"]},
        "vi": {"primary": "Biên lai nhận hàng", "variants": ["Nhận hàng", "Biên bản nhận", "MIGO"]}
    },
    "goods_issue": {
        "zh": {"primary": "出库", "variants": ["货物签收单", "物料扣减", "MI02"]},
        "vi": {"primary": "Phát hành hàng", "variants": ["Xuất kho", "MI02"]}
    },
    "purchase_order": {
        "zh": {"primary": "采购订单", "variants": ["PO", "采购单", "EKKO"]},
        "vi": {"primary": "Đơn đặt hàng mua", "variants": ["PO", "EKKO"]}
    },
    "purchase_requisition": {
        "zh": {"primary": "采购申请", "variants": ["采购需求", "采购请求", "EBAN"]},
        "vi": {"primary": "Yêu cầu mua hàng", "variants": ["Yêu cầu đặt hàng", "EBAN"]}
    },
    "sales_order": {
        "zh": {"primary": "销售订单", "variants": ["销售单", "SO", "VBAK"]},
        "vi": {"primary": "Đơn đặt hàng bán", "variants": ["SO", "VBAK"]}
    },
    "delivery": {
        "zh": {"primary": "交货", "variants": ["发货", "配送", "LIKP"]},
        "vi": {"primary": "Giao hàng", "variants": ["Chuyên chở", "LIKP"]}
    },
    "invoice": {
        "zh": {"primary": "发票", "variants": ["账单", "INV", "VBRK"]},
        "vi": {"primary": "Hóa đơn", "variants": ["Chứng chỉ", "VBRK"]}
    },
    "production_order": {
        "zh": {"primary": "生产订单", "variants": ["制造订单", "AUFNR"]},
        "vi": {"primary": "Lệnh sản xuất", "variants": ["Đơn đặt hàng sản xuất", "AUFNR"]}
    },
    "bom": {
        "zh": {"primary": "物料清单", "variants": ["BOM", "成分清单", "STPO"]},
        "vi": {"primary": "Danh sách vật liệu", "variants": ["BOM", "STPO"]}
    },
    "routing": {
        "zh": {"primary": "工艺路线", "variants": ["工序", "路线", "EPLNR"]},
        "vi": {"primary": "Phương trình công nghệ", "variants": ["Quy trình", "EPLNR"]}
    },
    "work_center": {
        "zh": {"primary": "工作中心", "variants": ["加工中心", "作业中心", "ARBPL"]},
        "vi": {"primary": "Trung tâm công việc", "variants": ["Khu vực làm việc", "ARBPL"]}
    },
    "maintenance_order": {
        "de": {"primary": "Instandhaltungsauftrag"},
        "ja": {"primary": "保守作業指図", "variants": ["メンテナンスオーダー"]},
        "zh": {"primary": "维护订单", "variants": ["维保单", "保养单", "AUFNR"]},
        "vi": {"primary": "Lệnh bảo trì", "variants": ["Đơn bảo dưỡng", "AUFNR"]}
    },
    "inspection_lot": {
        "de": {"primary": "Inspektionslos"},
        "ja": {"primary": "検査ロット", "variants": ["ロット"]},
        "zh": {"primary": "检验批", "variants": ["检验单位", "批号", "QALS"]},
        "vi": {"primary": "Lô kiểm tra", "variants": ["Đơn vị kiểm tra", "QALS"]}
    },
    "usage_decision": {
        "de": {"primary": "Verwendungsentscheidung"},
        "ja": {"primary": "使用決定", "variants": ["ユーザー判定"]},
        "zh": {"primary": "使用决定", "variants": ["用途决定", "QMAT"]},
        "vi": {"primary": "Quyết định sử dụng", "variants": ["Quyết định dùng", "QMAT"]}
    },
    "picking": {
        "de": {"primary": "Kommissionierung"},
        "ja": {"primary": "ピッキング", "variants": ["摘み取り"]},
        "zh": {"primary": "拣货", "variants": ["分拣", "拿货", "LIPS"]},
        "vi": {"primary": "Lấy hàng", "variants": ["Chọn hàng", "LIPS"]}
    },
    "putaway": {
        "de": {"primary": "Einlagerung"},
        "ja": {"primary": "入庫", "variants": ["納品"]},
        "zh": {"primary": "上架", "variants": ["入库放置", "入库作业"]},
        "vi": {"primary": "Lưu trữ hàng", "variants": ["Đặt vào kho", "Phục vụ"]}
    },
    "wave": {
        "de": {"primary": "Welle"},
        "ja": {"primary": "波動", "variants": ["ウェーブ"]},
        "zh": {"primary": "波次", "variants": ["批次", "轮次"]},
        "vi": {"primary": "Làn sóng", "variants": ["Đợt", "Lô hàng"]}
    },
    "packing": {
        "de": {"primary": "Packung"},
        "ja": {"primary": "梱包", "variants": ["パッキング"]},
        "zh": {"primary": "打包", "variants": ["包装", "装箱"]},
        "vi": {"primary": "Đóng gói", "variants": ["Bao bì", "Gói"]}
    },
    "equipment": {
        "de": {"primary": "Ausrüstung"},
        "ja": {"primary": "設備", "variants": ["機器"]},
        "zh": {"primary": "设备", "variants": ["机器", "装置", "EQUNR"]},
        "vi": {"primary": "Thiết bị", "variants": ["Máy móc", "EQUNR"]}
    },
    "func_loc": {
        "de": {"primary": "Funktionsort"},
        "ja": {"primary": "機能位置", "variants": ["ファンクショナルロケーション"]},
        "zh": {"primary": "功能位置", "variants": ["功位", "设备位置", "TPLNR"]},
        "vi": {"primary": "Vị trí chức năng", "variants": ["Vị trí làm việc", "TPLNR"]}
    },
    "mtbf": {
        "de": {"primary": "MTBF"},
        "ja": {"primary": "平均故障間隔", "variants": ["MTBF"]},
        "zh": {"primary": "平均故障间隔", "variants": ["MTBF", "无故障工作时间"]},
        "vi": {"primary": "Thời gian trung bình giữa các lỗi", "variants": ["MTBF"]}
    },
    "mttr": {
        "de": {"primary": "MTTR"},
        "ja": {"primary": "平均修復時間", "variants": ["MTTR"]},
        "zh": {"primary": "平均修复时间", "variants": ["MTTR", "平均维修时间"]},
        "vi": {"primary": "Thời gian trung bình để sửa chữa", "variants": ["MTTR"]}
    },
    "oee": {
        "de": {"primary": "OEE"},
        "ja": {"primary": "総合設備効率", "variants": ["OEE"]},
        "zh": {"primary": "综合设备效率", "variants": ["OEE", "全局设备效率"]},
        "vi": {"primary": "Hiệu suất thiết bị toàn cầu", "variants": ["OEE"]}
    },
    "damage_code": {
        "de": {"primary": "Schadenskennung"},
        "ja": {"primary": "ダメージコード", "variants": ["損傷コード"]},
        "zh": {"primary": "缺陷代码", "variants": ["损伤代码", "问题代码"]},
        "vi": {"primary": "Mã hư hỏng", "variants": ["Mã sự cố", "Mã lỗi"]}
    },
    "mic": {
        "de": {"primary": "MIC"},
        "ja": {"primary": "許容基準", "variants": ["MIC"]},
        "zh": {"primary": "关键检验特性", "variants": ["MIC", "检验标准"]},
        "vi": {"primary": "Đặc tính quan trọng đo lường", "variants": ["MIC"]}
    },
    "handhold_terminal": {
        "de": {"primary": "Handheld-Terminal"},
        "ja": {"primary": "ハンドヘルド端末", "variants": ["携帯端末"]},
        "zh": {"primary": "手持终端", "variants": ["移动终端", "手持设备"]},
        "vi": {"primary": "Thiết bị cầm tay", "variants": ["Máy móc cầm tay", "Thiết bị di động"]}
    },
    "transfer_order": {
        "de": {"primary": "Umlagerungsauftrag"},
        "ja": {"primary": "移動指図", "variants": ["転送オーダー"]},
        "zh": {"primary": "转移单", "variants": ["库存移动", "调拨单"]},
        "vi": {"primary": "Lệnh chuyển hàng", "variants": ["Lệnh di chuyển", "Phiếu chuyển"]}
    },
    "transfer_requirement": {
        "de": {"primary": "Umlagerungsanforderung"},
        "ja": {"primary": "移動要求", "variants": ["転送要求"]},
        "zh": {"primary": "转移需求", "variants": ["转移申请", "调拨申请"]},
        "vi": {"primary": "Yêu cầu chuyển hàng", "variants": ["Yêu cầu di chuyển", "UMLGO"]}
    },
    "warehouse_order": {
        "de": {"primary": "Lagerauftrag"},
        "ja": {"primary": "倉庫指図", "variants": ["ウェアハウスオーダー"]},
        "zh": {"primary": "仓库订单", "variants": ["仓储单", "库存单"]},
        "vi": {"primary": "Lệnh kho", "variants": ["Lệnh lưu trữ", "LQUAS"]}
    },
    "handling_unit": {
        "de": {"primary": "Handhabungseinheit"},
        "ja": {"primary": "取扱単位", "variants": ["ハンドリングユニット"]},
        "zh": {"primary": "处理单元", "variants": ["处理单位", "搬运单位", "VHILM"]},
        "vi": {"primary": "Đơn vị xử lý", "variants": ["Đơn vị xử lý", "VHILM"]}
    },
    "certificate_of_analysis": {
        "de": {"primary": "Analysezertifikat"},
        "ja": {"primary": "分析証明書", "variants": ["CoA"]},
        "zh": {"primary": "分析证书", "variants": ["检验报告", "CoA"]},
        "vi": {"primary": "Chứng chỉ phân tích", "variants": ["CoA", "Báo cáo phân tích"]}
    },
    "preventive_maintenance": {
        "de": {"primary": "Vorbeugende Instandhaltung"},
        "ja": {"primary": "予防保全", "variants": ["予防メンテナンス"]},
        "zh": {"primary": "预防性维护", "variants": ["预防保全", "预防性保养"]},
        "vi": {"primary": "Bảo trì phòng ngừa", "variants": ["Bảo dưỡng phòng chống", "Duy trì phòng chống"]}
    },
    "gmp": {
        "de": {"primary": "GMP"},
        "ja": {"primary": "GMP", "variants": ["医薬品等の製造管理及び品質管理の基準"]},
        "zh": {"primary": "GMP", "variants": ["良好生产规范", "药品生产质量管理规范"]},
        "vi": {"primary": "GMP", "variants": ["Thực hành sản xuất tốt", "Tiêu chuẩn GMP"]}
    },
    "d_minus_1": {
        "de": {"primary": "D-1"},
        "ja": {"primary": "D-1"},
        "zh": {"primary": "D-1", "variants": ["前一天", "D-1工作日"]},
        "vi": {"primary": "D-1", "variants": ["Hôm trước", "Ngày D-1"]}
    },
    "d_day": {
        "de": {"primary": "D-Tag"},
        "ja": {"primary": "Dデー", "variants": ["D日"]},
        "zh": {"primary": "D日", "variants": ["指定日期", "关键日期"]},
        "vi": {"primary": "Ngày D", "variants": ["Hôm quy định", "Ngày chỉ định"]}
    },
    "beginning_of_month": {
        "de": {"primary": "Monatsanfang"},
        "ja": {"primary": "月初", "variants": ["月頭"]},
        "zh": {"primary": "月初", "variants": ["月开始", "月首"]},
        "vi": {"primary": "Đầu tháng", "variants": ["Ngày đầu tháng", "Đầu kỳ"]}
    },
    "end_of_month": {
        "de": {"primary": "Monatsende"},
        "ja": {"primary": "月末", "variants": ["月終"]},
        "zh": {"primary": "月末", "variants": ["月终", "月底"]},
        "vi": {"primary": "Cuối tháng", "variants": ["Ngày cuối tháng", "Cuối kỳ"]}
    },
    "monthly_close": {
        "de": {"primary": "Monatsabschluss"},
        "ja": {"primary": "月次決算", "variants": ["月間決算"]},
        "zh": {"primary": "月度结算", "variants": ["月度关闭", "月度决算"]},
        "vi": {"primary": "Đóng tháng", "variants": ["Kết toán tháng", "Quy trình đóng tháng"]}
    },
    "quarterly_close": {
        "de": {"primary": "Quartalsabschluss"},
        "ja": {"primary": "四半期決算", "variants": ["四半期閉鎖"]},
        "zh": {"primary": "季度结算", "variants": ["季度关闭", "季度决算"]},
        "vi": {"primary": "Đóng quý", "variants": ["Kết toán quý", "Quy trình đóng quý"]}
    },
    "year_end_close": {
        "de": {"primary": "Jahresabschluss"},
        "ja": {"primary": "年度決算", "variants": ["年間決算", "年次決算"]},
        "zh": {"primary": "年度结算", "variants": ["年度关闭", "年度决算", "年结"]},
        "vi": {"primary": "Đóng năm", "variants": ["Kết toán năm", "Quy trình đóng năm"]}
    },
    "semi_annual": {
        "de": {"primary": "Halbjahresabschluss"},
        "ja": {"primary": "半年決算", "variants": ["中間決算"]},
        "zh": {"primary": "半年度结算", "variants": ["中期决算", "中期结算"]},
        "vi": {"primary": "Đóng nửa năm", "variants": ["Kết toán nửa năm", "Kết toán giữa năm"]}
    },
    "preliminary_close": {
        "de": {"primary": "Vorläufiger Abschluss"},
        "ja": {"primary": "仮決算", "variants": ["仮確定"]},
        "zh": {"primary": "试算结算", "variants": ["暂定决算", "初步结算"]},
        "vi": {"primary": "Đóng tạm", "variants": ["Kết toán tạm", "Kết toán sơ bộ"]}
    },
    "final_close": {
        "de": {"primary": "Finaler Abschluss"},
        "ja": {"primary": "最終決算", "variants": ["確定決算"]},
        "zh": {"primary": "最终结算", "variants": ["确定决算", "最终决算"]},
        "vi": {"primary": "Đóng chính thức", "variants": ["Kết toán cuối cùng", "Kết toán chính thức"]}
    },
    "business_day": {
        "de": {"primary": "Geschäftstag"},
        "ja": {"primary": "営業日", "variants": ["業務日"]},
        "zh": {"primary": "工作日", "variants": ["营业日", "业务日"]},
        "vi": {"primary": "Ngày làm việc", "variants": ["Ngày kinh doanh", "Ngày buôn bán"]}
    },
    "d_day_plus_n": {
        "de": {"primary": "D+n"},
        "ja": {"primary": "D+n"},
        "zh": {"primary": "D+n", "variants": ["D日后n天", "D+N"]},
        "vi": {"primary": "D+n", "variants": ["Ngày D cộng n", "D+N"]}
    },
    "provisional": {
        "de": {"primary": "Vorläufig"},
        "ja": {"primary": "仮", "variants": ["暫定"]},
        "zh": {"primary": "暂定", "variants": ["临时", "试算", "初步"]},
        "vi": {"primary": "Tạm", "variants": ["Tạm thời", "Sơ bộ"]}
    },
    "finalized": {
        "de": {"primary": "Endgültig"},
        "ja": {"primary": "確定", "variants": ["最終確定"]},
        "zh": {"primary": "确定", "variants": ["最终", "正式确定", "锁定"]},
        "vi": {"primary": "Chính thức", "variants": ["Hoàn tất", "Xác nhận"]}
    }
}

def render(lang_data):
    """언어 항목을 기존 파일과 같은 한 줄 형식으로 만든다."""
    variants = lang_data.get("variants")
    body = 'primary: "%s"' % lang_data["primary"]
    if variants:
        body += ", variants: %s" % variants
    return "{ %s }" % body


def block_end(lines, start, base_indent):
    """canonical 항목이 끝나는 줄 번호. 다음 항목이나 상위 키에서 끊는다.

    섹션 주석 뒤로 밀려난 필드가 실제로 존재해서(299·399줄) 주석과 빈 줄은
    건너뛴다. 여기서 끊으면 이미 있는 언어를 못 보고 중복 키를 만든다.
    """
    for i in range(start + 1, len(lines)):
        line = lines[i]
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        if len(line) - len(line.lstrip()) <= base_indent:
            return i
    return len(lines)


def expand(text):
    lines = text.split("\n")
    inserts = {}

    for i, line in enumerate(lines):
        match = CANONICAL.match(line)
        if not match:
            continue
        translations = TRANSLATIONS.get(match.group(2))
        if not translations:
            continue

        base_indent = len(match.group(1))
        field_indent = " " * (base_indent + 2)
        present = set()
        for body_line in lines[i + 1:block_end(lines, i, base_indent)]:
            field = FIELD.match(body_line)
            if field:
                present.add(field.group(1))

        added = [
            "%s%s: %s" % (field_indent, lang, render(translations[lang]))
            for lang in LANGS
            if lang in translations and lang not in present
        ]
        if added:
            inserts[i] = added

    out = []
    for i, line in enumerate(lines):
        out.append(line)
        out.extend(inserts.get(i, ()))
    return "\n".join(out), sum(len(v) for v in inserts.values())


def main():
    original = TARGET.read_text(encoding="utf-8")
    before = yaml.load(original, Loader=StrictLoader)
    updated, added = expand(original)

    after = yaml.load(updated, Loader=StrictLoader)  # 구조가 깨지면 바로 터진다
    assert list(before) == list(after), "최상위 키가 바뀌었다"
    assert len(before["terms"]) == len(after["terms"]), "용어 수가 바뀌었다"
    for old, new in zip(before["terms"], after["terms"]):
        assert set(old) <= set(new), "기존 필드가 사라졌다: %s" % old.get("canonical")

    if "--check" in sys.argv:
        print("추가 대상 %d건 (파일은 그대로)" % added)
        return

    TARGET.write_text(updated, encoding="utf-8")
    print("번역 %d건 추가 — %s" % (added, TARGET.name))


if __name__ == "__main__":
    main()
