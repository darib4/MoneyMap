CREATE TABLE public.users (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(254) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.transactions (
	id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	user_id INTEGER NOT NULL REFERENCES public.users(id),
	type VARCHAR(10) NOT NULL CHECK (TYPE IN ('income', 'expense')),
	amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
	description VARCHAR(255) NOT NULL,
	category VARCHAR(50) NOT NULL,
	transaction_date DATE NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.budgets (
	id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	user_id INTEGER NOT NULL REFERENCES public.users(id),
	category VARCHAR(50) NOT NULL CHECK(char_length(btrim(category)) > 0),
	budget_month DATE NOT NULL CHECK(EXTRACT(DAY FROM budget_month) = 1),
	limit_cents INTEGER NOT NULL CHECK(limit_cents > 0),
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX budgets_user_category_month_unique ON public.budgets (
	user_id,
	lower(btrim(category)),
	budget_month
);