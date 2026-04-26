import { pool } from "../db/client";

interface DebitInput {
  userId: string;
  amount: number;
  dailyLimit?: number;
}

export async function debitWalletHandler(input: DebitInput) {
  const { userId, amount, dailyLimit = 500 } = input;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const wallet = await client.query(
      `SELECT "walletId", "balance", "dailySpent", "dailySpentResetAt"
       FROM billetera WHERE "userId" = $1 FOR UPDATE`,
      [userId]
    );
    if (wallet.rows.length === 0) throw new Error("Wallet not found");

    const { balance, dailySpent, dailySpentResetAt } = wallet.rows[0];
    const now = new Date();
    const isNewDay = new Date(dailySpentResetAt).toDateString() !== now.toDateString();
    const currentDailySpent = isNewDay ? 0 : parseFloat(dailySpent);

    if (parseFloat(balance) < amount) {
      throw { message: "Insufficient funds", currentBalance: balance, requiredAmount: amount };
    }
    if (currentDailySpent + amount > dailyLimit) {
      throw { message: `Daily limit of ${dailyLimit} BOB exceeded` };
    }

    const result = await client.query(
      `UPDATE billetera
       SET "balance" = "balance" - $1,
           "dailySpent" = $2,
           "dailySpentResetAt" = $3,
           "updatedAt" = NOW()
       WHERE "userId" = $4
       RETURNING *`,
      [amount, currentDailySpent + amount, isNewDay ? now : dailySpentResetAt, userId]
    );

    await client.query("COMMIT");
    return { wallet: result.rows[0] };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}