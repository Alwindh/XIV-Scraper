import os
import sys
import json
import operator
from requests import get

def send_request():
    url = 'https://universalis.app/api/extra/stats/most-recently-updated?dcName=light&entries=200'
    request = get(url)
    data = request.json()
    return data['items']

def update_entries(response_list, current_dir):
    with open(current_dir+"entries.json", "r+") as entries_file_reader:
        all_entries = json.load(entries_file_reader)
    for response in response_list:
        if response not in all_entries:
            all_entries.append(response)
    with open(current_dir+'entries.json', 'w') as entries_file_writer:
        entries_file_writer.write(json.dumps(all_entries))
    return all_entries

def update_aggregate(all_entries, current_dir):
    new_dict = {}
    for entry in all_entries:
        try:
            new_dict[entry['itemID']] += 1
        except KeyError:
            new_dict [entry['itemID']] = 1
    aggregate_dict = {}
    with open(current_dir+'items.json', 'r', encoding="utf8") as item_file_reader:
        item_dict = json.load(item_file_reader)
    for key in new_dict:
        aggregate_dict[str(key) + "---" +item_dict[str(key)]['en']] = new_dict[key]
    sorted_aggregate = dict( sorted(aggregate_dict.items(), key=operator.itemgetter(1),reverse=True))
    counter = 0
    for key in sorted_aggregate:
        value = sorted_aggregate[key]
        print('%s - %s'%(key, value))
        counter += 1
        if counter >= 20:
            break
    with open(current_dir+'aggregate.json', 'w') as aggregate_file_writer:
        aggregate_file_writer.write(json.dumps(sorted_aggregate))
    return sorted_aggregate

def combine_flipping_data(sorted_aggregate, current_dir):
    occurance_list = []
    for key in sorted_aggregate:
        occurance_list.append(sorted_aggregate[key])
    with open(current_dir+"base.flipping.data.json", "r+") as flipping_file_reader:
        current_flipping = json.load(flipping_file_reader)
    for key in sorted_aggregate:
        item_element = {"itemName" : key.split('---')[-1], "itemId" : int(key.split('---')[0])}
        if item_element not in current_flipping:
            current_flipping.append(item_element)
        if len(current_flipping) >= 100:
            break
    with open(current_dir+'flipping.data.json', 'w+') as flipping_file_writer:
        flipping_file_writer.write(json.dumps(current_flipping))

    
    

def main_func():
    response_list = send_request()
    current_dir = os.path.abspath(os.path.dirname(sys.argv[0]))+'\\'
    all_entries = update_entries(response_list, current_dir)
    print('%s total entries found so far: \n'%(len(all_entries)))
    sorted_aggregate = update_aggregate(all_entries, current_dir)
    combine_flipping_data(sorted_aggregate, current_dir)
    

main_func()
