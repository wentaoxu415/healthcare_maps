import json
import csv

hospital_array = dict()

info_file = "data/hospital_general_information.csv"
spending_file = "data/medicare_hospital_spending.csv"
out_file = open("hospital_spending.json", "w")

def format_spending(amount):
	temp = amount.strip('$')
	temp = int(temp.replace(',', ''))
	return temp

with open(spending_file, 'rU') as spending_fh:
	spending_csv = csv.reader(spending_fh, delimiter=',', quotechar='"')
	next(spending_csv, None)

	for row in spending_csv:
		if row[3] == "Complete Episode":
			hospital = dict()
			hospital_array[row[1]] = hospital
			hospital["spending"] = format_spending(row[5])

with open(info_file, 'rU') as info_fh:
	info_csv = csv.reader(info_fh, delimiter=',', quotechar='"')
	next(info_csv, None)
	
	for row in info_csv:
		if row[0] in hospital_array:	
			temp = hospital_array[row[0]]
			hospital = dict()
			hospital["name"] = row[1]
			hospital["address"] = row[2]
			hospital["city"] = row[3]
			hospital["state"] = row[4]
			hospital["zip"] = int(row[5])
			hospital["county"] = row[6]
			hospital["owner"] = row[9]
			temp.update(hospital)

json.dump(hospital_array, out_file, indent=4)