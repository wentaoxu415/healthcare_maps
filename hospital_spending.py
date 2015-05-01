import json
import csv
from geopy.geocoders import GoogleV3
from geopy.geocoders import OpenMapQuest
import time

geolocator1 = GoogleV3('AIzaSyAuX711XQT5Vd6qVQVVc-qf6sxKZGEWXhw', timeout=5)

# from geopy.geocoders import GoogleV3
# geolocator = GoogleV3()
hospital_array = dict()
missing_array = dict()

info_file = "data/hospital_general_information.csv"
spending_file = "data/medicare_hospital_spending.csv"
out_file = open("hospital_spending2.json", "w")
miss_file = open("missing_geocode2.json", "w")
temp_file = open("temp_hospital_spending2.json", "w")

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

	ctr = 0
	while ctr < 2000:
		next(info_csv, None)
		ctr += 1

	ctr = 0
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

			if ctr == 500:
				json.dump(hospital_array, temp_file, indent=4)
			elif ctr == 2000:
				break

			time.sleep(0.5)
			location = geolocator1.geocode(row[2]+row[3])

			# else:
			# 	time.sleep(1)
			# 	location = geolocator2.geocode(row[2]+row[3])
			
			if location:
				hospital["geocode"] = (location.latitude, location.longitude)
				hospital["latitude"] = location.latitude
				hospital["longitude"] = location.longitude
				print hospital["geocode"]
			else:
				hospital["geocode"] = None
				hospital["latitude"] = None
				hospital["longitude"] = None
				missing_array[row[1]] = [row[2], row[3], row[4]]
				print row[2], row[3]
			temp.update(hospital)
			print ctr
			ctr+=1
json.dump(hospital_array, out_file, indent=4)
json.dump(missing_array, miss_file, indent=4)