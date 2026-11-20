export const MAX_MONEY_CENTS = 2_147_483_647;

export const MONEY_INPUT_ERROR =
    "Enter an amount between €0.01 and €21,474,836.47" +
    "with up to two decimal places.";

export function parseMoneyToCents(value: string): number | null {
    const normalized = value.trim().replace(",", ".");

    if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
        return null;
    }

    const [whole, fraction = ""] = normalized.split(".");

    const cents = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));

    if(!Number.isSafeInteger(cents) || cents <= 0 || cents > MAX_MONEY_CENTS) {
        return null;
    }

    return cents;
}

export const euroFormatter = new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR"
});

export function formatMoney(cents: number): string {
    return euroFormatter.format(cents/100);
}