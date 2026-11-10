/**
 * Un pago se considera vencido cuando han pasado más de 30 días desde
 * la fecha del último pago. Sin fecha de pago, el alumno está en mora.
 */
export const isPaymentOverdue = (lastPaymentDate) => {
  if (!lastPaymentDate) return true;

  const paymentDate = new Date(`${lastPaymentDate}T00:00:00`);
  if (Number.isNaN(paymentDate.getTime())) return true;

  const differenceInDays = Math.floor(
    (Date.now() - paymentDate.getTime()) / (1000 * 3600 * 24),
  );

  return differenceInDays > 30;
};
