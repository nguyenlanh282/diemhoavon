import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Hr,
  Row,
  Column,
} from '@react-email/components'

interface BreakEvenEmailProps {
  recipientName: string
  organizationName: string
  locale: 'vi' | 'en'
  result: {
    breakEvenUnits: number
    breakEvenRevenue: number
    totalFixedCosts: number
    averageOrderValue: number
    contributionMargin: number
    calculatedAt: string
  }
}

const translations = {
  vi: {
    subject: 'Báo cáo Phân tích Điểm Hòa Vốn',
    greeting: 'Xin chào',
    intro: 'Dưới đây là kết quả phân tích điểm hòa vốn của bạn:',
    breakEvenUnits: 'Điểm hòa vốn (Đơn hàng)',
    breakEvenRevenue: 'Điểm hòa vốn (Doanh thu)',
    totalFixedCosts: 'Tổng định phí',
    averageOrderValue: 'Giá trị đơn hàng trung bình',
    contributionMargin: 'Lợi nhuận gộp/đơn',
    calculatedAt: 'Thời gian tính toán',
    footer: 'Đây là email tự động từ hệ thống Tính Điểm Hòa Vốn.',
    viewDetails: 'Xem chi tiết tại dashboard',
    perMonth: '/tháng',
    orders: 'đơn hàng',
  },
  en: {
    subject: 'Break-Even Analysis Report',
    greeting: 'Hello',
    intro: 'Here are your break-even analysis results:',
    breakEvenUnits: 'Break-Even Point (Orders)',
    breakEvenRevenue: 'Break-Even Point (Revenue)',
    totalFixedCosts: 'Total Fixed Costs',
    averageOrderValue: 'Average Order Value',
    contributionMargin: 'Contribution Margin/Order',
    calculatedAt: 'Calculated At',
    footer: 'This is an automated email from Break-Even Calculator.',
    viewDetails: 'View details on dashboard',
    perMonth: '/month',
    orders: 'orders',
  },
}

export function BreakEvenEmail({
  recipientName,
  organizationName,
  locale,
  result,
}: BreakEvenEmailProps) {
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

  return (
    <Html>
      <Head />
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Header */}
          <Section style={styles.header}>
            <Heading style={styles.h1}>{t.subject}</Heading>
            <Text style={styles.orgName}>{organizationName}</Text>
          </Section>

          <Hr style={styles.hr} />

          {/* Greeting */}
          <Section>
            <Text style={styles.text}>
              {t.greeting} {recipientName},
            </Text>
            <Text style={styles.text}>{t.intro}</Text>
          </Section>

          {/* Key Results */}
          <Section style={styles.results}>
            <Row>
              <Column style={styles.resultCard}>
                <Text style={styles.resultLabel}>{t.breakEvenUnits}</Text>
                <Text style={styles.resultValue}>
                  {Math.ceil(result.breakEvenUnits).toLocaleString()} {t.orders}
                </Text>
              </Column>
              <Column style={styles.resultCard}>
                <Text style={styles.resultLabel}>{t.breakEvenRevenue}</Text>
                <Text style={styles.resultValue}>{formatCurrency(result.breakEvenRevenue)}</Text>
              </Column>
            </Row>
          </Section>

          {/* Details Table */}
          <Section style={styles.detailsSection}>
            <table style={styles.table}>
              <tbody>
                <tr>
                  <td style={styles.tableLabel}>{t.totalFixedCosts}</td>
                  <td style={styles.tableValue}>
                    {formatCurrency(result.totalFixedCosts)}
                    {t.perMonth}
                  </td>
                </tr>
                <tr>
                  <td style={styles.tableLabel}>{t.averageOrderValue}</td>
                  <td style={styles.tableValue}>{formatCurrency(result.averageOrderValue)}</td>
                </tr>
                <tr>
                  <td style={styles.tableLabel}>{t.contributionMargin}</td>
                  <td style={styles.tableValue}>{formatCurrency(result.contributionMargin)}</td>
                </tr>
                <tr>
                  <td style={styles.tableLabel}>{t.calculatedAt}</td>
                  <td style={styles.tableValue}>{result.calculatedAt}</td>
                </tr>
              </tbody>
            </table>
          </Section>

          <Hr style={styles.hr} />

          {/* Footer */}
          <Section>
            <Text style={styles.footer}>{t.footer}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const styles = {
  body: {
    backgroundColor: '#f6f9fc',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  container: {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '20px',
    maxWidth: '600px',
  },
  header: {
    textAlign: 'center' as const,
    padding: '20px 0',
  },
  h1: {
    color: '#1a1a1a',
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '0',
  },
  orgName: {
    color: '#666666',
    fontSize: '14px',
    margin: '10px 0 0',
  },
  hr: {
    borderColor: '#e6e6e6',
    margin: '20px 0',
  },
  text: {
    color: '#333333',
    fontSize: '14px',
    lineHeight: '24px',
  },
  results: {
    padding: '20px 0',
  },
  resultCard: {
    backgroundColor: '#f0f7ff',
    padding: '20px',
    textAlign: 'center' as const,
    borderRadius: '8px',
    margin: '0 5px',
  },
  resultLabel: {
    color: '#666666',
    fontSize: '12px',
    margin: '0 0 8px',
  },
  resultValue: {
    color: '#1a1a1a',
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '0',
  },
  detailsSection: {
    padding: '10px 0',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
  },
  tableLabel: {
    padding: '10px 0',
    color: '#666666',
    fontSize: '14px',
    borderBottom: '1px solid #e6e6e6',
  },
  tableValue: {
    padding: '10px 0',
    color: '#1a1a1a',
    fontSize: '14px',
    fontWeight: 'bold',
    textAlign: 'right' as const,
    borderBottom: '1px solid #e6e6e6',
  },
  footer: {
    color: '#999999',
    fontSize: '12px',
    textAlign: 'center' as const,
  },
}

export function getEmailSubject(locale: 'vi' | 'en') {
  return translations[locale].subject
}
