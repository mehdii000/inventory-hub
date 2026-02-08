import pandas as pd
import io

def process_mb51(mb51_file, movement_type):
    """
    Process an MB51 Excel file in-memory to handle movement types 101/102 or 121/122.
    """
    required_columns = [
        "Posting Date", "Material", "Material Description", "Purchase order",
        "Qty in unit of entry", "Vendor", "Movement type", 
        "Document Header Text", "Unit of Entry", "Amt.in loc.cur.", 
        "Cost Center", "Material Document", "Storage Location", "Reference"
    ]
    
    try:
        # Load directly from the Flask file stream
        df = pd.read_excel(mb51_file)
        
        # Validate required columns
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            raise ValueError(f"Missing required columns: {missing_columns}")
        
        # Data Cleaning
        df = df.dropna(subset=["Posting Date"])
        df['Document Header Text'] = df['Document Header Text'].astype(str).str.extract(r'(\S+)')
        
        # Define the 'PO' column dynamically based on your movement logic
        # Note: Your original code had a small typo 'Purhcase', fixed here.
        po_col = "Purchase order" if movement_type == 102 else "Document Header Text"
        
        # Split dataframes for processing
        df_x02 = df[df["Movement type"] == movement_type].copy()
        df_x01 = df[df["Movement type"] == (movement_type - 1)].copy()
        
        rows_to_delete = []

        # Logic Loop
        for idx_x02, row_x02 in df_x02.iterrows():
            mat = row_x02["Material"]
            po = row_x02[po_col]
            qty_x02 = row_x02["Qty in unit of entry"]
            
            # Find matching (x-1) rows
            matching_x01 = df_x01[
                (df_x01["Material"] == mat) &
                (df_x01[po_col] == po)
            ]
            
            if len(matching_x01) == 0:
                continue
            
            candidates = []
            for idx_x01, row_x01 in matching_x01.iterrows():
                qty_x01 = row_x01["Qty in unit of entry"]
                if qty_x01 + qty_x02 == 0:
                    candidates.append((idx_x01, "match"))
                elif qty_x01 + qty_x02 > 0:
                    candidates.append((idx_x01, "positive"))
                else:
                    candidates.append((idx_x01, "partial"))
            
            # Priority 1: Exact matches
            exact = [c for c in candidates if c[1] == "match"]
            if exact:
                rows_to_delete.extend([idx_x02, exact[0][0]])
                continue

            # Priority 2: Partial/Negative Sum
            partial = [c for c in candidates if c[1] == "partial"]
            if partial:
                idx_x01 = partial[0][0]
                qty_x01 = df.loc[idx_x01, "Qty in unit of entry"]
                new_qty = qty_x01 + qty_x02
                
                # Math for price adjustment
                price = df.loc[idx_x01, "Amt.in loc.cur."]
                pu = abs(price) / abs(qty_x01) if qty_x01 != 0 else 0
                
                df.at[idx_x01, "Qty in unit of entry"] = new_qty
                df.at[idx_x01, "Amt.in loc.cur."] = new_qty * pu
                rows_to_delete.append(idx_x02)
                continue

            # Priority 3: Positive Sum
            positive = [c for c in candidates if c[1] == "positive"]
            if positive:
                rows_to_delete.extend([idx_x02, positive[0][0]])

        # Cleanup
        df = df.drop(rows_to_delete)
        
        # Replace 'Storage Location' column that equals 1000 with 8888 and color it blue
        df['Storage Location'] = df['Storage Location'].apply(lambda x: 8888 if x == 1000 else x)

        # Export to BytesIO
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, index=False)
        output.seek(0)
        
        return output

    except Exception as e:
        print(f"Error in MB51 processor: {e}")
        return None
