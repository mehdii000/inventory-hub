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
            "Tot Cons. 2025", "TAN Consomation 2025", 
            "BKN Consomation 2025", "Criticité/article"
        ]
        
        for col in core_columns:
            if col not in df.columns:
                raise ValueError(f"Required column '{col}' not found.")

        # Step 3: Filtering
        # Filter 1: "que 9999 Actif" must not be empty
        df = df.dropna(subset=["que 9999 Actif"])
        
        # Filter 2: "Tot Cons. 2025" must be > 0
        df["Tot Cons. 2025"] = pd.to_numeric(df["Tot Cons. 2025"], errors='coerce').fillna(0)
        df = df[df["Tot Cons. 2025"] > 0]

        # Step 4: Identify Date Columns (Qté T)
        # Dates are on row 3 (index 2), Qté T is row 4 (index 3)
        # We need to find columns named "Qté T" and extract the date above them
        full_df = pd.read_excel(excel_file, sheet_name=sheet_name, header=None)
        header_row = full_df.iloc[3] # Column names
        date_row = full_df.iloc[2]   # Date values
        
        # Extract indices of columns named "Qté T"
        qte_t_indices = [i for i, x in enumerate(header_row) if str(x).strip() == "Qté T"]
        
        results = {}

        # Step 5: Iterate through days and calculate ruptures
        for idx in qte_t_indices:
            # Get the date string from the row above
            raw_date = date_row[idx]
            if pd.isna(raw_date):
                continue
                
            date_key = str(raw_date).split(' ')[0] # Format as YYYY-MM-DD
            
            # Map column index to our filtered dataframe
            col_name = df.columns[idx]
            
            # Find rows where Qté T is 0
            # We use .iloc because df columns might have duplicate names (multiple "Qté T")
            stock_out_mask = (pd.to_numeric(df.iloc[:, idx], errors='coerce').fillna(0) == 0)
            rupture_rows = df[stock_out_mask]
            
            # Initialize categories
            counts = {"Test": 0, "PDR": 0, "Other": 0}
            
            for _, row in rupture_rows.iterrows():
                row_type = str(row["Type"]).strip()
                if row_type == "Test":
                    counts["Test"] += 1
                elif row_type == "PDR":
                    counts["PDR"] += 1
                else:
                    counts["Other"] += 1
            
            results[date_key] = counts

        return results

    except Exception as e:
        print(f"Error in generate_stock_ruptures: {e}")
        return None
