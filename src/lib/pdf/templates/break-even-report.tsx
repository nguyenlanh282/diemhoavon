import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'
import type { BreakEvenResult } from '@/lib/calculations/break-even'

// Register fonts with Vietnamese support
Font.register({
  family: 'Roboto',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5Q.ttf',
      fontWeight: 'normal',
    },
    {
      src: 'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlvAw.ttf',
      fontWeight: 'bold',
    },
  ],
})

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Roboto',
    fontSize: 11,
    color: '#1a1a1a',
  },
  header: {
    marginBottom: 20,
    borderBottom: '2px solid #2563eb',
    paddingBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#666666',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1a1a1a',
    backgroundColor: '#f0f7ff',
    padding: 8,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottom: '1px solid #e6e6e6',
  },
  label: {
    flex: 1,
    color: '#666666',
  },
  value: {
    flex: 1,
    textAlign: 'right',
    fontWeight: 'bold',
  },
  keyMetricCard: {
    flexDirection: 'row',
    backgroundColor: '#f0f7ff',
    padding: 15,
    marginBottom: 15,
    borderRadius: 4,
  },
  keyMetricItem: {
    flex: 1,
    alignItems: 'center',
  },
  keyMetricLabel: {
    fontSize: 10,
    color: '#666666',
    marginBottom: 5,
  },
  keyMetricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 9,
    color: '#999999',
    borderTop: '1px solid #e6e6e6',
    paddingTop: 10,
  },
  formulaBox: {
    backgroundColor: '#fefce8',
    border: '1px solid #fbbf24',
    padding: 12,
    marginBottom: 15,
    borderRadius: 4,
  },
  formulaText: {
    fontSize: 10,
    color: '#92400e',
    marginBottom: 3,
  },
  summaryBox: {
    backgroundColor: '#f0fdf4',
    border: '1px solid #22c55e',
    padding: 12,
    borderRadius: 4,
  },
  summaryText: {
    fontSize: 10,
    color: '#166534',
    lineHeight: 1.5,
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    padding: 8,
    fontWeight: 'bold',
    fontSize: 10,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottom: '1px solid #e6e6e6',
    fontSize: 10,
  },
  tableCell: {
    flex: 1,
  },
  tableCellRight: {
    flex: 1,
    textAlign: 'right',
  },
})

const translations = {
  vi: {
    title: 'Báo Cáo Phân Tích Điểm Hòa Vốn',
    breakEvenUnits: 'Điểm hòa vốn (Đơn hàng)',
    breakEvenRevenue: 'Điểm hòa vốn (Doanh thu)',
    totalFixedCosts: 'Tổng định phí',
    averageOrderValue: 'Giá trị đơn hàng trung bình',
    contributionMargin: 'Lợi nhuận gộp/đơn',
    variableCostRate: 'Tỷ lệ biến phí',
    variableCostPerOrder: 'Biến phí/đơn hàng',
    fixedCostsBreakdown: 'Chi Tiết Chi Phí Cố Định',
    productBreakdown: 'Điểm Hòa Vốn Theo Sản Phẩm',
    category: 'Loại',
    amount: 'Số tiền',
    product: 'Sản phẩm',
    units: 'Số lượng',
    total: 'Tổng cộng',
    orders: 'đơn hàng',
    perMonth: '/tháng',
    perOrder: '/đơn hàng',
    formula: 'Công thức tính',
    formulaText: 'Điểm hòa vốn = Tổng định phí / Lợi nhuận gộp mỗi đơn hàng',
    summary: 'Tóm tắt',
    summaryText: (result: BreakEvenResult, formatCurrency: (n: number) => string) =>
      `Với định phí ${formatCurrency(result.totalFixedCosts)}/tháng và lợi nhuận gộp ${formatCurrency(result.weightedContributionMargin)}/đơn (sau khi trừ biến phí ${result.totalVariableCostRate.toFixed(1)}%), bạn cần bán tối thiểu ${Math.ceil(result.breakEvenUnits).toLocaleString()} đơn hàng (tương đương ${formatCurrency(result.breakEvenRevenue)} doanh thu) để hòa vốn.`,
    generatedAt: 'Báo cáo được tạo lúc',
    footer: 'Báo cáo tự động từ hệ thống Tính Điểm Hòa Vốn',
  },
  en: {
    title: 'Break-Even Analysis Report',
    breakEvenUnits: 'Break-Even Point (Orders)',
    breakEvenRevenue: 'Break-Even Point (Revenue)',
    totalFixedCosts: 'Total Fixed Costs',
    averageOrderValue: 'Average Order Value',
    contributionMargin: 'Contribution Margin/Order',
    variableCostRate: 'Variable Cost Rate',
    variableCostPerOrder: 'Variable Cost/Order',
    fixedCostsBreakdown: 'Fixed Costs Breakdown',
    productBreakdown: 'Product Break-Even',
    category: 'Category',
    amount: 'Amount',
    product: 'Product',
    units: 'Units',
    total: 'Total',
    orders: 'orders',
    perMonth: '/month',
    perOrder: '/order',
    formula: 'Formula',
    formulaText: 'Break-Even Units = Total Fixed Costs / Contribution Margin per Order',
    summary: 'Summary',
    summaryText: (result: BreakEvenResult, formatCurrency: (n: number) => string) =>
      `With fixed costs of ${formatCurrency(result.totalFixedCosts)}/month and contribution margin of ${formatCurrency(result.weightedContributionMargin)}/order (after ${result.totalVariableCostRate.toFixed(1)}% variable costs), you need at least ${Math.ceil(result.breakEvenUnits).toLocaleString()} orders (${formatCurrency(result.breakEvenRevenue)} revenue) to break even.`,
    generatedAt: 'Report generated at',
    footer: 'Automated report from Break-Even Calculator',
  },
}

