import { api, LightningElement } from "lwc";
import Leaflet from "@salesforce/resourceUrl/leaflet";
import { loadStyle, loadScript } from "lightning/platformResourceLoader";

import mapboxAccessToken from "@salesforce/label/c.mapboxAccessToken";

export default class LeafletMap extends LightningElement {
  @api
  accessToken = mapboxAccessToken;

  @api
  latitude = 51.505;

  @api
  longitude = -0.09;

  @api
  zoom = 13;

  @api
  maxZoom = 18;

  @api
  height;

  @api
  width;

  @api
  styles = "";

  _map;

  connectedCallback() {
    this.loadLeaftlet();
  }

  loadLeaftlet() {
    //1st load leaftlet
    return Promise.all([
      loadScript(this, Leaflet + "/leaflet.js"),
      loadStyle(this, Leaflet + "/leaflet.css")
    ])
      .then(() => {
        //2nd load plugins
        loadScript(this, Leaflet + "/plugins/Semicircle.js")
          .then(() => {
            const mapElm = this.template.querySelector(".leaflet-container");
            this._map = L.map(mapElm, {
              attributionControl: false
            }).setView([this.latitude, this.longitude], this.zoom);
            this.setupMapbox();
            this.dispatchEvent(new CustomEvent("leafletloaded"));
          })
          .catch((error) => {
            console.error(
              "Error loading leaftlet circle selector plugin",
              error?.message
            );
          });
      })
      .catch((error) => {
        console.error("Error loading leaflet", error?.message);
      });
  }

  setupMapbox() {
    L.tileLayer(
      "https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token={accessToken}",
      {
        maxZoom: this.maxZoom,
        tileSize: 512,
        zoomOffset: -1,
        detectRetina: true,
        accessToken: this.accessToken
      }
    ).addTo(this._map);
  }

  //the following 5 methods were created because of a bug of Lightning Locker caused when you use a Getter of a child component inside a for loop in the parent component
  //Previously I had a getter annotated with @api that returned this._map, so the parent could access all map methods directly. It worked perfectly, until I added it inside a for loop in the parent component and it threw an Exception
  //Im still going to file a Github issue to salesforce to show it
  @api
  addToMap(leafletComponent) {
    leafletComponent.addTo(this._map);
  }

  @api
  setView(location, zoom) {
    this._map.setView(location, zoom);
  }

  @api
  removeLayer(layer) {
    this._map.removeLayer(layer);
  }

  @api
  addLayer(layer) {
    this._map.addLayer(layer);
  }

  @api
  redrawMap() {
    this._map.invalidateSize(true);
  }

  get _widthStyle() {
    return this.width ? `width: ${this.width};` : "width: 100%;";
  }

  get _heightStyle() {
    return this.height ? `height: ${this.height};` : "height: 100%;";
  }

  get containerStyles() {
    return `${this._heightStyle} ${this._widthStyle} ${this.styles}`;
  }
}
