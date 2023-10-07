"use client";
import { YMaps, useYMaps, Map, Placemark } from "@pbe/react-yandex-maps";
import { useRef, useState } from "react";

import { AddressSuggestions, DaDataAddress, DaDataSuggestion } from "react-dadata";
import "react-dadata/dist/react-dadata.css";
import { adaptToDaDataSuggestion } from "./adapters";

type MapOnLoadParams = ReturnType<typeof useYMaps>;

const INIT_COORDS = [55.75, 37.57];
const DADATA_TOKEN = "0dfe7fb2ada6cbdde4d36fc90148deb17a4f0cbb";
const API_KEY = "05f8d2ae-bd94-4329-b9f9-7351e2ec9627";

export default function Page() {
  const refMap = useRef();
  const ymapsRef = useRef<MapOnLoadParams>(null);

  const [placemarkCoords, setPlacemarkCoords] = useState(INIT_COORDS);

  const [value, setValue] = useState<DaDataSuggestion<DaDataAddress>>();

  const handleClick = async (e: any) => {
    const coords = e.get("coords");
    const res = await ymapsRef.current?.geocode(coords);
    const firstGeoObject = res?.geoObjects.get(0) as any;
    if (firstGeoObject) {
      const address = firstGeoObject.getAddressLine();
      const city = firstGeoObject.getLocalities().length
        ? firstGeoObject.getLocalities()
        : firstGeoObject.getAdministrativeAreas();

      const street = firstGeoObject.getThoroughfare();
      const house = firstGeoObject.getPremiseNumber();

      setValue(
        adaptToDaDataSuggestion(address, {
          city,
          street,
          house,
          geo_lat: coords[0],
          geo_lon: coords[1],
        })
      );
    }
    setPlacemarkCoords(coords);
  };

  const handleMapLoad = (ymaps: MapOnLoadParams) => {
    ymapsRef.current = ymaps;
  };

  const handleChange = async (e: DaDataSuggestion<DaDataAddress> | undefined) => {
    setValue(e);
    const addrr = e?.unrestricted_value;
    if (addrr) {
      const res = await ymapsRef.current?.geocode(addrr);
      const firstGeoObject = res?.geoObjects.get(0);
      const c = firstGeoObject?.geometry?.getBounds();
      if (c && c[0]) {
        setPlacemarkCoords(c[0]);
      }
    }
  };

  return (
    <YMaps
      query={{
        load: "package.full",
        apikey: API_KEY,
      }}
    >
      <AddressSuggestions token={DADATA_TOKEN} value={value} onChange={handleChange} delay={500} />
      <Map
        width="100%"
        height="80vh"
        state={{ center: placemarkCoords, zoom: 9 }}
        instanceRef={refMap}
        onLoad={handleMapLoad}
        onClick={handleClick}
      >
        <Placemark geometry={placemarkCoords} />
      </Map>
    </YMaps>
  );
}
