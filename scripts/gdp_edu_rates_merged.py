#
# NOTE: The code in this file has been generated using AI tools (Gemini).
#

import pandas as pd

# 1. Load the datasets
gdp_df = pd.read_csv('./scripts/data/gdp-worldbank-constant-usd.csv')
enrolment_df = pd.read_csv('./scripts/data/primary-secondary-enrollment-completion-rates.csv')

import pandas as pd
from functools import reduce

# 1. List all the files you want to combine
# The first file in the list will be the "Base" file
files_to_join = [
    './scripts/data/gdp-worldbank-constant-usd.csv',
    './scripts/data/gdp-per-capita-worldbank-constant-usd.csv',
    './scripts/data/primary-secondary-enrollment-completion-rates.csv',
]

# 2. Define the columns that are common to ALL files (the "keys")
join_keys = ['Entity', 'Code', 'Year']

enrollment_cols = ['Primary enrollment', 'Secondary enrollment', 'Tertiary enrollment']

def combine_data(file_list, keys):
    # Load all CSVs into a list of DataFrames
    dfs = [pd.read_csv(f) for f in file_list]
    
    # Perform the merge
    # 'how=outer' ensures we keep data even if a country/year 
    # is missing in one of the files.
    df_merged = reduce(lambda left, right: pd.merge(left, right, on=keys, how='outer'), dfs)

    # FILTER: Remove rows where all enrollment columns are NaN
    # This effectively restricts the Year range to 1970-2023
    df_merged = df_merged.dropna(subset=enrollment_cols, how='all')
    
    return df_merged

# Execute the merge
final_df = combine_data(files_to_join, join_keys)

# 3. Optional: Sort the data so it's clean for D3
final_df = final_df.sort_values(by=['Entity', 'Year'])

# 4. Save the result
final_df.to_csv('./scripts/data/out/edu-rates-merged.csv', index=False)

print(f"Successfully combined {len(files_to_join)} files into './scripts/data/out/edu-rates-merged.csv'")
print("Columns in new file:", final_df.columns.tolist())