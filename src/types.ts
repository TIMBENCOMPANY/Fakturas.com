export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Invoice {
  id: string; // Internal state ID
  clientName: string;
  clientEmail: string;
  clientAddress?: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  currency: string;
  vatRate: number; // percentage (e.g., 20)
  discountRate: number; // percentage (e.g., 5)
  items: InvoiceItem[];
  notes?: string;
  status: 'paid' | 'pending' | 'draft' | 'overdue';
}

export interface MetricCardValue {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
}

export interface FeatureCard {
  id: string;
  title: string;
  description: string;
  iconName: string;
}

export interface Testimonial {
  name: string;
  role: string;
  company: string;
  avatarUrl: string;
  quote: string;
}
