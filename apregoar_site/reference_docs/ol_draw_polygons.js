//import '../lib/node_modules/ol/ol.css';
import Draw from '../lib/node_modules/ol/interaction/draw.js';
import Map from '../lib/node_modules/ol/Map.js';
import View from '../lib/node_modules/ol/View.js';
import {OSM, Vector as VectorSource} from '../lib/node_modules/ol/source/source.js';
import {Tile as TileLayer, Vector as VectorLayer} from '../lib/node_modules/ol/layer/layer.js';

const raster = new TileLayer({
  source: new OSM(),
});

const source = new VectorSource({wrapX: false});

const vector = new VectorLayer({
  source: source,
});

const map = new Map({
  layers: [raster, vector],
  target: 'map',
  view: new View({
    center: [-11000000, 4600000],
    zoom: 4,
  }),
});

const typeSelect = document.getElementById('type');

let draw; // global so we can remove it later
function addInteraction() {
  const value = typeSelect.value;
  if (value !== 'None') {
    draw = new Draw({
      source: source,
      type: typeSelect.value,
    });
    map.addInteraction(draw);
  }
}

/**
 * Handle change event.
 */
typeSelect.onchange = function () {
  map.removeInteraction(draw);
  addInteraction();
};

document.getElementById('undo').addEventListener('click', function () {
  draw.removeLastPoint();
});

addInteraction();