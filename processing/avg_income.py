import json
import csv
from collections import OrderedDict

# county_avg = OrderedDict()
# state_avg = OrderedDict()
# county_output = open("../data/county_avg_income.json", "w")
# state_output = open("../data/state_avg_income.json", "w")
# income_bracket = ["$1 under $10,000", "$10,000 under $25,000", "$25,000 under $50,000", "$50,000 under $75,000", \
# "$75,000 under $100,000", "$100,000 under $200,000", "$200,000 or more"]
# avg = [5000, 17500, 37500, 62500, 87500, 150000, 300000]
# with open("../data/state_counties.json") as income_file:
# 	income = json.load(income_file)

# 	for key1, val1 in income.iteritems():
# 		state_amt = 0
# 		state_pop = 0
# 		for key2, val2 in income[key1].iteritems():
# 			if val2 != None and len(val2) == 7:
# 				ctr = 0
# 				county_pop = 0
# 				county_amt = 0
# 				for val in val2:
# 					county_pop += float(val)
# 					county_amt += float(val)*avg[ctr]
# 					ctr+=1
# 				state_amt += county_amt
# 				state_pop += county_pop
# 				if county_pop != 0:
# 					county_avg[key2] = round(0.75*county_amt/county_pop, 0)
# 		if state_pop != 0: 
# 			state_avg[key1] = round(0.75*state_amt/state_pop, 0)
					
		
# json.dump(county_avg, county_output, indent=4)
# json.dump(state_avg, state_output, indent=4)
out_file = open("../data/state_avg_income.json", "w")
state_avg = dict()
with open("../data/state_income.csv", 'rU') as avg_fh:
	avg = csv.reader(avg_fh, delimiter=',', quotechar='"')
	for row in avg:
		num = float(row[1])
		num = round(num, 0)
		state_avg[row[0]] = num


json.dump(state_avg, out_file, indent=4)

