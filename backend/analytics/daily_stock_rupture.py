import pandas as pd
import json

def generate_combined_stock_ruptures(excel_file):
    """
    Processes the stock list to find stock ruptures (0 quantity) 
    for both 9999 TAN and 8888 BKN, returned in a nested JSON.
    """
    try:
        # Step 1: Load Data
        excel_data = pd.ExcelFile(excel_file)
        sheet_name = "MC" if "MC" in excel_data.sheet_names else excel_data.sheet_names[0]
        
        # Read the main data (headers on row 4) and the raw data for dates
        df = pd.read_excel(excel_file, sheet_name=sheet_name, header=3)
        full_df = pd.read_excel(excel_file, sheet_name=sheet_name, header=None)
        
        header_row = full_df.iloc[3] # Row 4 containing 'Qté T', 'Qté B'
        date_row = full_df.iloc[2]   # Row 3 containing dates
        
        def process_site_logic(active_col, consumption_col, qte_label):
            # 1. Filter: Site must be active and have consumption > 0
            site_df = df.dropna(subset=[active_col]).copy()
            site_df[consumption_col] = pd.to_numeric(site_df[consumption_col], errors='coerce').fillna(0)
            site_df = site_df[site_df[consumption_col] > 0]
            
            # 2. Identify relevant quantity columns (e.g., all 'Qté T' columns)
            qte_indices = [i for i, x in enumerate(header_row) if str(x).strip() == qte_label]
            
            site_results = {}
            for idx in qte_indices:
                # Check if the column exists and has data
                current_column_data = site_df.iloc[:, idx]
                if current_column_data.isna().all():
                    continue
                
                # 3. Handle Date: Look at current index or one to the left (merged cells)
                raw_date = date_row[idx] if pd.notna(date_row[idx]) else (date_row[idx-1] if idx > 0 else None)
                if pd.isna(raw_date):
                    continue
                    
                date_key = str(raw_date).split(' ')[0]
                
                # 4. Count ruptures (Qty == 0)
                stock_out_mask = (pd.to_numeric(current_column_data, errors='coerce').fillna(0) == 0)
                valid_data_mask = current_column_data.notna()
                
                rupture_rows = site_df[stock_out_mask & valid_data_mask]
                
                counts = {"Test": 0, "PDR": 0, "Other": 0}
                for _, row in rupture_rows.iterrows():
                    row_type = str(row["Type"]).strip()
                    if row_type in counts:
                        counts[row_type] += 1
                    else:
                        counts["Other"] += 1
                
                site_results[date_key] = counts
            return site_results

        # Execute for both sites
        results = {
            "TAN_9999": process_site_logic("que 9999 Actif", "Tot Cons. TAN", "Qté T"),
            "BKN_8888": process_site_logic("que 8888 Actif", "Tot Cons. BKN", "Qté B")
        }

        return results

    except Exception as e:
        return {"error": str(e)}

# To get the JSON string:
# final_json = json.dumps(generate_combined_stock_ruptures("your_file.xlsx"), indent=4)
