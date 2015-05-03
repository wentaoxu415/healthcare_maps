import json
import csv

demographics_array = dict()

age_file = "../data/age.csv"
race_file = "../data/race.csv"
out_file = open("../data/age_race.json", "w")
demo_array = dict()

with open(age_file, "rU") as age_fh:
	age_csv = csv.reader(age_fh, delimiter=',', quotechar='"')
	next(age_csv, None)

	for row in age_csv:
		demo = dict()
		demo["under_18"] = row[1]
		demo["19_64"] = row[2]
		demo["65_74"] = row[4]
		demo["over_75"] = row[5]
		demo["total"] = row[6]
		demo_array[row[0]] = demo

with open(race_file, "rU") as race_fh:
	race_csv = csv.reader(race_fh, delimiter=',', quotechar='"')
	next(race_csv, None)

	for row in race_csv:
		state = row[0]
		if state in demo_array:
			temp = demo_array[state]
			demo = dict()
		 	demo["white"] = row[1]
			demo["black"] = row[2]
			demo["hispanic"] = row[3]
			demo["other"] = row[4]
 			temp.update(demo)

json.dump(demo_array, out_file, indent=4)
