import json

# out_file = open("hospital_final.json", "w")

# hospital = dict() 
# with open("hospital_spending.json") as hospital_file:
# 	hospital = json.load(hospital_file)

# with open("hospital_spending2.json") as data_file:
# 	data = json.load(data_file)
# 	for key, value in data.iteritems():
# 		if key in hospital and len(value) > 1:
# 			hospital[key] = value

# json.dump(hospital, out_file, indent=4)

with open("hospital_final.json") as hospital:
	data = json.load(hospital)
	counter = 0
	for key, value in data.iteritems():
		if len(value) <= 5:
			print key
			counter+=1

	print counter