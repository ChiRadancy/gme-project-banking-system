export interface Transaction {
    id: number;
    transaction_date: Date;
    transaction_amount: number;
    transaction_method: string;
    transaction_description: string;
    transaction_user_reference: string;
    transaction_from_details: string[];
    transaction_to_details: string[];
    transaction_bank_account_id: number;
}