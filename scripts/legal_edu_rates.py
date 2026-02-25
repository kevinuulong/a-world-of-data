#
# NOTE: The code in this file has been generated using AI tools (Gemini).
#

import pandas as pd
import numpy as np

# 1. Load data
df_equality = pd.read_csv('./scripts/data/lgbt-legal-equality-index.csv')
df_edu = pd.read_csv('./scripts/data/primary-secondary-enrollment-completion-rates.csv')

# 2. Pre-filter and Sort
# Exclude 2025 and sort so the latest years are at the bottom
df_edu = df_edu[df_edu['Year'] < 2025].sort_values(['Code', 'Year'])

# 3. Custom function to get latest value AND its specific year
def get_latest_with_years(group):
    metrics = ['Primary enrollment', 'Secondary enrollment', 'Tertiary enrollment']
    result = {}
    
    for col in metrics:
        # Find rows where this specific column has data
        valid_data = group.dropna(subset=[col])
        if not valid_data.empty:
            last_row = valid_data.iloc[-1]
            result[col] = last_row[col]
            result[f'{col} Year'] = last_row['Year']
        else:
            result[col] = np.nan
            result[f'{col} Year'] = np.nan
            
    return pd.Series(result)

# 4. Apply logic per country
df_edu_latest = df_edu.groupby('Code').apply(get_latest_with_years).reset_index()

# 5. Merge with your 2025 Legal Equality data
final_df = pd.merge(df_equality, df_edu_latest, on='Code', how='left')

final_df.to_csv('./scripts/data/out/legal-edu-merged.csv', index=False)