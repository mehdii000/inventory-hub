from flask import Flask, jsonify
import sys
from check_parent import begin_check

app = Flask(__name__)

@app.route('/kys')
def kys():
    # This endpoint is sent from the frontend as a last resort telling the process to kill itself.
    sys.exit(0)

if __name__ == '__main__':
    begin_check()
    app.run(host='127.0.0.1', port=5454, debug=True, threaded=True)
