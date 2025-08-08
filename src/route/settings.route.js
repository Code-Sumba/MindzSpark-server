import { Router } from 'express';
import auth from '../middleware/auth.js';
import {
  getSettings,
  updateSettings,
  testShipRocketConnection,
  getShipRocketPickupLocations,
  createShipRocketShipment,
  getShipRocketTracking
} from '../controllers/settings.controller.js';

const settingsRouter = Router();

// Settings routes
settingsRouter.get('/', auth, getSettings);
settingsRouter.post('/', auth, updateSettings);

// ShipRocket integration routes
settingsRouter.post('/shiprocket/test-connection', auth, testShipRocketConnection);
settingsRouter.get('/shiprocket/pickup-locations', auth, getShipRocketPickupLocations);
settingsRouter.post('/shiprocket/create-shipment', auth, createShipRocketShipment);
settingsRouter.get('/shiprocket/tracking/:shipmentId', auth, getShipRocketTracking);

export default settingsRouter;