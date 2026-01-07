
export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export enum FundCategory {
  ANAK = 'Kas Anak',
  PERPISAHAN = 'Kas Perpisahan'
}

export enum Category {
  DUES = 'Iuran Bulanan',
  DONATION = 'Sumbangan',
  SUPPLIES = 'Perlengkapan',
  EVENT = 'Kegiatan/Acara',
  SOCIAL = 'Sosial/Duka',
  OTHER = 'Lain-lain'
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  fundCategory: FundCategory;
  category: Category;
  recordedBy: string;
}

export interface SummaryStats {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  balanceAnak: number;
  balancePerpisahan: number;
}
