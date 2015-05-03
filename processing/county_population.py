import json
import csv

demographics_array = dict()

info_file = "../data/hospital_general_information.csv"
demo_file = "../data/demographics.csv"
out_file = open("../data/demographics.json", "w")
demo_array = dict()

with open(demo_file, "rU") as demo_fh:
	demo_csv = csv.reader(demo_fh, delimiter=',', quotechar='"')
	next(demo_csv, None)

	for row in demo_csv:
		demo = dict()
		demo["population"] = row[8]
		demo["under_19"] = row[17]
		demo["19_64"] = row[20]
		demo["65_84"] = row[23]
		demo["over_85"] = row[26]
		demo["white"] = row[29]
		demo["black"] = row[32]
		demo["native"] = row[35]
		demo["asian"] = row[38]
		demo["hispanic"] = row[41]
		demo_array[row[2].lower()] = demo

with open(info_file, "rU") as info_fh:
	info_csv = csv.reader(info_fh, delimiter=',', quotechar='"')
	next(info_csv, None)

	for row in info_csv:
		county = row[6].lower()
		if county in demo_array:
			temp = demo_array[county]
			loc = dict()
			loc["zip_code"] = row[5]
 			temp.update(loc)
 			

json.dump(demo_array, out_file, indent=4)
# with open(info_file, "rU") as info_fh:
# 	info_csv = csv.reader(info_fh, delimiter=',', quotechar='"')
# 	next(info_csv, None)

# 	for row in info_csv:
# 		row[]