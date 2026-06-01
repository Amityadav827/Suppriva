const payments = ["Visa", "Mastercard", "PayPal", "Amex"];

export function PaymentIcons() {
  return (
    <div>
      <h3 className="font-heading text-sm font-extrabold uppercase tracking-[0.14em] text-white">
        Accepted Payments
      </h3>
      <div className="mt-5 grid grid-cols-2 gap-2">
        {payments.map((payment) => (
          <span
            key={payment}
            className="rounded-xl border border-white/10 bg-white/[0.07] px-3 py-2 text-center font-heading text-xs font-semibold text-white/78 shadow-[0_10px_28px_rgba(0,0,0,0.12)]"
          >
            {payment}
          </span>
        ))}
      </div>
    </div>
  );
}
