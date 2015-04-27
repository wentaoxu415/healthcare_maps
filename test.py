# from geojson import Feature, Point, FeatureCollection

# >>> my_feature = Feature(geometry=Point((1.6432, -19.123)))

# >>> my_other_feature = Feature(geometry=Point((-80.234, -22.532)))

# >>> FeatureCollection([my_feature, my_other_feature])  # doctest: +ELLIPSIS
# {"features": [{"geometry": {"coordinates": [1.643..., -19.12...], "type": "Point"}, "id": null, "properties": {}, "type": "Feature"}, {"geometry": {"coordinates": [-80.23..., -22.53...], "type": "Point"}, "id": null, "properties": {}, "type": "Feature"}], "type": "FeatureCollection"}

# >>> import geojson

# >>> my_point = geojson.Point((43.24, -1.532))

# >>> my_point  # doctest: +ELLIPSIS
# {"coordinates": [43.2..., -1.53...], "type": "Point"}

# >>> dump = geojson.dumps(my_point, sort_keys=True)

# >>> dump  # doctest: +ELLIPSIS
# '{"coordinates": [43.2..., -1.53...], "type": "Point"}'

# >>> geojson.loads(dump)  # doctest: +ELLIPSIS
# {"coordinates": [43.2..., -1.53...], "type": "Point"}

# import geojson
# from gejson import Feature, Point, FeatureCollection

# array = []
# feat = Feature(geometry=Point())
# array.append(feat)

# FeatureCollection(array)
# geojson.dumps(FeatureCollection)

