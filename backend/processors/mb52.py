import pandas as pd
import io
import zipfile
from datetime import datetime

def process_mb52(mb52_file):
    """Process MB52 file and separate into different storage locations in memory."""
    try:
        print(f"Processing MB52 file stream...")
        
        # Read the Excel file stream directly
        df = pd.read_excel(mb52_file)
        
        columns_to_keep = ["Material Number", "Storage Location", "Material Description", "Unrestricted"]
        
        # Ensure all required columns exist
        for column in columns_to_keep:
            if column not in df.columns:
                raise ValueError(f"Required column '{column}' not found in the input file")
        
        # Data conversion
        df["Material Number"] = df["Material Number"].astype(str)
        df["Storage Location"] = pd.to_numeric(df["Storage Location"], errors='coerce')
        df["Unrestricted"] = pd.to_numeric(df["Unrestricted"], errors='coerce').fillna(0)
        
        # Dictionary to store our in-memory files
        # Key: filename, Value: BytesIO object
        output_mem_files = {}

        # --- Step 1 & 2: Filter/Group Storage Location 8888 & 1000 ---
        df_8888_1000 = df[df["Storage Location"].isin([8888, 1000])]
        if not df_8888_1000.empty:
            combined_8888 = df_8888_1000.groupby("Material Number").agg({
                "Material Description": "first",
                "Unrestricted": "sum",
            }).reset_index()
            combined_8888["Storage Location"] = 8888
            
            # Save to buffer
            buf_8888 = io.BytesIO()
            combined_8888.to_excel(buf_8888, index=False, engine='openpyxl')
            buf_8888.seek(0)
            output_mem_files[f"MB52-8888-{datetime.now().strftime('%H%M%S')}.xlsx"] = buf_8888

        # --- Step 3: Handle Storage Location 9999 ---
        df_9999 = df[df["Storage Location"] == 9999]
        if not df_9999.empty:
            grouped_9999 = df_9999.groupby(["Material Number", "Storage Location"]).agg({
                "Material Description": "first",
                "Unrestricted": "sum"
            }).reset_index()
            
            # Save to buffer
            buf_9999 = io.BytesIO()
            grouped_9999.to_excel(buf_9999, index=False, engine='openpyxl')
            buf_9999.seek(0)
            output_mem_files[f"MB52-9999-{datetime.now().strftime('%H%M%S')}.xlsx"] = buf_9999

        # --- Final Packaging ---
        if len(output_mem_files) > 1:
            # Create a ZIP in memory
            zip_buffer = io.BytesIO()
            with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zipf:
                for filename, file_data in output_mem_files.items():
                    # No need to seek(0) here, it was done above
                    zipf.writestr(filename, file_data.getvalue())
            zip_buffer.seek(0)
            return zip_buffer
        
        elif len(output_mem_files) == 1:
            # Return the single Excel buffer
            return list(output_mem_files.values())[0]
        
        else:
            print("No output files were created.")
            return None
            
    except Exception as e:
        print(f"Error in process_mb52: {str(e)}")
        return None
