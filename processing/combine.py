import json

out_file = open("../data/hospital_final.json", "w")

hospital = dict() 
with open("../data/hospital_spending.json") as hospital_file:
	hospital = json.load(hospital_file)

with open("../data/hospital_spending2.json") as data_file:
	data = json.load(data_file)
	for key, value in data.iteritems():
		if key in hospital and len(value) > 1:
			hospital[key] = value

json.dump(hospital, out_file, indent=4)



	