#
# NOTE: The code in this file has been generated using AI tools (Gemini).
#

import pandas as pd
import numpy as np
import math

df = pd.read_csv('./scripts/data/gdp-per-capita-worldbank-constant-usd.csv')


def format_currency(val):
    if val == 0:
        return "$0"
    if val >= 1e12:
        return f"${val/1e12:g}T"
    if val >= 1e9:
        return f"${val/1e9:g}B"
    if val >= 1e6:
        return f"${val/1e6:g}M"
    if val >= 1e3:
        return f"${val/1e3:g}K"
    return f"${val:g}"


def round_to_nice_number(val, direction='round'):
    """Rounds to the nearest clean significant digit (e.g., 247k -> 250k)."""
    if val <= 0:
        return 0
    exponent = 10 ** math.floor(math.log10(val))
    # Round to nearest half-step or whole-step of the exponent (1, 2, 5, 10)
    for factor in [1, 2, 5, 10]:
        candidate = factor * exponent
        if direction == 'ceil' and candidate >= val:
            return candidate
        if direction == 'round' and candidate >= val:
            return candidate
    return math.ceil(val / exponent) * exponent


def get_binned_data(df, mode='log', num_bins=6):
    col_name = 'GDP per capita'
    valid_data = df[col_name].dropna()

    data_min = valid_data.min()
    data_max = valid_data.max()

    # 1. Determine Nice Edges
    # Start at the actual data minimum (rounded down)
    start = round_to_nice_number(data_min)
    # End at the actual data maximum (rounded up)
    end = round_to_nice_number(data_max, direction='ceil')

    if mode == 'linear':
        raw_edges = np.linspace(start, end, num_bins + 1)
    else:
        raw_edges = np.geomspace(max(start, 1), end, num_bins + 1)

    # 2. Clean the Edges
    # Apply rounding to every single edge in the array
    clean_bins = sorted(
        list(set([round_to_nice_number(e) for e in raw_edges])))

    # Ensure the last bin definitely covers the max data point
    if clean_bins[-1] < data_max:
        clean_bins[-1] = round_to_nice_number(data_max, direction='ceil')

    # 3. Generate Labels
    labels = [f"<{format_currency(b)}" for b in clean_bins[1:]]

    # 4. Bin and Pivot
    df_temp = df.copy()
    df_temp['GDP_Bin'] = pd.cut(
        df_temp[col_name],
        bins=clean_bins,
        labels=labels,
        include_lowest=True
    )

    pivoted = df_temp.groupby(
        ['Year', 'GDP_Bin'], observed=False).size().unstack(fill_value=0)

    return pivoted


MODE = 'log'
NUM_BINS = 6

# Execution
final_df = get_binned_data(df, mode=MODE, num_bins=NUM_BINS)
final_df.to_csv(f'./scripts/data/out/gdp-per-capita-distribution-{MODE}.csv')
