import { VitrinePipeline } from './VitrinePipeline';
import { VitrineServer } from './VitrineServer';
import { PotentialGame } from '../models/PotentialGame';
import { GamesCollection } from '../models/GamesCollection';

let serverInstance: VitrineServer = new VitrineServer();
let pipelineInstance: VitrinePipeline = new VitrinePipeline(serverInstance);

pipelineInstance.launch();

/*
let a: PotentialGame = new PotentialGame('A');
let b: PotentialGame = new PotentialGame('B');
let c: PotentialGame = new PotentialGame('C');

let col: GamesCollection<PotentialGame> = new GamesCollection();
let col2: GamesCollection<PotentialGame> = new GamesCollection();

col.addGame(a);
col.addGame(b);

col2.addGames(col, () => {
	col2.addGames(col, () => {
		console.log(col2.games);
	})
});
*/
