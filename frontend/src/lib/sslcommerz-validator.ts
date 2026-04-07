export interface SSLCommerzPayload {
  tran_id: string;
  val_id?: string;
  amount: string;
  card_type?: string;
  status: string;
}

export function validateSslPayload(payload: Partial<SSLCommerzPayload>): { isValid: boolean; message?: string } {
  if (!payload.tran_id || payload.tran_id.trim().length === 0) {
    return { isValid: false, message: "Missing transaction identifier (tran_id)" };
  }
  if (!payload.amount || parseFloat(payload.amount) <= 0) {
    return { isValid: false, message: "Invalid transaction amount" };
  }
  if (!payload.status) {
    return { isValid: false, message: "Missing transaction status header" };
  }
  return { isValid: true };
}
