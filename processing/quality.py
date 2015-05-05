import json
import csv
import numpy as np
import copy
from math import sqrt
from collections import OrderedDict


def mean(lst):
    """calculates mean"""
    sum = 0
    for i in range(len(lst)):
        sum += lst[i]
    return (sum / len(lst))

def stddev(lst):
    """calculates standard deviation"""
    sum = 0
    mn = mean(lst)
    for i in range(len(lst)):
        sum += pow((lst[i]-mn),2)
    return sqrt(sum/(len(lst)-1))

scores = []
means = []
std = []

complication_file = "../data/complication.csv"
out_file = open("../data/quality_score.json", "w")

ctr = 0
while ctr < 19:
	scores.append([])
	ctr+=1

with open(complication_file, 'rU') as complication_fh:
	complication_csv = csv.reader(complication_fh, delimiter=",", quotechar='"')
	next(complication_csv, None)

	# ctr = 0
	# for row in complication_csv:
	# 	if row[12] != "Not Available":
	# 		scores[ctr].extend([row[12]])
	# 	ctr+=1	
	# 	if ctr == 19:
	# 		ctr = 0

	# ctr =0
	# while ctr < 19:
	# 	print len(scores[ctr])
	# 	ctr+=1
	for row in complication_csv:
		if "Not Available" not in row[12]:
			if row[9] == "COMP_HIP_KNEE":
				scores[0].append(float(row[12]))
			elif row[9] == "MORT_30_AMI":
				scores[1].append(float(row[12]))
			elif row[9] == "MORT_30_COPD":
				scores[2].append(float(row[12]))
			elif row[9] == "MORT_30_HF":
				scores[3].append(float(row[12]))
			elif row[9] == "MORT_30_PN":
				scores[4].append(float(row[12]))
			elif row[9] == "MORT_30_STK":
				scores[5].append(float(row[12]))
			elif row[9] == "PSI_12_POSTOP_PULMEMB_DVT":
				scores[6].append(float(row[12]))
			elif row[9] == "PSI_14_POSTOP_DEHIS":
				scores[7].append(float(row[12]))
			elif row[9] == "PSI_15_ACC_LAC":
				scores[8].append(float(row[12]))
			elif row[9] == "PSI_4_SURG_COMP":
				scores[9].append(float(row[12]))
			elif row[9] == "PSI_6_IAT_PTX":
				scores[10].append(float(row[12]))
			elif row[9] == "PSI_90_SAFETY":
				scores[11].append(float(row[12]))
			elif row[9] == "READM_30_AMI":
				scores[12].append(float(row[12]))
			elif row[9] == "READM_30_COPD":
				scores[13].append(float(row[12]))
			elif row[9] == "READM_30_HF":
				scores[14].append(float(row[12]))
			elif row[9] == "READM_30_HIP_KNEE":
				scores[15].append(float(row[12]))
			elif row[9] == "READM_30_HOSP_WIDE":
				scores[16].append(float(row[12]))
			elif row[9] == "READM_30_PN":
				scores[17].append(float(row[12]))
			elif row[9] == "READM_30_STK":
				scores[18].append(float(row[12]))

	ctr =0
	while ctr < 19:
		avg = mean(scores[ctr])
		means.append(round(avg,2))
		dev = stddev(scores[ctr])
		std.append(round(dev, 2))
		ctr+=1

with open(complication_file, 'rU') as complication_fh:
	complication_csv = csv.reader(complication_fh, delimiter=",", quotechar='"')
	next(complication_csv, None)

	scores = OrderedDict()
	for row in complication_csv:
		if row[1] not in scores:
			scores[row[1]] = 0
		if "Not Available" not in row[12]:
			if row[9] == "COMP_HIP_KNEE":
				scores[row[1]] += round(-1*(float(row[12]) - means[0])/std[0], 2)
			elif row[9] == "MORT_30_AMI":
				scores[row[1]] += round(-1*(float(row[12]) - means[1])/std[1], 2)
			elif row[9] == "MORT_30_COPD":
				scores[row[1]] += round(-1*(float(row[12]) - means[2])/std[2], 2)
			elif row[9] == "MORT_30_HF":
				scores[row[1]] += round(-1*(float(row[12]) - means[3])/std[3], 2)
			elif row[9] == "MORT_30_PN":
				scores[row[1]] += round(-1*(float(row[12]) - means[4])/std[4], 2)
			elif row[9] == "MORT_30_STK":
				scores[row[1]] += round(-1*(float(row[12]) - means[5])/std[5], 2)
			elif row[9] == "PSI_12_POSTOP_PULMEMB_DVT":
				scores[row[1]] += round(-1*(float(row[12]) - means[6])/std[6], 2)
			elif row[9] == "PSI_14_POSTOP_DEHIS":
				scores[row[1]] += round(-1*(float(row[12]) - means[7])/std[7], 2)
			elif row[9] == "PSI_15_ACC_LAC":
				scores[row[1]] += round(-1*(float(row[12]) - means[8])/std[8], 2)
			elif row[9] == "PSI_4_SURG_COMP":
				scores[row[1]] += round(-1*(float(row[12]) - means[9])/std[9], 2)
			elif row[9] == "PSI_6_IAT_PTX":
				scores[row[1]] += round(-1*(float(row[12]) - means[10])/std[10], 2)
			elif row[9] == "PSI_90_SAFETY":
				scores[row[1]] += round(-1*(float(row[12]) - means[11])/std[11], 2)
			elif row[9] == "READM_30_AMI":
				scores[row[1]] += round(-1*(float(row[12]) - means[12])/std[12], 2)
			elif row[9] == "READM_30_COPD":
				scores[row[1]] += round(-1*(float(row[12]) - means[13])/std[13], 2)
			elif row[9] == "READM_30_HF":
				scores[row[1]] += round(-1*(float(row[12]) - means[14])/std[14], 2)
			elif row[9] == "READM_30_HIP_KNEE":
				scores[row[1]] += round(-1*(float(row[12]) - means[15])/std[15], 2)
			elif row[9] == "READM_30_HOSP_WIDE":
				scores[row[1]] += round(-1*(float(row[12]) - means[16])/std[16], 2)
			elif row[9] == "READM_30_PN":
				scores[row[1]] += round(-1*(float(row[12]) - means[17])/std[17], 2)
			elif row[9] == "READM_30_STK":
				scores[row[1]] += round(-1*(float(row[12]) - means[18])/std[18], 2)

final_scores = OrderedDict()
for key, val in scores.iteritems():
	final_scores[key] = round(val, 2)
	
json.dump(final_scores, out_file, indent=4)
