/* eslint-disable no-undef */
import { api, track, LightningElement } from "lwc";
import { stringFormat } from "c/ldsUtils";

import emergencyLocationMapMarkerText from "@salesforce/label/c.emergencyLocationMapMarkerText";
import mapboxAccessToken from "@salesforce/label/c.mapboxAccessToken";

export default class EmergencyLocationMap extends LightningElement {
  @api
  get mapHeight() {
    return this._mapHeight;
  }

  set mapHeight(mapHeight) {
    this._mapHeight = mapHeight || "500px";
  }

  @api
  get mapWidth() {
    return this._mapWidth;
  }

  set mapWidth(mapWidth) {
    this._mapWidth = mapWidth || "100%";
  }

  _mapHeight;
  _mapWidth;

  @api
  accessToken = mapboxAccessToken;

  @api
  mapStyles =
    "border-top-left-radius: var(--sds-c-card-radius-border, var(--lwc-borderRadiusMedium,0.25rem)); border-top-right-radius: var(--sds-c-card-radius-border, var(--lwc-borderRadiusMedium,0.25rem));";

  @api
  get beamStyles() {
    return this._beamStyles;
  }

  set beamStyles(beamStyles) {
    this._beamStyles = beamStyles ? JSON.parse(beamStyles) : null;
  }

  leafletMap;
  markersGroup;
  markers = [
    {
      name: "Borgatun37",
      type: "2G",
      latitude: 64.156906,
      longitude: -21.894254,
      direction: 150,
      width: 64
    },
    {
      name: "Borgatun37",
      type: "4G",
      latitude: 64.166906,
      longitude: -21.914254,
      direction: 150,
      width: 64
    }
  ];

  @track
  record;

  @track
  errors;

  @track
  _beamStyles;

  @track
  _wiredWorkOrderRecordResponse;

  onLeafletLoaded() {
    this.leafletMap = this.template.querySelector("c-leaflet-map");
    this.markersGroup = L.featureGroup();
    this.setupMarkers();
  }

  refreshMarkers() {
    this.leafletMap.removeLayer(this.markersGroup);
    this.markersGroup = L.featureGroup();
    this.setupMarkers();
  }

  setupMarkers() {
    this.markers.forEach((markers) => {
      this.addMarker(
        markers.name,
        markers.latitude,
        markers.longitude,
        markers.direction,
        markers.width,
        markers.type,
        this.beamStyles[markers.type]
      );
    });
  }

  addMarker(title, latitude, longitude, direction, width, type, beamStyle) {
    const location = [latitude, longitude];
    const marker = L.marker(location);
    marker.bindPopup(
      stringFormat(
        emergencyLocationMapMarkerText,
        title,
        latitude,
        longitude,
        direction,
        width
      )
    );
    marker.addTo(this.markersGroup);

    if (width > 0 && beamStyle.radius > 0) {
      const beam = L.circle(location, {
        color: beamStyle.color,
        fillColor: beamStyle.fillColor || beamStyle.color,
        fillOpacity: beamStyle.fillOpacity || 0.4,
        radius: beamStyle.radius,
        startAngle: direction - width / 2,
        endAngle: direction + width / 2
      });

      beam.addTo(this.markersGroup);
      this.leafletMap.addLayer(this.markersGroup);
    }
    this.leafletMap.setView(location, 13);
  }
}
