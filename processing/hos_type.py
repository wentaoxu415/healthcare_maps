import json
import csv

info_file = "../data/hospital_general_information.csv"
type_array = []
with open(info_file, 'rU') as info_fh:
	type_info = csv.reader(info_fh,delimiter=',', quotechar='"')
	next(type_info, None)

	for row in type_info:
		if row[9] in type_array:
			continue
		else:
			type_array.append(row[9])

	print type_array