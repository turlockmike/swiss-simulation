import { parseCliArgs } from './configParser';
import { runSimulation } from '../core/simulation';

const config = parseCliArgs();
runSimulation(config);
