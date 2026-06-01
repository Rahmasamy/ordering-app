type PasswordResetInput = {
  id: bigint;
  user_id: bigint;
  otp_hash: string;
  expires_at: Date;
  created_at?: Date;
  consumed_at?: Date | null;
};

export class PasswordReset {
  id: bigint;
  user_id: bigint;
  otp_hash: string;
  expires_at: Date;
  created_at: Date;
  consumed_at: Date | null;

  constructor(data: Partial<PasswordResetInput>) {
    this.id = data.id!;
    this.user_id = data.user_id!;
    this.otp_hash = data.otp_hash!;
    this.expires_at = data.expires_at!;
    this.created_at = data.created_at  ?? new Date();
    this.consumed_at = data.consumed_at ?? null;
  }

  isExpired() : boolean {
    return this.expires_at < new Date()
  }
}
