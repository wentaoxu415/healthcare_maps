import json
from collections import OrderedDict


out_file = open('../data/scatter.json', 'w')
with open('../data/quality_score.json') as quality_input:
	quality = json.load(quality_input)

with open('../data/hospital_spendingData.json') as spending_input:	
	spending = json.load(spending_input)

final = OrderedDict()
for key, val in quality.iteritems():
	try:
		final[key] = OrderedDict()
		final[key]["quality"] = quality[key] 
		final[key]["spending"] = spending[key]
	except KeyError:
		del final[key]


json.dump(final, out_file, indent=4)