import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#000000",
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: "#FFD749",
    paddingBottom: 15,
  },
  companyName: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
  },
  companyDetails: {
    fontSize: 8,
    color: "#666666",
    marginTop: 4,
  },
  quotationTitle: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    textAlign: "right",
  },
  quotationNumber: {
    fontSize: 10,
    textAlign: "right",
    marginTop: 4,
  },
  quotationMeta: {
    fontSize: 8,
    textAlign: "right",
    color: "#666666",
    marginTop: 2,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  row: {
    flexDirection: "row",
    marginBottom: 2,
  },
  label: {
    width: 120,
    fontSize: 9,
    color: "#666666",
  },
  value: {
    flex: 1,
    fontSize: 9,
  },
  table: {
    marginTop: 8,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#000000",
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  tableHeaderText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
  },
  tableRow: {
    flexDirection: "row",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: "#EEEEEE",
  },
  tableRowAlt: {
    backgroundColor: "#FAFAFA",
  },
  tableCell: {
    fontSize: 9,
  },
  colDesc: { flex: 3 },
  colQty: { width: 40, textAlign: "center" as const },
  colUnit: { width: 40, textAlign: "center" as const },
  colPrice: { width: 80, textAlign: "right" as const },
  colTotal: { width: 80, textAlign: "right" as const },
  totalsSection: {
    marginTop: 15,
    alignItems: "flex-end" as const,
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 3,
    width: 250,
  },
  totalsLabel: {
    flex: 1,
    fontSize: 9,
    color: "#666666",
    textAlign: "right" as const,
    paddingRight: 15,
  },
  totalsValue: {
    width: 100,
    fontSize: 9,
    textAlign: "right" as const,
  },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    width: 250,
    marginTop: 5,
    paddingTop: 8,
    borderTopWidth: 2,
    borderTopColor: "#FFD749",
  },
  grandTotalLabel: {
    flex: 1,
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    textAlign: "right" as const,
    paddingRight: 15,
  },
  grandTotalValue: {
    width: 100,
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    textAlign: "right" as const,
  },
  designSection: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 8,
  },
  designCard: {
    width: "30%",
    padding: 8,
    backgroundColor: "#FAFAFA",
    borderWidth: 0.5,
    borderColor: "#EEEEEE",
    borderRadius: 4,
  },
  designLabel: {
    fontSize: 7,
    color: "#666666",
    textTransform: "uppercase" as const,
    marginBottom: 2,
  },
  designValue: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
  },
  terms: {
    fontSize: 7,
    color: "#999999",
    lineHeight: 1.4,
  },
  termsTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#666666",
    marginBottom: 4,
  },
  pageNumber: {
    fontSize: 7,
    color: "#999999",
    textAlign: "center" as const,
    marginTop: 10,
  },
});

function formatNaira(amount: number): string {
  return "₦" + amount.toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export interface QuotationPdfProps {
  quotationNumber: string;
  issuedAt: string;
  validDays: number;
  company: {
    name: string;
    address: string;
    phone: string;
    email: string;
    bankDetails: string;
    terms: string;
  };
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
  } | null;
  design: {
    connectedLoadW: number;
    dailyEnergyKwh: number;
    inverterKva: number;
    batteryCount: number;
    batteryDescription: string;
    panelCount: number;
    installedKwp: number;
    backupTimeHours: number;
    systemVoltage: number;
  } | null;
  lines: Array<{
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    lineTotal: number;
  }>;
  subtotal: number;
  markupRate: number;
  markupAmount: number;
  grandTotal: number;
}

