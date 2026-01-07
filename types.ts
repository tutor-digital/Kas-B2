
export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export enum Category {
  DUES = 'Iuran Bulanan',
  DONATION = 'Sumbangan',
  SUPPLIES = 'Perlengkapan',
  EVENT = 'Kegiatan/Acara',
  SOCIAL = 'Sosial/Duka',
  OTHER = 'Lain-lain'
}

export interface Fund {
  id: string;
  name: string;
  color: string;
  isMain: boolean;
}

export interface SplitRule {
  enabled: boolean;
  category: Category;
  ratio: number; // e.g., 0.5 for 50/50
  targetFundIds: string[];
}

export interface SchoolClass {
  id: string;
  name: string;
  funds: Fund[];
  splitRule: SplitRule;
}

export interface Transaction {
  id: string;
  classId: string;
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  fundId: string; // Menggunakan ID dana dinamis
  category: Category;
  recordedBy: string;
}

export interface SummaryStats {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  fundBalances: Record<string, number>;
}
