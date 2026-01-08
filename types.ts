
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
  ratio: number;
  targetFundIds: string[];
}

export interface SchoolClass {
  id: string;
  name: string;
  funds: Fund[];
  splitRule: SplitRule;
  students: string[]; // Daftar nama siswa
  isActive: boolean;  // Status aktif/inaktif
}

export interface Transaction {
  id: string;
  classId: string;
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  fundId: string;
  category: Category;
  recordedBy: string;
  studentName?: string; // Nama siswa jika iuran
  attachmentUrl?: string; // Link foto nota
}

export interface SummaryStats {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  fundBalances: Record<string, number>;
}
