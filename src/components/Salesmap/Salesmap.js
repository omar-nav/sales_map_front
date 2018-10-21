import React, { Component } from 'react';
import L from 'leaflet';
// postCSS import of Leaflet's CSS
import 'leaflet/dist/leaflet.css';
// using webpack json loader we can import our geojson file like this
import geojson from './alcadias.json';
// import local components Filter and ForkMe
import Filter from './Filter';

// store the map configuration properties in an object,
// we could also move this to a separate file & import it if desired.
let config = {};
config.params = {
  center: [40.655769, -73.938503],
  zoomControl: false,
  zoom: 13,
  maxZoom: 16,
  minZoom: 11,
  scrollwheel: false,
  legends: true,
  infoControl: false,
  attributionControl: true
};
config.tileLayer = {
  uri: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  params: {
    minZoom: 11,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
  }
};

// array to store unique names of alcadias,
// this eventually gets passed down to the Filter component
let nombresDeAlcadias = [];

class Salesmap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      map: null,
      tileLayer: null,
      geojsonLayer: null,
      geojson: null,
      nombreDeAlcadiasFilter: '*',
      numAlcadias: null
    };
    this._mapNode = null;
    this.updateMap = this.updateMap.bind(this);
    this.onEachFeature = this.onEachFeature.bind(this);
    this.pointToLayer = this.pointToLayer.bind(this);
    this.filterFeatures = this.filterFeatures.bind(this);
    this.filterGeoJSONLayer = this.filterGeoJSONLayer.bind(this);
  }

  componentDidMount() {
    // code to run just after the component "mounts" / DOM elements are created
    // we could make an AJAX request for the GeoJSON data here if it wasn't stored locally
    this.getData();
    // create the Leaflet map object
    if (!this.state.map) this.init(this._mapNode);
  }

  componentDidUpdate(prevProps, prevState) {
    // code to run when the component receives new props or state
    // check to see if geojson is stored, map is created, and geojson overlay needs to be added
    if (this.state.geojson && this.state.map && !this.state.geojsonLayer) {
      // add the geojson overlay
      this.addGeoJSONLayer(this.state.geojson);
    }

    // check to see if the alcadias filter has changed
    if (this.state.nombreDeAlcadiasFilter !== prevState.nombreDeAlcadiasFilter) {
      // filter / re-render the geojson overlay
      this.filterGeoJSONLayer();
    }
  }

  componentWillUnmount() {
    // code to run just before unmounting the component
    // this destroys the Leaflet map object & related event listeners
    this.state.map.remove();
  }

  getData() {
    // could also be an AJAX request that results in setting state with the geojson data
    // for simplicity sake we are just importing the geojson data using webpack's json loader
    this.setState({
      numAlcadias: 6,
      geojson
    });
  }

  updateMap(e) {
    let nombreDeAlcadia = e.target.value;
    // change the alcadias filter
    if (nombreDeAlcadia === "todas las alcaldías con ventas") {
      nombreDeAlcadia = "*";
    }
    // update our state with the new filter value
    this.setState({
      nombreDeAlcadiasFilter: nombreDeAlcadia
    });
  }

  addGeoJSONLayer(geojson) {
    // create a native Leaflet GeoJSON SVG Layer to add as an interactive overlay to the map
    // an options object is passed to define functions for customizing the layer
    const geojsonLayer = L.geoJson(geojson, {
      onEachFeature: this.onEachFeature,
      pointToLayer: this.pointToLayer,
      filter: this.filterFeatures
    });
    // add our GeoJSON layer to the Leaflet map object
    geojsonLayer.addTo(this.state.map);
    // store the Leaflet GeoJSON layer in our component state for use later
    this.setState({ geojsonLayer });
    // fit the geographic extent of the GeoJSON layer within the map's bounds / viewport
    this.zoomToFeature(geojsonLayer);
  }

  filterGeoJSONLayer() {
    // clear the geojson layer of its data
    this.state.geojsonLayer.clearLayers();
    // re-add the geojson so that it filters out alcadias which do not match state.filter
    this.state.geojsonLayer.addData(geojson);
    // fit the map to the new geojson layer's geographic extent
    this.zoomToFeature(this.state.geojsonLayer);
  }

  zoomToFeature(target) {
    // pad fitBounds() so features aren't hidden under the Filter UI element
    var fitBoundsParams = {
      paddingTopLeft: [200, 10],
      paddingBottomRight: [10, 10]
    };
    // set the map's center & zoom so that it fits the geographic extent of the layer
    this.state.map.fitBounds(target.getBounds(), fitBoundsParams);
  }

  filterFeatures(feature, layer) {
    // filter the alcadias based on the map's current search filter
    // returns true only if the filter value matches the value of feature.properties.ALCADIA
    const test = feature.properties.ALCADIA.indexOf(this.state.nombreDeAlcadiasFilter);
    if (this.state.nombreDeAlcadiasFilter === '*' || test !== -1) {
      return true;
    }
  }

  pointToLayer(feature, latlng) {
    // renders our GeoJSON points as circle markers, rather than Leaflet's default image markers
    // parameters to style the GeoJSON markers
    var markerParams = {
      radius: 4,
      fillColor: 'orange',
      color: '#fff',
      weight: 1,
      opacity: 0.5,
      fillOpacity: 0.8
    };

    return L.circleMarker(latlng, markerParams);
  }

  onEachFeature(feature, layer) {
    if (feature.properties && feature.properties.ALCADIA) {

      // if the array for unique alcadias names has not been made, create it
      // there are 6 unique names total
      if (nombresDeAlcadias.length < 6) {

        // add alcadias name if it doesn't yet exist in the array
        feature.properties.ALCADIA.split('-').forEach(function (alcadia, index) {
          if (nombresDeAlcadias.indexOf(alcadia) === -1 && nombresDeAlcadias.ALCADIA !== "todas las alcaldías con ventas") {
            nombresDeAlcadias.push(alcadia);
          }
        });

        // on the last GeoJSON feature
        if (this.state.geojson.features.indexOf(feature) === this.state.numAlcadias - 1) {
          // use sort() to put our values in alphanumeric order
          nombresDeAlcadias.sort();
          // finally add a value to represent all of the alcadias
          nombresDeAlcadias.unshift('todas las alcaldías con ventas');
        }
      }
      // calculate total for each alcadia
      // strip commas
      const numberWithCommas = (x) => {
        if (x === null) {
          return 0;
        } else {
          return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }
      }

      let ventasMarzo = numberWithCommas(feature.properties.ventas2017_03_Monto);
      let ventasAbril = numberWithCommas(feature.properties.ventas2017_04_Monto);
      let ventasMayo = numberWithCommas(feature.properties.ventas2017_05_Monto);
      let ventasNetasSinComa = feature.properties.ventas2017_03_Monto + feature.properties.ventas2017_04_Monto + feature.properties.ventas2017_05_Monto;
      let ventasNetas = numberWithCommas(ventasNetasSinComa);
      // assemble the HTML for the markers' popups (Leaflet's bindPopup method doesn't accept React JSX)
      const popupContent = `<table>
      <h2><b>${feature.properties.ALCADIA}</b></h2>
      <tr>
        <th>Mes</th>
        <th>Equipo</th>
        <th>Vendedor</th>
        <th>Ventas</th>
      </tr>
      <tr>
        <td>marzo</td>
        <td>${feature.properties.ventas2017_03_Equipo}</td>
        <td>${feature.properties.ventas2017_03_Vendedor}</td>
        <td>$${ventasMarzo}&nbsp;MXN</td>
      </tr>
      <tr>
        <td>abril</td>
        <td>${feature.properties.ventas2017_04_Equipo}</td>
        <td>${feature.properties.ventas2017_04_Vendedor}</td>
        <td>$${ventasAbril}&nbsp;MXN</td>
      </tr>
      <tr>
        <td>mayo</td>
        <td>${feature.properties.ventas2017_05_Equipo}</td>
        <td>${feature.properties.ventas2017_05_Vendedor}</td>
        <td>$${ventasMayo}&nbsp;MXN</td>
      </tr>
      <tr>
        <th>Ventas Netas</th>
        <td></td>
        <td></td>
        <th>$${ventasNetas}&nbsp;MXN</th>
      </tr>
      </table>`;

      // add our popups
      layer.bindPopup(popupContent);
    }
  }

  init(id) {
    if (this.state.map) return;
    // this function creates the Leaflet map object and is called after the Map component mounts
    let map = L.map(id, config.params);
    L.control.zoom({ position: "bottomleft" }).addTo(map);
    L.control.scale({ position: "bottomleft" }).addTo(map);

    // a TileLayer is used as the "basemap"
    const tileLayer = L.tileLayer(config.tileLayer.uri, config.tileLayer.params).addTo(map);

    // set our state to include the tile layer
    this.setState({ map, tileLayer });
  }

  render() {
    const { nombreDeAlcadiasFilter } = this.state;
    return (
      <div id="mapUI">
        {
          /* render the Filter component only after the nombreDeAlcadias array has been created */
          nombresDeAlcadias.length &&
          <Filter alcadias={nombresDeAlcadias}
            curFilter={nombreDeAlcadiasFilter}
            filterAlcadias={this.updateMap} />
        }
        <div ref={(node) => this._mapNode = node} id="map" />
      </div>
    );
  }
}

export default Salesmap;
