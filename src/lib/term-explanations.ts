/**
 * Vietnamese explanations for business/accounting terms
 * Used for tooltips and help text throughout the application
 */

export interface TermExplanation {
  term: string
  abbreviation?: string
  vi: string
  en: string
}

// Fixed Cost Categories
export const FIXED_COST_EXPLANATIONS: Record<string, TermExplanation> = {
  RENT: {
    term: 'Rent',
    vi: 'Chi phí thuê mặt bằng, văn phòng hoặc kho bãi hàng tháng',
    en: 'Monthly rent for office, shop, or warehouse space',
  },
  ELECTRICITY: {
    term: 'Electricity',
    vi: 'Chi phí tiền điện hàng tháng',
    en: 'Monthly electricity bill',
  },
  WATER: {
    term: 'Water',
    vi: 'Chi phí tiền nước hàng tháng',
    en: 'Monthly water bill',
  },
  INTERNET: {
    term: 'Internet',
    vi: 'Chi phí dịch vụ Internet hàng tháng',
    en: 'Monthly internet service cost',
  },
  SALARY: {
    term: 'Salary',
    vi: 'Lương cố định cho nhân viên (không bao gồm hoa hồng)',
    en: 'Fixed employee salaries (excluding commissions)',
  },
  LOAN_INTEREST: {
    term: 'Loan Interest',
    vi: 'Lãi vay ngân hàng hoặc các khoản vay khác',
    en: 'Bank loan interest payments',
  },
  OUTSOURCED: {
    term: 'Outsourced Services',
    vi: 'Chi phí thuê dịch vụ bên ngoài (IT, bảo vệ, vệ sinh...)',
    en: 'Cost of outsourced services (IT, security, cleaning...)',
  },
  ACCOUNTING: {
    term: 'Accounting',
    vi: 'Chi phí kế toán, kiểm toán',
    en: 'Accounting and audit fees',
  },
  TAX: {
    term: 'Tax',
    vi: 'Các loại thuế cố định (thuế môn bài, phí...)',
    en: 'Fixed taxes (business license fees, permits...)',
  },
  MARKETING_AGENCY: {
    term: 'Marketing Agency',
    vi: 'Chi phí thuê agency marketing hàng tháng',
    en: 'Monthly marketing agency retainer fees',
  },
  BRAND_ADVERTISING: {
    term: 'Brand Advertising',
    vi: 'Chi phí quảng cáo thương hiệu (không theo doanh số)',
    en: 'Brand advertising costs (not performance-based)',
  },
  OTHER: {
    term: 'Other',
    vi: 'Các chi phí cố định khác',
    en: 'Other fixed costs',
  },
}

// Variable Cost Categories
export const VARIABLE_COST_EXPLANATIONS: Record<string, TermExplanation> = {
  VAT: {
    term: 'Value Added Tax',
    abbreviation: 'VAT',
    vi: 'Thuế giá trị gia tăng - Thuế đánh trên giá trị tăng thêm của hàng hóa/dịch vụ',
    en: 'Tax on the value added to goods/services',
  },
  COMMISSION: {
    term: 'Commission',
    vi: 'Hoa hồng bán hàng - Phần trăm hoặc số tiền cố định trả cho nhân viên/đối tác theo doanh số',
    en: 'Sales commission - Percentage or fixed amount paid per sale',
  },
  ADVERTISING: {
    term: 'Advertising',
    vi: 'Chi phí quảng cáo theo doanh số hoặc theo lead',
    en: 'Performance-based advertising costs per sale or lead',
  },
  OTHER: {
    term: 'Other',
    vi: 'Các chi phí biến đổi khác',
    en: 'Other variable costs',
  },
}

// General Business Terms
export const BUSINESS_TERM_EXPLANATIONS: Record<string, TermExplanation> = {
  CM: {
    term: 'Contribution Margin',
    abbreviation: 'CM',
    vi: 'Lợi nhuận gộp - Số tiền còn lại sau khi trừ giá vốn và chi phí biến đổi khỏi doanh thu. Dùng để bù đắp chi phí cố định.',
    en: 'Revenue minus variable costs per unit. Used to cover fixed costs.',
  },
  AOV: {
    term: 'Average Order Value',
    abbreviation: 'AOV',
    vi: 'Giá trị đơn hàng trung bình - Doanh thu trung bình mỗi đơn hàng, tính theo tỷ lệ bán của từng sản phẩm.',
    en: 'Average revenue per order, weighted by sales mix ratio of each product.',
  },
  BEP: {
    term: 'Break-Even Point',
    abbreviation: 'BEP',
    vi: 'Điểm hòa vốn - Mức doanh số mà tổng doanh thu bằng tổng chi phí (không lãi, không lỗ)',
    en: 'Sales level where total revenue equals total costs (no profit, no loss)',
  },
  FC: {
    term: 'Fixed Costs',
    abbreviation: 'FC',
    vi: 'Tổng định phí - Bao gồm tiền thuê, lương nhân viên, khấu hao đầu tư... Không thay đổi theo số lượng bán.',
    en: 'Total fixed costs - Includes rent, salaries, investment amortization... Does not change with sales volume.',
  },
  VC: {
    term: 'Variable Costs',
    abbreviation: 'VC',
    vi: 'Chi phí biến đổi - Thay đổi theo doanh số như VAT, hoa hồng, phí vận chuyển. Tính theo % doanh thu hoặc số tiền cố định mỗi đơn.',
    en: 'Variable costs - Change with sales like VAT, commission, shipping. Calculated as % of revenue or fixed amount per order.',
  },
  MARGIN: {
    term: 'Margin',
    vi: 'Biên lợi nhuận - Tỷ lệ phần trăm lợi nhuận trên doanh thu',
    en: 'Profit percentage relative to revenue',
  },
  FIXED_COST: {
    term: 'Fixed Cost',
    vi: 'Định phí - Chi phí không thay đổi theo sản lượng hoặc doanh số',
    en: 'Costs that do not change with production volume or sales',
  },
  VARIABLE_COST: {
    term: 'Variable Cost',
    vi: 'Biến phí - Chi phí thay đổi tỷ lệ thuận với sản lượng hoặc doanh số',
    en: 'Costs that change proportionally with production volume or sales',
  },
}

/**
 * Get explanation for a term by key
 */
export function getTermExplanation(
  key: string,
  category: 'fixed' | 'variable' | 'business' = 'business'
): TermExplanation | undefined {
  switch (category) {
    case 'fixed':
      return FIXED_COST_EXPLANATIONS[key]
    case 'variable':
      return VARIABLE_COST_EXPLANATIONS[key]
    default:
      return BUSINESS_TERM_EXPLANATIONS[key]
  }
}
