import { VitrinePipeline } from './VitrinePipeline';
import { VitrineServer } from './VitrineServer';

let serverInstance: VitrineServer = new VitrineServer();
let pipelineInstance: VitrinePipeline = new VitrinePipeline(serverInstance);

pipelineInstance.launch(true);
