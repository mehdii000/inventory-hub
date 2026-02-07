import pandas as pd
import io
from openpyxl.utils import get_column_letter

def process_global_orders(me2n_file, lotus_file):
    """
    Main pipeline: Accepts file-like objects from Flask, 
    processes them in-memory, and returns a BytesIO buffer.
    """
    try:
        print("Starting in-memory global orders processing pipeline...")

        # Step 1: Process ME2N/SAP file
        df_me2n = filter_me2n(me2n_file)
        if df_me2n is None:
            return None

        # Step 2: Process LOTUS file
        df_lotus = filter_lotus(lotus_file)
        if df_lotus is None:
            return None

        # Step 3: Combine both dataframes
        combined_df = sum_global_orders(df_lotus, df_me2n)
        if combined_df is None:
            return None

        # Step 4: Final aggregation and export to buffer
        return extract_excel_data(combined_df)

    except Exception as e:
        print(f"Error in global orders processing: {str(e)}")
        return None

def filter_me2n(excel_file):
    """Filter the ME2N file stream."""
    try:
        df = pd.read_excel(excel_file)
        columns_to_extract = [
            "Purchasing Document", "Document Date", "Vendor/supplying plant",
            "Material", "Short Text", "Storage Location", "Order Quantity",
            "Still to be delivered (qty)", "Req. Tracking Number"
        ]

        # Filter columns and drop NaNs
        existing_cols = [col for col in columns_to_extract if col in df.columns]
        df = df[existing_cols].dropna(subset=["Storage Location", "Material"])
        
        # Keep non-zero delivery quantities
        if "Still to be delivered (qty)" in df.columns:
            df = df[df["Still to be delivered (qty)"] != 0]
            
        return df
    except Exception as e:
        print(f"Error in filter_me2n: {str(e)}")
        return None

def filter_lotus(file_storage):
    """Process LOTUS file (CSV or Excel) entirely in memory."""
    try:
        filename = file_storage.filename.lower()
        
        if filename.endswith('.csv'):
            # Replicating your _convert_csv_to_excel logic but into a DataFrame
            column_names = [
                "OrderID", "Col2", "Pos. no", "Activity", "Product name", 
                "SAP article no", "Quantity", "Price (EUR)", "SAP PO number", 
                "SAP PR number", "Process started on", "CC", "Col13",
                "Cost type number", "Cost type description", "Supplier",
                "Budget position", "Creator delivery date"
            ]
            
            df = pd.read_csv(file_storage, header=None, quotechar='"', encoding='utf-8')
            if df.shape[1] == 1:
                df = df[0].str.split(',', expand=True)
            
            # Map columns safely
            num_cols = min(len(column_names), df.shape[1])
            df.columns = column_names[:num_cols]
            
            # Numeric conversion for specific columns
            for col in ["Price (EUR)", "Quantity", "CC"]:
                if col in df.columns:
                    if col == "Price (EUR)":
                        df[col] = df[col].astype(str).str.replace(',', '.')
                    df[col] = pd.to_numeric(df[col], errors='coerce')
        else:
            df = pd.read_excel(file_storage)

        # Apply specific LOTUS filters
        if "SAP PO number" in df.columns:
            df = df[df["SAP PO number"].isna() | (df["SAP PO number"] == "") | (df["SAP PO number"] == 0)]
        
        if "SAP article no" in df.columns:
            df = df[df["SAP article no"].notna()]

        if "CC" in df.columns:
            df = df[df["CC"] == 47000]

        # Create Req. Tracking Number
        if "OrderID" in df.columns and "Pos. no" in df.columns:
            def create_tracking(row):
                oid = str(row['OrderID']).strip()
                pos = str(row['Pos. no']).strip()
                if '/' in oid:
                    year, order_num = oid.split('/', 1)
                    return f"{order_num}/{year}/{pos}"
                return f"{oid}/{pos}"
            
            df['Req. Tracking Number'] = df.apply(create_tracking, axis=1)

        return df
    except Exception as e:
        print(f"Error in filter_lotus: {str(e)}")
        return None

def sum_global_orders(lotus_df, me2n_df):
    """Aligns columns and concatenates DataFrames."""
    try:
        me2n_mapping = {
            "Req. Tracking Number": "Req. Tracking Number",
            "Product name": "Short Text",
            "SAP article no": "Material",
            "Quantity": "Still to be delivered (qty)",
            "SAP PO number": "Purchasing Document"
        }

        # Prepare ME2N: select existing map values and rename them to target keys
        me2n_cols = {v: k for k, v in me2n_mapping.items() if v in me2n_df.columns}
        me2n_final = me2n_df[list(me2n_cols.keys())].rename(columns=me2n_cols)

        # Prepare LOTUS: select existing target keys
        lotus_cols = [k for k in me2n_mapping.keys() if k in lotus_df.columns]
        lotus_final = lotus_df[lotus_cols]

        combined = pd.concat([lotus_final, me2n_final], ignore_index=True)
        return combined
    except Exception as e:
        print(f"Error in sum_global_orders: {str(e)}")
        return None

def extract_excel_data(combined_df):
    """Aggregates data and writes to a BytesIO buffer with formatting."""
    try:
        # Columns for final output
        cols = ["SAP article no", "Product name", "Quantity"]
        existing = [c for c in cols if c in combined_df.columns]
        
        df_subset = combined_df[existing].copy()
        df_subset["SAP article no"] = pd.to_numeric(df_subset["SAP article no"], errors='coerce')
        
        # Group and Sum
        result = df_subset.groupby(['SAP article no', 'Product name'], as_index=False)['Quantity'].sum()

        # Write to memory buffer
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            result.to_excel(writer, index=False, sheet_name='Sheet1')
            
            # Formatting: Prevent scientific notation in Excel
            ws = writer.sheets['Sheet1']
            for cell in ws['A']: # Assuming SAP article no is column A
                cell.number_format = '0'

        output.seek(0)
        return output
    except Exception as e:
        print(f"Error in extract_excel_data: {str(e)}")
        return None
