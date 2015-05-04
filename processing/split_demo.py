import json
import copy
from collections import OrderedDict

age_array = OrderedDict()
age_file = open("../data/county_age.json", "w")
age_target = ["under_19", "19_64", "65_84", "over_85"]

with open("../data/county_demographics.json") as demo_file:
	demo = json.load(demo_file)

"""
Retrieve numbers from the age target
"""
counter = 0
while counter < 4:
	for key1, val1 in demo.iteritems():
		if counter == 0:
			age_array[key1] = OrderedDict()
		for key2, val2 in demo[key1].iteritems():
			if key2 == age_target[counter]:
				age_array[key1][key2] = float(val2)
	counter+=1


"""
Combine 65_84 and over_85
"""

final_age = copy.deepcopy(age_array)
for key, val in age_array.iteritems():
	final_age[key]["over_65"] = round(final_age[key]["65_84"] + final_age[key]["over_85"], 1)
	del final_age[key]["65_84"]
	del final_age[key]["over_85"]

json.dump(final_age, age_file, indent=4)

