import json
import copy
from collections import OrderedDict

age_array = OrderedDict()
age_file = open("../data/state_age.json", "w")
age_target = ["under_18", "19_64", "65_74", "over_75"]

with open("../data/state_demo.json") as demo_file:
	demo = json.load(demo_file)

"""
Retrieve numbers from the age target
"""
counter = 0
while counter < len(age_target):
	for key1, val1 in demo.iteritems():
		if counter == 0:
			age_array[key1] = OrderedDict()
		for key2, val2 in demo[key1].iteritems():
			if key2 == age_target[counter]:
				try:
					age_array[key1][key2] = round((float(val2)/float(demo[key1]["total"]))*100, 1)
				except KeyError:
					continue
	counter+=1

final_age = copy.deepcopy(age_array)
for key, val in age_array.iteritems():
	final_age[key]["over_65"] = round((final_age[key]["65_74"] + final_age[key]["over_75"]), 1)
	del final_age[key]["65_74"]
	del final_age[key]["over_75"]

json.dump(final_age, age_file, indent=4)

race_array = OrderedDict()
race_file = open("../data/state_race.json", "w")
race_target = ["black", "hispanic", "white", "other"]

with open("../data/state_demo.json") as demo_file:
	demo = json.load(demo_file)

counter = 0
while counter <  len(race_target):
	for key1, val1 in demo.iteritems():
		if counter == 0:
			race_array[key1] = OrderedDict()
		for key2, val2 in demo[key1].iteritems():
			if key2 == race_target[counter]:
				try:
					if val2 == "N/A":
						race_array[key1][key2] = None
					else:
						race_array[key1][key2] = round((float(val2)/float(demo[key1]["total"]))*100, 1)
				except KeyError:
					continue
	counter+=1

# final_race = copy.deepcopy(race_array)
# for key, val in race_array.iteritems():
# 	final_race[key]["other"] = round(final_race[key]["asian"] + final_race[key]["native"], 1)
# 	del final_race[key]["asian"]
# 	del final_race[key]["native"]

json.dump(race_array, race_file, indent=4)