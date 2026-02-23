#
# NOTE: The code in this file has been generated using AI tools (Gemini).
#

import pandas as pd
from functools import reduce
import numpy as np

# 1. Configuration
files_to_join = [
    './scripts/data/gdp-worldbank-constant-usd.csv',
    './scripts/data/gdp-per-capita-worldbank-constant-usd.csv',
    './scripts/data/primary-secondary-enrollment-completion-rates.csv',
]
join_keys = ['Entity', 'Code', 'Year']

# We only want to trim outliers for these specific columns
enrollment_cols = ['Primary enrollment', 'Secondary enrollment', 'Tertiary enrollment']

def trim_enrollment_outliers(df, columns):
    """
    Replaces outliers with NaN using the IQR method.
    Only affects the columns passed in the 'columns' list.
    """
    df_clean = df.copy()
    for col in columns:
        if col in df_clean.columns:
            # Calculate Quartiles
            Q1 = df_clean[col].quantile(0.25)
            Q3 = df_clean[col].quantile(0.75)
            IQR = Q3 - Q1
            
            # Define Bounds
            # lower_bound = Q1 - 1.5 * IQR
            upper_bound = Q3 + 1.5 * IQR
            
            # Replace outliers with NaN (null)
            # This keeps the row/Year intact but removes the specific data point
            df_clean.loc[(df_clean[col] > upper_bound), col] = np.nan
            
    return df_clean

def combine_data(file_list, keys):
    dfs = [pd.read_csv(f) for f in file_list]
    
    # Merge datasets
    df_merged = reduce(lambda left, right: pd.merge(left, right, on=keys, how='outer'), dfs)

    # Filter: Remove rows where there is ZERO enrollment data 
    # (Prevents showing empty years in D3)
    df_merged = df_merged.dropna(subset=enrollment_cols, how='all')
    
    # APPLY TRIM: Only to enrollment columns
    df_merged = trim_enrollment_outliers(df_merged, [*enrollment_cols, 'GPD per capita'])
    
    return df_merged

# Execute
final_df = combine_data(files_to_join, join_keys)

# Sort for D3 (important for path generators)
final_df = final_df.sort_values(by=['Entity', 'Year'])

# Save with empty strings for nulls so D3 sees them as empty/null
final_df.to_csv('./scripts/data/out/edu-rates-merged.csv', index=False, na_rep='')

print("Processing complete. Enrollment outliers nulled.")