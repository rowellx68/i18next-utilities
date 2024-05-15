import { createFarmPlugin } from 'unplugin';
import { unpluginFactory } from './index';
import { JsPlugin } from '@farmfe/core';

export default createFarmPlugin(unpluginFactory) as JsPlugin;
