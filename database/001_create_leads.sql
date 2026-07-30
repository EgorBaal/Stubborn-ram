create table public.leads (
    id uuid primary key default gen_random_uuid(),

    created_at timestamptz not null default now(),

    status text not null default 'new',

    full_name text not null,
    age integer not null,
    height integer not null,
    weight numeric(5,2) not null,

    goals jsonb,
    goal_details text,

    training_experience text,
    training_experience_details text,

    difficulties jsonb,
    difficulties_details text,

    ideal_results jsonb,
    ideal_result_details text,

    report_preferences jsonb,
    report_preferences_details text,

    telegram text,
    phone text
);