import pandas as pd
import io

def generate_stock_ruptures(excel_file):
    """
    Processes the stock list to find stock ruptures (0 quantity) 
    grouped by date and Type (Test, PDR, Other).
    """
    try:
        # Step 1: Handle sheet selection
        excel_data = pd.ExcelFile(excel_file)
        sheet_name = "MC" if "MC" in excel_data.sheet_names else excel_data.sheet_names[0]
        
        # Read the sheet. Headers are on row 4 (index 3)
        df = pd.read_excel(excel_file, sheet_name=sheet_name, header=3)
    
        # Step 2: Validate core columns
        core_columns = [
            "Code SAP", "que 9999 Actif", "que 8888 Actif", "Type", 
            "Tot Cons. 2025 ", "TAN Consomation 2025", 
            "BKN Consomation 2025", "Criticité/article"
        ]
        
        for col in core_columns:
            if col not in df.columns:
                raise ValueError(f"Required column '{col}' not found in sheet '{sheet_name}'.")

        # Step 3: Filtering
        # Filter 1: "que 9999 Actif" must not be empty
        df = df.dropna(subset=["que 9999 Actif"])
        
        # Filter 2: "TAN Consomation 2025" must be > 0
        df["TAN Consomation 2025"] = pd.to_numeric(df["TAN Consomation 2025"], errors='coerce').fillna(0)
        df = df[df["TAN Consomation 2025"] > 0]

        # Step 4: Identify Date Columns (Qté T)
        # Dates are on row 3 (index 2), Qté T is row 4 (index 3)
        full_df = pd.read_excel(excel_file, sheet_name=sheet_name, header=None)
        header_row = full_df.iloc[3] 
        date_row = full_df.iloc[2]   
        qte_t_indices = [i for i, x in enumerate(header_row) if str(x).strip() == "Qté T"]
        
        results = {}

        for idx in qte_t_indices:
            # CHECK: If the entire column for this 'Qté T' is empty, skip it
            current_column_data = df.iloc[:, idx]
            if current_column_data.isna().all():
                continue

            raw_date = date_row[idx]
            if pd.isna(raw_date):
                continue
                
            date_key = str(raw_date).split(' ')[0]
            
            # Stock out = actual numeric 0
            stock_out_mask = (pd.to_numeric(current_column_data, errors='coerce').fillna(0) == 0)
            # Ensure we only count rows that weren't originally empty/NaN in this column
            valid_data_mask = current_column_data.notna()
            
            rupture_rows = df[stock_out_mask & valid_data_mask]
            
            counts = {"Test": 0, "PDR": 0, "Other": 0}
            for _, row in rupture_rows.iterrows():
                row_type = str(row["Type"]).strip()
                if row_type in counts:
                    counts[row_type] += 1
                else:
                    counts["Other"] += 1
            
            results[date_key] = counts

        return results
    except Exception as e:
        raise e
