from flask import Flask, jsonify, request, send_file
from flask_cors import CORS  # <--- Import this
import sys
from check_parent import begin_check
from werkzeug.utils import secure_filename
import datetime
import zipfile
import io

from processors.global_orders import process_global_orders
from processors.mb52 import process_mb52

app = Flask(__name__)
CORS(app)

@app.route('/kys')
def kys():
    sys.exit(0)

@app.route('/health')
def health():
    return jsonify("We good")

#############
@app.route('/processors/global_orders', methods=['POST'])
def process_global_orders_route():
    try:
        if 'me2n_file' not in request.files or 'lotus_file' not in request.files:
            return jsonify({'error': 'Missing required files'}), 400
            
        me2n_file = request.files['me2n_file']
        lotus_file = request.files['lotus_file']
        
        if me2n_file.filename == '' or lotus_file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
        
        # Process the files in memory
        # We pass the file objects directly; pandas can read these streams
        result_buffer = process_global_orders(me2n_file, lotus_file)
        
        if result_buffer is None:
            return jsonify({'error': 'Processing failed'}), 500
            
        return send_file(
            result_buffer,
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            as_attachment=True, 
            download_name=f"GlobalOrders-{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx",
        ), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
#############
@app.route('/processors/mb52', methods=['POST'])
def process_mb52_route():
    try:
        if 'mb52_file' not in request.files:
            return jsonify({'error': 'Missing MB52 file'}), 400
            
        mb52_file = request.files['mb52_file']
        if mb52_file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
        
        # result_buffer is now a BytesIO object
        result_buffer = process_mb52(mb52_file)
        
        if result_buffer is None:
            return jsonify({'error': 'Processing failed'}), 500
        
        # Determine if it's a zip or excel by checking the first few bytes (Magic Numbers)
        # PK.. is Zip (b'PK\x03\x04'), Excel is actually a zip structure too, 
        # but we can logic it out based on what our processor does.
        
        # We'll use a simple peek to check if it's a ZIP archive containing multiple files
        result_buffer.seek(0)
        content_sample = result_buffer.read(4)
        result_buffer.seek(0) # Reset after reading

        is_zip = False
        # If we have multiple files, we know it's our Zip.
        # A simple way: check if we return a zip or just send it and let the browser decide.
        # But here's a cleaner way:
        try:
            with zipfile.ZipFile(result_buffer) as zf:
                if len(zf.namelist()) > 1:
                    is_zip = True
            result_buffer.seek(0)
        except:
            result_buffer.seek(0)
            is_zip = False

        if is_zip:
            mimetype = 'application/zip'
            download_name = f"MB52_Results_{datetime.datetime.now().strftime('%Y%m%d')}.zip"
        else:
            mimetype = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            download_name = f"MB52_Result_{datetime.datetime.now().strftime('%Y%m%d')}.xlsx"
        
        return send_file(
            result_buffer,
            as_attachment=True,
            download_name=download_name,
            mimetype=mimetype
        ), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    begin_check()
    app.run(host='127.0.0.1', port=5454, debug=True, threaded=True)