export function QuotationPdfDocument(props: QuotationPdfProps) {
  const { quotationNumber, issuedAt, validDays, company, customer, design, lines, subtotal, markupRate, markupAmount, grandTotal } = props;

  const expiryDate = new Date(issuedAt);
  expiryDate.setDate(expiryDate.getDate() + validDays);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.companyName}>{company.name}</Text>
            {company.address && <Text style={styles.companyDetails}>{company.address}</Text>}
            {company.phone && <Text style={styles.companyDetails}>Tel: {company.phone}</Text>}
            {company.email && <Text style={styles.companyDetails}>{company.email}</Text>}
          </View>
          <View>
            <Text style={styles.quotationTitle}>QUOTATION</Text>
            <Text style={styles.quotationNumber}>{quotationNumber}</Text>
            <Text style={styles.quotationMeta}>Date: {new Date(issuedAt).toLocaleDateString()}</Text>
            <Text style={styles.quotationMeta}>Valid until: {expiryDate.toLocaleDateString()}</Text>
          </View>
        </View>

        {/* Customer */}
        {customer && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Customer</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Name</Text>
              <Text style={styles.value}>{customer.name}</Text>
            </View>
            {customer.email && (
              <View style={styles.row}>
                <Text style={styles.label}>Email</Text>
                <Text style={styles.value}>{customer.email}</Text>
              </View>
            )}
            {customer.phone && (
              <View style={styles.row}>
                <Text style={styles.label}>Phone</Text>
                <Text style={styles.value}>{customer.phone}</Text>
              </View>
            )}
            {customer.address && (
              <View style={styles.row}>
                <Text style={styles.label}>Address</Text>
                <Text style={styles.value}>{customer.address}</Text>
              </View>
            )}
          </View>
        )}

        {/* System Design Summary */}
        {design && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>System Design Summary</Text>
            <View style={styles.designSection}>
              <View style={styles.designCard}>
                <Text style={styles.designLabel}>Connected Load</Text>
                <Text style={styles.designValue}>{design.connectedLoadW.toLocaleString()} W</Text>
              </View>
              <View style={styles.designCard}>
                <Text style={styles.designLabel}>Daily Energy</Text>
                <Text style={styles.designValue}>{design.dailyEnergyKwh.toFixed(2)} kWh</Text>
              </View>
              <View style={styles.designCard}>
                <Text style={styles.designLabel}>Inverter</Text>
                <Text style={styles.designValue}>{design.inverterKva} kVA</Text>
              </View>
              <View style={styles.designCard}>
                <Text style={styles.designLabel}>Batteries</Text>
                <Text style={styles.designValue}>{design.batteryCount}× {design.batteryDescription.split(" ")[0]}</Text>
              </View>
              <View style={styles.designCard}>
                <Text style={styles.designLabel}>PV Array</Text>
                <Text style={styles.designValue}>{design.panelCount} panels ({design.installedKwp.toFixed(2)} kWp)</Text>
              </View>
              <View style={styles.designCard}>
                <Text style={styles.designLabel}>Backup Time</Text>
                <Text style={styles.designValue}>{design.backupTimeHours.toFixed(1)} hrs</Text>
              </View>
            </View>
          </View>
        )}

        {/* Cost Breakdown Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cost Breakdown</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.colDesc]}>Description</Text>
              <Text style={[styles.tableHeaderText, styles.colQty]}>Qty</Text>
              <Text style={[styles.tableHeaderText, styles.colUnit]}>Unit</Text>
              <Text style={[styles.tableHeaderText, styles.colPrice]}>Unit Price</Text>
              <Text style={[styles.tableHeaderText, styles.colTotal]}>Total</Text>
            </View>
            {lines.map((line, idx) => (
              <View key={idx} style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]}>
                <Text style={[styles.tableCell, styles.colDesc]}>{line.description}</Text>
                <Text style={[styles.tableCell, styles.colQty]}>{line.quantity}</Text>
                <Text style={[styles.tableCell, styles.colUnit]}>{line.unit}</Text>
                <Text style={[styles.tableCell, styles.colPrice]}>{formatNaira(line.unitPrice)}</Text>
                <Text style={[styles.tableCell, styles.colTotal]}>{formatNaira(line.lineTotal)}</Text>
              </View>
            ))}
          </View>

          {/* Totals */}
          <View style={styles.totalsSection}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Subtotal</Text>
              <Text style={styles.totalsValue}>{formatNaira(subtotal)}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Markup ({(markupRate * 100).toFixed(0)}%)</Text>
              <Text style={styles.totalsValue}>{formatNaira(markupAmount)}</Text>
            </View>
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Grand Total</Text>
              <Text style={styles.grandTotalValue}>{formatNaira(grandTotal)}</Text>
            </View>
          </View>
        </View>

        {/* Bank Details */}
        {company.bankDetails && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Details</Text>
            <Text style={{ fontSize: 9, lineHeight: 1.4 }}>{company.bankDetails}</Text>
          </View>
        )}

        {/* Footer / Terms */}
        <View style={styles.footer}>
          {company.terms && (
            <View>
              <Text style={styles.termsTitle}>Terms &amp; Conditions</Text>
              <Text style={styles.terms}>{company.terms}</Text>
            </View>
          )}
          <Text style={styles.pageNumber}>
            {quotationNumber}  - Generated by SunSizer
          </Text>
        </View>
      </Page>
    </Document>
  );
}
