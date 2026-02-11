from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
import sys
import datetime
import io

from processors.global_orders import process_global_orders
from processors.mb51 import process_mb51
from processors.mb52 import process_mb52
from analytics.daily_stock_rupture import generate_combined_stock_ruptures

app = Flask(__name__)
CORS(app)

@app.route('/kys')
def kys():
    sys.exit(0)

@app.route('/health')
def health():
    return jsonify("OK!")

@app.route('/processors/global_orders', methods=['POST'])
def process_global_orders_route():
    try:
        me2n_file = request.files.get('me2n_file')
        lotus_file = request.files.get('lotus_file')
        
        if not me2n_file or not lotus_file:
            return jsonify({'error': 'Missing required files'}), 400
        
        result_buffer = process_global_orders(me2n_file, lotus_file)
        if not result_buffer: return jsonify({'error': 'Processing failed'}), 500
            
        return send_file(
            result_buffer,
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            as_attachment=True, 
            download_name=f"GlobalOrders-{datetime.datetime.now().strftime('%H%M%S')}.xlsx",
        ), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/processors/mb52', methods=['POST'])
def process_mb52_route():
    try:
        mb52_file = request.files.get('mb52_file')
        if not mb52_file: return jsonify({'error': 'Missing file'}), 400
        
        result_buffer = process_mb52(mb52_file)
        if not result_buffer: return jsonify({'error': 'Processing failed'}), 500
        
        # Logic to check if it's a zip or excel
        result_buffer.seek(0)
        is_zip = result_buffer.read(2) == b'PK'
        result_buffer.seek(0)

        mimetype = 'application/zip' if is_zip else 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ext = 'zip' if is_zip else 'xlsx'
        
        return send_file(
            result_buffer,
            as_attachment=True,
            download_name=f"MB52_Result.{ext}",
            mimetype=mimetype
        ), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/processors/mb51', methods=['POST'])
def process_mb51_route():
    try:
        mb51_file = request.files.get('mb51_file')
        movement_type = request.form.get('movement_type')

        if not mb51_file or not movement_type:
            return jsonify({'error': 'Missing file or movement type'}), 400
            
        # Process directly in memory
        result_buffer = process_mb51(mb51_file, int(movement_type))
        
        if result_buffer is None:
            return jsonify({'error': 'Processing failed'}), 500
        
        return send_file(
            result_buffer,
            as_attachment=True, 
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            download_name=f"MB51-Filtered-{datetime.datetime.now().strftime('%H%M%S')}.xlsx",
        ), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/processors/stock_ruptures', methods=['POST'])
def stock_ruptures_route():
    try:
        # Check if file exists in request
        if 'file' not in request.files:
            return jsonify({'error': 'No file part in the request (Expected key: "file")'}), 400
            
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'The selected file is empty.'}), 400
        
        # Call the processor
        # Any 'raise' inside generate_stock_ruptures will jump straight to the 'except' block below
        json_data = generate_combined_stock_ruptures(file)
        
        return jsonify(json_data), 200

    except Exception as e:
        # We capture the message from the raised exception 'e'
        error_message = str(e)
        print(f"Flask Route caught error: {error_message}")
        
        return jsonify({
            'error': error_message,
            'type': type(e).__name__,
            'status': 'failed'
        }), 500

if __name__ == '__main__':
    app.run(host='localhost', port=5454, debug=True, threaded=True)
