#
# NOTE: The code in this file has been generated using AI tools (Gemini).
#

import pandas as pd
import numpy as np

df = pd.read_csv('./scripts/data/gdp-worldbank-constant-usd.csv')


def format_currency(val):
    """Helper to format numbers into strings like $5B or $100M."""
    if val == 0:
        return "$0"
    if val >= 1e12:
        return f"${val/1e12:g}T"
    if val >= 1e9:
        return f"${val/1e9:g}B"
    if val >= 1e6:
        return f"${val/1e6:g}M"
    return f"${val:g}"


def get_binned_data(df, mode='linear'):
    """
    Bins GDP data based on mode: 'linear' or 'log'.
    """
    if mode == 'linear':
        # Linear bins: 0 to 50B in steps of 10B
        # Customize step_size and max_val as needed
        step_size = 10e9
        max_val = 50e9
        bins = list(np.arange(0, max_val + step_size, step_size)) + \
            [float('inf')]

    elif mode == 'log':
        # Logarithmic bins: Powers of 10 (100M, 1B, 10B, 100B, 1T, etc.)
        bins = [0, 1e8, 1e9, 1e10, 1e11, 1e12, float('inf')]

    # Generate pretty labels like "$1B–$10B"
    labels = []
    for i in range(len(bins) - 1):
        low, high = bins[i], bins[i+1]
        if high == float('inf'):
            labels.append(f">{format_currency(low)}")
        else:
            labels.append(f"<{format_currency(high)}")

    # Create the binned column
    df_temp = df.copy()
    df_temp['GDP_Bin'] = pd.cut(
        df_temp['GDP'], bins=bins, labels=labels, right=False)

    # Pivot for visualization (Year as rows, Bins as columns)
    pivoted = df_temp.groupby(
        ['Year', 'GDP_Bin'], observed=False).size().unstack(fill_value=0)

    return pivoted


MODE = 'log'

final_df = get_binned_data(df, mode=MODE)
final_df.to_csv(f'./scripts/data/out/gdp-distribution-{MODE}.csv')