interface BreakEvenPdfProps {
  result: BreakEvenResult
  organizationName: string
  locale: 'vi' | 'en'
}

export function BreakEvenPdf({ result, organizationName, locale }: BreakEvenPdfProps) {
  const t = translations[locale]

  const formatCurrency = (amount: number) => {
    if (locale === 'vi') {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
      }).format(amount)
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const now = new Date().toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US')

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t.title}</Text>
          <Text style={styles.subtitle}>{organizationName}</Text>
          <Text style={styles.subtitle}>
            {t.generatedAt}: {now}
          </Text>
        </View>

        {/* Key Metrics */}
        <View style={styles.keyMetricCard}>
          <View style={styles.keyMetricItem}>
            <Text style={styles.keyMetricLabel}>{t.breakEvenUnits}</Text>
            <Text style={styles.keyMetricValue}>
              {Math.ceil(result.breakEvenUnits).toLocaleString()} {t.orders}
            </Text>
          </View>
          <View style={styles.keyMetricItem}>
            <Text style={styles.keyMetricLabel}>{t.breakEvenRevenue}</Text>
            <Text style={styles.keyMetricValue}>{formatCurrency(result.breakEvenRevenue)}</Text>
          </View>
        </View>

        {/* Formula */}
        <View style={styles.formulaBox}>
          <Text style={styles.formulaText}>{t.formula}:</Text>
          <Text style={styles.formulaText}>{t.formulaText}</Text>
          <Text style={styles.formulaText}>
            = {formatCurrency(result.totalFixedCosts)} /{' '}
            {formatCurrency(result.weightedContributionMargin)} ={' '}
            {Math.ceil(result.breakEvenUnits).toLocaleString()} {t.orders}
          </Text>
        </View>

        {/* Summary Stats */}
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>{t.totalFixedCosts}</Text>
            <Text style={styles.value}>
              {formatCurrency(result.totalFixedCosts)}
              {t.perMonth}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{t.averageOrderValue}</Text>
            <Text style={styles.value}>{formatCurrency(result.averageOrderValue)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{t.contributionMargin}</Text>
            <Text style={styles.value}>
              {formatCurrency(result.weightedContributionMargin)}
              {t.perOrder}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{t.variableCostRate}</Text>
            <Text style={styles.value}>{result.totalVariableCostRate.toFixed(1)}%</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{t.variableCostPerOrder}</Text>
            <Text style={styles.value}>
              {formatCurrency(result.totalVariableCostPerOrder)}
              {t.perOrder}
            </Text>
          </View>
        </View>

        {/* Fixed Costs Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.fixedCostsBreakdown}</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableCell}>{t.category}</Text>
              <Text style={styles.tableCellRight}>{t.amount}</Text>
            </View>
            {result.fixedCostsBreakdown.map((fc, i) => (
              <View key={i} style={styles.tableRow}>
                <Text style={styles.tableCell}>{fc.category}</Text>
                <Text style={styles.tableCellRight}>{formatCurrency(fc.amount)}</Text>
              </View>
            ))}
            <View style={[styles.tableRow, { backgroundColor: '#f3f4f6' }]}>
              <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>{t.total}</Text>
              <Text style={[styles.tableCellRight, { fontWeight: 'bold' }]}>
                {formatCurrency(result.totalFixedCosts)}
              </Text>
            </View>
          </View>
        </View>

        {/* Product Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.productBreakdown}</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableCell}>{t.product}</Text>
              <Text style={styles.tableCellRight}>{t.contributionMargin}</Text>
              <Text style={styles.tableCellRight}>{t.units}</Text>
            </View>
            {result.productBreakdown.map((p) => (
              <View key={p.id} style={styles.tableRow}>
                <Text style={styles.tableCell}>{p.name}</Text>
                <Text style={styles.tableCellRight}>{formatCurrency(p.contributionMargin)}</Text>
                <Text style={styles.tableCellRight}>
                  {Math.ceil(p.breakEvenUnits).toLocaleString()}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Summary */}
        <View style={styles.summaryBox}>
          <Text style={[styles.formulaText, { fontWeight: 'bold', color: '#166534' }]}>
            {t.summary}:
          </Text>
          <Text style={styles.summaryText}>{t.summaryText(result, formatCurrency)}</Text>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>{t.footer}</Text>
      </Page>
    </Document>
  )
}
