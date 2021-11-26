#!/usr/bin/python3
from flask import Flask, request
import requests 
import json
from flask_cors import CORS, cross_origin
from flask_jsonpify import jsonify
app = Flask(__name__)
CORS(app)



	#print(message.sid)
def response_cors(res):
	res = {'response' : res}
	response = jsonify(res)
	response.headers.add('Access-Control-Allow-Origin', '*')
	return response	


@app.route("/print_pos_ticket", methods=['GET','OPTIONS'])
def print_pos_ticket():
	
	if not 'vals' in request.args:
		return response_cors('Debe enviar los valores del tiquet')
	vals = request.args['vals']
	if isinstance(vals, dict):
		json_vals = vals
	elif isinstance(vals, str):
		try:		
			json_vals = json.loads(vals)			
		except Exception as e:
			return str(e)
	else:
		return 'Formato de los valores incorrecto'
	

	try:		
		URL = "http://127.0.0.1:5006/print_pos_ticket/"	
		PARAMS = {'vals':vals} 	
		r = requests.get(url = URL, params = PARAMS) 
		data = r.json() 
		print('print_pos_ticket data: ', data)
		return response_cors(data['response'])	
	except Exception as e:
		return response_cors(str(e))
	
	
	
@app.route("/print_pos_fiscal_close", methods=['GET','OPTIONS'])
def print_pos_fiscal_close():
	print('print_pos_fiscal_close: ', request.args)
	if not 'type' in request.args:
		return response_cors('Debe enviar el tipo de cierre fiscal')
	type = request.args['type']
	try:		
		URL = "http://127.0.0.1:5006/print_pos_fiscal_close/"	
			
		r = requests.get(url = URL, params = type) 
		data = r.json() 
		return response_cors(data['response'])	
	except Exception as e:
		return response_cors(str(e))

@app.route("/state_printer", methods=['GET','OPTIONS'])
def state_printer():	
	try:		
		URL = "http://127.0.0.1:5006/state_printer/"	
		
		r = requests.get(url = URL, params = {}) 
		print('state_printer content: ', r.content)
		data = r.json() 
		print('state_printer: ', data)
		return response_cors(data['response'])	
	except Exception as e:
		return response_cors(str(e))

	
#from Printer import InterpreterO
#InterpreterO.test()

if __name__ == "__main__":
	app.debug = True
	app.run(host='0.0.0.0', port=5005)


