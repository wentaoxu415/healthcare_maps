import json
import copy
from collections import OrderedDict

with open("../data/county_age.json") as new_age_file:
	new_age = json.load(new_age_file)

final_age = copy.deepcopy(new_age)
for key, val in new_age.iteritems():
	final_age[key]["over_65"] = final_age[key]["65_84"] + final_age[key]["over_85"]
	del final_age[key]["65_84"]
	del final_age[key]["over_85"]

json.dump(final_age, age_file, indent=4)